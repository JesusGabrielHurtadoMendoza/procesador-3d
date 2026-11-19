/* Procesador 3D — efectos de interfaz: pantalla de carga, confeti, entrada del panel y contador animado.
   Todo respeta "reducir movimiento" del sistema operativo. */
window.PXD = window.PXD || {};
PXD.fx = (function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- pantalla de carga ---------- */
  function ready() {
    const s = document.getElementById('splash'); if (!s || s.classList.contains('out')) return;
    s.classList.add('out'); setTimeout(() => s.remove(), 700);
  }
  function loadError(msg) {
    const s = document.getElementById('splash'); if (!s) return;
    s.classList.add('error'); const p = s.querySelector('.splash-msg'); if (p) p.textContent = msg;
  }

  /* ---------- confeti ---------- */
  let cv = null, g = null, parts = [], running = false;
  const COLORS = ['#D08A4E', '#F0B27A', '#7FC4D4', '#9FE8F5', '#6BCB8B', '#E4ECF2'];
  function confetti(opts) {
    if (reduce) return;
    opts = opts || {};
    if (!cv) {
      cv = document.createElement('canvas'); cv.className = 'confetti'; cv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cv); g = cv.getContext('2d');
    }
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = opts.n || 160, ox = (opts.x == null ? 0.5 : opts.x) * W, oy = (opts.y == null ? 0.45 : opts.y) * H;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1, v = 7 + Math.random() * 9;
      parts.push({ x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
        w: 5 + Math.random() * 6, h: 8 + Math.random() * 8, c: COLORS[i % COLORS.length], life: 0, chip: Math.random() < 0.25 });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function tick() {
    g.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach(p => {
      p.life++; p.vy += 0.28; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - p.life / 150);
      if (p.chip) { // mini chip: cuadro con patitas
        g.fillStyle = '#1C2227'; g.fillRect(-5, -5, 10, 10); g.fillStyle = p.c; g.fillRect(-3, -3, 6, 6);
      } else { g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2 * Math.abs(Math.cos(p.life * 0.12)), p.w, p.h * Math.abs(Math.cos(p.life * 0.12)) + 1); }
      g.restore();
    });
    parts = parts.filter(p => p.life < 150 && p.y < innerHeight + 40);
    if (parts.length) requestAnimationFrame(tick); else { running = false; g.clearRect(0, 0, innerWidth, innerHeight); }
  }

  /* ---------- entrada del contenido del panel ---------- */
  function panelIn(el) {
    if (reduce || !el) return;
    el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter');
    clearTimeout(el._fxT); el._fxT = setTimeout(() => el.classList.remove('enter'), 900);
  }

  /* ---------- número que sube ---------- */
  function countUp(el, to, ms) {
    if (!el) return;
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now(); ms = ms || 900;
    (function step(now) {
      const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  return { ready, loadError, confetti, panelIn, countUp, reduce };
})();
