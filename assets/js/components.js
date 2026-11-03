/* =============================================================================
   components.js — Header / Top bar / Mega menu / Mobile menu / Footer
   -----------------------------------------------------------------------------
   ไฟล์นี้ใช้ร่วมกันทุกหน้า แก้ที่นี่ที่เดียวมีผลทั้งเว็บ

   วิธีทำงาน
     หน้า HTML วางแค่ <div id="app-header"></div> และ <div id="app-footer"></div>
     ไฟล์นี้จะ render HTML ใส่ให้ตอน DOMContentLoaded แล้วผูก event ทั้งหมด
     ส่วน CSS ของ component อยู่ที่ assets/css/components.css (ต้องโหลดท้ายสุด)

   สารบัญ
     icons              คลัง SVG symbol ใช้ผ่านฟังก์ชัน icon('i-book')
     navItems           รายการเมนูหลัก [key, ชื่อที่แสดง, ลิงก์]
                        key ต้องตรงกับ <body data-page="..."> ของแต่ละหน้า
     megaMenuData       เนื้อหา mega menu ของแต่ละหมวด
     renderMegaMenu()   สร้าง HTML ของ mega menu
     renderDesktopNav() / renderDrawer()   (renderDrawer = แผงเมนูมือถือ/แท็บเล็ต)
     renderHeader()     topbar + header + เมนู + modal ค้นหา/การเข้าถึง
     renderFooter()     footer ทั้งหมด
     init*()            ผูก event ต่าง ๆ (ดูรายการใน initComponents ท้ายไฟล์)
     initFixedHeader()  คำนวณความสูง header ที่ position:fixed แล้วดัน body ลงมา
     window.orstHeader  export ออกไปให้หน้าอื่นเรียกใช้ได้
   ============================================================================= */

// รองรับกรณีย้ายหน้าไปไว้ในโฟลเดอร์ย่อยชื่อ pages/ ในอนาคต
// ตอนนี้ทุกหน้าอยู่ที่ root จึงได้ค่า './' เสมอ
const basePath = location.pathname.includes('/pages/') ? '../' : './';

// ลิงก์ไปเว็บไซต์/ระบบของราชบัณฑิตยสภา — ใช้กับปุ่มบน topbar และในเมนูมือถือ (เปิดแท็บใหม่)
// TODO: ใส่ URL จริงที่ได้รับจากหน่วยงาน (ตอนนี้ยังเป็น "#" ตามกฎห้ามเดาข้อมูลจริง)
const ROYAL_SOCIETY_URL = '#';

const icons = `
<svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4.2-4.2"></path></symbol>
  <symbol id="i-book" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"></path></symbol>
  <symbol id="i-eye" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path><circle cx="12" cy="12" r="3"></circle></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><path d="M20 21a8 8 0 1 0-16 0"></path><circle cx="12" cy="7" r="4"></circle></symbol>
  <symbol id="i-access" viewBox="0 0 24 24"><circle cx="12" cy="4" r="2"></circle><path d="M4 8h16"></path><path d="M12 6v16"></path><path d="m8 22 4-10 4 10"></path></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-5"></path></symbol>
  <symbol id="i-people" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></symbol>
  <symbol id="i-file" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></symbol>
  <symbol id="i-video" viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2"></rect></symbol>
  <symbol id="i-form" viewBox="0 0 24 24"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></symbol>
  <symbol id="i-dictionary" viewBox="0 0 24 24"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v19H7.5A2.5 2.5 0 0 1 5 18.5z"></path><path d="M5 18.5A2.5 2.5 0 0 1 7.5 16H20"></path><path d="M9 6h6"></path><path d="M9 10h8"></path></symbol>
  <symbol id="i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"></ellipse><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"></path><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"></path></symbol>
  <symbol id="i-journal" viewBox="0 0 24 24"><path d="M7 3h10a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path><path d="M9 7h6"></path><path d="M9 11h6"></path><path d="M9 15h4"></path></symbol>
  <symbol id="i-ebook" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M9 7h6"></path><path d="M9 11h6"></path><path d="M9 15h3"></path><path d="M12 19h.01"></path></symbol>
  <symbol id="i-megaphone" viewBox="0 0 24 24"><path d="M3 11v2a2 2 0 0 0 2 2h3l7 4V5l-7 4H5a2 2 0 0 0-2 2z"></path><path d="M19 9a4 4 0 0 1 0 6"></path></symbol>
  <symbol id="i-chevron" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"></path></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14"></path><path d="M5 12h14"></path></symbol>
  <symbol id="i-map" viewBox="0 0 24 24"><path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z"></path><path d="M9 3v15"></path><path d="M15 6v15"></path></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"></rect><path d="M11 18h2"></path></symbol>
  <symbol id="i-pen" viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></symbol>
  <symbol id="i-puzzle" viewBox="0 0 24 24"><path d="M19 13h-2v-2a2 2 0 1 0-4 0v2h-2V9h2V7a2 2 0 1 0-4 0v2H5v10h14Z"></path></symbol>
  <symbol id="i-home" viewBox="0 0 24 24"><path d="M3 11 12 4l9 7"></path><path d="M5 10v10h14V10"></path><path d="M10 20v-6h4v6"></path></symbol>
  <symbol id="i-external" viewBox="0 0 24 24"><path d="M14 4h6v6"></path><path d="M10 14 20 4"></path><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"></path></symbol>
  <symbol id="i-service" viewBox="0 0 24 24"><path d="M12 3l8 4v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7z"></path><path d="M9 12l2 2 4-5"></path></symbol>
</svg>`;

function icon(id, className = 'icon') {
  return `<svg class="${className}" aria-hidden="true"><use href="#${id}"></use></svg>`;
}

const navItems = [
  ['home', 'หน้าหลัก', `${basePath}index.html`],
  ['dictionary', 'พจนานุกรมและคำศัพท์', `${basePath}dictionary.html`],
  ['knowledge', 'องค์ความรู้', `${basePath}knowledge.html`],
  ['publications', 'สื่อและสิ่งพิมพ์', `${basePath}publications.html`],
  ['news', 'ข่าวสารและกิจกรรม', `${basePath}news.html`],
  ['services', 'บริการประชาชน', `${basePath}services.html`],
  ['about', 'เกี่ยวกับเรา', `${basePath}about.html`],
  ['contact', 'ติดต่อเรา', `${basePath}contact.html`],
];

const megaMenuData = {
  dictionary: {
    title: 'พจนานุกรมและคำศัพท์',
    eyebrow: 'Language Services',
    description: 'ค้นคำศัพท์ ความหมาย ศัพท์บัญญัติ และหลักเกณฑ์การใช้ภาษาไทยจากแหล่งข้อมูลเดียว',
    icon: 'i-dictionary',
    featured: ['เปิดพจนานุกรมออนไลน์', `${basePath}dictionary.html`],
    groups: [
      {
        heading: 'บริการคำศัพท์',
        links: [
          ['พจนานุกรมออนไลน์', `${basePath}dictionary.html`, 'ค้นความหมายและการใช้คำ'],
          ['ศัพท์บัญญัติ', '#', 'ศัพท์เฉพาะทางและคำมาตรฐาน'],
          ['ค้นคำศัพท์ภาษาไทย', '#', 'ค้นหาคำตามหมวดและคำใกล้เคียง'],
        ]
      },
      {
        heading: 'ฐานข้อมูลที่เกี่ยวข้อง',
        links: [
          ['สารานุกรมและอนุกรมวิธาน', '#', 'คลังความรู้และหมวดคำ'],
          ['หลักเกณฑ์การใช้ภาษา', '#', 'แนวทางการเขียนและการใช้ภาษา'],
          ['คำถามที่พบบ่อยด้านภาษา', '#', 'คำตอบสั้นสำหรับประชาชน'],
        ]
      }
    ]
  },
  knowledge: {
    title: 'องค์ความรู้',
    eyebrow: 'Knowledge Archive',
    description: 'เข้าสู่คลังปัญญาแห่งชาติ บทความ ฐานข้อมูล และองค์ความรู้สำหรับประชาชน',
    icon: 'i-book',
    featured: ['เข้าสู่คลังองค์ความรู้', `${basePath}knowledge.html`],
    groups: [
      {
        heading: 'ค้นหาและฐานข้อมูล',
        links: [
          ['คลังองค์ความรู้', `${basePath}knowledge.html`, 'ค้นจากทุกฐานข้อมูล'],
          ['บทความวิชาการ', '#', 'บทความเผยแพร่และเอกสารอ้างอิง'],
          ['องค์ความรู้สำหรับประชาชน', '#', 'เนื้อหาเข้าใจง่ายสำหรับทุกกลุ่ม'],
        ]
      },
      {
        heading: 'หมวดความรู้',
        links: [
          ['ภาษาไทย', '#', 'คำศัพท์ การใช้ภาษา และหลักเกณฑ์'],
          ['วิทยาศาสตร์', '#', 'ศัพท์วิชาการและองค์ความรู้ร่วมสมัย'],
          ['ศิลปกรรม', '#', 'ศิลปะ วัฒนธรรม และวรรณคดี'],
          ['สังคมศาสตร์', '#', 'ชุมชน เศรษฐกิจ สังคม และนโยบาย'],
        ]
      }
    ]
  },
  publications: {
    title: 'สื่อและสิ่งพิมพ์',
    eyebrow: 'Publications & Media',
    description: 'รวมหนังสือ วารสาร สื่อดิจิทัล และเอกสารเผยแพร่ของสำนักงาน',
    icon: 'i-ebook',
    featured: ['ดูสื่อและสิ่งพิมพ์', `${basePath}publications.html`],
    groups: [
      {
        heading: 'สิ่งพิมพ์',
        links: [
          ['หนังสือและตำรา', `${basePath}publications.html`, 'หนังสือวิชาการและเอกสารอ้างอิง'],
          ['วารสารราชบัณฑิตยสภา', '#', 'วารสารและบทความเผยแพร่'],
        ]
      },
      {
        heading: 'สื่อดิจิทัล',
        links: [
          ['วิดีโอและสื่อมัลติมีเดีย', '#', 'องค์ความรู้แบบรับชม'],
          ['Infographic', '#', 'สรุปความรู้เข้าใจง่าย'],
          ['วิธีสั่งซื้อหนังสือ', '#', 'ขั้นตอนและช่องทางชำระเงิน'],
        ]
      }
    ]
  },
  news: {
    title: 'ข่าวสารและกิจกรรม',
    eyebrow: 'News & Events',
    description: 'ติดตามข่าวประชาสัมพันธ์ ประกาศ กิจกรรม และความเคลื่อนไหวล่าสุด',
    icon: 'i-megaphone',
    featured: ['อ่านข่าวทั้งหมด', `${basePath}news.html`],
    groups: [
      {
        heading: 'ข่าวสาร',
        links: [
          ['ข่าวประชาสัมพันธ์', `${basePath}news.html`, 'ข่าวสารทั่วไป'],
          ['ข่าวกิจกรรม', '#', 'กิจกรรมและงานเผยแพร่'],
          ['บทบรรยายทางวิชาการ', '#', 'สื่อความรู้จากกิจกรรม'],
        ]
      },
      {
        heading: 'ประกาศ',
        links: [
          ['ประกาศจัดซื้อจัดจ้าง', '#', 'ประกาศและเอกสารที่เกี่ยวข้อง'],
          ['ประกาศรับสมัครงาน', '#', 'ข่าวสารงานบุคคล'],
          ['ข่าวสารทางราชการ', '#', 'ประกาศเผยแพร่ทั่วไป'],
        ]
      }
    ]
  },
  services: {
    title: 'บริการประชาชน',
    eyebrow: 'Digital Services',
    description: 'รวมบริการออนไลน์ แบบฟอร์ม การติดตามสถานะ และช่องทางติดต่อเจ้าหน้าที่',
    icon: 'i-service',
    featured: ['เข้าสู่บริการประชาชน', `${basePath}services.html`],
    groups: [
      {
        heading: 'บริการออนไลน์',
        links: [
          ['สอบถามข้อมูลทางวิชาการ', `${basePath}services.html`, 'ส่งคำถามและรับเลขติดตาม'],
          ['ขออนุญาตใช้เนื้อหา', '#', 'ยื่นคำขอและแนบเอกสาร'],
          ['ร้องเรียน / เสนอแนะ', '#', 'ส่งเรื่องและติดตามผล'],
        ]
      },
      {
        heading: 'งานบริการ',
        links: [
          ['แบบฟอร์มออนไลน์', '#', 'รวมแบบฟอร์มที่ใช้บ่อย'],
          ['คำถามที่พบบ่อย', '#', 'คำตอบเกี่ยวกับบริการ'],
          ['คู่มือการใช้บริการ', '#', 'ขั้นตอนและเอกสารประกอบ'],
        ]
      }
    ]
  },
  about: {
    title: 'เกี่ยวกับเรา',
    eyebrow: 'About ORST',
    description: 'ข้อมูลสำนักงาน โครงสร้าง ผู้บริหาร ราชบัณฑิต ภาคีสมาชิก และข้อมูลหน่วยงาน',
    icon: 'i-shield',
    featured: ['ข้อมูลสำนักงาน', `${basePath}about.html`],
    groups: [
      {
        heading: 'ข้อมูลสำนักงาน',
        links: [
          ['ประวัติความเป็นมา', '#', 'ข้อมูลและพัฒนาการของสำนักงาน'],
          ['โครงสร้างองค์กร', '#', 'หน่วยงานและภารกิจ'],
          ['ผู้บริหาร', '#', 'คณะผู้บริหารปัจจุบัน'],
        ]
      },
      {
        heading: 'ราชบัณฑิตและบุคลากร',
        links: [
          ['ราชบัณฑิตและภาคีสมาชิก', '#', 'รายชื่อและผลงาน'],
          ['บุคลากร', '#', 'ข้อมูลหน่วยงานและบุคลากร'],
          ['รายงานและแผนปฏิบัติราชการ', '#', 'ข้อมูลความโปร่งใสและผลการดำเนินงาน'],
        ]
      }
    ]
  }
};

function renderMegaMenu(key) {
  const data = megaMenuData[key];
  if (!data) return '';

  return `
    <div class="mega-inner" role="region" aria-label="เมนูย่อย ${data.title}">
      <div class="mega-feature">
        <span class="mega-feature-icon">${icon(data.icon || 'i-book', 'icon-lg')}</span>
        <span class="section-kicker">${data.eyebrow}</span>
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <a href="${data.featured[1]}">${data.featured[0]} <span aria-hidden="true">→</span></a>
      </div>
      <div class="mega-groups">
        ${data.groups.map(group => `
          <div class="mega-group">
            <h4>${group.heading}</h4>
            ${group.links.map(([text, url, desc]) => `
              <a class="mega-link" href="${url}">
                <span><strong>${text}</strong><small>${desc || ''}</small></span>
                <em aria-hidden="true">→</em>
              </a>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderDesktopNav(active) {
  return navItems.map(([key, label, href]) => {
    const hasMega = Boolean(megaMenuData[key]);
    const classes = `${active === key ? 'active' : ''}`.trim();

    if (hasMega) {
      return `
        <a class="${classes}" href="${href}" data-mega="${key}" aria-haspopup="true" aria-expanded="false">
          ${label}<span class="nav-caret" aria-hidden="true">
  <svg viewBox="0 0 20 20">
    <path d="M5.5 7.5 10 12l4.5-4.5"></path>
  </svg>
</span>
        </a>
      `;
    }

    return `<a class="${classes}" href="${href}">${label}</a>`;
  }).join('');
}

// ไอคอนของแต่ละเมนู ใช้ในแผงเมนูมือถือ/แท็บเล็ต
const navIcons = {
  home: 'i-home',
  dictionary: 'i-dictionary',
  knowledge: 'i-book',
  publications: 'i-ebook',
  news: 'i-megaphone',
  services: 'i-service',
  about: 'i-shield',
  contact: 'i-phone',
};

/* แผงเมนูสำหรับจอ <= 1365px (เลื่อนเข้าจากขวา) — ถูกวางไว้ท้าย <body>
   ไม่ใส่ไว้ใน .site-header เพราะ backdrop-filter ของ header ทำให้ position:fixed
   ข้างในไม่อิงกับหน้าจอ */
function renderDrawer(active) {
  const items = navItems.map(([key, label, href]) => {
    const data = megaMenuData[key];
    const isActive = active === key;
    const ico = `<span class="drawer-ico">${icon(navIcons[key] || 'i-book')}</span>`;

    if (!data) {
      return `
        <li>
          <a class="drawer-item${isActive ? ' is-active' : ''}" href="${href}"${isActive ? ' aria-current="page"' : ''}>
            ${ico}<span class="drawer-label">${label}</span>${icon('i-chevron', 'icon drawer-chev')}
          </a>
        </li>`;
    }

    // หมวดของหน้าที่เปิดอยู่ กางเมนูย่อยไว้ตั้งแต่แรก
    return `
      <li>
        <button class="drawer-item${isActive ? ' is-active' : ''}" type="button" data-drawer-sub
          aria-expanded="${isActive}" aria-controls="drawer-sub-${key}">
          ${ico}<span class="drawer-label">${label}</span>${icon('i-chevron', 'icon drawer-chev')}
        </button>
        <div class="drawer-sub${isActive ? ' is-open' : ''}" id="drawer-sub-${key}">
          <div class="drawer-sub-inner">
            <div class="drawer-sub-body">
              <a class="drawer-featured" href="${data.featured[1]}">${data.featured[0]} ${icon('i-arrow')}</a>
              ${data.groups.map(group => `
                <div class="drawer-sub-group">
                  <span class="drawer-sub-title">${group.heading}</span>
                  ${group.links.map(([text, url]) => `<a href="${url}">${text}</a>`).join('')}
                </div>`).join('')}
            </div>
          </div>
        </div>
      </li>`;
  }).join('');

  return `
    <div class="drawer" id="site-drawer" hidden>
      <div class="drawer-backdrop" data-drawer-close></div>
      <div class="drawer-panel" role="dialog" aria-modal="true" aria-label="เมนูหลัก">
        <div class="drawer-head">
          <a class="drawer-brand" href="${basePath}index.html" aria-label="สำนักงานราชบัณฑิตยสภา หน้าแรก">
            <img src="${basePath}assets/images/orst-emblem.png" alt="" aria-hidden="true" width="181" height="320">
            <span><span class="drawer-brand-th">สำนักงานราชบัณฑิตยสภา</span><span class="drawer-brand-en">Office of the Royal Society</span></span>
          </a>
          <button class="drawer-close" type="button" data-drawer-close aria-label="ปิดเมนู">${icon('i-x')}</button>
        </div>
        <button class="drawer-search" type="button" data-open-search>
          ${icon('i-search')}<span>ค้นหาคำศัพท์ บทความ หรือบริการ…</span>
        </button>
        <nav aria-label="เมนูนำทาง">
          <ul class="drawer-list">${items}</ul>
        </nav>
        <div class="drawer-foot">
          <a class="drawer-cta" href="${basePath}services.html">บริการออนไลน์ ${icon('i-arrow')}</a>
          <div class="drawer-links">
            <a href="#">สำหรับเจ้าหน้าที่</a>
            <a href="#">เข้าสู่ระบบ / สมัครสมาชิก</a>
            <a class="drawer-ext" href="${ROYAL_SOCIETY_URL}" target="_blank" rel="noopener noreferrer">ราชบัณฑิตยสภา ${icon('i-external')}<span class="sr-only">(เปิดในแท็บใหม่)</span></a>
          </div>
        </div>
      </div>
    </div>`;
}

function renderHeader() {
  const active = document.body.dataset.page || 'home';

  return `
    ${icons}
    <a class="skip-link" href="#main-content">ข้ามไปยังเนื้อหาหลัก</a>
    <div class="topbar">
      <div class="container topbar-inner">
        <div class="topbar-group">
          <button type="button" data-open-access>${icon('i-eye')} สำหรับผู้พิการทางสายตา</button>
          <button type="button" data-font="minus">ก-</button>
          <button type="button" data-font="reset">ก</button>
          <button type="button" data-font="plus">ก+</button>
          <button type="button" data-contrast>ความคมชัด</button>
        </div>
        <div class="topbar-group topbar-right">
          <a class="topbar-ext" href="${ROYAL_SOCIETY_URL}" target="_blank" rel="noopener noreferrer">ราชบัณฑิตยสภา ${icon('i-external')}<span class="sr-only">(เปิดในแท็บใหม่)</span></a>
          <a href="${basePath}contact.html">ติดต่อเรา</a>
          <a href="#">สำหรับเจ้าหน้าที่</a>
          <span>ภาษา TH | EN</span>
          <a href="#">เข้าสู่ระบบ / สมัครสมาชิก</a>
        </div>
      </div>
    </div>
    <header class="site-header" id="site-header">
      <div class="container header-inner">
        <a class="brand brand-image" href="${basePath}index.html" aria-label="สำนักงานราชบัณฑิตยสภา หน้าแรก">
          <img src="${basePath}assets/images/orst-emblem.png" alt="" aria-hidden="true" class="brand-emblem" width="181" height="320">
          <span class="brand-text">
            <span class="brand-text-th">สำนักงานราชบัณฑิตยสภา</span>
            <span class="brand-text-en">Office of the Royal Society</span>
          </span>
        </a>
        <nav class="main-nav" aria-label="เมนูหลัก">
          ${renderDesktopNav(active)}
        </nav>
        <div class="header-actions">
          <button class="round-btn" type="button" data-open-search aria-label="ค้นหา">${icon('i-search')} <span>ค้นหา</span></button>
          <a class="round-btn primary" href="${basePath}services.html">บริการออนไลน์</a>
          <button class="mobile-menu-btn" type="button" aria-expanded="false" aria-controls="site-drawer" aria-haspopup="dialog" data-drawer-open>
            <span></span><span></span><span></span><span class="sr-only">เปิดเมนู</span>
          </button>
        </div>
        <div class="mega-menu" id="mega-menu" hidden></div>
      </div>
    </header>
  `;
}

// function renderFooter() {
//   return `
//     <footer class="footer" id="footer">
//       <div class="container footer-grid">
//         <div>
//           <h3>ติดตามข่าวสารและองค์ความรู้ใหม่</h3>
//           <p>ไม่พลาดข่าวสาร กิจกรรม และองค์ความรู้จากราชบัณฑิตยสภา</p>
//           <form class="newsletter" onsubmit="return false">
//             <input type="email" placeholder="อีเมลของคุณ" aria-label="อีเมลสำหรับรับข่าวสาร">
//             <button class="round-btn primary" type="button">สมัครรับข่าวสาร</button>
//           </form>
//         </div>
//         <div>
//           <h3>ลิงก์ด่วน</h3>
//           <ul>
//             <li><a href="${basePath}dictionary.html">พจนานุกรม</a></li>
//             <li><a href="${basePath}knowledge.html">คลังความรู้</a></li>
//             <li><a href="${basePath}publications.html">สื่อสิ่งพิมพ์</a></li>
//             <li><a href="${basePath}news.html">ข่าวและประกาศ</a></li>
//           </ul>
//         </div>
//         <div>
//           <h3>บริการยอดนิยม</h3>
//           <ul>
//             <li><a href="${basePath}services.html">สอบถามข้อมูลทางวิชาการ</a></li>
//             <li><a href="${basePath}services.html">ขออนุญาตจัดพิมพ์</a></li>
//             <li><a href="${basePath}services.html">ร้องเรียน / เสนอแนะ</a></li>
//             <li><a href="${basePath}services.html">คำถามที่พบบ่อย</a></li>
//           </ul>
//         </div>
//         <div>
//           <h3>ติดต่อเรา</h3>
//           <p>สำนักงานราชบัณฑิตยสภา<br>ศูนย์ราชการเฉลิมพระเกียรติฯ อาคารซี ถนนแจ้งวัฒนะ เขตหลักสี่ กรุงเทพมหานคร 10210</p>
//           <p>โทรศัพท์: 0 2141 1728<br>อีเมล: saraban@orst.go.th</p>
//         </div>
//       </div>
//       <div class="container footer-bottom">
//         <span>© 2569 สำนักงานราชบัณฑิตยสภา</span>
//         <span>นโยบายความเป็นส่วนตัว · เงื่อนไขการใช้งาน · แผนผังเว็บไซต์</span>
//       </div>
//     </footer>

//     <button class="access-float" type="button" data-open-access>${icon('i-access')} ช่วยการเข้าถึง</button>

//     <div class="modal" id="search-modal" hidden role="dialog" aria-modal="true" aria-labelledby="search-title">
//       <div class="modal-backdrop" data-close-modal></div>
//       <div class="modal-card">
//         <div class="modal-header">
//           <h2 id="search-title">ค้นหาองค์ความรู้</h2>
//           <button class="modal-close" type="button" data-close-modal aria-label="ปิด">×</button>
//         </div>
//         <div class="modal-body">
//           <form class="shared-search-form" id="shared-search-form">
//             <input id="shared-search-input" type="search" placeholder="ค้นหาคำศัพท์ บทความ หนังสือ หรือบริการ...">
//             <button type="submit" aria-label="ค้นหา">${icon('i-search')}</button>
//           </form>
//           <div class="search-results" id="shared-search-results" aria-live="polite"></div>
//         </div>
//       </div>
//     </div>

//     <div class="modal" id="access-modal" hidden role="dialog" aria-modal="true" aria-labelledby="access-title">
//       <div class="modal-backdrop" data-close-modal></div>
//       <div class="modal-card">
//         <div class="modal-header">
//           <h2 id="access-title">เครื่องมือช่วยการเข้าถึง</h2>
//           <button class="modal-close" type="button" data-close-modal aria-label="ปิด">×</button>
//         </div>
//         <div class="modal-body">
//           <div class="tool-grid">
//             <button type="button" data-font="plus">ก+ เพิ่มตัวอักษร</button>
//             <button type="button" data-font="minus">ก- ลดตัวอักษร</button>
//             <button type="button" data-font="reset">ก ขนาดปกติ</button>
//             <button type="button" data-contrast>สีตัดกันสูง</button>
//             <button type="button" data-readable>โหมดอ่านง่าย</button>
//             <button type="button" data-motion>หยุดเคลื่อนไหว</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   `;
// }


function renderFooter() {
  return `
    <footer class="footer orst-footer" id="footer">
      <div class="container">

        <div class="orst-footer-top">
          <div class="orst-footer-brand">
            <a class="orst-footer-logo-wrap" href="${basePath}index.html" aria-label="สำนักงานราชบัณฑิตยสภา หน้าแรก">
              <img
                src="${basePath}assets/images/orst-emblem.png"
                alt=""
                aria-hidden="true"
                class="orst-footer-emblem"
                width="181" height="320"
                loading="lazy">
              <span class="orst-footer-wordmark">
                <span class="orst-footer-wordmark-th">สำนักงานราชบัณฑิตยสภา</span>
                <span class="orst-footer-wordmark-en">Office of the Royal Society</span>
              </span>
            </a>

            <p>
              แหล่งรวมองค์ความรู้ มาตรฐานภาษาไทย ศัพท์บัญญัติ สิ่งพิมพ์
              และบริการประชาชนของสำนักงานราชบัณฑิตยสภา
            </p>

            <div class="orst-footer-actions">
              <a class="orst-footer-primary" href="${basePath}knowledge.html">
                เข้าคลังองค์ความรู้
              </a>
              <a class="orst-footer-secondary" href="${basePath}services.html">
                บริการประชาชน
              </a>
            </div>
          </div>

          <div class="orst-footer-links">
            <div class="orst-footer-col">
              <h3>บริการหลัก</h3>
              <ul>
                <li><a href="${basePath}dictionary.html">พจนานุกรม</a></li>
                <li><a href="#">ศัพท์บัญญัติ</a></li>
                <li><a href="#">คำทับศัพท์</a></li>
                <li><a href="#">ราชาศัพท์</a></li>
              </ul>
            </div>

            <div class="orst-footer-col">
              <h3>องค์ความรู้</h3>
              <ul>
                <li><a href="${basePath}knowledge.html">คลังองค์ความรู้</a></li>
                <li><a href="${basePath}publications.html">สื่อและสิ่งพิมพ์</a></li>
                <li><a href="#">วารสาร</a></li>
                <li><a href="#">สื่อมัลติมีเดีย</a></li>
              </ul>
            </div>

            <div class="orst-footer-col">
              <h3>ข่าวและบริการ</h3>
              <ul>
                <li><a href="${basePath}news.html">ข่าวและประกาศ</a></li>
                <li><a href="${basePath}services.html">บริการออนไลน์</a></li>
                <li><a href="#">แบบฟอร์มออนไลน์</a></li>
                <li><a href="#">คำถามที่พบบ่อย</a></li>
              </ul>
            </div>

            <div class="orst-footer-col orst-footer-contact">
              <h3>ติดต่อเรา</h3>
              <p>
                สำนักงานราชบัณฑิตยสภา<br>
                ศูนย์ราชการเฉลิมพระเกียรติฯ อาคารซี<br>
                ถนนแจ้งวัฒนะ เขตหลักสี่ กรุงเทพมหานคร 10210
              </p>
              <p>
                โทรศัพท์: 0 2141 1728<br>
                อีเมล: saraban@orst.go.th
              </p>
            </div>
          </div>
        </div>

        

        <div class="orst-footer-bottom">
          <span>© 2026 สำนักงานราชบัณฑิตยสภา</span>

          <nav aria-label="ลิงก์นโยบายเว็บไซต์">
            <a href="#">นโยบายความเป็นส่วนตัว</a>
            <a href="#">เงื่อนไขการใช้งาน</a>
            <a href="#">แผนผังเว็บไซต์</a>
          </nav>
        </div>

      </div>
    </footer>

    <button class="access-float" type="button" data-open-access>${icon('i-access')} ช่วยการเข้าถึง</button>

    <div class="modal" id="search-modal" hidden role="dialog" aria-modal="true" aria-labelledby="search-title">
      <div class="modal-backdrop" data-close-modal></div>
      <div class="modal-card">
        <div class="modal-header">
          <h2 id="search-title">ค้นหาองค์ความรู้</h2>
          <button class="modal-close" type="button" data-close-modal aria-label="ปิด">×</button>
        </div>
        <div class="modal-body">
          <form class="shared-search-form" id="shared-search-form">
            <input id="shared-search-input" type="search" placeholder="ค้นหาคำศัพท์ บทความ หนังสือ หรือบริการ...">
            <button type="submit" aria-label="ค้นหา">${icon('i-search')}</button>
          </form>
          <div class="search-results" id="shared-search-results" aria-live="polite"></div>
        </div>
      </div>
    </div>

    <div class="modal" id="access-modal" hidden role="dialog" aria-modal="true" aria-labelledby="access-title">
      <div class="modal-backdrop" data-close-modal></div>
      <div class="modal-card">
        <div class="modal-header">
          <h2 id="access-title">เครื่องมือช่วยการเข้าถึง</h2>
          <button class="modal-close" type="button" data-close-modal aria-label="ปิด">×</button>
        </div>
        <div class="modal-body">
          <div class="tool-grid">
            <button type="button" data-font="plus">ก+ เพิ่มตัวอักษร</button>
            <button type="button" data-font="minus">ก- ลดตัวอักษร</button>
            <button type="button" data-font="reset">ก ขนาดปกติ</button>
            <button type="button" data-contrast>สีตัดกันสูง</button>
            <button type="button" data-readable>โหมดอ่านง่าย</button>
            <button type="button" data-motion>หยุดเคลื่อนไหว</button>
          </div>
        </div>
      </div>
    </div>
  `;
}



function initMegaMenu() {
  const mega = document.querySelector('#mega-menu');
  const links = Array.from(document.querySelectorAll('[data-mega]'));
  if (!mega || !links.length) return;

  let closeTimer;
  let currentKey = '';

  function setOpenState(key, isOpen) {
    links.forEach(link => {
      const open = isOpen && link.dataset.mega === key;
      link.classList.toggle('is-open', open);
      link.setAttribute('aria-expanded', String(open));
    });
  }

  function openMega(key) {
    const html = renderMegaMenu(key);
    if (!html) return;
    currentKey = key;
    mega.innerHTML = html;
    mega.hidden = false;
    setOpenState(key, true);
  }

  function closeMega() {
    currentKey = '';
    mega.hidden = true;
    mega.innerHTML = '';
    setOpenState('', false);
  }

  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      clearTimeout(closeTimer);
      openMega(link.dataset.mega);
    });

    link.addEventListener('focus', () => {
      clearTimeout(closeTimer);
      openMega(link.dataset.mega);
    });

    link.addEventListener('click', event => {
      const key = link.dataset.mega;
      if (!megaMenuData[key]) return;

      event.preventDefault();
      clearTimeout(closeTimer);
      if (!mega.hidden && currentKey === key) {
        closeMega();
      } else {
        openMega(key);
      }
    });
  });

  const header = document.querySelector('#site-header');
  header?.addEventListener('mouseleave', () => {
    closeTimer = setTimeout(closeMega, 180);
  });

  mega.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  mega.addEventListener('mouseleave', () => {
    closeTimer = setTimeout(closeMega, 180);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMega();
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('#site-header')) closeMega();
  });
}

function initDrawer() {
  const btn = document.querySelector('[data-drawer-open]');
  const drawer = document.getElementById('site-drawer');
  if (!btn || !drawer) return;

  const panel = drawer.querySelector('.drawer-panel');
  const noMotion = () => document.body.classList.contains('no-motion')
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let hideTimer;

  function open() {
    clearTimeout(hideTimer);
    drawer.hidden = false;
    document.documentElement.classList.add('drawer-lock');
    void drawer.offsetWidth;            // บังคับ reflow ให้ transition เริ่มจากสถานะปิด
    drawer.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    drawer.querySelector('.drawer-close').focus({ preventScroll: true });
  }

  function close(restoreFocus = true) {
    if (drawer.hidden) return;
    drawer.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('drawer-lock');
    hideTimer = setTimeout(() => { drawer.hidden = true; }, noMotion() ? 0 : 280);
    if (restoreFocus) btn.focus({ preventScroll: true });   // คืนโฟกัสให้ปุ่มเมนู
  }

  btn.addEventListener('click', open);
  drawer.querySelectorAll('[data-drawer-close]').forEach(el => el.addEventListener('click', () => close()));
  // ปุ่มค้นหาในแผง: ปิดแผงก่อน แล้วโมดัลค้นหา (initSharedModals) จะเปิดต่อ
  drawer.querySelector('[data-open-search]')?.addEventListener('click', () => close(false));

  drawer.addEventListener('keydown', event => {
    if (event.key === 'Escape') { close(); return; }
    if (event.key !== 'Tab') return;
    // วนโฟกัสอยู่ในแผงขณะเปิด
    const items = [...panel.querySelectorAll('a[href], button:not([disabled])')]
      .filter(el => el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden');
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  drawer.querySelectorAll('[data-drawer-sub]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      document.getElementById(toggle.getAttribute('aria-controls'))?.classList.toggle('is-open', !expanded);
    });
  });

  // ขยายจอเป็นเดสก์ท็อป (ตรงกับ breakpoint ใน CSS) -> ปิดแผงอัตโนมัติ
  const desktopMq = window.matchMedia('(min-width: 1366px)');
  const closeOnDesktop = () => { if (desktopMq.matches) close(false); };
  desktopMq.addEventListener('change', closeOnDesktop);
  window.addEventListener('resize', closeOnDesktop);
}

function initSharedModals() {
  const searchModal = document.querySelector('#search-modal');
  const accessModal = document.querySelector('#access-modal');

  document.querySelectorAll('[data-open-search]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!searchModal) return;
      searchModal.hidden = false;
      setTimeout(() => document.querySelector('#shared-search-input')?.focus(), 40);
    });
  });

  document.querySelectorAll('[data-open-access]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!accessModal) return;
      accessModal.hidden = false;
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal) modal.hidden = true;
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.modal:not([hidden])').forEach(modal => { modal.hidden = true; });
  });
}

function initSharedSearch() {
  const form = document.querySelector('#shared-search-form');
  const input = document.querySelector('#shared-search-input');
  const results = document.querySelector('#shared-search-results');
  if (!form || !input || !results) return;

  const sampleResults = [
    ['พจนานุกรมออนไลน์', 'ค้นความหมายและการใช้คำภาษาไทย', `${basePath}dictionary.html`],
    ['คลังองค์ความรู้', 'บทความ วารสาร เอกสาร และองค์ความรู้สำหรับประชาชน', `${basePath}knowledge.html`],
    ['บริการประชาชน', 'สอบถามข้อมูลทางวิชาการและติดตามสถานะ', `${basePath}services.html`]
  ];

  form.addEventListener('submit', event => {
    event.preventDefault();
    const keyword = input.value.trim();

    results.innerHTML = sampleResults.map(([title, desc, url]) => `
      <a class="search-result-item" href="${url}">
        <strong>${title}</strong><br>
        <small>${desc}${keyword ? ` · คำค้น: ${keyword}` : ''}</small>
      </a>
    `).join('');
  });
}

let componentFontStep = 0;
function initSharedAccessibility() {
  // ขนาดฐานอ่านจาก CSS ตอนเริ่ม (ตอนนี้ 17px) — ถ้าเปลี่ยนฐานใน CSS ปุ่ม ก-/ก/ก+ จะตามเอง
  const baseFontPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 17;
  document.querySelectorAll('[data-font]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.font;
      if (mode === 'plus') componentFontStep = Math.min(componentFontStep + 1, 3);
      if (mode === 'minus') componentFontStep = Math.max(componentFontStep - 1, -2);
      if (mode === 'reset') componentFontStep = 0;
      if (componentFontStep === 0) document.documentElement.style.removeProperty('font-size');
      else document.documentElement.style.fontSize = `${baseFontPx + componentFontStep}px`;
    });
  });

  document.querySelectorAll('[data-contrast]').forEach(btn => {
    btn.addEventListener('click', () => document.body.classList.toggle('high-contrast'));
  });

  document.querySelectorAll('[data-readable]').forEach(btn => {
    btn.addEventListener('click', () => document.body.classList.toggle('readable-mode'));
  });

  document.querySelectorAll('[data-motion]').forEach(btn => {
    btn.addEventListener('click', () => document.body.classList.toggle('no-motion'));
  });
}

function initNewsEventsTabs() {
  const tabs = document.querySelectorAll('[data-news-tab]');
  const panels = document.querySelectorAll('[data-news-panel]');
  const viewAllLink = document.querySelector('#news-view-all-link');

  if (!tabs.length || !panels.length) return;

  const links = {
    news: 'news.html?type=news',
    training: 'news.html?type=training',
    event: 'news.html?type=event',
    announcement: 'news.html?type=announcement'
  };

  const labels = {
    news: 'ดูข่าวเพิ่มเติม →',
    training: 'ดูอบรมเพิ่มเติม →',
    event: 'ดูกิจกรรมเพิ่มเติม →',
    announcement: 'ดูประกาศเพิ่มเติม →'
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.newsTab;

      tabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });

      panels.forEach(panel => {
        const active = panel.dataset.newsPanel === target;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });

      if (viewAllLink) {
        viewAllLink.href = links[target] || 'news.html?type=news';
        viewAllLink.textContent = labels[target] || 'ดูข่าวเพิ่มเติม →';
      }
    });
  });
}




function initMediaTabs() {
  const mediaTabs = document.querySelectorAll('[data-media-tab]');
  const mediaPanels = document.querySelectorAll('[data-media-panel]');
  const mediaViewAllLink = document.querySelector('#media-view-all-link');

  if (!mediaTabs.length || !mediaPanels.length) return;

  const mediaLinks = {
    encyclopedia: 'encyclopedia.html',
    research: 'research.html',
    multimedia: 'multimedia.html'
  };

  const mediaLabels = {
    encyclopedia: 'ดู Encyclopedia ทั้งหมด →',
    research: 'ดู Research ทั้งหมด →',
    multimedia: 'ดู Multimedia ทั้งหมด →'
  };

  mediaTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.mediaTab;

      mediaTabs.forEach(item => {
        const isActive = item === tab;

        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', String(isActive));
        item.tabIndex = isActive ? 0 : -1;
      });

      mediaPanels.forEach(panel => {
        const isActive = panel.dataset.mediaPanel === target;

        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
      });

      if (mediaViewAllLink) {
        mediaViewAllLink.href = mediaLinks[target] || mediaViewAllLink.getAttribute('href');
        mediaViewAllLink.textContent = mediaLabels[target] || 'ดูทั้งหมด →';
      }

      const activePanel = document.querySelector(`[data-media-panel="${target}"]`);
      const scrollRow = activePanel?.querySelector('.publication-row, .media-row');

      if (scrollRow) {
        scrollRow.scrollLeft = 0;
      }
    });
  });
}


function initCompactFAQ() {
  document.querySelectorAll('.faq-compact-list .faq-q').forEach(button => {
    // กันผูก event ซ้ำ กรณีถูกเรียกอีกรอบหลังเพิ่มเนื้อหาใหม่เข้า DOM
    if (button.dataset.faqBound === '1') return;
    button.dataset.faqBound = '1';
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const answer = item?.querySelector('.faq-a');
      const expanded = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', String(!expanded));
      if (answer) answer.hidden = expanded;
    });
  });
}

/* -----------------------------------------------------------------------------
   Sticky header — คำนวณความสูงของ #app-header (ซึ่ง CSS ตั้งเป็น position:fixed)
   แล้วเก็บไว้ใน --fixed-header-height เพื่อดัน padding-top ให้ <body>
   ทุกหน้าที่มี #app-header จะได้พฤติกรรมนี้อัตโนมัติ ไม่ต้องเขียนซ้ำในหน้าใหม่
   (เดิมโค้ดชุดนี้ถูก copy ไว้ใน index/knowledge/contact แยกกันคนละชุด)
   -------------------------------------------------------------------------- */
function syncFixedHeaderHeight() {
  const header = document.getElementById('app-header');
  if (!header) return;

  document.body.classList.add('has-fixed-header');

  const height = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--fixed-header-height', height + 'px');

  header.classList.toggle('is-scrolled', window.scrollY > 8);
}

function initFixedHeader() {
  const header = document.getElementById('app-header');
  if (!header) return;

  window.addEventListener('load', syncFixedHeaderHeight);
  window.addEventListener('resize', syncFixedHeaderHeight);
  window.addEventListener('scroll', syncFixedHeaderHeight, { passive: true });

  syncFixedHeaderHeight();

  if ('ResizeObserver' in window) {
    new ResizeObserver(syncFixedHeaderHeight).observe(header);
  }

  // header สูงขึ้นได้หลังฟอนต์/รูปโหลดเสร็จ จึงวัดซ้ำอีก 2 รอบ
  setTimeout(syncFixedHeaderHeight, 100);
  setTimeout(syncFixedHeaderHeight, 400);
}

function initComponents() {
  const headerMount = document.getElementById('app-header');
  const footerMount = document.getElementById('app-footer');

  if (headerMount) {
    headerMount.innerHTML = renderHeader();
    document.body.insertAdjacentHTML('beforeend', renderDrawer(document.body.dataset.page || 'home'));
  }
  if (footerMount) {
    footerMount.innerHTML = renderFooter();
    // หน้าที่มีปุ่มลอย "ช่วยการเข้าถึง" ของตัวเอง (index.html) ไม่ต้องมีปุ่มกลางซ้อนซ้ำ
    const ownFloat = [...document.querySelectorAll('.access-float')].some(b => !footerMount.contains(b));
    if (ownFloat) footerMount.querySelector('.access-float')?.remove();
  }

  initMegaMenu();
  initDrawer();
  initSharedModals();
  initSharedSearch();
  initMediaTabs();
  initCompactFAQ();
  initNewsEventsTabs();
  initSharedAccessibility();
  initFixedHeader();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initComponents);
} else {
  initComponents();
}

window.orstHeader = {
  basePath,
  navItems,
  megaMenuData,
  renderMegaMenu,
  renderHeader,
  renderFooter,
  syncFixedHeaderHeight,
  // เรียกซ้ำได้หลังจากเพิ่มเนื้อหาเข้า DOM ทีหลัง (เช่น หน้าที่ render จาก JSON)
  bindDynamicContent() {
    initCompactFAQ();
    initMediaTabs();
    initNewsEventsTabs();
    syncFixedHeaderHeight();
  },
};
