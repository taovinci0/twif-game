// vending_machine — candidate A: primitive assembly.
// Upright cabinet 1.00 x 1.90 x 0.75 m. Slightly proud front frame, large blank
// display panel facing +Z, selection column down the right, delivery flap,
// coin strip, short feet, shallow lipped top. No glyphs anywhere.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name;
    return m;
  };
  const shell = M(0x2A2E33, 0.72, 'metal', 0.45);   // worn cabinet steel
  const trim  = M(0x3A3F46, 0.50, 'metal', 0.66);   // frame, buttons, hardware
  const dark  = M(0x080A0B, 0.86, 'metal', 0.30);   // recesses, grilles
  const panel = M(0xE7DFC9, 0.62, 'plaster');       // <- lit display field
  const lit   = M(0xE66D32, 0.66, 'plaster');       // small warm strips
  const foot  = M(0x111315, 0.90, 'stone');

  const box = (w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };
  const cyl = (r, h, seg, mat, x, y, z, rx = 0, rz = 0) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, 0, rz);
    g.add(m);
    return m;
  };

  // ---- feet ---------------------------------------------------------------
  for (const x of [-0.36, 0.36]) for (const z of [-0.24, 0.24]) {
    box(0.13, 0.07, 0.13, foot, x, 0.035, z);
  }

  // ---- carcass ------------------------------------------------------------
  box(0.92, 1.71, 0.68, shell, 0, 0.925, 0);          // y 0.07 .. 1.78
  for (const s of [-1, 1]) {                          // side rails, ribs, hand-holds
    box(0.04, 1.66, 0.10, trim, s * 0.48, 0.93, 0.29);
    box(0.04, 1.66, 0.12, trim, s * 0.48, 0.93, -0.28);
    for (const y of [0.42, 0.96, 1.50]) box(0.03, 0.06, 0.46, trim, s * 0.475, y, 0.01);
    box(0.035, 0.20, 0.09, dark, s * 0.478, 1.66, -0.06);
    box(0.035, 0.09, 0.09, dark, s * 0.478, 0.30, -0.06);
  }

  // ---- shallow lipped top -------------------------------------------------
  box(1.00, 0.12, 0.06, trim, 0, 1.84, 0.345);
  box(1.00, 0.12, 0.06, trim, 0, 1.84, -0.345);
  box(0.06, 0.12, 0.75, trim, -0.47, 1.84, 0);
  box(0.06, 0.12, 0.75, trim, 0.47, 1.84, 0);
  box(0.88, 0.04, 0.63, dark, 0, 1.86, 0);            // recessed top plate

  // ---- proud front frame --------------------------------------------------
  box(0.05, 1.62, 0.035, trim, -0.445, 0.95, 0.3575);
  box(0.05, 1.62, 0.035, trim, 0.215, 0.95, 0.3575);
  box(0.05, 1.62, 0.035, trim, 0.445, 0.95, 0.3575);
  box(0.94, 0.05, 0.035, trim, 0, 1.735, 0.3575);
  box(0.94, 0.05, 0.035, trim, 0, 0.165, 0.3575);
  box(0.94, 0.05, 0.035, trim, 0, 0.610, 0.3575);
  box(0.94, 0.07, 0.03, dark, 0, 0.105, 0.35);        // kick strip

  // ---- BLANK DISPLAY PANEL: 0.62 x 1.08, face at z = +0.365 --------------
  box(0.62, 1.08, 0.03, panel, -0.115, 1.175, 0.350);

  // ---- selection column ---------------------------------------------------
  box(0.20, 1.08, 0.03, dark, 0.33, 1.175, 0.345);
  for (let i = 0; i < 8; i++) {
    const y = 0.78 + i * 0.13;
    box(0.11, 0.045, 0.025, trim, 0.30, y, 0.368);
    box(0.05, 0.045, 0.02, lit, 0.395, y, 0.366);
  }

  // ---- coin strip and delivery flap --------------------------------------
  box(0.20, 0.38, 0.03, trim, 0.33, 0.39, 0.350);
  box(0.02, 0.07, 0.02, dark, 0.33, 0.50, 0.368);     // coin slot
  box(0.11, 0.02, 0.02, dark, 0.33, 0.40, 0.368);     // note slot
  box(0.10, 0.06, 0.03, dark, 0.33, 0.27, 0.366);     // coin return
  box(0.58, 0.32, 0.05, dark, -0.13, 0.38, 0.335);    // flap recess
  box(0.52, 0.24, 0.04, trim, -0.13, 0.36, 0.353);    // flap
  box(0.52, 0.03, 0.03, dark, -0.13, 0.49, 0.353);    // hinge line

  // ---- door hinges down the left edge ------------------------------------
  for (const y of [0.35, 0.95, 1.55]) cyl(0.026, 0.11, 8, trim, -0.472, y, 0.335);

  // ---- back: vent, compressor, cable -------------------------------------
  box(0.80, 1.20, 0.02, dark, 0, 1.15, -0.35);
  box(0.50, 0.30, 0.02, dark, 0, 0.55, -0.355);
  for (const y of [0.45, 0.52, 0.59, 0.66]) box(0.46, 0.035, 0.02, trim, 0, y, -0.365);
  box(0.60, 0.30, 0.04, trim, 0, 0.30, -0.355);
  cyl(0.02, 0.26, 6, trim, -0.28, 0.15, -0.36, 0, Math.PI / 2);

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
