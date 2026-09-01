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
  const grid = document.getElementById('programsGrid');
  if (!grid || typeof programCards === 'undefined') return;

  grid.innerHTML = '';

  const activeFilter = document.querySelector('.academic-tab.active')?.dataset.filter || 'all';

  programCards.forEach(program => {
    if (activeFilter !== 'all' && program.category !== activeFilter) return;

    const card = document.createElement('div');
    card.className = 'program-card reveal active';
    card.setAttribute('data-category', program.category);

    const specsList = program.specializations.slice(0, 4).join(', ');
    const moreCount = program.specializations.length - 4;
    const specsDisplay = moreCount > 0 ? specsList + ' +' + moreCount + ' more' : specsList;

    card.innerHTML = `
      <div class="program-badge">${program.badge}</div>
      <div class="program-icon"><i class="fas ${program.icon}"></i></div>
      <h3 class="program-title">${program.title}</h3>
      <p class="program-desc">${program.description}</p>
      <div class="program-meta">
        <span><i class="fas fa-graduation-cap"></i> Eligibility: ${program.eligibility}</span>
        <span><i class="fas fa-indian-rupee-sign"></i> <span class="fee-highlight">${program.feePerSem}</span> per semester</span>
        <span><i class="fas fa-layer-group"></i> ${specsDisplay}</span>
      </div>
      <button class="btn" onclick="openCourseModal('${program.id}')">View Syllabus & Details</button>
    `;

    grid.appendChild(card);
  });
}

// ===== Course Detail Modal =====
function openCourseModal(programId) {
  const program = programCards.find(p => p.id === programId);
  if (!program) return;

  const modal = document.getElementById('courseModal');
  const modalTitle = document.getElementById('courseModalTitle');
  const modalBody = document.getElementById('courseModalBody');

  modalTitle.innerHTML = `<i class="fas ${program.icon}"></i> ${program.title}`;

  let specializationsHTML = '';
  if (program.specializations.length > 1) {
    const specItems = program.specializations.map(s =>
      `<div class="modal-spec-item">${s}</div>`
    ).join('');
    specializationsHTML = `
      <div class="modal-specializations">
        <h4><i class="fas fa-list-ul"></i> Available Specializations (${program.specializations.length})</h4>
        <div class="modal-spec-grid">${specItems}</div>
      </div>`;
  }

  let feeTableHTML = '';
  const course = courses.find(c => {
    const title = program.title.toLowerCase();
    if (title.includes('b.sc') && c.name.includes('Bachelor of Science')) return true;
    if (title.includes('b.a.') && c.name.includes('Bachelor of Arts')) return true;
    if (title.includes('b.com') && c.name.includes('Bachelor of Commerce')) return true;
    if (title.includes('b.c.a') && c.name.includes('Bachelor of Computer')) return true;
    if (title.includes('b.b.a') && c.name.includes('Bachelor of Business')) return true;
    if (title.includes('b.tech') && c.name.includes('Bachelor of Technology')) return true;
    if (title.includes('b.s.w') && c.name.includes('Bachelor of Social')) return true;
    if (title.includes('b.h.m') && c.name.includes('Bachelor of Hotel')) return true;
    if (title.includes('m.sc') && c.name.includes('Master of Science')) return true;
    if (title.includes('m.a.') && c.name.includes('Master of Arts') && !c.name.includes('M.Com')) return true;
    if (title.includes('m.com') && c.name.includes('Master of Commerce')) return true;
    if (title.includes('m.b.a') && c.name.includes('Master of Business Admin')) return true;
    if (title.includes('m.c.a') && c.name.includes('Master of Computer')) return true;
    if (title.includes('m.s.w') && c.name.includes('Master of Social')) return true;
    if (title.includes('m.lib') && c.name.includes('Master of Library')) return true;
    if (title.includes('d.c.a') && c.name.includes('Diploma in Computer')) return true;
    if (title.includes('p.g.d.c.a') && c.name.includes('Post Graduation Diploma in Computer')) return true;
    if (title.includes('d.h.m') && c.name.includes('Diploma in Hotel')) return true;
    if (title.includes('p.g.d.b.m') && c.name.includes('Post Graduation Diploma in Business')) return true;
    if (title.includes('certificate in life') && c.name.includes('Certificate Course in Life')) return true;
    if (title.includes('certificate in yoga') && c.name.includes('Certificate Course in Yoga')) return true;
    if (title.includes('certificate in sanskrit') && c.name.includes('Certificate Course in Sanskrit')) return true;
    if (title.includes('m.phil') && c.name.includes('Master of Philosophy')) return true;
    if (title.includes('ph.d') && c.name.includes('Doctor of Philosophy')) return true;
    if (title.includes('bachelor of library') && c.name.includes('Bachelor of Library')) return true;
    if (title.includes('b.n.y.s') && c.name.includes('B.N.Y.S.')) return true;
    return false;
  });

  if (course && course.subcourses.length > 0) {
    const firstSub = course.subcourses[0];
    if (firstSub.semesters && firstSub.semesters.length > 0) {
      const rows = firstSub.semesters.map(sem =>
        `<tr><td>${sem.name}</td><td class="fee-amount">\u20b9${sem.fee.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</td></tr>`
      ).join('');
      feeTableHTML = `
        <h4 style="font-size: 0.9rem; color: var(--primary-color); margin-bottom: 0.6rem;"><i class="fas fa-indian-rupee-sign"></i> Semester-wise Fee Structure</h4>
        <table class="modal-fee-table">
          <thead><tr><th>Period</th><th>Fee</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    }
  }

  let pageButton = '';
  if (program.pageLink) {
    pageButton = `<button class="btn-outline" onclick="closeCourseModal(); window.location.href='${program.pageLink}';"><i class="fas fa-arrow-right"></i> View Full Syllabus & Detailed Page</button>`;
  }

  modalBody.innerHTML = `
    <div class="modal-badge-row">
      <span class="modal-badge badge-duration"><i class="fas fa-clock"></i> ${program.badge.split('\u2022')[0].trim()}</span>
      <span class="modal-badge badge-eligibility"><i class="fas fa-graduation-cap"></i> ${program.eligibility}</span>
    </div>
    <p class="modal-description">${program.description}</p>
    ${specializationsHTML}
    ${feeTableHTML}
    <div class="modal-actions">
      <button class="btn-primary" onclick="closeCourseModal(); window.location.href='application-form.html';"><i class="fas fa-paper-plane"></i> Apply for this Program</button>
      ${pageButton}
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCourseModal() {
  const modal = document.getElementById('courseModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
    closeCourseModal();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeCourseModal();
});

// ===== Filter Tabs =====
function initFilterTabs() {
  const tabs = document.querySelectorAll('.academic-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      renderCourses();
    });
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
  initHamburger();
  initFilterTabs();
  renderCourses();
  initScrollReveal();
  initDropdown();
  initNavSections();
  initHeroSlider();
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

// ===== Nav Section Show/Hide =====
function initNavSections() {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const targetId = href.replace('#', '');
      const targetSection = document.getElementById(targetId);
      if (targetSection && targetSection.classList.contains('nav-section')) {
        // Hide all other nav sections first
        document.querySelectorAll('.nav-section.active-section').forEach(s => {
          s.classList.remove('active-section');
        });
        // Show the clicked section
        targetSection.classList.add('active-section');
        // Scroll to it
        setTimeout(() => {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  });
}

// ===== Hero Slider =====
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slider .slide');
  const dots = document.querySelectorAll('.hero-dots .dot');
  if (!slides.length) return;

  let currentSlide = 0;
  let slideInterval = setInterval(nextSlide, 5000);

  function showSlide(index) {
    slides[currentSlide].classList.remove('active');
    if (dots.length > currentSlide) {
      dots[currentSlide].classList.remove('active');
    }
    
    currentSlide = (index + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    if (dots.length > currentSlide) {
      dots[currentSlide].classList.add('active');
    }
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      clearInterval(slideInterval);
      showSlide(idx);
      slideInterval = setInterval(nextSlide, 5000);
    });
  });
}
