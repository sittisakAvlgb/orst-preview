# เว็บไซต์สำนักงานราชบัณฑิตยสภา (ORST)

Static site — ไม่มี build step บังคับ ไม่ต้อง `npm install`
เนื้อหาของหน้าทั่วไปเก็บเป็น **JSON** แล้ว render ด้วยคลังบล็อก (block library)

## รันโปรเจกต์

1. เปิดโฟลเดอร์นี้ใน VS Code
2. ติดตั้ง extension **Live Server**
3. คลิกขวา `index.html` → **Open with Live Server**

> ต้องรันผ่าน server เท่านั้น เปิดด้วย `file://` จะไม่เห็น header/footer และโหลดเนื้อหา JSON ไม่ได้

## เพิ่มหน้าใหม่ (3 นาที)

1. คัดลอก `content/pages/about.json` → `content/pages/<ชื่อหน้า>.json` แล้วแก้เนื้อหา
2. คัดลอก `_template.html` → `<ชื่อหน้า>.html` แล้วแก้ `<title>`, `data-page`, `data-content`
3. ตรวจงาน

```bash
node tools/validate.mjs
```

ดูตัวอย่าง block ทุกชนิดได้ที่ **`styleguide.html`** (เปิดผ่าน Live Server)

## แก้ตรงไหน

| ต้องการแก้ | ไฟล์ |
|---|---|
| เนื้อหาของหน้า (ข้อความ การ์ด ตาราง ฯลฯ) | `content/pages/<หน้า>.json` |
| header / เมนู / mega menu / footer | `assets/js/components.js` |
| สไตล์ของ header / footer | `assets/css/components.css` |
| สไตล์ของบล็อกเนื้อหา | `assets/css/blocks.css` |
| ตัวแปรสี ฟอนต์ สไตล์พื้นฐาน | `assets/css/base.css` |
| เพิ่มบล็อกชนิดใหม่ | `assets/js/blocks.js` |

`index.html` · `knowledge.html` · `contact.html` เป็น 3 หน้าที่เขียน HTML เองทั้งหมด
มี CSS/JS เฉพาะหน้าอยู่ที่ `assets/css/pages/` และ `assets/js/pages/`

## กฎที่ห้ามผิด

- ลำดับ CSS: `base.css` → `blocks.css` → `pages/xxx.css` → **`components.css` ท้ายสุดเสมอ**
- ลำดับ JS: **`components.js` ต้องมาก่อน** `page-runtime.js`
- ห้ามเขียน `<header>` / `<footer>` เองในหน้า ให้แก้ที่ `components.js`
- ห้ามเพิ่ม dependency / build tool — ทุกอย่างต้องรันได้ด้วย Live Server เฉย ๆ

## คำสั่ง

```bash
node tools/validate.mjs
```

```bash
node tools/build.mjs
```

`validate` ตรวจไฟล์เนื้อหาทุกไฟล์ (โครงสร้าง ไอคอน รูป ลิงก์เสีย) — ควรรันก่อน commit ทุกครั้ง
`build` สร้าง HTML นิ่งลง `dist/` สำหรับขึ้น production (SEO อ่านเนื้อหาได้โดยไม่ต้องรัน JS)

## เอกสาร

| ไฟล์ | สำหรับใคร |
|---|---|
| **[CONTENT-MODEL.md](CONTENT-MODEL.md)** | คนทำเนื้อหา — คลังบล็อก 14 ชนิดพร้อมตัวอย่าง JSON |
| **[HANDOFF.md](HANDOFF.md)** | ทีมพัฒนา — สถาปัตยกรรม design tokens และ**หนี้ทางเทคนิคที่ต้องรู้** |
| **[CLAUDE.md](CLAUDE.md)** | AI agent — กฎการทำงานในโปรเจกต์นี้ |
