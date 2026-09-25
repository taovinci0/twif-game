// TWIF — candidate A. Primitive assembly: boxes, cylinders, cones, spheres.
// Cloak = three tiers of deliberate flat panels, each finished with a few
// pointed cone shards for the ragged hem. No glyphs: the hanging tag and the
// shoulder plate are blank geometry for the game layer to texture.
export default function (THREE) {
  const g = new THREE.Group();

  const MAT = (color, roughness, name, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, ...extra });
    m.name = name;
    return m;
  };
  const CLOAK = MAT(0x080A0B, 0.95, 'fabric');
  const HOODM = MAT(0x080A0B, 0.95, 'fabric', { side: THREE.DoubleSide });
  const TUNIC = MAT(0x111315, 0.92, 'fabric');
  const WRAP  = MAT(0xE7DFC9, 0.88, 'fabric');
  const CREAM = MAT(0xE7DFC9, 0.86, 'fabric');
  const FUR   = MAT(0xE66D32, 0.90, 'fabric');
  const STRAP = MAT(0xD4A24C, 0.62, 'fabric');
  const STEEL = MAT(0x3A3F46, 0.30, 'metal', { metalness: 0.8 });
  const GOLD  = MAT(0xD4A24C, 0.32, 'metal', { metalness: 0.8 });
  const EYE   = MAT(0x9AFF43, 0.28, 'metal', { emissive: 0x9AFF43, emissiveIntensity: 1.0 });
  const NOSE  = MAT(0x080A0B, 0.42, 'plaster');

  const add = (p, geo, mat, px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(px, py, pz);
    m.rotation.set(rx, ry, rz);
    p.add(m);
    return m;
  };
  const node = (p, x = 0, y = 0, z = 0) => { const n = new THREE.Group(); n.position.set(x, y, z); p.add(n); return n; };
  const box  = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl  = (rt, rb, h, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph  = (r, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const cone = (r, h, s = 4) => new THREE.ConeGeometry(r, h, s);

  const root = node(g);
  const joints = {};

  // ---------------------------------------------------------------- skeleton
  const HIP = 0.80, KNEE = 0.45, ANKLE = 0.13;
  const SHO = 1.18, ELBOW = 0.90, WRIST = 0.64;

  const hips = node(root, 0, HIP, 0);
  joints.hips = hips;

  // ------------------------------------------------------------------- legs
  const leg = (side) => {                       // side: +1 is TWIF's left (+X)
    const up = node(hips, side * 0.125, 0, 0);
    add(up, cyl(0.110, 0.100, HIP - KNEE, 8), CLOAK, 0, -(HIP - KNEE) / 2, 0);
    const lo = node(up, 0, -(HIP - KNEE), 0);
    add(lo, cyl(0.100, 0.072, 0.18, 8), TUNIC, 0, -0.09, 0);          // hakama cuff
    add(lo, cyl(0.074, 0.068, 0.15, 8), WRAP, 0, -0.245, 0);          // bandaged ankle
    for (let i = 0; i < 3; i++) add(lo, cyl(0.080, 0.080, 0.022, 8), CREAM, 0, -0.195 - i * 0.05, 0);
    const paw = node(lo, 0, -(KNEE - ANKLE), 0);
    add(paw, box(0.135, 0.085, 0.20), CREAM, 0, -0.085, 0.030);
    add(paw, cyl(0.067, 0.067, 0.135, 8), CREAM, 0, -0.085, 0.130, Math.PI / 2, 0, Math.PI / 2).scale.z = 0.62;
    for (let t = -1; t <= 1; t++) add(paw, sph(0.033, 6, 4), CREAM, t * 0.042, -0.082, 0.150);
    add(paw, box(0.095, 0.055, 0.065), FUR, 0, -0.030, -0.062);       // heel tuft
    return { up, lo };
  };
  const L = leg(1), R = leg(-1);
  joints.leftUpperLeg = L.up; joints.leftLowerLeg = L.lo;
  joints.rightUpperLeg = R.up; joints.rightLowerLeg = R.lo;

  // ------------------------------------------------------------------ torso
  const chest = node(hips, 0, SHO - HIP, 0);
  joints.chest = chest;
  add(chest, box(0.34, 0.24, 0.25), TUNIC, 0, -0.32, 0);              // hakama top
  add(chest, box(0.36, 0.12, 0.27), CLOAK, 0, -0.21, 0);              // obi sash
  add(chest, box(0.375, 0.05, 0.285), STRAP, 0, -0.255, 0);           // belt
  add(chest, box(0.09, 0.07, 0.04), STEEL, 0, -0.255, 0.150);         // buckle
  add(chest, cyl(0.185, 0.170, 0.34, 10), TUNIC, 0, -0.11, 0).scale.z = 0.74;
  add(chest, box(0.40, 0.14, 0.24), TUNIC, 0, 0.00, 0);               // shoulder mass
  for (const s of [-1, 1]) {                                          // crossed harness
    add(chest, box(0.045, 0.45, 0.03), STRAP, 0, -0.09, 0.125, 0, 0, s * 0.52);
    add(chest, box(0.045, 0.40, 0.03), STRAP, 0, -0.09, -0.125, 0, 0, s * 0.52);
  }
  add(chest, box(0.07, 0.07, 0.035), STEEL, 0, -0.08, 0.135);
  add(chest, box(0.015, 0.11, 0.11), CLOAK, -0.205, -0.03, 0.02);     // blank shoulder plate

  // ------------------------------------------------------------------- arms
  const arm = (side) => {
    const up = node(chest, side * 0.210, -0.01, 0);
    up.rotation.z = -side * 0.11;
    add(up, cyl(0.088, 0.074, SHO - ELBOW, 8), CLOAK, 0, -(SHO - ELBOW) / 2, 0);
    add(up, sph(0.095, 8, 6), CLOAK, 0, 0.01, 0);
    const lo = node(up, 0, -(SHO - ELBOW), 0);
    add(lo, cyl(0.070, 0.064, ELBOW - WRIST, 8), WRAP, 0, -(ELBOW - WRIST) / 2, 0);
    for (let i = 0; i < 3; i++) add(lo, cyl(0.076, 0.076, 0.020, 8), CREAM, 0, -0.05 - i * 0.07, 0);
    add(lo, sph(0.080, 8, 6), CREAM, 0, -(ELBOW - WRIST) - 0.03, 0.01).scale.set(1, 1.05, 0.9);
    for (let t = -1; t <= 1; t++) add(lo, sph(0.030, 6, 4), CREAM, t * 0.038, -(ELBOW - WRIST) - 0.085, 0.032);
    return { up, lo };
  };
  const LA = arm(1), RA = arm(-1);
  joints.leftUpperArm = LA.up; joints.leftLowerArm = LA.lo;
  joints.rightUpperArm = RA.up; joints.rightLowerArm = RA.lo;

  // ------------------------------------------------------------------ cloak
  // A deliberate small set of flat panels in three tiers, each finished with a
  // few pointed shards. Not a cone, not fifty rags.
  const tier = (parent, y, radius, w, h, count, tilt, shards, phase = 0) => {
    const bottomY = -h / 2 - (h / 2) * Math.cos(tilt);
    const bottomZ = radius + (h / 2) * Math.sin(tilt);
    for (let i = 0; i < count; i++) {
      const piv = node(parent, 0, y, 0);
      piv.rotation.y = phase + (i / count) * Math.PI * 2;
      const panel = add(piv, box(w, h, 0.035), CLOAK, 0, -h / 2, radius);
      panel.rotation.x = -tilt;
      for (let s = 0; s < shards; s++) {
        const sx = (shards === 1 ? 0 : (s / (shards - 1) - 0.5)) * w * 0.62;
        const sh = 0.09 + ((s + i) % 3) * 0.075;
        const c = add(piv, cone(w * 0.30, sh, 3), CLOAK,
          sx, bottomY - (sh / 2) * Math.cos(tilt) + 0.012, bottomZ + (sh / 2) * Math.sin(tilt));
        c.rotation.set(Math.PI - tilt, 0, 0);
        c.scale.set(1, 1, 0.45);
      }
    }
  };
  const cloak = node(hips, 0, 0, 0);
  tier(cloak, 0.22, 0.185, 0.30, 0.42, 8, 0.26, 3);          // long skirt, 1.02 -> 0.58
  tier(cloak, 0.10, 0.215, 0.26, 0.18, 6, 0.34, 2, 0.4);     // mid layer,  0.90 -> 0.72
  const cape = node(chest, 0, 0.05, 0);
  tier(cape, 0, 0.170, 0.26, 0.27, 7, 0.44, 2);              // shoulder cape, 1.23 -> 0.96

  // ------------------------------------------------------------------- head
  const head = node(chest, 0, 0.10, 0);
  joints.head = head;
  const HY = 1.38 - (SHO + 0.10);     // head centre, in head-local space
  add(head, cyl(0.090, 0.105, 0.10, 8), FUR, 0, HY - 0.16, 0);                // neck ruff
  add(head, sph(0.155, 12, 9), FUR, 0, HY, -0.005);                           // skull
  // muzzle, pushed well clear of the hood opening
  add(head, box(0.110, 0.090, 0.115), CREAM, 0, HY - 0.040, 0.150);
  add(head, sph(0.058, 8, 6), CREAM, 0, HY - 0.035, 0.200).scale.set(1.05, 0.88, 0.9);
  add(head, sph(0.027, 6, 5), NOSE, 0, HY + 0.000, 0.230).scale.set(1.2, 0.85, 0.8);
  add(head, box(0.150, 0.085, 0.095), TUNIC, 0, HY - 0.120, 0.105);           // face wrap
  for (const s of [-1, 1]) {
    add(head, sph(0.036, 8, 6), EYE, s * 0.063, HY + 0.048, 0.126, 0, 0, s * 0.33).scale.set(1.05, 0.6, 0.55);
    add(head, box(0.082, 0.024, 0.032), FUR, s * 0.063, HY + 0.080, 0.130, 0, 0, s * 0.28);
    add(head, sph(0.052, 7, 5), FUR, s * 0.110, HY - 0.025, 0.085).scale.set(0.85, 1.1, 0.85);  // cheek ruff
  }
  // ears, pushing up through the hood
  for (const s of [-1, 1]) {
    add(head, cone(0.062, 0.20, 4), FUR, s * 0.088, HY + 0.140, -0.005, 0, Math.PI / 4, s * 0.22).scale.z = 0.72;
    add(head, cone(0.038, 0.13, 4), CLOAK, s * 0.088, HY + 0.145, 0.022, 0, Math.PI / 4, s * 0.22).scale.z = 0.60;
  }
  // hood: an open shell set back off the face, plus the two peaks the ears lift
  const hood = new THREE.Mesh(
    new THREE.SphereGeometry(0.215, 14, 10, Math.PI / 2 + 0.95, Math.PI * 2 - 1.90, 0, Math.PI * 0.80),
    HOODM
  );
  hood.position.set(0, HY + 0.020, -0.055);
  head.add(hood);
  for (const s of [-1, 1]) {
    add(head, cone(0.086, 0.26, 4), CLOAK, s * 0.092, HY + 0.143, -0.050, 0, Math.PI / 4, s * 0.24).scale.z = 0.86;
  }
  // ragged hood brim around the face opening
  for (let i = 0; i < 5; i++) {
    const a = -1.00 + i * 0.50;
    add(head, box(0.075, 0.055, 0.075), CLOAK,
      Math.sin(a) * 0.200, HY - 0.060 + Math.cos(a) * 0.035, Math.cos(a) * 0.185 - 0.050, 0, a, 0);
  }

  // ------------------------------------------------------------------- tail
  // Chunky stylised form: four swelling segments curling up, cream tip.
  const tail = node(hips, 0, -0.02, -0.150);
  tail.rotation.set(0.42, 0.0, 0.0);
  joints.tail = tail;
  let tp = tail;
  const seg = [[0.090, 0.13], [0.120, 0.13], [0.132, 0.12], [0.115, 0.11]];
  for (let i = 0; i < seg.length; i++) {
    const [r, len] = seg[i];
    add(tp, sph(r, 9, 7), i === 3 ? CREAM : FUR, 0, 0, -len * 0.5).scale.z = 1.2;
    const nx = node(tp, 0, 0, -len);
    nx.rotation.x = 0.44;
    tp = nx;
  }
  add(tp, sph(0.082, 9, 7), CREAM, 0, 0, -0.045);

  // ------------------------------------------------------------------ katana
  // Slung across the back, hilt over TWIF's right shoulder (-X).
  const sword = node(chest, -0.06, -0.02, -0.185);
  sword.rotation.set(-0.22, 0.30, -0.62);
  add(sword, cyl(0.030, 0.030, 0.72, 8), CLOAK, 0, 0.0, 0);            // saya
  add(sword, cyl(0.032, 0.032, 0.05, 8), STEEL, 0, 0.30, 0);
  add(sword, box(0.085, 0.016, 0.085), GOLD, 0, 0.385, 0);             // tsuba
  add(sword, cyl(0.026, 0.024, 0.22, 8), TUNIC, 0, 0.50, 0);           // tsuka
  add(sword, cyl(0.030, 0.030, 0.03, 8), STEEL, 0, 0.615, 0);          // kashira
  add(sword, cyl(0.030, 0.030, 0.035, 8), GOLD, 0, -0.335, 0);
  add(sword, cyl(0.008, 0.008, 0.16, 6), STRAP, 0.055, 0.30, 0.0, 0, 0, 0.25);
  add(sword, box(0.085, 0.115, 0.012), TUNIC, 0.085, 0.195, 0.0);      // blank tag
  add(sword, box(0.095, 0.022, 0.016), GOLD, 0.085, 0.258, 0.0);

  g.userData.joints = joints;

  // --------------------------------------- contract: base y=0, centred x/z
  const bx = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) bx.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = bx.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bx.min.y; o.position.z -= c.z; });
  return g;
}
