// vending_machine — candidate B: swept profiles.
// The carcass is one rounded-corner plan profile extruded upward; the front
// frame is a single Shape with four holes, so stiles and rails come out of one
// sweep; feet are lathed pucks; the back grille is a corrugated sweep.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name;
    return m;
  };
  const shell = M(0x2A2E33, 0.72, 'metal', 0.45);
  const trim  = M(0x3A3F46, 0.50, 'metal', 0.66);
  const dark  = M(0x080A0B, 0.86, 'metal', 0.30);
  const panel = M(0xE7DFC9, 0.62, 'plaster');       // <- lit display field
  const lit   = M(0xE66D32, 0.66, 'plaster');
  const foot  = M(0x111315, 0.90, 'stone');

  const add = (geo, mat, x, y, z, rx = 0, ry = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    g.add(m);
    return m;
  };
  const box = (w, h, d, mat, x, y, z) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z);
  const ex = (shape, depth) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 3 });
  const rrect = (hw, hd, r) => {
    const s = new THREE.Shape();
    s.moveTo(-hw + r, -hd);
    s.lineTo(hw - r, -hd); s.quadraticCurveTo(hw, -hd, hw, -hd + r);
    s.lineTo(hw, hd - r);  s.quadraticCurveTo(hw, hd, hw - r, hd);
    s.lineTo(-hw + r, hd); s.quadraticCurveTo(-hw, hd, -hw, hd - r);
    s.lineTo(-hw, -hd + r); s.quadraticCurveTo(-hw, -hd, -hw + r, -hd);
    return s;
  };
  const rectPath = (x0, y0, x1, y1) => {
    const p = new THREE.Path();
    p.moveTo(x0, y0); p.lineTo(x1, y0); p.lineTo(x1, y1); p.lineTo(x0, y1); p.closePath();
    return p;
  };

  // ---- carcass: plan profile swept upward ---------------------------------
  add(ex(rrect(0.47, 0.34, 0.07), 1.71), shell, 0, 0.07, 0, -Math.PI / 2);

  // ---- lathed feet --------------------------------------------------------
  const puck = new THREE.LatheGeometry([
    new THREE.Vector2(0.00, 0.00), new THREE.Vector2(0.075, 0.00),
    new THREE.Vector2(0.070, 0.045), new THREE.Vector2(0.045, 0.07),
    new THREE.Vector2(0.00, 0.07),
  ], 6);
  for (const x of [-0.35, 0.35]) for (const z of [-0.23, 0.23]) add(puck, foot, x, 0, z);

  // ---- shallow lipped top: a swept ring -----------------------------------
  const lipOuter = rrect(0.50, 0.375, 0.08);
  lipOuter.holes.push(rectPath(-0.44, -0.315, 0.44, 0.315));
  add(ex(lipOuter, 0.12), trim, 0, 1.78, 0, -Math.PI / 2);
  box(0.88, 0.04, 0.63, dark, 0, 1.84, 0);

  // ---- front frame: one sweep, four openings ------------------------------
  const face = new THREE.Shape();
  face.moveTo(-0.47, 0.14); face.lineTo(0.47, 0.14);
  face.lineTo(0.47, 1.76); face.lineTo(-0.47, 1.76); face.closePath();
  face.holes.push(rectPath(-0.43, 0.60, 0.20, 1.72));   // display opening
  face.holes.push(rectPath(0.24, 0.60, 0.43, 1.72));    // selection column
  face.holes.push(rectPath(-0.41, 0.22, 0.17, 0.52));   // delivery flap
  face.holes.push(rectPath(0.24, 0.22, 0.43, 0.52));    // coin strip
  add(ex(face, 0.055), trim, 0, 0, 0.32);
  box(0.94, 0.07, 0.03, dark, 0, 0.105, 0.34);          // kick strip

  // ---- BLANK DISPLAY PANEL: 0.63 x 1.12, face at z = +0.360 --------------
  box(0.63, 1.12, 0.03, panel, -0.115, 1.16, 0.345);

  // ---- selection column ---------------------------------------------------
  box(0.19, 1.12, 0.03, dark, 0.335, 1.16, 0.335);
  const btn = new THREE.CylinderGeometry(0.028, 0.028, 0.045, 6);
  for (let i = 0; i < 8; i++) {
    const y = 0.72 + i * 0.13;
    add(btn, trim, 0.30, y, 0.3525, Math.PI / 2);
    box(0.05, 0.045, 0.02, lit, 0.395, y, 0.352);
  }

  // ---- coin strip ---------------------------------------------------------
  box(0.19, 0.30, 0.03, trim, 0.335, 0.37, 0.340);
  box(0.02, 0.07, 0.02, dark, 0.335, 0.47, 0.358);
  box(0.11, 0.02, 0.02, dark, 0.335, 0.38, 0.358);
  box(0.10, 0.06, 0.03, dark, 0.335, 0.28, 0.356);

  // ---- delivery flap: a swept scoop --------------------------------------
  const flap = new THREE.Shape();
  flap.moveTo(0, 0); flap.lineTo(0.05, 0.05); flap.lineTo(0.05, 0.27); flap.lineTo(0, 0.23);
  flap.closePath();
  add(ex(flap, 0.54), trim, -0.40, 0.23, 0.375, 0, Math.PI / 2);
  box(0.58, 0.32, 0.04, dark, -0.12, 0.37, 0.325);

  // ---- back: corrugated grille + compressor ------------------------------
  const corr = [];
  for (let i = 0; i < 6; i++) { corr.push([0.00, i * 0.06]); corr.push([0.025, i * 0.06 + 0.03]); }
  for (let i = 5; i >= 0; i--) { corr.push([-0.02, i * 0.06 + 0.03]); corr.push([-0.02, i * 0.06]); }
  const corrShape = new THREE.Shape();
  corrShape.moveTo(corr[0][0], corr[0][1]);
  for (let i = 1; i < corr.length; i++) corrShape.lineTo(corr[i][0], corr[i][1]);
  corrShape.closePath();
  add(ex(corrShape, 0.52), trim, -0.26, 0.42, -0.350, 0, Math.PI / 2);
  box(0.80, 1.08, 0.02, dark, 0, 1.20, -0.345);
  box(0.62, 0.30, 0.04, trim, 0, 0.18, -0.352);
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.26, 6), trim, -0.26, 0.12, -0.35, 0, 0);

  // ---- side reveals -------------------------------------------------------
  box(0.02, 1.36, 0.48, dark, -0.478, 0.92, 0);
  box(0.02, 1.36, 0.48, dark, 0.478, 0.92, 0);

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
