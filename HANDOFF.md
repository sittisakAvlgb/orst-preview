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
├── index.html              ┐
├── knowledge.html          │ 3 หน้านี้เขียน HTML เองทั้งหมด (มี CSS/JS เฉพาะหน้า)
├── contact.html            ┘
│
├── about.html              ┐
├── dictionary.html         │ หน้าที่ขับด้วย JSON — ไฟล์ HTML เป็นโครงเปล่า ~30 บรรทัด
├── news.html               │ เนื้อหาจริงอยู่ที่ content/pages/<ชื่อ>.json
├── publications.html       │
├── services.html           ┘
├── styleguide.html         ★ คลังบล็อก — เปิดดูตัวอย่าง block ทุกชนิด
├── _template.html          ★ แม่แบบหน้าใหม่ (แบบ JSON) คัดลอกไฟล์นี้
├── _template-static.html   แม่แบบหน้าที่ต้องเขียน HTML เอง (ใช้เฉพาะกรณีพิเศษ)
│
├── content/                ★ เนื้อหาทั้งหมดอยู่ที่นี่ — จุดที่ CMS จะมาต่อ
│   ├── blocks.schema.json  JSON Schema ของไฟล์เนื้อหา (VS Code ใช้เติมคำ/ตรวจ error)
│   └── pages/
│       ├── about.json          1 หน้า = 1 ไฟล์
│       ├── dictionary.json
│       ├── news.json
│       ├── publications.json
│       ├── services.json
│       └── _styleguide.json    ตัวอย่าง block ครบทุกชนิด
│
├── assets/
│   ├── css/
│   │   ├── base.css        ตัวแปรดีไซน์ + reset + สไตล์พื้นฐานที่ใช้ทุกหน้า
│   │   ├── blocks.css      สไตล์ของ block ทุกชนิด
│   │   ├── components.css  header / topbar / mega menu / footer / modal
│   │   └── pages/
│   │       ├── home.css        สไตล์เฉพาะ index.html
│   │       ├── knowledge.css   สไตล์เฉพาะ knowledge.html
│   │       └── contact.css     สไตล์เฉพาะ contact.html
│   ├── js/
│   │   ├── components.js   ★ header/footer/เมนู/ไอคอน — แก้ที่เดียว มีผลทุกหน้า
│   │   ├── blocks.js       ★ ตัวแปลง JSON เป็น HTML (pure function รันใน Node ได้)
│   │   ├── page-runtime.js ตัวโหลด JSON แล้ว render (ES module)
│   │   └── pages/
│   │       ├── home.js
│   │       ├── knowledge.js
│   │       └── contact.js
│   └── images/             รูปภาพทั้งหมด
│
├── tools/
│   ├── validate.mjs        ตรวจไฟล์เนื้อหาทั้งหมด — รันก่อน commit
│   └── build.mjs           สร้าง HTML นิ่งลง dist/ สำหรับ production
│
├── _archive/               โค้ดเก่าที่ไม่ได้ใช้แล้ว เก็บไว้อ้างอิง (ไม่ถูกโหลด)
├── CONTENT-MODEL.md        คลังบล็อก 14 ชนิด พร้อมตัวอย่าง JSON
├── CLAUDE.md               กฎการทำงานสำหรับ AI agent
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
2) assets/css/blocks.css            สไตล์ของ block (เฉพาะหน้าที่ขับด้วย JSON)
3) assets/css/pages/<ชื่อหน้า>.css   สไตล์เฉพาะหน้า (เฉพาะ 3 หน้าที่เขียน HTML เอง)
4) assets/css/components.css        ★ ต้องอยู่ท้ายสุดเสมอ
```

เหตุผล: เดิม CSS ของ header/footer ถูก inject ผ่าน JavaScript ตอน runtime จึงชนะทุกไฟล์
เมื่อย้ายออกมาเป็นไฟล์จริงแล้ว ต้องวางไว้ท้ายสุดเพื่อรักษาหน้าตาเดิมไว้

### ลำดับการโหลด JS

```
1) assets/js/components.js          classic script — ต้องมาก่อนเสมอ
2) assets/js/page-runtime.js        module — หน้าที่ขับด้วย JSON
   หรือ assets/js/pages/<หน้า>.js    หน้าที่เขียน HTML เอง
```

---

## 4. วิธีเพิ่มหน้าใหม่

หน้าทั่วไปทุกหน้าใช้ระบบ **JSON + block library** — เนื้อหาอยู่ในไฟล์ JSON ไฟล์เดียว
ไม่ต้องเขียน HTML และไม่ต้องเขียน CSS

### ขั้นตอน

**1. สร้างไฟล์เนื้อหา** `content/pages/<slug>.json`

```json
{
  "$schema": "../blocks.schema.json",
  "title": "ชื่อหน้า",
  "navKey": "about",
  "description": "คำอธิบายหน้า 1-2 ประโยค",
  "blocks": [
    { "type": "page-hero", "heading": "ชื่อหน้า", "lead": "คำโปรย" },
    { "type": "card-grid", "variant": "alt", "heading": "หัวข้อ", "columns": 3,
      "items": [{ "title": "การ์ด", "body": "เนื้อหา", "href": "#" }] }
  ]
}
```

ใส่ `"$schema"` ไว้บรรทัดแรกแล้ว VS Code จะเติมคำและขีดเส้นแดงให้อัตโนมัติ

**2. สร้างไฟล์ HTML** — คัดลอก `_template.html` เป็น `<slug>.html` แล้วแก้ 4 จุด

| แก้ | เป็น |
|---|---|
| `<title>` | ชื่อหน้า |
| `<meta name="description">` | คำอธิบายหน้า |
| `<body data-page="...">` | ต้องเท่ากับ `navKey` ใน JSON |
| `data-content="..."` | ต้องชี้ไป `content/pages/<slug>.json` |

**3. เพิ่มลิงก์ในเมนู** (ถ้าเป็นหน้าหลักของหมวด) — แก้ `navItems` / `megaMenuData`
ใน `assets/js/components.js`

**4. ตรวจงาน**

```bash
node tools/validate.mjs
```

ตรวจให้ครบว่า: โครงสร้าง JSON ถูก · block ทุกตัวมีฟิลด์บังคับ · `navKey` ตรงกับ `data-page`
· ไอคอนมีอยู่จริง · รูปมีอยู่จริง · ลิงก์ภายในไม่เสีย

### บล็อกที่ใช้ได้ 14 ชนิด

`page-hero` · `rich-text` · `card-grid` · `feature-list` · `stat-row` · `link-list` ·
`media-grid` · `table` · `faq` · `steps` · `two-column` · `cta-band` · `notice` · `contact-info`

ตัวอย่าง JSON ของทุกชนิดอยู่ใน **[CONTENT-MODEL.md](CONTENT-MODEL.md)**
และเปิดดูของจริงได้ที่ **`styleguide.html`**

### ถ้าหน้านั้นต้อง layout พิเศษจริง ๆ

ใช้ `_template-static.html` แทน แล้วเขียน HTML/CSS/JS เฉพาะหน้าเอง
(วิธีนี้ CMS จะจัดการเนื้อหาให้ไม่ได้ — ใช้เท่าที่จำเป็น)

### สร้าง HTML นิ่งสำหรับขึ้น production

```bash
node tools/build.mjs
```

อ่าน JSON แล้วเขียนเนื้อหาลงไฟล์ HTML จริงในโฟลเดอร์ `dist/`
ใช้ตัว render ตัวเดียวกับเบราว์เซอร์ ผลลัพธ์ตรงกันทุกตัวอักษร (ตรวจแล้ว)
ทำให้ Google และ screen reader เห็นเนื้อหาโดยไม่ต้องรอ JavaScript

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

### 6.6 header/footer ยังไม่ได้ต่อ CMS

เนื้อหาเมนูและ footer ยังเป็นข้อมูลในโค้ด (`navItems`, `megaMenuData`, `renderFooter()`
ใน `assets/js/components.js`) ต่างจากเนื้อหาหน้าที่แยกเป็น JSON แล้ว

เหตุผลที่ยังไม่ย้าย: header ถูก render แบบ synchronous ถ้าเปลี่ยนไป fetch JSON
จะเกิดอาการเมนูกะพริบตอนโหลด ต้องออกแบบเพิ่ม

วิธีย้ายเมื่อพร้อม: ให้ `components.js` อ่านจาก `window.ORST_SITE` ถ้ามี
แล้วโหลด `content/site.js` (ไฟล์ข้อมูลที่ CMS สร้าง) ด้วย `<script>` ธรรมดาก่อน `components.js`
วิธีนี้ไม่ต้อง fetch จึงไม่กะพริบ

### 6.7 หน้าที่ยังแปลงเป็น block ไม่ได้

`index.html`, `knowledge.html`, `contact.html` ยังเป็น HTML ที่เขียนเอง
CMS จะจัดการเนื้อหา 3 หน้านี้ไม่ได้จนกว่าจะแตกเป็น block ก่อน
เป็นงานใหญ่ ควรทำหลังเนื้อหาหน้าอื่นนิ่งแล้ว

### 6.8 ยังไม่ได้ทำ

- สลับภาษา TH | EN บน topbar เป็นข้อความเฉย ๆ ยังไม่ทำงาน
- "เข้าสู่ระบบ / สมัครสมาชิก" และ "สำหรับเจ้าหน้าที่" ยังเป็น `href="#"`
- ยังไม่มี Open Graph meta (แชร์ลิงก์แล้วไม่มีรูปพรีวิว)
- `robots.txt` / `sitemap.xml` / `404.html` / `netlify.toml` ทำแล้ว ดูหัวข้อ 10
- ยังไม่มี CI ที่รัน `node tools/validate.mjs` อัตโนมัติตอน push

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

## 8. รอบที่สอง — ระบบ block สำหรับ AI และ CMS

รอบนี้เพิ่มโครงสร้างให้ AI สร้างหน้าใหม่ได้ตามแบบแผน และให้ต่อ CMS ได้ภายหลังโดยไม่ต้องรื้อ

### แนวคิด

```
content/pages/about.json  ──►  assets/js/blocks.js  ──►  HTML
   เนื้อหา (CMS แก้ที่นี่)        ตัวแปลง (pure function)      หน้าเว็บ
```

ตัวแปลงเป็นฟังก์ชันบริสุทธิ์ที่ไม่แตะ DOM จึงรันได้ทั้งในเบราว์เซอร์และใน Node
ทำให้ได้ทั้งโหมด "แก้ JSON แล้วรีเฟรชเห็นเลย" และโหมด "build เป็น HTML นิ่งเพื่อ SEO"
โดยใช้โค้ดชุดเดียวกัน — ยืนยันแล้วว่าผลลัพธ์ตรงกันทุกตัวอักษร

### สิ่งที่เพิ่มเข้ามา

| ไฟล์ | คืออะไร |
|---|---|
| `assets/js/blocks.js` | คลังบล็อก 14 ชนิด + ตัวตรวจความถูกต้อง |
| `assets/js/page-runtime.js` | โหลด JSON แล้ว render (ข้ามอัตโนมัติถ้าหน้าถูก build มาแล้ว) |
| `assets/css/blocks.css` | สไตล์ของ block — ใช้ตัวแปรสีล้วน ไม่ฮาร์ดโค้ด |
| `content/blocks.schema.json` | JSON Schema — VS Code เติมคำและตรวจ error ให้ขณะพิมพ์ |
| `content/pages/*.json` | เนื้อหา 5 หน้า + ไฟล์ตัวอย่างครบทุก block |
| `tools/validate.mjs` | ตรวจเนื้อหาทั้งหมด ใช้ใน CI ได้ (exit code 1 เมื่อพบ error) |
| `tools/build.mjs` | สร้าง HTML นิ่งลง `dist/` |
| `styleguide.html` | คลังบล็อกแบบเปิดดูได้จริง |
| `CONTENT-MODEL.md` | คู่มือคลังบล็อกสำหรับคนทำเนื้อหา |
| `CLAUDE.md` / `AGENTS.md` | กฎการทำงานสำหรับ AI agent |

### หน้าที่แปลงเป็นระบบ JSON แล้ว

`dictionary` · `news` · `publications` · `services` และหน้าใหม่ `about`
ทั้งหมดผ่านการตรวจ: render ครบทุก block, เมนูไฮไลต์ถูกหน้า, ไม่มี console error,
ไม่มีไอคอนเสีย, โหมด high-contrast / readable-mode ทำงานกับทุก block

### เนื้อหาเป็น placeholder

ข้อความในวงเล็บเหลี่ยม `[...]` คือจุดที่ต้องเติมข้อมูลจริง — **ตั้งใจไม่ใส่ข้อมูลสมมติ**
ของหน่วยงานราชการ (เบอร์โทร ที่อยู่ วันที่ ตัวเลขสถิติ) เพราะอาจถูกเข้าใจผิดว่าเป็นข้อมูลจริง
`node tools/validate.mjs` จะรายงานจำนวน placeholder ที่ยังค้างอยู่ในแต่ละไฟล์ให้

### บั๊กที่พบเพิ่มในรอบนี้

- ไอคอน `i-chevron`, `i-map`, `i-phone`, `i-arrow`, `i-plus`, `i-pen`, `i-puzzle`
  มีอยู่เฉพาะใน sprite ที่ฝังใน `index.html` หน้าอื่นจึงเรียกใช้ไม่ได้
  → ย้ายเข้า sprite กลางใน `components.js` ครบแล้ว (ตอนนี้มี 25 ไอคอน)
- `.content-card` ใน `base.css` ตั้งพื้นหลังเป็น `#fff` ตายตัว โหมด high-contrast จึงไม่มีผล
  → `blocks.css` บังคับให้การ์ดของ block ใช้ `var(--surface)` แทน
  (ไม่ได้แก้ `base.css` เพื่อไม่ให้ 3 หน้าเดิมเปลี่ยนหน้าตา — ถือเป็นหนี้ที่เหลืออยู่)

---

## 9. Git

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

---

## 10. ขึ้น production บน Netlify

### อัพขึ้นเฉพาะโฟลเดอร์ `dist/`

```bash
$env:SITE_URL = "https://ชื่อเว็บ.netlify.app"; node tools/build.mjs
```

แล้วลากโฟลเดอร์ `dist` ไปวางที่ [app.netlify.com/drop](https://app.netlify.com/drop)
หรือหน้า **Deploys → Deploy manually** ของไซต์ที่มีอยู่แล้ว

`SITE_URL` คือโดเมนจริงของเว็บ ใช้สร้าง `sitemap.xml` และเติมบรรทัด `Sitemap:` ใน `robots.txt`
ถ้าไม่ตั้ง build ยังทำงานปกติ แต่จะข้าม `sitemap.xml` และตัดบรรทัดนั้นทิ้ง (ดีกว่าปล่อย URL ผิดขึ้นเว็บ)

**ห้ามอัพ** `tools/` `_archive/` `.vscode/` `.git/` `*.md` `_template.html` `_template-static.html`
(ไม่ได้อยู่ใน `dist/` อยู่แล้ว — `build.mjs` คัดเฉพาะที่ต้องใช้)

### ไฟล์ที่เกี่ยวกับการ deploy

| ไฟล์ | อยู่ที่ | ทำอะไร |
|---|---|---|
| `404.html` | ราก + `dist/` | Netlify หยิบไปเสิร์ฟให้ทุก URL ที่ไม่มีจริงโดยอัตโนมัติ |
| `robots.txt` | ราก + `dist/` | เปิดให้ค้นเจอทุกหน้า ยกเว้น `styleguide.html` |
| `sitemap.xml` | `dist/` เท่านั้น | `build.mjs` สร้างให้จากหน้าที่มีจริง ไม่ต้องแก้มือ |
| `_headers` | ราก + `dist/` | security header ใช้ตอนลากโฟลเดอร์ไปวางเอง |
| `netlify.toml` | ราก | ใช้เฉพาะตอนต่อ Netlify เข้ากับ Git (build command + publish dir + header ชุดเดียวกับ `_headers`) |

แก้ header ที่ `_headers` แล้วต้องแก้ `netlify.toml` ให้ตรงกันด้วย เพราะคนละเส้นทาง deploy อ่านคนละไฟล์

### เรื่องที่ `404.html` ต่างจากหน้าอื่น

Netlify เสิร์ฟ `404.html` ให้ทุก URL ที่ไม่มีจริง โดย**ไม่เปลี่ยน URL บนแถบที่อยู่**
เช่นคนเปิด `/a/b/c` หน้าที่ได้คือ 404 แต่เบราว์เซอร์ยังคิดว่าตัวเองอยู่ที่ `/a/b/`
ลิงก์และไฟล์แบบ relative ทั้งหน้าจึงชี้ผิดหมด รวมถึงลิงก์ที่ `components.js` สร้าง

แก้ด้วย `<base href="/">` ใน `<head>` ของ `404.html` — **ห้ามลบบรรทัดนี้**
ผลข้างเคียงที่ยอมรับได้คือลิงก์ที่เป็น `#...` บนหน้านี้ (เช่นปุ่มข้ามไปเนื้อหา) จะพากลับหน้าแรกแทน

### ยังไม่ได้ทำ

- **ลิงก์ตาย 4 จุด** จะขึ้น 404 บนเว็บจริง — `contact.html` ชี้ `/privacy`,
  `index.html` ชี้ `calendar.html` `ebooks.html` `faq.html` (ยังไม่มี 3 หน้านี้)
- **รูปรวม 45 MB จาก `dist` 46 MB** — `orst-bg2.png` 3 MB, `Mult-03.png` 2.6 MB และอีกหลายไฟล์
  ระดับ 2 MB ควรย่อ/แปลงเป็น WebP ก่อนเปิดให้คนทั่วไปใช้
- ฟอร์มใน `contact.html` ยังไม่ส่งไปไหน — บน Netlify เติม `data-netlify="true"` ที่ `<form>`
  แล้วใช้ Netlify Forms รับข้อมูลได้เลยโดยไม่ต้องมี backend
- ยังไม่มี Open Graph meta

### เช็กก่อนกด deploy

`tools/validate.mjs` ไม่ได้ตรวจตัวพิมพ์ใหญ่-เล็กของชื่อไฟล์ เพราะ Windows ไม่แยก
แต่ Netlify รันบน Linux ที่แยก — ไฟล์อย่าง `NLT_LOGO.jpg` `ConnectedNetwork01.JPG` `e-Book01.png`
ถ้าเขียนผิดตัวพิมพ์จะขึ้นบนเครื่องตัวเองได้แต่พังบนเว็บจริง
ตรวจรอบล่าสุดแล้วผ่านทั้ง 121 ลิงก์ ถ้าเพิ่มรูปใหม่ให้ระวังจุดนี้
