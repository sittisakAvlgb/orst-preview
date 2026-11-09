/* =============================================================================
   blocks.js — ตัวสร้าง HTML จากข้อมูล JSON (Block renderer)
   -----------------------------------------------------------------------------
   ไฟล์นี้เป็น "ฟังก์ชันบริสุทธิ์" ล้วน ๆ  รับ object เข้า -> คืน HTML string ออก
   ไม่แตะ DOM ไม่แตะ window  จึงรันได้ทั้งในเบราว์เซอร์และใน Node.js
   (ใช้ซ้ำได้ทั้งตอน render สด และตอน build เป็นไฟล์ HTML นิ่ง)

   วิธีใช้
     import { renderBlocks } from './blocks.js';
     const html = renderBlocks(page.blocks);

   เพิ่ม block ใหม่ยังไง
     1. เขียนฟังก์ชัน render ใหม่ในไฟล์นี้
     2. ลงทะเบียนใน BLOCKS ท้ายไฟล์
     3. เพิ่ม schema ใน content/blocks.schema.json
     4. เพิ่มตัวอย่างใน content/pages/_styleguide.json
     5. เพิ่ม CSS (ถ้าต้องการ) ใน assets/css/blocks.css

   *** ทุก block รับ prop ร่วมเหล่านี้ได้ ***
     id       string   ใส่เป็น id ของ <section> เพื่อทำ anchor link
     variant  string   "default" (พื้นสีกระดาษ) | "alt" (พื้นขาว)
     heading  string   หัวข้อของ section
     lead     string   คำโปรยใต้หัวข้อ
     action   object   ปุ่มมุมขวาบนของ section { label, href }
   ============================================================================= */

/* ---------- ตัวช่วยพื้นฐาน ---------- */

/** แปลงอักขระพิเศษเป็น entity — ใช้กับ "ทุก" ค่าที่มาจากข้อมูล */
export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** ใส่ attribute เฉพาะเมื่อมีค่า */
function attr(name, value) {
  return value ? ` ${name}="${esc(value)}"` : '';
}

/** ไอคอนจาก sprite ที่ components.js ใส่ไว้ให้ (เช่น 'i-book') */
export function icon(id, className = 'icon') {
  if (!id) return '';
  return `<svg class="${esc(className)}" aria-hidden="true"><use href="#${esc(id)}"></use></svg>`;
}

/** ใส่ lang="en" ให้ข้อความที่เป็นภาษาอังกฤษล้วน (ไม่มีอักษรไทย) — ใช้ฟอนต์อังกฤษ และโปรแกรมอ่านหน้าจอออกเสียงถูก */
function langAttr(text) {
  return text && !/[฀-๿]/.test(text) ? ' lang="en"' : '';
}

/** หัว section มาตรฐาน: หัวข้อ + คำโปรย + ปุ่มมุมขวา */
function sectionHead(block) {
  if (!block.heading && !block.lead) return '';
  const action = block.action?.href
    ? `<a class="view-all" href="${esc(block.action.href)}">${esc(block.action.label || 'ดูทั้งหมด')}</a>`
    : '';
  return `
      <div class="section-head">
        <div>
          ${block.eyebrow ? `<span class="block-eyebrow"${langAttr(block.eyebrow)}>${esc(block.eyebrow)}</span>` : ''}
          ${block.heading ? `<h2>${esc(block.heading)}</h2>` : ''}
          ${block.lead ? `<p>${esc(block.lead)}</p>` : ''}
        </div>
        ${action}
      </div>`;
}

/** ห่อเนื้อหาด้วย <section class="section"> + .container ให้เป็นมาตรฐานเดียวกัน */
function section(block, inner, extraClass = '') {
  const variant = block.variant === 'alt' ? ' alt' : '';
  const cls = `section${variant}${extraClass ? ' ' + extraClass : ''}`;
  return `
    <section class="${cls}"${attr('id', block.id)}>
      <div class="container">${sectionHead(block)}
        ${inner}
      </div>
    </section>`;
}

/** ปุ่ม/ลิงก์ชุดหนึ่ง */
function actions(list = []) {
  if (!list.length) return '';
  return `<div class="block-actions">${list.map(a => {
    const cls = a.variant === 'ghost' ? 'block-btn is-ghost' : 'block-btn';
    return `<a class="${cls}" href="${esc(a.href || '#')}">${esc(a.label || '')}</a>`;
  }).join('')}</div>`;
}

/** คลาสจำนวนคอลัมน์ */
function colsClass(n) {
  const c = Number(n) || 3;
  return `block-grid block-grid-${Math.min(Math.max(c, 1), 4)}`;
}

/* ---------- Block: page-hero ---------- */
/* หัวหน้าเพจ ใช้ได้หน้าละ 1 อันและควรอยู่บนสุด
   { type, heading, lead, eyebrow?, breadcrumb?: [{label, href}], actions?: [] } */
function pageHero(b) {
  const crumbs = (b.breadcrumb || []).length
    ? `<nav class="block-breadcrumb" aria-label="เส้นทางหน้า">${b.breadcrumb.map((c, i, arr) =>
        i === arr.length - 1
          ? `<span aria-current="page">${esc(c.label)}</span>`
          : `<a href="${esc(c.href || '#')}">${esc(c.label)}</a>`
      ).join('<span aria-hidden="true">/</span>')}</nav>`
    : '';
  return `
    <section class="page-hero"${attr('id', b.id)}>
      <div class="container">
        ${crumbs}
        ${b.eyebrow ? `<span class="block-eyebrow"${langAttr(b.eyebrow)}>${esc(b.eyebrow)}</span>` : ''}
        <h1>${esc(b.heading)}</h1>
        ${b.lead ? `<p>${esc(b.lead)}</p>` : ''}
        ${actions(b.actions)}
      </div>
    </section>`;
}

/* ---------- Block: rich-text ---------- */
/* ข้อความยาว  ใช้ paragraphs (ปลอดภัย) หรือ html (ต้องเชื่อถือแหล่งที่มา)
   { type, heading?, lead?, paragraphs?: [string], html?: string, width?: "narrow"|"full" } */
function richText(b) {
  const body = b.html
    ? b.html
    : (b.paragraphs || []).map(p => `<p>${esc(p)}</p>`).join('\n        ');
  const width = b.width === 'full' ? '' : ' block-prose-narrow';
  return section(b, `<div class="block-prose${width}">
          ${body}
        </div>`);
}

/* ---------- Block: card-grid ---------- */
/* การ์ดเนื้อหาเรียงเป็นตาราง — block ที่ใช้บ่อยที่สุด
   { type, heading?, lead?, columns?: 2|3|4,
     items: [{ title, body?, href?, icon?, tag?, meta?, action? }] }
   action = ข้อความปุ่มท้ายการ์ด (เช่น "ยื่นคำขอ") แสดงเมื่อการ์ดมี href */
function cardGrid(b) {
  const cards = (b.items || []).map(it => {
    const inner = `
            ${it.icon ? `<span class="block-card-icon">${icon(it.icon, 'icon-lg')}</span>` : ''}
            ${it.tag ? `<span class="block-tag">${esc(it.tag)}</span>` : ''}
            <h3>${esc(it.title)}</h3>
            ${it.body ? `<p>${esc(it.body)}</p>` : ''}
            ${it.meta ? `<small class="block-meta">${esc(it.meta)}</small>` : ''}
            ${it.action ? `<span class="block-card-action">${esc(it.action)} <span aria-hidden="true">→</span></span>` : ''}`;
    return it.href
      ? `<a class="content-card block-card is-link" href="${esc(it.href)}">${inner}
          </a>`
      : `<article class="content-card block-card">${inner}
          </article>`;
  }).join('\n          ');
  return section(b, `<div class="${colsClass(b.columns)}">
          ${cards}
        </div>`);
}

/* ---------- Block: feature-list ---------- */
/* รายการไอคอน + หัวข้อ + คำอธิบาย เรียงเป็นแถว
   { type, heading?, lead?, columns?, items: [{ icon, title, body? }] } */
function featureList(b) {
  const items = (b.items || []).map(it => `
            <li class="block-feature">
              <span class="block-feature-icon">${icon(it.icon || 'i-shield', 'icon-lg')}</span>
              <div>
                <strong>${esc(it.title)}</strong>
                ${it.body ? `<p>${esc(it.body)}</p>` : ''}
              </div>
            </li>`).join('');
  return section(b, `<ul class="${colsClass(b.columns)} block-feature-list">${items}
        </ul>`);
}

/* ---------- Block: stat-row ---------- */
/* ตัวเลขสถิติ  { type, heading?, items: [{ value, label, note? }] } */
function statRow(b) {
  const items = (b.items || []).map(it => `
            <div class="block-stat">
              <strong>${esc(it.value)}</strong>
              <span>${esc(it.label)}</span>
              ${it.note ? `<small>${esc(it.note)}</small>` : ''}
            </div>`).join('');
  return section(b, `<div class="block-stat-row">${items}
        </div>`);
}

/* ---------- Block: link-list ---------- */
/* รายการเอกสาร/ลิงก์ พร้อมชนิดไฟล์และวันที่
   { type, heading?, lead?, items: [{ title, desc?, meta?, href, tag?, icon? }] } */
function linkList(b) {
  const items = (b.items || []).map(it => `
            <li>
              <a class="block-link-row" href="${esc(it.href || '#')}">
                <span class="block-link-icon">${icon(it.icon || 'i-file')}</span>
                <span class="block-link-text">
                  <strong>${esc(it.title)}</strong>
                  ${it.desc ? `<span>${esc(it.desc)}</span>` : ''}
                </span>
                ${it.tag ? `<span class="block-tag">${esc(it.tag)}</span>` : ''}
                ${it.meta ? `<span class="block-meta">${esc(it.meta)}</span>` : ''}
              </a>
            </li>`).join('');
  return section(b, `<ul class="block-link-list">${items}
        </ul>`);
}

/* ---------- Block: media-grid ---------- */
/* การ์ดที่มีรูปภาพ  { type, heading?, columns?, items: [{ image, alt, title, desc?, href?, tag? }] } */
function mediaGrid(b) {
  const items = (b.items || []).map(it => {
    const inner = `
            <span class="block-media-thumb">
              <img src="${esc(it.image)}" alt="${esc(it.alt || it.title || '')}" loading="lazy">
              ${it.tag ? `<span class="block-tag">${esc(it.tag)}</span>` : ''}
            </span>
            <span class="block-media-body">
              <strong>${esc(it.title)}</strong>
              ${it.desc ? `<span>${esc(it.desc)}</span>` : ''}
            </span>`;
    return it.href
      ? `<a class="block-media-card is-link" href="${esc(it.href)}">${inner}
          </a>`
      : `<div class="block-media-card">${inner}
          </div>`;
  }).join('\n          ');
  return section(b, `<div class="${colsClass(b.columns)}">
          ${items}
        </div>`);
}

/* ---------- Block: table ---------- */
/* ตารางข้อมูล  { type, heading?, caption?, columns: [string], rows: [[string]] } */
function table(b) {
  const head = (b.columns || []).map(c => `<th scope="col">${esc(c)}</th>`).join('');
  const body = (b.rows || []).map(row =>
    `<tr>${row.map((cell, i) =>
      i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`
    ).join('')}</tr>`).join('\n              ');
  return section(b, `<div class="block-table-wrap">
          <table class="block-table">
            ${b.caption ? `<caption>${esc(b.caption)}</caption>` : ''}
            <thead><tr>${head}</tr></thead>
            <tbody>
              ${body}
            </tbody>
          </table>
        </div>`);
}

/* ---------- Block: faq ---------- */
/* คำถามที่พบบ่อย — ใช้คลาส .faq-compact-list ที่ components.js ผูก event ให้อยู่แล้ว
   { type, heading?, lead?, items: [{ q, a }] } */
function faq(b) {
  const items = (b.items || []).map((it, i) => `
            <div class="faq-item">
              <button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a-${esc(b.id || 'x')}-${i}">
                <span>${esc(it.q)}</span>
                ${icon('i-chevron')}
              </button>
              <div class="faq-a" id="faq-a-${esc(b.id || 'x')}-${i}" hidden>
                <p>${esc(it.a)}</p>
              </div>
            </div>`).join('');
  return section(b, `<div class="faq-compact-list">${items}
        </div>`);
}

/* ---------- Block: steps ---------- */
/* ขั้นตอนการทำงาน มีเลขลำดับให้อัตโนมัติ
   { type, heading?, lead?, items: [{ title, body? }] } */
function steps(b) {
  const items = (b.items || []).map((it, i) => `
            <li class="block-step">
              <span class="block-step-no" aria-hidden="true">${i + 1}</span>
              <div>
                <strong>${esc(it.title)}</strong>
                ${it.body ? `<p>${esc(it.body)}</p>` : ''}
              </div>
            </li>`).join('');
  return section(b, `<ol class="block-steps">${items}
        </ol>`);
}

/* ---------- Block: two-column ---------- */
/* ข้อความ + รูป วางคู่กัน
   { type, heading?, paragraphs?: [], image, imageAlt?, imageSide?: "left"|"right", actions?: [] } */
function twoColumn(b) {
  const side = b.imageSide === 'left' ? ' is-image-left' : '';
  const body = (b.paragraphs || []).map(p => `<p>${esc(p)}</p>`).join('\n            ');
  return section(b, `<div class="block-two-col${side}">
          <div class="block-two-col-text">
            ${b.subheading ? `<h3>${esc(b.subheading)}</h3>` : ''}
            ${body}
            ${actions(b.actions)}
          </div>
          <div class="block-two-col-media">
            <img src="${esc(b.image)}" alt="${esc(b.imageAlt || '')}" loading="lazy">
          </div>
        </div>`);
}

/* ---------- Block: cta-band ---------- */
/* แถบเรียกให้ทำอะไรบางอย่าง  { type, heading, body?, actions: [{label, href, variant?}] } */
function ctaBand(b) {
  return `
    <section class="block-cta"${attr('id', b.id)}>
      <div class="container block-cta-inner">
        <div>
          <h2>${esc(b.heading)}</h2>
          ${b.body ? `<p>${esc(b.body)}</p>` : ''}
        </div>
        ${actions(b.actions)}
      </div>
    </section>`;
}

/* ---------- Block: notice ---------- */
/* กล่องแจ้งเตือน  { type, tone?: "info"|"warn"|"success", title?, body } */
function notice(b) {
  const tone = ['info', 'warn', 'success'].includes(b.tone) ? b.tone : 'info';
  const icons = { info: 'i-file', warn: 'i-shield', success: 'i-shield' };
  return section(b, `<div class="block-notice is-${tone}" role="note">
          <span class="block-notice-icon">${icon(icons[tone], 'icon-lg')}</span>
          <div>
            ${b.title ? `<strong>${esc(b.title)}</strong>` : ''}
            <p>${esc(b.body)}</p>
          </div>
        </div>`);
}

/* ---------- Block: contact-info ---------- */
/* ข้อมูลติดต่อ  { type, heading?, address?, phone?, email?, hours?, mapEmbed? } */
function contactInfo(b) {
  const row = (iconId, label, value, href) => value ? `
            <li class="block-contact-row">
              <span class="block-contact-icon">${icon(iconId)}</span>
              <div>
                <small>${esc(label)}</small>
                ${href ? `<a href="${esc(href)}">${esc(value)}</a>` : `<span>${esc(value)}</span>`}
              </div>
            </li>` : '';
  const map = b.mapEmbed
    ? `<div class="block-contact-map"><iframe src="${esc(b.mapEmbed)}" title="แผนที่" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`
    : '';
  return section(b, `<div class="block-contact${map ? ' has-map' : ''}">
          <ul class="block-contact-list">
            ${row('i-map', 'ที่อยู่', b.address)}
            ${row('i-phone', 'โทรศัพท์', b.phone, b.phone ? `tel:${String(b.phone).replace(/[^0-9+]/g, '')}` : '')}
            ${row('i-file', 'อีเมล', b.email, b.email ? `mailto:${b.email}` : '')}
            ${row('i-eye', 'เวลาทำการ', b.hours)}
          </ul>
          ${map}
        </div>`);
}

/* ---------- ทะเบียน block ทั้งหมด ---------- */

export const BLOCKS = {
  'page-hero': pageHero,
  'rich-text': richText,
  'card-grid': cardGrid,
  'feature-list': featureList,
  'stat-row': statRow,
  'link-list': linkList,
  'media-grid': mediaGrid,
  'table': table,
  'faq': faq,
  'steps': steps,
  'two-column': twoColumn,
  'cta-band': ctaBand,
  'notice': notice,
  'contact-info': contactInfo,
};

export const BLOCK_TYPES = Object.keys(BLOCKS);

/**
 * แปลง array ของ block เป็น HTML string
 * block ที่ไม่รู้จักจะไม่ทำให้ทั้งหน้าพัง แต่จะแสดงกล่องเตือนแทน
 */
export function renderBlocks(blocks = []) {
  return blocks.map((block, index) => {
    const fn = BLOCKS[block?.type];
    if (!fn) {
      return `
    <section class="section">
      <div class="container">
        <div class="block-notice is-warn" role="note">
          <div><strong>ไม่รู้จัก block ชนิด "${esc(block?.type)}" (ลำดับที่ ${index + 1})</strong>
          <p>ชนิดที่ใช้ได้: ${BLOCK_TYPES.join(', ')}</p></div>
        </div>
      </div>
    </section>`;
    }
    try {
      return fn(block);
    } catch (error) {
      return `
    <section class="section">
      <div class="container">
        <div class="block-notice is-warn" role="note">
          <div><strong>สร้าง block "${esc(block.type)}" (ลำดับที่ ${index + 1}) ไม่สำเร็จ</strong>
          <p>${esc(error.message)}</p></div>
        </div>
      </div>
    </section>`;
    }
  }).join('\n');
}

/** ตรวจข้อมูลหน้าอย่างง่าย คืน array ของข้อความปัญหา (ว่าง = ผ่าน) */
export function validatePage(page) {
  const problems = [];
  if (!page || typeof page !== 'object') return ['ไฟล์ JSON ไม่ใช่ object'];
  if (!page.title) problems.push('ขาด "title"');
  if (!page.navKey) problems.push('ขาด "navKey" (ต้องตรงกับ key ในเมนู เช่น about, news)');
  if (!Array.isArray(page.blocks)) return [...problems, 'ขาด "blocks" หรือไม่ใช่ array'];
  page.blocks.forEach((b, i) => {
    if (!b || !b.type) problems.push(`blocks[${i}] ขาด "type"`);
    else if (!BLOCKS[b.type]) problems.push(`blocks[${i}] ชนิด "${b.type}" ไม่มีอยู่จริง`);
  });
  return problems;
}
