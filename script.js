/* ══════════════════════════════════════════
   Akshay Gend – Portfolio · script.js
   ══════════════════════════════════════════ */

'use strict';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/* ── Word carousel ───────────────────────── */
(function initWordCarousel() {
  const list = document.getElementById('wordList');
  if (!list) return;
  const count = list.children.length;
  let i = 0;
  setInterval(() => {
    i = (i + 1) % count;
    list.style.setProperty('--i', i);
  }, 2500);
})();

/* ── Navbar: hide on scroll down, show on scroll up ── */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
let lastY = window.scrollY;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 60);
  const menuOpen = navLinks.classList.contains('open');
  navbar.classList.toggle('hidden', y > lastY && y > 120 && !menuOpen);
  lastY = y;
}, { passive: true });

/* ── Active nav link ─────────────────────── */
const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const navTargets = navAnchors.map(a => document.querySelector(a.getAttribute('href')));

function setActiveLink() {
  let activeIdx = 0;
  navTargets.forEach((sec, idx) => {
    if (sec && window.scrollY >= sec.offsetTop - window.innerHeight * 0.4) activeIdx = idx;
  });
  navAnchors.forEach((a, idx) => a.classList.toggle('active', idx === activeIdx));
}
window.addEventListener('scroll', setActiveLink, { passive: true });
setActiveLink();

/* ── Mobile menu ─────────────────────────── */
function setMenu(open) {
  navLinks.classList.toggle('open', open);
  hamburger.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}
hamburger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

/* ── Reveal on scroll ────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = Array.from(entry.target.parentElement.querySelectorAll(':scope > .reveal'));
    const idx = siblings.indexOf(entry.target);
    entry.target.style.transitionDelay = `${Math.min(idx * 0.08, 0.4)}s`;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Contact form → WhatsApp ─────────────── */
const WHATSAPP_NUMBER = '917218530058';
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const message = form.elements.message.value.trim();
    if (!name || !message) return;

    const text = `Hello Akshay, my name is ${name}.\n\n${message}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    form.reset();
  });
}

/* ── Reading progress bar + back to top ──── */
const progressBar = document.getElementById('progressBar');
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar) progressBar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
  if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 600);
}, { passive: true });
if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── Stat counters ───────────────────────── */
function animateCounter(el, target, duration = 1300) {
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target, +entry.target.dataset.count);
    counterObs.unobserve(entry.target);
  });
}, { threshold: 0.6 });
document.querySelectorAll('.stat-number[data-count]').forEach(el => counterObs.observe(el));

/* ── Card spotlight follows cursor ───────── */
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

/* ── Button ripple ───────────────────────── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const r = this.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 560);
  });
});

/* ── Pinned horizontal scroll (projects) ─── */
(function initHorizontalScroll() {
  const section = document.getElementById('projects');
  const track = document.getElementById('hscrollTrack');
  if (!section || !track) return;
  const mobile = window.matchMedia('(max-width: 768px)');
  const PACE = 1.4;
  const prevBtn = document.getElementById('projPrev');
  const nextBtn = document.getElementById('projNext');
  const cards = Array.from(track.children);

  // Horizontal offset of each card's left edge relative to the track's first card.
  const cardStops = () => cards.map(c => c.offsetLeft - cards[0].offsetLeft);
  const currentX = () => (mobile.matches ? track.scrollLeft : getDesktopX());

  function getDesktopX() {
    const dist = Math.max(0, track.scrollWidth - window.innerWidth);
    const total = section.offsetHeight - window.innerHeight;
    const p = total > 0 ? clamp(-section.getBoundingClientRect().top / total, 0, 1) : 0;
    return p * dist;
  }

  function updateArrows() {
    const x = currentX();
    const maxX = mobile.matches
      ? track.scrollWidth - track.clientWidth
      : Math.max(0, track.scrollWidth - window.innerWidth);
    prevBtn.disabled = x <= 4;
    nextBtn.disabled = x >= maxX - 4;
  }

  function update() {
    if (!mobile.matches) {
      track.style.transform = `translate3d(${-getDesktopX()}px,0,0)`;
    }
    updateArrows();
  }

  function goTo(dir) {
    const x = currentX();
    const stops = cardStops();
    const target = dir > 0
      ? stops.find(s => s > x + 8)
      : [...stops].reverse().find(s => s < x - 8);
    if (target === undefined && dir > 0) return;
    const left = target === undefined ? 0 : target;

    if (mobile.matches) {
      track.scrollTo({ left, behavior: 'smooth' });
      return;
    }
    // Map the horizontal offset back onto the pinned section's vertical scroll range.
    const dist = Math.max(0, track.scrollWidth - window.innerWidth);
    const total = section.offsetHeight - window.innerHeight;
    const p = dist > 0 ? clamp(left / dist, 0, 1) : 0;
    window.scrollTo({ top: section.offsetTop + p * total, behavior: 'smooth' });
  }

  prevBtn.addEventListener('click', () => goTo(-1));
  nextBtn.addEventListener('click', () => goTo(1));
  track.addEventListener('scroll', updateArrows, { passive: true });

  function resize() {
    if (mobile.matches) {
      section.style.height = '';
      track.style.transform = '';
      updateArrows();
      return;
    }
    const dist = Math.max(0, track.scrollWidth - window.innerWidth);
    section.style.height = `${dist * PACE + window.innerHeight}px`;
    update();
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', resize);
  window.addEventListener('load', resize);
  resize();
})();

/* ── Interactive particle name ───────────── */
(function initParticleText() {
  const canvas = document.getElementById('particleCanvas');
  const host = document.getElementById('home');
  if (!canvas || !host) return;

  const ctx = canvas.getContext('2d');
  const TEXT = 'AKSHAY';
  const COLORS = ['#FFFFFF', '#F9ED1A', '#FFFFFF'];
  const MOUSE_RADIUS = 150;
  const REPEL = 2.2;
  const SWIRL = 0.9;
  const DRAG = 0.4;
  const SPRING = 0.012;
  const FRICTION = 0.9;
  const INTRO_FRAMES = 140;
  const mouse = { x: -9999, y: -9999, vx: 0, vy: 0 };

  let particles = [];
  let w = 0, h = 0, dpr = 1, size = 3;
  let rafId = 0;
  let visible = true;
  let frame = 0;

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = Math.floor(rect.width);
    h = Math.floor(rect.height);
    if (!w || !h) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const octx = off.getContext('2d', { willReadFrequently: true });

    let fs = Math.min(w / (TEXT.length * 0.7), h * 0.4);
    const setFont = () => { octx.font = `900 ${fs}px Outfit, sans-serif`; };
    setFont();
    const tw = octx.measureText(TEXT).width;
    if (tw > w * 0.9) { fs *= (w * 0.9) / tw; setFont(); }
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText(TEXT, w / 2, h / 2);

    const gap = Math.max(4, Math.round(fs / 48));
    size = Math.max(3, gap - 1);
    const data = octx.getImageData(0, 0, w, h).data;
    const next = [];
    for (let y = 0; y < h; y += gap) {
      for (let x = 0; x < w; x += gap) {
        if (data[(y * w + x) * 4 + 3] > 128) {
          const c = Math.floor(Math.random() * COLORS.length);
          next.push({
            ox: x, oy: y,
            x: reduceMotion ? x : Math.random() * w,
            y: reduceMotion ? y : Math.random() * h,
            vx: 0, vy: 0,
            c,
          });
        }
      }
    }
    next.sort((a, b) => a.c - b.c);
    particles = next;
    frame = 0;
    draw();
  }

  function step() {
    const intro = frame++ < INTRO_FRAMES;
    const mvx = mouse.vx;
    const mvy = mouse.vy;
    const swirl = SWIRL * clamp(Math.hypot(mvx, mvy) / 12, 0.1, 1);
    mouse.vx *= 0.8;
    mouse.vy *= 0.8;

    for (const p of particles) {
      if (intro) {
        p.x += (p.ox - p.x) * 0.06;
        p.y += (p.oy - p.y) * 0.06;
        continue;
      }
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < MOUSE_RADIUS && d > 0.01) {
        const f = (MOUSE_RADIUS - d) / MOUSE_RADIUS;
        const nx = dx / d;
        const ny = dy / d;
        // Push away, add a sideways swirl, and carry some of the cursor's motion.
        p.vx += nx * f * f * REPEL - ny * f * swirl + mvx * f * DRAG;
        p.vy += ny * f * f * REPEL + nx * f * swirl + mvy * f * DRAG;
      }
      p.vx += (p.ox - p.x) * SPRING;
      p.vy += (p.oy - p.y) * SPRING;
      p.vx *= FRICTION;
      p.vy *= FRICTION;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    let last = -1;
    for (const p of particles) {
      if (p.c !== last) { ctx.fillStyle = COLORS[p.c]; last = p.c; }
      ctx.fillRect(p.x, p.y, size, size);
    }
  }

  function loop() {
    if (!visible) { rafId = 0; return; }
    step();
    draw();
    rafId = requestAnimationFrame(loop);
  }
  function start() { if (!rafId && !reduceMotion) rafId = requestAnimationFrame(loop); }

  host.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (mouse.x > -9000) {
      mouse.vx = clamp(x - mouse.x, -40, 40);
      mouse.vy = clamp(y - mouse.y, -40, 40);
    }
    mouse.x = x;
    mouse.y = y;
  });
  host.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; mouse.vx = mouse.vy = 0; });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  }).observe(host);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { build(); start(); }, 200);
  });

  const fontReady = document.fonts && document.fonts.load
    ? document.fonts.load('900 100px Outfit').catch(() => {})
    : Promise.resolve();
  fontReady.then(() => { build(); start(); });
})();
