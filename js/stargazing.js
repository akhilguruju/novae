/* ============================================================
   NOVAE GLAMP — STARGAZING PAGE JAVASCRIPT
   File: js/stargazing.js
   Loaded on: stargazing.html only (after global.js)

   Contents:
     1. Custom cursor
     2. Star canvas (animated star field)
     3. Shooting stars
     4. Hero parallax on scroll
     5. Experience tab spy (highlight active tab on scroll)
     6. Rating bars animate on scroll into view
     7. Sky card hover star sparkle effect
============================================================ */

'use strict';

/* ──────────────────────────────────────
   1. CUSTOM CURSOR
   Two elements: a tight dot and a lagging ring.
────────────────────────────────────── */
(function initCursor() {
  var dot  = document.querySelector('.cursor');
  var ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  var mx = 0, my = 0; // mouse position
  var rx = 0, ry = 0; // ring position (interpolated)

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
  });

  function animateCursor() {
    // Dot follows exactly
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';

    // Ring lags behind
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Grow cursor on interactive elements
  var interactiveSelectors = 'a, button, .sky-card, .event-card';
  document.querySelectorAll(interactiveSelectors).forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      dot.style.width  = '14px';
      dot.style.height = '14px';
      ring.style.width  = '50px';
      ring.style.height = '50px';
    });
    el.addEventListener('mouseleave', function () {
      dot.style.width  = '8px';
      dot.style.height = '8px';
      ring.style.width  = '32px';
      ring.style.height = '32px';
    });
  });
})();


/* ──────────────────────────────────────
   2. STAR CANVAS
   Renders an animated star field on a
   fixed <canvas id="star-canvas"> element.
────────────────────────────────────── */
(function initStarCanvas() {
  var canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var STAR_COUNT = 340;
  var stars = [];
  var motes = [];               // soft gold "ember" motes — warmth + foreground depth
  var W = 0, H = 0, FIELD = 0;  // FIELD = taller virtual height so parallax never voids
  var scrollY = window.scrollY || 0;

  /* Resize canvas to fill window */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    FIELD = H * 1.8;
  }

  /* Build star + mote data objects */
  function buildStars() {
    stars = [];
    for (var i = 0; i < STAR_COUNT; i++) {
      var sizeRoll = Math.random();
      var radius = sizeRoll < 0.60 ? 0.5
                 : sizeRoll < 0.85 ? 0.9
                 : sizeRoll < 0.95 ? 1.3
                 : 2.0;

      stars.push({
        x: Math.random() * W,
        y: Math.random() * FIELD,
        r: radius,
        alpha: 0.3 + Math.random() * 0.7,
        alphaDir: Math.random() > 0.5 ? 1 : -1,
        alphaSpeed: 0.002 + Math.random() * 0.008,
        twinkle: Math.random() > 0.3,
        // Brighter stars read as "closer" → parallax a touch more on scroll
        depth: radius >= 1.3 ? 0.5 : radius >= 0.9 ? 0.28 : 0.14,
        color: Math.random() < 0.15 ? '#c9a96e'  // gold star
             : Math.random() < 0.10 ? '#aac0f0'  // blue star
             : '#eee8dc'                          // white star
      });
    }

    motes = [];
    for (var m = 0; m < 9; m++) {
      motes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 1.2 + Math.random() * 1.8,
        a: 0.05 + Math.random() * 0.07,
        sp: 0.12 + Math.random() * 0.18,
        drift: Math.random() * Math.PI * 2
      });
    }
  }

  /* Draw faint nebula cloud patches for depth */
  function drawNebulae() {
    // Cool blue region
    var g1 = ctx.createRadialGradient(W * 0.25, H * 0.3, 0, W * 0.25, H * 0.3, W * 0.35);
    g1.addColorStop(0, 'rgba(40,80,180,0.06)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    // Warm gold region
    var g2 = ctx.createRadialGradient(W * 0.72, H * 0.5, 0, W * 0.72, H * 0.5, W * 0.25);
    g2.addColorStop(0, 'rgba(201,169,110,0.045)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    // Low warm horizon glow — anchors the composition
    var g3 = ctx.createRadialGradient(W * 0.5, H * 1.05, 0, W * 0.5, H * 1.05, H * 0.75);
    g3.addColorStop(0, 'rgba(201,169,110,0.05)');
    g3.addColorStop(1, 'transparent');
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, W, H);
  }

  /* Render loop */
  function render(t) {
    ctx.clearRect(0, 0, W, H);
    drawNebulae();

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];

      // Twinkle
      if (s.twinkle) {
        s.alpha += s.alphaSpeed * s.alphaDir;
        if (s.alpha > 1)    { s.alpha = 1;    s.alphaDir = -1; }
        if (s.alpha < 0.15) { s.alpha = 0.15; s.alphaDir =  1; }
      }

      // Parallax: closer stars drift more as the page scrolls
      var yy = ((s.y - scrollY * s.depth) % FIELD + FIELD) % FIELD;
      if (yy > H + 4) continue;

      ctx.save();
      ctx.globalAlpha = s.alpha;

      if (s.r > 1.5) {
        // Bright stars: draw 4-point sparkle
        ctx.fillStyle = s.color;
        ctx.translate(s.x, yy);
        for (var p = 0; p < 4; p++) {
          ctx.save();
          ctx.rotate(p * Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(s.r * 0.4, s.r * 1.9);
          ctx.lineTo(0, s.r * 3.6);
          ctx.lineTo(-s.r * 0.4, s.r * 1.9);
          ctx.closePath();
          ctx.globalAlpha = s.alpha * 0.45;
          ctx.fill();
          ctx.restore();
        }
        // Core dot
        ctx.beginPath();
        ctx.arc(0, 0, s.r * 0.65, 0, Math.PI * 2);
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      } else {
        // Dim stars: simple circle
        ctx.beginPath();
        ctx.arc(s.x, yy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
      }

      ctx.restore();
    }

    // Soft gold ember motes rising
    for (var k = 0; k < motes.length; k++) {
      var e = motes[k];
      e.y -= e.sp;
      e.x += Math.sin((t || 0) * 0.0005 + e.drift) * 0.25;
      if (e.y < -8) { e.y = H + 8; e.x = Math.random() * W; }

      var pulse = 0.65 + 0.35 * Math.sin((t || 0) * 0.001 + e.drift);
      ctx.save();
      ctx.globalAlpha = e.a * pulse;
      ctx.fillStyle = '#c9a96e';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = e.a * pulse * 0.35;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  /* Init */
  resize();
  buildStars();
  requestAnimationFrame(render);

  window.addEventListener('resize', function () {
    resize();
    buildStars();
  });
  window.addEventListener('scroll', function () {
    scrollY = window.scrollY;
  }, { passive: true });
})();


/* ──────────────────────────────────────
   3. SHOOTING STARS
   Creates DOM elements that streak across
   the hero area at random intervals.
────────────────────────────────────── */
(function initShootingStars() {
  var container = document.getElementById('shooting-stars');
  if (!container) return;

  /* Inject the keyframe animation once */
  var styleEl = document.createElement('style');
  styleEl.id = 'shooting-star-style';
  styleEl.textContent = [
    '@keyframes shoot {',
    '  0%   { opacity: 0;   transform: rotate(var(--angle)) scaleX(0); }',
    '  10%  { opacity: 1; }',
    '  80%  { opacity: 0.7; }',
    '  100% { opacity: 0;   transform: rotate(var(--angle)) scaleX(1) translateX(60px); }',
    '}'
  ].join('\n');
  document.head.appendChild(styleEl);

  function spawn() {
    var el = document.createElement('div');
    var startX  = Math.random() * window.innerWidth  * 0.75;
    var startY  = Math.random() * window.innerHeight * 0.45;
    var length  = 80 + Math.random() * 130;
    var angle   = 18 + Math.random() * 28; // degrees
    var duration = (0.55 + Math.random() * 0.55).toFixed(2);

    el.style.cssText = [
      'position:absolute',
      'left:' + startX + 'px',
      'top:' + startY + 'px',
      'width:' + length + 'px',
      'height:1.5px',
      'background:linear-gradient(to right,transparent,rgba(238,232,220,0.9),transparent)',
      '--angle:' + angle + 'deg',
      'transform:rotate(' + angle + 'deg)',
      'transform-origin:left center',
      'border-radius:2px',
      'opacity:0',
      'animation:shoot ' + duration + 's ease-out forwards',
      'pointer-events:none'
    ].join(';');

    container.appendChild(el);

    setTimeout(function () {
      el.remove();
    }, parseFloat(duration) * 1000 + 200);
  }

  function schedule() {
    spawn();
    setTimeout(schedule, 2500 + Math.random() * 5000);
  }

  // First star after 1.5s
  setTimeout(schedule, 1500);
})();


/* ──────────────────────────────────────
   4. HERO PARALLAX ON SCROLL
   The hero content rises and fades as
   the user scrolls down.
────────────────────────────────────── */
(function initHeroParallax() {
  var heroContent = document.querySelector('.sg-hero__content');
  var heroRing    = document.querySelector('.sg-hero__ring');
  var scrollHint  = document.querySelector('.sg-hero__scroll');

  if (!heroContent) return;

  var vh = window.innerHeight;

  function onScroll() {
    var y = window.scrollY;
    if (y > vh) return; // stop computing past hero

    var progress = y / vh; // 0 → 1

    // Content rises and fades
    heroContent.style.transform = 'translateY(' + (y * 0.28) + 'px)';
    heroContent.style.opacity   = Math.max(0, 1 - progress * 1.5).toFixed(3);

    // Ring drifts upward slightly
    if (heroRing) {
      heroRing.style.transform =
        'translate(-50%, calc(-50% + ' + (y * 0.1) + 'px))';
    }

    // Scroll hint fades quickly
    if (scrollHint) {
      scrollHint.style.opacity = Math.max(0, 1 - progress * 4).toFixed(3);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ──────────────────────────────────────
   5. EXPERIENCE TAB SPY
   Watches which section is in view and
   marks the corresponding tab as active.
────────────────────────────────────── */
(function initTabSpy() {
  var tabs     = document.querySelectorAll('.exp-tab');
  var sections = document.querySelectorAll('.exp-section[id]');
  if (!tabs.length || !sections.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          tabs.forEach(function (tab) {
            var href = tab.getAttribute('href') || '';
            tab.classList.toggle('is-active', href === '#' + id);
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach(function (section) { observer.observe(section); });
})();


/* ──────────────────────────────────────
   6. RATING BARS ANIMATE ON SCROLL
   Bars start at 0 width and animate to
   their target when they enter the view.
────────────────────────────────────── */
(function initRatingBars() {
  var wrappers = document.querySelectorAll('.rating-bar-wrap');
  if (!wrappers.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        entry.target.querySelectorAll('.rating-bar-fill').forEach(function (bar) {
          var target = bar.getAttribute('data-pct') || bar.style.width;
          bar.style.width = '0%';
          setTimeout(function () {
            bar.style.width = target;
          }, 200);
        });

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  wrappers.forEach(function (wrap) { observer.observe(wrap); });
})();


/* ──────────────────────────────────────
   7. SKY CARD HOVER MINI SPARKLE
   Adds a tiny CSS-driven sparkle on the
   card's star SVG when hovered.
────────────────────────────────────── */
(function initCardSparkle() {
  document.querySelectorAll('.sky-card').forEach(function (card) {
    var svg = card.querySelector('.sky-card__stars-svg');
    if (!svg) return;

    card.addEventListener('mouseenter', function () {
      svg.style.opacity = '0.7';
      svg.style.transition = 'opacity 0.3s ease';
    });
    card.addEventListener('mouseleave', function () {
      svg.style.opacity = '0.3';
    });
  });
})();
