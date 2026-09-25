// control_node — candidate A: primitive assembly.
// Boxes, square frusta (a 4-segment cylinder turned 45 deg so its faces face the
// axes), an octagonal lit core threaded through the stack, straight leaning
// cable runs. 3.0 x 5.0 x 3.0.
export default function (THREE) {
  const g = new THREE.Group();

  const M = (color, roughness, name, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name;
    return m;
  };
  const white = M(0xE9E9EC, 0.48, 'metal', 0.12);   // sterile enforcer panel
  const gun   = M(0x3A3F46, 0.38, 'metal', 0.72);
  const black = M(0x080A0B, 0.52, 'metal', 0.30);
  const lit   = M(0xBFE4FF, 0.42, 'plaster');       // <- emits, found by name

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent = g) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const sq = (sideTop, sideBot, h) =>
    new THREE.CylinderGeometry(sideTop * 0.7071, sideBot * 0.7071, h, 4).rotateY(Math.PI / 4);
  const ring = (deg) => { const p = new THREE.Group(); p.rotation.y = deg; g.add(p); return p; };

  // ---------------------------------------------------------------- base block
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(box(0.52, 0.16, 0.52), gun, sx * 0.86, 0.08, sz * 0.86);

  add(sq(3.00, 2.52, 0.24), black, 0, 0.28);          // 0.16 -> 0.40, flares out
  add(box(3.00, 0.16, 3.00), white, 0, 0.48);         // 0.40 -> 0.56
  add(box(2.86, 0.12, 2.86), lit,   0, 0.62);         // 0.56 -> 0.68  recessed channel
  add(box(3.00, 0.12, 3.00), white, 0, 0.74);         // 0.68 -> 0.80
  add(sq(2.12, 3.00, 0.30), white, 0, 0.95);          // 0.80 -> 1.10  chamfer in
  add(box(2.22, 0.10, 2.22), gun,   0, 1.15);         // 1.10 -> 1.20  deck

  for (let i = 0; i < 4; i++)                          // corner buttress blades
    add(box(0.22, 0.62, 0.34), gun, 1.28, 0.49, 0, 0, 0, 0, ring(Math.PI / 4 + i * Math.PI / 2));

  // ---------------------------------------------- column of twisted segments
  const COL_Y = 1.20, SEG = 7, SH = 0.30, GAP = 0.05;
  const COL_H = SEG * SH + (SEG - 1) * GAP;            // 2.35
  const side = (t) => 1.50 - 0.58 * t;

  // the recessed lit core the segments are threaded onto: seen in every gap
  add(new THREE.CylinderGeometry(0.40, 0.69, COL_H, 8), lit, 0, COL_Y + COL_H / 2);

  for (let i = 0; i < SEG; i++) {
    const seg = new THREE.Group();
    seg.position.y = COL_Y + i * (SH + GAP) + SH / 2;
    seg.rotation.y = i * 0.045;                        // the stack twists as it climbs
    g.add(seg);
    const sB = side(i / SEG), sT = side((i + 1) / SEG);
    add(sq(sT, sB, SH), i % 2 ? white : black, 0, 0, 0, 0, 0, 0, seg);
    add(sq(sT - 0.04, sT + 0.06, 0.05), gun, 0, SH / 2 + 0.02, 0, 0, 0, 0, seg);
  }
  const COL_TOP = COL_Y + COL_H;                       // 3.55

  // -------------------------------------------- front spine and its blank panel
  const SPZ = 0.86;
  for (const s of [-1, 1]) add(box(0.09, 2.45, 0.18), gun, s * 0.155, 2.375, SPZ);
  add(box(0.40, 0.14, 0.18), gun, 0, 1.22, SPZ);
  add(box(0.40, 0.12, 0.18), gun, 0, 3.54, SPZ);
  add(box(0.22, 2.20, 0.04), lit, 0, 2.38, SPZ - 0.04);   // blank panel, recessed
  for (const y of [1.62, 2.40, 3.18]) add(box(0.30, 0.10, 0.34), gun, 0, y, SPZ - 0.24);

  // ------------------------------------------------------------- cable runs
  const cable = (deg, r0, y0, r1, y1, rad) => {
    const L = Math.hypot(r0 - r1, y1 - y0);
    const p = ring(deg * Math.PI / 180);
    add(new THREE.CylinderGeometry(rad, rad, L, 6), black,
        (r0 + r1) / 2, (y0 + y1) / 2, 0, 0, 0, Math.asin((r0 - r1) / L), p);
    add(box(0.16, 0.10, 0.16), gun, r0, y0 + 0.04, 0, 0, 0, 0, p);
  };
  cable(40,  1.02, 1.20, 0.56, 2.28, 0.055);
  cable(140, 1.02, 1.20, 0.56, 2.28, 0.055);
  cable(220, 1.02, 1.20, 0.60, 1.92, 0.055);
  cable(320, 1.02, 1.20, 0.60, 1.92, 0.055);
  cable(180, 0.95, 1.20, 0.52, 2.62, 0.045);

  // ------------------------------------------------------------------ the head
  add(sq(1.66, 0.94, 0.18), gun,   0, 3.64);          // 3.55 -> 3.73, undercut
  add(box(1.66, 0.20, 1.66), white, 0, 3.83);         // 3.73 -> 3.93
  add(box(1.54, 0.06, 1.54), lit,   0, 3.96);         // 3.93 -> 3.99  recessed channel
  add(sq(1.22, 1.62, 0.06), white, 0, 4.02);          // 3.99 -> 4.05

  for (let i = 0; i < 10; i++)                         // ring of short radial fins
    add(box(0.34, 0.09, 0.13), gun, 0.94, 3.83, 0, 0, 0, 0, ring(i * Math.PI / 5));

  // ---------------------------------------------- three arms and the floating core
  const AL = Math.hypot(0.32, 0.35);
  for (let i = 0; i < 3; i++) {
    const p = ring(i * 2 * Math.PI / 3 + 0.4);
    add(new THREE.CylinderGeometry(0.032, 0.05, AL, 5), gun,
        0.26, 4.225, 0, 0, 0, Math.asin(0.32 / AL), p);
    add(box(0.16, 0.07, 0.14), gun, 0.42, 4.07, 0, 0, 0, 0, p);
  }

  const core = new THREE.Group();
  core.position.set(0, 4.64, 0);
  g.add(core);
  add(new THREE.OctahedronGeometry(0.36, 0), white, 0, 0, 0, 0, 0, 0, core);
  add(new THREE.OctahedronGeometry(0.21, 0), lit,   0, 0, 0, 0, Math.PI / 4, 0, core);
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
