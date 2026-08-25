/* =============================================================================
   advanced-search-modal.js — โค้ด "ค้นหาขั้นสูง" ที่ยังไม่ได้ใช้งาน (เก็บถาวร)
   -----------------------------------------------------------------------------
   ทำไมถึงย้ายออกมา
     โค้ด 3 ชุดนี้ผูกกับ element id="advanced-modal" ซึ่ง "ไม่มีอยู่ในหน้าเว็บ"
     (markup ของ modal ถูก comment ทิ้งไว้ตั้งแต่ต้น เหลือแค่ปุ่มเปิดที่ก็ถูก
      comment ไว้เช่นกัน) ทุกชุดจึง return ออกทันทีและไม่ทำงานเลย

   ถ้าจะทำฟีเจอร์นี้ต่อ ต้องมี 3 ส่วน
     1. markup  : ดูตัวอย่างปุ่มเปิดได้ที่ _archive/removed-commented-sections.html
                  ส่วน markup ของตัว modal ต้องสร้างใหม่ (ของเดิมไม่หลงเหลือ)
     2. style   : ยังอยู่ครบใน assets/css/pages/home.css
                  ค้นคำว่า "ORST Smart Advanced Search Modal"
     3. script  : เลือกใช้ชุดใดชุดหนึ่งด้านล่าง (แนะนำชุด B ที่ครบที่สุด)

   element ที่โค้ดด้านล่างคาดหวัง
     #advanced-modal .orst-advanced-backdrop   [data-modal-open="advanced-modal"]
     #advanced-form  #advanced-q  #advanced-preview  #advanced-clear
     input[name="adv-type"] ใน .orst-type-card
     #advanced-year  #advanced-source  #advanced-format
     #advanced-fuzzy  #advanced-downloadable  #advanced-official
   ============================================================================= */

/* ===== ชุด A — เวอร์ชันยาว: preview + ส่งค่าไปยังช่องค้นหาหลัก ===== */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('#advanced-modal');
  const form = document.querySelector('#advanced-form');
  const q = document.querySelector('#advanced-q');
  const clearBtn = document.querySelector('#advanced-clear');
  const preview = document.querySelector('#advanced-preview');
  const typeCards = document.querySelectorAll('.orst-type-card');
  const typeInputs = document.querySelectorAll('input[name="adv-type"]');
  const year = document.querySelector('#advanced-year');
  const source = document.querySelector('#advanced-source');
  const format = document.querySelector('#advanced-format');
  const fuzzy = document.querySelector('#advanced-fuzzy');
  const downloadable = document.querySelector('#advanced-downloadable');
  const official = document.querySelector('#advanced-official');

  if (!form || !q) return;

  const typeText = {
    all: 'ทุกประเภท',
    term: 'คำศัพท์',
    dictionary: 'พจนานุกรม',
    journal: 'วารสาร',
    article: 'บทความ',
    document: 'เอกสาร'
  };

  const sourceText = {
    all: 'ทุกฐานข้อมูล',
    dictionary: 'ฐานพจนานุกรม',
    terminology: 'ฐานศัพท์บัญญัติ',
    archive: 'คลังเอกสารเก่า',
    ebook: 'หนังสือและ E-BOOK'
  };

  const formatText = {
    all: 'ทุกรูปแบบ',
    web: 'หน้าเว็บไซต์',
    pdf: 'PDF',
    ebook: 'E-BOOK',
    image: 'ภาพ/สแกนเอกสาร'
  };

  function getType() {
    return document.querySelector('input[name="adv-type"]:checked')?.value || 'all';
  }

  function updateTypeCards() {
    typeCards.forEach(card => {
      const input = card.querySelector('input');
      card.classList.toggle('is-active', input?.checked);
    });
  }

  function updatePreview() {
    const query = q.value.trim();
    const selectedType = getType();
    const selectedYear = year?.value || 'all';
    const selectedSource = source?.value || 'all';
    const selectedFormat = format?.value || 'all';

    const parts = [];
    parts.push(query ? `คำค้น “${query}”` : 'ยังไม่ได้ระบุคำค้น');
    parts.push(typeText[selectedType] || selectedType);
    parts.push(selectedYear === 'all' ? 'ทุกปี' : `ปี ${selectedYear}`);
    parts.push(sourceText[selectedSource] || selectedSource);
    parts.push(formatText[selectedFormat] || selectedFormat);

    const smart = [];
    if (fuzzy?.checked) smart.push('ค้นคำใกล้เคียง');
    if (downloadable?.checked) smart.push('เฉพาะดาวน์โหลดได้');
    if (official?.checked) smart.push('มีแหล่งอ้างอิง');

    preview.innerHTML = `
    <span>ตัวอย่างการค้นหา</span>
    <strong>${parts.join(' • ')}${smart.length ? ' • ' + smart.join(' • ') : ''}</strong>
  `;
  }

  typeInputs.forEach(input => {
    input.addEventListener('change', () => {
      updateTypeCards();
      updatePreview();
    });
  });

  [q, year, source, format, fuzzy, downloadable, official].forEach(el => {
    el?.addEventListener('input', updatePreview);
    el?.addEventListener('change', updatePreview);
  });

  document.querySelectorAll('[data-adv-query]').forEach(button => {
    button.addEventListener('click', () => {
      q.value = button.dataset.advQuery || '';
      q.focus();
      updatePreview();
    });
  });

  clearBtn?.addEventListener('click', () => {
    q.value = '';
    q.focus();
    updatePreview();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    const query = q.value.trim();
    const selectedType = getType();

    const globalSearch = document.querySelector('#global-search');
    const inlineSearch = document.querySelector('#results-inline-search');
    const knowledgeSection = document.querySelector('#knowledge');

    if (globalSearch) globalSearch.value = query;
    if (inlineSearch) {
      inlineSearch.value = query;
      inlineSearch.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (knowledgeSection) {
      knowledgeSection.hidden = false;
    }

    const mainForm = document.querySelector('#search-form');
    if (mainForm) {
      mainForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }

    setTimeout(() => {
      if (selectedType !== 'all') {
        const filterButton =
          document.querySelector(`.orst-filter-row [data-filter="${selectedType}"]`) ||
          document.querySelector(`.filter-row [data-filter="${selectedType}"]`);
        filterButton?.click();
      }

      knowledgeSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    modal.hidden = true;
    document.body.classList.remove('modal-open');
  });

  // เติมคำค้นจากช่องหลักเมื่อเปิด modal
  document.querySelectorAll('[data-modal-open="advanced-modal"]').forEach(button => {
    button.addEventListener('click', () => {
      const globalSearch = document.querySelector('#global-search');
      if (globalSearch?.value && !q.value) {
        q.value = globalSearch.value;
      }
      setTimeout(() => q.focus(), 120);
      updatePreview();
    });
  });

  updateTypeCards();
  updatePreview();
});


/* ===== ชุด B — เวอร์ชันครบ: เปิด/ปิด + preview + submit (แนะนำ) ===== */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('#advanced-modal.orst-advanced-modal');
  if (!modal) return;

  const openBtns = document.querySelectorAll('[data-modal-open="advanced-modal"]');
  const closeBtns = modal.querySelectorAll('[data-modal-close]');

  function openModal() {
    modal.hidden = false;
    modal.scrollTop = 0;
    document.body.classList.add('orst-modal-open');
    setTimeout(() => modal.querySelector('#advanced-q')?.focus(), 120);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('orst-modal-open');
  }

  openBtns.forEach(b => b.addEventListener('click', e => { e.preventDefault(); openModal(); }));
  closeBtns.forEach(b => b.addEventListener('click', closeModal));
  modal.addEventListener('click', e => { if (e.target.matches('.orst-advanced-backdrop')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  // Live preview update
  const form = modal.querySelector('#advanced-form');
  const q = modal.querySelector('#advanced-q');
  const typeInputs = modal.querySelectorAll('input[name="adv-type"]');
  const year = modal.querySelector('#advanced-year');
  const source = modal.querySelector('#advanced-source');
  const format = modal.querySelector('#advanced-format');
  const fuzzy = modal.querySelector('#advanced-fuzzy');
  const downloadable = modal.querySelector('#advanced-downloadable');
  const official = modal.querySelector('#advanced-official');
  const preview = modal.querySelector('#advanced-preview');

  function getType() { return [...typeInputs].find(i => i.checked)?.value || 'all'; }
  function updateTypeCard() { typeInputs.forEach(i => i.closest('.orst-type-card')?.classList.toggle('is-active', i.checked)); }

  function updatePreview() {
    const parts = [];
    parts.push(q.value ? q.value : 'ยังไม่ได้ระบุคำค้น');
    parts.push(getType());
    parts.push(year.value === 'all' ? 'ทุกปี' : `ปี ${year.value}`);
    parts.push(source.value);
    parts.push(format.value);
    const smart = [];
    if (fuzzy.checked) smart.push('ค้นคำใกล้เคียง');
    if (downloadable.checked) smart.push('เฉพาะดาวน์โหลดได้');
    if (official.checked) smart.push('มีแหล่งอ้างอิง');
    preview.innerHTML = `<span>ตัวอย่างการค้นหา</span><strong>${parts.join(' • ')}${smart.length ? ' • ' + smart.join(' • ') : ''}</strong>`;
  }

  typeInputs.forEach(i => i.addEventListener('change', () => { updateTypeCard(); updatePreview(); }));
  [q, year, source, format, fuzzy, downloadable, official].forEach(e => { e?.addEventListener('input', updatePreview); e?.addEventListener('change', updatePreview); });
  updateTypeCard(); updatePreview();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const query = q.value;
    const globalSearch = document.querySelector('#global-search');
    const inlineSearch = document.querySelector('#results-inline-search');
    if (globalSearch) globalSearch.value = query;
    if (inlineSearch) { inlineSearch.value = query; inlineSearch.dispatchEvent(new Event('input', { bubbles: true })); }
    closeModal();
  });
});


/* ===== ชุด C — เวอร์ชันสั้น: เปิด/ปิดอย่างเดียว ===== */
document.addEventListener('DOMContentLoaded', () => {
  const advancedModal = document.querySelector('#advanced-modal.orst-advanced-modal');
  if (!advancedModal) return;

  const openButtons = document.querySelectorAll('[data-modal-open="advanced-modal"]');
  const closeButtons = advancedModal.querySelectorAll('[data-modal-close]');

  function openAdvancedModal() {
    advancedModal.hidden = false;
    advancedModal.scrollTop = 0;
    document.documentElement.classList.add('orst-modal-open');
    document.body.classList.add('orst-modal-open');

    const input = advancedModal.querySelector('#advanced-q');
    setTimeout(() => input?.focus(), 120);
  }

  function closeAdvancedModal() {
    advancedModal.hidden = true;
    document.documentElement.classList.remove('orst-modal-open');
    document.body.classList.remove('orst-modal-open');
  }

  openButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      openAdvancedModal();
    });
  });

  closeButtons.forEach(button => {
    button.addEventListener('click', closeAdvancedModal);
  });

  advancedModal.addEventListener('click', event => {
    if (event.target.matches('.orst-advanced-backdrop')) {
      closeAdvancedModal();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !advancedModal.hidden) {
      closeAdvancedModal();
    }
  });
});
