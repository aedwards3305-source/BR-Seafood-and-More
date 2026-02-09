/* ============================================
   B&R Seafood and More - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initHeroBubbles();
  initSmoothScroll();
  loadMenu();
  loadEvents();
  initScrollReveal();
});

/* ---------- Load Menu from JSON ---------- */
async function loadMenu() {
  const container = document.getElementById('menu-content');
  if (!container) return;

  try {
    const resp = await fetch('data/menu.json');
    if (!resp.ok) throw new Error('Failed to load menu');
    const data = await resp.json();
    MenuRenderer.renderMenu(data, container);
    // Re-apply scroll reveal for dynamically inserted menu elements
    initScrollReveal();
  } catch (err) {
    container.innerHTML = `
      <p style="text-align:center; color: rgba(255,255,255,.5); padding: 40px 0;">
        Our menu is temporarily unavailable.<br>
        Please call <a href="tel:7018183664" style="color: var(--teal-light);">(701) 818-3664</a> for current items and pricing.
      </p>`;
  }
}

/* ---------- Load Events from JSON ---------- */
async function loadEvents() {
  const container = document.getElementById('events-content');
  if (!container) return;

  try {
    const resp = await fetch('data/events.json');
    if (!resp.ok) throw new Error('Failed to load events');
    const data = await resp.json();
    EventsRenderer.renderEvents(data, container);
    initScrollReveal();
  } catch (err) {
    container.innerHTML = `
      <div class="no-events">
        <div class="no-events-icon"><i class="fas fa-calendar-xmark"></i></div>
        <h3>Events Coming Soon</h3>
        <p>Follow us on social media for the latest schedule and events!</p>
      </div>`;
  }
}

/* ---------- Sticky Navbar ---------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

/* ---------- Mobile Navigation ---------- */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('active') &&
        !menu.contains(e.target) &&
        !toggle.contains(e.target)) {
      toggle.classList.remove('active');
      menu.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* ---------- Scroll Reveal Animation ---------- */
function initScrollReveal() {
  const selectors = [
    '.about-card',
    '.menu-category',
    '.menu-item',
    '.side-item',
    '.order-card',
    '.order-phone',
    '.contact-card',
    '.menu-note',
    '.teaser-card',
    '.teaser-menu-item',
    '.owner-detail',
    '.order-cta-box',
    '.event-card'
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
        el.style.transitionDelay = `${i * 0.08}s`;
      }
      if (!el.classList.contains('visible')) {
        observer.observe(el);
      }
    });
  });
}

/* ---------- Hero Bubbles (decorative particles) ---------- */
function initHeroBubbles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const bubbleCount = 15;

  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    const size = Math.random() * 60 + 20;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.animationDuration = `${Math.random() * 15 + 10}s`;
    bubble.style.animationDelay = `${Math.random() * 10}s`;

    container.appendChild(bubble);
  }
}

/* ---------- Smooth Scroll for anchor links ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ---------- Active nav link highlighting ---------- */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active',
            link.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-80px 0px -50% 0px'
  });

  sections.forEach(section => observer.observe(section));
})();
