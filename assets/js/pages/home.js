/* =============================================================================
   pages/home.js — สคริปต์เฉพาะหน้าหลัก (index.html)
   -----------------------------------------------------------------------------
   ต้องโหลด "หลัง" assets/js/components.js เสมอ

   สารบัญ
     [1] ค้นหา (ชั้นที่ 1) + AI Proof + placeholder หมุน
     [2] ค้นหา (ชั้นที่ 2) — ให้คะแนนความตรง + นับจำนวนตามหมวด
     [3] ค้นหา (ชั้นที่ 3) + ตัวช่วยทั่วทั้งหน้า (tabs, FAQ, reveal, back-to-top ฯลฯ)

   *** สิ่งที่ทีมต่อไปควรรู้ ***
   ระบบค้นหาบนหน้านี้มี 3 ชั้นทับกันอยู่ ทั้ง 3 ชั้นเขียนผลลงที่ #search-results
   และ #search-status เหมือนกัน ผลที่ผู้ใช้เห็นคือชั้นที่ทำงานทีหลังสุด
   ข้อมูลที่ใช้ทั้งหมดเป็นข้อมูลจำลอง (mock) ที่ฝังอยู่ในไฟล์นี้ ยังไม่มี API จริง
   ถ้าจะต่อ API จริง แนะนำให้ยุบเหลือชั้นเดียวก่อน (ดู HANDOFF.md หัวข้อ "หนี้ทางเทคนิค")
   ============================================================================= */

/* =============================================================================
   [1] ค้นหา (ชั้นที่ 1) + AI Proof + ข้อความหมุนในช่องค้นหา
   -----------------------------------------------------------------------------
   - ผูกกับ #search-form / #global-search / #suggestions / #search-results
   - ตัวตรวจภาษาไทย "AI Proof": #proof-input #proof-check #proof-items
     กฎการตรวจอยู่ที่ตัวแปร proofRules (เป็นกฎตัวอย่าง 8 ข้อ ยังไม่ใช่ของจริง)
   - หมุน placeholder ของช่องค้นหาอัตโนมัติ
   ============================================================================= */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const searchForm = $('#search-form');
  const searchInput = $('#global-search');
  const suggestionsBox = $('#suggestions');
  const resultsSection = $('#knowledge');
  const resultsGrid = $('#search-results');
  const statusBox = $('#search-status');
  const filterBtns = $$('.filter-btn');
  const sortSelect = $('#result-sort');

  const resultData = [
    { type: 'term', label: 'คำศัพท์', title: 'พจนานุกรมฉบับราชบัณฑิตยสภา', desc: 'ค้นหาความหมาย การอ่าน การเขียน และการใช้คำภาษาไทยมาตรฐาน', meta: 'ฐานข้อมูลคำศัพท์', score: 98, year: 2568 },
    { type: 'term', label: 'คำศัพท์', title: 'ศัพท์บัญญัติและคำทับศัพท์', desc: 'หลักเกณฑ์การบัญญัติศัพท์และตัวอย่างคำที่ใช้บ่อยในปัจจุบัน', meta: 'มาตรฐานภาษาไทย', score: 94, year: 2567 },
    { type: 'article', label: 'บทความ', title: 'ภาษาไทยกับการเรียนรู้ในยุคดิจิทัล', desc: 'บทความแนะนำแนวทางการใช้ภาษาไทยในสื่อออนไลน์อย่างถูกต้อง', meta: 'บทความวิชาการ', score: 89, year: 2568 },
    { type: 'journal', label: 'วารสาร', title: 'วารสารราชบัณฑิตยสภา', desc: 'รวมบทความวิชาการ งานวิจัย และข้อเขียนจากผู้ทรงคุณวุฒิ', meta: 'วารสาร', score: 84, year: 2567 },
    { type: 'document', label: 'เอกสาร', title: 'หลักเกณฑ์การใช้ภาษาไทย', desc: 'เอกสารอ้างอิงสำหรับการเขียน การสะกดคำ และการใช้คำอย่างเป็นทางการ', meta: 'เอกสารอ้างอิง', score: 82, year: 2566 },
    { type: 'news', label: 'ข่าวสาร', title: 'ข่าวและกิจกรรมด้านภาษาไทย', desc: 'ติดตามข่าวสาร กิจกรรม และประกาศที่เกี่ยวข้องกับราชบัณฑิตยสภา', meta: 'ข่าวสารล่าสุด', score: 76, year: 2568 },
    { type: 'service', label: 'บริการประชาชน', title: 'สอบถามข้อมูลทางวิชาการ', desc: 'ส่งคำถามเกี่ยวกับภาษาไทย คำศัพท์ และองค์ความรู้เพื่อให้เจ้าหน้าที่ตรวจสอบ', meta: 'บริการออนไลน์', score: 73, year: 2568 }
  ];

  const suggestionData = [
    { type: 'คำศัพท์', text: 'ภาษาไทย' },
    { type: 'พจนานุกรม', text: 'พจนานุกรมฉบับราชบัณฑิตยสภา' },
    { type: 'ศัพท์บัญญัติ', text: 'คำทับศัพท์' },
    { type: 'บทความ', text: 'ภาษาไทยยุคดิจิทัล' },
    { type: 'วารสาร', text: 'วารสารราชบัณฑิตยสภา' },
    { type: 'บริการ', text: 'สอบถามข้อมูลทางวิชาการ' }
  ];

  let currentQuery = '';
  let currentFilter = 'all';

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[char]));
  }

  function openResults(query = '') {
    currentQuery = query.trim();
    if (resultsSection) resultsSection.hidden = false;
    renderResults();
    resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function getFilteredResults() {
    let items = resultData.filter(item => currentFilter === 'all' || item.type === currentFilter);
    const normalizedQuery = currentQuery.toLowerCase();
    if (normalizedQuery) {
      items = items.filter(item => `${item.title} ${item.desc} ${item.label} ${item.meta}`.toLowerCase().includes(normalizedQuery) || normalizedQuery.length < 3);
      if (!items.length) items = resultData.filter(item => currentFilter === 'all' || item.type === currentFilter).slice(0, 3);
    }

    const sort = sortSelect?.value || 'relevant';
    return [...items].sort((a, b) => {
      if (sort === 'newest') return b.year - a.year;
      if (sort === 'popular') return b.score - a.score;
      return b.score - a.score;
    });
  }

  function renderResults() {
    if (!resultsGrid || !statusBox) return;
    const items = getFilteredResults();
    const queryText = currentQuery ? `“${escapeHTML(currentQuery)}”` : 'คำค้นล่าสุด';
    const activeLabel = $('.filter-btn.active')?.textContent?.trim() || 'ทั้งหมด';

    statusBox.innerHTML = `
    <span>พบผลลัพธ์ ${items.length} รายการ สำหรับ ${queryText}</span>
    <span>ตัวกรอง: ${escapeHTML(activeLabel)}</span>
  `;

    if (!items.length) {
      resultsGrid.innerHTML = `<div class="orst-empty-state">ไม่พบผลลัพธ์ ลองเปลี่ยนคำค้นหรือเลือกตัวกรองอื่น</div>`;
      return;
    }

    resultsGrid.innerHTML = items.map(item => `
    <article class="orst-result-card" data-type="${escapeHTML(item.type)}">
      <span class="orst-result-type">${escapeHTML(item.label)}</span>
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.desc)}</p>
      <div class="orst-result-meta">
        <span>${escapeHTML(item.meta)} · ${item.year}</span>
        <a class="orst-result-open" href="#">เปิดดู →</a>
      </div>
    </article>
  `).join('');
  }

  function renderSuggestions(query = '') {
    if (!suggestionsBox || !searchInput) return;
    const normalized = query.trim().toLowerCase();
    const suggestions = suggestionData.filter(item => !normalized || item.text.toLowerCase().includes(normalized)).slice(0, 5);

    if (!suggestions.length) {
      suggestionsBox.hidden = true;
      searchInput.setAttribute('aria-expanded', 'false');
      return;
    }

    suggestionsBox.innerHTML = suggestions.map(item => `
    <button type="button" class="orst-suggestion-btn" data-suggestion="${escapeHTML(item.text)}" role="option">
      <span class="orst-suggestion-type">${escapeHTML(item.type)}</span>
      <strong>${escapeHTML(item.text)}</strong>
    </button>
  `).join('');
    suggestionsBox.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
  }

  searchInput?.addEventListener('focus', () => renderSuggestions(searchInput.value));
  searchInput?.addEventListener('input', () => renderSuggestions(searchInput.value));

  suggestionsBox?.addEventListener('click', event => {
    const btn = event.target.closest('[data-suggestion]');
    if (!btn || !searchInput) return;
    searchInput.value = btn.dataset.suggestion;
    suggestionsBox.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    openResults(searchInput.value);
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('#search-form')) {
      if (suggestionsBox) suggestionsBox.hidden = true;
      searchInput?.setAttribute('aria-expanded', 'false');
    }
  });

  searchForm?.addEventListener('submit', event => {
    event.preventDefault();
    openResults(searchInput?.value || '');
  });

  $$('[data-query]').forEach(btn => {
    btn.addEventListener('click', event => {
      const query = btn.dataset.query || btn.textContent.trim();
      if (searchInput) searchInput.value = query;
      openResults(query);
    });
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentFilter = btn.dataset.filter || 'all';
      renderResults();
    });
  });

  sortSelect?.addEventListener('change', renderResults);

  const proofInput = $('#proof-input');
  const proofCheck = $('#proof-check');
  const proofItems = $('#proof-items');
  const proofStatus = $('#proof-status');
  const proofCopy = $('#proof-copy');
  const proofClear = $('#proof-clear');
  const proofSample = $('#proof-sample');
  const proofCount = $('#proof-count');

  const proofRules = [
    { wrong: 'สำนักงาน ราชบัณฑิตยสภา', correct: 'สำนักงานราชบัณฑิตยสภา', kind: 'การเว้นวรรค' },
    { wrong: 'ให้ ก้าวหน้า', correct: 'ให้ก้าวหน้า', kind: 'การเว้นวรรค' },
    { wrong: 'มุ่งมั่น ในการ', correct: 'มุ่งมั่นในการ', kind: 'การเว้นวรรค' },
    { wrong: 'ถูกต้อง และ', correct: 'ถูกต้องและ', kind: 'การเว้นวรรค' },
    { wrong: 'เวบไซต์', correct: 'เว็บไซต์', kind: 'สะกดคำ' },
    { wrong: 'ประโยค์', correct: 'ประโยค', kind: 'สะกดคำ' },
    { wrong: 'อนุญาติ', correct: 'อนุญาต', kind: 'สะกดคำ' },
    { wrong: 'ก๊อบ', correct: 'คัดลอก', kind: 'คำแนะนำ' }
  ];

  let correctedText = proofInput?.value || '';

  function updateProofCount() {
    if (!proofInput || !proofCount) return;
    proofCount.textContent = `${proofInput.value.length.toLocaleString('th-TH')} / 5,000 ตัวอักษร`;
  }

  function runProof() {
    if (!proofInput || !proofItems || !proofStatus) return;
    const raw = proofInput.value.trim();
    correctedText = raw;

    if (!raw) {
      proofStatus.textContent = 'ผลการตรวจสอบ';
      proofItems.innerHTML = '<div class="orst-proof-item"><span class="orst-proof-dot ok"></span><span>วางข้อความเพื่อเริ่มตรวจสอบ</span><button class="orst-proof-apply" type="button">พร้อม</button></div>';
      return;
    }

    const found = proofRules.filter(rule => raw.includes(rule.wrong));
    found.forEach(rule => {
      correctedText = correctedText.split(rule.wrong).join(rule.correct);
    });

    proofStatus.textContent = found.length ? `พบคำแนะนำ ${found.length} รายการ` : 'ไม่พบคำผิดจากกฎตัวอย่าง';
    proofItems.innerHTML = (found.length ? found : [{ wrong: 'ข้อความนี้', correct: 'พร้อมใช้งาน', kind: 'ผ่าน' }]).map(rule => `
    <div class="orst-proof-item">
      <span class="orst-proof-dot ${found.length ? '' : 'ok'}"></span>
      <span>${escapeHTML(rule.wrong)} → ${escapeHTML(rule.correct)}</span>
      <button class="orst-proof-apply" type="button" data-wrong="${escapeHTML(rule.wrong)}" data-correct="${escapeHTML(rule.correct)}">แก้ไข</button>
    </div>
  `).join('');
  }

  proofInput?.addEventListener('input', updateProofCount);
  proofCheck?.addEventListener('click', runProof);

  proofItems?.addEventListener('click', event => {
    const btn = event.target.closest('[data-wrong][data-correct]');
    if (!btn || !proofInput) return;
    proofInput.value = proofInput.value.split(btn.dataset.wrong).join(btn.dataset.correct);
    updateProofCount();
    runProof();
  });

  proofSample?.addEventListener('click', () => {
    if (!proofInput) return;
    proofInput.value = 'ตัวอย่างประโยค์นี้ถูกก๊อบมาจากเวบไซต์ และต้องขออนุญาติให้ถูกต้องก่อนเผยแพร่';
    proofInput.focus();
    updateProofCount();
    runProof();
  });

  proofClear?.addEventListener('click', () => {
    if (!proofInput) return;
    proofInput.value = '';
    correctedText = '';
    updateProofCount();
    runProof();
    proofInput.focus();
  });

  proofCopy?.addEventListener('click', async () => {
    runProof();
    if (!correctedText) return;
    try {
      await navigator.clipboard.writeText(correctedText);
      proofCopy.textContent = 'คัดลอกแล้ว ✓';
      setTimeout(() => proofCopy.textContent = 'คัดลอกผลลัพธ์', 1400);
    } catch {
      proofCopy.textContent = 'คัดลอกไม่ได้';
      setTimeout(() => proofCopy.textContent = 'คัดลอกผลลัพธ์', 1400);
    }
  });

  const placeholders = [
    'ค้นหาองค์ความรู้ คำศัพท์ พจนานุกรม สื่อ สิ่งพิมพ์ และอื่น ๆ...',
    'ลองค้นหา: ศัพท์บัญญัติ ภาษาไทย หรือวรรณกรรมไทย...',
    'พิมพ์คำถามได้เลย เช่น คำว่า “ราชบัณฑิต” หมายถึงอะไร...'
  ];
  let placeholderIndex = 0;
  setInterval(() => {
    if (!searchInput || document.activeElement === searchInput || searchInput.value) return;
    placeholderIndex = (placeholderIndex + 1) % placeholders.length;
    searchInput.placeholder = placeholders[placeholderIndex];
  }, 2600);

  updateProofCount();
  runProof();
})();

/* หมายเหตุ: โค้ด "ค้นหาขั้นสูง" (#advanced-modal) ถูกย้ายไป _archive/advanced-search-modal.js
   ซึ่งไม่มีอยู่ในหน้าเว็บ จึงไม่เคยทำงาน -> _archive/advanced-search-modal.js */

/* sticky header: ย้ายไปอยู่ที่ assets/js/components.js -> initFixedHeader() */

/* =============================================================================
   [2] ค้นหา (ชั้นที่ 2) — เวอร์ชันให้คะแนนความตรง + นับจำนวนตามหมวด
   -----------------------------------------------------------------------------
   - ข้อมูลจำลองอยู่ที่ตัวแปร searchData (12 รายการ)
   - scoreItem() ให้คะแนน, updateCounts() อัปเดต #count-term #count-journal ...
   - renderFeatured() แสดงผลลัพธ์เด่นที่ #featured-result
   ============================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const knowledgeSection = document.querySelector('#knowledge');
  const heroForm = document.querySelector('#search-form');
  const heroInput = document.querySelector('#global-search');
  const inlineInput = document.querySelector('#results-inline-search');
  const inlineSubmit = document.querySelector('#results-inline-submit');
  const resultGrid = document.querySelector('#search-results');
  const searchStatus = document.querySelector('#search-status');
  const resultSummary = document.querySelector('#result-summary');
  const featuredResult = document.querySelector('#featured-result');
  const emptyState = document.querySelector('#orst-empty-state');
  const sortSelect = document.querySelector('#result-sort');
  const filterButtons = document.querySelectorAll('.orst-filter-row .filter-btn');
  const quickButtons = document.querySelectorAll('[data-query]');

  if (!knowledgeSection || !resultGrid) return;

  const typeLabel = {
    term: 'คำศัพท์',
    dictionary: 'พจนานุกรม',
    journal: 'วารสาร',
    article: 'บทความ',
    document: 'เอกสาร',
    service: 'บริการประชาชน',
    news: 'ข่าวสาร'
  };

  const searchData = [
    {
      id: 1,
      type: 'dictionary',
      title: 'พจนานุกรมฉบับราชบัณฑิตยสถาน พ.ศ. 2554',
      desc: 'ค้นหาความหมาย การอ่าน การสะกด และการใช้คำภาษาไทยตามมาตรฐานราชบัณฑิตยสภา',
      source: 'ฐานข้อมูลคำศัพท์',
      year: 2554,
      popularity: 98,
      keywords: ['พจนานุกรม', 'คำศัพท์', 'ภาษาไทย', 'ความหมาย', 'สะกด', 'ราชบัณฑิต']
    },
    {
      id: 2,
      type: 'term',
      title: 'ศัพท์บัญญัติสำนักงานราชบัณฑิตยสภา',
      desc: 'ค้นหาศัพท์เฉพาะทาง ศัพท์วิชาการ และคำไทยที่กำหนดใช้ในสาขาต่าง ๆ',
      source: 'ฐานศัพท์บัญญัติ',
      year: 2567,
      popularity: 92,
      keywords: ['ศัพท์บัญญัติ', 'คำศัพท์', 'วิชาการ', 'ภาษาไทย', 'เทคโนโลยี']
    },
    {
      id: 4,
      type: 'document',
      title: 'คลังเอกสารเก่าสำนักงานราชบัณฑิตยสภา',
      desc: 'เอกสารเก่า หนังสือราชการ สิ่งพิมพ์ และข้อมูลอ้างอิงที่จัดเก็บเป็นหมวดหมู่',
      source: 'คลังเอกสาร',
      year: 2565,
      popularity: 73,
      keywords: ['คลังเอกสารเก่า', 'เอกสาร', 'สิ่งพิมพ์', 'ราชบัณฑิต']
    },
    {
      id: 5,
      type: 'term',
      title: 'ระบบฐานข้อมูลคำทับศัพท์',
      desc: 'ตรวจสอบการเขียนคำทับศัพท์และคำยืมจากภาษาต่างประเทศตามหลักเกณฑ์ที่เกี่ยวข้อง',
      source: 'ฐานข้อมูลคำทับศัพท์',
      year: 2567,
      popularity: 86,
      keywords: ['คำทับศัพท์', 'ศัพท์บัญญัติ', 'ภาษาไทย', 'หลักเกณฑ์', 'ต่างประเทศ']
    },
    {
      id: 6,
      type: 'dictionary',
      title: 'อักขรานุกรมภูมิศาสตร์ไทย',
      desc: 'ข้อมูลชื่อภูมิศาสตร์ สถานที่สำคัญ และคำอธิบายที่ใช้เป็นข้อมูลอ้างอิง',
      source: 'อักขรานุกรม',
      year: 2564,
      popularity: 69,
      keywords: ['อักขรานุกรม', 'ภูมิศาสตร์', 'สถานที่', 'คำศัพท์']
    },
    {
      id: 7,
      type: 'article',
      title: 'ภาษาไทยกับการเปลี่ยนแปลงของสังคมร่วมสมัย',
      desc: 'บทความอธิบายแนวโน้มการใช้ภาษาไทยในยุคดิจิทัล พร้อมตัวอย่างคำที่ใช้บ่อย',
      source: 'บทความแนะนำ',
      year: 2567,
      popularity: 84,
      keywords: ['ภาษาไทย', 'บทความ', 'ดิจิทัล', 'ร่วมสมัย', 'สังคม']
    },
    {
      id: 8,
      type: 'journal',
      title: 'วารสารราชบัณฑิตยสภา',
      desc: 'รวมบทความวิชาการ งานวิจัย และองค์ความรู้ที่เผยแพร่ในวารสารของราชบัณฑิตยสภา',
      source: 'วารสาร',
      year: 2567,
      popularity: 77,
      keywords: ['วารสาร', 'บทความวิชาการ', 'ราชบัณฑิต', 'งานวิจัย']
    },
    {
      id: 9,
      type: 'service',
      title: 'บริการสอบถามข้อมูลทางวิชาการ',
      desc: 'ส่งคำถามเกี่ยวกับภาษาไทย คำศัพท์ และองค์ความรู้ให้เจ้าหน้าที่ตรวจสอบและตอบกลับ',
      source: 'บริการประชาชน',
      year: 2567,
      popularity: 74,
      keywords: ['บริการประชาชน', 'สอบถาม', 'ข้อมูลวิชาการ', 'คำศัพท์']
    },
    {
      id: 11,
      type: 'term',
      title: 'พจนานุกรมภาษามือไทย',
      desc: 'ฐานข้อมูลคำศัพท์ภาษามือไทย พร้อมหมวดคำที่ช่วยส่งเสริมการเข้าถึงสำหรับทุกคน',
      source: 'ฐานข้อมูลภาษามือ',
      year: 2566,
      popularity: 71,
      keywords: ['พจนานุกรม', 'ภาษามือไทย', 'คำศัพท์', 'การเข้าถึง']
    },
    {
      id: 12,
      type: 'document',
      title: 'หลักเกณฑ์ต่าง ๆ ด้านภาษาไทย',
      desc: 'รวมหลักเกณฑ์การเขียน การอ่าน คำทับศัพท์ ชื่อเฉพาะ และแนวทางการใช้ภาษาไทย',
      source: 'หลักเกณฑ์ภาษาไทย',
      year: 2567,
      popularity: 90,
      keywords: ['หลักเกณฑ์ต่างๆ', 'หลักเกณฑ์', 'ภาษาไทย', 'คำทับศัพท์', 'การเขียน']
    }
  ];

  let activeQuery = '';
  let activeFilter = 'all';

  function normalize(text) {
    return (text || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function scoreItem(item, query) {
    const q = normalize(query);
    if (!q) return 1;

    const title = normalize(item.title);
    const desc = normalize(item.desc);
    const source = normalize(item.source);
    const keywords = item.keywords.map(normalize).join(' ');

    let score = 0;
    if (title.includes(q)) score += 60;
    if (keywords.includes(q)) score += 35;
    if (desc.includes(q)) score += 20;
    if (source.includes(q)) score += 15;

    q.split(' ').forEach(part => {
      if (!part) return;
      if (title.includes(part)) score += 16;
      if (keywords.includes(part)) score += 10;
      if (desc.includes(part)) score += 6;
    });

    return score;
  }

  function updateViewAllLink() {
    const links = [
      document.querySelector('#view-all-results'),
      document.querySelector('#view-all-results-footer')
    ].filter(Boolean);

    const params = new URLSearchParams();

    if (activeQuery) params.set('q', activeQuery);
    if (activeFilter && activeFilter !== 'all') {
      params.set('type', activeFilter);
    }

    const href = params.toString()
      ? `knowledge.html?${params.toString()}`
      : 'knowledge.html';

    links.forEach(link => {
      link.href = href;
    });
  }

  function highlight(text, query) {
    const q = normalize(query);
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(escaped, 'gi'), match => `<mark class="orst-highlight">${match}</mark>`);
  }

  function getResults() {
    let results = searchData
      .map(item => ({ ...item, score: scoreItem(item, activeQuery) }))
      .filter(item => {
        const passQuery = !activeQuery || item.score > 0;
        const passFilter = activeFilter === 'all' || item.type === activeFilter;
        return passQuery && passFilter;
      });

    const sort = sortSelect?.value || 'relevant';

    if (sort === 'newest') {
      results.sort((a, b) => b.year - a.year || b.score - a.score);
    } else if (sort === 'popular') {
      results.sort((a, b) => b.popularity - a.popularity || b.score - a.score);
    } else if (sort === 'az') {
      results.sort((a, b) => a.title.localeCompare(b.title, 'th'));
    } else {
      results.sort((a, b) => b.score - a.score || b.popularity - a.popularity);
    }

    return results;
  }

  function updateCounts() {
    const q = activeQuery;
    const base = searchData
      .map(item => ({ ...item, score: scoreItem(item, q) }))
      .filter(item => !q || item.score > 0);

    const counts = {
      all: base.length,
      term: base.filter(i => i.type === 'term').length,
      dictionary: base.filter(i => i.type === 'dictionary').length,
      journal: base.filter(i => i.type === 'journal').length,
      article: base.filter(i => i.type === 'article').length,
      document: base.filter(i => i.type === 'document').length,
      service: base.filter(i => i.type === 'service').length
    };

    Object.keys(counts).forEach(key => {
      const el = document.querySelector(`#count-${key}`);
      if (el) el.textContent = counts[key];
    });
  }

  function renderFeatured(item) {
    if (!featuredResult) return;

    if (!item) {
      featuredResult.hidden = true;
      featuredResult.innerHTML = '';
      return;
    }

    featuredResult.hidden = false;
    featuredResult.innerHTML = `
    <span class="type">ผลลัพธ์แนะนำ • ${typeLabel[item.type] || item.type}</span>
    <h3>${highlight(item.title, activeQuery)}</h3>
    <p>${highlight(item.desc, activeQuery)}</p>
    <small>${item.source} • อัปเดต ${item.year} • ความนิยม ${item.popularity}%</small><br>
    <a href="#${item.type}-${item.id}" aria-label="ดูรายละเอียด ${item.title}">ดูรายละเอียด →</a>
  `;
  }

  function renderResults(scrollIntoView = true) {
    updateCounts();

    const results = getResults();
    const queryText = activeQuery ? `สำหรับคำค้น “${activeQuery}”` : 'ทั้งหมด';
    const filterLabel = activeFilter === 'all' ? 'ทุกประเภท' : (typeLabel[activeFilter] || activeFilter);

    if (knowledgeSection.hidden) knowledgeSection.hidden = false;

    if (inlineInput && inlineInput.value !== activeQuery) inlineInput.value = activeQuery;
    if (heroInput && heroInput.value !== activeQuery && activeQuery) heroInput.value = activeQuery;

    filterButtons.forEach(btn => {
      const isActive = btn.dataset.filter === activeFilter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (resultSummary) {
      resultSummary.innerHTML = `
      <strong>${results.length} รายการ</strong>
      <span>${filterLabel}</span>
    `;
    }

    if (searchStatus) {
      searchStatus.innerHTML = `
      <span>พบ ${results.length} รายการ ${queryText}</span>
      <span>แสดงผลแบบ ${filterLabel}</span>
    `;
    }

    if (!results.length) {
      renderFeatured(null);
      resultGrid.innerHTML = '';
      if (emptyState) emptyState.hidden = false;
      if (scrollIntoView) knowledgeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (emptyState) emptyState.hidden = true;
    renderFeatured(results[0]);

    resultGrid.innerHTML = results.slice(1).map(item => `
    <article class="orst-result-card" id="${item.type}-${item.id}">
      <div class="orst-card-top">
        <span class="orst-type-badge">${typeLabel[item.type] || item.type}</span>
        <span class="orst-score">ตรงกัน ${Math.min(99, Math.max(item.score, item.popularity))}%</span>
      </div>

      <div class="orst-card-body">
        <h3>${highlight(item.title, activeQuery)}</h3>
        <p>${highlight(item.desc, activeQuery)}</p>
      </div>

      <div class="orst-card-meta">
        <span>${item.source}</span>
        <span>อัปเดต ${item.year}</span>
        <span>นิยม ${item.popularity}%</span>
      </div>

      <a class="orst-card-action" href="#${item.type}-${item.id}" aria-label="ดูรายละเอียด ${item.title}">
        ดูรายละเอียด
      </a>
    </article>
  `).join('');

    if (scrollIntoView) {
      knowledgeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function runSearch(query, shouldScroll = true) {
    activeQuery = (query || '').trim();
    activeFilter = 'all';
    renderResults(shouldScroll);
  }

  heroForm?.addEventListener('submit', event => {
    event.preventDefault();
    runSearch(heroInput?.value || '', true);
  });

  inlineSubmit?.addEventListener('click', () => {
    runSearch(inlineInput?.value || '', false);
  });

  inlineInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      runSearch(inlineInput.value, false);
    }
  });

  inlineInput?.addEventListener('input', () => {
    activeQuery = inlineInput.value.trim();
    renderResults(false);
  });

  quickButtons.forEach(button => {
    button.addEventListener('click', () => {
      const query = button.dataset.query;
      runSearch(query, true);
    });
  });

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      renderResults(false);
    });
  });

  sortSelect?.addEventListener('change', () => renderResults(false));

  updateCounts();

  // เปิดตัวอย่างแรกแบบเบา ๆ เพื่อให้ section ดูมีชีวิตเมื่อถูกแสดงจากหน้าแรก
  if (!activeQuery) {
    activeQuery = 'ภาษาไทย';
    renderResults(false);
    knowledgeSection.hidden = true;
    activeQuery = '';
  }
});

/* =============================================================================
   [3] ค้นหา (ชั้นที่ 3) + ตัวช่วยทั่วทั้งหน้า
   -----------------------------------------------------------------------------
   - ข้อมูลจำลองชุดที่สอง: searchData (8 รายการ) + suggestions
   - init() รวมการเริ่มทำงาน: initHeader, initMobileMenu, initSearch, initFilters,
     initModals, initAccessibility, initFAQ, initScrollers, initReveal,
     initBackTop, initAccessPanelEnhance, initFAQEnhance, initServiceHub, initMediaPlaylist
   ============================================================================= */
const searchData = [
  { type: 'term', label: 'คำศัพท์', title: 'พจนานุกรมฉบับราชบัณฑิตยสถาน พ.ศ. 2554', desc: 'ค้นหาความหมาย การอ่าน และการเขียนคำภาษาไทยมาตรฐาน', meta: 'ฐานข้อมูลคำศัพท์' },
  { type: 'term', label: 'คำศัพท์', title: 'การเขียนคำทับศัพท์', desc: 'หลักเกณฑ์การทับศัพท์และตัวอย่างคำที่ใช้บ่อย', meta: 'มาตรฐานภาษาไทย' },
  { type: 'journal', label: 'วารสาร', title: 'วารสารราชบัณฑิตยสภา ปีที่ 43 ฉบับที่ 2', desc: 'บทความวิชาการด้านภาษา วัฒนธรรม วิทยาศาสตร์ และสังคมศาสตร์', meta: 'เผยแพร่ล่าสุด' },
  { type: 'article', label: 'บทความ', title: 'ภาษาไทยกับการเปลี่ยนแปลงของสังคมร่วมสมัย', desc: 'บทความอธิบายแนวโน้มการใช้ภาษาไทยในยุคดิจิทัล', meta: 'บทความแนะนำ' },
  { type: 'document', label: 'เอกสาร', title: 'หลักเกณฑ์การเขียนชื่อภูมิศาสตร์', desc: 'เอกสาร PDF สำหรับการอ้างอิงชื่อสถานที่และภูมิศาสตร์', meta: 'PDF / ดาวน์โหลด' },
  { type: 'news', label: 'ข่าวสาร', title: 'เชิญร่วมงานวันภาษาไทยแห่งชาติ 2567', desc: 'กิจกรรม นิทรรศการ และการเสวนาทางวิชาการสำหรับประชาชน', meta: 'ข่าวประชาสัมพันธ์' },
  { type: 'service', label: 'บริการ', title: 'สอบถามข้อมูลทางวิชาการ', desc: 'ส่งคำถามด้านภาษาและองค์ความรู้ผ่านแบบฟอร์มออนไลน์', meta: 'บริการประชาชน' },
  { type: 'service', label: 'บริการ', title: 'ขออนุญาตนำหนังสือไปจัดพิมพ์', desc: 'บริการยื่นคำขออนุญาตใช้เนื้อหาหรือสิ่งพิมพ์ของสำนักงาน', meta: 'แบบฟอร์มออนไลน์' }
];
const suggestions = [
  { q: 'พจนานุกรม', hint: 'คำศัพท์และความหมาย', icon: 'i-book' },
  { q: 'ศัพท์บัญญัติ', hint: 'ศัพท์เฉพาะทาง', icon: 'i-form' },
  { q: 'ภาษาไทย', hint: 'บทความและมาตรฐานภาษา', icon: 'i-pen' },
  { q: 'วารสารราชบัณฑิตยสภา', hint: 'วารสารและบทความล่าสุด', icon: 'i-file' },
  { q: 'การเขียนคำทับศัพท์', hint: 'หลักเกณฑ์ภาษาไทย', icon: 'i-shield' },
  { q: 'สารานุกรม', hint: 'คลังความรู้และสิ่งพิมพ์', icon: 'i-book' },
  { q: 'สุภาษิต', hint: 'คลังคำและสำนวนไทย', icon: 'i-puzzle' }
];
let currentFilter = 'all'; let currentQuery = ''; let fontStep = 0; let lastFocused = null;
const qs = (s, r = document) => r.querySelector(s); const qsa = (s, r = document) => r ? [...r.querySelectorAll(s)] : [];

function init() {
  initHeader();
  initMobileMenu();
  initSearch();
  initFilters();
  initModals();
  initAccessibility();
  initFAQ();
  initScrollers();
  initReveal();
  initBackTop();
  initAccessPanelEnhance();
  initFAQEnhance();
  initMediaPlaylist();
  initEventCalendar();
}
function initHeader() {
  const h = qs('#site-header');
  if (!h) return;

  window.addEventListener('scroll', () => {
    h.classList.toggle('is-scrolled', window.scrollY > 20);
  });
}
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
function initSearch() {
  const form = qs('#search-form');
  const input = qs('#global-search');
  const panel = qs('#suggestions');

  // กัน error กรณีบางหน้าไม่มี search form
  if (!form || !input || !panel) return;

  const knowledgeSection = qs('#knowledge');
  const searchResults = qs('#search-results');
  const searchStatus = qs('#search-status');

  qsa('[data-focus-search]').forEach(btn => {
    btn.addEventListener('click', () => {
      input.focus();
      input.scrollIntoView({
        behavior: reduce() ? 'auto' : 'smooth',
        block: 'center'
      });
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    doSearch(input.value.trim());
  });

  input.addEventListener('input', () => {
    currentQuery = input.value.trim();

    if (currentQuery) {
      showSuggestions(currentQuery);
    } else {
      hideSuggestions();

      if (knowledgeSection) knowledgeSection.hidden = true;
      if (searchResults) searchResults.innerHTML = '';
      if (searchStatus) searchStatus.textContent = '';
    }
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideSuggestions();
  });

  document.addEventListener('click', e => {
    if (!form.contains(e.target)) hideSuggestions();
  });

  qsa('[data-query]').forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.dataset.query || '';

      input.value = query;
      hideSuggestions();
      doSearch(query);

      input.scrollIntoView({
        behavior: reduce() ? 'auto' : 'smooth',
        block: 'center'
      });
    });
  });

  function showSuggestions(q) {
    const list = Array.isArray(suggestions) ? suggestions : [];

    const items = list
      .filter(i => {
        const keyword = i.q || '';
        const hint = i.hint || '';
        return keyword.includes(q) || hint.includes(q);
      })
      .slice(0, 6);

    if (!items.length) {
      hideSuggestions();
      return;
    }

    panel.innerHTML = items.map(i => `
  <button class="suggestion-item" type="button" role="option" data-suggestion="${i.q}">
    <span class="suggestion-icon">
      <svg class="icon" aria-hidden="true">
        <use href="#${i.icon}"></use>
      </svg>
    </span>
    <span>
      <strong>${highlight(i.q, q)}</strong>
      <small>${i.hint}</small>
    </span>
  </button>
`).join('');

    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');

    qsa('[data-suggestion]', panel).forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.suggestion || '';

        input.value = query;
        hideSuggestions();
        doSearch(query);
      });
    });
  }

  function hideSuggestions() {
    panel.hidden = true;
    panel.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
  }
}

function doSearch(q) {
  currentQuery = q;
  hideSuggestions();

  const knowledgeSection = qs('#knowledge');
  if (knowledgeSection) knowledgeSection.hidden = false;

  renderResults(q);

  knowledgeSection?.scrollIntoView({
    behavior: reduce() ? 'auto' : 'smooth',
    block: 'start'
  });
}
function hideSuggestions() { const p = qs('#suggestions'), i = qs('#global-search'); if (p) { p.hidden = true; p.innerHTML = '' } i?.setAttribute('aria-expanded', 'false') }
function initFilters() { qsa('[data-filter]').forEach(btn => btn.addEventListener('click', () => { currentFilter = btn.dataset.filter; qsa('[data-filter]').forEach(b => { const active = b === btn; b.classList.toggle('active', active); b.setAttribute('aria-selected', String(active)) }); qs('#knowledge').hidden = false; renderResults(currentQuery, !currentQuery) })) }
function renderResults(q = '', initial = false) { const section = qs('#knowledge'); if (section) section.hidden = false; const wrap = qs('#search-results'), status = qs('#search-status'); let res = searchData.filter(i => currentFilter === 'all' || i.type === currentFilter); if (q) { const low = q.toLowerCase(); res = res.filter(i => (i.title + ' ' + i.desc + ' ' + i.label + ' ' + i.meta).toLowerCase().includes(low) || loose(i, low)) } if (initial) { res = res.slice(0, 6); status.textContent = 'ตัวอย่างผลลัพธ์ยอดนิยมจากคลังองค์ความรู้' } else status.textContent = res.length ? `พบ ${res.length} รายการ${q ? ` สำหรับคำค้น “${q}”` : ''}` : `ไม่พบผลลัพธ์${q ? ` สำหรับคำค้น “${q}”` : ''}`; wrap.innerHTML = res.length ? res.map(i => `<article class="result-card"><span class="type">${i.label}</span><h3>${i.title}</h3><p>${i.desc}</p><small>${i.meta}</small><br><a href="#">ดูรายละเอียด →</a></article>`).join('') : `<div class="empty-state"><strong>ไม่พบข้อมูลที่ตรงกับคำค้น</strong><br>ลองใช้คำค้นอื่น เช่น “พจนานุกรม”, “ภาษาไทย”, “วารสาร” หรือลดตัวกรองผลลัพธ์</div>` }
function loose(i, q) { if (q.includes('พจนานุกรม')) return i.type === 'term'; if (q.includes('วารสาร')) return i.type === 'journal'; if (q.includes('บทความ')) return i.type === 'article'; if (q.includes('เอกสาร')) return i.type === 'document'; if (q.includes('ข่าว')) return i.type === 'news'; if (q.includes('บริการ')) return i.type === 'service'; return false }
function highlight(t, q) { return t.replace(new RegExp(`(${escapeRegExp(q)})`, 'gi'), '<strong>$1</strong>') } function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }
function initModals() { qsa('[data-modal-open]').forEach(btn => btn.addEventListener('click', () => openModal(btn.dataset.modalOpen))); qsa('[data-modal-close]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal')?.id))); document.addEventListener('keydown', e => { if (e.key === 'Escape') qsa('.modal:not([hidden])').forEach(m => closeModal(m.id)) }); qs('#advanced-form')?.addEventListener('submit', e => { e.preventDefault(); const q = qs('#advanced-q').value.trim() || 'ภาษาไทย'; const type = new FormData(e.target).get('adv-type'); currentFilter = type; qsa('[data-filter]').forEach(b => { const active = b.dataset.filter === type; b.classList.toggle('active', active); b.setAttribute('aria-selected', String(active)) }); qs('#global-search').value = q; closeModal('advanced-modal'); doSearch(q) }) }
function openModal(id) { const m = qs('#' + id); if (!m) return; lastFocused = document.activeElement; m.hidden = false; document.body.style.overflow = 'hidden'; setTimeout(() => qs('button,input,select,a', m)?.focus(), 20) }
function closeModal(id) { const m = qs('#' + id); if (!m) return; m.hidden = true; document.body.style.overflow = ''; lastFocused?.focus?.() }
function initAccessibility() { qsa('[data-font]').forEach(btn => btn.addEventListener('click', () => { const a = btn.dataset.font; if (a === 'plus') fontStep = Math.min(3, fontStep + 1); if (a === 'minus') fontStep = Math.max(-2, fontStep - 1); if (a === 'reset') fontStep = 0; document.documentElement.style.setProperty('--base-size', `${17 + fontStep}px`) })); qsa('[data-toggle-contrast]').forEach(b => b.addEventListener('click', () => document.body.classList.toggle('high-contrast'))); qsa('[data-readable]').forEach(b => b.addEventListener('click', () => document.body.classList.toggle('readable-mode'))); qsa('[data-reduce-motion]').forEach(b => b.addEventListener('click', () => document.body.classList.toggle('no-motion'))) }
function initFAQ() {
  qsa('.faq-q').forEach(btn => btn.addEventListener('click', () => {
    const a = btn.nextElementSibling; const open = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!open)); const icon = btn.querySelector('em') || btn.querySelector('span:last-child');
    if (icon) icon.textContent = open ? '+' : '−'; a.hidden = open
  }))
}
// ปุ่ม ‹ › ของแถวการ์ด: เลื่อนทีละเกือบเต็มความกว้างที่มองเห็น และปิดปุ่มเมื่อสุดแถว
function initScrollers() {
  // data-scroll ใส่ id ของแถวตรง ๆ (เช่น "encyclopedia-row") — รองรับแบบไม่มี -row ด้วย
  const rowOf = id => qs(`#${id}`) || qs(`#${id}-row`);
  qsa('[data-scroll]').forEach(btn => btn.addEventListener('click', () => {
    const el = rowOf(btn.dataset.scroll);
    if (!el) return;
    const step = Math.max(320, el.clientWidth * .85);
    el.scrollBy({ left: (btn.dataset.dir === 'left' ? -1 : 1) * step, behavior: reduce() ? 'auto' : 'smooth' });
  }));

  const rows = [...new Set(qsa('[data-scroll]').map(b => b.dataset.scroll))];
  rows.forEach(id => {
    const el = rowOf(id);
    if (!el) return;
    const left = qs(`[data-scroll="${id}"][data-dir="left"]`);
    const right = qs(`[data-scroll="${id}"][data-dir="right"]`);
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (left) left.disabled = el.scrollLeft <= 4;
      if (right) right.disabled = el.scrollLeft >= max - 4;
    };
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    // แถวที่อยู่ในแท็บซ่อน: อัปเดตเมื่อแท็บถูกเปิด
    qsa('[data-media-tab]').forEach(tab => tab.addEventListener('click', () => requestAnimationFrame(update)));
    update();
  });
}
function initReveal() { const items = qsa('.reveal'); if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('is-visible')); return } const ob = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); ob.unobserve(e.target) } }), { threshold: .12 }); items.forEach(i => ob.observe(i)) }

// สื่อมัลติมีเดีย: กดรายการในเพลย์ลิสต์ -> เปลี่ยนภาพ/ชื่อของวิดีโอเด่น
function initMediaPlaylist() {
  const img = qs('[data-mm-feature-img]');
  const title = qs('[data-mm-feature-title]');
  const items = qsa('.mm-item');
  if (!img || !title || !items.length) return;

  items.forEach(item => item.addEventListener('click', () => {
    if (item.classList.contains('is-active')) return;
    items.forEach(other => {
      const active = other === item;
      other.classList.toggle('is-active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    const swap = () => {
      img.src = item.dataset.mmSrc;
      title.textContent = item.dataset.mmTitle;
      img.classList.remove('is-swapping');
    };
    // จอแคบ: เพลย์ลิสต์อยู่ใต้วิดีโอเด่น — เลื่อนให้เห็นวิดีโอที่เพิ่งเลือก
    if (window.matchMedia('(max-width: 1100px)').matches) {
      qs('[data-mm-feature]')?.scrollIntoView({ block: 'nearest', behavior: reduce() ? 'auto' : 'smooth' });
    }
    if (reduce()) { swap(); return; }
    img.classList.add('is-swapping');
    setTimeout(swap, 200);
  }));
}

// ปฏิทินกิจกรรม: กดวันที่มีกิจกรรม -> ไฮไลต์รายการที่ตรงกันในกำหนดการ
function initEventCalendar() {
  const days = qsa('[data-cal-event]');
  days.forEach(day => day.addEventListener('click', () => {
    const target = qs(`#${day.dataset.calEvent}`);
    days.forEach(d => d.classList.toggle('is-selected', d === day));
    qsa('.cal-event').forEach(ev => ev.classList.toggle('is-selected', ev === target));
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'nearest', behavior: reduce() ? 'auto' : 'smooth' });
  }));
}

function initBackTop() {
  const btn = qs('[data-back-top]');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  });

  btn.addEventListener('click', () => {
    scrollTo({
      top: 0,
      behavior: reduce() ? 'auto' : 'smooth'
    });
  });
}
function reduce() { return document.body.classList.contains('no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches }



function initAccessPanelEnhance() {
  const toggleMap = [
    ['[data-toggle-contrast]', 'high-contrast'],
    ['[data-readable]', 'readable-mode'],
    ['[data-reduce-motion]', 'no-motion'],
    ['[data-access-link]', 'access-link-mode'],
    ['[data-access-heading]', 'access-heading-mode'],
    ['[data-access-spacing]', 'access-spacing-mode'],
    ['[data-access-cursor]', 'access-cursor-mode']
  ];

  toggleMap.forEach(([selector, className]) => {
    qsa(selector).forEach(btn => {
      btn.addEventListener('click', () => {
        setTimeout(() => {
          const isOn = document.body.classList.contains(className);
          qsa(selector).forEach(item => item.classList.toggle('is-on', isOn));
        }, 0);
      });
    });
  });

  qsa('[data-access-reset]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.classList.remove(
        'high-contrast',
        'readable-mode',
        'no-motion',
        'access-link-mode',
        'access-heading-mode',
        'access-spacing-mode',
        'access-cursor-mode'
      );

      qsa('.access-setting-row, .access-quick-btn').forEach(item => {
        item.classList.remove('is-on');
      });

      // รีเซ็ตขนาดตัวอักษรผ่านปุ่ม "ก" ให้ตัวนับของ components.js กับไฟล์นี้กลับเป็น 0 พร้อมกัน
      document.querySelector('[data-font="reset"]')?.click();
    });
  });

  qsa('[data-access-link]').forEach(btn => {
    btn.addEventListener('click', () => document.body.classList.toggle('access-link-mode'));
  });

  qsa('[data-access-heading]').forEach(btn => {
    btn.addEventListener('click', () => document.body.classList.toggle('access-heading-mode'));
  });

  qsa('[data-access-spacing]').forEach(btn => {
    btn.addEventListener('click', () => document.body.classList.toggle('access-spacing-mode'));
  });

  qsa('[data-access-cursor]').forEach(btn => {
    btn.addEventListener('click', () => document.body.classList.toggle('access-cursor-mode'));
  });

  qsa('[data-access-reader]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = document.querySelector('#main-content')?.innerText?.slice(0, 600) || 'ยินดีต้อนรับ';
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        speechSynthesis.speak(new SpeechSynthesisUtterance(text));
      }
      btn.classList.toggle('is-on');
    });
  });
}


function initFAQEnhance() {
  const input = qs('#faq-search');
  const tabs = qsa('[data-faq-filter]');
  const items = qsa('.faq-list-modern .faq-item');
  const count = qs('#faq-count');
  const empty = qs('#faq-empty');

  if (!items.length) return;

  let active = 'all';

  function updateFAQ() {
    const keyword = input?.value.trim().toLowerCase() || '';
    let visible = 0;

    items.forEach(item => {
      const category = item.dataset.faqCategory || '';
      const text = item.textContent.toLowerCase();

      const matchCategory = active === 'all' || category === active;
      const matchKeyword = !keyword || text.includes(keyword);

      const show = matchCategory && matchKeyword;
      item.classList.toggle('is-hidden', !show);

      if (show) visible++;
    });

    if (count) {
      count.textContent = visible
        ? `พบ ${visible} คำถามที่เกี่ยวข้อง`
        : 'ไม่พบคำถามที่ตรงกับการค้นหา';
    }

    if (empty) empty.hidden = visible !== 0;
  }

  input?.addEventListener('input', updateFAQ);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      active = tab.dataset.faqFilter;
      tabs.forEach(t => t.classList.toggle('active', t === tab));
      updateFAQ();
    });
  });

  qsa('[data-faq-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      items.forEach(item => {
        if (item.classList.contains('is-hidden')) return;
        const q = item.querySelector('.faq-q');
        const a = item.querySelector('.faq-a');
        const icon = q?.querySelector('em');
        q?.setAttribute('aria-expanded', 'true');
        if (a) a.hidden = false;
        if (icon) icon.textContent = '−';
      });
    });
  });

  qsa('[data-faq-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      items.forEach(item => {
        const q = item.querySelector('.faq-q');
        const a = item.querySelector('.faq-a');
        const icon = q?.querySelector('em');
        q?.setAttribute('aria-expanded', 'false');
        if (a) a.hidden = true;
        if (icon) icon.textContent = '+';
      });
    });
  });

  updateFAQ();
}


function initServiceHub() {
  const serviceButtons = qsa('[data-service-card]');
  const title = qs('#service-title');
  const subtitle = qs('#service-subtitle');
  const serviceType = qs('#service-type');
  const submitBtn = qs('#service-submit-btn');

  if (!serviceButtons.length || !title || !subtitle || !serviceType || !submitBtn) return;

  serviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      title.textContent = btn.dataset.serviceTitle || 'เริ่มใช้บริการออนไลน์';
      subtitle.textContent = btn.dataset.serviceSubtitle || 'เลือกประเภทบริการ กรอกข้อมูล และรับเลขติดตามสถานะ';
      serviceType.value = btn.dataset.serviceType || serviceType.value;
      submitBtn.textContent = btn.dataset.serviceAction || 'ส่งคำขอ';
    }, true);
  });
}






init();
