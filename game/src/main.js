// TWIF: Subnet One — greybox.
//
// The __GAME__ contract at the bottom is what a gate steers by. Two things in it
// are easy to get wrong and both cost real time: `fps` is measured from REAL
// elapsed time and never from a clamped delta, because a frame counter divided
// by a clamped delta reports a healthy number on a build running at one frame a
// second; and `pos` is in metres, because the harness drives each leg until the
// player has covered a distance rather than for a wall-clock duration.
import * as THREE from 'three';
import { CAM, MAX_DT, HUB, SUB, PLAYER, clamp, damp } from './config.js';
import { Input } from './input.js';
import { buildHub, buildSubnet, makeBeacon, loadAssets, MAT } from './world.js';
import { Player, Van } from './entities.js';
import { Mission } from './mission.js';
import { Audio } from './audio.js';
import { createLighting } from './lighting.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.28;
renderer.info.autoReset = false;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 900);

// Night lighting. Two colour temperatures made in the lights, a sky that cannot
// disagree with them, and practicals that always light the ground beneath them.
const lighting = createLighting(THREE, renderer, scene, {
  tier: 'auto',
  tierOverrides: { pixelRatio: Math.min(globalThis.devicePixelRatio || 1, 2), post: true },
});

// ---------------------------------------------------------------- world
// Generated modules load before anything is built, and before __READY__. An
// asset that fails to import would otherwise leave the level quietly emptier
// than it should be — and an empty level is fast, so no frame rate check
// notices.
{
  const bar = document.getElementById('barf');
  const msg = document.getElementById('loadmsg');
  await loadAssets((p, label) => {
    bar.style.width = Math.round(p * 100) + '%';
    if (label) msg.textContent = label;
  });
}

const hub = buildHub();
const sub = buildSubnet();
scene.add(hub.group, sub.group);

const world = {
  show(which) {
    hub.group.visible = which === 'hub';
    sub.group.visible = which === 'sub';
    blockers = which === 'hub' ? hub.blockers : sub.blockers;
  },
};
let blockers = hub.blockers;

const input = new Input();
const audio = new Audio();
const player = new Player(scene);
const heroRim = new THREE.PointLight(0xBFE4FF, 1.5, 4.2, 2);
scene.add(heroRim);
const heroKey = new THREE.PointLight(0xE7DFC9, 0.9, 3.4, 2);
scene.add(heroKey);
const van = new Van(scene);
const mission = new Mission(scene, hub, sub, player, van);
const beacon = makeBeacon();
scene.add(beacon);
world.show('hub');
player.teleport(HUB.x, HUB.z + 6, Math.PI);
lighting.adopt(scene);
// Wet ground. Without this the streaks are doing it alone and the road reads
// flat — low roughness plus metalness plus the environment map is what makes
// the street carry the neon back up at the camera.
lighting.setGround(MAT.ground);
lighting.setGround(MAT.road);
lighting.setGround(MAT.stone, { roughness: 0.45, metalness: 0.2, envMapIntensity: 1.1 });

// ---------------------------------------------------------------- ui
const el = (id) => document.getElementById(id);
const ui = {
  load: el('load'), barf: el('barf'), loadmsg: el('loadmsg'),
  hud: el('hud'), objs: el('objs'), ncount: el('ncount'), hpfill: el('hpfill'),
  prompt: el('prompt'), toast: el('toast'), speedo: el('speedo'), spd: el('spd'),
  start: el('start'), startp: el('startp'), startb: el('startb'),
  over: el('over'), overh: el('overh'), overp: el('overp'), overb: el('overb'),
  perf: el('perf'),
  wayrow: el('wayrow'), wayarrow: el('wayarrow'), waydist: el('waydist'), hint: el('hint'),
};
ui.startp.innerHTML = input.isTouch
  ? 'Left thumb to move &middot; drag the right side to look<br>ATK to strike &middot; DGE to dodge &middot; ACT to interact'
  : '<kbd>WASD</kbd> move &middot; drag to look &middot; <kbd>J</kbd> or click strike<br><kbd>Space</kbd> dodge &middot; <kbd>E</kbd> interact';

let toastT = 0, hintT = 0;
function toast(msg) { if (!msg) return; ui.toast.textContent = msg; toastT = 2.2; }

// ---------------------------------------------------------------- state
let running = false, over = false, won = false;
let camYaw = Math.PI, camPitch = 0.12;
// After a new objective appears the camera eases round to face it, so the player
// is never left looking at the wrong quarter of a ring of 128 identical gates.
// Any look input cancels it immediately — the camera is still theirs.
let assistYaw = null, assistT = 0, lastStage = null;
const camPos = new THREE.Vector3();
const camAim = new THREE.Vector3();

window.__GAME__ = {
  pos: [0, 0], fps: 60, frame: 0, speed: 0, score: 0, over: false,
  draws: 0, tris: 0, hp: 100,
  // Telemetry, not a debug hook. A gate needs to tell "the attack button never
  // reached the game" apart from "it swung and missed" — identical from a kill
  // count of zero, and completely different bugs. Nothing here acts for the player.
  stage: 'hub', checkpoints: [], nodes: 0, enemies: 0, swings: 0, inVan: false,
  // camYaw and nearest exist so a gate can convert a world target into real key
  // presses and real taps. The gate still has to press the keys itself.
  camYaw: 0, nearest: null, target: null,
};
let swings = 0;
const _pm = new THREE.Matrix4(), _pq = new THREE.Quaternion(),
      _pp = new THREE.Vector3(), _ps = new THREE.Vector3(1, 1, 1), _pe = new THREE.Euler();
let prevAttackT = 0;
let audioStage = null;

function startGame() {
  if (running) return;
  running = true; over = false; won = false;
  ui.start.classList.remove('on');
  ui.over.classList.remove('on');
  ui.hud.classList.add('on');
  ui.hint.textContent = input.isTouch
    ? 'LEFT THUMB TO MOVE  ·  FOLLOW THE MARKER'
    : 'WASD TO MOVE  ·  FOLLOW THE MARKER';
  ui.hint.classList.add('on');
  hintT = 6;
  last = performance.now();
}
window.__START__ = startGame;
ui.startb.addEventListener('click', startGame);
ui.startb.addEventListener('click', () => { audio.unlock(); audio.ui('confirm'); audio.music('hub'); });
// some iOS builds need the first touch anywhere
addEventListener('pointerdown', () => audio.unlock(), { once: true, capture: true });
ui.overb.addEventListener('click', () => { audio.ui('select'); location.reload(); });

function endGame(win) {
  if (over) return;
  over = true; won = win; running = false;
  window.__GAME__.over = true;
  ui.overh.textContent = win ? 'SUBNET ONE COMPLETE' : 'DISCONNECTED';
  ui.overp.textContent = win
    ? 'The node is yours. 1 of 128 lit. 127 remain dormant.'
    : 'The network reclaimed you. Reconnect and try again.';
  ui.over.classList.add('on');
  ui.hud.classList.remove('on');
  if (!win) audio.music('off');
}

// ---------------------------------------------------------------- loop
let last = performance.now();
let fpsAcc = 0, fpsN = 0, fpsShow = 60, frame = 0;

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 0.85 ? 70 : 62;      // wider on a phone in portrait
  camera.updateProjectionMatrix();
  if (lighting && lighting.resize) lighting.resize(w, h);
}
addEventListener('resize', resize);
resize();

function frameLoop(now) {
  requestAnimationFrame(frameLoop);
  const realDt = (now - last) / 1000;
  last = now;

  // fps from REAL elapsed time, never the clamped step below
  fpsAcc += realDt; fpsN++;
  if (fpsAcc >= 0.4) { fpsShow = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; }

  const dt = Math.min(realDt, MAX_DT);
  if (running && !over) step(dt);

  renderer.info.reset();
  lighting.render(camera, dt);

  const r = renderer.info.render;
  const g = window.__GAME__;
  g.pos = [+player.pos.x.toFixed(2), +player.pos.z.toFixed(2)];
  g.fps = fpsShow; g.frame = frame;
  g.speed = +(player.inVan ? van.speed : player.speed).toFixed(2);
  g.over = over; g.draws = r.calls; g.tris = r.triangles;
  g.hp = Math.round(player.hp);
  g.stage = mission.stage;
  g.checkpoints = mission.checkpoints.map((c) => c.stage);
  g.nodes = mission.nodes;
  g.enemies = mission.liveEnemies;
  g.swings = swings;
  g.inVan = player.inVan;
  g.score = mission.checkpoints.length * 100 + mission.nodes * 1000;
  g.camYaw = +camYaw.toFixed(4);
  {
    let best = null, bd = Infinity;
    for (const e of (mission.group.length ? mission.group : mission.enemies)) {
      if (e.dead) continue;
      const d = Math.hypot(e.pos.x - player.pos.x, e.pos.z - player.pos.z);
      if (d < bd) { bd = d; best = e; }
    }
    g.nearest = best ? [+best.pos.x.toFixed(2), +best.pos.z.toFixed(2), +bd.toFixed(2)] : null;
    g.facing = +player.facing.toFixed(3);
    if (best) {
      const dx = best.pos.x - player.pos.x, dz = best.pos.z - player.pos.z;
      const dd = Math.hypot(dx, dz) || 1;
      g.hitDot = +(((dx / dd) * Math.sin(player.facing)) + ((dz / dd) * Math.cos(player.facing))).toFixed(3);
      g.hitReach = +(PLAYER.attackRange + best.S.radius).toFixed(2);
      g.enemyHp = best.hp;
    } else { g.hitDot = 0; g.hitReach = 0; g.enemyHp = 0; }
    g.target = mission.waypoint();
  }
  frame++;
}

function step(dt) {
  // ---- look
  const look = input.takeLook();
  const sens = input.isTouch ? CAM.touchSens : CAM.mouseSens;
  camYaw -= look.x * sens;
  camPitch = clamp(camPitch + look.y * sens, CAM.minPitch, CAM.maxPitch);
  if (look.x || look.y) { assistYaw = null; assistT = 0; }

  // ---- drive or walk
  if (player.inVan) {
    const spd = van.update(dt, input);
    player.pos.copy(van.pos);
    ui.speedo.classList.add('on');
    ui.spd.textContent = Math.round(spd * 3.6);
    // camera eases in behind the van rather than snapping
    camYaw = damp(camYaw, van.yaw + Math.PI, 3.2, dt);
  } else {
    ui.speedo.classList.remove('on');
    const canHit = player.update(dt, input, camYaw, blockers, mission.enemies);
    if (player.attackT > 0 && prevAttackT <= 0) audio.sword(false);
    prevAttackT = player.attackT;
    if (canHit) {
      player.didHit = true;
      swings++;
      let hitAny = false;
      const fx = Math.sin(player.facing), fz = Math.cos(player.facing);
      for (const e of mission.enemies) {
        if (e.dead) continue;
        const dx = e.pos.x - player.pos.x, dz = e.pos.z - player.pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist > PLAYER.attackRange + e.S.radius) continue;
        const dot = (dx / dist) * fx + (dz / dist) * fz;
        if (dot > Math.cos(PLAYER.attackArc)) {
          const wasAlive = !e.dead;
          e.hurt(PLAYER.attackDmg);
          hitAny = true;
          if (e.dead && wasAlive) audio.enemyDown(); else audio.enemyHit();
        }
      }
      audio.sword(hitAny);
    }
  }

  // ---- enemies
  for (const e of mission.enemies) {
    const dmg = e.update(dt, player, blockers);
    if (dmg > 0 && player.hurt(dmg)) {
      audio.playerHurt();
      if (player.hp <= 0) endGame(false);
    }
  }

  // ---- mission
  toast(mission.update(dt, input, world));
  if (mission.stage !== audioStage) {
    audioStage = mission.stage;
    if (mission.stage === 'artefact' || mission.stage === 'complete') audio.nodeActivate();
    else audio.ui('select');
  }
  if (mission.done && !over) endGame(true);

  // ---- camera
  const target = player.inVan ? van.pos : player.pos;
  const dist = player.inVan ? CAM.driveDist : CAM.dist;
  const height = player.inVan ? CAM.driveHeight : CAM.height;
  const cy = Math.cos(camPitch);
  camPos.set(
    target.x + Math.sin(camYaw) * dist * cy,
    target.y + height + Math.sin(camPitch) * dist,
    target.z + Math.cos(camYaw) * dist * cy,
  );
  camera.position.lerp(camPos, 1 - Math.exp(-CAM.lerp * dt));
  camAim.set(target.x, target.y + CAM.lookAt, target.z);
  camera.lookAt(camAim);

  lighting.update(dt, target);
  heroRim.position.set(target.x - Math.sin(camYaw) * 1.5, target.y + 2.2, target.z - Math.cos(camYaw) * 1.5);
  heroKey.position.set(target.x + Math.sin(camYaw) * 1.1, target.y + 1.7, target.z + Math.cos(camYaw) * 1.1);

  // ---- blossom drift: the only thing in frame that moves
  if (sub.petals) {
    const P = sub.petalState, im = sub.petals;
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      p.y -= p.vy * dt;
      p.sway += p.swaySpeed * dt;
      p.rot += p.spin * dt;
      if (p.y < -0.2) p.y = 13 + Math.random() * 3;
      _pp.set(p.x + Math.sin(p.sway) * 0.9, p.y, p.z + Math.cos(p.sway * 0.7) * 0.5);
      _pe.set(p.rot * 0.6, p.rot, p.sway * 0.5);
      _pq.setFromEuler(_pe);
      _pm.compose(_pp, _pq, _ps);
      im.setMatrixAt(i, _pm);
    }
    im.instanceMatrix.needsUpdate = true;
  }

  // ---- wayfinding
  const wp = mission.waypoint();
  if (wp && !mission.done) {
    const dx = wp[0] - player.pos.x, dz = wp[1] - player.pos.z;
    const dist = Math.hypot(dx, dz);
    beacon.visible = true;
    beacon.position.set(wp[0], 0, wp[1]);
    beacon.userData.pulse(performance.now() / 1000);

    // a new objective turns the camera toward it
    if (mission.stage !== lastStage) {
      lastStage = mission.stage;
      assistYaw = Math.atan2(-dx, -dz);
      assistT = 1.1;
    }
    if (assistYaw !== null && assistT > 0) {
      assistT -= dt;
      let d = (assistYaw - camYaw) % (Math.PI * 2);
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      camYaw += d * (1 - Math.exp(-4.5 * dt));
      if (assistT <= 0) assistYaw = null;
    }

    // screen-relative arrow: 0deg is straight ahead
    const nx = dx / (dist || 1), nz = dz / (dist || 1);
    const fwd = nx * -Math.sin(camYaw) + nz * -Math.cos(camYaw);
    const rgt = nx * Math.cos(camYaw) + nz * -Math.sin(camYaw);
    const ang = Math.atan2(rgt, fwd) * 180 / Math.PI;
    ui.wayarrow.style.transform = 'rotate(' + ang.toFixed(1) + 'deg)';
    ui.waydist.textContent = dist < 4 ? 'HERE' : Math.round(dist) + ' m';
    ui.wayrow.style.visibility = 'visible';
  } else {
    beacon.visible = false;
    ui.wayrow.style.visibility = 'hidden';
  }

  if (hintT > 0) { hintT -= dt; if (hintT <= 0) ui.hint.classList.remove('on'); }

  // ---- hud
  ui.objs.textContent = mission.objective;
  ui.ncount.textContent = mission.nodes;
  ui.hpfill.style.width = Math.max(0, player.hp) + '%';
  ui.hpfill.style.background = player.hp < 35 ? '#E66D32' : '#9AFF43';
  if (mission.prompt) { ui.prompt.textContent = mission.prompt; ui.prompt.classList.add('on'); }
  else ui.prompt.classList.remove('on');
  if (toastT > 0) { toastT -= dt; ui.toast.style.opacity = String(clamp(toastT, 0, 1)); }
  else ui.toast.style.opacity = '0';

  audio.update(dt, {
    speed: player.inVan ? van.speed : player.speed,
    inVan: player.inVan,
    stage: mission.stage,
    enemies: mission.liveEnemies,
    over,
    surface: player.inVan ? 'road' : 'stone',
  });
}

addEventListener('keydown', (e) => {
  if (e.code === 'KeyP') ui.perf.classList.toggle('on');
  if (e.code === 'KeyM') audio.mute(!audio.muted);
});
setInterval(() => {
  if (!ui.perf.classList.contains('on')) return;
  const g = window.__GAME__;
  ui.perf.textContent = `${g.fps} fps  ${g.draws} draws  ${(g.tris / 1000).toFixed(0)}k tris\n${g.stage}  ${g.pos[0]}, ${g.pos[1]}`;
}, 250);

// ---------------------------------------------------------------- boot
ui.barf.style.width = '100%';
ui.loadmsg.textContent = 'ready';
ui.load.style.display = 'none';
ui.start.classList.add('on');
requestAnimationFrame(frameLoop);
window.__READY__ = true;
