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
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderBlocks, validatePage } from '../assets/js/blocks.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const PAGES_DIR = join(ROOT, 'content', 'pages');

/** โฟลเดอร์/ไฟล์ที่ต้องคัดลอกไป dist ตามเดิม */
const COPY = ['assets', 'content'];
/** ไฟล์ HTML ที่ไม่ต้องแตะ (เขียน HTML เองทั้งหมด) จะถูกคัดลอกดิบ ๆ */
const STATIC_PAGES = ['index.html', 'knowledge.html', 'contact.html'];

const MOUNT_RE = /(<div id="app-content"[^>]*>)([\s\S]*?)(<\/div>)/;

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  for (const item of COPY) {
    await cp(join(ROOT, item), join(DIST, item), { recursive: true });
  }

  const files = (await readdir(PAGES_DIR)).filter(f => f.endsWith('.json'));
  let built = 0;
  const problems = [];

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

    const html = shell
      .replace(MOUNT_RE, (_, open, __, close) => `${open}\n${renderBlocks(page.blocks)}\n    ${close}`)
      .replace(/<title>[\s\S]*?<\/title>/,
        `<title>${page.seoTitle || `${page.title} | สำนักงานราชบัณฑิตยสภา`}</title>`);

    await writeFile(join(DIST, htmlName), html, 'utf8');
    built++;
    console.log(`  สร้าง dist/${htmlName}  (${page.blocks.length} block)`);
  }

  for (const name of STATIC_PAGES) {
    try {
      await cp(join(ROOT, name), join(DIST, name));
      console.log(`  คัดลอก dist/${name}  (หน้าที่เขียน HTML เอง)`);
    } catch {
      problems.push(`คัดลอก ${name} ไม่สำเร็จ`);
    }
  }

  console.log(`\nสร้างเสร็จ ${built} หน้า -> dist/`);
  if (problems.length) {
    console.log('\nมีรายการที่ต้องดู');
    problems.forEach(p => console.log('  ! ' + p));
    process.exitCode = 1;
  }
}

main().catch(e => { console.error(e); process.exitCode = 1; });
