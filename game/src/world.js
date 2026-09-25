// Greybox geometry. Primitives only — every one of these is a placeholder for a
// module generated through the 404 loop later. Shapes are held to the canonical
// scales in STYLE_LOCK.md so the replacement drops straight in.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SCALE, HUB, SUB } from './config.js';

const M = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.82, ...opts });

export const MAT = {
  ground:  M(0x14171a, { roughness: 0.95 }),
  road:    M(0x101315, { roughness: 0.7 }),
  stone:   M(0x8C816F),
  charcoal:M(0x111315),
  timber:  M(0x5a4632),
  metal:   M(0x3A3F46, { roughness: 0.45, metalness: 0.5 }),
  cream:   M(0xE7DFC9),
  gold:    M(0xD4A24C, { roughness: 0.4, metalness: 0.6 }),
  teal:    M(0x1C7B74),
  dormant: M(0x2a2f36, { roughness: 0.6 }),
  active:  M(0x9AFF43, { emissive: 0x9AFF43, emissiveIntensity: 1.2 }),
  lantern: M(0xE66D32, { emissive: 0xE66D32, emissiveIntensity: 1.5 }),
  artefact:M(0x9AFF43, { emissive: 0x9AFF43, emissiveIntensity: 2.0 }),
};

/** One gate, 5.5 m tall (canon). Two posts and a lintel, merged so a ring of
 *  128 of them is a single InstancedMesh and a single draw call. */
function gateGeometry() {
  const h = SCALE.gate, w = 3.6, t = 0.42;
  const post = new THREE.BoxGeometry(t, h, t);
  const l = post.clone(); l.translate(-w / 2, h / 2, 0);
  const r = post.clone(); r.translate( w / 2, h / 2, 0);
  const top = new THREE.BoxGeometry(w + t * 2.4, t * 1.5, t);
  top.translate(0, h - t * 0.75, 0);
  const g = mergeGeometries([l, r, top]);
  post.dispose();
  return g;
}

/** THE HUB — 128 nodes in a ring, one active. */
export function buildHub() {
  const g = new THREE.Group();
  const blockers = [];

  const plat = new THREE.Mesh(new THREE.CylinderGeometry(HUB.radius, HUB.radius, 1, 48), MAT.stone);
  plat.position.y = -0.5; plat.receiveShadow = true; g.add(plat);

  const shrine = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.0, 1.4, 24), MAT.charcoal);
  shrine.position.y = 0.7; g.add(shrine);
  const idol = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 1.2), MAT.gold);
  idol.position.y = 2.5; idol.rotation.y = Math.PI / 4; g.add(idol);
  blockers.push({ x: HUB.x, z: HUB.z, hx: 4.2, hz: 4.2 });

  // 127 dormant gates, instanced. The active one is a separate mesh so it can
  // glow and be tested against without touching the instance buffer.
  const geo = gateGeometry();
  const dormant = new THREE.InstancedMesh(geo, MAT.dormant, HUB.gates - 1);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1);
  const v = new THREE.Vector3();
  let n = 0;
  let activePos = new THREE.Vector3();
  for (let i = 0; i < HUB.gates; i++) {
    const a = (i / HUB.gates) * Math.PI * 2;
    const x = HUB.x + Math.cos(a) * HUB.ringRadius;
    const z = HUB.z + Math.sin(a) * HUB.ringRadius;
    if (i === HUB.activeIndex) { activePos.set(x, 0, z); continue; }
    v.set(x, 0, z);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a + Math.PI / 2);
    m.compose(v, q, s);
    dormant.setMatrixAt(n++, m);
  }
  dormant.instanceMatrix.needsUpdate = true;
  dormant.frustumCulled = false;
  g.add(dormant);

  const active = new THREE.Mesh(geo, MAT.active);
  active.position.copy(activePos);
  active.rotation.y = -(HUB.activeIndex / HUB.gates) * Math.PI * 2 + Math.PI / 2;
  g.add(active);

  const glow = new THREE.PointLight(0x9AFF43, 18, 22, 2);
  glow.position.set(activePos.x, 2.4, activePos.z);
  g.add(glow);

  return { group: g, blockers, activePos, activeMesh: active };
}

/** SUBNET ONE — arrival, tutorial, street, road, arena. */
export function buildSubnet() {
  const g = new THREE.Group();
  const blockers = [];
  const X = SUB.x;

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 640), MAT.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(X, 0, (SUB.spawnZ + SUB.returnZ) / 2);
  ground.receiveShadow = true;
  g.add(ground);

  // arrival gate, behind the player
  const gateGeo = gateGeometry();
  const arrival = new THREE.Mesh(gateGeo, MAT.active);
  arrival.position.set(X, 0, SUB.spawnZ + 5);
  g.add(arrival);

  // --- street: buildings either side, instanced
  const bGeo = new THREE.BoxGeometry(9, 1, 9);
  const count = 26;
  const buildings = new THREE.InstancedMesh(bGeo, MAT.charcoal, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), sc = new THREE.Vector3();
  let bi = 0;
  for (let i = 0; i < count / 2; i++) {
    const z = SUB.streetZ0 - i * 9;
    for (const side of [-1, 1]) {
      const h = 7 + ((i * 37 + (side > 0 ? 13 : 0)) % 4) * 2.5;
      const x = X + side * 12.5;
      pos.set(x, h / 2, z); sc.set(1, h, 1);
      m.compose(pos, q, sc);
      buildings.setMatrixAt(bi++, m);
      blockers.push({ x, z, hx: 4.5, hz: 4.5 });
    }
  }
  buildings.instanceMatrix.needsUpdate = true;
  buildings.castShadow = true; buildings.frustumCulled = false;
  g.add(buildings);

  // --- lanterns down the street, instanced, with a handful of real lights.
  // Nothing glows without lighting its surroundings — STYLE_LOCK.
  const lGeo = new THREE.BoxGeometry(0.5, 0.7, 0.5);
  const lampCount = 12;
  const lamps = new THREE.InstancedMesh(lGeo, MAT.lantern, lampCount);
  let li = 0;
  for (let i = 0; i < lampCount; i++) {
    const z = SUB.streetZ0 - i * 9.5;
    const x = X + (i % 2 ? 7.5 : -7.5);
    pos.set(x, SCALE.lantern, z); sc.set(1, 1, 1);
    m.compose(pos, q, sc); lamps.setMatrixAt(li++, m);
    if (i % 3 === 0) {
      const pl = new THREE.PointLight(0xE66D32, 10, 16, 2);
      pl.position.set(x, SCALE.lantern, z);
      g.add(pl);
    }
  }
  lamps.instanceMatrix.needsUpdate = true; lamps.frustumCulled = false;
  g.add(lamps);

  // --- road
  const road = new THREE.Mesh(new THREE.PlaneGeometry(SUB.roadW, SUB.roadZ0 - SUB.roadZ1), MAT.road);
  road.rotation.x = -Math.PI / 2;
  road.position.set(X, 0.02, (SUB.roadZ0 + SUB.roadZ1) / 2);
  g.add(road);

  // barriers along the road edges keep the van on it
  const barGeo = new THREE.BoxGeometry(0.6, 1.0, 6);
  const barCount = Math.floor((SUB.roadZ0 - SUB.roadZ1) / 6) * 2;
  const bars = new THREE.InstancedMesh(barGeo, MAT.metal, barCount);
  let ri = 0;
  for (let z = SUB.roadZ0; z > SUB.roadZ1 && ri < barCount - 1; z -= 6) {
    for (const side of [-1, 1]) {
      pos.set(X + side * (SUB.roadW / 2 + 0.4), 0.5, z); sc.set(1, 1, 1);
      m.compose(pos, q, sc); bars.setMatrixAt(ri++, m);
    }
  }
  bars.instanceMatrix.needsUpdate = true; bars.frustumCulled = false;
  g.add(bars);

  // obstacles to dodge while driving
  const coneGeo = new THREE.ConeGeometry(0.5, 1.1, 8);
  const cones = new THREE.InstancedMesh(coneGeo, MAT.lantern, 16);
  const conePos = [];
  for (let i = 0; i < 16; i++) {
    const z = SUB.roadZ0 - 25 - i * 22;
    const x = X + ((i % 3) - 1) * 4.4;
    pos.set(x, 0.55, z); sc.set(1, 1, 1);
    m.compose(pos, q, sc); cones.setMatrixAt(i, m);
    conePos.push({ x, z });
  }
  cones.instanceMatrix.needsUpdate = true; cones.frustumCulled = false;
  g.add(cones);

  // --- arena
  const arena = new THREE.Mesh(new THREE.CylinderGeometry(SUB.arenaR, SUB.arenaR, 0.6, 40), MAT.stone);
  arena.position.set(X, -0.3, SUB.arenaZ); arena.receiveShadow = true;
  g.add(arena);

  const tower = new THREE.Mesh(new THREE.BoxGeometry(10, 26, 10), MAT.cream);
  // Off-axis on purpose: centred here it walls off the return gate behind it
  // and the mission cannot be finished.
  tower.position.set(X - 19, 13, SUB.arenaZ - 18); tower.castShadow = true;
  g.add(tower);
  blockers.push({ x: X - 19, z: SUB.arenaZ - 18, hx: 5, hz: 5 });

  // the control node: the thing the mission is about
  const node = new THREE.Mesh(new THREE.BoxGeometry(2.4, 6, 2.4), MAT.metal);
  node.position.set(X, 3, SUB.arenaZ);
  g.add(node);
  blockers.push({ x: X, z: SUB.arenaZ, hx: 1.4, hz: 1.4 });

  // return gate, lit once the artefact is taken
  const ret = new THREE.Mesh(gateGeo, MAT.dormant);
  ret.position.set(X, 0, SUB.returnZ);
  g.add(ret);

  return {
    group: g, blockers,
    returnGate: ret, returnPos: new THREE.Vector3(X, 0, SUB.returnZ),
    nodeMesh: node, conePos,
  };
}

/** Greybox stand-ins. Proportioned to canon so generated modules drop in later. */
export function makeFigure(height, colorMat, bulk = 1) {
  const g = new THREE.Group();
  const bodyH = height * 0.62, headR = height * 0.13;
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(height * 0.17 * bulk, bodyH - height * 0.17 * 2, 4, 8), colorMat);
  body.position.y = height * 0.42; body.castShadow = true;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 10, 8), colorMat);
  head.position.y = height * 0.86; head.castShadow = true;
  g.add(head);
  return g;
}

export function makeVan() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(SCALE.vanW, SCALE.vanH * 0.72, SCALE.vanL), MAT.teal);
  body.position.y = SCALE.vanH * 0.52; body.castShadow = true;
  g.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(SCALE.vanW * 0.92, 0.28, SCALE.vanL * 0.62), MAT.cream);
  roof.position.y = SCALE.vanH * 0.92;
  g.add(roof);
  const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 10);
  for (const [dx, dz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const w = new THREE.Mesh(wheelGeo, MAT.charcoal);
    w.rotation.z = Math.PI / 2;
    w.position.set(dx * SCALE.vanW * 0.52, 0.34, dz * SCALE.vanL * 0.32);
    g.add(w);
  }
  return g;
}

/** The objective marker: a beam you can see across the district and a ring on
 *  the ground under it. Two draw calls, unlit, no shadow — this is wayfinding,
 *  not lighting. Without it the hub is 128 near-identical gates and the player
 *  is told what to do but never where. */
export function makeBeacon() {
  const g = new THREE.Group();
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x9AFF43, transparent: true, opacity: 0.16,
    side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.4, 60, 10, 1, true), beamMat);
  beam.position.y = 30;
  g.add(beam);

  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x9AFF43, transparent: true, opacity: 0.5,
    side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.4, 28), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.06;
  g.add(ring);

  g.userData.pulse = (t) => {
    const k = 0.5 + Math.sin(t * 2.4) * 0.5;
    ring.scale.setScalar(1 + k * 0.22);
    ringMat.opacity = 0.34 + k * 0.3;
    beamMat.opacity = 0.11 + k * 0.09;
  };
  return g;
}
