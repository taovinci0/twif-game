// vending_machine — candidate C: a different part breakdown.
// Read as three assemblies rather than one cabinet: a steel carcass, a
// full-height hinged door that stands proud of it with a gasket and hinge
// barrels, and a service column bolted on beside the door. Worn, utilitarian.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name;
    return m;
  };
  const shell = M(0x2A2E33, 0.74, 'metal', 0.42);
  const door  = M(0x3A3F46, 0.56, 'metal', 0.60);
  const trim  = M(0x8C816F, 0.62, 'metal', 0.50);   // scuffed alloy hardware
  const dark  = M(0x080A0B, 0.86, 'metal', 0.30);
  const panel = M(0xE7DFC9, 0.62, 'plaster');       // <- lit display field
  const lit   = M(0xE66D32, 0.66, 'plaster');
  const foot  = M(0x111315, 0.90, 'stone');

  const box = (w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };
  const cyl = (r, h, seg, mat, x, y, z, rx = 0) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, 0, 0);
    g.add(m);
    return m;
  };

  // ---- feet and levelling bolts ------------------------------------------
  for (const x of [-0.37, 0.37]) for (const z of [-0.26, 0.20]) {
    box(0.14, 0.05, 0.14, foot, x, 0.025, z);
    cyl(0.022, 0.06, 6, trim, x, 0.06, z);
  }

  // ---- 1. carcass ---------------------------------------------------------
  box(0.92, 1.70, 0.60, shell, 0, 0.93, -0.065);      // y 0.08..1.78, z -0.365..0.235
  for (const s of [-1, 1]) {                          // side rails, ribs, hand-holds
    box(0.04, 1.66, 0.10, trim, s * 0.48, 0.93, 0.19);
    box(0.04, 1.66, 0.12, trim, s * 0.48, 0.93, -0.30);
    for (const y of [0.42, 0.96, 1.50]) box(0.03, 0.06, 0.44, trim, s * 0.475, y, -0.07);
    box(0.035, 0.20, 0.09, dark, s * 0.478, 1.66, -0.12);
    box(0.035, 0.09, 0.09, dark, s * 0.478, 0.30, -0.12);
  }
  box(0.88, 0.06, 0.54, dark, 0, 0.12, -0.065);       // plinth shadow

  // ---- 2. hinged door, standing proud ------------------------------------
  box(0.98, 1.64, 0.10, door, 0, 0.94, 0.285);        // z 0.235..0.335
  box(0.98, 0.03, 0.04, dark, 0, 1.775, 0.30);        // gasket top
  box(0.98, 0.03, 0.04, dark, 0, 0.115, 0.30);        // gasket bottom
  box(0.03, 1.66, 0.04, dark, -0.485, 0.94, 0.30);
  box(0.03, 1.66, 0.04, dark, 0.485, 0.94, 0.30);
  for (const y of [0.32, 0.94, 1.56]) {
    cyl(0.032, 0.14, 8, trim, -0.472, y, 0.30);
    box(0.09, 0.05, 0.05, trim, -0.44, y, 0.30);
  }
  cyl(0.030, 0.06, 8, trim, 0.435, 0.92, 0.345, Math.PI / 2);   // lock barrel
  box(0.05, 0.02, 0.02, dark, 0.435, 0.92, 0.372);

  // ---- 3. display opening with a raised bezel ----------------------------
  box(0.70, 1.06, 0.05, dark, -0.10, 1.20, 0.320);    // recess behind panel
  box(0.66, 1.02, 0.03, panel, -0.10, 1.20, 0.345);   // <- BLANK PANEL, face z = 0.360
  box(0.74, 0.05, 0.08, trim, -0.10, 1.755, 0.335);   // bezel
  box(0.74, 0.05, 0.08, trim, -0.10, 0.645, 0.335);
  box(0.05, 1.16, 0.08, trim, -0.455, 1.20, 0.335);
  box(0.05, 1.16, 0.08, trim, 0.255, 1.20, 0.335);

  // ---- 4. service column bolted on beside the door -----------------------
  box(0.22, 1.56, 0.08, shell, 0.365, 0.94, 0.295);   // z 0.255..0.335
  box(0.18, 1.02, 0.05, dark, 0.365, 1.20, 0.345);    // selection trench
  for (let i = 0; i < 7; i++) {
    const y = 0.78 + i * 0.145;
    box(0.10, 0.05, 0.035, trim, 0.335, y, 0.365);
    box(0.045, 0.05, 0.02, lit, 0.425, y, 0.362);
  }
  box(0.18, 0.36, 0.05, dark, 0.365, 0.44, 0.345);    // coin strip
  box(0.02, 0.08, 0.02, dark, 0.365, 0.55, 0.372);    // coin slot
  box(0.12, 0.02, 0.02, dark, 0.365, 0.44, 0.372);    // note slot
  box(0.11, 0.07, 0.03, dark, 0.365, 0.30, 0.370);    // coin return
  for (const y of [1.72, 0.20]) box(0.24, 0.05, 0.10, trim, 0.365, y, 0.290);

  // ---- 5. delivery flap ---------------------------------------------------
  box(0.60, 0.34, 0.05, dark, -0.12, 0.38, 0.320);
  box(0.54, 0.26, 0.05, trim, -0.12, 0.365, 0.350);
  box(0.54, 0.03, 0.04, dark, -0.12, 0.50, 0.352);
  box(0.16, 0.03, 0.03, trim, -0.12, 0.26, 0.368);    // pull lip

  // ---- 6. shallow lipped top ---------------------------------------------
  box(1.00, 0.08, 0.75, shell, 0, 1.82, 0);           // 1.78..1.86
  box(1.00, 0.04, 0.05, trim, 0, 1.88, 0.35);
  box(1.00, 0.04, 0.05, trim, 0, 1.88, -0.35);
  box(0.05, 0.04, 0.75, trim, -0.475, 1.88, 0);
  box(0.05, 0.04, 0.75, trim, 0.475, 1.88, 0);
  box(0.88, 0.02, 0.63, dark, 0, 1.87, 0);

  // ---- 7. wear: offset patch plates --------------------------------------
  box(0.26, 0.20, 0.012, shell, -0.30, 0.30, 0.342);
  box(0.012, 0.30, 0.16, shell, 0.494, 1.24, -0.16);
  box(0.30, 0.02, 0.02, dark, 0.10, 1.66, 0.345);

  // ---- 8. back: vent, compressor, cable ----------------------------------
  box(0.78, 1.00, 0.02, dark, 0, 1.20, -0.352);
  box(0.52, 0.34, 0.02, dark, 0, 0.55, -0.358);
  for (const y of [0.43, 0.51, 0.59, 0.67]) box(0.48, 0.04, 0.02, trim, 0, y, -0.365);
  box(0.64, 0.28, 0.02, shell, 0, 0.26, -0.365);
  cyl(0.02, 0.24, 6, trim, -0.24, 0.14, -0.345);

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
