// ===== Hero Slideshow =====
function initSlider() {
  const slides = document.querySelectorAll('.hero-slider .slide');
  const dots = document.querySelectorAll('.hero-dots .dot');
  let currentSlide = 0;
  const slideInterval = 5000;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }

  // Auto-play
  let timer = setInterval(nextSlide, slideInterval);

  // Dot click navigation
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goToSlide(parseInt(dot.dataset.index));
      timer = setInterval(nextSlide, slideInterval);
    });
  });
}

// ===== Hamburger Menu =====
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'mobile-overlay';
  document.body.appendChild(overlay);

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  overlay.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Close menu on nav link click (except dropdown toggle)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.classList.contains('dropdown-toggle')) return;
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ===== Scroll Reveal Animation =====
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => observer.observe(el));
}

// ===== Course rendering =====
function renderCourses() {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;

  courses.forEach(course => {
    const card = document.createElement('div');
    card.className = 'course-card reveal';

    let subcoursesHTML = '';
    course.subcourses.forEach(sub => {
      let semestersHTML = '';
      sub.semesters.forEach(sem => {
        semestersHTML += `
          <div class="semester-row">
            <span class="semester-name">${sem.name}</span>
            <span class="semester-fee">₹${sem.fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>`;
      });

      subcoursesHTML += `
        <div class="subcourse">
          <div class="subcourse-header">
            <span class="subcourse-name">${sub.name}</span>
            <span class="subcourse-code">${sub.code}</span>
          </div>
          <div class="semesters-list">
            ${semestersHTML}
          </div>
        </div>`;
    });

    card.innerHTML = `
      <div class="course-image">
        <i class="fas ${course.icon}"></i>
      </div>
      <div class="course-content">
        <h3>${course.name}</h3>
        <p class="course-code">${course.code}</p>
        <p class="course-duration">Duration: ${course.duration}</p>
        <div class="subcourses-container">
          ${subcoursesHTML}
        </div>
      </div>`;

    grid.appendChild(card);
  });
}

// ===== Smooth scroll for all anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// ===== Back‑to‑Top button =====
const backToTopBtn = document.createElement('button');
backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopBtn.className = 'back-to-top';
backToTopBtn.setAttribute('aria-label', 'Back to top');
document.body.appendChild(backToTopBtn);

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopBtn.style.display = 'flex';
  } else {
    backToTopBtn.style.display = 'none';
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Initialize all on DOM load =====
document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initHamburger();
  renderCourses();
  initScrollReveal();
  initDropdown();
});

// ===== Mobile Dropdown Toggle =====
function initDropdown() {
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = toggle.parentElement;
      parent.classList.toggle('open');
    });
  });
}
