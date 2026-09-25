// Tuning and world layout. Every dimension here traces to STYLE_LOCK.md, which is canon.
// Do not re-derive sizes from concept art.

export const SCALE = {
  twif:      1.65,   // m, hero height
  npc:       1.75,
  grunt:     2.05,   // deliberately imposing beside TWIF
  boss:      2.15,
  drone:     0.60,   // diameter, instanced
  gate:      5.50,   // all standard subnet gates, hub and subnet alike
  lantern:   2.80,
  vanH:      1.95, vanL: 4.50, vanW: 1.80,
};

export const PLAYER = {
  walk: 5.2, run: 8.4, accel: 38, friction: 12,
  radius: 0.42, turnLerp: 13,
  hp: 120, attackRange: 2.6, attackArc: 1.5, attackDmg: 60,
  attackTime: 0.42, attackCooldown: 0.16, lockRange: 4.2,
  dodgeSpeed: 15, dodgeTime: 0.3, dodgeCooldown: 0.65, dodgeIFrames: 0.26,
};

export const CAM = {
  dist: 6.2, height: 2.5, lookAt: 1.2,
  minPitch: -0.55, maxPitch: 0.95, lerp: 9,
  mouseSens: 0.0026, touchSens: 0.0052,
  driveDist: 9.5, driveHeight: 4.0,
};

export const VAN = {
  accel: 15, brake: 26, maxSpeed: 26, reverseMax: 7,
  drag: 0.62, steer: 1.5, steerAtSpeed: 0.55, radius: 1.5,
};

export const GRUNT = {
  hp: 100, speed: 3.4, radius: 0.62, attackRange: 2.5,
  attackDmg: 9, attackWindup: 0.6, attackCooldown: 1.8, aggroRange: 22,
};

export const BOSS = {
  hp: 260, speed: 3.0, radius: 0.9, attackRange: 3.4,
  attackDmg: 15, attackWindup: 0.8, attackCooldown: 2.2, aggroRange: 40,
};

// --- world layout. Two zones, far apart, only one visible at a time.
export const HUB = { x: 0, z: 0, radius: 26, ringRadius: 21, gates: 128, activeIndex: 0 };

export const SUB = {
  x: 400,
  spawnZ: 8,            // arrival, facing -Z
  tutorialZ: -22,       // Max Sensei waits here
  streetZ0: -34, streetZ1: -140,
  vanZ: -152,
  roadZ0: -160, roadZ1: -430, roadW: 15,
  arenaZ: -472, arenaR: 30,
  returnZ: -500,
};

export const MAX_DT = 1 / 20;          // never step further than this
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const damp  = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
export const lerp  = (a, b, t) => a + (b - a) * t;
