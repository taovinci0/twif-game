// const_shrine — candidate A: primitive assembly.
// A small raised shrine on a two-step plinth: timber cabinet with a recessed
// interior, blank tablet on a pedestal, steep pitched roof with upturned eave
// corners, flanking stone lantern posts, rope and paper pendants, offerings.
// No glyphs anywhere; the tablet is a blank quad for a texture.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0, side) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (side) m.side = side;
    m.name = name;
    return m;
  };
  const D = THREE.DoubleSide;
  const dark   = M(0x080A0B, 0.86, 'stone');
  const char   = M(0x111315, 0.82, 'stone');
  const stone  = M(0x8C816F, 0.90, 'stone');
  const wood   = M(0x111315, 0.78, 'timber', 0, D);
  const red    = M(0x8E2B2B, 0.72, 'timber');
  const gold   = M(0xD4A24C, 0.36, 'metal', 0.65);
  const cream  = M(0xE7DFC9, 0.74, 'plaster', 0, D);
  const paper  = M(0xE7DFC9, 0.88, 'fabric', 0, D);
  const cord   = M(0x8C816F, 0.95, 'fabric');
  const inside = M(0x080A0B, 0.92, 'timber', 0, D);

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    g.add(m);
    return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  // ---- two-step stone plinth -------------------------------------------
  add(B(2.60, 0.18, 2.30), dark,  0, 0.09, -0.14);
  add(B(2.20, 0.18, 1.62), char,  0, 0.27, -0.30);
  add(B(1.88, 0.12, 1.28), stone, 0, 0.42, -0.38);
  add(B(1.94, 0.03, 1.34), gold,  0, 0.495, -0.38);

  // ---- cabinet shell: open-fronted box, recessed interior ---------------
  // floor / back / two sides / ceiling. Deck top is y = 0.48.
  add(B(1.46, 0.08, 1.06), wood, 0, 0.54, -0.44);          // floor
  add(B(1.46, 1.40, 0.10), wood, 0, 1.28, -0.92);          // back
  for (const s of [-1, 1]) add(B(0.11, 1.40, 1.06), wood, s * 0.675, 1.28, -0.44);
  add(B(1.62, 0.12, 1.18), wood, 0, 2.04, -0.44);          // ceiling slab
  add(B(2.10, 0.08, 1.40), char, 0, 2.13, -0.40);          // cornice

  // recess liner so the interior reads as depth, not a black hole
  add(new THREE.PlaneGeometry(1.24, 1.38), inside, 0, 1.28, -0.855);
  add(new THREE.PlaneGeometry(1.24, 0.94), inside, 0, 0.585, -0.39, -Math.PI / 2);

  // ---- pedestal and the blank tablet ------------------------------------
  add(B(0.92, 0.16, 0.50), wood, 0, 0.66, -0.52);
  add(B(0.98, 0.03, 0.56), gold, 0, 0.755, -0.52);
  add(B(0.82, 1.03, 0.06), dark, 0, 1.255, -0.545);
  // the texture-ready panel: blank quad, 0.70 x 0.95, facing +Z
  add(new THREE.PlaneGeometry(0.70, 0.95), cream, 0, 1.255, -0.505);
  for (const s of [-1, 1]) add(B(0.05, 1.05, 0.04), gold, s * 0.385, 1.255, -0.50);
  for (const s of [-1, 1]) add(B(0.82, 0.05, 0.04), gold, 0, 1.255 + s * 0.525, -0.50);

  // ---- flanking slim posts and the front lintel -------------------------
  for (const s of [-1, 1]) {
    add(B(0.13, 1.56, 0.13), red,  s * 0.76, 1.30, 0.06);
    add(B(0.17, 0.06, 0.17), gold, s * 0.76, 0.56, 0.06);
    add(B(0.17, 0.06, 0.17), gold, s * 0.76, 2.02, 0.06);
  }
  add(B(1.80, 0.16, 0.20), red,  0, 1.98, 0.08);
  add(B(1.86, 0.04, 0.24), gold, 0, 2.08, 0.08);

  // ---- roof: ridge along x, slopes front and back -----------------------
  const rz0 = -0.30;                       // roof centre in z
  const ang = Math.atan2(0.74, 1.00);      // eave 2.16 -> apex 2.90
  for (const s of [-1, 1]) {
    add(B(2.70, 0.13, 1.30), char, 0, 2.53, rz0 + s * 0.50, s * ang);
  }
  // upturned eave corners — four tilted tips
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(B(0.46, 0.11, 0.46), char, sx * 1.12, 2.22, rz0 + sz * 0.86, -sz * 0.38);
  }
  // barge boards down the two gable ends
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(B(0.10, 0.10, 1.26), gold, sx * 1.34, 2.53, rz0 + sz * 0.50, sz * ang);
  }
  // ridge beam and finials
  add(B(2.86, 0.18, 0.30), dark, 0, 2.93, rz0);
  add(B(2.94, 0.05, 0.34), gold, 0, 3.045, rz0);
  for (const s of [-1, 1]) {
    add(new THREE.ConeGeometry(0.09, 0.18, 6), gold, s * 1.44, 3.11, rz0);
  }

  // ---- stone lantern posts flanking the steps ---------------------------
  for (const s of [-1, 1]) {
    const x = s * 1.49, z = 0.62;
    add(B(0.26, 0.10, 0.26), dark,  x, 0.05, z);
    add(B(0.19, 0.86, 0.19), stone, x, 0.53, z);
    add(new THREE.CylinderGeometry(0.21, 0.15, 0.34, 4), stone, x, 1.13, z, 0, Math.PI / 4);
    add(B(0.13, 0.20, 0.02), cream, x, 1.13, z + 0.145);
    add(B(0.02, 0.20, 0.13), cream, x + s * 0.145, 1.13, z);
    add(new THREE.ConeGeometry(0.30, 0.22, 4), dark, x, 1.41, z, 0, Math.PI / 4);
    add(new THREE.SphereGeometry(0.07, 8, 6), gold, x, 1.56, z);
  }

  // ---- rope across the front, with two folded paper pendants ------------
  add(new THREE.CylinderGeometry(0.055, 0.055, 1.52, 8), cord, 0, 1.82, 0.20, 0, 0, Math.PI / 2);
  for (const s of [-1, 1]) {
    add(B(0.17, 0.34, 0.02), paper, s * 0.40, 1.60, 0.20);
    add(B(0.12, 0.22, 0.02), paper, s * 0.40, 1.36, 0.20);
  }

  // ---- offering tray and bowls on the top step --------------------------
  add(B(0.62, 0.06, 0.26), dark, 0, 0.39, 0.40);
  add(B(0.66, 0.03, 0.30), gold, 0, 0.435, 0.40);
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.09, 0.06, 0.09, 10, 1, true), cream, s * 0.19, 0.50, 0.40);
    add(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 10), cream, s * 0.19, 0.455, 0.40);
  }

  // ---- contract: base at y=0, centred on x and z ------------------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
