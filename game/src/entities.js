// Player, enemies and the van. Greybox behaviour — the shapes are placeholders,
// the mechanics are not: this is what the first milestone has to prove works.
import * as THREE from 'three';
import { PLAYER, GRUNT, BOSS, VAN, SCALE, SUB, clamp, damp } from './config.js';
import { makeFigure, makeVan, MAT } from './world.js';

/** Push a circle out of any axis-aligned box it has entered. */
export function resolve(pos, radius, blockers) {
  for (const b of blockers) {
    const dx = pos.x - b.x, dz = pos.z - b.z;
    const px = b.hx + radius - Math.abs(dx);
    const pz = b.hz + radius - Math.abs(dz);
    if (px > 0 && pz > 0) {
      if (px < pz) pos.x += Math.sign(dx || 1) * px;
      else         pos.z += Math.sign(dz || 1) * pz;
    }
  }
}

export class Player {
  constructor(scene) {
    this.mesh = makeFigure(SCALE.twif, MAT.charcoal);
    // the one high-chroma accent in the frame: TWIF's eyes
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), MAT.active);
    eye.position.set(0.07, SCALE.twif * 0.88, 0.14);
    const eye2 = eye.clone(); eye2.position.x = -0.07;
    this.mesh.add(eye, eye2);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.06), MAT.cream);
    blade.position.set(0.3, SCALE.twif * 0.5, 0);
    this.blade = blade; this.mesh.add(blade);
    scene.add(this.mesh);

    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.facing = 0;
    this.hp = PLAYER.hp;
    this.speed = 0;
    this.attackT = 0; this.attackCd = 0; this.didHit = false;
    this.dodgeT = 0; this.dodgeCd = 0; this.iFrames = 0;
    this.inVan = false;
  }

  get alive() { return this.hp > 0; }

  teleport(x, z, facing = 0) {
    this.pos.set(x, 0, z); this.vel.set(0, 0, 0);
    this.facing = facing; this.mesh.rotation.y = facing;
  }

  hurt(n) {
    if (this.iFrames > 0) return false;
    this.hp = Math.max(0, this.hp - n);
    this.iFrames = 0.7;   // caps incoming damage when several enforcers crowd you
    return true;
  }

  /** `targets` enables soft facing: starting a swing turns TWIF toward the
   *  nearest enemy in reach. Without it, standing still and attacking swings
   *  wherever you last walked, which is unreadable and impossible with a thumb. */
  update(dt, input, camYaw, blockers, targets = []) {
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.dodgeCd  = Math.max(0, this.dodgeCd - dt);
    this.iFrames  = Math.max(0, this.iFrames - dt);

    const mv = input.poll();
    // camera-relative movement
    const f = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw));
    const r = new THREE.Vector3(Math.cos(camYaw), 0, -Math.sin(camYaw));
    const dir = new THREE.Vector3()
      .addScaledVector(f, mv.y).addScaledVector(r, mv.x);
    const moving = dir.lengthSq() > 1e-4;
    if (moving) dir.normalize();

    if (this.dodgeT > 0) {
      this.dodgeT -= dt;
    } else if (input.take('dodge') && this.dodgeCd <= 0) {
      this.dodgeT = PLAYER.dodgeTime;
      this.dodgeCd = PLAYER.dodgeCooldown;
      this.iFrames = PLAYER.dodgeIFrames;
      const d = moving ? dir : new THREE.Vector3(Math.sin(this.facing), 0, Math.cos(this.facing));
      this.vel.copy(d).multiplyScalar(PLAYER.dodgeSpeed);
    }

    if (this.attackT > 0) {
      this.attackT -= dt;
      if (this.attackT <= 0) { this.attackT = 0; this.attackCd = PLAYER.attackCooldown; }
    } else if (input.take('attack') && this.attackCd <= 0) {
      this.attackT = PLAYER.attackTime; this.didHit = false;
      // Soft facing. Without this, standing still and attacking swings wherever
      // you last walked — the player ends up with his back to an enemy at 1.5 m.
      // Unreadable on a keyboard and impossible with a thumb.
      let best = null, bd = PLAYER.lockRange;
      for (const t of targets) {
        if (t.dead) continue;
        const td = Math.hypot(t.pos.x - this.pos.x, t.pos.z - this.pos.z);
        if (td < bd) { bd = td; best = t; }
      }
      if (best) this.facing = Math.atan2(best.pos.x - this.pos.x, best.pos.z - this.pos.z);
    }

    // movement, suppressed mid-swing so a hit reads as a commitment
    if (this.dodgeT <= 0) {
      const target = moving && this.attackT <= 0
        ? dir.clone().multiplyScalar(input.run ? PLAYER.run : PLAYER.walk)
        : new THREE.Vector3();
      this.vel.x = damp(this.vel.x, target.x, moving ? PLAYER.accel / 4 : PLAYER.friction, dt);
      this.vel.z = damp(this.vel.z, target.z, moving ? PLAYER.accel / 4 : PLAYER.friction, dt);
    }

    this.pos.addScaledVector(this.vel, dt);
    resolve(this.pos, PLAYER.radius, blockers);
    this.speed = Math.hypot(this.vel.x, this.vel.z);

    if (moving) this.facing = Math.atan2(dir.x, dir.z);
    this.mesh.rotation.y = damp(this.mesh.rotation.y,
      this.mesh.rotation.y + angleDelta(this.mesh.rotation.y, this.facing), PLAYER.turnLerp, dt);
    this.mesh.position.copy(this.pos);
    this.mesh.visible = !this.inVan;

    // swing animation, and the hit window in the middle of it
    const swing = this.attackT > 0 ? Math.sin((1 - this.attackT / PLAYER.attackTime) * Math.PI) : 0;
    this.blade.rotation.z = -swing * 2.2;
    this.blade.position.x = 0.3 - swing * 0.35;
    return this.attackT > 0 && this.attackT < PLAYER.attackTime * 0.7 && !this.didHit;
  }
}

function angleDelta(a, b) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export class Enemy {
  constructor(scene, x, z, kind = 'grunt') {
    this.kind = kind;
    this.S = kind === 'boss' ? BOSS : GRUNT;
    const h = kind === 'boss' ? SCALE.boss : SCALE.grunt;
    this.mesh = makeFigure(h, kind === 'boss' ? MAT.cream : MAT.metal, kind === 'boss' ? 1.15 : 1.05);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xBFE4FF, emissive: 0xBFE4FF, emissiveIntensity: 1.6 }));
    visor.position.set(0, h * 0.87, h * 0.13);
    this.mesh.add(visor); this.visor = visor;
    scene.add(this.mesh);

    this.pos = new THREE.Vector3(x, 0, z);
    this.hp = this.S.hp;
    this.state = 'idle';
    this.t = 0; this.cd = 0;
    this.dead = false;
  }

  hurt(n) {
    if (this.dead) return;
    this.hp -= n;
    if (this.hp <= 0) { this.dead = true; this.mesh.visible = false; }
  }

  /** Returns damage to deal to the player this frame, or 0. */
  update(dt, player, blockers) {
    if (this.dead) return 0;
    this.cd = Math.max(0, this.cd - dt);
    const d = Math.hypot(player.pos.x - this.pos.x, player.pos.z - this.pos.z);
    let dmg = 0;

    if (this.state === 'windup') {
      this.t -= dt;
      this.visor.material.emissiveIntensity = 3.2;
      if (this.t <= 0) {
        if (d < this.S.attackRange * 1.25 && player.alive) dmg = this.S.attackDmg;
        this.state = 'idle'; this.cd = this.S.attackCooldown;
      }
    } else {
      this.visor.material.emissiveIntensity = 1.6;
      if (d < this.S.attackRange && this.cd <= 0) {
        this.state = 'windup'; this.t = this.S.attackWindup;
      } else if (d < this.S.aggroRange && d > this.S.attackRange * 0.85) {
        const step = this.S.speed * dt;
        this.pos.x += ((player.pos.x - this.pos.x) / d) * step;
        this.pos.z += ((player.pos.z - this.pos.z) / d) * step;
        resolve(this.pos, this.S.radius, blockers);
      }
    }

    this.mesh.position.copy(this.pos);
    this.mesh.rotation.y = Math.atan2(player.pos.x - this.pos.x, player.pos.z - this.pos.z);
    // telegraph: lean back on the windup so the swing is readable
    this.mesh.rotation.x = this.state === 'windup' ? -0.18 : 0;
    return dmg;
  }
}

export class Van {
  constructor(scene) {
    this.mesh = makeVan();
    scene.add(this.mesh);
    this.pos = new THREE.Vector3(SUB.x, 0, SUB.vanZ);
    this.yaw = Math.PI;              // pointing down the road (-Z)
    this.speed = 0;
    this.mesh.position.copy(this.pos);
    this.mesh.rotation.y = this.yaw;
  }

  update(dt, input) {
    const mv = input.poll();
    const throttle = mv.y;
    if (throttle > 0.05)       this.speed += VAN.accel * throttle * dt;
    else if (throttle < -0.05) this.speed -= VAN.brake * -throttle * dt;
    this.speed -= this.speed * VAN.drag * dt;
    this.speed = clamp(this.speed, -VAN.reverseMax, VAN.maxSpeed);

    // steering authority falls off at speed so it stays controllable on a phone
    const grip = VAN.steer * (1 - Math.min(Math.abs(this.speed) / VAN.maxSpeed, 1) * VAN.steerAtSpeed);
    this.yaw -= mv.x * grip * dt * Math.sign(this.speed || 1) * Math.min(Math.abs(this.speed) / 4, 1);

    this.pos.x += Math.sin(this.yaw) * this.speed * dt;
    this.pos.z += Math.cos(this.yaw) * this.speed * dt;

    // keep it on the road
    const half = SUB.roadW / 2 - VAN.radius;
    if (this.pos.x < SUB.x - half) { this.pos.x = SUB.x - half; this.speed *= 0.7; }
    if (this.pos.x > SUB.x + half) { this.pos.x = SUB.x + half; this.speed *= 0.7; }

    this.mesh.position.copy(this.pos);
    this.mesh.rotation.y = this.yaw;
    return Math.abs(this.speed);
  }
}
