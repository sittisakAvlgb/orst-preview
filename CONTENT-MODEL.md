# Content Model — โครงสร้างเนื้อหาและคลังบล็อก

เอกสารอ้างอิงสำหรับคนเขียนเนื้อหาและ AI ที่สร้างหน้าใหม่
ดูของจริงที่ **[styleguide.html](styleguide.html)** (เปิดผ่าน Live Server) ซึ่งแสดง block ทุกชนิด

---

## 1. หลักการ

หน้าเว็บ 1 หน้า = ไฟล์ JSON 1 ไฟล์ + ไฟล์ HTML บาง ๆ 1 ไฟล์

```
content/pages/about.json   ← เนื้อหาทั้งหมดอยู่ที่นี่ (คนทำเนื้อหา / CMS แก้ไฟล์นี้)
about.html                 ← โครงเปล่า 30 บรรทัด ไม่ต้องแตะอีก
```

JSON ประกอบด้วย **ลำดับของ block** เรียงจากบนลงล่าง แต่ละ block คือหนึ่ง section บนหน้าเว็บ
`assets/js/blocks.js` แปลง block เป็น HTML — ตัวเดียวกันนี้ใช้ทั้งตอน render ในเบราว์เซอร์
และตอนสร้าง HTML นิ่งด้วย `node tools/build.mjs` ผลลัพธ์จึงตรงกันเป๊ะ

---

## 2. โครงไฟล์เนื้อหา

```json
{
  "$schema": "../blocks.schema.json",
  "title": "เกี่ยวกับเรา",
  "navKey": "about",
  "description": "ประวัติ ภารกิจ และโครงสร้างองค์กร",
  "blocks": [ ... ]
}
```

| ฟิลด์ | บังคับ | ใช้ทำอะไร |
|---|:--:|---|
| `$schema` | | ทำให้ VS Code เติมคำและตรวจ error ให้อัตโนมัติ — ควรใส่ทุกไฟล์ |
| `title` | ✓ | ใช้ทำ `<title>` โดยต่อท้ายด้วย ` \| สำนักงานราชบัณฑิตยสภา` |
| `seoTitle` | | ถ้าต้องการกำหนด `<title>` เองทั้งหมด |
| `navKey` | ✓ | ต้องตรงกับ `data-page` ในไฟล์ HTML เพื่อให้เมนูไฮไลต์ถูกหน้า |
| `description` | | meta description |
| `blocks` | ✓ | ลำดับ block บนหน้า |
| `_note` | | บันทึกภายในทีม ไม่ถูกแสดงผล |

**ค่าที่ `navKey` รับได้:** `home` `dictionary` `knowledge` `publications` `news` `services` `about` `contact`

---

## 3. ฟิลด์ที่ block ทุกตัวใช้ได้

| ฟิลด์ | ค่า | ผล |
|---|---|---|
| `id` | string | ใส่เป็น `id` ของ `<section>` ใช้ทำ anchor link เช่น `about.html#mission` |
| `variant` | `default` \| `alt` | `alt` = พื้นหลังสีขาว, `default` = พื้นสีกระดาษ **สลับไปมาเพื่อให้แต่ละ section แยกกันชัด** |
| `heading` | string | หัวข้อของ section |
| `lead` | string | คำโปรยใต้หัวข้อ |
| `eyebrow` | string | ข้อความตัวเล็กสีทองเหนือหัวข้อ |
| `action` | `{label, href}` | ปุ่มมุมขวาบนของ section เช่น "ดูทั้งหมด" |

---

## 4. คลังบล็อก 14 ชนิด

### `page-hero` — หัวหน้าเพจ
ใช้หน้าละ 1 อัน และควรเป็น block แรกเสมอ

```json
{
  "type": "page-hero",
  "eyebrow": "About Us",
  "heading": "เกี่ยวกับเรา",
  "lead": "ประวัติ ภารกิจ และโครงสร้างองค์กร",
  "breadcrumb": [
    { "label": "หน้าหลัก", "href": "index.html" },
    { "label": "เกี่ยวกับเรา" }
  ],
  "actions": [{ "label": "ดาวน์โหลดเอกสาร", "href": "#" }]
}
```
`breadcrumb` รายการสุดท้ายไม่ต้องใส่ `href` (คือหน้าปัจจุบัน)

---

### `rich-text` — ข้อความยาว

```json
{ "type": "rich-text", "heading": "ภาพรวม",
  "paragraphs": ["ย่อหน้าที่หนึ่ง", "ย่อหน้าที่สอง"] }
```
| ฟิลด์ | ใช้ทำอะไร |
|---|---|
| `paragraphs` | array ของย่อหน้า — **ใช้ตัวนี้เป็นค่าเริ่มต้น ปลอดภัย escape ให้อัตโนมัติ** |
| `html` | HTML ดิบ ใช้เมื่อต้องการลิสต์/ตัวหนา/ลิงก์ — ใช้เฉพาะเนื้อหาที่เชื่อถือได้ |
| `width` | `narrow` (ค่าเริ่มต้น จำกัด 78 ตัวอักษร อ่านง่าย) หรือ `full` |

---

### `card-grid` — การ์ดเรียงตาราง *(ใช้บ่อยที่สุด)*

```json
{ "type": "card-grid", "heading": "บริการออนไลน์", "columns": 3,
  "items": [
    { "icon": "i-form", "title": "สอบถามข้อมูล", "body": "คำอธิบาย",
      "href": "#", "tag": "ใหม่", "meta": "ตอบใน 3 วัน" }
  ]}
```
`columns`: 2, 3 หรือ 4 (จอเล็กยุบเป็น 1 คอลัมน์อัตโนมัติ) · ใส่ `href` แล้วการ์ดทั้งใบคลิกได้

---

### `feature-list` — ไอคอน + หัวข้อ + คำอธิบาย

```json
{ "type": "feature-list", "columns": 2,
  "items": [{ "icon": "i-shield", "title": "หัวข้อ", "body": "คำอธิบาย" }] }
```

---

### `stat-row` — ตัวเลขสถิติ

```json
{ "type": "stat-row",
  "items": [{ "value": "1,240", "label": "คำศัพท์", "note": "อัปเดต ม.ค. 2569" }] }
```

---

### `link-list` — รายการเอกสาร/ดาวน์โหลด

```json
{ "type": "link-list", "heading": "แบบฟอร์ม",
  "items": [{ "title": "ชื่อเอกสาร", "desc": "คำอธิบาย",
              "tag": "PDF", "meta": "1 ม.ค. 2569", "href": "#", "icon": "i-file" }] }
```

---

### `media-grid` — การ์ดที่มีรูป

```json
{ "type": "media-grid", "columns": 4,
  "items": [{ "image": "assets/images/e-Book01.png", "alt": "ปกหนังสือ",
              "title": "ชื่อเรื่อง", "desc": "คำอธิบาย", "tag": "e-Book", "href": "#" }] }
```
รูปถูกครอบเป็นอัตราส่วน 4:3 · **ต้องใส่ `alt` เสมอ** (validate จะเตือนถ้าไม่ใส่)

---

### `table` — ตารางข้อมูล

```json
{ "type": "table", "caption": "คำอธิบายตาราง",
  "columns": ["กิจกรรม", "วันที่", "สถานที่"],
  "rows": [["ชื่อกิจกรรม", "1 ม.ค.", "ห้องประชุม"]] }
```
คอลัมน์แรกถูกทำเป็น row header อัตโนมัติ · จำนวนช่องในแต่ละ `rows` ต้องเท่ากับจำนวน `columns`

---

### `faq` — คำถามที่พบบ่อย

```json
{ "type": "faq", "id": "faq",
  "items": [{ "q": "คำถาม", "a": "คำตอบ" }] }
```
กดเปิด/ปิดได้ — `components.js` ผูก event ให้อัตโนมัติ · **ควรใส่ `id`** เพราะใช้สร้าง id ของคำตอบ

---

### `steps` — ขั้นตอนการทำงาน

```json
{ "type": "steps",
  "items": [{ "title": "ขั้นตอนแรก", "body": "คำอธิบาย" }] }
```
เลขลำดับถูกใส่ให้อัตโนมัติ

---

### `two-column` — ข้อความคู่กับรูป

```json
{ "type": "two-column", "subheading": "หัวข้อย่อย",
  "paragraphs": ["ข้อความ"],
  "image": "assets/images/hero01.png", "imageAlt": "คำอธิบายรูป",
  "imageSide": "right",
  "actions": [{ "label": "อ่านต่อ", "href": "#" }] }
```

---

### `cta-band` — แถบเรียกให้ทำอะไรบางอย่าง

```json
{ "type": "cta-band", "heading": "ต้องการข้อมูลเพิ่มเติม", "body": "คำอธิบาย",
  "actions": [{ "label": "ติดต่อเรา", "href": "contact.html" },
              { "label": "รอง", "href": "#", "variant": "ghost" }] }
```
พื้นเขียวเข้ม เต็มความกว้าง มักวางเป็น block สุดท้ายของหน้า

---

### `notice` — กล่องแจ้งเตือน

```json
{ "type": "notice", "tone": "warn", "title": "ข้อควรทราบ", "body": "ข้อความ" }
```
`tone`: `info` (ค่าเริ่มต้น) · `warn` (เหลือง) · `success` (เขียว)

---

### `contact-info` — ข้อมูลติดต่อ

```json
{ "type": "contact-info", "address": "...", "phone": "...",
  "email": "...", "hours": "...", "mapEmbed": "https://..." }
```
เบอร์โทรและอีเมลกลายเป็นลิงก์ `tel:` / `mailto:` อัตโนมัติ

---

## 5. ปุ่ม (actions)

block ที่รับ `actions` ได้: `page-hero`, `two-column`, `cta-band`

```json
"actions": [
  { "label": "ปุ่มหลัก", "href": "#" },
  { "label": "ปุ่มรอง", "href": "#", "variant": "ghost" }
]
```

---

## 6. ไอคอนที่ใช้ได้

ทั้งหมดมาจาก sprite ใน `assets/js/components.js` — ใส่ชื่ออื่นที่ไม่มีในรายการ `validate` จะฟ้อง

```
i-search  i-book      i-eye        i-menu    i-x        i-user     i-access
i-shield  i-people    i-file       i-video   i-form     i-dictionary
i-database i-journal  i-ebook      i-megaphone i-service
i-chevron i-arrow     i-plus       i-map     i-phone    i-pen      i-puzzle
```

---

## 7. ข้อควรระวังเรื่องเนื้อหา

- **ห้ามแต่งข้อมูลจริงของหน่วยงาน** — เบอร์โทร ที่อยู่ วันที่ ตัวเลขสถิติ ชื่อบุคคล
  ให้ใส่ `[คำอธิบายสิ่งที่ต้องเติม]` แล้วให้ผู้รับผิดชอบเนื้อหาเติมทีหลัง
  `node tools/validate.mjs` จะรายงานจำนวน placeholder ที่ยังค้างอยู่ให้
- ข้อความทุกตัวถูก escape อัตโนมัติ จึงใส่ `<` `>` `&` ได้ตามปกติ
  ยกเว้นฟิลด์ `html` ของ `rich-text` ที่ตั้งใจให้ใส่ HTML ดิบ

---

## 8. เส้นทางต่อ CMS

โครงสร้างนี้ออกแบบให้ย้ายไป CMS ได้โดยไม่ต้องรื้อ

| CMS | แมปยังไง |
|---|---|
| **Headless** (Strapi / Directus / Sanity) | 1 หน้า = 1 entry · `blocks` = dynamic zone / portable text · block 1 ชนิด = 1 component · ให้ API คืน JSON หน้าตาเดียวกับ `content/pages/*.json` แล้วเปลี่ยน `data-content` เป็น URL ของ API |
| **WordPress** | block 1 ชนิด = 1 Gutenberg block หรือ ACF flexible-content layout · เขียน template part ตามฟังก์ชันใน `assets/js/blocks.js` |
| **Git-based** (Decap / Tina) | ชี้ CMS มาที่โฟลเดอร์ `content/pages/` ได้เลย ใช้ `content/blocks.schema.json` เป็นตัวกำหนดฟอร์ม |

ทุกทางเลือกใช้ `content/blocks.schema.json` เป็นสัญญากลางได้ทันที

**สิ่งที่ยังต้องทำเพิ่มเมื่อขึ้น CMS จริง**

1. header/footer/เมนู ยังเป็นข้อมูลใน `assets/js/components.js` (ตัวแปร `navItems`, `megaMenuData`)
   ถ้าต้องการให้ CMS จัดการเมนูด้วย ให้ย้ายออกเป็น `content/site.json` แล้วโหลดก่อน render header
2. `index.html`, `knowledge.html`, `contact.html` ยังเป็น HTML ที่เขียนเอง
   ถ้าต้องการให้ CMS จัดการด้วย ต้องแตกเป็น block ก่อน (งานใหญ่ ควรทำหลังเนื้อหาหน้าอื่นนิ่งแล้ว)
3. ฟอร์มติดต่อยังไม่ส่งข้อมูลไปที่ไหน ต้องต่อ endpoint จริง
