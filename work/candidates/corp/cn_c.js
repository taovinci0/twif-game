// control_node — candidate C: a different part breakdown.
// The column is read as a continuous lit mast wearing rings of four separate
// face plates, so the recessed channels are real open corners running the whole
// height rather than faked bands. Cruciform plinth, hexagonal head, kinked
// blade arms. 3.0 x 5.0 x 3.0.
export default function (THREE) {
  const g = new THREE.Group();

  const M = (color, roughness, name, metalness = 0, side) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (side) m.side = side;
    m.name = name;
    return m;
  };
  const white = M(0xE9E9EC, 0.48, 'metal', 0.12);
  const gun   = M(0x3A3F46, 0.38, 'metal', 0.72);
  const black = M(0x080A0B, 0.52, 'metal', 0.30);
  const lit   = M(0xBFE4FF, 0.42, 'plaster');
  const litD  = M(0xBFE4FF, 0.42, 'plaster', 0, THREE.DoubleSide);

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent = g) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const ring = (a, parent = g) => { const p = new THREE.Group(); p.rotation.y = a; parent.add(p); return p; };

  // --------------------------------------------------- cruciform stepped plinth
  for (let i = 0; i < 4; i++)
    add(box(0.66, 0.18, 0.40), black, 1.14, 0.09, 0, 0, 0, 0, ring(i * Math.PI / 2));

  add(box(3.00, 0.26, 1.30), white, 0, 0.31, 0);      // the cross, 0.18 -> 0.44
  add(box(1.30, 0.26, 3.00), white, 0, 0.31, 0);
  add(box(2.10, 0.14, 2.10), lit,   0, 0.51, 0);      // recessed channel, 0.44 -> 0.58
  add(box(2.34, 0.28, 2.34), white, 0, 0.72, 0);      // 0.58 -> 0.86
  add(new THREE.CylinderGeometry(1.70 * 0.7071, 2.34 * 0.7071, 0.24, 4).rotateY(Math.PI / 4),
      black, 0, 0.98, 0);                              // 0.86 -> 1.10 chamfer in
  add(box(1.70, 0.10, 1.70), gun, 0, 1.15, 0);        // 1.10 -> 1.20 deck

  // ------------------------------------ the lit mast, and plates clamped round it
  const COL_Y = 1.20, SEG = 7, SH = 0.30, GAP = 0.05, COL_H = SEG * SH + (SEG - 1) * GAP;
  const side = (t) => 1.50 - 0.58 * t;

  add(new THREE.CylinderGeometry(0.20, 0.53, COL_H, 8), litD, 0, COL_Y + COL_H / 2, 0);
  add(new THREE.CylinderGeometry(0.14, 0.38, COL_H, 8), gun, 0, COL_Y + COL_H / 2, 0);

  for (let i = 0; i < SEG; i++) {
    const yb = COL_Y + i * (SH + GAP);
    const sB = side(i / SEG), sT = side((i + 1) / SEG);
    const seg = ring(i * 0.05);
    seg.position.y = yb + SH / 2;
    for (let k = 0; k < 4; k++) {
      const f = ring(k * Math.PI / 2, seg);
      const w = (sB + sT) / 2 - 0.26, hs = (sB + sT) / 4;
      add(box(w, SH, 0.13), i % 2 ? white : black, 0, 0, hs - 0.05, 0, 0, 0, f);
      add(box(w + 0.12, 0.05, 0.17), gun, 0, SH / 2 + 0.02, hs - 0.06, 0, 0, 0, f);
      add(box(0.06, SH - 0.10, 0.19), gun, 0, 0, hs - 0.06, 0, 0, 0, f);
    }
  }
  const COL_TOP = COL_Y + COL_H;   // 3.55

  // --------------------------------------- blank panel, bracketed off the front
  for (const s of [-1, 1]) add(box(0.10, 2.20, 0.16), gun, s * 0.19, 2.40, 0.88);
  add(box(0.46, 0.15, 0.16), gun, 0, 1.38, 0.88);
  add(box(0.46, 0.13, 0.16), gun, 0, 3.42, 0.88);
  add(box(0.28, 1.92, 0.05), lit, 0, 2.40, 0.84);
  for (const y of [1.70, 2.40, 3.10]) add(box(0.34, 0.11, 0.30), gun, 0, y, 0.66);

  // ------------------------------------------ conduit runs, boxed elbows not cable
  for (const a of [0.6, 2.54, 3.74, 5.68]) {
    const p = ring(a);
    add(box(0.16, 0.14, 0.16), gun, 0.96, 1.26, 0, 0, 0, 0, p);
    add(box(0.13, 0.13, 0.62), black, 0.96, 1.40, 0, 0, 0, 0, p);   // rises
    const L = Math.hypot(0.34, 0.52);
    add(new THREE.CylinderGeometry(0.06, 0.06, L, 6), black,
        0.79, 1.97, 0, 0, 0, Math.asin(0.34 / L), p);               // then leans in
  }

  // ----------------------------------------------- hexagonal head with fin ring
  add(new THREE.CylinderGeometry(0.94, 0.52, 0.20, 6), gun,   0, 3.65, 0);   // 3.55 -> 3.75 undercut
  add(new THREE.CylinderGeometry(0.94, 0.94, 0.18, 6), white, 0, 3.84, 0);   // 3.75 -> 3.93
  add(new THREE.CylinderGeometry(0.88, 0.88, 0.06, 6), lit,   0, 3.96, 0);   // 3.93 -> 3.99
  add(new THREE.CylinderGeometry(0.70, 0.92, 0.06, 6), white, 0, 4.02, 0);   // 3.99 -> 4.05

  for (let i = 0; i < 12; i++)
    add(box(0.32, 0.10, 0.11), gun, 1.02, 3.84, 0, 0, 0, 0, ring(i * Math.PI / 6));

  // ------------------------------- three kinked blade arms, and the floating core
  for (let i = 0; i < 3; i++) {
    const p = ring(i * 2 * Math.PI / 3 + 0.4);
    add(box(0.09, 0.22, 0.13), gun, 0.44, 4.14, 0, 0, 0, 0, p);
    const L = Math.hypot(0.30, 0.22);
    add(box(0.08, L, 0.11), gun, 0.29, 4.36, 0, 0, 0, Math.asin(0.30 / L), p);
  }

  const core = new THREE.Group();
  core.position.set(0, 4.64, 0);
  g.add(core);
  add(new THREE.OctahedronGeometry(0.37, 0), white, 0, 0, 0, 0, 0, 0, core);
  add(new THREE.OctahedronGeometry(0.22, 0), lit,   0, 0, 0, 0, Math.PI / 4, 0, core);
  add(new THREE.CylinderGeometry(0.40, 0.40, 0.035, 12), gun, 0, 0, 0, 0, 0, 0, core);
  g.userData.parts = { core };

  // ------------------------------------ contract: base at y=0, centred on x and z
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
