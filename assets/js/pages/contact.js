/* =============================================================================
   pages/contact.js — สคริปต์เฉพาะหน้า ติดต่อเรา (contact.html)
   -----------------------------------------------------------------------------
   ต้องโหลด "หลัง" assets/js/components.js เสมอ
   เนื้อหาด้านล่างยกมาจาก <script> ที่เคยฝังในไฟล์ HTML (2 บล็อก)
   โดยไม่แก้ตรรกะใด ๆ เพื่อรักษาพฤติกรรมเดิม
   ============================================================================= */

/* ---------- block 1/2 ---------- */
/* sticky header: ย้ายไปอยู่ที่ assets/js/components.js -> initFixedHeader() */

/* ---------- block 2/2 ---------- */
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];

function showToast(text) {
  const toast = qs('#toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function initMobileMenu() {
  const btn = qs('[data-mobile-menu]');
  const menu = qs('#mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  });
}

function initCopy() {
  qsa('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy || '';
      try {
        await navigator.clipboard.writeText(text);
        showToast('คัดลอกข้อมูลแล้ว');
      } catch (e) {
        showToast('ไม่สามารถคัดลอกได้');
      }
    });
  });
}

function initForm() {
  const form = qs('#message-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    showToast('ส่งข้อความเรียบร้อยแล้ว');
    form.reset();
  });
}

function initReveal() {
  const items = qsa('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(i => i.classList.add('is-visible'));
    return;
  }
  const ob = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      ob.unobserve(entry.target);
    }
  }), { threshold: .12 });
  items.forEach(i => ob.observe(i));
}

initMobileMenu();
initCopy();
initForm();
initReveal();
