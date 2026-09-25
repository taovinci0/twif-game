// Control node — the corporate compute pylon the mission is about. 3.0 x 5.0 x 3.0.
//
// Chosen from three candidates by looking at the verifier sheet. The swept-profile
// build won: lathed segments give a crisp machined stack with real chamfers on
// every course where the primitive version read as a stack of trays and the
// plate-shell version stood on a thin cruciform that looked broken from the side.
// Refined here from hexagonal segments rather than octagonal, so the twist up the
// stack actually reads, and with the loser's better idea kept: a proper radial fin
// ring hung off the widest band of the cap.
//
// The recessed channels and the blank front panel are named 'plaster' because the
// lighting system finds emitters by material name. No glyphs anywhere: the panel
// and the base band are blank geometry and carry their art as textures applied by
// the game layer.
//
// g.userData.parts.core is the floating octahedron, for the game to spin.
export default function (THREE) {
  const g = new THREE.Group();

  const M = (color, roughness, name, metalness = 0, side) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (side) m.side = side;
    m.name = name;
    return m;
  };
  const white  = M(0xE9E9EC, 0.48, 'metal', 0.12);   // sterile enforcer panel
  const whiteD = M(0xE9E9EC, 0.48, 'metal', 0.12, THREE.DoubleSide);
  const gun    = M(0x3A3F46, 0.38, 'metal', 0.72);
  const gunD   = M(0x3A3F46, 0.38, 'metal', 0.72, THREE.DoubleSide);
  const black  = M(0x080A0B, 0.52, 'metal', 0.30);
  const lit    = M(0xBFE4FF, 0.42, 'plaster');
  const litD   = M(0xBFE4FF, 0.42, 'plaster', 0, THREE.DoubleSide);

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent = g) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const ring = (a) => { const p = new THREE.Group(); p.rotation.y = a; g.add(p); return p; };

  // a square plan with its corners cut off
  const cutSquare = (s, c) => {
    const h = s / 2, sh = new THREE.Shape();
    sh.moveTo(-h + c, -h); sh.lineTo(h - c, -h); sh.lineTo(h, -h + c); sh.lineTo(h, h - c);
    sh.lineTo(h - c, h); sh.lineTo(-h + c, h); sh.lineTo(-h, h - c); sh.lineTo(-h, -h + c);
    sh.closePath(); return sh;
  };
  // extrude a plan upward: local +z becomes +y, so the geometry spans y = 0..depth
  const upx = (shape, depth) =>
    new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }).rotateX(-Math.PI / 2);
  // lathe an angular profile; phiStart puts a flat face toward +Z
  const lathe = (pts, seg) =>
    new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg, Math.PI / seg, Math.PI * 2);

  // ------------------------------------------- heavy chamfered base on short feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(B(0.50, 0.14, 0.50), gun, sx * 0.88, 0.07, sz * 0.88);

  add(upx(cutSquare(3.00, 0.42), 0.30), white, 0, 0.14, 0);   // 0.14 -> 0.44
  add(upx(cutSquare(2.84, 0.38), 0.14), lit,   0, 0.44, 0);   // 0.44 -> 0.58  recessed channel
  add(upx(cutSquare(3.00, 0.42), 0.16), white, 0, 0.58, 0);   // 0.58 -> 0.74
  add(upx(cutSquare(2.42, 0.34), 0.26), white, 0, 0.74, 0);   // 0.74 -> 1.00  chamfer in
  add(upx(cutSquare(2.00, 0.28), 0.14), gun,   0, 1.00, 0);   // 1.00 -> 1.14  deck
  add(upx(cutSquare(2.44, 0.34), 0.04), gun,   0, 0.72, 0);   // arris under the chamfer

  for (let i = 0; i < 4; i++)                                  // corner buttress blades
    add(B(0.20, 0.56, 0.30), gun, 1.26, 0.44, 0, 0, 0, 0, ring(Math.PI / 4 + i * Math.PI / 2));

  // ------------------------------- the stack: hexagonal segments, twisting as they climb
  const COL_Y = 1.14, SEG = 7, SH = 0.30, GAP = 0.06;
  const COL_H = SEG * SH + (SEG - 1) * GAP;                    // 2.46
  const rad = (t) => 0.80 - 0.30 * t;

  // the lit core the stack is threaded onto, seen through every gap
  add(lathe([[0.66, 0], [0.38, COL_H]], 8), litD, 0, COL_Y, 0);
  add(lathe([[0.42, 0], [0.24, COL_H]], 6), gunD, 0, COL_Y, 0);

  for (let i = 0; i < SEG; i++) {
    const rB = rad(i / SEG), rT = rad((i + 1) / SEG);
    const seg = ring(i * 0.085);                               // ~29 degrees over the stack
    seg.position.y = COL_Y + i * (SH + GAP);
    add(lathe([[rB - 0.08, 0], [rB, 0.05], [rT, 0.25], [rT - 0.08, 0.30]], 6),
        i % 2 ? whiteD : gunD, 0, 0, 0, 0, 0, 0, seg);
  }
  const COL_TOP = COL_Y + COL_H;                               // 3.60

  // ------------------------------ front spine carrying the tall blank panel
  const SPZ = 0.92;
  for (const s of [-1, 1]) add(B(0.09, 2.32, 0.18), gun, s * 0.15, 2.36, SPZ);
  add(B(0.39, 0.13, 0.18), gun, 0, 1.22, SPZ);
  add(B(0.39, 0.12, 0.18), gun, 0, 3.52, SPZ);
  add(B(0.22, 2.02, 0.04), lit, 0, 2.36, SPZ - 0.04);          // blank, recessed, lit
  for (const y of [1.60, 2.36, 3.12]) add(B(0.28, 0.10, 0.32), gun, 0, y, SPZ - 0.23);

  // ------------------------------------------- cable runs, swept up off the deck
  const tube = (pts, r, mat, a) => {
    const c = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    const p = ring(a);
    add(new THREE.TubeGeometry(c, 8, r, 5, false), mat, 0, 0, 0, 0, 0, 0, p);
    return p;
  };
  for (const [a, top] of [[0.7, 2.34], [2.44, 2.34], [3.84, 1.98], [5.58, 1.98]]) {
    const p = tube([[1.00, 1.14, 0], [0.97, 1.46, 0], [0.74, 1.90, 0], [0.58, top, 0]], 0.05, gun, a);
    add(B(0.16, 0.10, 0.16), black, 1.00, 1.18, 0, 0, 0, 0, p);
  }
  tube([[0.92, 1.14, 0], [0.88, 1.62, 0], [0.64, 2.24, 0], [0.50, 2.76, 0]], 0.042, gun, Math.PI);

  // ------------------------------------ the head: a broader cap, undercut beneath
  add(lathe([[0.50, 0.00], [0.92, 0.16], [0.99, 0.22], [0.99, 0.30],
             [0.86, 0.33], [0.86, 0.40], [0.78, 0.44], [0.60, 0.48]], 8), whiteD, 0, COL_TOP, 0);
  add(lathe([[0.91, 0.34], [0.91, 0.39]], 8), litD, 0, COL_TOP, 0);   // lit band in the undercut

  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0); finShape.lineTo(0.36, 0.018); finShape.lineTo(0.36, 0.062);
  finShape.lineTo(0, 0.08); finShape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.11, bevelEnabled: false });
  for (let i = 0; i < 12; i++)                                  // ring of short radial fins
    add(finGeo, gun, 0.92, COL_TOP + 0.23, -0.055, 0, 0, 0, ring(i * Math.PI / 6));

  const CAP_TOP = COL_TOP + 0.48;                               // 4.08

  // ------------------------------- three swept arms holding the floating core
  for (let i = 0; i < 3; i++) {
    const p = ring(i * 2 * Math.PI / 3 + 0.4);
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.40, CAP_TOP - 0.02, 0), new THREE.Vector3(0.38, CAP_TOP + 0.14, 0),
      new THREE.Vector3(0.24, CAP_TOP + 0.27, 0), new THREE.Vector3(0.10, CAP_TOP + 0.36, 0)]);
    add(new THREE.TubeGeometry(c, 8, 0.05, 5, false), gun, 0, 0, 0, 0, 0, 0, p);
    add(B(0.17, 0.08, 0.15), gun, 0.40, CAP_TOP + 0.02, 0, 0, 0, 0, p);
  }

  const core = new THREE.Group();
  core.position.set(0, 4.64, 0);
  g.add(core);
  add(new THREE.OctahedronGeometry(0.36, 0), white, 0, 0, 0, 0, 0, 0, core);
  add(new THREE.OctahedronGeometry(0.21, 0), lit,   0, 0, 0, 0, Math.PI / 4, 0, core);
  add(new THREE.CylinderGeometry(0.30, 0.30, 0.03, 12), gun, 0, 0, 0, 0, 0, 0, core);
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
