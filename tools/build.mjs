/* =============================================================================
   tools/build.mjs — สร้างเว็บเวอร์ชัน "HTML นิ่ง" ลงโฟลเดอร์ dist/
   -----------------------------------------------------------------------------
   รันด้วย:  node tools/build.mjs
   ไม่ต้องติดตั้งอะไรเพิ่ม ใช้เฉพาะ Node.js มาตรฐาน (ต้อง Node 18 ขึ้นไป)

   ทำอะไร
     อ่าน content/pages/<slug>.json แล้วแทนเนื้อหาลงใน <div id="app-content">
     ของไฟล์ <slug>.html ให้กลายเป็น HTML จริงตั้งแต่ตอนโหลด
     ใช้ตัว render ตัวเดียวกับที่เบราว์เซอร์ใช้ (assets/js/blocks.js)
     ผลลัพธ์จึงเหมือนกันทุกประการ

   ทำไมต้องมี
     - ตอนพัฒนา: เปิด Live Server ที่โฟลเดอร์หลัก แก้ JSON แล้วรีเฟรชเห็นผลทันที
     - ตอนขึ้นจริง: รัน build เพื่อให้ Google และ screen reader เห็นเนื้อหา
       ตั้งแต่ HTML ชุดแรก ไม่ต้องรอ JavaScript

   หมายเหตุ
     header/footer ยังถูกสร้างด้วย JavaScript อยู่ (components.js)
     ถ้าต้องการให้เป็น HTML นิ่งทั้งหมด ต้องแปลง renderHeader/renderFooter
     มาเรียกจากที่นี่เพิ่ม — ดู HANDOFF.md หัวข้อ "เส้นทางต่อ CMS"
   ============================================================================= */

import { readFile, writeFile, readdir, mkdir, cp, rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderBlocks, validatePage } from '../assets/js/blocks.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const PAGES_DIR = join(ROOT, 'content', 'pages');

/** โฟลเดอร์/ไฟล์ที่ต้องคัดลอกไป dist ตามเดิม */
const COPY = ['assets', 'content'];
/** ไฟล์ HTML ที่ไม่ต้องแตะ (เขียน HTML เองทั้งหมด) จะถูกคัดลอกดิบ ๆ */
const STATIC_PAGES = ['index.html', 'knowledge.html', 'contact.html', '404.html'];
/** ไฟล์เดี่ยวที่รากโปรเจกต์ ที่ต้องคัดลอกไป dist ด้วย */
const COPY_FILES = ['robots.txt', '_headers'];
/** หน้าที่ไม่ต้องอยู่ใน sitemap (คลังบล็อกของทีมพัฒนา และหน้าแจ้ง error) */
const NO_INDEX = new Set(['styleguide.html', '404.html']);
/** โดเมนจริงของเว็บ — ใช้สร้าง sitemap.xml และเติมบรรทัด Sitemap ใน robots.txt
    ถ้าไม่ตั้ง จะข้าม sitemap และตัดบรรทัด Sitemap ออก (ยังสร้าง dist ได้ตามปกติ)

      PowerShell   $env:SITE_URL = "https://ชื่อเว็บ.netlify.app"; node tools/build.mjs
      bash         SITE_URL=https://ชื่อเว็บ.netlify.app node tools/build.mjs
      Netlify      ตั้งใน netlify.toml หัวข้อ [build.environment]                      */
const SITE_URL = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');

const MOUNT_RE = /(<div id="app-content"[^>]*>)([\s\S]*?)(<\/div>)/;

/* -----------------------------------------------------------------------------
   Cache-busting — เติม ?v=<hash เนื้อไฟล์> ต่อท้ายลิงก์ CSS/JS ในหน้า dist
   ป้องกันเบราว์เซอร์/ผู้เข้าชมเห็นสไตล์เก่าค้างหลัง deploy
   hash คิดจากเนื้อไฟล์จริง → ไฟล์ไหนไม่เปลี่ยน เลข version คงเดิม cache ยังใช้ได้
   (หมายเหตุ: ไม่แตะ url(...) ฟอนต์ที่อยู่ภายใน CSS เพราะฟอนต์แทบไม่เปลี่ยน
    และเมื่อ CSS เปลี่ยน เลข version ของ CSS จะเปลี่ยนให้เองอยู่แล้ว)
   -------------------------------------------------------------------------- */
const _verCache = new Map();
function assetVersion(rel) {
  if (_verCache.has(rel)) return _verCache.get(rel);
  let v = '';
  try {
    v = createHash('sha1').update(readFileSync(join(ROOT, rel))).digest('hex').slice(0, 8);
  } catch {
    v = '';   // ไม่พบไฟล์ — ปล่อยลิงก์เดิมไว้
  }
  _verCache.set(rel, v);
  return v;
}

function bustAssets(html) {
  return html.replace(
    /(\b(?:href|src)=")(assets\/[^"?#]+\.(?:css|js))(")/g,
    (match, pre, path, post) => {
      const v = assetVersion(path);
      return v ? `${pre}${path}?v=${v}${post}` : match;
    }
  );
}

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  for (const item of COPY) {
    await cp(join(ROOT, item), join(DIST, item), { recursive: true });
  }

  const files = (await readdir(PAGES_DIR)).filter(f => f.endsWith('.json'));
  let built = 0;
  const problems = [];
  const pages = [];   // ชื่อไฟล์ HTML ทุกหน้าที่ลง dist จริง ใช้ทำ sitemap

  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    const htmlName = slug.startsWith('_') ? 'styleguide.html' : `${slug}.html`;

    let shell;
    try {
      shell = await readFile(join(ROOT, htmlName), 'utf8');
    } catch {
      problems.push(`ข้าม ${file} — ไม่พบไฟล์ ${htmlName}`);
      continue;
    }

    const page = JSON.parse(await readFile(join(PAGES_DIR, file), 'utf8'));
    const invalid = validatePage(page);
    if (invalid.length) {
      problems.push(`${file} ไม่ผ่านการตรวจ: ${invalid.join(' / ')}`);
      continue;
    }

    if (!MOUNT_RE.test(shell)) {
      problems.push(`${htmlName} ไม่มี <div id="app-content"> — ข้าม`);
      continue;
    }

    const html = bustAssets(shell
      .replace(MOUNT_RE, (_, open, __, close) => `${open}\n${renderBlocks(page.blocks)}\n    ${close}`)
      .replace(/<title>[\s\S]*?<\/title>/,
        `<title>${page.seoTitle || `${page.title} | สำนักงานราชบัณฑิตยสภา`}</title>`));

    await writeFile(join(DIST, htmlName), html, 'utf8');
    pages.push(htmlName);
    built++;
    console.log(`  สร้าง dist/${htmlName}  (${page.blocks.length} block)`);
  }

  for (const name of STATIC_PAGES) {
    try {
      const raw = await readFile(join(ROOT, name), 'utf8');
      await writeFile(join(DIST, name), bustAssets(raw), 'utf8');
      pages.push(name);
      console.log(`  คัดลอก dist/${name}  (หน้าที่เขียน HTML เอง)`);
    } catch {
      problems.push(`คัดลอก ${name} ไม่สำเร็จ`);
    }
  }

  // ---- ไฟล์สำหรับ deploy: robots.txt, _headers ----
  for (const name of COPY_FILES) {
    let text;
    try {
      text = await readFile(join(ROOT, name), 'utf8');
    } catch {
      console.log(`  ! ไม่พบ ${name} ที่รากโปรเจกต์ — ข้าม`);
      continue;
    }
    if (text.includes('__SITE_URL__')) {
      text = SITE_URL
        ? text.replaceAll('__SITE_URL__', SITE_URL)
        : text.split('\n').filter(line => !line.includes('__SITE_URL__')).join('\n');
    }
    await writeFile(join(DIST, name), text, 'utf8');
    console.log(`  คัดลอก dist/${name}`);
  }

  // ---- sitemap.xml ----
  // หน้าแรกมาก่อนเสมอ ที่เหลือเรียงตามชื่อ
  const indexed = pages.filter(name => !NO_INDEX.has(name))
    .sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)));
  if (SITE_URL) {
    const now = new Date();   // วันที่ตามเครื่อง ไม่ใช่ UTC จะได้ไม่คลาดกันหนึ่งวัน
    const today = [now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')].join('-');
    const body = indexed.map(name => [
      '  <url>',
      `    <loc>${SITE_URL}/${name === 'index.html' ? '' : name}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      '  </url>',
    ].join('\n')).join('\n');
    await writeFile(join(DIST, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, 'utf8');
    console.log(`  สร้าง dist/sitemap.xml  (${indexed.length} URL)`);
  } else {
    console.log('  ข้าม sitemap.xml และบรรทัด Sitemap ใน robots.txt — ยังไม่ได้ตั้ง SITE_URL');
  }

  console.log(`\nสร้างเสร็จ ${built} หน้า -> dist/`);
  if (problems.length) {
    console.log('\nมีรายการที่ต้องดู');
    problems.forEach(p => console.log('  ! ' + p));
    process.exitCode = 1;
  }
}

main().catch(e => { console.error(e); process.exitCode = 1; });
