# คู่มือการติดตั้ง Google Sheets via Google Apps Script สำหรับบันทึก RSVP

เอกสารนี้จะช่วยให้คุณเชื่อมต่อแบบฟอร์มตอบรับ (RSVP) และคำอวยพรเข้ากับ Google Sheets ได้ภายใน 2 นาที โดยไม่ต้องเสียค่าใช้จ่ายใดๆ

---

## ขั้นตอนที่ 1: สร้าง Google Sheets
1. ไปที่ [Google Sheets](https://sheets.new) เพื่อสร้างสเปรดชีตใหม่
2. ตั้งชื่อสเปรดชีตตามต้องการ เช่น `Wedding RSVP - Film & Pei`
3. ที่เมนูด้านบน เลือก **ส่วนขยาย (Extensions)** -> **Apps Script**

---

## ขั้นตอนที่ 2: วางโค้ด Google Apps Script
1. ลบโค้ดเดิมในหน้าต่าง Apps Script ออกทั้งหมด
2. คัดลอกโค้ดด้านล่างนี้ไปวางแทนที่:

```javascript
/**
 * Google Apps Script for Wedding RSVP & Guest Wishes
 * รองรับการบันทึกข้อมูล (POST) และดึงคำอวยพรล่าสุด (GET)
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // สร้างหัวตารางอัตโนมัติหากยังไม่มี
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "วัน-เวลา (Timestamp)",
        "ชื่อแขกผู้มีเกียรติ",
        "การเข้าร่วมงาน",
        "จำนวนผู้ร่วมงาน (รวมตัวเอง)",
        "คำอวยพรแด่คู่บ่าวสาว"
      ]);
      // จัดรูปแบบหัวตาราง
      sheet.getRange(1, 1, 1, 5)
        .setFontWeight("bold")
        .setBackground("#E8E0D4")
        .setFontColor("#2D2B28");
    }

    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }

    const timestamp = Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss");
    const name = data.name || "";
    const attendance = (data.attendance === "attending" || data.attendance === "มาร่วมงาน") ? "ยินดีมาร่วมงาน" : "ขออภัย ไม่สะดวก";
    const count = data.attendance === "attending" ? (data.count || 1) : 0;
    const wishes = data.wishes || "";

    // บันทึกลงในแถวใหม่
    sheet.appendRow([timestamp, name, attendance, count, wishes]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "บันทึกข้อมูลเรียบร้อย" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const rows = sheet.getDataRange().getValues();
    const wishesList = [];

    // ดึงเฉพาะแถวที่มีคำอวยพร (ข้ามหัวตารางแถวที่ 0)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const wishes = row[4];
      if (wishes && wishes.toString().trim() !== "") {
        wishesList.push({
          date: row[0],
          name: row[1],
          attendance: row[2] === "ยินดีมาร่วมงาน" ? "attending" : "not-attending",
          count: row[3],
          wishes: wishes.toString()
        });
      }
    }

    // เรียงจากล่าสุดขึ้นก่อน
    wishesList.reverse();

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", data: wishesList }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", data: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. กดไอคอน **บันทึก (Save)** 💾

---

## ขั้นตอนที่ 3: เผยแพร่เว็บแอป (Deploy as Web App)
1. กดปุ่มสีน้ำเงิน **ทำให้ใช้งานได้ (Deploy)** ที่มุมขวาบน -> เลือก **การทำให้ใช้งานได้ใหม่ (New deployment)**
2. คลิกไอคอนรูปเฟือง ⚙️ ข้าง "เลือกประเภท" -> เลือก **เว็บแอป (Web app)**
3. ตั้งค่าดังนี้:
   - **คำอธิบาย (Description):** `Wedding RSVP API`
   - **ดำเนินการในฐานะ (Execute as):** `ฉัน (Me - อีเมลของคุณ)`
   - **ผู้มีสิทธิ์เข้าถึง (Who has access):** `ทุกคน (Anyone)` *(สำคัญมาก: ต้องเลือก Anyone เพื่อให้แขกส่งฟอร์มได้โดยไม่ต้องล็อกอิน Google)*
4. กดปุ่ม **ทำให้ใช้งานได้ (Deploy)**
5. หากมีหน้าต่างขอสิทธิ์ ให้กด **ตรวจสอบสิทธิ์ (Review permissions)** -> เลือกอีเมลของคุณ -> กด **Advanced (ขั้นสูง)** -> กด **Go to ... (unsafe)** -> กด **Allow (อนุญาต)**
6. คัดลอก **URL เว็บแอป (Web App URL)** ที่ได้ (รูปแบบจะขึ้นต้นด้วย `https://script.google.com/macros/s/.../exec`)

---

## ขั้นตอนที่ 4: นำ URL มาใส่ในโค้ดเว็บไซต์
เปิดไฟล์ `js/rsvp.js` แล้วนำ URL ที่ได้มาใส่ในตัวแปรด้านบนสุด:

```javascript
const GOOGLE_SHEET_URL = 'วาง_WEB_APP_URL_ที่ได้จากขั้นตอนที่_3_ตรงนี้';
```

เรียบร้อย! เมื่อมีแขกตอบรับผ่านหน้าเว็บ ข้อมูลจะถูกส่งไปลง Google Sheets แบบ Real-time ทันทีครับ
