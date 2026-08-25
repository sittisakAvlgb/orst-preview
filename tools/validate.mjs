/* =============================================================================
   tools/validate.mjs — ตรวจไฟล์เนื้อหาทั้งหมดก่อน commit
   -----------------------------------------------------------------------------
   รันด้วย:  node tools/validate.mjs
   ไม่ต้องติดตั้งอะไรเพิ่ม ใช้เฉพาะ Node.js มาตรฐาน

   ตรวจอะไรบ้าง
     1. ไฟล์ JSON อ่านได้ และมี title / navKey / blocks ครบ
     2. block ทุกตัวเป็นชนิดที่ระบบรู้จัก และมีฟิลด์บังคับครบ
     3. navKey ตรงกับ data-page ในไฟล์ HTML ของหน้านั้น
     4. ไอคอนที่อ้างถึงมีอยู่จริงใน sprite ของ components.js
     5. รูปภาพที่อ้างถึงมีอยู่จริงในเครื่อง
     6. ลิงก์ภายในที่ชี้ไปหน้า .html มีไฟล์นั้นอยู่จริง
     7. เตือนถ้ายังมี placeholder [...] ค้างอยู่ (ไม่ถือว่าผิด)

   ออกด้วย exit code 1 ถ้าพบ error เพื่อให้ใช้ใน CI ได้
   ============================================================================= */

import { readFile, readdir, access } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOCKS, BLOCK_TYPES } from '../assets/js/blocks.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES_DIR = join(ROOT, 'content', 'pages');

const errors = [];
const warnings = [];

const err = (file, message) => errors.push(`${file}: ${message}`);
const warn = (file, message) => warnings.push(`${file}: ${message}`);

async function exists(path) {
  try { await access(join(ROOT, path)); return true; } catch { return false; }
}

/* ฟิลด์บังคับของแต่ละชนิด block */
const REQUIRED = {
  'page-hero': ['heading'],
  'rich-text': [],
  'card-grid': ['items'],
  'feature-list': ['items'],
  'stat-row': ['items'],
  'link-list': ['items'],
  'media-grid': ['items'],
  'table': ['columns', 'rows'],
  'faq': ['items'],
  'steps': ['items'],
  'two-column': ['image'],
  'cta-band': ['heading'],
  'notice': ['body'],
  'contact-info': [],
};

async function spriteIcons() {
  const src = await readFile(join(ROOT, 'assets', 'js', 'components.js'), 'utf8');
  return new Set([...src.matchAll(/<symbol id="([^"]+)"/g)].map(m => m[1]));
}

/** เดินทุกค่าใน object เพื่อเก็บ icon / image / href มาตรวจ */
function collect(node, out) {
  if (Array.isArray(node)) { node.forEach(n => collect(n, out)); return; }
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    if (typeof value === 'string') {
      if (key === 'icon') out.icons.add(value);
      if (key === 'image') out.images.add(value);
      if (key === 'href') out.hrefs.add(value);
      if (/\[[^\]]+\]/.test(value)) out.placeholders++;
    } else {
      collect(value, out);
    }
  }
}

async function main() {
  const icons = await spriteIcons();
  const files = (await readdir(PAGES_DIR)).filter(f => f.endsWith('.json')).sort();

  if (!files.length) {
    console.log('ไม่พบไฟล์เนื้อหาใน content/pages/');
    return;
  }

  for (const file of files) {
    const rel = `content/pages/${file}`;
    let page;
    try {
      page = JSON.parse(await readFile(join(PAGES_DIR, file), 'utf8'));
    } catch (e) {
      err(rel, `อ่าน JSON ไม่ได้ — ${e.message}`);
      continue;
    }

    /* --- 1) ฟิลด์ระดับหน้า --- */
    if (!page.title) err(rel, 'ขาด "title"');
    if (!page.navKey) err(rel, 'ขาด "navKey"');
    if (!page.description) warn(rel, 'ไม่มี "description" — ควรใส่เพื่อ SEO');
    if (!Array.isArray(page.blocks) || !page.blocks.length) {
      err(rel, 'ขาด "blocks" หรือเป็น array ว่าง');
      continue;
    }

    /* --- 2) block --- */
    page.blocks.forEach((b, i) => {
      const at = `blocks[${i}]`;
      if (!b?.type) { err(rel, `${at} ขาด "type"`); return; }
      if (!BLOCKS[b.type]) {
        err(rel, `${at} ชนิด "${b.type}" ไม่มีอยู่จริง — ที่ใช้ได้: ${BLOCK_TYPES.join(', ')}`);
        return;
      }
      for (const field of REQUIRED[b.type] || []) {
        if (b[field] === undefined) err(rel, `${at} (${b.type}) ขาดฟิลด์บังคับ "${field}"`);
      }
      if (b.variant && !['default', 'alt'].includes(b.variant)) {
        err(rel, `${at} variant ต้องเป็น "default" หรือ "alt" เท่านั้น`);
      }
      if (b.type === 'table' && Array.isArray(b.rows) && Array.isArray(b.columns)) {
        b.rows.forEach((row, r) => {
          if (row.length !== b.columns.length) {
            err(rel, `${at} rows[${r}] มี ${row.length} ช่อง แต่ columns มี ${b.columns.length}`);
          }
        });
      }
      if (b.type === 'media-grid') {
        (b.items || []).forEach((it, k) => {
          if (!it.alt) warn(rel, `${at} items[${k}] ไม่มี "alt" — จำเป็นต่อการเข้าถึง`);
        });
      }
    });
    if (page.blocks[0]?.type !== 'page-hero') {
      warn(rel, 'block แรกไม่ใช่ "page-hero" — ปกติทุกหน้าควรเริ่มด้วย page-hero');
    }

    /* --- 3) navKey ตรงกับ data-page ใน HTML --- */
    const slug = file.replace(/\.json$/, '');
    if (!slug.startsWith('_')) {
      const htmlPath = `${slug}.html`;
      if (!(await exists(htmlPath))) {
        err(rel, `ไม่พบไฟล์ HTML คู่กัน (${htmlPath}) — คัดลอกจาก _template.html`);
      } else {
        const html = await readFile(join(ROOT, htmlPath), 'utf8');
        const m = html.match(/<body[^>]*data-page="([^"]*)"/);
        if (!m) err(htmlPath, 'ไม่มี data-page ใน <body>');
        else if (m[1] !== page.navKey) {
          err(htmlPath, `data-page="${m[1]}" ไม่ตรงกับ navKey "${page.navKey}" ใน ${rel}`);
        }
        if (!html.includes(`data-content="${rel}"`)) {
          warn(htmlPath, `data-content ไม่ได้ชี้มาที่ ${rel}`);
        }
      }
    }

    /* --- 4-7) ตรวจค่าที่อ้างถึงภายนอก --- */
    const found = { icons: new Set(), images: new Set(), hrefs: new Set(), placeholders: 0 };
    collect(page.blocks, found);

    for (const id of found.icons) {
      if (!icons.has(id)) err(rel, `ไอคอน "${id}" ไม่มีใน sprite — ที่ใช้ได้ดูใน assets/js/components.js`);
    }
    for (const img of found.images) {
      if (!/^https?:/.test(img) && !(await exists(img))) err(rel, `ไม่พบไฟล์รูป "${img}"`);
    }
    for (const href of found.hrefs) {
      if (/^(https?:|mailto:|tel:|#|\/)/.test(href)) continue;
      const target = href.split('#')[0];
      if (target && target.endsWith('.html') && !(await exists(target))) {
        err(rel, `ลิงก์ชี้ไปหน้าที่ยังไม่มี "${href}"`);
      }
    }
    if (found.placeholders) {
      warn(rel, `ยังมี placeholder แบบ [...] ค้างอยู่ ${found.placeholders} จุด`);
    }
  }

  /* --- สรุปผล --- */
  console.log(`ตรวจไฟล์เนื้อหา ${files.length} ไฟล์\n`);
  if (warnings.length) {
    console.log(`คำเตือน ${warnings.length} รายการ`);
    warnings.forEach(w => console.log('  ! ' + w));
    console.log('');
  }
  if (errors.length) {
    console.log(`พบข้อผิดพลาด ${errors.length} รายการ`);
    errors.forEach(e => console.log('  x ' + e));
    process.exitCode = 1;
  } else {
    console.log('ผ่านทั้งหมด ไม่พบข้อผิดพลาด');
  }
}

main().catch(e => { console.error(e); process.exitCode = 1; });
