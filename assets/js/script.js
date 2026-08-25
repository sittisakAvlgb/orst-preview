const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];
let fontStep = 0;

const mockResults = [
  ['พจนานุกรมฉบับราชบัณฑิตยสถาน', 'คำศัพท์และความหมายภาษาไทยมาตรฐาน'],
  ['ศัพท์บัญญัติ', 'ศัพท์เฉพาะทางและคำมาตรฐาน'],
  ['วารสารราชบัณฑิตยสภา', 'บทความวิชาการและสิ่งพิมพ์ล่าสุด'],
  ['บริการสอบถามข้อมูลทางวิชาการ', 'ส่งคำถามถึงสำนักงานผ่านแบบฟอร์มออนไลน์']
];

function initApp() {
  initHeader();
  initMobileMenu();
  initModals();
  initAccessibility();
  initSearch();
}

function initHeader() {
  const header = qs('#site-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 16);
  });
}

function initMobileMenu() {
  const btn = qs('[data-mobile-menu]');
  const menu = qs('#mobile-menu');
  btn?.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  });
}

function initModals() {
  qsa('[data-open-search]').forEach(btn => btn.addEventListener('click', () => openModal('search-modal')));
  qsa('[data-open-access]').forEach(btn => btn.addEventListener('click', () => openModal('access-modal')));
  qsa('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal'))));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') qsa('.modal:not([hidden])').forEach(closeModal);
  });
}

function openModal(id) {
  const modal = qs('#' + id);
  if (!modal) return;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => qs('input,button,a', modal)?.focus(), 20);
}

function closeModal(modal) {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
}

function initAccessibility() {
  qsa('[data-font]').forEach(btn => btn.addEventListener('click', () => {
    const action = btn.dataset.font;
    if (action === 'plus') fontStep = Math.min(3, fontStep + 1);
    if (action === 'minus') fontStep = Math.max(-2, fontStep - 1);
    if (action === 'reset') fontStep = 0;
    document.documentElement.style.fontSize = `${16 + fontStep}px`;
  }));
  qsa('[data-contrast]').forEach(btn => btn.addEventListener('click', () => document.body.classList.toggle('high-contrast')));
  qsa('[data-readable]').forEach(btn => btn.addEventListener('click', () => document.body.classList.toggle('readable-mode')));
  qsa('[data-motion]').forEach(btn => btn.addEventListener('click', () => document.body.classList.toggle('no-motion')));
}

function initSearch() {
  const form = qs('#shared-search-form');
  const input = qs('#shared-search-input');
  const results = qs('#shared-search-results');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    const list = query ? mockResults : mockResults.slice(0, 2);
    results.innerHTML = list.map(([title, desc]) => `
      <article class="result-card">
        <strong>${title}</strong><br>
        <span>${desc}</span>
      </article>
    `).join('');
  });
}

initApp();
