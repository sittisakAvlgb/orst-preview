# เว็บไซต์สำนักงานราชบัณฑิตยสภา (ORST)

ต้นแบบเว็บไซต์แบบ static — ไม่มี build step ไม่ต้องติดตั้ง dependency

## รันโปรเจกต์

1. เปิดโฟลเดอร์นี้ใน VS Code
2. ติดตั้ง extension **Live Server**
3. คลิกขวา `index.html` → **Open with Live Server**

> ต้องรันผ่าน server เท่านั้น เปิดด้วย `file://` จะไม่เห็น header/footer

## แก้ตรงไหน

| ต้องการแก้ | ไฟล์ |
|---|---|
| header / เมนู / mega menu / footer | `assets/js/components.js` |
| สไตล์ของ header / footer | `assets/css/components.css` |
| ตัวแปรสี ฟอนต์ สไตล์พื้นฐาน | `assets/css/base.css` |
| สไตล์เฉพาะหน้า | `assets/css/pages/<ชื่อหน้า>.css` |
| สคริปต์เฉพาะหน้า | `assets/js/pages/<ชื่อหน้า>.js` |

## เพิ่มหน้าใหม่

คัดลอก `_template.html` → เปลี่ยนชื่อไฟล์ → แก้ `<title>` และ `data-page`
รายละเอียดเต็มอยู่ใน **[HANDOFF.md](HANDOFF.md)**

## กฎที่ห้ามผิด

- ลำดับ CSS: `base.css` → `pages/xxx.css` → **`components.css` ต้องอยู่ท้ายสุด**
- ลำดับ JS: **`components.js` ต้องมาก่อน** `pages/xxx.js`
- ห้ามเขียน `<header>` / `<footer>` เองในหน้า ให้แก้ที่ `components.js`

## เอกสารเพิ่มเติม

📄 **[HANDOFF.md](HANDOFF.md)** — คู่มือส่งมอบฉบับเต็ม: สถาปัตยกรรม, design tokens,
วิธีเพิ่มหน้า, และ **รายการหนี้ทางเทคนิคที่ต้องรู้ก่อนทำงานต่อ**
