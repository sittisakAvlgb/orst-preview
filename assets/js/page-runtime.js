/* =============================================================================
   page-runtime.js — โหลดเนื้อหาหน้าจากไฟล์ JSON แล้ว render ลงหน้าเว็บ
   -----------------------------------------------------------------------------
   ใช้กับหน้าที่เนื้อหามาจาก content/pages/<slug>.json
   หน้า HTML ต้องมีโครงแบบนี้

     <body data-page="about">
       <div id="app-header"></div>
       <main id="main-content">
         <div id="app-content" data-content="content/pages/about.json"></div>
       </main>
       <div id="app-footer"></div>
       <script src="assets/js/components.js"></script>
       <script type="module" src="assets/js/page-runtime.js"></script>
     </body>

   ถ้าไม่ใส่ data-content จะเดาชื่อไฟล์จากชื่อหน้า เช่น about.html -> content/pages/about.json

   หมายเหตุเรื่อง SEO
     วิธีนี้ render ฝั่งเบราว์เซอร์ เหมาะกับช่วงต้นแบบ/ก่อนต่อ CMS
     ถ้าต้องการ HTML นิ่งสำหรับ production ให้รัน  node tools/build.mjs
     ซึ่งจะเขียนเนื้อหาลงไฟล์ HTML ให้เลย โดยใช้ตัว render ตัวเดียวกัน
   ============================================================================= */

import { renderBlocks, validatePage } from './blocks.js';

const MOUNT_ID = 'app-content';

function ready() {
  return document.readyState === 'loading'
    ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }))
    : Promise.resolve();
}

function guessContentPath() {
  const file = location.pathname.split('/').pop() || 'index.html';
  const slug = file.replace(/\.html?$/i, '') || 'index';
  return `content/pages/${slug}.json`;
}

function showError(mount, title, details = []) {
  mount.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="block-notice is-warn" role="alert">
          <div>
            <strong>${title}</strong>
            ${details.length ? `<ul>${details.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
            <p>ดูวิธีเขียนไฟล์เนื้อหาได้ที่ <code>CONTENT-MODEL.md</code></p>
          </div>
        </div>
      </div>
    </section>`;
}

function applyMeta(page) {
  if (page.title) {
    document.title = page.seoTitle || `${page.title} | สำนักงานราชบัณฑิตยสภา`;
  }
  if (page.description) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', page.description);
  }
  // เตือนถ้า data-page ในไฟล์ HTML ไม่ตรงกับ navKey ใน JSON (เมนูจะไฮไลต์ผิด)
  const bodyKey = document.body.dataset.page;
  if (page.navKey && bodyKey && page.navKey !== bodyKey) {
    console.warn(`[ORST] data-page="${bodyKey}" ไม่ตรงกับ navKey "${page.navKey}" ใน JSON — เมนูอาจไฮไลต์ผิดหน้า`);
  }
}

async function main() {
  await ready();

  const mount = document.getElementById(MOUNT_ID);
  if (!mount) return;

  // ถ้าเนื้อหาถูกใส่มาแล้วตั้งแต่ฝั่งเซิร์ฟเวอร์ (ผลจาก node tools/build.mjs)
  // ไม่ต้อง fetch ซ้ำ แค่ผูก event ให้ block ที่ต้องใช้ JS ก็พอ
  if (mount.children.length > 0) {
    window.orstHeader?.bindDynamicContent?.();
    return;
  }

  const path = mount.dataset.content || guessContentPath();

  let page;
  try {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    page = await response.json();
  } catch (error) {
    showError(mount, `โหลดไฟล์เนื้อหาไม่สำเร็จ: ${path}`, [
      error.message,
      'ตรวจว่าไฟล์มีอยู่จริงและ JSON ถูกต้อง (ไม่มี comma เกิน)',
      'ต้องเปิดผ่าน Live Server ไม่ใช่เปิดไฟล์ตรง ๆ ด้วย file://',
    ]);
    return;
  }

  const problems = validatePage(page);
  if (problems.length) {
    showError(mount, `ไฟล์เนื้อหา ${path} ยังไม่ถูกต้อง`, problems);
    return;
  }

  applyMeta(page);
  mount.innerHTML = renderBlocks(page.blocks);

  // ผูก event ให้ block ที่ต้องใช้ JS (เช่น faq) เพราะเนื้อหาเพิ่งถูกใส่เข้า DOM
  window.orstHeader?.bindDynamicContent?.();

  document.dispatchEvent(new CustomEvent('orst:content-rendered', { detail: { page, path } }));
}

main();
