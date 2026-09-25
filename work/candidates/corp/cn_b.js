// control_node — candidate B: swept profiles.
// Base tiers are extruded cut-corner squares, every column segment and the head
// are lathed angular profiles, the arms and cable runs are tubes swept along
// curves. 3.0 x 5.0 x 3.0.
export default function (THREE) {
  const g = new THREE.Group();

  const M = (color, roughness, name, metalness = 0, side) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (side) m.side = side;
    m.name = name;
    return m;
  };
  const white = M(0xE9E9EC, 0.48, 'metal', 0.12);
  const whiteD = M(0xE9E9EC, 0.48, 'metal', 0.12, THREE.DoubleSide);  // lathes are open-ended
  const gun   = M(0x3A3F46, 0.38, 'metal', 0.72);
  const gunD  = M(0x3A3F46, 0.38, 'metal', 0.72, THREE.DoubleSide);
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
  const ring = (a) => { const p = new THREE.Group(); p.rotation.y = a; g.add(p); return p; };

  // a square with its corners cut off
  const cutSquare = (s, c) => {
    const h = s / 2, sh = new THREE.Shape();
    sh.moveTo(-h + c, -h); sh.lineTo(h - c, -h); sh.lineTo(h, -h + c); sh.lineTo(h, h - c);
    sh.lineTo(h - c, h); sh.lineTo(-h + c, h); sh.lineTo(-h, h - c); sh.lineTo(-h, -h + c);
    sh.closePath(); return sh;
  };
  // extrude a plan shape upward: local +z becomes +y, so it spans y = 0..depth
  const upx = (shape, depth) =>
    new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }).rotateX(-Math.PI / 2);
  // lathe an angular profile; phiStart puts flats on the axes
  const lathe = (pts, seg) =>
    new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg, Math.PI / seg, Math.PI * 2);

  // ---------------------------------------------------------------- base block
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(new THREE.BoxGeometry(0.50, 0.14, 0.50), gun, sx * 0.88, 0.07, sz * 0.88);

  add(upx(cutSquare(3.00, 0.42), 0.30), white, 0, 0.14, 0);   // 0.14 -> 0.44
  add(upx(cutSquare(2.84, 0.38), 0.14), lit,   0, 0.44, 0);   // recessed channel
  add(upx(cutSquare(3.00, 0.42), 0.16), white, 0, 0.58, 0);
  add(upx(cutSquare(2.42, 0.34), 0.26), black, 0, 0.74, 0);   // chamfered shoulder
  add(upx(cutSquare(2.00, 0.28), 0.14), gun,   0, 1.00, 0);   // deck

  for (let i = 0; i < 4; i++)
    add(new THREE.BoxGeometry(0.20, 0.56, 0.30), gun, 1.26, 0.44, 0, 0, 0, 0,
        ring(Math.PI / 4 + i * Math.PI / 2));

  // ---------------------------------------- lathed segments, twisting as they climb
  const COL_Y = 1.14, SEG = 7, SH = 0.30, GAP = 0.05, COL_H = SEG * SH + (SEG - 1) * GAP;
  const rad = (t) => 0.80 - 0.30 * t;

  add(lathe([[0.66, 0], [0.38, COL_H]], 8), litD, 0, COL_Y, 0);   // the lit core, seen in every gap

  for (let i = 0; i < SEG; i++) {
    const rB = rad(i / SEG), rT = rad((i + 1) / SEG);
    const seg = ring(i * 0.05);
    seg.position.y = COL_Y + i * (SH + GAP);
    add(lathe([[rB - 0.07, 0], [rB, 0.045], [rT, 0.255], [rT - 0.07, 0.30]], 8),
        i % 2 ? whiteD : gunD, 0, 0, 0, 0, 0, 0, seg);
  }
  const COL_TOP = COL_Y + COL_H;   // 3.54

  // -------------------------------------------- front spine and its blank panel
  const SPZ = 0.90;
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.09, 2.36, 0.18), gun, s * 0.15, 2.34, SPZ);
  add(new THREE.BoxGeometry(0.39, 0.13, 0.18), gun, 0, 1.22, SPZ);
  add(new THREE.BoxGeometry(0.39, 0.12, 0.18), gun, 0, 3.46, SPZ);
  add(new THREE.BoxGeometry(0.22, 2.06, 0.04), lit, 0, 2.34, SPZ - 0.04);
  for (const y of [1.60, 2.34, 3.08]) add(new THREE.BoxGeometry(0.28, 0.10, 0.30), gun, 0, y, SPZ - 0.22);

  // --------------------------------------------- cable runs, swept along a curve
  const tube = (pts, r, mat, a) => {
    const c = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    add(new THREE.TubeGeometry(c, 8, r, 5, false), mat, 0, 0, 0, 0, 0, 0, ring(a));
  };
  for (const [a, top] of [[0.7, 2.30], [2.44, 2.30], [3.84, 1.95], [5.58, 1.95]]) {
    tube([[1.00, 1.14, 0], [0.97, 1.46, 0], [0.74, 1.88, 0], [0.60, top, 0]], 0.055, black, a);
    add(new THREE.BoxGeometry(0.16, 0.10, 0.16), gun, 1.00, 1.18, 0, 0, 0, 0, ring(a));
  }
  tube([[0.92, 1.14, 0], [0.88, 1.60, 0], [0.66, 2.20, 0], [0.52, 2.70, 0]], 0.045, black, Math.PI);

  // ------------------------------------------------- the head: one lathed profile
  add(lathe([[0.50, 0], [0.90, 0.20], [0.95, 0.25], [0.95, 0.36], [0.76, 0.44], [0.60, 0.51]], 8),
      whiteD, 0, COL_TOP, 0);
  add(lathe([[0.88, 0.255], [0.88, 0.345]], 8), litD, 0, COL_TOP, 0);   // recessed lit band

  // ring of short radial fins, each an extruded wedge
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0); finShape.lineTo(0.34, 0.055); finShape.lineTo(0.34, 0.155);
  finShape.lineTo(0, 0.22); finShape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.10, bevelEnabled: false });
  for (let i = 0; i < 10; i++)
    add(finGeo, gun, 0.80, COL_TOP + 0.14, -0.05, 0, 0, 0, ring(i * Math.PI / 5));

  const CAP_TOP = COL_TOP + 0.51;   // 4.05

  // ------------------------------- three swept arms carrying the floating core
  for (let i = 0; i < 3; i++) {
    const p = ring(i * 2 * Math.PI / 3 + 0.4);
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.46, CAP_TOP - 0.06, 0), new THREE.Vector3(0.44, CAP_TOP + 0.14, 0),
      new THREE.Vector3(0.26, CAP_TOP + 0.29, 0), new THREE.Vector3(0.10, CAP_TOP + 0.37, 0)]);
    add(new THREE.TubeGeometry(c, 8, 0.045, 5, false), gun, 0, 0, 0, 0, 0, 0, p);
    add(new THREE.BoxGeometry(0.17, 0.08, 0.14), gun, 0.46, CAP_TOP - 0.02, 0, 0, 0, 0, p);
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
