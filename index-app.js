/* ================================================================
   Urban Web — index-app.js
   ================================================================ */

// ── NAV SCROLL ─────────────────────────────────────────────────
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 52);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── SCROLL REVEAL ───────────────────────────────────────────────
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

// ── CONTACT FORM ────────────────────────────────────────────────
(function () {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form || !success) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.display = 'none';
    success.style.display = 'block';
  });
})();

// ── SILO DIAGRAM ────────────────────────────────────────────────
class SiloDiagram {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.dpr     = Math.min(window.devicePixelRatio || 1, 2);
    this.w       = 0;
    this.h       = 0;
    this.r       = 0;
    this.startTime    = null;
    this.animFrame    = null;
    this.attempts     = [];
    this.lastSpawn    = 0;
    this.spawnInterval = 1500;

    // Node definitions — fractional positions tuned for visual balance
    this.nodes = [
      { label: 'Transit',   abbr: 'Tr', color: '#2A8FE0', fx: 0.22, fy: 0.20 },
      { label: 'Ride-hail', abbr: 'Rh', color: '#D4782A', fx: 0.64, fy: 0.13 },
      { label: 'Micro',     abbr: 'Mc', color: '#3D9464', fx: 0.87, fy: 0.44 },
      { label: 'EV',        abbr: 'EV', color: '#2A9E72', fx: 0.70, fy: 0.82 },
      { label: 'Parking',   abbr: 'Pk', color: '#7B60D0', fx: 0.25, fy: 0.82 },
      { label: 'Logistics', abbr: 'Lo', color: '#258BAA', fx: 0.06, fy: 0.50 },
      { label: 'Aviation',  abbr: 'Av', color: '#C062CA', fx: 0.46, fy: 0.47 },
    ];
  }

  // ── Lifecycle ─────────────────────────────────────────────────
  start() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    const loop = (ts) => {
      if (!this.startTime) this.startTime = ts;
      this.update(ts);
      this.draw(ts);
      this.animFrame = requestAnimationFrame(loop);
    };
    this.animFrame = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }

  resize() {
    const w = this.canvas.offsetWidth;
    const h = this.canvas.offsetHeight;
    if (!w || !h) return;
    this.w = w;
    this.h = h;
    this.canvas.width  = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
    // Node radius: proportional to smaller canvas dimension
    this.r = Math.min(w, h) * 0.076;
    // Map fractional positions to pixels
    this.nodes.forEach(n => {
      n.x = n.fx * w;
      n.y = n.fy * h;
    });
  }

  // ── Update ────────────────────────────────────────────────────
  update(ts) {
    // Spawn new connection attempt
    if (ts - this.lastSpawn > this.spawnInterval && this.attempts.length < 3) {
      this.spawnAttempt(ts);
      this.lastSpawn    = ts;
      this.spawnInterval = 1100 + Math.random() * 1000;
    }

    // Step each attempt through its lifecycle
    this.attempts = this.attempts.filter(a => {
      if (a.phase === 'drawing') {
        a.t = Math.min((ts - a.startTime) / a.drawDuration, 0.72);
        if (a.t >= 0.72) {
          a.phase      = 'flashing';
          a.flashStart = ts;
          a.flashT     = 1;
        }

      } else if (a.phase === 'flashing') {
        const age = ts - a.flashStart;
        a.flashT = Math.max(0, 1 - age / 300);
        if (age > 300) {
          a.phase     = 'fading';
          a.fadeStart = ts;
          a.tStart    = a.t;
        }

      } else if (a.phase === 'fading') {
        const p = Math.min((ts - a.fadeStart) / 440, 1);
        a.t = a.tStart * (1 - p);
        if (p >= 1) return false; // remove
      }
      return true;
    });
  }

  spawnAttempt(ts) {
    const from = Math.floor(Math.random() * this.nodes.length);
    let to;
    do { to = Math.floor(Math.random() * this.nodes.length); } while (to === from);
    this.attempts.push({
      from, to,
      t: 0, phase: 'drawing',
      startTime:    ts,
      drawDuration: 820 + Math.random() * 480,
      flashStart: null, flashT: 0,
      fadeStart: null, tStart: 0,
    });
  }

  // ── Draw ──────────────────────────────────────────────────────
  draw(ts) {
    const { ctx, w, h, r } = this;
    const elapsed = ts - (this.startTime || ts);

    ctx.clearRect(0, 0, w, h);

    // ── Background: deep navy ──────────────────────────────────
    ctx.fillStyle = '#07111e';
    ctx.fillRect(0, 0, w, h);

    // Subtle dot grid
    ctx.fillStyle = 'rgba(255,255,255,0.022)';
    for (let x = 0; x <= w; x += 30) {
      for (let y = 0; y <= h; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 0.75, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Connection attempts (drawn behind nodes) ───────────────
    this.attempts.forEach(a => {
      const fn = this.nodes[a.from];
      const tn = this.nodes[a.to];
      const dx = tn.x - fn.x, dy = tn.y - fn.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) return;
      const ux = dx / dist, uy = dy / dist;

      // Line segment: starts at surface of 'from', ends at surface of 'to'
      const sx = fn.x + ux * (r + 2), sy = fn.y + uy * (r + 2);
      const ex = tn.x - ux * (r + 2), ey = tn.y - uy * (r + 2);

      // Current endpoint along the line
      const endX = sx + (ex - sx) * a.t;
      const endY = sy + (ey - sy) * a.t;

      const alpha = a.phase === 'fading' ? (a.t / (a.tStart || 0.72)) : 1;

      // Dashed line
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.lineWidth   = 1.5;
      ctx.strokeStyle = fn.color;
      ctx.globalAlpha = 0.52 * alpha;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // ── Rejection flash ──────────────────────────────────────
      if (a.phase === 'flashing' && a.flashT > 0) {
        const fl = a.flashT;
        ctx.save();

        // Expanding ring
        ctx.globalAlpha = fl * 0.28;
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth   = 1.2;
        ctx.beginPath();
        ctx.arc(endX, endY, 18 * (1.8 - fl * 0.8), 0, Math.PI * 2);
        ctx.stroke();

        // X mark
        ctx.globalAlpha = fl * 0.9;
        ctx.strokeStyle = '#ff5555';
        ctx.lineWidth   = 2;
        const bs = 7;
        ctx.beginPath();
        ctx.moveTo(endX - bs, endY - bs); ctx.lineTo(endX + bs, endY + bs);
        ctx.moveTo(endX + bs, endY - bs); ctx.lineTo(endX - bs, endY + bs);
        ctx.stroke();

        ctx.restore();
      }
    });

    // ── Nodes ─────────────────────────────────────────────────
    this.nodes.forEach((n, i) => {
      // Independent pulse per node (staggered)
      const pulseT = ((elapsed / 3200) + i / this.nodes.length) % 1;
      const pulse  = (Math.sin(pulseT * Math.PI * 2) + 1) / 2; // 0→1

      // ── Outer breath ring ──────────────────────────────────
      ctx.save();
      ctx.globalAlpha = pulse * 0.13;
      ctx.strokeStyle = n.color;
      ctx.lineWidth   = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 1.68 + pulse * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // ── Glow (shadow behind fill) ─────────────────────────
      ctx.save();
      ctx.shadowColor = n.color;
      ctx.shadowBlur  = 18;
      ctx.globalAlpha = 0.32;
      ctx.fillStyle   = n.color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── Inner fill ────────────────────────────────────────
      ctx.save();
      ctx.globalAlpha = 0.11;
      ctx.fillStyle   = n.color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── Silo wall (border) ────────────────────────────────
      ctx.save();
      ctx.globalAlpha = 0.82;
      ctx.strokeStyle = n.color;
      ctx.lineWidth   = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // ── Abbreviation ──────────────────────────────────────
      ctx.save();
      ctx.globalAlpha    = 0.9;
      ctx.fillStyle      = '#ffffff';
      ctx.font           = `600 ${Math.round(r * 0.42)}px 'DM Sans', sans-serif`;
      ctx.textAlign      = 'center';
      ctx.textBaseline   = 'middle';
      ctx.fillText(n.abbr, n.x, n.y);
      ctx.restore();

      // ── Label below ───────────────────────────────────────
      ctx.save();
      ctx.globalAlpha    = 0.48;
      ctx.fillStyle      = '#ffffff';
      ctx.font           = `400 ${Math.round(r * 0.36)}px 'DM Sans', sans-serif`;
      ctx.textAlign      = 'center';
      ctx.textBaseline   = 'top';
      ctx.fillText(n.label, n.x, n.y + r + 5);
      ctx.restore();
    });
  }
}

// ── Init: start diagram when it scrolls into view ──────────────
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('siloDiagram');
  if (!canvas) return;

  const diagram = new SiloDiagram(canvas);

  if (!('IntersectionObserver' in window)) {
    diagram.start();
    return;
  }

  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      diagram.start();
      io.disconnect();
    }
  }, { threshold: 0.1 });
  io.observe(canvas);
});
