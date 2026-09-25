// convenience_store — candidate B: swept profiles.
// The whole shell is ONE section (plinth, floor, back wall, roof, fascia,
// parapet) drawn in the z/y plane and extruded across the width. The shopfront
// frame is one Shape with window and door holes; the shutter is a corrugated
// profile; the roof cowl is a Lathe. No glyphs anywhere.
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
  const wood  = M(0x6E5F49, 0.95, 'timber');

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    g.add(m);
    return m;
  };
  const box = (w, h, d, mat, x, y, z) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z);
  const shapeOf = (pts) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    return s;
  };
  const ex = (shape, depth) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 4 });

  // ---- 1. the shell, one swept section ------------------------------------
  // (z, y) traced: plinth face, floor, inner back wall, ceiling, fascia
  // reveal, fascia face, parapet, roof deck, rear parapet, rear wall, ground.
  const shell = shapeOf([
    [2.88, 0.00], [2.88, 0.14], [2.85, 0.14],
    [-2.59, 0.14], [-2.59, 3.54],
    [2.79, 3.54], [2.79, 2.10],
    [2.95, 2.10], [2.95, 3.88],
    [2.74, 3.88], [2.74, 3.70],
    [-2.72, 3.70], [-2.72, 3.88],
    [-2.98, 3.88], [-2.98, 0.00],
  ]);
  add(ex(shell, 7.10), wall, 3.55, 0, 0, 0, -Math.PI / 2);

  // side walls close the swept section's open ends
  box(0.26, 3.56, 5.44, wall, -3.42, 1.92, 0.13);
  box(0.26, 3.56, 5.44, wall, 3.42, 1.92, 0.13);

  // plinth kerb under the sweep, and copings on the parapet
  box(7.28, 0.14, 5.90, kerb, 0, 0.07, -0.03);
  box(7.34, 0.05, 0.26, kerb, 0, 3.905, 2.84);
  box(7.34, 0.05, 0.28, kerb, 0, 3.905, -2.85);
  box(0.34, 0.05, 5.80, kerb, -3.48, 3.905, 0);
  box(0.34, 0.05, 5.80, kerb, 3.48, 3.905, 0);

  // ---- 2. BLANK FASCIA PANEL ----------------------------------------------
  box(7.00, 1.50, 0.05, cream, 0, 2.90, 2.975);        // face at z = 3.00
  box(7.14, 0.10, 0.10, trim, 0, 3.68, 2.97);
  box(7.14, 0.10, 0.10, trim, 0, 2.12, 2.97);
  box(0.10, 1.60, 0.10, trim, -3.52, 2.90, 2.97);
  box(0.10, 1.60, 0.10, trim, 3.52, 2.90, 2.97);

  // ---- 3. shopfront frame: one shape with holes ---------------------------
  const front = new THREE.Shape();
  front.moveTo(-3.00, 0.14); front.lineTo(3.00, 0.14);
  front.lineTo(3.00, 2.10); front.lineTo(-3.00, 2.10); front.closePath();
  const hole = (x0, y0, x1, y1) => {
    const h = new THREE.Path();
    h.moveTo(x0, y0); h.lineTo(x1, y0); h.lineTo(x1, y1); h.lineTo(x0, y1); h.closePath();
    front.holes.push(h);
  };
  for (let i = 0; i < 4; i++) {
    const x0 = -2.94 + i * 1.165;
    hole(x0, 0.55, x0 + 1.085, 2.02);
  }
  hole(1.78, 0.20, 2.92, 2.02);                        // door opening
  add(ex(front, 0.14), trim, 0, 0, 2.71);

  box(4.86, 0.07, 0.22, kerb, -0.65, 0.555, 2.76);     // sill
  box(4.70, 0.06, 0.16, trim, -0.65, 1.86, 2.78);      // transom
  box(4.70, 1.50, 0.03, glass, -0.65, 1.29, 2.69);     // glazing behind frame
  box(4.74, 0.40, 0.22, wall, -0.65, 0.34, 2.70);      // stallriser mass

  // ---- 4. recessed doorway + canopy ---------------------------------------
  box(0.16, 1.96, 0.56, wall, 1.70, 1.12, 2.43);
  box(0.16, 1.96, 0.56, wall, 3.00, 1.12, 2.43);
  const canopy = shapeOf([[0, 0.00], [0.62, 0.02], [0.62, 0.15], [0, 0.10]]);
  add(ex(canopy, 1.46), trim, 1.62, 1.96, 2.91, 0, Math.PI / 2);
  box(1.10, 0.04, 0.26, cream, 2.35, 1.94, 2.52);
  box(1.24, 1.92, 0.07, trim, 2.35, 1.10, 2.18);
  box(1.04, 1.80, 0.05, glass, 2.35, 1.09, 2.20);
  box(1.04, 0.16, 0.07, trim, 2.35, 0.26, 2.21);
  box(0.05, 0.80, 0.05, trim, 2.72, 1.10, 2.24);
  box(1.22, 0.03, 0.54, dark, 2.35, 0.155, 2.44);

  // ---- 5. interior: stepped shelf profile swept along x -------------------
  const shelf = shapeOf([
    [-0.40, 0.00], [0.40, 0.00], [0.40, 0.50], [0.30, 0.50],
    [0.30, 0.94], [0.20, 0.94], [0.20, 1.34], [0.06, 1.34],
    [0.06, 1.62], [-0.40, 1.62],
  ]);
  for (const x of [-2.52, -1.42, -0.32, 0.78]) {
    add(ex(shelf, 1.02), dark, x + 0.51, 0.14, 1.96, 0, -Math.PI / 2);
  }
  for (const x of [-2.52, -1.42, -0.32, 0.78]) {
    box(0.92, 0.09, 0.03, cream, x, 0.88, 2.28);
    box(0.92, 0.09, 0.03, warm, x, 1.32, 2.18);
  }
  box(6.20, 1.70, 0.05, warm, 0, 1.30, -2.56);
  for (const z of [1.1, -0.5, -2.0]) box(5.60, 0.05, 0.16, cream, 0, 3.48, z);
  box(1.30, 0.95, 0.65, dark, 1.05, 0.615, 1.20);
  box(1.38, 0.06, 0.72, kerb, 1.05, 1.12, 1.20);

  // ---- 6. roof: extruded units + a lathed cowl ----------------------------
  const unit = shapeOf([[-0.60, 0], [0.60, 0], [0.62, 0.20], [-0.62, 0.20]]);
  add(ex(unit, 0.95), trim, -1.45, 3.70, -1.08);
  box(1.30, 0.04, 1.02, dark, -1.45, 3.92, -0.60);
  const cowl = new THREE.LatheGeometry([
    new THREE.Vector2(0.00, 0.00), new THREE.Vector2(0.22, 0.00),
    new THREE.Vector2(0.22, 0.04), new THREE.Vector2(0.12, 0.05),
    new THREE.Vector2(0.12, 0.12), new THREE.Vector2(0.30, 0.16),
    new THREE.Vector2(0.30, 0.22), new THREE.Vector2(0.00, 0.22),
  ], 12);
  add(cowl, trim, -1.45, 3.94, -0.60);
  const unit2 = shapeOf([[-0.48, 0], [0.48, 0], [0.48, 0.26], [-0.48, 0.26]]);
  add(ex(unit2, 0.72), trim, 1.35, 3.70, -1.86);
  box(1.02, 0.04, 0.78, dark, 1.35, 3.98, -1.50);
  box(0.26, 0.16, 1.00, trim, -0.20, 3.78, -1.10);

  // ---- 7. left wall: blank blade sign on a bracket ------------------------
  const blade = shapeOf([
    [-0.27, 0.00], [0.27, 0.00], [0.32, 0.10], [0.32, 1.82],
    [0.27, 1.92], [-0.27, 1.92], [-0.32, 1.82], [-0.32, 0.10],
  ]);
  add(ex(blade, 0.12), trim, -3.98, 1.49, 0.40, 0, Math.PI / 2);
  box(0.03, 1.76, 0.54, cream, -3.985, 2.45, 0.40);    // blank face at x = -4.00
  box(0.03, 1.76, 0.54, cream, -3.850, 2.45, 0.40);
  for (const y of [3.20, 1.70]) box(0.32, 0.08, 0.10, trim, -3.71, y, 0.40);

  // ---- 8. right wall: service door + crates (extruded) -------------------
  box(0.09, 2.02, 1.00, trim, 3.545, 1.15, -1.30);
  box(0.07, 1.90, 0.88, wall, 3.53, 1.09, -1.30);
  box(0.06, 0.05, 0.16, trim, 3.60, 1.05, -0.95);
  box(0.30, 0.12, 1.10, kerb, 3.70, 0.06, -1.30);
  const crate = shapeOf([
    [-0.23, 0.00], [0.23, 0.00], [0.23, 0.42], [0.20, 0.46],
    [-0.20, 0.46], [-0.23, 0.42],
  ]);
  add(ex(crate, 0.40), wood, 3.55, 0.00, 0.30, 0, Math.PI / 2);
  add(ex(crate, 0.40), wood, 3.55, 0.49, 0.33, 0, Math.PI / 2);
  add(ex(crate, 0.38), wood, 3.57, 0.00, 0.98, 0, Math.PI / 2);
  for (const p of [[0.24, 0.30], [0.73, 0.33]]) box(0.42, 0.04, 0.48, dark, 3.75, p[0], p[1]);

  // ---- 9. back elevation: corrugated shutter, vent, pipe -----------------
  const corr = [];
  for (let i = 0; i < 9; i++) { corr.push([0.00, i * 0.24]); corr.push([0.07, i * 0.24 + 0.12]); }
  for (let i = 8; i >= 0; i--) { corr.push([-0.05, i * 0.24 + 0.12]); corr.push([-0.05, i * 0.24]); }
  add(ex(shapeOf(corr), 2.44), trim, -1.52, 0.26, -2.93, 0, Math.PI / 2);
  box(2.76, 0.30, 0.16, trim, -0.30, 2.42, -2.91);
  for (const x of [-1.62, 1.02]) box(0.12, 2.24, 0.12, trim, x, 1.26, -2.90);
  box(0.85, 0.62, 0.14, trim, -2.55, 2.55, -2.90);
  for (const y of [2.32, 2.47, 2.62, 2.77]) box(0.74, 0.07, 0.04, dark, -2.55, y, -2.965);
  box(0.95, 2.00, 0.08, trim, 2.30, 1.14, -2.93);
  box(0.80, 1.80, 0.04, wall, 2.30, 1.10, -2.96);
  box(0.34, 0.46, 0.14, trim, -1.90, 1.40, -2.92);
  add(new THREE.CylinderGeometry(0.07, 0.07, 3.56, 8), trim, -3.30, 1.92, -2.80);
  for (const y of [0.80, 2.80]) box(0.18, 0.06, 0.18, trim, -3.30, y, -2.80);

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
