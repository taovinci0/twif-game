// const_shrine — candidate B: swept profiles.
// The roof is one extruded section — a sagging pitched profile whose eave tips
// turn up — swept along the ridge. The plinth is an extruded stepped terrace,
// the cabinet shell one extruded C-section, the lanterns lathed.
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

  // Profiles are drawn in (z, y) and swept along x: rotateY(-90) sends the
  // shape's first axis to world +z and the extrusion run to world -x, so the
  // numbers below read directly as metres with the front at +Z.
  const sweep = (shape, width, seg = 6) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false, curveSegments: seg });
    geo.rotateY(-Math.PI / 2);
    geo.translate(width / 2, 0, 0);
    return geo;
  };

  // ---- plinth: an extruded stepped terrace, steps to the front ----------
  const plinth = new THREE.Shape();
  plinth.moveTo(-1.17, 0);
  plinth.lineTo(1.10, 0);
  plinth.lineTo(1.10, 0.18);
  plinth.lineTo(0.52, 0.18);
  plinth.lineTo(0.52, 0.36);
  plinth.lineTo(0.10, 0.36);
  plinth.lineTo(0.10, 0.48);
  plinth.lineTo(-1.00, 0.48);
  plinth.lineTo(-1.00, 0.30);
  plinth.lineTo(-1.17, 0.30);
  plinth.lineTo(-1.17, 0);
  add(sweep(plinth, 2.56), char, 0, 0, 0);
  add(B(2.62, 0.04, 0.08), gold, 0, 0.16, 1.10);
  add(B(2.62, 0.04, 0.08), gold, 0, 0.34, 0.52);
  add(B(1.90, 0.04, 1.08), gold, 0, 0.50, -0.45);
  add(B(2.58, 0.05, 0.06), gold, 0, 0.26, -1.17);

  // ---- cabinet: one extruded C-section — floor, back, ceiling -----------
  const cab = new THREE.Shape();
  cab.moveTo(-0.97, 0.48);
  cab.lineTo(0.16, 0.48);
  cab.lineTo(0.16, 0.58);
  cab.lineTo(-0.85, 0.58);
  cab.lineTo(-0.85, 1.96);
  cab.lineTo(0.16, 1.96);
  cab.lineTo(0.16, 2.10);
  cab.lineTo(-0.97, 2.10);
  cab.lineTo(-0.97, 0.48);
  add(sweep(cab, 1.46), wood, 0, 0, 0);
  for (const s of [-1, 1]) add(B(0.11, 1.62, 1.13), wood, s * 0.675, 1.29, -0.405);
  add(B(2.06, 0.09, 1.30), char, 0, 2.145, -0.40);

  // dark liner so the recess reads as depth
  add(new THREE.PlaneGeometry(1.24, 1.36), inside, 0, 1.28, -0.845);
  add(new THREE.PlaneGeometry(1.24, 0.98), inside, 0, 0.59, -0.36, -Math.PI / 2);

  // ---- pedestal and the blank tablet ------------------------------------
  add(B(0.94, 0.18, 0.52), wood, 0, 0.67, -0.52);
  add(B(1.00, 0.03, 0.58), gold, 0, 0.775, -0.52);
  add(B(0.84, 1.05, 0.06), dark, 0, 1.27, -0.55);
  // texture-ready panel: blank quad, 0.70 x 0.95, facing +Z
  add(new THREE.PlaneGeometry(0.70, 0.95), cream, 0, 1.27, -0.51);
  for (const s of [-1, 1]) add(B(0.05, 1.07, 0.04), gold, s * 0.39, 1.27, -0.505);

  // ---- flanking posts, lintel -------------------------------------------
  for (const s of [-1, 1]) {
    add(B(0.14, 1.60, 0.14), red,  s * 0.77, 1.28, 0.08);
    add(B(0.18, 0.06, 0.18), gold, s * 0.77, 0.55, 0.08);
    add(B(0.18, 0.06, 0.18), gold, s * 0.77, 2.00, 0.08);
  }
  add(B(1.82, 0.16, 0.20), red,  0, 1.96, 0.10);
  add(B(1.88, 0.04, 0.24), gold, 0, 2.06, 0.10);

  // ---- roof: one swept section with upturned eave tips ------------------
  const roof = new THREE.Shape();
  roof.moveTo(0, 2.92);
  roof.quadraticCurveTo(0.565, 2.52, 0.855, 2.28);
  roof.quadraticCurveTo(0.965, 2.21, 1.05, 2.39);
  roof.lineTo(0.955, 2.32);
  roof.quadraticCurveTo(0.910, 2.16, 0.810, 2.17);
  roof.quadraticCurveTo(0.545, 2.40, 0, 2.78);
  roof.quadraticCurveTo(-0.545, 2.40, -0.810, 2.17);
  roof.quadraticCurveTo(-0.910, 2.16, -0.955, 2.32);
  roof.lineTo(-1.05, 2.39);
  roof.quadraticCurveTo(-0.965, 2.21, -0.855, 2.28);
  roof.quadraticCurveTo(-0.565, 2.52, 0, 2.92);
  add(sweep(roof, 2.66, 5), char, 0, 0, -0.25);

  // barge boards down both gable ends, following the same section
  const barge = new THREE.Shape();
  barge.moveTo(0, 2.95);
  barge.quadraticCurveTo(0.565, 2.55, 0.865, 2.31);
  barge.quadraticCurveTo(0.985, 2.23, 1.075, 2.43);
  barge.lineTo(1.010, 2.38);
  barge.quadraticCurveTo(0.940, 2.25, 0.846, 2.24);
  barge.quadraticCurveTo(0.545, 2.47, 0, 2.87);
  barge.quadraticCurveTo(-0.545, 2.47, -0.846, 2.24);
  barge.quadraticCurveTo(-0.940, 2.25, -1.010, 2.38);
  barge.lineTo(-1.075, 2.43);
  barge.quadraticCurveTo(-0.985, 2.23, -0.865, 2.31);
  barge.quadraticCurveTo(-0.565, 2.55, 0, 2.95);
  for (const s of [-1, 1]) add(sweep(barge, 0.09, 5), gold, s * 1.335, 0, -0.25);

  // ridge beam and finials
  add(B(2.84, 0.18, 0.30), dark, 0, 2.95, -0.25);
  add(B(2.92, 0.05, 0.34), gold, 0, 3.065, -0.25);
  for (const s of [-1, 1]) {
    add(new THREE.ConeGeometry(0.09, 0.19, 6), gold, s * 1.42, 3.105, -0.25);
  }

  // ---- lathed stone lanterns flanking the steps -------------------------
  const lp = [[0.16, 0], [0.16, 0.06], [0.10, 0.11], [0.095, 0.78], [0.14, 0.83],
              [0.20, 0.90], [0.20, 1.24], [0.13, 1.28], [0.30, 1.33], [0.25, 1.39],
              [0.10, 1.52], [0.05, 1.56], [0.001, 1.60]];
  const lathe = new THREE.LatheGeometry(lp.map(([r, y]) => new THREE.Vector2(r, y)), 8);
  for (const s of [-1, 1]) {
    const x = s * 1.40, z = 0.62;
    add(lathe, stone, x, 0, z, 0, Math.PI / 8);
    add(B(0.15, 0.24, 0.02), cream, x, 1.07, z + 0.175);
    add(B(0.02, 0.24, 0.15), cream, x + s * 0.175, 1.07, z);
  }

  // ---- rope and two folded paper pendants -------------------------------
  add(new THREE.CylinderGeometry(0.055, 0.055, 1.54, 8), cord, 0, 1.80, 0.26, 0, 0, Math.PI / 2);
  for (const s of [-1, 1]) {
    add(B(0.17, 0.34, 0.02), paper, s * 0.40, 1.58, 0.26);
    add(B(0.12, 0.22, 0.02), paper, s * 0.40, 1.34, 0.26);
  }

  // ---- offering tray and bowls on the top step --------------------------
  add(B(0.62, 0.06, 0.24), dark, 0, 0.39, 0.31);
  add(B(0.66, 0.03, 0.28), gold, 0, 0.435, 0.31);
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.09, 0.06, 0.10, 10, 1, true), cream, s * 0.19, 0.50, 0.31);
    add(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 10), cream, s * 0.19, 0.455, 0.31);
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
