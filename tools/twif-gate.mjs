// TWIF gate. The supplied playtest drives forward and never swings, drives or
// interacts, so pointed at this game it would report a clean pass having tested
// none of it. This one walks the whole mission with REAL key and mouse events —
// never through a debug hook — and fails on any stage it cannot reach.
//
//   node harness/twif-gate.mjs [url]
import puppeteer from 'puppeteer';

const URL = process.argv[2] || 'http://localhost:8080/__game__/game/';
const BUDGET = { draws: 900, tris: 1_500_000 };
// Stage order. A transition can happen in the same frame as the one before it —
// standing on the artefact when the last enforcer drops collects it immediately —
// so the gate compares PROGRESS, never equality, or it fails a game that worked.
const ORDER = ['hub','arrive','tutorial','street','drive','arena','artefact','return','complete'];
// No fps assertion here. Headless runs on swiftshader, a software rasteriser, so a
// low number measures the renderer and not the build. Frame rate is proved on a real
// device by harness/jam.mjs; this gate proves the mission can actually be played.

const browser = await puppeteer.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1000, height: 640, deviceScaleFactor: 1 });

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
page.on('requestfailed', (r) => errors.push(`404/failed: ${r.url()}`));

const G = () => page.evaluate(() => window.__GAME__);
const held = new Set();
async function hold(keys) {
  for (const k of [...held]) if (!keys.includes(k)) { await page.keyboard.up(k); held.delete(k); }
  for (const k of keys) if (!held.has(k)) { await page.keyboard.down(k); held.add(k); }
}
const release = () => hold([]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let peak = { draws: 0, tris: 0, minFps: 999 };
function sample(g) {
  peak.draws = Math.max(peak.draws, g.draws);
  peak.tris = Math.max(peak.tris, g.tris);
  if (g.frame > 60) peak.minFps = Math.min(peak.minFps, g.fps);
}

/** Walk to a world point using real keys, steering by camera yaw. */
async function walkTo(tx, tz, { within = 2.6, timeout = 40000, label = '' } = {}) {
  const t0 = Date.now();
  const stage0 = (await G()).stage;
  let lastD = Infinity, stuck = 0;
  while (Date.now() - t0 < timeout) {
    const g = await G(); sample(g);
    if (g.over) return false;
    if (g.stage !== stage0) { await release(); return true; }
    const dx = tx - g.pos[0], dz = tz - g.pos[1];
    const d = Math.hypot(dx, dz);
    if (d <= within) { await release(); return true; }
    if (d > lastD - 0.05) stuck++; else stuck = 0;
    lastD = d;
    const y = g.camYaw;
    // camera basis: forward (0,0,1) rotated by yaw
    const fx = -Math.sin(y), fz = -Math.cos(y);
    const rx = Math.cos(y),  rz = -Math.sin(y);
    const nx = dx / d, nz = dz / d;
    const fwd = nx * fx + nz * fz;
    const rgt = nx * rx + nz * rz;
    const keys = [];
    if (fwd > 0.35) keys.push('KeyW'); else if (fwd < -0.35) keys.push('KeyS');
    if (rgt > 0.35) keys.push('KeyD'); else if (rgt < -0.35) keys.push('KeyA');
    if (keys.length) keys.push('ShiftLeft');
    // if we are wedged on a blocker, strafe out of it
    if (stuck > 14) { keys.length = 0; keys.push(rgt > 0 ? 'KeyA' : 'KeyD', 'KeyW'); stuck = 0; }
    await hold(keys);
    await sleep(70);
  }
  await release();
  throw new Error(`walkTo(${tx}, ${tz}) timed out ${label}`);
}

/** Drive: throttle held, steer toward the target x. */
async function driveTo(tz, { timeout = 60000 } = {}) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const g = await G(); sample(g);
    if (g.over) return false;
    if (!g.inVan) return true;
    if (g.pos[1] <= tz) { await release(); return true; }
    const keys = ['KeyW'];
    const offset = g.pos[0] - 400;
    if (offset > 1.2) keys.push('KeyA'); else if (offset < -1.2) keys.push('KeyD');
    await hold(keys);
    await sleep(80);
  }
  await release();
  throw new Error('driveTo timed out');
}

/** Close on the nearest enemy and swing until the field is clear. */
async function fight({ timeout = 90000 } = {}) {
  const t0 = Date.now();
  const stage0 = (await G()).stage;
  while (Date.now() - t0 < timeout) {
    const g = await G(); sample(g);
    if (g.over) return false;
    if (g.enemies === 0) { await release(); return true; }
    // the objective moved on: stop fighting optional enemies
    if (g.stage !== stage0) { await release(); return true; }
    if (!g.nearest) { await sleep(120); continue; }
    const [ex, ez, d] = g.nearest;
    if (d > 2.0) {
      await walkTo(ex, ez, { within: 2.0, timeout: 20000, label: 'closing' });
    } else {
      await release();
      if (g.hp < 45) {           // back off and use the dodge i-frames
        await page.keyboard.press('Space');
        await sleep(240);
      }
      await page.keyboard.press('KeyJ');
      await sleep(190);
    }
  }
  await release();
  throw new Error('fight timed out');
}

/** Walk to wherever the objective currently is. Null means the mission already
 *  moved past it — a transition can land in the same frame we asked. */
async function walkToObjective(opts = {}) {
  const g = await G();
  if (!g.target) return true;
  return walkTo(g.target[0], g.target[1], opts);
}

async function waitStage(name, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const g = await G(); sample(g);
    if (ORDER.indexOf(g.stage) >= ORDER.indexOf(name)) return true;
    if (g.over) throw new Error(`died before reaching "${name}" (hp 0 at stage "${g.stage}")`);
    await sleep(120);
  }
  throw new Error(`never reached stage "${name}"`);
}

// ---------------------------------------------------------------- run
const problems = [];
let reached = [];
try {
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction('window.__READY__ === true', { timeout: 40000 });

  // start from a REAL mouse click on the real button
  await page.click('#startb');
  await sleep(400);

  const g0 = await G();
  if (!g0) throw new Error('__GAME__ missing');

  // 1. hub -> the active node
  await walkToObjective({ within: 3.0, label: 'hub gate' });
  await waitStage('tutorial', 12000);
  reached.push('arrive', 'tutorial');

  // 2. tutorial: meet Max, then the enforcers
  await walkToObjective({ within: 4.2, label: 'max sensei' });
  await sleep(400);
  await fight();
  await waitStage('street', 8000);
  reached.push('street');

  // 3. street -> the van, and a real interact press
  await walkToObjective({ within: 3.6, label: 'van' });
  await sleep(300);
  await page.keyboard.press('KeyE');
  await waitStage('drive', 8000);
  reached.push('drive');

  // 4. drive to the node
  await driveTo(-424);
  await waitStage('arena', 15000);
  reached.push('arena');

  // 5. the final encounter
  await fight();
  await waitStage('artefact', 8000);
  reached.push('artefact');

  // 6. take it, and go home
  await walkToObjective({ within: 2.8, label: 'artefact' });
  await waitStage('return', 8000);
  reached.push('return');
  await walkToObjective({ within: 3.2, label: 'return gate' });
  await waitStage('complete', 8000);
  reached.push('complete');
} catch (e) {
  problems.push(e.message);
}

const g = await G();
sample(g);
await page.screenshot({ path: 'harness/_twif_gate.png' });

if (peak.draws > BUDGET.draws) problems.push(`peak draws ${peak.draws} over ${BUDGET.draws}`);
if (peak.tris > BUDGET.tris) problems.push(`peak tris ${peak.tris} over ${BUDGET.tris}`);
if (g.nodes !== 1) problems.push(`network counter is ${g.nodes}, expected 1`);
if (errors.length) problems.push(`${errors.length} console error(s): ${errors.slice(0, 3).join(' | ')}`);

console.log('\nTWIF gate\n');
console.log(`  stages reached   ${reached.join(' -> ') || 'none'}`);
console.log(`  final stage      ${g.stage}`);
console.log(`  network          ${g.nodes} / 128`);
console.log(`  swings           ${g.swings}`);
console.log(`  hp               ${g.hp}`);
console.log(`  peak draws       ${peak.draws}  (budget ${BUDGET.draws})`);
console.log(`  peak triangles   ${peak.tris.toLocaleString()}  (budget ${BUDGET.tris.toLocaleString()})`);
console.log(`  min fps          ${peak.minFps === 999 ? 'n/a' : peak.minFps}  (software rasteriser, informational)`);
console.log(`  console errors   ${errors.length}`);

await browser.close();
if (problems.length) {
  console.log('\nproblems:');
  for (const p of problems) console.log('  ' + p);
  process.exit(1);
}
console.log('\nthe whole mission ran, start to 1/128.\n');
