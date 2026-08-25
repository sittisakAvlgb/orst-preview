# ORST Static Website Structure

โครงสร้างนี้ใช้ header/footer ชุดเดียวกันทุกหน้า โดย inject ผ่าน `assets/js/components.js`

## วิธีใช้งาน
1. เปิดโฟลเดอร์นี้ใน VSCode
2. ติดตั้ง extension: Live Server
3. คลิกขวา `index.html` > Open with Live Server
4. ถ้ามีภาพพื้นหลังของคุณ ให้ย้ายไฟล์ `orst-bg.png` ไปไว้ที่ `assets/images/orst-bg.png`

## แก้ Header/Footer
แก้ที่ไฟล์เดียว:
- `assets/js/components.js`

## แก้ Style ทั้งระบบ
- `assets/css/styles.css`

## เพิ่มหน้าใหม่
1. copy หน้าใดหน้าหนึ่ง เช่น `services.html`
2. เปลี่ยน `body data-page="ชื่อหน้า"`
3. เพิ่มเมนูใน `components.js` ที่ตัวแปร `nav`
