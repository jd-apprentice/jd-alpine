(function () {
  'use strict';

  /* ── Inject Effect Styles ──
     Inline CSS for all effects so no external stylesheet is needed.
  */
  var styleEl = document.createElement('style');
  styleEl.textContent =
    '/* Sparkle cursor trail */' +
    '@keyframes sparkle-float {' +
    '  0%   { opacity: 1; transform: translateY(0) scale(1); }' +
    '  100% { opacity: 0; transform: translateY(-60px) scale(0.2); }' +
    '}' +
    '.sparkle {' +
    '  position: fixed;' +
    '  pointer-events: none;' +
    '  font-size: 18px;' +
    '  z-index: 9999;' +
    '  animation: sparkle-float 1.5s ease-out forwards;' +
    '  will-change: transform, opacity;' +
    '  line-height: 1;' +
    '}' +
    '' +
    '/* Cursor glow */' +
    '#cursor-glow {' +
    '  position: fixed;' +
    '  pointer-events: none;' +
    '  width: 24px;' +
    '  height: 24px;' +
    '  border-radius: 50%;' +
    '  background: radial-gradient(circle, rgba(255,105,255,0.6), rgba(0,221,255,0.15) 60%, transparent 70%);' +
    '  z-index: 9998;' +
    '  transform: translate(-50%, -50%);' +
    '  will-change: left, top;' +
    '}' +
    '' +
    '/* Visitor counter odometer digits */' +
    '.counter-digit {' +
    '  display: inline-block;' +
    '  min-width: 1em;' +
    '  text-align: center;' +
    '  font-family: "Courier New", Courier, monospace;' +
    '  font-weight: bold;' +
    '  background: rgba(0,0,0,0.35);' +
    '  padding: 2px 5px;' +
    '  margin: 0 1px;' +
    '  border-radius: 3px;' +
    '  color: #ffd700;' +
    '  text-shadow: 0 0 6px rgba(255,215,0,0.5);' +
    '}' +
    '' +
    '/* Page entry fade-in + slide-up */' +
    'body:not(.page-entered) {' +
    '  opacity: 0;' +
    '  transform: translateY(15px);' +
    '}' +
    'body.page-entered {' +
    '  opacity: 1;' +
    '  transform: translateY(0);' +
    '  transition: opacity 0.6s ease-out, transform 0.6s ease-out;' +
    '}';
  document.head.appendChild(styleEl);


  /* ── Sparkle Cursor Trail ──
     Spawns floating sparkle particles at the cursor position.
     Each sparkle floats up and fades out over 1.5 s.
     Throttled to 60 ms intervals, capped at 30 simultaneous particles.
  */
  var GLYPHS = ['✦', '✧', '★', '·', '✨', '•'];
  var COLORS = ['#ff69ff', '#00ddff', '#ffd700', '#ffffff', '#ff6b6b', '#48dbfb'];
  var MAX_SPARKLES = 30;
  var SPAWN_THROTTLE = 60;

  var sparkleCount = 0;
  var lastSpawn = 0;

  document.addEventListener('mousemove', function (e) {
    var now = Date.now();
    if (now - lastSpawn < SPAWN_THROTTLE || sparkleCount >= MAX_SPARKLES) return;
    lastSpawn = now;

    var el = document.createElement('span');
    el.className = 'sparkle';
    el.textContent = GLYPHS[Math.random() * GLYPHS.length | 0];
    el.style.color = COLORS[Math.random() * COLORS.length | 0];
    el.style.left = (e.clientX + (Math.random() - 0.5) * 12) + 'px';
    el.style.top = (e.clientY + (Math.random() - 0.5) * 12) + 'px';

    el.addEventListener('animationend', function () {
      el.remove();
      sparkleCount--;
    });

    document.body.appendChild(el);
    sparkleCount++;
  }, { passive: true });


  /* ── Starfield Parallax (optional) ──
     Shifts background-position of .starfield / .bg-stars elements
     by 1–3 px in response to mouse movement (relative to viewport center).
     Only activates if matching elements exist in the DOM.
  */
  var starfields = document.querySelectorAll('.starfield, .bg-stars');
  if (starfields.length) {
    var mouseX = 0;
    var mouseY = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function updateParallax() {
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      var dx = (mouseX - cx) / cx * 2.5;
      var dy = (mouseY - cy) / cy * 2.5;

      for (var i = 0; i < starfields.length; i++) {
        starfields[i].style.backgroundPosition = 'calc(50% + ' + dx + 'px) calc(50% + ' + dy + 'px)';
      }
      requestAnimationFrame(updateParallax);
    }
    updateParallax();
  }


  /* ── Live Clock ──
     Finds the element with [data-clock] and updates its textContent
     every second with the current time in HH:MM:SS format.
  */
  var clockEl = document.querySelector('[data-clock]');
  if (clockEl) {
    function tick() {
      clockEl.textContent = new Date().toTimeString().slice(0, 8);
    }
    tick();
    setInterval(tick, 1000);
  }


  /* ── Visitor Counter ──
     Reads/writes visitorCount from localStorage.
     On first visit: random value between 4000–9000.
     On subsequent visits: increment by 1.
     Displays as 6 zero-padded digits, each in its own .counter-digit span.
  */
  var counterEl = document.querySelector('[data-visitor-counter]');
  if (counterEl) {
    var count = localStorage.getItem('visitorCount');
    if (count !== null) {
      count = parseInt(count, 10) + 1;
    } else {
      count = 4000 + (Math.random() * 5001 | 0);
    }
    localStorage.setItem('visitorCount', count);

    counterEl.innerHTML = String(count).padStart(6, '0').split('')
      .map(function (d) { return '<span class="counter-digit">' + d + '</span>'; })
      .join('');
  }


  /* ── Cursor Glow ──
     A small radial-gradient circle that smoothly follows the mouse
     with a gentle lerp delay for a trailing glow effect.
  */
  var glow = document.createElement('div');
  glow.id = 'cursor-glow';
  document.body.appendChild(glow);

  var targetX = window.innerWidth / 2;
  var targetY = window.innerHeight / 2;
  var currentX = targetX;
  var currentY = targetY;

  document.addEventListener('mousemove', function (e) {
    targetX = e.clientX;
    targetY = e.clientY;
  }, { passive: true });

  function animateGlow() {
    currentX += (targetX - currentX) * 0.3;
    currentY += (targetY - currentY) * 0.3;
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();


  /* ── Page Entry Animation ──
     Adds .page-entered to <body> on DOMContentLoaded,
     which triggers the CSS fade-in + slide-up transition
     defined in the injected styles above.
  */
  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('page-entered');
  });

})();
