// TWIF — candidate B. Swept profiles: the cloak is built from LatheGeometry
// wedges (each tier a ring of wedges revolved off its own profile, so the hem
// steps and tears), the hood is a revolved shroud with the face cut out of it,
// and the ears, tatters, paws and tail are extruded outlines.
// No glyphs: the hanging tag and the shoulder plate are blank geometry.
export default function (THREE) {
  const g = new THREE.Group();

  const MAT = (color, roughness, name, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, ...extra });
    m.name = name;
    return m;
  };
  const CLOAK  = MAT(0x080A0B, 0.95, 'fabric');
  const CLOAK2 = MAT(0x080A0B, 0.95, 'fabric', { side: THREE.DoubleSide });
  const TUNIC  = MAT(0x111315, 0.92, 'fabric');
  const WRAP   = MAT(0xE7DFC9, 0.88, 'fabric');
  const CREAM  = MAT(0xE7DFC9, 0.86, 'fabric');
  const FUR    = MAT(0xE66D32, 0.90, 'fabric');
  const STRAP  = MAT(0xD4A24C, 0.62, 'fabric');
  const STEEL  = MAT(0x3A3F46, 0.30, 'metal', { metalness: 0.8 });
  const GOLD   = MAT(0xD4A24C, 0.32, 'metal', { metalness: 0.8 });
  const EYE    = MAT(0x9AFF43, 0.28, 'metal', { emissive: 0x9AFF43, emissiveIntensity: 1.0 });
  const NOSE   = MAT(0x080A0B, 0.42, 'plaster');

  const add = (p, geo, mat, px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(px, py, pz);
    m.rotation.set(rx, ry, rz);
    p.add(m);
    return m;
  };
  const node = (p, x = 0, y = 0, z = 0) => { const n = new THREE.Group(); n.position.set(x, y, z); p.add(n); return n; };
  const V = (x, y) => new THREE.Vector2(x, y);
  // LatheGeometry: phi 0 points at +Z, so a gap centred on phiStart-gap faces front
  const lathe = (pts, seg, from = 0, len = Math.PI * 2) => new THREE.LatheGeometry(pts, seg, from, len);
  const ex = (shape, depth, bevel = 0) => new THREE.ExtrudeGeometry(shape, bevel
    ? { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2 }
    : { depth, bevelEnabled: false });

  const root = node(g);
  const joints = {};

  const HIP = 0.80, KNEE = 0.45, ANKLE = 0.13;
  const SHO = 1.18, ELBOW = 0.90, WRIST = 0.64;

  const hips = node(root, 0, HIP, 0);
  joints.hips = hips;

  // ------------------------------------------------------------------- legs
  // every limb segment is a revolved profile, so it swells and tapers
  const leg = (side) => {
    const up = node(hips, side * 0.125, 0, 0);
    const h = HIP - KNEE;
    add(up, lathe([V(0.001, 0), V(0.105, -0.02), V(0.114, -h * 0.45), V(0.098, -h), V(0.001, -h)], 10), CLOAK);
    const lo = node(up, 0, -h, 0);
    add(lo, lathe([V(0.001, 0), V(0.098, -0.01), V(0.090, -0.10), V(0.072, -0.18), V(0.001, -0.18)], 10), TUNIC);
    add(lo, lathe([V(0.001, 0), V(0.074, 0), V(0.068, -0.14), V(0.001, -0.14)], 10), WRAP, 0, -0.18, 0);
    for (let i = 0; i < 3; i++)
      add(lo, lathe([V(0.001, 0), V(0.081, -0.002), V(0.081, -0.022), V(0.001, -0.024)], 10), CREAM, 0, -0.195 - i * 0.05, 0);
    const paw = node(lo, 0, -(KNEE - ANKLE), 0);
    const ps = new THREE.Shape();                       // paw seen from the side
    ps.moveTo(-0.070, 0.0); ps.lineTo(0.110, 0.0);
    ps.quadraticCurveTo(0.145, 0.0, 0.145, -0.042);
    ps.quadraticCurveTo(0.145, -0.082, 0.100, -0.082);
    ps.lineTo(-0.070, -0.082); ps.closePath();
    add(paw, ex(ps, 0.105, 0.016), CREAM, 0.052, 0.005, -0.040, 0, -Math.PI / 2, 0);
    add(paw, lathe([V(0.001, 0), V(0.060, -0.005), V(0.058, -0.048), V(0.001, -0.052)], 8), FUR, 0, 0.005, -0.055);
    return { up, lo };
  };
  const L = leg(1), R = leg(-1);
  joints.leftUpperLeg = L.up; joints.leftLowerLeg = L.lo;
  joints.rightUpperLeg = R.up; joints.rightLowerLeg = R.lo;

  // ------------------------------------------------------------------ torso
  const chest = node(hips, 0, SHO - HIP, 0);
  joints.chest = chest;
  add(chest, lathe([
    V(0.001, -0.40), V(0.165, -0.40), V(0.180, -0.30), V(0.172, -0.20),
    V(0.152, -0.11), V(0.178, -0.03), V(0.192, 0.03), V(0.120, 0.08), V(0.001, 0.09),
  ], 12), TUNIC).scale.z = 0.74;
  add(chest, lathe([V(0.001, -0.27), V(0.196, -0.27), V(0.200, -0.16), V(0.001, -0.16)], 12), CLOAK).scale.z = 0.76;
  add(chest, lathe([V(0.001, 0), V(0.204, 0), V(0.204, 0.045), V(0.001, 0.045)], 12), STRAP, 0, -0.285, 0).scale.z = 0.80;
  add(chest, new THREE.BoxGeometry(0.09, 0.07, 0.04), STEEL, 0, -0.263, 0.152);
  for (const s of [-1, 1]) {
    add(chest, new THREE.BoxGeometry(0.045, 0.46, 0.03), STRAP, 0, -0.09, 0.122, 0, 0, s * 0.52);
    add(chest, new THREE.BoxGeometry(0.045, 0.42, 0.03), STRAP, 0, -0.09, -0.120, 0, 0, s * 0.52);
  }
  add(chest, new THREE.BoxGeometry(0.07, 0.07, 0.035), STEEL, 0, -0.08, 0.134);
  add(chest, new THREE.BoxGeometry(0.014, 0.11, 0.11), CLOAK, -0.205, -0.03, 0.03);   // blank plate

  // ------------------------------------------------------------------- arms
  const arm = (side) => {
    const up = node(chest, side * 0.205, -0.01, 0);
    up.rotation.z = -side * 0.11;
    const h = SHO - ELBOW;
    add(up, lathe([V(0.001, 0.07), V(0.094, 0.050), V(0.098, -0.03), V(0.082, -h), V(0.001, -h)], 10), CLOAK);
    const lo = node(up, 0, -h, 0);
    const f = ELBOW - WRIST;
    add(lo, lathe([V(0.001, 0), V(0.072, -0.005), V(0.066, -f), V(0.001, -f)], 10), WRAP);
    for (let i = 0; i < 3; i++)
      add(lo, lathe([V(0.001, 0), V(0.077, -0.002), V(0.077, -0.020), V(0.001, -0.022)], 10), CREAM, 0, -0.05 - i * 0.07, 0);
    add(lo, lathe([V(0.001, 0), V(0.072, -0.015), V(0.082, -0.062), V(0.064, -0.118), V(0.001, -0.128)], 10),
      CREAM, 0, -f + 0.012, 0.008);
    return { up, lo };
  };
  const LA = arm(1), RA = arm(-1);
  joints.leftUpperArm = LA.up; joints.leftLowerArm = LA.lo;
  joints.rightUpperArm = RA.up; joints.rightLowerArm = RA.lo;

  // ------------------------------------------------------------------ cloak
  // Each tier is a ring of lathe wedges. Every wedge is revolved off its own
  // profile, so neighbouring wedges end at different heights and the hem steps
  // and tears instead of running smooth. Extruded flaps finish it.
  const tatter = (w, h) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0);
    s.lineTo(w * 0.22, -h * 0.55); s.lineTo(w * 0.06, -h);
    s.lineTo(-w * 0.16, -h * 0.46); s.lineTo(-w * 0.36, -h * 0.82);
    s.lineTo(-w / 2, -h * 0.26); s.closePath();
    return s;
  };
  const tier = (parent, y, rTop, rBot, drop, count, varies, flapEvery) => {
    const step = (Math.PI * 2) / count;
    for (let i = 0; i < count; i++) {
      const d = drop * (1 + varies * (((i * 7) % 5) / 4 - 0.5));
      const prof = [V(rTop, 0), V(rTop + (rBot - rTop) * 0.42, -d * 0.48), V(rBot, -d * 0.86), V(rBot * 0.94, -d)];
      add(parent, lathe(prof, 3, i * step - 0.03, step + 0.06), CLOAK2, 0, y, 0);
      if (i % flapEvery === 0) {
        const piv = node(parent, 0, y - d + 0.03, 0);
        piv.rotation.y = i * step + step / 2;
        add(piv, ex(tatter(rBot * 1.05, drop * 0.60), 0.018), CLOAK, 0, 0, rBot * 1.00).rotation.x = -0.22;
      }
    }
  };
  const cloak = node(hips, 0, 0, 0);
  tier(cloak, 0.22, 0.185, 0.275, 0.44, 8, 0.24, 2);         // long skirt, 1.02 -> 0.58
  tier(cloak, 0.10, 0.215, 0.255, 0.19, 6, 0.30, 2);         // mid layer,  0.90 -> 0.71
  const cape = node(chest, 0, 0.05, 0);
  tier(cape, 0, 0.155, 0.255, 0.27, 7, 0.26, 2);             // shoulder cape, 1.23 -> 0.96

  // ------------------------------------------------------------------- head
  const head = node(chest, 0, 0.10, 0);
  joints.head = head;
  const HY = 1.38 - (SHO + 0.10);
  add(head, lathe([
    V(0.001, -0.150), V(0.088, -0.155), V(0.135, -0.105), V(0.155, -0.02),
    V(0.145, 0.078), V(0.098, 0.133), V(0.001, 0.155),
  ], 12), FUR, 0, HY, -0.005);
  add(head, lathe([V(0.001, 0), V(0.092, -0.005), V(0.104, -0.05), V(0.001, -0.06)], 10), FUR, 0, HY - 0.155, 0);
  // muzzle: a revolved snout laid forward
  add(head, lathe([
    V(0.001, 0), V(0.062, -0.005), V(0.066, -0.048), V(0.050, -0.095), V(0.001, -0.104),
  ], 10), CREAM, 0, HY + 0.040, 0.150, Math.PI / 2 - 0.10, 0, 0).scale.set(1.15, 1, 0.92);
  add(head, new THREE.SphereGeometry(0.027, 7, 5), NOSE, 0, HY + 0.010, 0.226);
  add(head, new THREE.BoxGeometry(0.150, 0.085, 0.095), TUNIC, 0, HY - 0.120, 0.100);
  for (const s of [-1, 1]) {
    add(head, new THREE.SphereGeometry(0.034, 8, 6), EYE, s * 0.064, HY + 0.050, 0.126, 0, 0, s * 0.33).scale.set(1.1, 0.6, 0.55);
    add(head, new THREE.BoxGeometry(0.082, 0.024, 0.032), FUR, s * 0.064, HY + 0.080, 0.130, 0, 0, s * 0.28);
  }
  // ears: an extruded pointed outline, thin and sharp in silhouette
  const earShape = (() => {
    const s = new THREE.Shape();
    s.moveTo(-0.062, 0); s.lineTo(0.062, 0);
    s.quadraticCurveTo(0.056, 0.125, 0.006, 0.205);
    s.quadraticCurveTo(-0.034, 0.125, -0.062, 0);
    s.closePath(); return s;
  })();
  for (const s of [-1, 1]) {
    add(head, ex(earShape, 0.042, 0.010), FUR, s * 0.090, HY + 0.095, -0.030, 0, 0, s * 0.22);
    add(head, ex(earShape, 0.026, 0.006), CLOAK, s * 0.090, HY + 0.103, 0.022, 0, 0, s * 0.22).scale.set(0.62, 0.64, 1);
  }
  // hood: a revolved shroud, set back, with the face cut out of the front
  add(head, lathe([
    V(0.001, 0.215), V(0.090, 0.200), V(0.160, 0.140), V(0.205, 0.030),
    V(0.220, -0.070), V(0.236, -0.175), V(0.240, -0.240),
  ], 14, 0.95, Math.PI * 2 - 1.90), CLOAK2, 0, HY + 0.020, -0.055);
  const peakShape = (() => {
    const s = new THREE.Shape();
    s.moveTo(-0.086, 0); s.lineTo(0.086, 0);
    s.quadraticCurveTo(0.072, 0.135, 0.004, 0.262);
    s.quadraticCurveTo(-0.052, 0.135, -0.086, 0);
    s.closePath(); return s;
  })();
  for (const s of [-1, 1]) {
    add(head, ex(peakShape, 0.074, 0.014), CLOAK, s * 0.094, HY + 0.070, -0.085, 0, 0, s * 0.24);
  }

  // ------------------------------------------------------------------- tail
  // one extruded teardrop, bevelled into a chunky solid mass, plus a cream tip
  const tailShape = (() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.02);
    s.bezierCurveTo(0.12, 0.15, 0.31, 0.17, 0.35, 0.02);
    s.bezierCurveTo(0.39, -0.13, 0.27, -0.25, 0.12, -0.21);
    s.bezierCurveTo(0.02, -0.17, -0.02, -0.08, 0, 0.02);
    s.closePath(); return s;
  })();
  const tail = node(hips, 0, -0.02, -0.150);
  tail.rotation.set(0.62, 0, 0);
  joints.tail = tail;
  add(tail, ex(tailShape, 0.185, 0.045), FUR, -0.092, 0, 0, 0, Math.PI / 2, 0);
  add(tail, lathe([V(0.001, 0), V(0.090, -0.02), V(0.098, -0.078), V(0.062, -0.140), V(0.001, -0.152)], 10),
    CREAM, 0, 0.10, -0.340, -0.75, 0, 0);

  // ------------------------------------------------------------------ katana
  const sayaShape = (() => {
    const s = new THREE.Shape();
    s.moveTo(-0.018, -0.030); s.lineTo(0.018, -0.030);
    s.lineTo(0.026, 0); s.lineTo(0.018, 0.030);
    s.lineTo(-0.018, 0.030); s.lineTo(-0.026, 0); s.closePath(); return s;
  })();
  const sword = node(chest, -0.06, -0.02, -0.195);
  sword.rotation.set(-0.20, 0.30, -0.62);
  add(sword, ex(sayaShape, 0.74), CLOAK, 0, -0.36, 0, -Math.PI / 2, 0, 0);
  add(sword, new THREE.CylinderGeometry(0.033, 0.033, 0.05, 8), STEEL, 0, 0.30, 0);
  add(sword, new THREE.BoxGeometry(0.088, 0.016, 0.088), GOLD, 0, 0.385, 0);
  add(sword, new THREE.CylinderGeometry(0.026, 0.024, 0.22, 8), TUNIC, 0, 0.50, 0);
  add(sword, new THREE.CylinderGeometry(0.030, 0.030, 0.03, 8), STEEL, 0, 0.615, 0);
  add(sword, new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6), STRAP, 0.055, 0.30, 0, 0, 0, 0.25);
  add(sword, new THREE.BoxGeometry(0.085, 0.115, 0.012), TUNIC, 0.085, 0.195, 0);   // blank tag
  add(sword, new THREE.BoxGeometry(0.095, 0.022, 0.016), GOLD, 0.085, 0.258, 0);

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
