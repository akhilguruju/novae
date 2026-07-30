/* ============================================================
   NOVAE GLAMP — GLOBAL JAVASCRIPT
   File: js/global.js
   Loaded on: every page (bottom of <body>)

   Contents:
     1. Nav — scroll solid state + mobile hamburger
     2. Scroll reveal (IntersectionObserver)
     3. Smooth anchor scroll with nav offset
     4. Active nav link highlighting
     5. WhatsApp float tooltip
     6. Helper utilities
============================================================ */

'use strict';

/* ──────────────────────────────────────
   1. NAVIGATION
────────────────────────────────────── */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  /* ── Scroll: add .is-scrolled class ── */
  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load

  /* ── Mobile hamburger toggle ── */
  const hamburger = nav.querySelector('.nav__hamburger');
  const links     = nav.querySelector('.nav__links');

  if (hamburger && links) {
    hamburger.addEventListener('click', function () {
      const isOpen = links.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    links.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        links.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }
})();


/* ──────────────────────────────────────
   2. SCROLL REVEAL
   Add class="reveal" to any element.
   Optionally add "reveal-d1" ... "reveal-d5" for stagger.
   JS adds "is-visible" when element enters viewport.
────────────────────────────────────── */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();


/* ──────────────────────────────────────
   3. SMOOTH ANCHOR SCROLL WITH NAV OFFSET
   Handles <a href="#section-id"> links so
   the fixed nav doesn't cover the target.
────────────────────────────────────── */
(function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-h') || '72',
        10
      );

      const top =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        navHeight -
        16; // 16px breathing room

      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();


/* ──────────────────────────────────────
   4. ACTIVE NAV LINK HIGHLIGHTING
   Marks the nav link whose page matches
   the current filename.
────────────────────────────────────── */
(function initActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(function (link) {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === currentPath) {
      link.classList.add('is-active');
    }
  });
})();


/* ──────────────────────────────────────
   5. WHATSAPP FLOAT — tooltip on hover
────────────────────────────────────── */
(function initWaFloat() {
  const wa = document.querySelector('.wa-float');
  if (!wa) return;

  const tip = document.createElement('span');
  tip.textContent = 'Chat with us';
  tip.style.cssText = [
    'position:absolute',
    'right:calc(100% + 0.8rem)',
    'top:50%',
    'transform:translateY(-50%)',
    'background:rgba(2,3,10,0.95)',
    'color:#c9a96e',
    'font-size:0.68rem',
    'letter-spacing:0.1em',
    'white-space:nowrap',
    'padding:0.4rem 0.8rem',
    'border:1px solid rgba(201,169,110,0.2)',
    'border-radius:2px',
    'opacity:0',
    'pointer-events:none',
    'transition:opacity 0.2s ease',
    'font-family:var(--font-sans)'
  ].join(';');

  wa.style.position = 'fixed'; // ensure relative context
  wa.appendChild(tip);

  wa.addEventListener('mouseenter', function () { tip.style.opacity = '1'; });
  wa.addEventListener('mouseleave', function () { tip.style.opacity = '0'; });
})();


/* ──────────────────────────────────────
   6. HELPER UTILITIES
────────────────────────────────────── */

/**
 * debounce(fn, delay)
 * Limits how often a function fires.
 * Usage: window.addEventListener('resize', debounce(myFn, 200));
 */
function debounce(fn, delay) {
  var timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(fn.bind(this, arguments), delay);
  };
}

/**
 * once(el, event, fn)
 * Fires an event listener only once, then removes it.
 */
function once(el, event, fn) {
  function handler() {
    fn.apply(this, arguments);
    el.removeEventListener(event, handler);
  }
  el.addEventListener(event, handler);
}

// Expose helpers globally for page-specific scripts
window.NovaGlamp = {
  debounce: debounce,
  once: once
};
