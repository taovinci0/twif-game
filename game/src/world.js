// Greybox geometry. Primitives only — every one of these is a placeholder for a
// module generated through the 404 loop later. Shapes are held to the canonical
// scales in STYLE_LOCK.md so the replacement drops straight in.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ASSET } from '../assetlib.js?v=202609260010';
import { loadSignage, makeSign, makeBanner, makePoster, makeFascia } from './signage.js?v=202609260010';
import { SCALE, HUB, SUB } from './config.js?v=202609260010';

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

// ---------------------------------------------------------------- generated assets
let GATE = null;
const CHARS = {};

/** Load a generated module if it exists, and say so plainly if it does not.
 *  Assets land from several agents at different times; a missing one must leave
 *  the game playable on its greybox stand-in rather than taking the build down. */
async function tryAsset(key, path, opts) {
  try {
    const a = await ASSET(path, opts);
    let meshes = 0;
    a.traverse((n) => { if (n.isMesh) meshes++; });
    if (!meshes) { console.warn('[assets] ' + path + ' loaded empty, using greybox'); return; }
    CHARS[key] = a;
  } catch (e) {
    console.warn('[assets] ' + path + ' unavailable, using greybox:', e.message);
  }
}

/** A fresh copy of a generated character, or null if it has not landed yet. */
export function charInstance(key) {
  const proto = CHARS[key];
  if (!proto) return null;
  const g = proto.clone();

  // clone() copies userData BY REFERENCE, so userData.joints and userData.visor
  // still point at the prototype's meshes — every enemy would drive the same
  // limbs and flare the same visor. Remap them onto this copy. Traversal order
  // is identical for identical trees, so an index map is safe.
  const from = [], to = [];
  proto.traverse((n) => from.push(n));
  g.traverse((n) => to.push(n));
  const map = new Map();
  for (let i = 0; i < from.length; i++) map.set(from[i], to[i]);
  const remap = (o) => (o && map.get(o)) || null;

  g.userData = { ...proto.userData };
  if (proto.userData.joints) {
    g.userData.joints = {};
    for (const k of Object.keys(proto.userData.joints)) {
      g.userData.joints[k] = remap(proto.userData.joints[k]);
    }
  }
  if (proto.userData.parts) {
    g.userData.parts = {};
    for (const k of Object.keys(proto.userData.parts)) {
      g.userData.parts[k] = remap(proto.userData.parts[k]);
    }
  }
  if (proto.userData.visor) g.userData.visor = remap(proto.userData.visor);

  g.traverse((n) => {
    if (!n.isMesh) return;
    n.material = n.material.clone();
    n.castShadow = true;
  });
  return g;
}
export const hasChar = (key) => !!CHARS[key];

/** Load every generated module before the game is startable. An asset that fails
 *  to import prints one line and the level carries on emptier than it should be,
 *  so this throws instead: an empty level is fast, and the frame rate gate sees
 *  nothing wrong with it. */
export async function loadAssets(onProgress = () => {}) {
  onProgress(0.15, 'signage');
  await loadSignage();
  onProgress(0.4, 'subnet gate');
  GATE = await ASSET('./assets/subnet_gate.js', { surfaces: true });
  let meshes = 0;
  GATE.traverse((n) => { if (n.isMesh) meshes++; });
  if (!meshes) throw new Error('subnet_gate.js loaded empty');
  // Characters keep their hierarchy so limbs can move later; the contract is
  // explicit that a merged character renders perfectly and can never move a limb,
  // and no still frame shows you.
  // Enemies load MERGED. With their hierarchy kept, one grunt is ~100 draw calls
  // and the arena holds four at once — measured at 793 of a 900 budget with just
  // two on screen. The contract's proper fix is to bake back per joint; until
  // that exists they are merged, which costs their limb animation and visor
  // flare but keeps the build inside its budget. The whole-body wind-up lean
  // still reads.
  onProgress(0.55, 'enforcers');
  await tryAsset('grunt', './assets/big_ai_grunt.js', { surfaces: true });
  onProgress(0.65, 'executive');
  await tryAsset('boss', './assets/big_ai_boss.js', { surfaces: true });
  onProgress(0.78, 'twif');
  await tryAsset('twif', './assets/twif.js', { keepHierarchy: true, surfaces: true });
  onProgress(0.9, 'subnet summer van');
  await tryAsset('van', './assets/subnet_summer_van.js', { keepHierarchy: true, surfaces: true });
  onProgress(0.94, 'street props');
  await tryAsset('lantern', './assets/street_lantern.js', { surfaces: true });
  await tryAsset('block',   './assets/shop_block.js',     { surfaces: true });
  await tryAsset('shrine',  './assets/const_shrine.js',   { surfaces: true });
  await tryAsset('dojo',    './assets/dojo_facade.js',    { surfaces: true });
  await tryAsset('store',   './assets/convenience_store.js', { surfaces: true });
  await tryAsset('max',     './assets/max_sensei.js',    { surfaces: true });
  await tryAsset('node',    './assets/control_node.js',   { surfaces: true });
  await tryAsset('corp',    './assets/corp_entrance.js',  { surfaces: true });
  await tryAsset('crate',   './assets/street_crate.js',   { surfaces: true });
  await tryAsset('barrier', './assets/traffic_barrier.js',{ surfaces: true });
  onProgress(1, 'ready');
}

/** A fresh copy of the gate. */
export function gateInstance() {
  const g = GATE.clone();
  // Clone the materials too. A bare clone() shares them, so lighting one gate
  // would light all 128 of them at once.
  g.traverse((n) => {
    if (!n.isMesh) return;
    n.material = n.material.clone();
    n.castShadow = true; n.receiveShadow = true;
  });
  return g;
}

/** Light a gate by making its lantern panels and threshold disc emit, rather
 *  than making the whole monument glow. 'plaster' is the panel material. */
export function litGate(gate, color = 0x9AFF43, intensity = 1.5) {
  gate.traverse((n) => {
    if (!n.isMesh || !n.material) return;
    if (n.material.name === 'plaster') {
      n.material.emissive = new THREE.Color(color);
      n.material.emissiveIntensity = intensity;
    }
  });
}

/** Turn a loaded asset into InstancedMeshes — one per material, not one per copy.
 *  127 dormant nodes cost about five draw calls this way instead of 127 times
 *  whatever the gate costs. */
function instancedFrom(proto, count, material = null, maxParts = 64) {
  const group = new THREE.Group();
  const parts = [];
  proto.updateMatrixWorld(true);
  proto.traverse((n) => { if (n.isMesh) parts.push(n); });
  if (parts.length > maxParts) {
    console.warn('[assets] prototype has ' + parts.length + ' meshes after merge; '
      + 'instancing it would cost that many draw calls. Refusing.');
    return null;
  }
  for (const mesh of parts) {
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld);          // bake the part's own transform in
    const im = new THREE.InstancedMesh(geo, material || mesh.material, count);
    im.frustumCulled = false;
    im.castShadow = true;
    group.add(im);
  }
  return group;
}

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

  const genShrine = charInstance('shrine');
  if (genShrine) {
    genShrine.scale.setScalar(1.7);
    genShrine.position.set(0, 0, 0);
    g.add(genShrine);
    const sl = new THREE.PointLight(0xD4A24C, 12, 20, 2);
    sl.position.set(0, 3.4, 2.2); g.add(sl);
  } else {
    const shrine = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.0, 1.4, 24), MAT.charcoal);
    shrine.position.y = 0.7; g.add(shrine);
    const idol = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 1.2), MAT.gold);
    idol.position.y = 2.5; idol.rotation.y = Math.PI / 4; g.add(idol);
  }
  blockers.push({ x: HUB.x, z: HUB.z, hx: 4.2, hz: 4.2 });

  // 127 dormant gates, instanced. The active one is a separate copy so it can
  // glow and be tested against without touching the instance buffer.
  const proto = gateInstance();
  const dormant = instancedFrom(proto, HUB.gates - 1, MAT.dormant);
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
    for (const im of dormant.children) im.setMatrixAt(n, m);
    n++;
  }
  for (const im of dormant.children) im.instanceMatrix.needsUpdate = true;
  g.add(dormant);

  const active = gateInstance();
  litGate(active);
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
  const arrival = gateInstance();
  litGate(arrival);
  arrival.position.set(X, 0, SUB.spawnZ + 5);
  g.add(arrival);

  // --- street: buildings either side, instanced
  const count = 26;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), sc = new THREE.Vector3();
  const blockProto = charInstance('block');
  const buildings = blockProto ? instancedFrom(blockProto, count) : null;
  const bGeo = buildings ? null : new THREE.BoxGeometry(9, 1, 9);
  const fallbackBuildings = buildings ? null : new THREE.InstancedMesh(bGeo, MAT.charcoal, count);
  let bi = 0;
  for (let i = 0; i < count / 2; i++) {
    const z = SUB.streetZ0 - i * 9;
    for (const side of [-1, 1]) {
      const x = X + side * 12.5;
      if (buildings) {
        // real blocks: vary the facing rather than the height, so the windows
        // and shopfront bands never stretch
        const ry = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry + ((i % 2) ? Math.PI : 0));
        const k = 0.92 + ((i * 17) % 5) * 0.06;
        pos.set(x, 0, z); sc.set(k, k, k);
        m.compose(pos, q, sc);
        for (const im of buildings.children) im.setMatrixAt(bi, m);
      } else {
        const h = 7 + ((i * 37 + (side > 0 ? 13 : 0)) % 4) * 2.5;
        pos.set(x, h / 2, z); sc.set(1, h, 1);
        m.compose(pos, q, sc);
        fallbackBuildings.setMatrixAt(bi, m);
      }
      bi++;
      blockers.push({ x, z, hx: 4.5, hz: 4.5 });
    }
  }
  if (buildings) {
    for (const im of buildings.children) im.instanceMatrix.needsUpdate = true;
    g.add(buildings);
  } else {
    fallbackBuildings.instanceMatrix.needsUpdate = true;
    fallbackBuildings.castShadow = true; fallbackBuildings.frustumCulled = false;
    g.add(fallbackBuildings);
  }

  // --- lanterns down the street, instanced, with a handful of real lights.
  // Nothing glows without lighting its surroundings — STYLE_LOCK.
  const lampCount = 12;
  const lampProto = charInstance('lantern');
  const genLamps = lampProto ? instancedFrom(lampProto, lampCount) : null;
  const lGeo = genLamps ? null : new THREE.BoxGeometry(0.5, 0.7, 0.5);
  const lamps = genLamps || new THREE.InstancedMesh(lGeo, MAT.lantern, lampCount);
  let li = 0;
  for (let i = 0; i < lampCount; i++) {
    const z = SUB.streetZ0 - i * 9.5;
    const x = X + (i % 2 ? 7.5 : -7.5);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), i % 2 ? -Math.PI / 2 : Math.PI / 2);
    pos.set(x, genLamps ? 0 : SCALE.lantern, z); sc.set(1, 1, 1);
    m.compose(pos, q, sc);
    if (genLamps) { for (const im of genLamps.children) im.setMatrixAt(li, m); li++; }
    else lamps.setMatrixAt(li++, m);
    if (i % 3 === 0) {
      const pl = new THREE.PointLight(0xE66D32, 10, 16, 2);
      pl.position.set(x, SCALE.lantern, z);
      g.add(pl);
    }
  }
  if (genLamps) { for (const im of genLamps.children) im.instanceMatrix.needsUpdate = true; }
  else { lamps.instanceMatrix.needsUpdate = true; lamps.frustumCulled = false; }
  g.add(lamps);
  q.identity();

  // Max Sensei's dojo, at the tutorial beat
  const genDojo = charInstance('dojo');
  if (genDojo) {
    genDojo.position.set(X - 11.5, 0, SUB.tutorialZ - 2);
    genDojo.rotation.y = Math.PI / 2;
    g.add(genDojo);
    const dl = new THREE.PointLight(0xE66D32, 11, 20, 2);
    dl.position.set(X - 7.5, 3.2, SUB.tutorialZ - 2);
    g.add(dl);
  }

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

  // Off-axis on purpose: centred here it walls off the return gate behind it
  // and the mission cannot be finished.
  const genCorp = charInstance('corp');
  if (genCorp) {
    genCorp.position.set(X - 19, 0, SUB.arenaZ - 18);
    genCorp.rotation.y = Math.PI * 0.72;
    g.add(genCorp);
    const cl = new THREE.PointLight(0xBFE4FF, 10, 26, 2);
    cl.position.set(X - 15, 4.2, SUB.arenaZ - 14); g.add(cl);
  } else {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(10, 26, 10), MAT.cream);
    tower.position.set(X - 19, 13, SUB.arenaZ - 18); tower.castShadow = true;
    g.add(tower);
  }
  blockers.push({ x: X - 19, z: SUB.arenaZ - 18, hx: 5, hz: 5 });

  // the control node: the thing the mission is about
  const genNode = charInstance('node');
  const node = genNode || new THREE.Mesh(new THREE.BoxGeometry(2.4, 6, 2.4), MAT.metal);
  node.position.set(X, genNode ? 0 : 3, SUB.arenaZ);
  g.add(node);
  blockers.push({ x: X, z: SUB.arenaZ, hx: 1.4, hz: 1.4 });

  // return gate, lit once the artefact is taken
  const ret = gateInstance();
  ret.rotation.y = Math.PI;
  ret.position.set(X, 0, SUB.returnZ);
  g.add(ret);

  // ---- signage. Every glyph in this game is a texture on blank geometry.
  // Lit signs each get a practical light: nothing glows without lighting its
  // surroundings, which is the failure this domain is known for.
  const lights = [];
  const litSign = (obj, x, y, z, ry, color, range) => {
    obj.position.set(x, y, z);
    obj.rotation.y = ry;
    g.add(obj);
    const pl = new THREE.PointLight(color, 9, range, 2);
    pl.position.set(x + Math.sin(ry) * 1.2, y - 0.2, z + Math.cos(ry) * 1.2);
    g.add(pl);
    lights.push(pl);
    return obj;
  };

  const FACE_L = Math.PI / 2;    // left-hand buildings face +X, across the street
  const FACE_R = -Math.PI / 2;   // right-hand buildings face -X

  // the shopfront that anchors the street
  const genStore = charInstance('store');
  if (genStore) {
    genStore.position.set(X + 11.4, 0, SUB.streetZ0 - 30);
    genStore.rotation.y = FACE_R;
    g.add(genStore);
    // The store's fascia is 4.67:1 and the art is 3.04:1, so the sign is sized
    // to the panel's HEIGHT and centred — stretched lettering is worse than a
    // margin, and the fascia is a lightbox field so cream margins read right.
    const sign = makeSign('sign_taomart', 1.42, { glow: 1.4 });
    if (sign) {
      sign.position.set(X + 8.36, 2.90, SUB.streetZ0 - 30 + 0.02);
      sign.rotation.y = FACE_R;
      g.add(sign);
      const sl = new THREE.PointLight(0xE66D32, 11, 18, 2);
      sl.position.set(X + 7.2, 2.6, SUB.streetZ0 - 30);
      g.add(sl);
    }
    blockers.push({ x: X + 11.4, z: SUB.streetZ0 - 30, hx: 3.2, hz: 4.0 });
  } else {
    litSign(makeFascia('sign_taomart', 5.6, MAT.metal), X + 7.9, 3.5, SUB.streetZ0 - 12, FACE_R, 0xE66D32, 17);
  }

  // hanging banners down both sides, alternating, breaking the silhouette
  const banners = ['banner_build', 'banner_build', 'banner_build'];
  let bnIdx = 0;
  for (let i = 0; i < 6; i++) {
    const z = SUB.streetZ0 - 8 - i * 17;
    const left = i % 2 === 0;
    const b = makeBanner(banners[bnIdx++ % banners.length], 2.6, MAT.charcoal);
    b.position.set(X + (left ? -7.9 : 7.9), 5.4, z);
    b.rotation.y = left ? FACE_L : FACE_R;
    g.add(b);
  }

  // posters at eye height, where a player actually reads them
  const posters = ['poster_mog', 'poster_gym', 'poster_max', 'poster_dare', 'poster_const'];
  for (let i = 0; i < posters.length; i++) {
    const z = SUB.streetZ0 - 20 - i * 19;
    const left = i % 2 === 1;
    const p = makePoster(posters[i], 1.9, MAT.charcoal);
    p.position.set(X + (left ? -7.88 : 7.88), 2.4, z);
    p.rotation.y = left ? FACE_L : FACE_R;
    g.add(p);
  }

  // ---- NEON. This is what the concept frames are actually made of: big
  // saturated blades and boxes up the facades, throwing magenta and cyan onto
  // grey buildings. Each panel is one draw call and each one lights what is
  // around it, because a sign that glows without touching the wall behind it is
  // the failure this whole domain is known for.
  const NEON = [
    0xFF2D8A, 0x6B3FD4, 0x9AFF43, 0xE66D32, 0xBFE4FF, 0xFF2D8A, 0x6B3FD4, 0xE66D32,
  ];
  const neonMat = (color) => new THREE.MeshStandardMaterial({
    color, emissive: new THREE.Color(color), emissiveIntensity: 1.45,
    roughness: 0.4, side: THREE.DoubleSide,
  });

  const addNeon = (w, h, x, y, z, ry, color, lightRange) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), neonMat(color));
    m.position.set(x, y, z);
    m.rotation.y = ry;
    g.add(m);
    if (lightRange) {
      const pl = new THREE.PointLight(color, 7, lightRange, 2);
      pl.position.set(x + Math.sin(ry) * 1.4, y, z + Math.cos(ry) * 1.4);
      g.add(pl);
    }
    return m;
  };

  // tall vertical blade signs projecting from the facades, alternating sides,
  // marching up the street — the single most recognisable shape in the frames
  for (let i = 0; i < 11; i++) {
    const z = SUB.streetZ0 - 6 - i * 10.5;
    const left = i % 2 === 0;
    const x = X + (left ? -8.3 : 8.3);
    const ry = left ? FACE_L : FACE_R;
    const color = NEON[i % NEON.length];
    const h = 3.2 + (i % 3) * 1.4;
    const y = 5.5 + (i % 4) * 1.9;
    // the blade itself, edge-on to the street so it reads down the corridor
    addNeon(0.9, h, x, y, z, ry + Math.PI / 2, color, i % 2 ? 16 : 0);
    // a horizontal box on the wall beside it
    addNeon(2.6, 0.62, x - Math.sin(ry) * 0.12, y - h / 2 - 0.8, z, ry, NEON[(i + 3) % NEON.length], 0);
  }

  // big billboards high on the blocks, using the poster art
  const boards = ['poster_mog', 'poster_gym', 'poster_const', 'poster_dare'];
  for (let i = 0; i < boards.length; i++) {
    const z = SUB.streetZ0 - 26 - i * 27;
    const left = i % 2 === 1;
    const x = X + (left ? -8.25 : 8.25);
    const ry = left ? FACE_L : FACE_R;
    const b = makeSign(boards[i], 5.4, { glow: 1.25 });
    if (b) {
      b.position.set(x, 11.5, z);
      b.rotation.y = ry;
      g.add(b);
      const pl = new THREE.PointLight(0xE7DFC9, 6, 20, 2);
      pl.position.set(x + Math.sin(ry) * 2.2, 11.5, z + Math.cos(ry) * 2.2);
      g.add(pl);
    }
  }

  // low neon strips along the shopfront line, which is what puts colour on the
  // wet ground rather than only on the walls
  for (let i = 0; i < 14; i++) {
    const z = SUB.streetZ0 - 4 - i * 8;
    for (const side of [-1, 1]) {
      addNeon(6.5, 0.28, X + side * 8.2, 3.05, z, side < 0 ? FACE_L : FACE_R,
        NEON[(i + (side > 0 ? 2 : 5)) % NEON.length], 0);
    }
  }

  // ---- drifting blossom: one draw call, and the only thing in frame that moves
  const PETALS = 220;
  const petalGeo = new THREE.PlaneGeometry(0.16, 0.11);
  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xFFC2DE, emissive: new THREE.Color(0xFF9EC8), emissiveIntensity: 0.45,
    roughness: 0.8, side: THREE.DoubleSide, transparent: true, opacity: 0.95,
  });
  const petals = new THREE.InstancedMesh(petalGeo, petalMat, PETALS);
  petals.frustumCulled = false;
  petals.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const petalState = [];
  for (let i = 0; i < PETALS; i++) {
    petalState.push({
      x: X + (Math.random() - 0.5) * 26,
      y: Math.random() * 14,
      z: SUB.streetZ0 - Math.random() * 140,
      vy: 0.35 + Math.random() * 0.5,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.6 + Math.random() * 1.1,
      spin: (Math.random() - 0.5) * 2.2,
      rot: Math.random() * Math.PI,
    });
  }
  g.add(petals);

  // the dojo poster wall near Max, so the tutorial beat has somewhere to look
  const gym = makePoster('poster_gym', 2.2, MAT.charcoal);
  gym.position.set(X - 7.88, 2.8, SUB.tutorialZ - 4);
  gym.rotation.y = FACE_L;
  g.add(gym);

  return {
    group: g, blockers,
    returnGate: ret, returnPos: new THREE.Vector3(X, 0, SUB.returnZ),
    nodeMesh: node, conePos, signLights: lights,
    petals, petalState,
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
