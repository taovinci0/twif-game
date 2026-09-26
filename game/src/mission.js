// The mission. Every transition is a named checkpoint, recorded and exposed on
// __GAME__, because transitions are the part of this game no generic gate reaches.
import * as THREE from 'three';
import { SUB, HUB, SCALE, PLAYER } from './config.js?v=202609260010';
import { Enemy } from './entities.js?v=202609260010';
import { makeFigure, charInstance, litGate, MAT } from './world.js?v=202609260010';

export const STAGES = [
  'hub', 'arrive', 'tutorial', 'street', 'van', 'drive', 'arena', 'artefact', 'return', 'complete',
];

export class Mission {
  constructor(scene, hub, sub, player, van) {
    this.scene = scene; this.hub = hub; this.sub = sub;
    this.player = player; this.van = van;
    this.stage = 'hub';
    this.checkpoints = [];
    this.enemies = [];
    this.group = [];
    this.arenaPhase = 1;
    this.nodes = 0;
    this.objective = 'Enter the active node';
    this.prompt = '';
    this.t = 0;
    this.done = false;

    this.max = charInstance('max') || makeFigure(SCALE.npc, MAT.timber);
    this.max.position.set(SUB.x, 0, SUB.tutorialZ);
    this.max.visible = false;
    scene.add(this.max);

    this.artefact = new THREE.Mesh(new THREE.OctahedronGeometry(0.6), MAT.artefact);
    this.artefact.position.set(SUB.x, 1.6, SUB.arenaZ);
    this.artefact.visible = false;
    scene.add(this.artefact);

    this.artefactLight = new THREE.PointLight(0x9AFF43, 0, 18, 2);
    this.artefactLight.position.copy(this.artefact.position);
    scene.add(this.artefactLight);
  }

  /** Where the objective currently is, in metres. Telemetry for the gate. */
  waypoint() {
    const X = SUB.x;
    // mid-fight the objective IS the nearest live enemy
    if (this.liveEnemies > 0 && (this.stage === 'tutorial' || this.stage === 'arena')) {
      let best = null, bd = Infinity;
      for (const e of this.group) {
        if (e.dead) continue;
        const dd = Math.hypot(e.pos.x - this.player.pos.x, e.pos.z - this.player.pos.z);
        if (dd < bd) { bd = dd; best = e; }
      }
      if (best) return [best.pos.x, best.pos.z];
    }
    switch (this.stage) {
      case 'hub':      return [this.hub.activePos.x, this.hub.activePos.z];
      case 'arrive':
      case 'tutorial': return [X, SUB.tutorialZ];
      case 'street':   return [this.van.pos.x, this.van.pos.z];
      case 'drive':    return [X, SUB.roadZ1];
      case 'arena':    return [X, SUB.arenaZ];
      case 'artefact': return [X, SUB.arenaZ];
      case 'return':   return [this.sub.returnPos.x, this.sub.returnPos.z];
      default:          return null;
    }
  }

  go(stage) {
    if (this.stage === stage) return;
    this.stage = stage;
    this.t = 0;
    this.checkpoints.push({ stage, at: +(performance.now() / 1000).toFixed(2) });
  }

  /** Begin a new encounter. Objectives count THIS group only — enemies left
   *  alive somewhere else (the street grunts you drove past) must never be able
   *  to hold the arena objective open from 350 m away. */
  encounter() { this.group = []; }

  spawn(x, z, kind = 'grunt') {
    const e = new Enemy(this.scene, x, z, kind);
    this.enemies.push(e);
    this.group.push(e);
    return e;
  }

  get liveEnemies() { return this.group.filter((e) => !e.dead).length; }
  get groupSize() { return this.group.length; }

  /** Returns a toast string when something notable happens, else ''. */
  update(dt, input, world) {
    this.t += dt;
    const p = this.player;
    const d = (x, z) => Math.hypot(p.pos.x - x, p.pos.z - z);
    let toast = '';
    this.prompt = '';

    switch (this.stage) {
      case 'hub': {
        this.objective = 'Enter the active node';
        const a = this.hub.activePos;
        if (d(a.x, a.z) < 3.2) {
          this.go('arrive');
          p.teleport(SUB.x, SUB.spawnZ, Math.PI);
          world.show('sub');
          toast = 'SUBNET ONE';
        }
        break;
      }
      case 'arrive': {
        this.objective = 'Find Max Sensei';
        this.max.visible = true;
        if (this.t > 1.2) this.go('tutorial');
        break;
      }
      case 'tutorial': {
        this.objective = 'Find Max Sensei';
        const pastMax = p.pos.z <= SUB.tutorialZ + 6;
        if ((d(SUB.x, SUB.tutorialZ) < 7 || pastMax) && this.enemies.length === 0) {
          this.encounter();
          this.spawn(SUB.x - 4, SUB.tutorialZ - 8);
          this.spawn(SUB.x + 4, SUB.tutorialZ - 11);
          toast = 'ENFORCERS INBOUND';
        }
        if (this.groupSize) {
          this.objective = `Defeat the enforcers  ${this.groupSize - this.liveEnemies}/${this.groupSize}`;
          if (this.liveEnemies === 0) { this.go('street'); toast = 'STREET CLEAR'; }
        }
        break;
      }
      case 'street': {
        this.objective = 'Reach the Subnet Summer van';
        if (this.enemies.length === 2) {
          this.encounter();                       // optional street pressure
          this.spawn(SUB.x - 5, SUB.streetZ0 - 40);
          this.spawn(SUB.x + 5, SUB.streetZ0 - 72);
        }
        if (d(this.van.pos.x, this.van.pos.z) < 4.5) {
          this.prompt = input.isTouch ? 'ACT  to drive' : 'E  to drive';
          if (input.take('action')) {
            this.go('drive'); p.inVan = true;
            p.hp = PLAYER.hp;            // the van is the midpoint checkpoint
            toast = 'SUBNET SUMMER';
          }
        }
        break;
      }
      case 'drive': {
        this.objective = 'Drive to the control node';
        if (this.van.pos.z < SUB.roadZ1 + 6) {
          this.go('arena');
          p.inVan = false;
          p.teleport(this.van.pos.x, this.van.pos.z - 4, Math.PI);
          this.encounter();
          this.arenaPhase = 1;
          this.spawn(SUB.x - 8, SUB.arenaZ + 12);
          this.spawn(SUB.x + 8, SUB.arenaZ + 12);
          this.spawn(SUB.x, SUB.arenaZ + 16);
          toast = 'ENFORCERS';
        }
        break;
      }
      case 'arena': {
        if (this.liveEnemies > 0) {
          this.objective = this.arenaPhase === 1
            ? `Clear the enforcers  ${this.groupSize - this.liveEnemies}/${this.groupSize}`
            : 'Defeat the executive controller';
          break;
        }
        if (this.arenaPhase === 1) {
          // The boss arrives only once the floor is clear. Four at once is
          // unreadable, and unwinnable without kiting no player will discover
          // on a phone in a five minute slice.
          this.arenaPhase = 2;
          this.encounter();
          this.spawn(SUB.x, SUB.arenaZ - 8, 'boss');
          p.hp = Math.min(PLAYER.hp, p.hp + 40);
          toast = 'THE NETWORK OBEYS';
          this.objective = 'Defeat the executive controller';
          break;
        }
        {
          this.go('artefact');
          this.artefact.visible = true;
          this.artefactLight.intensity = 16;
          toast = 'NODE DISRUPTED';
        }
        break;
      }
      case 'artefact': {
        this.objective = 'Take the subnet artefact';
        this.artefact.rotation.y += dt * 1.6;
        this.artefact.position.y = 1.6 + Math.sin(this.t * 2) * 0.18;
        if (d(SUB.x, SUB.arenaZ) < 3.0) {
          this.go('return');
          this.artefact.visible = false;
          this.artefactLight.intensity = 0;
          litGate(this.sub.returnGate);
          toast = 'ARTEFACT SECURED';
        }
        break;
      }
      case 'return': {
        this.objective = 'Return to the hub';
        if (d(this.sub.returnPos.x, this.sub.returnPos.z) < 3.5) {
          this.go('complete');
          this.nodes = 1;
          world.show('hub');
          p.teleport(HUB.x + HUB.ringRadius - 4, HUB.z, Math.PI);
          litGate(this.hub.activeMesh);
          this.done = true;
          toast = '1 / 128 COMPLETE';
        }
        break;
      }
      case 'complete': {
        this.objective = 'Subnet One complete';
        break;
      }
    }
    return toast;
  }
}
