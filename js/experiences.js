/* ============================================================
   NOVAE GLAMP — EXPERIENCES & INDIVIDUAL PAGES JS
   File: js/experiences.js
   Loaded after global.js on: experiences.html + all
   individual experience pages + activities.html
============================================================ */

'use strict';

/* ── 1. Sticky tab spy (experiences.html) ── */
(function initTabSpy () {
  var tabs     = document.querySelectorAll('.exp-tab');
  var sections = document.querySelectorAll('.exp-section[id]');
  if (!tabs.length || !sections.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = '#' + entry.target.id;
        tabs.forEach(function (tab) {
          tab.classList.toggle('is-active', tab.getAttribute('href') === id);
        });
      }
    });
  }, { rootMargin: '-120px 0px -48% 0px', threshold: 0 });

  sections.forEach(function (s) { observer.observe(s); });

  /* Tab click — offset for both fixed navs */
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function (e) {
      var href = tab.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var navH    = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72', 10);
      var expNavH = 46;
      var top = target.getBoundingClientRect().top + window.pageYOffset - navH - expNavH - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();


/* ── 2. Gallery lightbox ── */
(function initGallery () {
  var items = document.querySelectorAll('.gallery-item');
  var lb    = document.querySelector('.gallery-lightbox');
  var lbImg = document.querySelector('.gallery-lightbox__img');
  var lbCap = document.querySelector('.gallery-lightbox__caption');
  var lbClose = document.querySelector('.gallery-lightbox__close');
  if (!items.length || !lb) return;

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      var img  = item.querySelector('img');
      var cap  = item.querySelector('.gallery-item__caption');
      var placeholder = item.querySelector('.gallery-item__placeholder');

      if (img) {
        lbImg.src = img.src;
        lbImg.style.display = 'block';
      } else {
        lbImg.style.display = 'none';
      }
      lbCap.textContent = cap ? cap.textContent : (placeholder ? placeholder.textContent : '');
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox () {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', function (e) {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
})();


/* ── 3. Contact form — basic client-side validation ── */
(function initContactForm () {
  var form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var allFilled = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      if (!field.value.trim()) {
        allFilled = false;
        field.style.borderColor = 'rgba(220,80,60,0.5)';
        field.addEventListener('input', function () {
          field.style.borderColor = '';
        }, { once: true });
      }
    });
    if (!allFilled) return;

    /* Build WhatsApp message from form values */
    var name    = form.querySelector('[name="name"]')    ? form.querySelector('[name="name"]').value    : '';
    var phone   = form.querySelector('[name="phone"]')   ? form.querySelector('[name="phone"]').value   : '';
    var group   = form.querySelector('[name="group"]')   ? form.querySelector('[name="group"]').value   : '';
    var date    = form.querySelector('[name="date"]')    ? form.querySelector('[name="date"]').value    : '';
    var guests  = form.querySelector('[name="guests"]')  ? form.querySelector('[name="guests"]').value  : '';
    var message = form.querySelector('[name="message"]') ? form.querySelector('[name="message"]').value : '';

    var text = 'Hi Novae Glamp,\n\nName: ' + name +
               '\nPhone: ' + phone +
               '\nExperience: ' + group +
               '\nDate: ' + date +
               '\nGuests: ' + guests +
               '\nMessage: ' + message;

    window.open('https://wa.me/918886866631?text=' + encodeURIComponent(text), '_blank');
  });
})();