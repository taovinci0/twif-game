// convenience_store — candidate C: a different part breakdown.
// Read as a pilaster-articulated bay system: six structural bays, one of which
// is the recessed doorway, with the fascia band returning around both front
// corners. Built from a bay() helper rather than as a front elevation.
// No glyphs anywhere; every sign field is flat blank geometry.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name;
    return m;
  };
  const wall  = M(0x111315, 0.88, 'stone');
  const dark  = M(0x080A0B, 0.90, 'stone');
  const trim  = M(0x3A3F46, 0.52, 'metal', 0.62);
  const kerb  = M(0x8C816F, 0.92, 'stone');
  const cream = M(0xE7DFC9, 0.66, 'plaster');
  const warm  = M(0xE66D32, 0.70, 'plaster');
  const glass = M(0x1B2A33, 0.12, 'tile', 0.25);
  const gold  = M(0xD4A24C, 0.38, 'metal', 0.6);
  const wood  = M(0x6E5F49, 0.95, 'timber');

  const box = (w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };
  const cyl = (r, h, seg, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };

  // ---- bay grid -----------------------------------------------------------
  const BW = 0.9767, PW = 0.16;
  const cx = (i) => -3.33 + BW / 2 + i * (BW + PW);   // bay centres, i = 0..5

  // ---- shell --------------------------------------------------------------
  box(7.26, 0.16, 5.86, kerb, 0, 0.08, 0);
  box(7.34, 0.05, 5.94, dark, 0, 0.13, 0);
  box(7.10, 3.56, 0.28, wall, 0, 1.94, -2.71);       // back wall
  box(0.28, 3.56, 5.70, wall, -3.41, 1.94, 0);       // left wall
  box(0.28, 3.56, 5.70, wall, 3.41, 1.94, 0);        // right wall
  box(7.10, 0.12, 5.70, dark, 0, 0.22, 0);           // floor
  box(7.10, 0.18, 5.70, wall, 0, 3.63, 0);           // roof slab

  // ---- bays: pilasters, glazing, stallrisers, interior shelving ----------
  box(0.22, 1.96, 0.36, wall, -3.44, 1.14, 2.68);
  box(0.22, 1.96, 0.36, wall, 3.44, 1.14, 2.68);
  for (let i = 0; i < 5; i++) {
    box(PW, 1.96, 0.30, wall, cx(i) + BW / 2 + PW / 2, 1.14, 2.71);
  }
  for (let i = 1; i < 6; i++) {
    const x = cx(i);
    box(BW, 0.48, 0.26, wall, x, 0.40, 2.73);        // stallriser
    box(BW + 0.10, 0.07, 0.22, kerb, x, 0.675, 2.75); // sill
    box(BW, 1.44, 0.04, glass, x, 1.36, 2.77);       // glazing
    box(BW, 0.06, 0.12, trim, x, 1.86, 2.79);        // transom
    // stepped shelving set back behind the glass
    box(BW - 0.10, 0.52, 0.42, dark, x, 0.48, 2.10);
    box(BW - 0.10, 0.44, 0.34, dark, x, 1.02, 2.04);
    box(BW - 0.10, 0.36, 0.26, dark, x, 1.46, 2.00);
    box(BW - 0.22, 0.09, 0.03, cream, x, 0.76, 2.32);
    box(BW - 0.22, 0.09, 0.03, warm, x, 1.26, 2.22);
  }
  box(7.10, 0.12, 0.24, trim, 0, 2.06, 2.76);        // continuous head rail

  // ---- doorway: bay 0, recessed under a flat canopy ----------------------
  const dx = cx(0);
  box(0.14, 1.96, 0.56, wall, -3.33, 1.14, 2.58);
  box(0.14, 1.96, 0.56, wall, -2.3533, 1.14, 2.58);
  box(1.26, 0.12, 0.62, trim, dx, 2.12, 2.54);        // canopy
  box(0.96, 0.04, 0.26, cream, dx, 2.04, 2.58);       // canopy downlight
  box(1.06, 1.94, 0.08, trim, dx, 1.13, 2.30);        // door frame
  box(0.88, 1.84, 0.05, glass, dx, 1.11, 2.32);       // door leaf
  box(0.88, 0.16, 0.07, trim, dx, 0.27, 2.33);
  box(0.88, 0.10, 0.07, trim, dx, 1.98, 2.33);
  box(0.05, 0.78, 0.05, trim, dx + 0.34, 1.12, 2.36);
  box(1.02, 0.03, 0.50, dark, dx, 0.175, 2.58);

  // ---- fascia band, full width, returning around both corners ------------
  box(7.26, 1.60, 0.16, trim, 0, 2.92, 2.88);         // carcass, z 2.80..2.96
  box(7.00, 1.48, 0.05, cream, 0, 2.92, 2.975);       // <- blank panel, face z = 3.00
  box(7.26, 0.10, 0.18, trim, 0, 3.67, 2.91);
  box(7.26, 0.10, 0.18, trim, 0, 2.17, 2.91);
  for (const s of [-1, 1]) {
    box(0.16, 1.60, 0.62, trim, s * 3.48, 2.92, 2.55);   // corner return
    box(0.05, 1.40, 0.52, cream, s * 3.585, 2.92, 2.55); // blank return face
    box(0.12, 1.60, 0.16, trim, s * 3.59, 2.92, 2.90);   // return nosing
  }
  for (const x of [-2.4, 0, 2.4]) box(0.90, 0.05, 0.16, gold, x, 2.14, 2.93);

  // ---- parapet ------------------------------------------------------------
  box(7.26, 0.18, 0.24, wall, 0, 3.81, 2.88);
  box(7.26, 0.18, 0.24, wall, 0, 3.81, -2.69);
  box(0.24, 0.18, 5.70, wall, -3.43, 3.81, 0);
  box(0.24, 0.18, 5.70, wall, 3.43, 3.81, 0);
  box(7.32, 0.05, 0.24, kerb, 0, 3.925, 2.88);
  box(7.32, 0.05, 0.28, kerb, 0, 3.925, -2.69);
  box(0.32, 0.05, 5.76, kerb, -3.47, 3.925, 0);
  box(0.32, 0.05, 5.76, kerb, 3.47, 3.925, 0);
  for (const x of [-3.44, -1.15, 1.15, 3.44]) box(0.30, 0.16, 0.30, kerb, x, 4.00 - 0.08, 2.88);

  // ---- roof units, set back ----------------------------------------------
  box(1.10, 0.22, 0.88, trim, -1.80, 3.83, -0.70);
  box(1.16, 0.04, 0.94, dark, -1.80, 3.96, -0.70);
  cyl(0.26, 0.06, 12, trim, -1.80, 3.97, -0.70);
  box(0.86, 0.26, 0.66, trim, 0.90, 3.85, -1.70);
  box(0.92, 0.04, 0.72, dark, 0.90, 4.00 - 0.02, -1.70);
  for (const y of [3.78, 3.85, 3.92]) box(0.72, 0.03, 0.05, dark, 0.90, y, -1.36);
  box(0.24, 0.18, 1.20, trim, -0.60, 3.81, -1.30);
  cyl(0.05, 0.24, 8, trim, 1.90, 3.84, -0.50);

  // ---- interior read ------------------------------------------------------
  box(6.20, 1.70, 0.05, warm, 0, 1.34, -2.54);
  for (const z of [1.2, -0.4, -1.9]) box(5.60, 0.05, 0.16, cream, 0, 3.50, z);
  box(1.40, 0.92, 0.66, dark, 2.05, 0.74, 1.20);
  box(1.48, 0.06, 0.74, kerb, 2.05, 1.23, 1.20);

  // ---- right wall: blank blade sign on a short bracket -------------------
  for (const y of [3.22, 1.72]) box(0.34, 0.08, 0.10, trim, 3.71, y, -0.30);
  box(0.07, 1.70, 0.10, trim, 3.90, 2.47, -0.30);
  box(0.12, 1.94, 0.66, trim, 3.93, 2.47, -0.30);
  box(0.03, 1.78, 0.56, cream, 3.985, 2.47, -0.30);   // <- blank face at x = +4.00
  box(0.03, 1.78, 0.56, cream, 3.875, 2.47, -0.30);

  // ---- left wall: service door + stacked crates --------------------------
  box(0.09, 2.04, 1.02, trim, -3.545, 1.18, -1.40);
  box(0.07, 1.92, 0.90, wall, -3.53, 1.12, -1.40);
  box(0.06, 0.05, 0.16, trim, -3.60, 1.08, -1.05);
  box(0.32, 0.14, 1.12, kerb, -3.70, 0.07, -1.40);
  box(0.40, 0.52, 0.48, wood, -3.75, 0.26, 0.40);
  box(0.43, 0.05, 0.51, dark, -3.75, 0.52, 0.40);
  box(0.40, 0.46, 0.44, wood, -3.75, 0.78, 0.42);
  box(0.43, 0.05, 0.47, dark, -3.75, 1.01, 0.42);
  box(0.38, 0.44, 0.42, wood, -3.74, 0.22, 1.05);
  box(0.41, 0.05, 0.45, dark, -3.74, 0.44, 1.05);
  for (const y of [0.15, 0.38]) box(0.36, 0.04, 0.02, dark, -3.75, y, 0.65);

  // ---- back elevation -----------------------------------------------------
  box(2.80, 0.32, 0.16, trim, 0.20, 2.36, -2.90);
  for (const x of [-1.15, 1.55]) box(0.12, 2.24, 0.12, trim, x, 1.24, -2.89);
  for (let i = 0; i < 8; i++) {
    box(2.52, 0.20, 0.07, i % 2 ? dark : trim, 0.20, 0.30 + i * 0.25, -2.875);
  }
  box(0.88, 0.64, 0.14, trim, -2.20, 2.58, -2.89);
  for (const y of [2.34, 2.50, 2.66, 2.82]) box(0.76, 0.07, 0.04, dark, -2.20, y, -2.955);
  box(0.92, 2.02, 0.08, trim, -1.05, 1.17, -2.88);
  box(0.78, 1.82, 0.04, wall, -1.05, 1.13, -2.91);
  box(0.36, 0.48, 0.14, trim, 2.60, 1.45, -2.91);
  box(2.80, 0.10, 0.06, dark, -1.20, 3.50, -2.89);
  cyl(0.07, 3.50, 8, trim, 3.28, 1.93, -2.78);
  for (const y of [0.85, 2.85]) box(0.18, 0.06, 0.18, trim, 3.28, y, -2.78);

  // ---- contract: base at y=0, centred on x and z --------------------------
  const bb = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
