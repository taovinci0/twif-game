// TWIF — candidate C. A different reading and a different part breakdown: the
// cloak is the silhouette. Each tier of it is ONE hand-built shell whose lower
// edge is a row of torn teeth (BufferGeometry, ~40 triangles a tier), and the
// hood is the same construction with the face cut out, so hood and cloak read
// as one garment. Stockier, more canine proportions than the other candidates.
// No glyphs: the hanging tag and the shoulder plate are blank geometry.
export default function (THREE) {
  const g = new THREE.Group();

  const MAT = (color, roughness, name, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, ...extra });
    m.name = name;
    return m;
  };
  const CLOAK = MAT(0x080A0B, 0.95, 'fabric', { side: THREE.DoubleSide });
  const SOLID = MAT(0x080A0B, 0.95, 'fabric');
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
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt, rb, h, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const cone = (r, h, s = 4) => new THREE.ConeGeometry(r, h, s);

  // One torn shell: a band from (topY,rTop) to (baseY,rBase) with a row of
  // ragged teeth hanging off its lower edge. This is the whole trick of the
  // candidate — the tatters are part of the garment, not parts stuck on it.
  // angle 0 is +Z, so `from`/`len` cut the opening in the front.
  const tornShell = (topY, rTop, baseY, rBase, n, seed, tooth = 0.17, from = 0, len = Math.PI * 2) => {
    const pos = [];
    const ang = (i) => from + (i / n) * len;
    const P = (i, y, r) => [Math.sin(ang(i)) * r, y, Math.cos(ang(i)) * r];
    const rnd = (i) => { const s = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453; return s - Math.floor(s); };
    for (let i = 0; i < n; i++) {
      const a0 = P(i, topY, rTop), a1 = P(i + 1, topY, rTop);
      const b0 = P(i, baseY, rBase), b1 = P(i + 1, baseY, rBase);
      pos.push(...a0, ...b0, ...b1, ...a0, ...b1, ...a1);
      const t = tooth * (0.30 + rnd(i) * 0.95);
      pos.push(...b0, ...P(i + 0.5, baseY - t, rBase * 1.04), ...b1);
      if (rnd(i + 40) > 0.55) {                       // the odd long torn strip
        const q0 = P(i + 0.24, baseY, rBase), q1 = P(i + 0.70, baseY, rBase);
        pos.push(...q0, ...P(i + 0.47, baseY - t * 2.1, rBase * 1.09), ...q1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    return geo;
  };

  const root = node(g);
  const joints = {};

  // stockier than the other two: shorter legs, heavier body, bigger head
  const HIP = 0.74, KNEE = 0.42, ANKLE = 0.12;
  const SHO = 1.14, ELBOW = 0.88, WRIST = 0.62;

  const hips = node(root, 0, HIP, 0);
  joints.hips = hips;

  // ------------------------------------------------------------------- legs
  const leg = (side) => {
    const up = node(hips, side * 0.135, 0, 0);
    add(up, cyl(0.125, 0.116, HIP - KNEE, 8), SOLID, 0, -(HIP - KNEE) / 2, 0);
    const lo = node(up, 0, -(HIP - KNEE), 0);
    add(lo, cyl(0.114, 0.080, 0.16, 8), TUNIC, 0, -0.080, 0);       // baggy hakama cuff
    add(lo, cyl(0.082, 0.076, 0.15, 8), WRAP, 0, -0.225, 0);
    for (let i = 0; i < 3; i++) add(lo, cyl(0.088, 0.088, 0.024, 8), CREAM, 0, -0.175 - i * 0.05, 0);
    const paw = node(lo, 0, -(KNEE - ANKLE), 0);
    add(paw, box(0.150, 0.085, 0.210), CREAM, 0, -0.078, 0.035);
    add(paw, cyl(0.072, 0.072, 0.150, 8), CREAM, 0, -0.078, 0.140, Math.PI / 2, 0, Math.PI / 2).scale.z = 0.62;
    for (let t = -1; t <= 1; t++) add(paw, sph(0.036, 6, 4), CREAM, t * 0.046, -0.074, 0.160);
    add(paw, box(0.105, 0.055, 0.070), FUR, 0, -0.028, -0.065);      // heel tuft
    return { up, lo };
  };
  const L = leg(1), R = leg(-1);
  joints.leftUpperLeg = L.up; joints.leftLowerLeg = L.lo;
  joints.rightUpperLeg = R.up; joints.rightLowerLeg = R.lo;

  // ------------------------------------------------------------------ torso
  const chest = node(hips, 0, SHO - HIP, 0);
  joints.chest = chest;
  add(chest, box(0.36, 0.26, 0.27), TUNIC, 0, -0.28, 0);
  add(chest, box(0.38, 0.12, 0.29), SOLID, 0, -0.18, 0);            // obi
  add(chest, box(0.395, 0.05, 0.30), STRAP, 0, -0.225, 0);
  add(chest, box(0.10, 0.075, 0.042), STEEL, 0, -0.225, 0.162);
  add(chest, cyl(0.200, 0.184, 0.32, 10), TUNIC, 0, -0.09, 0).scale.z = 0.72;
  add(chest, box(0.42, 0.15, 0.25), TUNIC, 0, 0.01, 0);
  for (const s of [-1, 1]) {
    add(chest, box(0.048, 0.46, 0.032), STRAP, 0, -0.07, 0.132, 0, 0, s * 0.50);
    add(chest, box(0.048, 0.42, 0.032), STRAP, 0, -0.07, -0.132, 0, 0, s * 0.50);
  }
  add(chest, box(0.075, 0.075, 0.036), STEEL, 0, -0.06, 0.142);
  add(chest, box(0.016, 0.12, 0.12), SOLID, -0.215, -0.01, 0.03);    // blank shoulder plate

  // ------------------------------------------------------------------- arms
  const arm = (side) => {
    const up = node(chest, side * 0.215, -0.01, 0);
    up.rotation.z = -side * 0.12;
    add(up, cyl(0.098, 0.082, SHO - ELBOW, 8), SOLID, 0, -(SHO - ELBOW) / 2, 0);
    add(up, sph(0.102, 8, 6), SOLID, 0, 0.01, 0);
    const lo = node(up, 0, -(SHO - ELBOW), 0);
    add(lo, cyl(0.074, 0.068, ELBOW - WRIST, 8), WRAP, 0, -(ELBOW - WRIST) / 2, 0);
    for (let i = 0; i < 3; i++) add(lo, cyl(0.080, 0.080, 0.022, 8), CREAM, 0, -0.045 - i * 0.065, 0);
    add(lo, sph(0.086, 8, 6), CREAM, 0, -(ELBOW - WRIST) - 0.035, 0.012).scale.set(1, 1.05, 0.92);
    for (let t = -1; t <= 1; t++) add(lo, sph(0.032, 6, 4), CREAM, t * 0.040, -(ELBOW - WRIST) - 0.095, 0.035);
    return { up, lo };
  };
  const LA = arm(1), RA = arm(-1);
  joints.leftUpperArm = LA.up; joints.leftLowerArm = LA.lo;
  joints.rightUpperArm = RA.up; joints.rightLowerArm = RA.lo;

  // ------------------------------------------------------------------ cloak
  // three torn shells: shoulder cape, mid layer, long skirt
  const cloak = node(hips, 0, 0, 0);
  add(cloak, tornShell(0.28, 0.190, -0.16, 0.280, 11, 3, 0.19), CLOAK);   // 1.02 -> 0.58
  add(cloak, tornShell(0.16, 0.215, -0.02, 0.258, 9, 11, 0.11), CLOAK);   // 0.90 -> 0.72
  const cape = node(chest, 0, 0.05, 0);
  add(cape, tornShell(0.00, 0.150, -0.27, 0.255, 10, 7, 0.12), CLOAK);    // 1.19 -> 0.92

  // ------------------------------------------------------------------- head
  const head = node(chest, 0, 0.11, 0);
  joints.head = head;
  const HY = 1.37 - (SHO + 0.11);
  add(head, sph(0.165, 12, 9), FUR, 0, HY, -0.005).scale.set(1.0, 0.98, 1.02);
  add(head, cyl(0.095, 0.110, 0.10, 8), FUR, 0, HY - 0.165, 0);
  // longer, more canine muzzle
  add(head, box(0.118, 0.095, 0.130), CREAM, 0, HY - 0.038, 0.160);
  add(head, sph(0.062, 8, 6), CREAM, 0, HY - 0.032, 0.215).scale.set(1.05, 0.88, 0.85);
  add(head, sph(0.029, 6, 5), NOSE, 0, HY + 0.006, 0.245).scale.set(1.2, 0.85, 0.8);
  add(head, box(0.165, 0.090, 0.100), TUNIC, 0, HY - 0.125, 0.110);
  for (const s of [-1, 1]) {
    add(head, sph(0.038, 8, 6), EYE, s * 0.068, HY + 0.052, 0.136, 0, 0, s * 0.33).scale.set(1.05, 0.6, 0.55);
    add(head, box(0.086, 0.024, 0.034), FUR, s * 0.068, HY + 0.084, 0.140, 0, 0, s * 0.28);
    add(head, sph(0.056, 7, 5), FUR, s * 0.118, HY - 0.030, 0.092).scale.set(0.82, 1.1, 0.85);  // cheek ruff
  }
  for (const s of [-1, 1]) {
    add(head, cone(0.064, 0.20, 4), FUR, s * 0.094, HY + 0.150, -0.010, 0, Math.PI / 4, s * 0.20).scale.z = 0.74;
    add(head, cone(0.040, 0.14, 4), SOLID, s * 0.094, HY + 0.155, 0.024, 0, Math.PI / 4, s * 0.20).scale.z = 0.62;
  }
  // the cowl: the same torn construction as the cloak, face cut away
  add(head, tornShell(HY + 0.130, 0.110, HY - 0.215, 0.250, 10, 5, 0.085, 0.95, Math.PI * 2 - 1.90), CLOAK, 0, 0, -0.045);
  add(head, tornShell(HY + 0.200, 0.032, HY + 0.130, 0.112, 10, 17, 0.015), CLOAK, 0, 0, -0.045);
  for (const s of [-1, 1]) {
    add(head, cone(0.088, 0.26, 4), SOLID, s * 0.098, HY + 0.152, -0.050, 0, Math.PI / 4, s * 0.22).scale.z = 0.84;
  }

  // ------------------------------------------------------------------- tail
  // chunky stylised mass: three swelling lobes curling up, cream tip
  const tail = node(hips, 0, -0.02, -0.165);
  tail.rotation.set(0.45, 0, 0);
  joints.tail = tail;
  let tp = tail;
  const seg = [[0.105, 0.12], [0.145, 0.13], [0.160, 0.13]];
  for (let i = 0; i < seg.length; i++) {
    const [r, len] = seg[i];
    add(tp, sph(r, 9, 7), FUR, 0, 0, -len * 0.5).scale.z = 1.2;
    const nx = node(tp, 0, 0, -len);
    nx.rotation.x = 0.50;
    tp = nx;
  }
  add(tp, sph(0.128, 9, 7), CREAM, 0, 0, -0.050).scale.z = 1.15;
  add(tp, sph(0.082, 8, 6), CREAM, 0, 0.005, -0.145);

  // ------------------------------------------------------------------ katana
  const sword = node(chest, -0.06, 0.00, -0.205);
  sword.rotation.set(-0.20, 0.30, -0.60);
  add(sword, cyl(0.032, 0.032, 0.74, 8), SOLID, 0, 0, 0);
  add(sword, cyl(0.034, 0.034, 0.05, 8), STEEL, 0, 0.30, 0);
  add(sword, box(0.090, 0.016, 0.090), GOLD, 0, 0.385, 0);
  add(sword, cyl(0.027, 0.025, 0.22, 8), TUNIC, 0, 0.50, 0);
  add(sword, cyl(0.031, 0.031, 0.03, 8), STEEL, 0, 0.615, 0);
  add(sword, cyl(0.032, 0.032, 0.035, 8), GOLD, 0, -0.345, 0);
  add(sword, cyl(0.008, 0.008, 0.16, 6), STRAP, 0.055, 0.30, 0, 0, 0, 0.25);
  add(sword, box(0.085, 0.115, 0.012), TUNIC, 0.085, 0.195, 0);     // blank tag
  add(sword, box(0.095, 0.022, 0.016), GOLD, 0.085, 0.258, 0);

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
