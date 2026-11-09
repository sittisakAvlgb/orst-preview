/* =============================================================================
   pages/knowledge.js — สคริปต์เฉพาะหน้า คลังองค์ความรู้ (knowledge.html)
   -----------------------------------------------------------------------------
   ต้องโหลด "หลัง" assets/js/components.js เสมอ
   สารบัญ
     init() -> initMobileMenu, initReveal, initSearch, initFilter, initView, initTopTools
     - ค้นหา/กรองรายการในคลังองค์ความรู้ (ข้อมูลจำลองอยู่ในหน้า HTML)
     - สลับมุมมอง grid / list และเครื่องมือปรับขนาดตัวอักษร
   ============================================================================= */

/* sticky header: ย้ายไปอยู่ที่ assets/js/components.js -> initFixedHeader() */

const qs = (s, r = document) => r ? r.querySelector(s) : null;
const qsa = (s, r = document) => r ? [...r.querySelectorAll(s)] : [];
let activeCategory = 'all'; let fontStep = 0;

function init() { initMobileMenu(); initReveal(); initSearch(); initFilter(); initView(); initTopTools(); }

function initMobileMenu() {
    const b = qs('[data-mobile-menu]');
    const m = qs('#mobile-menu');

    if (!b || !m) return;

    b.addEventListener('click', () => {
        const open = !m.classList.contains('is-open');
        m.classList.toggle('is-open', open);
        b.setAttribute('aria-expanded', String(open));
    });

    qsa('a,button', m).forEach(x => {
        x.addEventListener('click', () => {
            m.classList.remove('is-open');
            b.setAttribute('aria-expanded', 'false');
        });
    });
}
function initReveal() { const items = qsa('.reveal'); if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('is-visible')); return } const ob = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); ob.unobserve(e.target) } }), { threshold: .12 }); items.forEach(i => ob.observe(i)); }
function initSearch() {
    const main = qs('#main-search');
    const content = qs('#content-search');
    const form = qs('#hero-search-form');
    const knowledgeContent = qs('#knowledge-content');

    if (form && main && content) {
        form.addEventListener('submit', e => {
            e.preventDefault();

            content.value = main.value.trim();
            applyFilters();

            knowledgeContent?.scrollIntoView({
                behavior: reduce() ? 'auto' : 'smooth',
                block: 'start'
            });
        });
    }

    qsa('[data-query]').forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.dataset.query || '';

            if (main) main.value = query;
            if (content) content.value = query;

            applyFilters();

            knowledgeContent?.scrollIntoView({
                behavior: reduce() ? 'auto' : 'smooth',
                block: 'start'
            });
        });
    });

    content?.addEventListener('input', applyFilters);

    qsa('[data-focus-main-search]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!main) return;

            main.focus();
            main.scrollIntoView({
                behavior: reduce() ? 'auto' : 'smooth',
                block: 'center'
            });
        });
    });
}
function initFilter() { qsa('[data-category]').forEach(btn => btn.addEventListener('click', () => { activeCategory = btn.dataset.category; qsa('.category-btn').forEach(x => x.classList.toggle('active', x.dataset.category === activeCategory)); applyFilters(); if (btn.classList.contains('path-card')) qs('#knowledge-content').scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth' }); })); qsa('[data-type]').forEach(input => input.addEventListener('change', applyFilters)); qs('#sort-select')?.addEventListener('change', applyFilters); qsa('[data-reset]').forEach(btn => btn.addEventListener('click', () => { activeCategory = 'all'; qsa('.category-btn').forEach(x => x.classList.toggle('active', x.dataset.category === 'all')); qsa('[data-type]').forEach(x => x.checked = x.dataset.type === 'article'); qs('#content-search').value = ''; qs('#main-search').value = ''; applyFilters(); })); qsa('[data-scroll-filter]').forEach(btn => btn.addEventListener('click', () => qs('#filter-panel').scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' }))); }
function initView() { const grid = qs('#knowledge-grid'); qsa('[data-view]').forEach(btn => btn.addEventListener('click', () => { qsa('[data-view]').forEach(x => x.classList.toggle('active', x === btn)); grid.classList.toggle('list-view', btn.dataset.view === 'list'); })); }
function applyFilters() { const q = (qs('#content-search')?.value || '').trim().toLowerCase(); const checked = qsa('[data-type]:checked').map(x => x.dataset.type); let cards = qsa('.knowledge-card'); cards.sort((a, b) => { const sort = qs('#sort-select')?.value || 'latest'; if (sort === 'popular') return Number(b.dataset.popular) - Number(a.dataset.popular); if (sort === 'az') return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'th'); return Number(b.dataset.date) - Number(a.dataset.date); }).forEach(c => qs('#knowledge-grid').appendChild(c)); let visible = 0; cards.forEach(card => { const matchCat = activeCategory === 'all' || card.dataset.category === activeCategory; const matchType = !checked.length || checked.includes(card.dataset.type); const text = (card.dataset.title + ' ' + card.textContent).toLowerCase(); const matchText = !q || text.includes(q); const show = matchCat && matchType && matchText; card.style.display = show ? 'block' : 'none'; if (show) visible++; }); qs('#result-count').textContent = visible ? `พบ ${visible} รายการที่เกี่ยวข้อง` : 'ไม่พบรายการที่ตรงกับเงื่อนไข'; qs('#empty-state').classList.toggle('show', visible === 0); showToast('อัปเดตผลลัพธ์แล้ว'); }
function initTopTools() { qsa('[data-font]').forEach(btn => btn.addEventListener('click', () => { const a = btn.dataset.font; if (a === 'plus') fontStep = Math.min(3, fontStep + 1); if (a === 'minus') fontStep = Math.max(-2, fontStep - 1); if (a === 'reset') fontStep = 0; document.documentElement.style.setProperty('--base-size', `${18 + fontStep}px`); })); qsa('[data-motion]').forEach(btn => btn.addEventListener('click', () => document.body.classList.toggle('no-motion'))); }
let toastTimer; function showToast(msg) { const t = qs('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1200) }
function reduce() { return document.body.classList.contains('no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches }
init();
