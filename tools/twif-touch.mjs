// Touch gate. The jam requires the game to start from a REAL tap and move under
// a REAL finger on a phone viewport. Driving it through pointer-lock or debug
// hooks proves nothing: a build here shipped unstartable on every phone for weeks
// because every check drove it through its own hooks.
import puppeteer from 'puppeteer';

const URL = process.argv[2] || 'http://localhost:8080/__game__/game/';
const browser = await puppeteer.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const G = () => page.evaluate(() => window.__GAME__);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const problems = [];

await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction('window.__READY__ === true', { timeout: 40000 });

// the touch UI must actually be present on a phone
const touchOn = await page.evaluate(() => document.getElementById('touch').classList.contains('on'));
if (!touchOn) problems.push('touch controls not shown on a phone viewport');

// 1. start from a real tap on the real button
const box = await (await page.$('#startb')).boundingBox();
await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
await sleep(600);
const started = await page.evaluate(() => !document.getElementById('start').classList.contains('on'));
if (!started) problems.push('a real tap did not start the game');

// 2. move under a real finger. Hold until the player has covered a DISTANCE,
// never for a wall-clock duration: headless renders on a software rasteriser at
// a few frames a second, and the game clamps its step, so a fixed hold
// under-drives a slow machine and reports that the player would not move.
const before = (await G()).pos;
let moved = 0;
await page.touchscreen.touchStart(90, 700);
for (let i = 0; i < 200 && moved < 4; i++) {
  await page.touchscreen.touchMove(90, 646);
  await sleep(80);
  const now = (await G()).pos;
  moved = Math.hypot(now[0] - before[0], now[1] - before[1]);
}
await page.touchscreen.touchEnd();
if (moved < 4) problems.push(`finger drag moved the player ${moved.toFixed(2)} m, expected > 4`);

// 3. the camera must respond to a drag on the right side
const y0 = (await G()).camYaw;
let turned = 0;
for (let pass = 0; pass < 6 && turned < 0.4; pass++) {
  await page.touchscreen.touchStart(320, 300);
  for (let i = 1; i <= 12; i++) { await page.touchscreen.touchMove(320 - i * 20, 300); await sleep(45); }
  await page.touchscreen.touchEnd();
  await sleep(120);
  turned = Math.abs((await G()).camYaw - y0);
}
const y1 = (await G()).camYaw;
if (turned < 0.4) problems.push(`camera drag turned the view ${turned.toFixed(3)} rad, expected > 0.4`);

// 4. the attack button must reach the game
const s0 = (await G()).swings;
const ab = await (await page.$('#batk')).boundingBox();
for (let i = 0; i < 3; i++) {
  await page.touchscreen.tap(ab.x + ab.width / 2, ab.y + ab.height / 2);
  await sleep(600);
}
const s1 = (await G()).swings;
if (s1 <= s0) problems.push('the ATK button never reached the game');

const g = await G();
await page.screenshot({ path: 'harness/_twif_touch.png' });
await browser.close();

console.log('\nTWIF touch gate  (390x844, real touch events)\n');
console.log(`  touch ui shown   ${touchOn}`);
console.log(`  started by tap   ${started}`);
console.log(`  finger moved     ${moved.toFixed(2)} m`);
console.log(`  camera turned    ${turned.toFixed(3)} rad`);
console.log(`  swings via ATK   ${s1 - s0}`);
console.log(`  draws / tris     ${g.draws} / ${g.tris.toLocaleString()}`);
console.log(`  console errors   ${errors.length}`);
if (errors.length) problems.push(`${errors.length} console error(s): ${errors.slice(0, 2).join(' | ')}`);
if (problems.length) { console.log('\nproblems:'); for (const p of problems) console.log('  ' + p); process.exit(1); }
console.log('\nstarts from a tap and moves under a finger.\n');
