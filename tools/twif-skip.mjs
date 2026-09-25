// Regression: the mission must not be skippable.
//
// Found by a human playing it, not by the mission gate, which walks politely to
// each objective. Walking down the edge of the street missed Max Sensei's trigger
// radius, so the tutorial never fired — and the van only answers during 'street'.
// The player reached a van that would never open, with no error and nothing logged.
import puppeteer from 'puppeteer';

const URL = process.argv[2] || 'http://localhost:8080/__game__/game/';
const browser = await puppeteer.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 600 });
const G = () => page.evaluate(() => window.__GAME__);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const held = new Set();
async function hold(keys) {
  for (const k of [...held]) if (!keys.includes(k)) { await page.keyboard.up(k); held.delete(k); }
  for (const k of keys) if (!held.has(k)) { await page.keyboard.down(k); held.add(k); }
}
async function walk(tx, tz, within = 3, ms = 45000) {
  const t0 = Date.now(); const s0 = (await G()).stage;
  while (Date.now() - t0 < ms) {
    const g = await G();
    if (g.stage !== s0 || g.over) { await hold([]); return; }
    const dx = tx - g.pos[0], dz = tz - g.pos[1], d = Math.hypot(dx, dz);
    if (d <= within) { await hold([]); return; }
    const y = g.camYaw;
    const fwd = (dx / d) * -Math.sin(y) + (dz / d) * -Math.cos(y);
    const rgt = (dx / d) * Math.cos(y) + (dz / d) * -Math.sin(y);
    const k = [];
    if (fwd > 0.35) k.push('KeyW'); else if (fwd < -0.35) k.push('KeyS');
    if (rgt > 0.35) k.push('KeyD'); else if (rgt < -0.35) k.push('KeyA');
    if (k.length) k.push('ShiftLeft');
    await hold(k); await sleep(70);
  }
  await hold([]);
}

await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction('window.__READY__ === true', { timeout: 40000 });
await page.click('#startb');
await sleep(400);

const problems = [];
// into the subnet
let g = await G();
await walk(g.target[0], g.target[1], 3.0);
for (let i = 0; i < 50; i++) { g = await G(); if (g.stage === 'tutorial') break; await sleep(150); }
if (g.stage !== 'tutorial') problems.push('never entered the subnet');

// now RUN PAST Max down the edge of the street, ignoring him entirely
await walk(406, -60, 3.0, 40000);
await sleep(900);
g = await G();

if (g.enemies === 0 && g.stage === 'tutorial') {
  problems.push('walked past Max: tutorial never fired and the mission is soft-locked');
}
// and the marker must still be pointing at something
if (!g.target) problems.push('no objective marker after skipping ahead');

console.log('\nTWIF skip-path regression\n');
console.log(`  stage after skipping past Max   ${g.stage}`);
console.log(`  enemies engaged                 ${g.enemies}`);
console.log(`  player position                 ${g.pos[0]}, ${g.pos[1]}`);
console.log(`  marker still pointing           ${g.target ? g.target.map(n => Math.round(n)).join(', ') : 'NONE'}`);
await browser.close();
if (problems.length) { console.log('\nproblems:'); for (const p of problems) console.log('  ' + p); process.exit(1); }
console.log('\nthe mission cannot be walked past.\n');
