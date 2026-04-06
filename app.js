'use strict';

// ─────────────────────────────────────────────
// HERO CIVIC CANVAS — distributed mesh network
// ─────────────────────────────────────────────
function initHeroCivicCanvas() {
  const canvas = document.getElementById('heroCivicCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  let W, H, tick = 0;

  // Nodes scattered naturally — no central hub. Kept ≥16% from edges so labels don't clip.
  const NODES = [
    { label: 'Transit',  px: 0.22, py: 0.22, color: '#0078CE' },
    { label: 'Parking',  px: 0.68, py: 0.17, color: '#A0521A' },
    { label: 'Health',   px: 0.86, py: 0.47, color: '#C0392B' },
    { label: 'Events',   px: 0.72, py: 0.80, color: '#5B3FA8' },
    { label: 'Hotels',   px: 0.44, py: 0.86, color: '#1A6B48' },
    { label: 'EV',       px: 0.18, py: 0.74, color: '#1B6B7A' },
    { label: 'Work',     px: 0.16, py: 0.44, color: '#344B53' },
    { label: 'Schools',  px: 0.50, py: 0.16, color: '#A0521A' },
  ];

  // Dense mesh — outer ring + internal cross-links so every node has 3+ connections
  const EDGES = [
    [0, 7], [7, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0],  // outer ring
    [0, 2], [7, 3], [1, 5], [6, 3], [0, 4], [7, 5],                   // diagonals
  ];

  function resize() {
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width  = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  }

  function draw() {
    tick++;
    ctx.clearRect(0, 0, W, H);
    if (!W || !H) { requestAnimationFrame(draw); return; }

    // Faint city grid
    ctx.strokeStyle = 'rgba(28,43,48,0.04)';
    ctx.lineWidth = 0.5;
    const GRID = 34;
    for (let x = 0; x < W; x += GRID) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += GRID) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const pos = NODES.map(n => ({ x: n.px * W, y: n.py * H, ...n }));

    // Edges — static base line + animated flowing dash
    EDGES.forEach(([a, b], ei) => {
      const pa = pos[a], pb = pos[b];

      // Static base
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
      ctx.strokeStyle = 'rgba(0,120,206,0.09)';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.stroke();

      // Flowing animation
      const speed = 0.26 + (ei % 4) * 0.07;
      ctx.setLineDash([5, 20]);
      ctx.lineDashOffset = -(tick * speed + ei * 28);
      ctx.strokeStyle = 'rgba(0,120,206,0.20)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Nodes
    pos.forEach((n, i) => {
      const pulse = Math.sin(tick * 0.022 + i * 0.78) * 0.5 + 0.5;

      // Glow
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 22);
      grd.addColorStop(0, n.color + '22');
      grd.addColorStop(1, n.color + '00');
      ctx.beginPath();
      ctx.arc(n.x, n.y, 18 + pulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.globalAlpha = 0.78 + pulse * 0.22;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Inner white
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fill();

      // Label — push outward from canvas centre, clamped to stay inside canvas
      const ccx = W * 0.5, ccy = H * 0.5;
      const dx = n.x - ccx, dy = n.y - ccy;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const rawLx = n.x + (dx / len) * 20;
      const rawLy = n.y + (dy / len) * 17;
      const lx = Math.max(6, Math.min(W - 6, rawLx));
      const ly = Math.max(12, Math.min(H - 6, rawLy));

      ctx.fillStyle = '#1C2B30';
      ctx.font = '500 10.5px Inter, system-ui, sans-serif';
      ctx.textAlign    = dx >  20 ? 'left'   : dx < -20 ? 'right'  : 'center';
      ctx.textBaseline = dy >  20 ? 'top'    : dy < -20 ? 'bottom' : 'middle';
      ctx.fillText(n.label, lx, ly);
      ctx.textBaseline = 'alphabetic';
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { ctx.resetTransform(); resize(); }, { passive: true });
  resize(); draw();
}

// ─────────────────────────────────────────────
// PROBLEM DIAGRAM CANVAS — siloed services
// ─────────────────────────────────────────────
function initProblemDiagram() {
  const canvas = document.getElementById('problemDiagramCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const SILOS = [
    { label: 'Transit',   color: '#0078CE' },
    { label: 'Parking',   color: '#A0521A' },
    { label: 'Hospitals', color: '#C0392B' },
    { label: 'Employers', color: '#5B3FA8' },
    { label: 'Hotels',    color: '#1A6B48' },
    { label: 'Drivers',   color: '#1B6B7A' },
  ];

  // A few 'attempted' connections that go nowhere — just between a few pairs
  const BROKEN_PAIRS = [[0,1],[1,2],[2,3],[3,4],[4,5]];

  function resize() {
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    const n = SILOS.length;
    const siloW = Math.min(60, (W - 80) / n - 12);
    const siloH = H * 0.52;
    const siloR = 4;
    const totalW = n * siloW + (n - 1) * 18;
    const startX = (W - totalW) / 2;
    const siloY  = (H - siloH) / 2 - 8;

    // Draw broken connection attempts — dashed lines between close pairs
    BROKEN_PAIRS.forEach(([a, b]) => {
      const ax = startX + a * (siloW + 18) + siloW * 0.5;
      const bx = startX + b * (siloW + 18) + siloW * 0.5;
      const lineY = siloY + siloH * 0.4;
      const mx = (ax + bx) / 2;

      ctx.save();
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = 'rgba(192,57,43,0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ax + siloW * 0.3, lineY);
      ctx.lineTo(bx - siloW * 0.3, lineY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Small × mark
      const xs = 4.5;
      ctx.strokeStyle = 'rgba(192,57,43,0.55)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mx - xs, lineY - xs); ctx.lineTo(mx + xs, lineY + xs);
      ctx.moveTo(mx + xs, lineY - xs); ctx.lineTo(mx - xs, lineY + xs);
      ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.restore();
    });

    // Draw silos
    SILOS.forEach((s, i) => {
      const x = startX + i * (siloW + 18);
      const col = s.color;

      // Silo container — tall rounded rect with thick border (the "wall")
      ctx.save();
      ctx.beginPath();
      const r = siloR;
      ctx.moveTo(x + r, siloY);
      ctx.lineTo(x + siloW - r, siloY);
      ctx.arcTo(x + siloW, siloY, x + siloW, siloY + r, r);
      ctx.lineTo(x + siloW, siloY + siloH - r);
      ctx.arcTo(x + siloW, siloY + siloH, x + siloW - r, siloY + siloH, r);
      ctx.lineTo(x + r, siloY + siloH);
      ctx.arcTo(x, siloY + siloH, x, siloY + siloH - r, r);
      ctx.lineTo(x, siloY + r);
      ctx.arcTo(x, siloY, x + r, siloY, r);
      ctx.closePath();

      // Fill with very light tint
      ctx.fillStyle = col + '0D';
      ctx.fill();

      // Thick border — the silo wall
      ctx.strokeStyle = col + '60';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Coloured top cap
      ctx.save();
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, siloY, siloW, 18);
      ctx.restore();

      // Label inside
      ctx.save();
      ctx.fillStyle = col;
      ctx.font = `600 ${Math.max(9, Math.round(siloW * 0.16))}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Rotate label for narrow silos
      ctx.translate(x + siloW / 2, siloY + siloH * 0.56);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(s.label, 0, 0);
      ctx.restore();

      // Lock icon (padlock shape) to reinforce isolation
      const lx = x + siloW / 2, ly = siloY + siloH - 18;
      ctx.save();
      ctx.strokeStyle = col + '80';
      ctx.lineWidth = 1.2;
      // shackle
      ctx.beginPath();
      ctx.arc(lx, ly - 4, 4, Math.PI, 0, false);
      ctx.stroke();
      // body
      ctx.fillStyle = col + '25';
      ctx.strokeStyle = col + '60';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(lx - 5, ly - 2, 10, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  window.addEventListener('resize', () => { ctx.resetTransform(); resize(); }, { passive: true });
  resize();
}

// ─────────────────────────────────────────────
// SCROLL REVEALS
// ─────────────────────────────────────────────
function initReveals() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ─────────────────────────────────────────────
// DEMO HELPERS — light civic style
// ─────────────────────────────────────────────
const C = {
  bg:    '#FFFFFF',
  surf:  '#F0F2F5',
  border:'rgba(28,43,48,0.12)',
  text:  '#1C2B30',
  text2: '#4E6268',
  text3: '#8FA5AB',
  blue:  '#0078CE',
  green: '#2D6B4E',
  amber: '#A0521A',
  red:   '#C0392B',
  purple:'#5B3FA8',
  teal:  '#1B6B7A',
};

// Small helpers for inline demo HTML
function dHead(title) {
  return `<div style="background:${C.surf};padding:10px 14px;border-bottom:1px solid ${C.border}">
    <div style="font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${C.text3}">${title}</div>
  </div>`;
}
function dPill(label, col) {
  return `<span style="background:${col}18;color:${col};border:1px solid ${col}40;font-size:10px;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;padding:2px 8px;border-radius:2px">${label}</span>`;
}
function dRow(key, val, valCol) {
  return `<div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;padding:4px 0;border-bottom:1px solid ${C.border}">
    <span style="color:${C.text3};font-weight:500">${key}</span>
    <span style="color:${valCol || C.text};font-weight:600">${val}</span>
  </div>`;
}
function dBar(pct, col) {
  return `<div style="height:4px;background:${C.surf};border-radius:2px;overflow:hidden;margin:4px 0">
    <div style="width:${pct}%;height:100%;background:${col};border-radius:2px"></div>
  </div>`;
}
function dCard(content, accentCol) {
  return `<div style="background:${accentCol}0a;border:1px solid ${accentCol}30;border-radius:4px;padding:11px 12px">${content}</div>`;
}
function dStat(num, label, col) {
  return `<div style="text-align:center;padding:10px">
    <div style="font-size:22px;font-weight:700;color:${col};line-height:1">${num}</div>
    <div style="font-size:10px;font-weight:500;color:${C.text3};text-transform:uppercase;letter-spacing:0.07em;margin-top:3px">${label}</div>
  </div>`;
}
function dBtn(label, col) {
  return `<div style="background:${col};color:#fff;text-align:center;padding:9px;font-size:12px;font-weight:600;border-radius:3px;letter-spacing:0.04em">${label}</div>`;
}

// ─────────────────────────────────────────────
// DEMO 2 — Mobility as a Feature (phone)
// ─────────────────────────────────────────────
const DEMO2_SCREENS = [
  // Screen 1: Appointment confirmed
  dHead('City Central Hospital') + `
  <div style="padding:14px;flex:1;display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:28px;height:28px;background:${C.green}18;border:1px solid ${C.green}40;border-radius:50%;display:flex;align-items:center;justify-content:center;color:${C.green};font-weight:700;font-size:13px;flex-shrink:0">✓</div>
      <div>
        <div style="font-size:13px;font-weight:600;color:${C.text}">Appointment confirmed</div>
        <div style="font-size:10px;color:${C.text3};margin-top:1px">Reminder will be sent</div>
      </div>
    </div>
    ${dCard(`<div style="font-size:10px;font-weight:600;color:${C.text3};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">Appointment</div>
      <div style="font-size:13px;font-weight:600;color:${C.text};margin-bottom:2px">Dr. Sarah Chen · Cardiology</div>
      <div style="font-size:11px;color:${C.blue};font-weight:600">Thu Apr 10 · 14:30</div>
      <div style="font-size:11px;color:${C.text3};margin-top:2px">City Central Hospital, West Wing</div>`, C.blue)}
    ${dCard(`<div style="font-size:10px;color:${C.text3};margin-bottom:6px">Mobility available for this appointment</div>
      <div style="font-size:13px;font-weight:600;color:${C.blue}">Plan your journey →</div>`, C.blue)}
  </div>`,

  // Screen 2: Journey options
  dHead('Route options · City Central Hospital · 14:30') + `
  <div style="padding:12px 14px;flex:1;display:flex;flex-direction:column;gap:8px">
    ${dCard(`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-size:11px;font-weight:600;color:${C.blue}">Fastest · 42 min</div>
        <div style="font-size:14px;font-weight:700;color:${C.text}">€3.50</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:7px">
          <span style="background:${C.blue};color:#fff;padding:1px 7px;font-size:9px;font-weight:700;border-radius:2px">BUS 42</span>
          <span style="font-size:11px;color:${C.text}">Riverside Stop — 4 stops</span>
        </div>
        <div style="border-left:1px dashed ${C.border};margin-left:10px;padding-left:10px;font-size:10px;color:${C.text3}">change at Exchange</div>
        <div style="display:flex;align-items:center;gap:7px">
          <span style="background:${C.text2};color:#fff;padding:1px 7px;font-size:9px;font-weight:700;border-radius:2px">M2</span>
          <span style="font-size:11px;color:${C.text}">Metro · 5 stops + 8 min walk</span>
        </div>
      </div>
      ${dBtn('Book this journey', C.blue)}`, C.blue)}
    <div style="background:${C.surf};border:1px solid ${C.border};border-radius:4px;padding:10px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:10px;color:${C.text3}">Alternative · 55 min</div>
        <div style="font-size:11px;color:${C.text};margin-top:2px">Bus 71 · Direct</div>
      </div>
      <div style="font-size:13px;font-weight:700;color:${C.text}">€2.80</div>
    </div>
  </div>`,

  // Screen 3: Booked
  dHead('✓ Journey booked') + `
  <div style="padding:14px;flex:1;display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;flex-direction:column;gap:6px">
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="width:7px;height:7px;background:${C.blue};border-radius:50%;margin-top:4px;flex-shrink:0"></div>
        <div>
          <div style="font-size:12px;font-weight:500;color:${C.text}">Bus 42 · Riverside Stop</div>
          <div style="font-size:10px;color:${C.text3}">Departs 13:38</div>
        </div>
      </div>
      <div style="border-left:1px dashed ${C.border};margin-left:3px;height:12px"></div>
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="width:7px;height:7px;background:${C.text3};border-radius:50%;margin-top:4px;flex-shrink:0"></div>
        <div>
          <div style="font-size:12px;font-weight:500;color:${C.text}">Metro Line 2 · Exchange</div>
          <div style="font-size:10px;color:${C.text3}">Connect 13:55</div>
        </div>
      </div>
      <div style="border-left:1px dashed ${C.border};margin-left:3px;height:12px"></div>
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="width:7px;height:7px;background:${C.green};border-radius:50%;margin-top:4px;flex-shrink:0"></div>
        <div>
          <div style="font-size:12px;font-weight:500;color:${C.text}">City Central Hospital</div>
          <div style="font-size:10px;color:${C.green};font-weight:600">Arrives 14:20 — 10 min early</div>
        </div>
      </div>
    </div>
    ${dCard(`<div style="font-size:11px;color:${C.green};font-weight:600;margin-bottom:3px">✓ Ticket issued to device</div>
      <div style="font-size:11px;color:${C.green};font-weight:600">✓ Reminder set · 13:25</div>`, C.green)}
  </div>`,

  // Screen 4: Trip complete
  dHead('Trip complete') + `
  <div style="padding:14px;flex:1;display:flex;flex-direction:column;gap:10px">
    <div style="text-align:center;padding:8px 0">
      <div style="font-size:11px;font-weight:600;color:${C.green};letter-spacing:0.07em;text-transform:uppercase;margin-bottom:4px">Sustainable journey verified</div>
      <div style="font-size:10px;color:${C.text3}">Thu Apr 10 · 42 minutes</div>
    </div>
    ${dCard(`<div style="text-align:center">
      <div style="font-size:30px;font-weight:700;color:${C.green};line-height:1">+47</div>
      <div style="font-size:10px;font-weight:600;color:${C.green};text-transform:uppercase;letter-spacing:0.07em;margin-top:4px">Green credits issued</div>
      <div style="font-size:10px;color:${C.text3};margin-top:2px">added to wallet automatically</div>
    </div>`, C.green)}
    <div style="background:${C.surf};border:1px solid ${C.border};border-radius:4px;padding:11px">
      <div style="font-size:10px;font-weight:600;color:${C.text3};text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px">Employer ESG · Q1</div>
      ${dRow('Verified trips', '142', C.text)}
      ${dRow('CO₂ avoided', '1.8 t', C.green)}
    </div>
  </div>`,
];

// ─────────────────────────────────────────────
// DEMO 1 — Green Commuting (split screen)
// ─────────────────────────────────────────────
const DEMO1_SCREENS = [
  // Screen 1: Policy set
  `<div class="split-panel">
    <div class="split-panel-label">Employer — TechCorp</div>
    <div style="flex:1;display:flex;flex-direction:column;gap:8px">
      ${dCard(`<div style="font-size:12px;font-weight:600;color:${C.text};margin-bottom:8px">Green Commute Policy</div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
          <div style="width:6px;height:6px;background:${C.green};border-radius:50%;flex-shrink:0"></div>
          <span style="font-size:11px;font-weight:600;color:${C.green}">Active</span>
        </div>
        <div style="padding:4px 0 7px;border-bottom:1px solid ${C.border}">
          <div style="font-size:10px;font-weight:500;color:${C.text3};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px">Qualifies</div>
          <div style="display:flex;gap:3px;flex-wrap:wrap">${dPill('Metro', C.blue)}${dPill('Bus', C.blue)}${dPill('Tram', C.blue)}${dPill('Bike', C.green)}</div>
        </div>
        ${dRow('Reward', '1 credit / km')}
        ${dRow('Employees', '2,400')}`, C.green)}
      <div style="font-size:11px;color:${C.text3};line-height:1.6">Set once. Every transit operator in the city enforces it. No bilateral agreements.</div>
    </div>
  </div>
  <div class="split-panel">
    <div class="split-panel-label">Employee — Sarah</div>
    <div style="flex:1;display:flex;flex-direction:column;gap:8px;justify-content:center">
      <div style="font-size:10px;font-weight:500;color:${C.text3};text-transform:uppercase;letter-spacing:0.07em;margin-bottom:4px">Available to her today</div>
      <div style="background:${C.surf};border:1px solid ${C.border};border-radius:4px;padding:10px">
        <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid ${C.border}">
          <div style="width:5px;height:5px;background:${C.blue};border-radius:50%;flex-shrink:0"></div>
          <div style="font-size:12px;color:${C.text}">Metro Line 2</div>
        </div>
        <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid ${C.border}">
          <div style="width:5px;height:5px;background:${C.blue};border-radius:50%;flex-shrink:0"></div>
          <div style="font-size:12px;color:${C.text}">Bus 47</div>
        </div>
        <div style="display:flex;align-items:center;gap:7px">
          <div style="width:5px;height:5px;background:${C.blue};border-radius:50%;flex-shrink:0"></div>
          <div style="font-size:12px;color:${C.text}">Tram 3</div>
        </div>
      </div>
      <div style="font-size:11px;color:${C.text3}">Credits balance: 0</div>
    </div>
  </div>`,

  // Screen 2: Trip verifying
  `<div class="split-panel">
    <div class="split-panel-label">Employer — TechCorp</div>
    <div style="flex:1;display:flex;flex-direction:column;gap:8px;justify-content:center">
      <div style="font-size:10px;font-weight:500;color:${C.text3};text-transform:uppercase;letter-spacing:0.07em">Policy active — watching for trips</div>
      ${dCard(`<div style="display:flex;align-items:center;gap:7px;margin-bottom:6px">
          <div style="width:6px;height:6px;background:${C.amber};border-radius:50%;flex-shrink:0;animation:blink 1.4s ease-in-out infinite"></div>
          <span style="font-size:11px;font-weight:600;color:${C.amber}">Verifying trip</span>
        </div>
        <div style="font-size:11px;color:${C.text2};margin-bottom:2px">Sarah K. · Metro Line 2 · 8.3 km</div>
        <div style="font-size:11px;color:${C.green};font-weight:600">Route ✓ · Mode ✓ · Operator ✓</div>`, C.amber)}
    </div>
  </div>
  <div class="split-panel">
    <div class="split-panel-label">Employee — Sarah</div>
    <div style="flex:1;display:flex;flex-direction:column;gap:8px;justify-content:center">
      ${dCard(`<div style="font-size:12px;font-weight:600;color:${C.text};margin-bottom:6px">Morning commute</div>
        <div style="font-size:11px;color:${C.text2};margin-bottom:2px">Metro Line 2 · 8.3 km</div>
        <div style="font-size:11px;color:${C.text2};margin-bottom:10px">08:42 → 09:04</div>
        <div style="display:flex;align-items:center;gap:6px">
          <div style="width:6px;height:6px;background:${C.amber};border-radius:50%;flex-shrink:0;animation:blink 1.4s ease-in-out infinite"></div>
          <span style="font-size:11px;font-weight:600;color:${C.amber}">Verifying</span>
        </div>`, C.amber)}
    </div>
  </div>`,

  // Screen 3: Verified
  `<div class="split-panel">
    <div class="split-panel-label">Employer — TechCorp</div>
    <div style="flex:1;display:flex;flex-direction:column;gap:8px">
      <div style="font-size:11px;font-weight:600;color:${C.green}">Q1 Report · Updated ✓</div>
      ${dCard(`${dRow('Verified trips', '142,847')}
        ${dRow('On transit', '74%')}
        ${dRow('CO₂ avoided', '48.2 t', C.green)}`, C.green)}
      ${dBtn('Export ESG Report ↓', C.blue)}
    </div>
  </div>
  <div class="split-panel">
    <div class="split-panel-label">Employee — Sarah</div>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">
      <div style="font-size:11px;font-weight:600;color:${C.green};text-transform:uppercase;letter-spacing:0.07em">Trip verified ✓</div>
      ${dCard(`<div style="text-align:center">
        <div style="font-size:28px;font-weight:700;color:${C.green};line-height:1">+8</div>
        <div style="font-size:10px;font-weight:600;color:${C.green};text-transform:uppercase;letter-spacing:0.07em;margin-top:4px">Credits issued</div>
      </div>`, C.green)}
      <div style="font-size:11px;color:${C.text3};text-align:center;line-height:1.6">No form. No claim. No admin.<br>Balance: 847 · redeemable at any city operator.</div>
    </div>
  </div>`,
];

// ─────────────────────────────────────────────
// DEMO 4 — Driver Network (phone)
// ─────────────────────────────────────────────
const DEMO4_SCREENS = [
  // Screen 1: Driver credential profile
  dHead('Driver profile — portable credentials') + `
  <div style="padding:14px 16px;flex:1;display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:32px;height:32px;background:${C.purple}18;border:1px solid ${C.purple}40;border-radius:50%;display:flex;align-items:center;justify-content:center;color:${C.purple};font-weight:700;font-size:11px;flex-shrink:0">MK</div>
      <div>
        <div style="font-size:13px;font-weight:600;color:${C.text}">Marcus K.</div>
        <div style="font-size:11px;color:${C.text3}">Commercial driver · 6 years</div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:5px">
      <div style="font-size:10px;font-weight:600;color:${C.text3};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px">Verified credentials</div>
      ${dCard(`<div style="display:flex;align-items:center;gap:8px">
        <span style="color:${C.green};font-weight:700;font-size:13px;flex-shrink:0">✓</span>
        <div>
          <div style="font-size:11px;font-weight:600;color:${C.text}">HGV Licence — Class C+E</div>
          <div style="font-size:10px;color:${C.text3}">Transport Authority · Exp 2029</div>
        </div>
      </div>`, C.green)}
      ${dCard(`<div style="display:flex;align-items:center;gap:8px">
        <span style="color:${C.green};font-weight:700;font-size:13px;flex-shrink:0">✓</span>
        <div>
          <div style="font-size:11px;font-weight:600;color:${C.text}">EV Fleet Certification</div>
          <div style="font-size:10px;color:${C.text3}">City Training Institute · 2024</div>
        </div>
      </div>`, C.green)}
      ${dCard(`<div style="display:flex;align-items:center;gap:8px">
        <span style="color:${C.amber};font-weight:700;font-size:13px;flex-shrink:0">✓</span>
        <div>
          <div style="font-size:11px;font-weight:600;color:${C.text}">3-year employment record</div>
          <div style="font-size:10px;color:${C.text3}">CityBus Operator · Confirmed</div>
        </div>
      </div>`, C.amber)}
    </div>
    <div style="font-size:11px;color:${C.text3};line-height:1.6">Marcus owns this record. He shares it when he chooses. No chasing certificates.</div>
  </div>`,

  // Screen 2: Operator search
  dHead('Metropolitan Bus Company · Recruitment') + `
  <div style="padding:12px 14px;flex:1;display:flex;flex-direction:column;gap:9px">
    <div style="background:${C.surf};border:1px solid ${C.border};border-radius:4px;padding:10px">
      <div style="font-size:10px;font-weight:600;color:${C.text3};text-transform:uppercase;margin-bottom:6px">Filter by</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${dPill('EV cert', C.blue)} ${dPill('Class C', C.blue)} ${dPill('3+ yrs', C.text2)}
      </div>
    </div>
    <div style="font-size:11px;font-weight:600;color:${C.text3};text-transform:uppercase;letter-spacing:0.08em">4 verified matches</div>
    <div style="display:flex;flex-direction:column;gap:5px">
      <div style="display:flex;align-items:center;gap:9px;background:${C.blue}08;border:1px solid ${C.blue}30;border-radius:4px;padding:9px 11px">
        <div style="width:22px;height:22px;background:${C.purple}18;border:1px solid ${C.purple}40;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;color:${C.purple};font-weight:700;flex-shrink:0">MK</div>
        <div style="flex:1">
          <div style="font-size:12px;color:${C.text};font-weight:500">Marcus K.</div>
          <div style="font-size:10px;color:${C.green};font-weight:600">EV ✓ · C+E ✓ · 6 yrs ✓</div>
        </div>
        <span style="font-size:11px;color:${C.blue};font-weight:600">View →</span>
      </div>
      <div style="display:flex;align-items:center;gap:9px;background:${C.surf};border:1px solid ${C.border};border-radius:4px;padding:9px 11px">
        <div style="width:22px;height:22px;background:${C.surf};border:1px solid ${C.border};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;color:${C.text3};font-weight:700;flex-shrink:0">PM</div>
        <div style="flex:1">
          <div style="font-size:12px;color:${C.text};font-weight:500">Priya M.</div>
          <div style="font-size:10px;color:${C.green};font-weight:600">EV ✓ · C ✓ · 4 yrs ✓</div>
        </div>
        <span style="font-size:11px;color:${C.text3}">View →</span>
      </div>
      <div style="display:flex;align-items:center;gap:9px;background:${C.surf};border:1px solid ${C.border};border-radius:4px;padding:9px 11px">
        <div style="width:22px;height:22px;background:${C.surf};border:1px solid ${C.border};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;color:${C.text3};font-weight:700;flex-shrink:0">DO</div>
        <div style="flex:1">
          <div style="font-size:12px;color:${C.text};font-weight:500">David O.</div>
          <div style="font-size:10px;color:${C.green};font-weight:600">EV ✓ · C+E ✓ · 5 yrs ✓</div>
        </div>
        <span style="font-size:11px;color:${C.text3}">View →</span>
      </div>
    </div>
    <div style="font-size:11px;color:${C.text3}">No certificates to chase. All credentials verified at source.</div>
  </div>`,

  // Screen 3: City workforce dashboard
  dHead('City Transport Authority · Workforce readiness') + `
  <div style="padding:12px 14px;flex:1;display:flex;flex-direction:column;gap:9px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
      ${dCard(dStat('1,842', 'Active drivers', C.blue), C.blue)}
      ${dCard(dStat('412', 'EV certified', C.green), C.green)}
    </div>
    <div style="background:${C.surf};border:1px solid ${C.border};border-radius:4px;padding:11px">
      <div style="font-size:10px;font-weight:600;color:${C.text3};text-transform:uppercase;letter-spacing:0.07em;margin-bottom:9px">EV readiness by district</div>
      <div style="display:flex;flex-direction:column;gap:7px">
        <div>
          ${dRow('North', '68%', C.green)}
          ${dBar(68, C.green)}
        </div>
        <div>
          ${dRow('South', '31%', C.amber)}
          ${dBar(31, C.amber)}
        </div>
        <div>
          ${dRow('East', '14%', C.red)}
          ${dBar(14, C.red)}
        </div>
      </div>
    </div>
    ${dCard(`<div style="font-size:11px;font-weight:600;color:${C.red};margin-bottom:2px">Alert · East District gap</div>
      <div style="font-size:11px;color:${C.text2};line-height:1.55">Target: 60% EV-ready by 2026 rollout. Gap: 280 certifications required.</div>`, C.red)}
  </div>`,

  // Screen 4: Driver receives matched offer
  dHead('Driver notification · Marcus\'s device') + `
  <div style="padding:12px 14px;flex:1;display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;align-items:center;gap:9px">
      <div style="width:32px;height:32px;background:${C.blue}12;border:1px solid ${C.blue}30;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${C.blue};flex-shrink:0">BUS</div>
      <div>
        <div style="font-size:13px;font-weight:600;color:${C.text}">New opportunity</div>
        <div style="font-size:11px;color:${C.text3}">Metropolitan Bus Company</div>
      </div>
    </div>
    ${dCard(`<div style="font-size:12px;font-weight:600;color:${C.text};margin-bottom:9px">EV Fleet Driver — North Route</div>
      ${dRow('Start', 'Immediate')}
      ${dRow('Contract', 'Full-time, permanent')}
      ${dRow('Why matched', 'EV cert + C+E ✓', C.green)}
      <div style="margin-top:10px">${dBtn('Review offer →', C.blue)}</div>`, C.blue)}
    <div style="font-size:11px;color:${C.text3};line-height:1.6">Credentials verified automatically. Operator found him in seconds. He chose to share his profile.</div>
  </div>`,
];

// ─────────────────────────────────────────────
// DEMO 5 — Public Transport as a Service (split screen)
// ─────────────────────────────────────────────
const DEMO5_SCREENS = [
  // Screen 1: Fleet owner publishes windows
  `<div class="split-panel">
    <div class="split-panel-label">Fleet Owner — CitySchools Transport</div>
    <div style="flex:1;display:flex;flex-direction:column;gap:8px">
      ${dCard(`<div style="font-size:12px;font-weight:600;color:${C.text};margin-bottom:8px">Available windows</div>
        ${dRow('Mon–Fri', 'After 15:30')}
        ${dRow('Weekends', 'All day')}
        ${dRow('Fleet', '26 buses · 50 seats each')}`, C.teal)}
      ${dBtn('Publish to Urban Web', C.teal)}
      <div style="font-size:11px;color:${C.text3};line-height:1.6">Published once. Any operator or platform in the city can discover and book this capacity.</div>
    </div>
  </div>
  <div class="split-panel">
    <div class="split-panel-label">City Capacity Layer</div>
    <div style="flex:1;display:flex;flex-direction:column;gap:8px;justify-content:center">
      <div style="font-size:10px;font-weight:600;color:${C.text3};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Discoverable today</div>
      <div style="display:flex;flex-direction:column;gap:4px">
        ${dCard(`${dRow('School buses', '26 · 1,300 seats', C.teal)}`, C.teal)}
        ${dCard(`${dRow('Corporate shuttles', '14 · 560 seats', C.blue)}`, C.blue)}
        ${dCard(`${dRow('Tourist coaches', '8 · 400 seats', C.purple)}`, C.purple)}
      </div>
      <div style="background:${C.surf};border-top:1px solid ${C.border};padding:8px;font-size:12px;font-weight:600;color:${C.text}">Total: 2,260 seats available</div>
    </div>
  </div>`,

  // Screen 2: Demand event detected
  `<div class="split-panel">
    <div class="split-panel-label">Demand Event — City Stadium</div>
    <div style="flex:1;display:flex;flex-direction:column;gap:8px">
      ${dCard(`<div style="font-size:12px;font-weight:600;color:${C.text};margin-bottom:8px">Saturday 15 Oct</div>
        ${dRow('Attendees', '35,000')}
        ${dRow('Transit demand', '2,100')}
        ${dRow('Public capacity', '420 seats', C.red)}`, C.amber)}
      ${dCard(`<div style="font-size:11px;font-weight:600;color:${C.amber};margin-bottom:4px">Capacity gap: 1,680 seats</div>
        <div style="font-size:11px;color:${C.text2}">Searching city capacity layer…</div>`, C.amber)}
    </div>
  </div>
  <div class="split-panel">
    <div class="split-panel-label">Match found</div>
    <div style="flex:1;display:flex;flex-direction:column;gap:8px;justify-content:center">
      ${dCard(`<div style="font-size:11px;font-weight:600;color:${C.green};margin-bottom:8px">✓ Capacity confirmed in 4 minutes</div>
        ${dRow('CitySchools', '14 buses · 700 seats', C.teal)}
        ${dRow('Premier Coaches', '6 · 300 seats', C.purple)}
        ${dRow('Total matched', '1,000 seats', C.green)}`, C.green)}
      <div style="font-size:11px;color:${C.text3};line-height:1.6">All operators verified. Capacity confirmed. No new procurement.</div>
    </div>
  </div>`,

  // Screen 3: City planner comparison
  `<div class="split-panel">
    <div class="split-panel-label">Previous approach</div>
    <div style="flex:1;display:flex;flex-direction:column;gap:8px;justify-content:center">
      ${dCard(`<div style="font-size:11px;font-weight:600;color:${C.red};margin-bottom:8px">Procurement route</div>
        ${dRow('Cost', '£180,000')}
        ${dRow('Lead time', '6 weeks')}
        ${dRow('Asset ownership', 'New vehicles required')}
        ${dRow('Reusable', 'No — one event', C.red)}`, C.red)}
    </div>
  </div>
  <div class="split-panel">
    <div class="split-panel-label">With Urban Web</div>
    <div style="flex:1;display:flex;flex-direction:column;gap:8px;justify-content:center">
      ${dCard(`<div style="font-size:11px;font-weight:600;color:${C.green};margin-bottom:8px">Existing capacity route</div>
        ${dRow('Cost', '£12,000')}
        ${dRow('Lead time', '4 minutes')}
        ${dRow('Asset ownership', 'None required')}
        ${dRow('Reusable', 'Automatic for next event', C.green)}`, C.green)}
      <div style="font-size:11px;color:${C.text3};line-height:1.6">The fleet already existed. The city just couldn't find it.</div>
    </div>
  </div>`,

  // Screen 4: City dashboard view
  `<div class="split-panel">
    <div class="split-panel-label">City Fleet Intelligence</div>
    <div style="flex:1;display:flex;flex-direction:column;gap:8px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        ${dCard(dStat('2,260', 'Seats discoverable', C.teal), C.teal)}
        ${dCard(dStat('48', 'Fleets connected', C.blue), C.blue)}
      </div>
      <div style="font-size:10px;font-weight:600;color:${C.text3};text-transform:uppercase;letter-spacing:0.07em;margin-bottom:4px">Utilisation by type</div>
      <div style="background:${C.surf};border:1px solid ${C.border};border-radius:4px;padding:11px">
        <div style="display:flex;flex-direction:column;gap:7px">
          <div>${dRow('School buses', '68% utilised', C.teal)}${dBar(68, C.teal)}</div>
          <div>${dRow('Corporate shuttles', '41%', C.blue)}${dBar(41, C.blue)}</div>
          <div>${dRow('Tourist coaches', '22%', C.purple)}${dBar(22, C.purple)}</div>
        </div>
      </div>
    </div>
  </div>
  <div class="split-panel">
    <div class="split-panel-label">Procurement saved</div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:10px">
      ${dCard(`<div style="text-align:center">
        <div style="font-size:26px;font-weight:700;color:${C.green};line-height:1">£2.4M</div>
        <div style="font-size:10px;font-weight:600;color:${C.green};text-transform:uppercase;letter-spacing:0.07em;margin-top:4px">Procurement avoided</div>
        <div style="font-size:10px;color:${C.text3};margin-top:2px">last 12 months</div>
      </div>`, C.green)}
      <div style="font-size:11px;color:${C.text3};line-height:1.6;text-align:center">Zero new assets. Zero new contracts. Capacity was already there.</div>
    </div>
  </div>`,
];

// ─────────────────────────────────────────────
// DEMO 6 — EV Charging (phone)
// ─────────────────────────────────────────────
const DEMO6_SCREENS = [
  // Screen 1: City energy layer overview
  dHead('City energy layer') + `
  <div style="padding:14px;flex:1;display:flex;flex-direction:column;gap:10px">
    <div style="font-size:12px;font-weight:500;color:${C.text2}">Every energy asset in the city — on one shared layer.</div>
    <div style="display:flex;flex-direction:column;gap:5px">
      ${dCard(`<div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:11px;font-weight:600;color:${C.text}">⚡ Charge points</div>
          <div style="font-size:13px;font-weight:700;color:${C.ev}">247</div>
        </div>`, C.ev)}
      ${dCard(`<div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:11px;font-weight:600;color:${C.text}">☀ Solar rooftops</div>
          <div style="font-size:13px;font-weight:700;color:${C.amber}">18</div>
        </div>`, C.amber)}
      ${dCard(`<div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:11px;font-weight:600;color:${C.text}">🚌 EV bus depots (V2G)</div>
          <div style="font-size:13px;font-weight:700;color:${C.teal}">3</div>
        </div>`, C.teal)}
      ${dCard(`<div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:11px;font-weight:600;color:${C.text}">🔋 Building batteries</div>
          <div style="font-size:13px;font-weight:700;color:${C.purple}">42</div>
        </div>`, C.purple)}
    </div>
    <div style="font-size:11px;color:${C.text3};line-height:1.6">All discoverable, bookable, and transactable on one layer. No separate apps or accounts.</div>
  </div>`,

  // Screen 2: Driver finds charging
  dHead('Find charging') + `
  <div style="padding:12px 14px;flex:1;display:flex;flex-direction:column;gap:8px">
    <div style="background:${C.surf};border:1px solid ${C.border};border-radius:4px;padding:8px;text-align:center;font-size:11px;color:${C.text2}">
      📍 Your location · Showing nearby charge points
    </div>
    <div style="display:flex;flex-direction:column;gap:5px">
      ${dCard(`<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">
          <div>
            <div style="font-size:12px;font-weight:600;color:${C.text}">Central Depot</div>
            <div style="font-size:10px;color:${C.text3}">0.3 km · Est. wait: None</div>
          </div>
          <div style="font-size:12px;font-weight:700;color:${C.ev}">£0.31/kWh</div>
        </div>
        ${dRow('Available', '4 / 6 points', C.green)}
        <div style="margin-top:8px">${dBtn('Reserve slot →', C.ev)}</div>`, C.ev)}
      ${dCard(`<div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:12px;font-weight:600;color:${C.text}">South Hub</div>
            <div style="font-size:10px;color:${C.text3}">0.8 km · Est. wait: 12 min</div>
          </div>
          <div style="font-size:12px;font-weight:700;color:${C.amber}">£0.28/kWh</div>
        </div>`, C.blue)}
    </div>
  </div>`,

  // Screen 3: Grid peak — V2G auto-response
  dHead('Grid peak event · 18:30–19:30') + `
  <div style="padding:14px;flex:1;display:flex;flex-direction:column;gap:10px">
    ${dCard(`<div style="font-size:11px;font-weight:600;color:${C.amber};margin-bottom:6px">⚡ Grid demand spike</div>
      ${dRow('Excess demand', '4.2 MW')}
      ${dRow('Duration', '18:30–19:30')}`, C.amber)}
    <div style="font-size:10px;font-weight:600;color:${C.text3};text-transform:uppercase;letter-spacing:0.08em">Auto-response</div>
    ${dCard(`<div style="font-size:11px;font-weight:600;color:${C.teal};margin-bottom:6px">East Bus Depot — V2G active</div>
      ${dRow('14 buses exporting', '2.8 MW', C.teal)}`, C.teal)}
    ${dCard(`<div style="font-size:11px;font-weight:600;color:${C.purple};margin-bottom:6px">Building batteries online</div>
      ${dRow('6 buildings', '1.4 MW', C.purple)}`, C.purple)}
    ${dCard(`<div style="font-size:11px;font-weight:600;color:${C.green}">✓ Grid balanced · Total: 4.2 MW</div>`, C.green)}
    <div style="font-size:11px;color:${C.text3};line-height:1.6">Zero human intervention. Every asset responded automatically through the shared layer.</div>
  </div>`,

  // Screen 4: City investment planning
  dHead('City infrastructure planning') + `
  <div style="padding:12px 14px;flex:1;display:flex;flex-direction:column;gap:9px">
    <div style="font-size:11px;font-weight:600;color:${C.text3};text-transform:uppercase;letter-spacing:0.08em">High demand zones</div>
    <div style="display:flex;flex-direction:column;gap:5px">
      ${dCard(`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <div style="font-size:11px;font-weight:600;color:${C.text}">North Quarter</div>
          <div style="font-size:11px;font-weight:700;color:${C.red}">89% utilisation</div>
        </div>
        ${dBar(89, C.red)}
        <div style="font-size:10px;color:${C.text3};margin-top:4px">→ 3 new charge points recommended</div>`, C.red)}
      ${dCard(`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <div style="font-size:11px;font-weight:600;color:${C.text}">Hospital District</div>
          <div style="font-size:11px;font-weight:700;color:${C.amber}">76% utilisation</div>
        </div>
        ${dBar(76, C.amber)}`, C.amber)}
    </div>
    <div style="font-size:11px;font-weight:600;color:${C.text3};text-transform:uppercase;letter-spacing:0.08em">Low investment areas</div>
    ${dCard(`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <div style="font-size:11px;font-weight:600;color:${C.text}">Industrial Zone</div>
        <div style="font-size:11px;font-weight:700;color:${C.green}">12% utilisation</div>
      </div>
      ${dBar(12, C.text3)}
      <div style="font-size:10px;color:${C.text3};margin-top:4px">→ Redeploy assets, don't build new</div>`, C.blue)}
  </div>`,
];

// ─────────────────────────────────────────────
// DEMO STATE & RENDER
// ─────────────────────────────────────────────
const demoState = { 1: 0, 2: 0, 4: 0, 5: 0, 6: 0 };

const DEMO_SCREENS = {
  1: DEMO1_SCREENS,
  2: DEMO2_SCREENS,
  4: DEMO4_SCREENS,
  5: DEMO5_SCREENS,
  6: DEMO6_SCREENS,
};

function renderDemo(id) {
  const screens = DEMO_SCREENS[id];
  if (!screens) return;
  const step     = demoState[id];
  const total    = screens.length;
  const screenEl = document.getElementById(`demo${id}-screen`);
  const progEl   = document.getElementById(`demo${id}-progress`);
  const dotsEl   = document.getElementById(`dots${id}`);
  if (!screenEl) return;

  screenEl.style.opacity   = '0';
  screenEl.style.transform = 'translateY(6px)';
  setTimeout(() => {
    screenEl.innerHTML             = screens[step];
    screenEl.style.transition      = 'opacity 0.25s ease, transform 0.25s ease';
    screenEl.style.opacity         = '1';
    screenEl.style.transform       = 'translateY(0)';
  }, 150);

  if (progEl)   progEl.textContent = `${step + 1} / ${total}`;
  if (dotsEl)   dotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === step));

  const prev = document.querySelector(`.demo-prev[data-demo="${id}"]`);
  const next = document.querySelector(`.demo-next[data-demo="${id}"]`);
  if (prev) prev.style.visibility = step === 0 ? 'hidden' : 'visible';
  if (next) next.textContent      = step === total - 1 ? 'Restart ↺' : 'Next →';
}

function initDemos() {
  [1, 2, 4, 5, 6].forEach(id => renderDemo(id));

  document.querySelectorAll('.demo-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.demo);
      const screens = DEMO_SCREENS[id];
      if (!screens) return;
      demoState[id] = (demoState[id] + 1) % screens.length;
      renderDemo(id);
    });
  });

  document.querySelectorAll('.demo-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.demo);
      if (demoState[id] > 0) { demoState[id]--; renderDemo(id); }
    });
  });

  document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const id   = parseInt(dot.dataset.demo);
      const step = parseInt(dot.dataset.step);
      demoState[id] = step;
      renderDemo(id);
    });
  });
}

// ─────────────────────────────────────────────
// PARKING DEMO — GIS map, light mode
// ─────────────────────────────────────────────
const SPOTS = [
  { id:  0, x: 16, y: 28, type: 'muni',     always: true,  name: 'Municipal Bay 3',        price: '€1.80/hr',  avail: 4,  total: 8   },
  { id:  1, x: 38, y: 14, type: 'muni',     always: true,  name: 'Municipal Bay 7',        price: '€2.10/hr',  avail: 2,  total: 6   },
  { id:  2, x: 72, y: 38, type: 'muni',     always: true,  name: 'Municipal Bay 12',       price: '€1.80/hr',  avail: 7,  total: 10  },
  { id:  3, x: 54, y: 64, type: 'muni',     always: true,  name: 'Municipal Bay 15',       price: '€1.50/hr',  avail: 3,  total: 8   },
  { id:  4, x: 28, y: 58, type: 'muni',     always: true,  name: 'Municipal Bay 9',        price: '€2.10/hr',  avail: 5,  total: 8   },
  { id:  5, x: 83, y: 18, type: 'muni',     always: true,  name: 'Municipal Bay 1',        price: '€1.80/hr',  avail: 1,  total: 6   },
  { id:  6, x: 10, y: 16, type: 'office',   always: false, name: 'Finance Tower Car Park', price: '€3.50/hr',  avail: 24, total: 40  },
  { id:  7, x: 32, y: 36, type: 'office',   always: false, name: 'Westside Plaza',         price: '€2.80/hr',  avail: 8,  total: 20  },
  { id:  8, x: 60, y: 24, type: 'office',   always: false, name: 'Commerce Tower',         price: '€4.00/hr',  avail: 15, total: 30  },
  { id:  9, x: 87, y: 54, type: 'office',   always: false, name: 'East Business Park',     price: '€3.20/hr',  avail: 12, total: 25  },
  { id: 10, x: 20, y: 74, type: 'office',   always: false, name: 'South Quarter Lot',      price: '€2.50/hr',  avail: 9,  total: 18  },
  { id: 11, x: 52, y: 42, type: 'office',   always: false, name: 'Tech Campus',            price: '€3.00/hr',  avail: 28, total: 50  },
  { id: 12, x: 68, y: 72, type: 'office',   always: false, name: 'North Lot B',            price: '€2.80/hr',  avail: 7,  total: 20  },
  { id: 13, x: 14, y: 84, type: 'office',   always: false, name: 'Old Town Parking',       price: '€2.20/hr',  avail: 12, total: 25  },
  { id: 14, x: 90, y: 86, type: 'office',   always: false, name: 'South Terminal',         price: '€3.50/hr',  avail: 16, total: 30  },
  { id: 15, x: 44, y: 50, type: 'hospital', always: false, name: 'City Hospital',          price: '€2.00/hr',  avail: 18, total: 60  },
  { id: 16, x: 50, y: 56, type: 'hospital', always: false, name: 'Hospital Overflow',      price: '€1.60/hr',  avail: 32, total: 50  },
  { id: 17, x: 71, y: 62, type: 'hotel',    always: false, name: 'Grand Hotel',            price: '€5.00/hr',  avail: 6,  total: 20  },
  { id: 18, x: 13, y: 46, type: 'hotel',    always: false, name: 'City Inn',               price: '€4.50/hr',  avail: 3,  total: 15  },
  { id: 19, x:  7, y: 68, type: 'resi',     always: false, name: 'Elm Street Residents',   price: '€1.20/hr',  avail: 6,  total: 12  },
  { id: 20, x: 30, y: 82, type: 'resi',     always: false, name: 'Park View Apartments',   price: '€1.40/hr',  avail: 4,  total: 10  },
  { id: 21, x: 77, y: 78, type: 'resi',     always: false, name: 'Maple Close',            price: '€1.20/hr',  avail: 8,  total: 12  },
  { id: 22, x: 91, y: 30, type: 'resi',     always: false, name: 'Harbour Residences',     price: '€1.50/hr',  avail: 3,  total: 8   },
  { id: 23, x: 41, y: 28, type: 'ev',       always: false, name: 'EV Hub Central',         price: '€0.35/kWh', avail: 4,  total: 8   },
  { id: 24, x: 62, y: 84, type: 'ev',       always: false, name: 'South EV Station',       price: '€0.32/kWh', avail: 2,  total: 6   },
  { id: 25, x: 86, y: 68, type: 'ev',       always: false, name: 'East EV Point',          price: '€0.38/kWh', avail: 3,  total: 5   },
  { id: 26, x: 22, y: 32, type: 'mall',     always: false, name: 'Central Mall P1',        price: '€2.00/hr',  avail: 45, total: 120 },
  { id: 27, x: 26, y: 38, type: 'mall',     always: false, name: 'Central Mall P2',        price: '€2.00/hr',  avail: 22, total: 80  },
];

const TYPE_COLORS = {
  muni: '#0078CE', office: '#A0521A', hospital: '#C0392B',
  hotel: '#5B3FA8', resi: '#7B8E93', ev: '#1A6B48', mall: '#1B6B7A',
};

const TODAY_LOCS   = SPOTS.filter(s => s.always).length;
const TODAY_SPACES = SPOTS.filter(s => s.always).reduce((a, s) => a + s.total, 0);
const OPEN_LOCS    = SPOTS.length;
const OPEN_SPACES  = SPOTS.reduce((a, s) => a + s.total, 0);

function animateCounter(el, from, to, duration) {
  const start = performance.now();
  const step  = ts => {
    const p    = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * ease).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function drawCityMap(canvas, mode) {
  const ctx = canvas.getContext('2d');
  const W   = canvas.offsetWidth, H = canvas.offsetHeight;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const connected = mode === 'connected';

  // Light background
  ctx.fillStyle = connected ? '#F5F8FC' : '#F7F4F0';
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = connected ? 'rgba(0,120,206,0.08)' : 'rgba(160,82,26,0.08)';
  ctx.lineWidth = 0.5;
  const GRID = 28;
  for (let x = 0; x < W; x += GRID) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += GRID) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // City blocks
  const blockFill   = connected ? 'rgba(0,120,206,0.04)'  : 'rgba(160,82,26,0.04)';
  const blockStroke = connected ? 'rgba(0,120,206,0.15)'  : 'rgba(160,82,26,0.15)';
  const subStroke   = connected ? 'rgba(0,120,206,0.06)'  : 'rgba(160,82,26,0.06)';
  const lblColor    = connected ? 'rgba(0,120,206,0.35)'  : 'rgba(160,82,26,0.35)';

  const BLOCKS = [
    { x:0, y:0, w:0.30, h:0.30 }, { x:0.36, y:0, w:0.28, h:0.30 }, { x:0.70, y:0, w:0.30, h:0.30 },
    { x:0, y:0.36, w:0.30, h:0.28 }, { x:0.36, y:0.36, w:0.28, h:0.28 }, { x:0.70, y:0.36, w:0.30, h:0.28 },
    { x:0, y:0.70, w:0.30, h:0.30 }, { x:0.36, y:0.70, w:0.28, h:0.30 }, { x:0.70, y:0.70, w:0.30, h:0.30 },
  ];

  BLOCKS.forEach(b => {
    const bx = b.x*W, by = b.y*H, bw = b.w*W, bh = b.h*H;
    ctx.fillStyle = blockFill;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = blockStroke;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.strokeRect(bx, by, bw, bh);
    ctx.strokeStyle = subStroke;
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(bx, by + bh*(i/3)); ctx.lineTo(bx+bw, by + bh*(i/3)); ctx.stroke();
    }
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(bx + bw*(i/4), by); ctx.lineTo(bx + bw*(i/4), by+bh); ctx.stroke();
    }
  });

  // Streets
  ctx.strokeStyle = connected ? 'rgba(0,120,206,0.12)' : 'rgba(28,43,48,0.06)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  [0.33, 0.67].forEach(xp => { ctx.beginPath(); ctx.moveTo(xp*W, 0); ctx.lineTo(xp*W, H); ctx.stroke(); });
  [0.33, 0.67].forEach(yp => { ctx.beginPath(); ctx.moveTo(0, yp*H); ctx.lineTo(W, yp*H); ctx.stroke(); });
  ctx.setLineDash([]);

  // District labels
  const LABELS = [
    { x:0.15, y:0.10, t:'Finance' }, { x:0.50, y:0.10, t:'Civic' }, { x:0.85, y:0.10, t:'North Q.' },
    { x:0.15, y:0.46, t:'Old Town' }, { x:0.50, y:0.46, t:'Hospital' }, { x:0.85, y:0.46, t:'Biz Park' },
    { x:0.15, y:0.82, t:'Riverside' }, { x:0.50, y:0.82, t:'S.Market' }, { x:0.85, y:0.82, t:'Tech' },
  ];
  ctx.fillStyle = lblColor;
  ctx.font = `500 ${Math.round(W * 0.021)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  LABELS.forEach(l => ctx.fillText(l.t, l.x*W, l.y*H));
}

function initParkingDemo() {
  const mapEl    = document.getElementById('cityMap');
  const canvas   = document.getElementById('cityMapCanvas');
  const locEl    = document.getElementById('cStatLoc');
  const spacesEl = document.getElementById('cStatSpaces');
  const msgEl    = document.getElementById('cStatMsg');
  const detailEl = document.getElementById('spaceDetailCard');
  if (!mapEl || !canvas) return;

  drawCityMap(canvas, 'today');

  const markerEls = {};
  SPOTS.forEach(spot => {
    const m = document.createElement('div');
    m.className     = 'p-marker hidden';
    m.dataset.type  = spot.type;
    m.dataset.id    = spot.id;
    m.style.left    = `${spot.x}%`;
    m.style.top     = `${spot.y}%`;

    const idleHrs = spot.always ? '—' : `${6 + Math.round(spot.id * 0.6) % 12} hrs/day`;
    const yield_  = spot.always ? '—' : `€${(spot.total * 1.8 + spot.id * 0.4).toFixed(0)}/mo`;
    const tooltipHTML = spot.always
      ? `<div class="ttt-row"><span class="ttt-key">Capacity</span><span class="ttt-val">${spot.total} spaces</span></div>
         <div class="ttt-row"><span class="ttt-key">Status</span><span class="ttt-val emerald">Listed</span></div>`
      : `<div class="ttt-row"><span class="ttt-key">Capacity</span><span class="ttt-val amber">${spot.total} spaces</span></div>
         <div class="ttt-row"><span class="ttt-key">Idle time</span><span class="ttt-val amber">${idleHrs}</span></div>
         <div class="ttt-row"><span class="ttt-key">Est. yield</span><span class="ttt-val amber">${yield_}</span></div>`;

    m.innerHTML = `
      <div class="p-marker-inner">
        <div class="p-marker-dot"></div>
        <div class="p-marker-pulse"></div>
      </div>
      <div class="p-marker-tooltip">${tooltipHTML}</div>`;
    mapEl.appendChild(m);
    markerEls[spot.id] = m;
  });

  let selectedId = null;

  function showToday() {
    selectedId = null;
    drawCityMap(canvas, 'today');
    SPOTS.forEach(s => {
      const el = markerEls[s.id];
      if (s.always) { el.classList.remove('hidden', 'selected'); }
      else          { el.classList.add('hidden'); el.classList.remove('selected'); }
    });
    locEl.textContent    = TODAY_LOCS;
    spacesEl.textContent = TODAY_SPACES;
    locEl.classList.remove('connected');
    spacesEl.classList.remove('connected');
    msgEl.textContent = 'Most of the city is invisible to drivers.';
    msgEl.classList.remove('connected');
    detailEl.classList.remove('visible');
  }

  function showConnected() {
    drawCityMap(canvas, 'connected');
    const hidden = SPOTS.filter(s => !s.always).sort((a, b) => a.x - b.x);
    hidden.forEach((spot, i) => {
      setTimeout(() => { markerEls[spot.id].classList.remove('hidden'); }, i * 55 + 80);
    });
    setTimeout(() => {
      locEl.classList.add('connected');
      spacesEl.classList.add('connected');
      msgEl.classList.add('connected');
      animateCounter(locEl,    TODAY_LOCS,   OPEN_LOCS,   900);
      animateCounter(spacesEl, TODAY_SPACES, OPEN_SPACES, 1200);
      msgEl.textContent = 'Every space, every owner — visible and bookable.';
    }, 300);
  }

  mapEl.addEventListener('click', e => {
    const m = e.target.closest('.p-marker:not(.hidden)');
    if (!m) {
      selectedId = null;
      Object.values(markerEls).forEach(el => el.classList.remove('selected'));
      detailEl.classList.remove('visible');
      return;
    }
    const id = parseInt(m.dataset.id);
    if (selectedId === id) {
      selectedId = null;
      m.classList.remove('selected');
      detailEl.classList.remove('visible');
      return;
    }
    selectedId = id;
    Object.values(markerEls).forEach(el => el.classList.remove('selected'));
    m.classList.add('selected');
    renderDetailCard(SPOTS.find(s => s.id === id));
  });

  function renderDetailCard(spot) {
    const color      = TYPE_COLORS[spot.type] || C.blue;
    const pct        = Math.round((spot.avail / spot.total) * 100);
    const typeLabel  = { muni:'Municipal', office:'Private', hospital:'Hospital', hotel:'Hotel', resi:'Residential', ev:'EV Charging', mall:'Shopping' }[spot.type] || '';
    const statusColor = spot.avail > spot.total * 0.4 ? C.green : C.amber;
    const statusText  = spot.avail > spot.total * 0.4 ? 'Available' : 'Limited';

    detailEl.innerHTML = `
      <div class="sdc-header">
        <div class="sdc-type-dot" style="background:${color}"></div>
        <div class="sdc-name">${spot.name}</div>
        <button class="sdc-close" id="sdcClose">✕</button>
      </div>
      <div class="sdc-body">
        <div class="sdc-meta-row">
          <span class="sdc-meta-tag" style="color:${color};border-color:${color}40;background:${color}10">${typeLabel}</span>
          <span class="sdc-meta-tag" style="color:${statusColor};border-color:${statusColor}40;background:${statusColor}10">${statusText}</span>
        </div>
        <div class="sdc-data-grid">
          <div class="sdc-data-cell">
            <div class="sdc-data-key">Capacity</div>
            <div class="sdc-data-val">${spot.total} spaces</div>
          </div>
          <div class="sdc-data-cell">
            <div class="sdc-data-key">Available</div>
            <div class="sdc-data-val" style="color:${statusColor}">${spot.avail} free</div>
          </div>
          <div class="sdc-data-cell">
            <div class="sdc-data-key">Occupancy</div>
            <div class="sdc-data-val">${100 - pct}%</div>
          </div>
          <div class="sdc-data-cell">
            <div class="sdc-data-key">Rate</div>
            <div class="sdc-data-val">${spot.price}</div>
          </div>
        </div>
        <div class="sdc-avail-bar"><div class="sdc-avail-fill" style="width:${pct}%;background:${statusColor}"></div></div>
        <button class="sdc-book-btn" id="sdcBook">Reserve space →</button>
      </div>`;
    detailEl.classList.add('visible');

    document.getElementById('sdcClose')?.addEventListener('click', () => {
      selectedId = null;
      markerEls[spot.id]?.classList.remove('selected');
      detailEl.classList.remove('visible');
    });
    document.getElementById('sdcBook')?.addEventListener('click', () => {
      detailEl.innerHTML = `
        <div class="sdc-confirm">
          <div class="sdc-confirm-icon">✓</div>
          <div class="sdc-confirm-text">
            <div class="sdc-confirm-title">Reservation confirmed</div>
            <div class="sdc-confirm-sub">${spot.name} · Window: 30 min</div>
          </div>
        </div>`;
    });
  }

  let mapMode = 'today';
  document.getElementById('parking-today-btn')?.addEventListener('click', function () {
    this.classList.add('active');
    document.getElementById('parking-open-btn')?.classList.remove('active');
    mapMode = 'today'; showToday();
  });
  document.getElementById('parking-open-btn')?.addEventListener('click', function () {
    this.classList.add('active');
    document.getElementById('parking-today-btn')?.classList.remove('active');
    mapMode = 'connected'; showConnected();
  });

  showToday();
  window.addEventListener('resize', () => { drawCityMap(canvas, mapMode); }, { passive: true });
}

// ─────────────────────────────────────────────
// CONTACT FORM
// ─────────────────────────────────────────────
function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.display = 'none';
    const s = document.getElementById('formSuccess');
    if (s) s.style.display = 'block';
  });
}

// ─────────────────────────────────────────────
// NAV — scroll tint
// ─────────────────────────────────────────────
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const heroHeight = () => document.getElementById('hero')?.offsetHeight ?? 400;
  const update = () => {
    const past = window.scrollY > heroHeight() * 0.6;
    nav.classList.toggle('scrolled', past);
    nav.style.boxShadow = past ? '0 1px 12px rgba(28,43,48,0.08)' : '';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ─────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHeroCivicCanvas();
  initProblemDiagram();
  initReveals();
  initDemos();
  initParkingDemo();
  initForm();
  initNav();
});
