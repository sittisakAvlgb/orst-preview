# คู่มือส่งมอบโปรเจกต์ — เว็บไซต์สำนักงานราชบัณฑิตยสภา (ORST)

เอกสารนี้สำหรับทีม UX/UI ที่จะรับงานไปทำหน้าอื่นต่อ
อ่านหัวข้อ **1–4** ก่อนเริ่มงาน แล้วค่อยกลับมาอ่านหัวข้อ 5–7 ตอนต้องแก้ของเดิม

---

## 1. เริ่มต้นใช้งาน

โปรเจกต์นี้เป็น **static website ล้วน** ไม่มี build step ไม่ต้อง `npm install`

1. เปิดโฟลเดอร์นี้ใน VS Code
2. ติดตั้ง extension **Live Server**
3. คลิกขวาที่ `index.html` → **Open with Live Server** (พอร์ต 5501)

> เปิดไฟล์ HTML ตรง ๆ ด้วย `file://` จะไม่ทำงาน เพราะ header/footer ถูกโหลดผ่าน JavaScript

---

## 2. โครงสร้างโปรเจกต์

```
ORST Website/
├── index.html              หน้าหลัก
├── knowledge.html          คลังองค์ความรู้
├── contact.html            ติดต่อเรา
├── dictionary.html         ┐
├── news.html               │ 4 หน้านี้ยังเป็นโครงเปล่า
├── publications.html       │ รอทีม UX/UI ทำเนื้อหาจริง
├── services.html           ┘
├── _template.html          ★ แม่แบบสำหรับสร้างหน้าใหม่ (คัดลอกไฟล์นี้)
│
├── assets/
│   ├── css/
│   │   ├── base.css        ตัวแปรดีไซน์ + reset + สไตล์พื้นฐานที่ใช้ทุกหน้า
│   │   ├── components.css  header / topbar / mega menu / footer / modal
│   │   └── pages/
│   │       ├── home.css        สไตล์เฉพาะ index.html
│   │       ├── knowledge.css   สไตล์เฉพาะ knowledge.html
│   │       └── contact.css     สไตล์เฉพาะ contact.html
│   ├── js/
│   │   ├── components.js   ★ header/footer/เมนู — แก้ที่เดียว มีผลทุกหน้า
│   │   └── pages/
│   │       ├── home.js
│   │       ├── knowledge.js
│   │       └── contact.js
│   └── images/             รูปภาพทั้งหมด
│
├── _archive/               โค้ดเก่าที่ไม่ได้ใช้แล้ว เก็บไว้อ้างอิง (ไม่ถูกโหลด)
├── HANDOFF.md              เอกสารนี้
└── README.md               สรุปสั้น
```

---

## 3. หัวใจของระบบ — header/footer ชุดเดียวใช้ทุกหน้า

ทุกหน้ามีแค่ **จุดยึด 2 จุด** แล้ว `components.js` จะเติม HTML ให้เอง

```html
<body data-page="news">        <!-- บอกว่าหน้านี้คือเมนูไหน -->
  <div id="app-header"></div>   <!-- header + topbar + mega menu ถูกเติมตรงนี้ -->
  <main id="main-content"> ... </main>
  <div id="app-footer"></div>   <!-- footer ถูกเติมตรงนี้ -->
  <script src="assets/js/components.js"></script>
```

**ห้ามเขียน `<header>` หรือ `<footer>` เองในหน้า** ให้ไปแก้ที่ `components.js` แทน

`components.js` ทำงานเหล่านี้ให้อัตโนมัติทุกหน้า:
`initMegaMenu` · `initMobileMenu` · `initSharedModals` · `initSharedSearch` ·
`initMediaTabs` · `initCompactFAQ` · `initNewsEventsTabs` · `initSharedAccessibility` ·
`initFixedHeader` (คำนวณความสูง header ที่เป็น `position: fixed` แล้วดัน `<body>` ลงมา)

### ลำดับการโหลด CSS — สำคัญมาก ห้ามสลับ

```
1) assets/css/base.css              ตัวแปร + พื้นฐาน
2) assets/css/pages/<ชื่อหน้า>.css   สไตล์เฉพาะหน้า
3) assets/css/components.css        ★ ต้องอยู่ท้ายสุดเสมอ
```

เหตุผล: เดิม CSS ของ header/footer ถูก inject ผ่าน JavaScript ตอน runtime จึงชนะทุกไฟล์
เมื่อย้ายออกมาเป็นไฟล์จริงแล้ว ต้องวางไว้ท้ายสุดเพื่อรักษาหน้าตาเดิมไว้

### ลำดับการโหลด JS

```
1) assets/js/components.js          ต้องมาก่อนเสมอ
2) assets/js/pages/<ชื่อหน้า>.js     (ถ้ามี)
```

---

## 4. วิธีเพิ่มหน้าใหม่

1. คัดลอก **`_template.html`** เป็นชื่อหน้าใหม่ เช่น `about.html`
2. แก้ `<title>`, `<meta name="description">`, `<h1>`, เนื้อหาใน `<main>`
3. แก้ `<body data-page="about">` ให้ตรงกับ **key** ในตาราง navItems ด้านล่าง
   (เพื่อให้เมนูไฮไลต์หน้าปัจจุบันถูก)
4. ถ้าต้องมีสไตล์เฉพาะหน้า สร้าง `assets/css/pages/about.css`
   แล้วเปิดคอมเมนต์บรรทัด `<link ... pages/about.css>` ใน `<head>`
   (ต้องอยู่ **ก่อน** `components.css`)
5. ถ้าต้องมีสคริปต์เฉพาะหน้า สร้าง `assets/js/pages/about.js`
   แล้วเปิดคอมเมนต์บรรทัด `<script src="assets/js/pages/about.js">`
   (ต้องอยู่ **หลัง** `components.js`)

### แก้เมนูหลัก

เปิด `assets/js/components.js`

| ตัวแปร | บรรทัดประมาณ | ใช้ทำอะไร |
|---|---|---|
| `navItems` | 29 | รายการเมนูบนสุด `[key, ชื่อที่แสดง, ลิงก์]` |
| `megaMenuData` | 40 | เนื้อหา mega menu ที่กางลงมาของแต่ละหมวด |
| `icons` | 3 | คลัง SVG icon (เรียกใช้ด้วย `icon('i-book')`) |
| `renderFooter()` | ~470 | เนื้อหา footer |

**key ของเมนูที่ใช้อยู่:** `home` · `dictionary` · `knowledge` · `publications` ·
`news` · `services` · `about` · `contact`

**หมวดที่มี mega menu:** `dictionary` · `knowledge` · `publications` · `news` ·
`services` · `about`

---

## 5. ตัวแปรดีไซน์ (Design tokens)

ประกาศไว้ที่ `:root` ใน `assets/css/base.css` และถูกทับบางตัวโดย `components.css`
**ค่าที่มีผลจริง** (หลังรวมทั้งสองไฟล์แล้ว) คือ:

| ตัวแปร | ค่า | ใช้กับ |
|---|---|---|
| `--paper` | `#fbf7ef` | พื้นหลังหน้า |
| `--surface` | `#fffdf8` | พื้นการ์ด/กล่อง |
| `--surface-soft` | `#fbf7ef` | พื้นรอง |
| `--ink` | `#102033` | ตัวอักษรหลัก |
| `--muted` | `#667085` | ตัวอักษรรอง |
| `--deep` | `#073b34` | เขียวเข้ม (สีหลักองค์กร) |
| `--deep-2` | `#124c43` | เขียวรอง |
| `--gold` | `#b99143` | ทอง (สีเน้น) |
| `--gold-soft` | `#fff4db` | ทองอ่อน |
| `--line` | `rgba(185,145,67,.24)` | เส้นขอบ |
| `--radius` | `18px` | มุมโค้ง |
| `--container` | `1800px` / `1120px` เมื่อจอ ≤ 1280px | ความกว้างสูงสุดของ `.container` |

**โหมดการเข้าถึง** ทำงานโดยสลับ class ที่ `<body>` แล้วเขียนทับตัวแปรข้างบน:
`.high-contrast` · `.readable-mode` · `.no-motion`
ปุ่มควบคุมอยู่บน topbar (`[data-contrast]`, `[data-font]`, `[data-readable]`, `[data-motion]`)

### คลาสพื้นฐานที่ใช้ซ้ำได้

`.container` · `.section` / `.section.alt` · `.page-hero` · `.content-card` ·
`.grid-3` · `.btn` · `.result-card` · `.modal` · `.icon` / `.icon-lg` · `.reveal`
(`.reveal` = element จะค่อย ๆ ปรากฏเมื่อ scroll ถึง)

---

## 6. หนี้ทางเทคนิค — สิ่งที่ยังไม่เสร็จ / ต้องระวัง

เรียงตามความสำคัญ

### 6.1 ยังไม่มี backend เลย

ทั้งเว็บไม่มี `fetch` และไม่มี API ข้อมูลทุกอย่างเป็น **mock ฝังในไฟล์ JS**

- ผลการค้นหา → ตัวแปร `searchData` ใน `assets/js/pages/home.js`
- ฟอร์มติดต่อใน `contact.html` → ตรวจค่าฝั่งหน้าเว็บอย่างเดียว **ไม่ส่งไปที่ไหน**
- ตัวตรวจภาษา "AI Proof" → กฎตัวอย่าง 8 ข้อใน `proofRules` ไม่ใช่ระบบจริง

### 6.2 หน้าหลักมีระบบค้นหาซ้อนกัน 3 ชั้น

ใน `assets/js/pages/home.js` มีโค้ดค้นหา 3 ชุด ที่เขียนผลลง `#search-results`
และ `#search-status` **ชุดเดียวกัน** ผลที่ผู้ใช้เห็นคือชุดที่ทำงานทีหลังสุด
และมี `searchData` คนละชุด (12 รายการ / 8 รายการ) ที่เนื้อหาไม่ตรงกัน

→ **ก่อนต่อ API จริง ควรยุบให้เหลือชั้นเดียวก่อน**

### 6.3 CSS ของ header/footer ยังซ้ำอยู่ 2 ที่

`assets/css/pages/home.css`, `knowledge.css`, `contact.css` ยังมีสไตล์
header/topbar/footer/modal ของเดิมค้างอยู่ (ถูก `components.css` ทับเกือบทั้งหมด)
คงไว้เพื่อไม่ให้หน้าตาเปลี่ยนตอนส่งมอบ

→ **ถ้าจะแก้ header/footer ให้แก้ที่ `components.css` เท่านั้น**
→ การล้างของซ้ำออกควรทำทีละบล็อกพร้อมเทียบภาพก่อน/หลัง

### 6.4 ลิงก์ที่ยังไม่มีปลายทาง

- `index.html` มี `<a href="#archive">` 3 จุด ในส่วน "บริการสำคัญที่ใช้งานบ่อย"
  แต่ section `id="archive"` ถูก comment ทิ้งไปตั้งแต่ก่อนส่งมอบ → คลิกแล้วไม่ไปไหน
- ลิงก์ `href="#"` ใน `megaMenuData` และ footer อีกจำนวนมาก ยังรอหน้าปลายทาง

### 6.5 แท็บสื่อบนหน้าหลัก

มี 5 panel (`ebook`, `journals`, `encyclopedia`, `research`, `multimedia`)
แต่มีปุ่มแท็บแค่ 4 อัน → **panel `research` เข้าไม่ถึง**
และปุ่ม "อินโฟกราฟิก" ชี้ไปที่ panel ที่มีเนื้อหาสารานุกรม (ชื่อปุ่มกับเนื้อหาไม่ตรงกัน)

→ เป็นเรื่องเนื้อหา ต้องให้ทีมตัดสินใจว่าจะแก้ชื่อปุ่มหรือแก้เนื้อหา

### 6.6 ยังไม่ได้ทำ

- ยังไม่มีหน้า `about.html` ทั้งที่เมนูมี key `about` แล้ว (ตอนนี้ลิงก์เป็น `#`)
- สลับภาษา TH | EN บน topbar เป็นข้อความเฉย ๆ ยังไม่ทำงาน
- "เข้าสู่ระบบ / สมัครสมาชิก" และ "สำหรับเจ้าหน้าที่" ยังเป็น `href="#"`
- ยังไม่มี `robots.txt` / `sitemap.xml` / Open Graph meta

---

## 7. สิ่งที่ทำไปในรอบจัดระเบียบโค้ด

ทุกอย่างถูกตรวจสอบด้วยการเทียบ **computed style ของทุก element** ก่อน/หลัง
ผลลัพธ์: `index.html`, `knowledge.html`, `contact.html` = **ต่างกัน 0 จุด**
(ยกเว้น id ที่ตั้งใจแก้) และพฤติกรรม (ค้นหา / แท็บ / โหมดการเข้าถึง) เหมือนเดิมทุกข้อ

| เรื่อง | ก่อน | หลัง |
|---|---|---|
| `index.html` | 15,169 บรรทัด (483 KB) | 1,866 บรรทัด |
| CSS ฝังใน HTML | 12,863 บรรทัด | 0 |
| JS ฝังใน HTML | 1,600+ บรรทัด | 0 |
| CSS ที่ inject ผ่าน JS | 1,030 บรรทัด | ย้ายเป็น `components.css` |
| โค้ดที่ comment ทิ้ง | 1,610 บรรทัด | ย้ายไป `_archive/` |

### บั๊กที่พบและแก้ระหว่างทาง

1. หน้า `dictionary` / `news` / `publications` / `services` — header เป็น
   `position: fixed` แต่ไม่มีโค้ดดัน `<body>` ลงมา ทำให้เนื้อหาถูก header ทับ
   → แก้โดยย้าย `initFixedHeader()` เข้า `components.js` ทุกหน้าจึงได้ผลอัตโนมัติ
2. ปุ่มแท็บ "สื่อมัลติมีเดีย" ใช้ `id="tab-encyclopedia"` ซ้ำกับปุ่มอื่น (HTML ไม่ถูกต้อง)
   และชี้ไป panel ผิด → แก้เป็น `id="tab-multimedia"` / `panel-multimedia`
3. ไอคอน `i-book` มี SVG path ผิดรูป (`A2.5 0 0 1` ขาดค่ารัศมี) ทำให้ console ขึ้น
   error ทุกครั้งที่ใช้ไอคอนนี้ → แก้เป็น `A2.5 2.5 0 0 1`
4. `contact.html` ไม่มี `data-page` เมนู "ติดต่อเรา" จึงไม่เคยไฮไลต์
   → เพิ่ม `<body data-page="contact">`
5. เพิ่ม favicon (เดิมขึ้น 404 ทุกหน้า)
6. `url()` ของรูปใน CSS ที่ย้ายไฟล์ → แก้ path ให้ถูกต้อง

ตรวจครบทั้ง 7 หน้าแล้วว่า header ขึ้นครบ 8 เมนู, ไฮไลต์เมนูปัจจุบันถูกต้อง,
footer ขึ้นครบ, เนื้อหาไม่ถูก header ทับ และ console ไม่มี error

### โค้ดที่ลบ/ย้ายออก

- `assets/js/script.js` — ทำงานก่อน header ถูกสร้าง จึงไม่เคยผูก event ใด ๆ → ลบ
- โค้ด "ค้นหาขั้นสูง" 3 ชุด (~280 บรรทัด) ที่ผูกกับ `#advanced-modal`
  ซึ่งไม่มี markup อยู่ในหน้า → ย้ายไป `_archive/advanced-search-modal.js`
  (CSS ยังอยู่ครบใน `home.css` ถ้าจะทำฟีเจอร์นี้ต่อ)
- โค้ด JS/CSS ที่คัดลอกซ้ำกันทั้งดุ้น (187 + 49 บรรทัด) → ลบตัวซ้ำ

### ใน `_archive/` มีอะไร

โฟลเดอร์นี้ **ไม่ถูกโหลดโดยหน้าเว็บ** เก็บไว้อ้างอิงอย่างเดียว

- `index.legacy-2025-05-19.html` — index.html เวอร์ชันเก่า (เดิมชื่อ `index - Copy.html`)
- `removed-commented-sections.html` — section รุ่นเก่าที่เคย comment ค้างในหน้าเว็บ
- `advanced-search-modal.js` — โค้ดค้นหาขั้นสูงที่ยังไม่ได้ใช้

---

## 8. Git

โปรเจกต์ถูกทำเป็น git repository แล้ว ประวัติมีจุดสำคัญคือ

```
chore: baseline before cleanup (as delivered at bid)   ← สภาพตอนส่งประมูล
refactor: แยก CSS/JS ออกจาก HTML ...
chore: ลบโค้ดที่ comment ทิ้ง ...
chore: เอกสารส่งมอบ + แม่แบบหน้าใหม่ ...
```

ย้อนดูไฟล์เวอร์ชันเดิมได้ด้วย

```bash
git log --oneline
```

```bash
git show <commit>:index.html
```
