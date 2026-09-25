// TWIF: Subnet One — HUD layer.
//
// The HUD is DOM. It costs zero draw calls and zero triangles, which makes it the
// one part of the concept frames that can be matched exactly, so it is worth
// matching exactly.
//
// Two rules hold this file together:
//
//  1. main.js owns the element IDs it writes to. It sets `#objs`, `#ncount`,
//     `#hpfill`, `#spd`, `#waydist` and `#wayarrow` DIRECTLY, every frame. Nothing
//     here fights it for those nodes — this module arranges them, styles them and
//     reads them, and writes only to nodes main.js never touches. That is why
//     `#objs` is the CURRENT checklist row's label rather than a title: it keeps
//     meaning exactly what it meant before.
//  2. Everything self-drives from `window.__GAME__` when nobody calls the API, so
//     the compass, minimap and gear read correctly with main.js untouched. The
//     exported functions override that the moment they are called.
//
// Pure DOM + 2D canvas. No imports, no WebGL, no library.

const $ = (id) => document.getElementById(id);

const el = {
  hud: $('hud'),
  objtitle: $('objtitle'), objlist: $('objlist'), objs: $('objs'),
  cticks: $('cticks'), waymark: $('waymark'), waydist: $('waydist'),
  map: $('map'), mmap: $('mmap'), north: document.querySelector('#map .nn'),
  speedo: $('speedo'), spd: $('spd'), gear: $('gear'), sarc: $('sarc'),
  focus: $('focus'),
};

// ------------------------------------------------------------------ palette
const C = {
  green: '#9AFF43', gold: '#D4A24C', amber: '#E66D32', ink: '#E7DFC9',
  stone: 'rgba(160,150,130,.34)', road: 'rgba(160,150,130,.20)',
};

// ------------------------------------------------------------------ objective
//
// The mission script, mirrored from mission.js stage names. This is presentation
// only: it never drives the game, it only decides which rows are drawn done,
// current and pending around whatever text main.js has put in #objs.
const SCRIPT = [
  { title: 'THE OPEN UNIVERSE', steps: [
    { stage: 'hub', label: 'Enter the active node' },
    { stage: 'arrive', label: 'Cross into Subnet One' },
    { stage: 'tutorial', label: 'Find Max Sensei' },
  ] },
  { title: 'SUBNET SUMMER', steps: [
    { stage: 'street', label: 'Reach the Subnet Summer van' },
    { stage: 'drive', label: 'Drive to the control node' },
  ] },
  { title: 'DISRUPT THE BIG AI NODE', steps: [
    { stage: 'arena', label: 'Clear the enforcers' },
    { stage: 'artefact', label: 'Take the subnet artefact' },
    { stage: 'return', label: 'Return to the hub' },
  ] },
];
const STAGE_AT = {};
SCRIPT.forEach((ch, ci) => ch.steps.forEach((s, si) => { STAGE_AT[s.stage] = [ci, si]; }));

let manual = false;        // true once setObjective() has been called
let renderedKey = '';      // guards against rebuilding the list every frame

/** Build the checklist. `steps` is [{label, state, count}] with state
 *  'done' | 'cur' | ''. The row marked 'cur' is given #objs as its label. */
function paint(title, steps) {
  if (!el.objlist || !el.objtitle) return;
  el.objtitle.textContent = title;
  el.objlist.textContent = '';
  for (const s of steps) {
    const li = document.createElement('li');
    if (s.state) li.className = s.state;
    const bx = document.createElement('span');
    bx.className = 'bx';
    li.appendChild(bx);
    let tx;
    if (s.state === 'cur' && el.objs) {
      tx = el.objs;                    // the live node main.js writes to
      if (s.label && !tx.textContent.trim()) tx.textContent = s.label;
      else if (s.label && tx.textContent === '—') tx.textContent = s.label;
    } else {
      tx = document.createElement('span');
      tx.textContent = s.label || '';
    }
    tx.className = 'tx';
    li.appendChild(tx);
    if (s.count) {
      const c = document.createElement('span');
      c.className = 'cnt';
      c.textContent = s.count;
      li.appendChild(c);
    }
    el.objlist.appendChild(li);
  }
  // #objs must never leave the document: main.js holds a reference to it and
  // writes to it every frame whether it is attached or not. With no current step
  // it is parked on the list itself, hidden, still taking writes.
  if (el.objs && !el.objlist.contains(el.objs)) {
    el.objs.className = 'tx';
    el.objs.style.display = 'none';
    el.objlist.appendChild(el.objs);
  } else if (el.objs) {
    el.objs.style.display = '';
  }
}

/**
 * Set the objective panel.
 * @param {string} title  chapter title, drawn uppercase in gold
 * @param {Array}  steps  ['Find Max Sensei', ...] or
 *                        [{label, done:bool, current:bool, count:'3/12'}, ...]
 *
 * The current step (the one flagged `current`, else the first not-done one) is
 * given #objs as its label element. That means main.js keeps driving the text of
 * that one row — a `label` passed for the current step is only the text shown
 * until main.js writes. Every other row's label is yours. This is deliberate:
 * `mission.objective` is the live current step, counters and all, and two writers
 * for one string would only flicker.
 * Calling this switches the panel to manual mode. Call setObjective(null) to hand
 * it back to the automatic mission script.
 */
export function setObjective(title, steps) {
  if (title === null || title === undefined) { manual = false; renderedKey = ''; return; }
  manual = true;
  const list = (steps || []).map((s) => (typeof s === 'string' ? { label: s } : s || {}));
  let curIdx = list.findIndex((s) => s.current);
  if (curIdx < 0) curIdx = list.findIndex((s) => !s.done);
  paint(String(title), list.map((s, i) => ({
    label: s.label || '',
    count: s.count || '',
    state: s.done ? 'done' : (i === curIdx ? 'cur' : ''),
  })));
}

/** Drive the panel from window.__GAME__.stage. */
function autoObjective(stage) {
  const at = STAGE_AT[stage];
  let ci, si;
  if (at) { ci = at[0]; si = at[1]; }
  else if (stage === 'complete') { ci = SCRIPT.length - 1; si = SCRIPT[ci].steps.length; }
  else { ci = 0; si = 0; }
  const key = ci + ':' + si;
  if (key === renderedKey) return;
  renderedKey = key;
  const ch = SCRIPT[ci];
  paint(ch.title, ch.steps.map((s, i) => ({
    label: s.label,
    state: i < si ? 'done' : (i === si ? 'cur' : ''),
  })));
}

// ------------------------------------------------------------------ compass
const HALF = 75;                                    // degrees visible each side
const CARD = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const ticks = [];

(function buildCompass() {
  if (!el.cticks) return;
  for (let b = 0; b < 360; b += 15) {
    const t = document.createElement('div');
    const major = b % 45 === 0;
    t.className = 'ct' + (major ? ' mj' : '');
    if (major) {
      const l = document.createElement('span');
      l.className = 'cl';
      l.textContent = CARD[b / 45];
      t.appendChild(l);
    }
    el.cticks.appendChild(t);
    ticks.push({ b, node: t });
  }
})();

const wrap180 = (d) => { d = ((d + 180) % 360 + 360) % 360 - 180; return d; };

/** @param {number} headingDeg  where the camera looks, 0 = north (-Z), + = east */
function drawCompass(headingDeg, targetBearingDeg) {
  if (!el.cticks) return;
  const w = el.cticks.clientWidth || 1;
  const half = w / 2;
  for (const t of ticks) {
    const d = wrap180(t.b - headingDeg);
    if (Math.abs(d) > HALF) { t.node.style.opacity = '0'; continue; }
    const f = d / HALF;
    t.node.style.transform = 'translateX(' + (f * half).toFixed(1) + 'px)';
    t.node.style.opacity = String(Math.min(1, (1 - Math.abs(f)) * 4.2));
  }
  if (el.waymark) {
    if (targetBearingDeg === null) { el.waymark.style.opacity = '0'; return; }
    el.waymark.style.opacity = '1';
    const d = Math.max(-HALF, Math.min(HALF, wrap180(targetBearingDeg - headingDeg)));
    const x = (d / HALF) * half;
    el.waymark.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
    if (el.waydist) el.waydist.style.transform = 'translateX(calc(-50% + ' + x.toFixed(1) + 'px))';
  }
}

// ------------------------------------------------------------------ minimap
let mctx = null, mW = 0, mH = 0;
function mapSize() {
  if (!el.mmap) return false;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.round((el.mmap.clientWidth || 152) * dpr);
  const h = Math.round((el.mmap.clientHeight || 152) * dpr);
  if (w !== mW || h !== mH) {
    mW = w; mH = h;
    el.mmap.width = w; el.mmap.height = h;
    mctx = el.mmap.getContext('2d');
  }
  return !!mctx;
}

/**
 * Draw the minimap. North is up in world terms only when yaw is 0 — the map
 * rotates with the view, as in the concept frames.
 * @param {{player:{x:number,z:number,yaw:number},
 *          target:?Array<number>, enemies:?Array<Array<number>>, scale:?number}} s
 *        yaw is the view yaw in main.js's convention (window.__GAME__.camYaw).
 *        scale is the world radius in metres the disc covers (default 70).
 */
export function drawMinimap(s) {
  if (!s) { mapManual = false; return; }   // hand the disc back to the auto loop
  mapManual = true;
  paintMinimap(s);
}
let mapManual = false;

function paintMinimap(s) {
  if (!mapSize() || !s || !s.player) return;
  const ctx = mctx;
  const cx = mW / 2, cy = mH / 2, r = Math.min(cx, cy);
  const scale = s.scale || 70;
  const k = (r - 2) / scale;
  const c = s.player.yaw || 0;
  const px = s.player.x || 0, pz = s.player.z || 0;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, mW, mH);
  const gr = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  gr.addColorStop(0, 'rgba(18,22,25,.72)');
  gr.addColorStop(1, 'rgba(6,8,9,.88)');
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  // world grid — two tiers, enough texture to read as a city block plan without
  // pretending to be the real street layout
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r - 1, 0, Math.PI * 2); ctx.clip();
  ctx.translate(cx, cy);
  ctx.rotate(c);
  const span = scale * 1.6;
  for (const [G, col, lw] of [[25, C.road, 1], [100, C.stone, 2]]) {
    ctx.lineWidth = lw;
    ctx.strokeStyle = col;
    ctx.beginPath();
    const x0 = Math.ceil((px - span) / G) * G, z0 = Math.ceil((pz - span) / G) * G;
    for (let x = x0; x <= px + span; x += G) {
      const dx = (x - px) * k;
      ctx.moveTo(dx, -span * k); ctx.lineTo(dx, span * k);
    }
    for (let z = z0; z <= pz + span; z += G) {
      const dz = (z - pz) * k;
      ctx.moveTo(-span * k, dz); ctx.lineTo(span * k, dz);
    }
    ctx.stroke();
  }
  ctx.restore();

  // view cone
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(231,223,201,.07)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, r - 2, -Math.PI / 2 - 0.62, -Math.PI / 2 + 0.62);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  const cosC = Math.cos(c), sinC = Math.sin(c);
  const toScreen = (wx, wz) => {
    const dx = wx - px, dz = wz - pz;
    return [cx + (dx * cosC - dz * sinC) * k, cy + (dx * sinC + dz * cosC) * k];
  };

  // range ring
  ctx.strokeStyle = 'rgba(231,223,201,.10)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 5]);
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  // enemies
  const en = s.enemies || [];
  for (const e of en) {
    if (!e) continue;
    const [sx, sy] = toScreen(e[0], e[1]);
    if (Math.hypot(sx - cx, sy - cy) > r - 6) continue;
    ctx.fillStyle = C.amber;
    ctx.strokeStyle = 'rgba(8,10,12,.9)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(sx, sy, Math.max(2.6, r * 0.042), 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }

  // objective marker, clamped to the rim when it is off the disc
  if (s.target && s.target.length >= 2) {
    let [sx, sy] = toScreen(s.target[0], s.target[1]);
    const dx = sx - cx, dy = sy - cy;
    const dd = Math.hypot(dx, dy) || 1;
    const lim = r - r * 0.10;
    const edge = dd > lim;
    if (edge) { sx = cx + (dx / dd) * lim; sy = cy + (dy / dd) * lim; }
    const m = Math.max(5, r * 0.082);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.fillStyle = C.gold;
    ctx.strokeStyle = 'rgba(8,10,12,.85)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -m); ctx.lineTo(m, 0); ctx.lineTo(0, m); ctx.lineTo(-m, 0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    if (!edge) {
      ctx.fillStyle = 'rgba(8,10,12,.9)';
      ctx.beginPath();
      ctx.moveTo(0, -m * 0.4); ctx.lineTo(m * 0.4, 0); ctx.lineTo(0, m * 0.4); ctx.lineTo(-m * 0.4, 0);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  // player arrow — always centred, always up
  const a = Math.max(6, r * 0.115);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = C.ink;
  ctx.strokeStyle = 'rgba(8,10,12,.92)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -a * 1.3); ctx.lineTo(a * 0.82, a); ctx.lineTo(0, a * 0.36); ctx.lineTo(-a * 0.82, a);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();

  // the disc is view-up, so north is a moving label on the rim, not a fixed cap
  if (el.north) {
    const rr = (el.mmap.clientWidth || 152) / 2;
    el.north.style.transform =
      'translate(-50%,-50%) translate(' + (Math.sin(c) * rr * 0.84).toFixed(1) + 'px,'
      + (-Math.cos(c) * rr * 0.84).toFixed(1) + 'px)';
  }
}

// ------------------------------------------------------------------ speed/gear
const ARC = 144.5;                                   // length of the semicircle
const TOP_SPEED = 140;                               // km/h the dial fills at

/** Drive the driving readout. Pass km/h; gear is derived when omitted.
 *  Calling this stops the dial deriving its value from #spd. */
export function setSpeed(kmh, gear) {
  speedManual = true;
  applySpeed(kmh, gear);
}
let speedManual = false;

function applySpeed(kmh, gear) {
  const v = Math.max(0, Number(kmh) || 0);
  if (el.sarc) {
    const t = Math.min(1, v / TOP_SPEED);
    el.sarc.style.strokeDashoffset = String(ARC * (1 - t));
    el.sarc.style.stroke = t > 0.78 ? C.amber : C.green;
  }
  if (el.gear) el.gear.textContent = gear !== undefined ? String(gear) : gearFor(v);
}
const gearFor = (v) => (v < 1 ? 'N' : String(Math.min(6, 1 + Math.floor(v / 24))));

/** Light n of the three focus pips under the health bar. */
export function setFocus(n) {
  if (!el.focus) return;
  const pips = el.focus.children;
  for (let i = 0; i < pips.length; i++) pips[i].className = i < n ? '' : 'off';
}

// ------------------------------------------------------------------ tick
//
// Nothing below writes to a node main.js owns. It reads #spd and #objs, and it
// positions elements main.js has never heard of.
let lastFocus = -1, lastDrive = null;

function tick() {
  requestAnimationFrame(tick);
  const g = window.__GAME__;
  if (!el.hud || !el.hud.classList.contains('on') || !g) return;

  if (!manual) autoObjective(g.stage);

  // ---- driving mode
  const driving = !!(el.speedo && el.speedo.classList.contains('on'));
  if (driving !== lastDrive) {
    lastDrive = driving;
    el.hud.classList.toggle('drive', driving);
  }
  if (driving && el.spd && !speedManual) applySpeed(parseFloat(el.spd.textContent) || 0);

  // ---- compass. main.js's camYaw is an orbit angle: the view looks along
  // (-sin yaw, -cos yaw), so the bearing from north (-Z) is simply -yaw.
  const yaw = g.camYaw || 0;
  const heading = -yaw * 180 / Math.PI;
  const pos = g.pos || [0, 0];
  let bearing = null;
  if (g.target && g.target.length >= 2) {
    const dx = g.target[0] - pos[0], dz = g.target[1] - pos[1];
    if (dx || dz) bearing = Math.atan2(dx, -dz) * 180 / Math.PI;
  }
  drawCompass(heading, bearing);

  // ---- minimap. __GAME__ carries only the nearest enemy, so that is what the
  // disc shows until main.js calls drawMinimap() with the real list.
  if (!mapManual) {
    paintMinimap({
      player: { x: pos[0], z: pos[1], yaw },
      target: g.target || null,
      enemies: g.nearest ? [[g.nearest[0], g.nearest[1]]] : [],
      scale: g.inVan ? 130 : 70,
    });
  }

  // ---- focus pips track vitality
  const hp = typeof g.hp === 'number' ? g.hp : 100;
  const f = hp > 66 ? 3 : hp > 33 ? 2 : hp > 0 ? 1 : 0;
  if (f !== lastFocus) { lastFocus = f; setFocus(f); }
}
requestAnimationFrame(tick);

addEventListener('resize', () => { mW = 0; mH = 0; });

// The API, also hung on window so a non-module caller (or a gate) can reach it.
export const HUD = { setObjective, drawMinimap, setSpeed, setFocus };
window.HUD = HUD;
