// c:/Projects/wedding/js/scrolly.js - Cinematic Motion & Smooth Scroll Engine

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // 1. CINEMATIC BUTTER-SMOOTH SCROLL ENGINE
  // ============================================================
  function customSmoothScroll(target, duration = 1800, offset = 0) {
    if (!target) return;
    const startPosition = window.pageYOffset || document.documentElement.scrollTop;
    const targetPosition = target.getBoundingClientRect().top + startPosition + offset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth Quintic Ease-Out curve for velvety inertia
      const ease = 1 - Math.pow(1 - progress, 5);

      window.scrollTo(0, startPosition + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  // Intercept any on-page anchor link for cinematic smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          customSmoothScroll(target, 1600, -15);
        }
      }
    });
  });

  // ============================================================
  // 2. ENVELOPE OPENING & CINEMATIC TRANSITION & INSTANT MUSIC
  // ============================================================
  const envelope = document.getElementById('wedding-envelope');
  const openTriggerBtn = document.getElementById('open-envelope-btn');
  const waxSeal = document.getElementById('wax-seal-btn');
  const detailsSection = document.getElementById('the-details-section');

  function triggerEnvelopeOpen(e) {
    if (e) {
      // Don't prevent default on touch unless needed
      if (e.type === 'click') e.stopPropagation();
    }
    
    // 1. Play background music immediately within the user gesture stack
    playWeddingMusic();

    if (!envelope) return;
    if (envelope.classList.contains('envelope-open')) return;
    envelope.classList.add('envelope-open');

    // 2. Silky smooth scroll to "The Details" section after admiring the photo
    setTimeout(() => {
      if (detailsSection) {
        customSmoothScroll(detailsSection, 2200, -10);
      }
    }, 4500);
  }

  if (envelope) {
    envelope.addEventListener('click', triggerEnvelopeOpen);
  }
  if (openTriggerBtn) {
    openTriggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerEnvelopeOpen(e);
    });
  }
  if (waxSeal) {
    waxSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerEnvelopeOpen(e);
    });
  }

  // ============================================================
  // 3. FALLING FLORAL PETALS AMBIENT SYSTEM
  // ============================================================
  function initFallingPetals() {
    const container = document.createElement('div');
    container.className = 'petal-container';
    document.body.appendChild(container);

    const colors = ['#F4C6CF', '#FDF1BA', '#FAF7F2', '#E8DCC4', '#FCDDEC'];
    const petalCount = 18;

    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement('div');
      petal.className = 'falling-petal';

      const size = Math.random() * 8 + 8; // 8px - 16px
      const left = Math.random() * 88 + 4; // 4% - 92%
      const duration = Math.random() * 6 + 7; // 7s - 13s
      const delay = Math.random() * 8; // 0s - 8s
      const color = colors[Math.floor(Math.random() * colors.length)];

      petal.style.width = `${size}px`;
      petal.style.height = `${size * 1.3}px`;
      petal.style.left = `${left}vw`;
      petal.style.backgroundColor = color;
      petal.style.animationDuration = `${duration}s, ${duration * 0.45}s`;
      petal.style.animationDelay = `${delay}s, ${delay * 0.25}s`;

      container.appendChild(petal);
    }
  }
  initFallingPetals();

  // ============================================================
  // 4. SCROLL REVEALS & STAGGERED MOTION
  // ============================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // ============================================================
  // 5. LOVE STORY POLAROIDS NATURAL TILT MOTION
  // ============================================================
  const polaroids = document.querySelectorAll('.polaroid-card');
  const tilts = ['polaroid-tilt-1', 'polaroid-tilt-2', 'polaroid-tilt-3', 'polaroid-tilt-4'];
  polaroids.forEach((card, idx) => {
    card.classList.add(tilts[idx % tilts.length]);
  });

  // ============================================================
  // 6. COUNTDOWN TIMER (20 November 2026, 16:30 น.)
  // ============================================================
  const targetTime = new Date('2026-11-20T16:30:00+07:00').getTime();
  
  function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetTime - now;

    if (diff <= 0) {
      const container = document.getElementById('countdown-wrapper');
      if (container) {
        container.innerHTML = '<p class="text-xs font-serif text-[#6B7A66] tracking-widest uppercase font-bold">Today is the Wedding Day!</p>';
      }
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const dEl = document.getElementById('timer-days');
    const hEl = document.getElementById('timer-hours');
    const mEl = document.getElementById('timer-minutes');
    const sEl = document.getElementById('timer-seconds');

    if (dEl) dEl.textContent = String(days).padStart(2, '0');
    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
    if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ============================================================
  // 7. PRE-WEDDING PHOTO SLIDER (KEN BURNS ZOOM & TOUCH SWIPE)
  // ============================================================
  let currentSlide = 0;
  const slides = document.querySelectorAll('.photo-slider-item');
  const slideCaption = document.getElementById('slider-caption-text');
  const slideCounter = document.getElementById('slider-counter-text');
  const prevBtn = document.getElementById('slider-prev-btn');
  const nextBtn = document.getElementById('slider-next-btn');

  const captions = [
    "Chapter 01: จุดเริ่มต้นของความรักอันงดงาม",
    "Chapter 02: ทุกการเดินทางมีความหมายเมื่อมีเธอ",
    "Chapter 03: รอยยิ้มและช่วงเวลาแสนเรียบง่าย",
    "Chapter 04: เพราะความรักคือการเข้าใจและดูแลกัน",
    "Chapter 05: วันที่เราได้เป็นตัวของตัวเองที่สุด",
    "Chapter 06: สัญญาที่จะประคองความรักนี้ตลอดไป",
    "Chapter 07: วันที่คำว่า 'เรา' ชัดเจนที่สุดในหัวใจ",
    "Chapter 08: นับถอยหลังสู่ก้าวสำคัญของชีวิตคู่",
    "Chapter 09: Film & Pei • สองหัวใจรวมเป็นหนึ่งเดียว"
  ];

  function showSlide(index) {
    if (slides.length === 0) return;
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach((slide, idx) => {
      if (idx === currentSlide) {
        slide.classList.remove('opacity-0', 'pointer-events-none');
        slide.classList.add('opacity-100', 'pointer-events-auto');
      } else {
        slide.classList.add('opacity-0', 'pointer-events-none');
        slide.classList.remove('opacity-100', 'pointer-events-auto');
      }
    });

    if (slideCaption && captions[currentSlide]) {
      slideCaption.textContent = captions[currentSlide];
    }
    if (slideCounter) {
      slideCounter.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
  showSlide(0);

  // Auto transition every 4.5 seconds when visible
  let sliderTimer = setInterval(() => {
    const sliderContainer = document.getElementById('photo-slider-section');
    if (sliderContainer) {
      const rect = sliderContainer.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        showSlide(currentSlide + 1);
      }
    }
  }, 4500);

  // Touch Swipe Support for Mobile Experience
  const sliderBox = document.getElementById('photo-slider-section');
  if (sliderBox) {
    let startX = 0;
    let endX = 0;

    sliderBox.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      clearInterval(sliderTimer);
    }, { passive: true });

    sliderBox.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;
      if (Math.abs(diffX) > 45) {
        if (diffX > 0) showSlide(currentSlide + 1); // Swipe left -> Next
        else showSlide(currentSlide - 1); // Swipe right -> Prev
      }
      // Restart timer
      sliderTimer = setInterval(() => {
        const rect = sliderBox.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          showSlide(currentSlide + 1);
        }
      }, 4500);
    }, { passive: true });
  }

  // ============================================================
  // 8. BACKGROUND AUDIO SYSTEM (sound.mp3)
  // ============================================================
  const audioElement = document.getElementById('wedding-audio-player');
  const audioBtn = document.getElementById('floating-music-btn');
  let isAudioOn = false;

  function playWeddingMusic() {
    const audio = audioElement || document.getElementById('wedding-audio-player');
    const btn = audioBtn || document.getElementById('floating-music-btn');
    if (!audio) return;
    audio.volume = 0.65;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isAudioOn = true;
        if (btn) btn.classList.add('audio-active');
      }).catch((err) => {
        console.warn('Audio play request blocked by browser policy:', err);
      });
    }
  }

  function stopWeddingMusic() {
    if (!audioElement) return;
    audioElement.pause();
    isAudioOn = false;
    if (audioBtn) audioBtn.classList.remove('audio-active');
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if (isAudioOn) {
        stopWeddingMusic();
      } else {
        playWeddingMusic();
      }
    });
  }

});
