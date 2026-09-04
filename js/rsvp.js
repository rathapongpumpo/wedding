// js/rsvp.js - Interactive RSVP & Blessing System for Film & Pei

// ============================================================
// GOOGLE SHEETS CONFIGURATION
// นำ Web App URL ที่ได้จากการ Deploy ใน Google Apps Script มาใส่ที่นี่
// (หากยังไม่ใส่ ข้อมูลจะถูกบันทึกใน LocalStorage ของเบราว์เซอร์อัตโนมัติ)
// ============================================================
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyMYUBeEETYv9_0w0OuJsY6oJnbIM_LeK-bMqn29rbQPlOSTDoJhwQJwWKAZHYsOhkU/exec';

document.addEventListener('DOMContentLoaded', () => {
  const rsvpForm = document.getElementById('rsvp-form');
  const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
  const attendeeCountContainer = document.getElementById('attendee-count-container');
  const attendeeCountInput = document.getElementById('attendee-count');
  const rsvpSuccessCard = document.getElementById('rsvp-success-card');
  const rsvpFormContainer = document.getElementById('rsvp-form-container') || rsvpForm;
  const guestWishesFeed = document.getElementById('guest-wishes-feed');
  const exportCsvBtn = document.getElementById('export-rsvp-csv');

  // 1. Dynamic Toggle for Attendee Count
  attendanceRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'attending') {
        attendeeCountContainer.classList.remove('hidden', 'opacity-0', '-translate-y-2');
        attendeeCountContainer.classList.add('opacity-100', 'translate-y-0');
        if (attendeeCountInput) attendeeCountInput.setAttribute('required', 'required');
      } else {
        attendeeCountContainer.classList.add('opacity-0', '-translate-y-2');
        setTimeout(() => {
          attendeeCountContainer.classList.add('hidden');
        }, 200);
        if (attendeeCountInput) attendeeCountInput.removeAttribute('required');
      }
    });
  });

  // 2. Load and Render Existing Wishes from Google Sheets / LocalStorage
  const STORAGE_KEY = 'wedding_rsvp_live_data';
  // ล้างแคชข้อมูลตัวอย่างเดิมออกอัตโนมัติ
  try { localStorage.removeItem('wedding_rsvp_film_pei'); } catch (e) {}
  
  function getStoredRSVP() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveRSVP(entry) {
    const list = getStoredRSVP();
    list.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    renderWishes(list);

    // ส่งข้อมูลไปยัง Google Sheets แบบ Asynchronous
    if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL.trim() !== '') {
      fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(entry)
      })
      .then(res => res.json())
      .then(data => console.log('Synced to Google Sheets:', data))
      .catch(err => console.warn('Google Sheets sync notice:', err));
    }
  }

  // ดึงคำอวยพรล่าสุดจาก Google Sheets มาแสดง
  function fetchRemoteWishes() {
    if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL.trim() === '') return;
    fetch(GOOGLE_SHEET_URL)
      .then(res => res.json())
      .then(result => {
        if (result && result.status === 'success' && Array.isArray(result.data)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
          renderWishes(result.data);
        }
      })
      .catch(err => console.warn('Fetch remote wishes notice:', err));
  }
  fetchRemoteWishes();

  function renderWishes(providedList) {
    if (!guestWishesFeed) return;
    const list = providedList || getStoredRSVP();
    const validWishes = list.filter(item => item && item.wishes && item.wishes.toString().trim() !== '');

    if (validWishes.length === 0) {
      guestWishesFeed.innerHTML = `
        <div class="text-center py-6 px-4 bg-white/60 rounded-xl border border-[#D5C9B8]/50">
          <p class="text-xs font-thai font-medium text-stone-600">ยังไม่มีคำอวยพรในขณะนี้</p>
          <p class="text-[10px] font-thai text-stone-400 mt-1">ร่วมเป็นคนแรกที่ส่งคำอวยพรแด่คู่บ่าวสาวด้านบนได้เลยครับ</p>
        </div>
      `;
      return;
    }

    guestWishesFeed.innerHTML = validWishes.map(item => `
      <div class="bg-white/85 p-4 rounded-xl border border-[#E8D5C4] shadow-sm space-y-1.5 transition hover:shadow-md">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-stone-800 text-sm">${escapeHtml(item.name || 'แขกผู้มีเกียรติ')}</span>
          <span class="text-[11px] px-2 py-0.5 rounded-full ${item.attendance === 'attending' || item.attendance === 'ยินดีมาร่วมงาน' ? 'bg-[#EBF4F9] text-[#55829C]' : 'bg-stone-100 text-stone-500'} font-medium">
            ${item.attendance === 'attending' || item.attendance === 'ยินดีมาร่วมงาน' ? `✓ ร่วมงาน (${item.count || 1} ท่าน)` : 'ส่งใจมาร่วม'}
          </span>
        </div>
        <p class="text-xs text-stone-600 font-light leading-relaxed">"${escapeHtml(item.wishes)}"</p>
      </div>
    `).join('');
  }

  function escapeHtml(string) {
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
  }

  // 3. Handle Form Submit
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('guest-name').value.trim();
      const attendance = document.querySelector('input[name="attendance"]:checked').value;
      const count = attendance === 'attending' ? parseInt(attendeeCountInput.value || 1, 10) : 0;
      const wishes = document.getElementById('guest-wishes').value.trim();

      if (!name) {
        alert('กรุณากรอกชื่อ-นามสกุลครับ');
        return;
      }

      const newEntry = {
        name,
        attendance,
        count,
        wishes,
        date: new Date().toISOString().split('T')[0]
      };

      saveRSVP(newEntry);

      // Fire Pastel Confetti
      if (typeof confetti !== 'undefined') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#A8D1E7', '#F4C6CF', '#FDF1BA', '#D5BAA6', '#C7AA93']
        });
      }

      // Show Success State
      if (rsvpFormContainer && rsvpSuccessCard) {
        rsvpFormContainer.classList.add('hidden');
        rsvpSuccessCard.classList.remove('hidden');
        document.getElementById('success-guest-name').textContent = name;
      }
    });
  }

  // 4. Export RSVP to CSV
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const list = getStoredRSVP();
      if (list.length === 0) {
        alert('ยังไม่มีข้อมูลการตอบรับในระบบครับ');
        return;
      }

      let csv = "\uFEFFชื่อ-นามสกุล,การเข้าร่วม,จำนวนผู้ติดตาม,คำอวยพร,วันที่ส่งข้อมูล\n";
      list.forEach(row => {
        const attText = row.attendance === 'attending' ? 'มาร่วมงาน' : 'ไม่สะดวก';
        csv += `"${row.name}","${attText}","${row.count}","${(row.wishes || '').replace(/"/g, '""')}","${row.date}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `RSVP_Film_Pei_Wedding_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  renderWishes();
});
