// convenience_store — candidate A: primitive assembly (Box/Cylinder).
// Single-storey corner shop, 8.0 x 4.0 x 6.0 m. Blank fascia band for sign art.
// No glyphs anywhere; every sign field is flat blank geometry.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name;
    return m;
  };

  const wall  = M(0x111315, 0.88, 'stone');          // building mass
  const dark  = M(0x080A0B, 0.90, 'stone');          // deep shadow / recess
  const trim  = M(0x3A3F46, 0.52, 'metal', 0.62);    // frames, mullions, hardware
  const kerb  = M(0x8C816F, 0.92, 'stone');          // plinth, copings, sills
  const cream = M(0xE7DFC9, 0.66, 'plaster');        // lit sign fields (emissive hook)
  const warm  = M(0xE66D32, 0.70, 'plaster');        // warm interior glow
  const glass = M(0x1B2A33, 0.12, 'tile', 0.25);
  const gold  = M(0xD4A24C, 0.38, 'metal', 0.6);
  const wood  = M(0x6E5F49, 0.95, 'timber');

  const box = (w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };
  const cyl = (rt, rb, h, seg, mat, x, y, z, rx = 0, rz = 0) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, 0, rz);
    g.add(m);
    return m;
  };

  // ---- 1. kerb plinth ------------------------------------------------------
  box(7.24, 0.14, 5.84, kerb, 0, 0.07, 0);
  box(7.32, 0.05, 5.92, dark, 0, 0.115, 0);

  // ---- 2. shell: walls, floor, roof slab -----------------------------------
  box(7.10, 3.56, 0.26, wall, 0, 1.92, -2.72);       // back wall
  box(0.26, 3.56, 5.70, wall, -3.42, 1.92, 0);       // left wall
  box(0.26, 3.56, 5.70, wall, 3.42, 1.92, 0);        // right wall
  box(7.10, 0.10, 5.70, dark, 0, 0.19, 0);           // floor
  box(7.10, 0.16, 5.70, wall, 0, 3.62, 0);           // roof slab

  // ---- 3. front piers ------------------------------------------------------
  box(0.55, 1.96, 0.32, wall, -3.275, 1.12, 2.69);
  box(0.55, 1.96, 0.32, wall, 3.275, 1.12, 2.69);

  // ---- 4. fascia band, full width. BLANK SIGN PANEL ------------------------
  box(7.24, 1.60, 0.16, trim, 0, 2.90, 2.87);         // fascia carcass
  box(7.00, 1.50, 0.05, cream, 0, 2.90, 2.975);       // <- blank panel, face z = 3.00
  box(7.24, 0.09, 0.18, trim, 0, 3.655, 2.91);        // frame: top
  box(7.24, 0.09, 0.18, trim, 0, 2.145, 2.91);        // frame: bottom
  box(0.12, 1.60, 0.18, trim, -3.58, 2.90, 2.91);     // frame: left
  box(0.12, 1.60, 0.18, trim, 3.58, 2.90, 2.91);      // frame: right
  for (const x of [-2.3, 0, 2.3]) box(0.90, 0.05, 0.16, gold, x, 2.06, 2.92);

  // ---- 5. narrow parapet + coping -----------------------------------------
  box(7.24, 0.18, 0.26, wall, 0, 3.79, 2.87);
  box(7.24, 0.18, 0.26, wall, 0, 3.79, -2.72);
  box(0.26, 0.18, 5.70, wall, -3.42, 3.79, 0);
  box(0.26, 0.18, 5.70, wall, 3.42, 3.79, 0);
  box(7.30, 0.05, 0.26, kerb, 0, 3.905, 2.87);
  box(7.30, 0.05, 0.28, kerb, 0, 3.905, -2.72);
  box(0.34, 0.05, 5.76, kerb, -3.46, 3.905, 0);
  box(0.34, 0.05, 5.76, kerb, 3.46, 3.905, 0);

  // ---- 6. roof units, set back --------------------------------------------
  box(1.20, 0.20, 0.95, trim, -1.45, 3.80, -0.60);
  box(1.26, 0.04, 1.00, dark, -1.45, 3.92, -0.60);
  cyl(0.30, 0.30, 0.06, 12, trim, -1.45, 3.97, -0.60);
  cyl(0.08, 0.08, 0.06, 8, dark, -1.45, 3.97, -0.60);
  box(0.95, 0.26, 0.72, trim, 1.35, 3.83, -1.50);
  box(1.00, 0.04, 0.78, dark, 1.35, 3.98, -1.50);
  for (const y of [3.75, 3.81, 3.87]) box(0.80, 0.03, 0.05, dark, 1.35, y, -1.13);
  box(0.26, 0.16, 1.00, trim, -0.20, 3.78, -1.10);
  cyl(0.05, 0.05, 0.26, 8, trim, 0.60, 3.83, -0.40);

  // ---- 7. glazed shopfront: tall windows, slim mullions --------------------
  box(4.70, 0.34, 0.26, wall, -0.65, 0.31, 2.72);     // stallriser
  box(4.86, 0.07, 0.24, kerb, -0.65, 0.515, 2.73);    // sill
  box(4.70, 1.55, 0.04, glass, -0.65, 1.325, 2.74);   // glazing
  for (const x of [-1.825, -0.65, 0.525]) box(0.07, 1.55, 0.14, trim, x, 1.325, 2.76);
  box(0.10, 1.55, 0.16, trim, -2.955, 1.325, 2.77);
  box(0.10, 1.55, 0.16, trim, 1.655, 1.325, 2.77);
  box(4.70, 0.06, 0.14, trim, -0.65, 1.86, 2.76);     // transom
  box(4.86, 0.10, 0.20, trim, -0.65, 2.05, 2.76);     // head

  // ---- 8. recessed doorway under a small flat canopy -----------------------
  box(0.14, 1.96, 0.55, wall, 1.77, 1.12, 2.575);
  box(0.14, 1.96, 0.55, wall, 2.93, 1.12, 2.575);
  box(1.42, 0.12, 0.60, trim, 2.35, 2.04, 2.55);      // canopy
  box(1.10, 0.04, 0.26, cream, 2.35, 1.96, 2.60);     // canopy downlight
  box(1.20, 0.03, 0.52, dark, 2.35, 0.155, 2.56);     // mat
  box(1.22, 1.92, 0.08, trim, 2.35, 1.10, 2.30);      // door frame
  box(1.02, 1.80, 0.05, glass, 2.35, 1.09, 2.32);     // door leaf
  box(1.02, 0.16, 0.07, trim, 2.35, 0.26, 2.33);
  box(1.02, 0.10, 0.07, trim, 2.35, 1.94, 2.33);
  box(0.05, 0.80, 0.05, trim, 2.72, 1.10, 2.36);      // handle

  // ---- 9. interior read: stepped shelving behind the glass -----------------
  box(6.20, 1.70, 0.05, warm, 0, 1.30, -2.56);        // lit back wall
  for (const z of [1.2, -0.3, -1.8]) box(5.60, 0.05, 0.16, cream, 0, 3.50, z);
  for (const x of [-2.55, -1.30, -0.05, 1.05]) {
    box(1.05, 0.50, 0.40, dark, x, 0.49, 2.05);
    box(1.05, 0.42, 0.34, dark, x, 1.00, 2.00);
    box(1.05, 0.36, 0.28, dark, x, 1.44, 1.96);
    box(0.95, 0.10, 0.03, cream, x, 0.70, 2.26);
    box(0.95, 0.10, 0.03, warm, x, 1.17, 2.18);
  }
  box(1.30, 0.95, 0.65, dark, 1.10, 0.715, 1.30);     // counter
  box(1.38, 0.06, 0.72, kerb, 1.10, 1.22, 1.30);

  // ---- 10. left wall: blank blade sign on a short bracket ------------------
  for (const y of [3.20, 1.70]) box(0.34, 0.08, 0.10, trim, -3.71, y, 0.40);
  box(0.07, 1.70, 0.10, trim, -3.90, 2.45, 0.40);
  box(0.12, 1.92, 0.64, trim, -3.93, 2.45, 0.40);     // blade frame
  box(0.03, 1.76, 0.54, cream, -3.985, 2.45, 0.40);   // <- blank panel, face x = -4.00
  box(0.03, 1.76, 0.54, cream, -3.875, 2.45, 0.40);   // inboard face

  // ---- 11. right wall: service door + stacked crates ----------------------
  box(0.09, 2.02, 1.00, trim, 3.545, 1.15, -1.30);
  box(0.07, 1.90, 0.88, wall, 3.53, 1.09, -1.30);
  box(0.06, 0.05, 0.16, trim, 3.60, 1.05, -0.95);
  box(0.30, 0.12, 1.10, kerb, 3.70, 0.06, -1.30);
  box(0.40, 0.50, 0.46, wood, 3.75, 0.25, 0.30);
  box(0.43, 0.05, 0.49, dark, 3.75, 0.50, 0.30);
  box(0.40, 0.46, 0.44, wood, 3.75, 0.76, 0.32);
  box(0.43, 0.05, 0.47, dark, 3.75, 0.99, 0.32);
  box(0.38, 0.42, 0.42, wood, 3.74, 0.21, 0.95);
  box(0.41, 0.05, 0.45, dark, 3.74, 0.42, 0.95);
  for (const y of [0.14, 0.36]) box(0.36, 0.04, 0.02, dark, 3.75, y, 0.53);

  // ---- 12. back elevation: roller shutter, vent, service door -------------
  box(2.70, 0.30, 0.16, trim, -0.30, 2.30, -2.91);    // shutter housing
  for (const x of [-1.60, 1.00]) box(0.12, 2.20, 0.12, trim, x, 1.20, -2.90);
  for (let i = 0; i < 8; i++) {
    box(2.44, 0.20, 0.07, i % 2 ? dark : trim, -0.30, 0.28 + i * 0.25, -2.885);
  }
  box(0.85, 0.62, 0.14, trim, -2.55, 2.55, -2.90);    // vent
  for (const y of [2.32, 2.47, 2.62, 2.77]) box(0.74, 0.07, 0.04, dark, -2.55, y, -2.965);
  box(0.95, 2.00, 0.08, trim, 2.30, 1.14, -2.89);     // rear door
  box(0.80, 1.80, 0.04, wall, 2.30, 1.10, -2.92);
  box(0.34, 0.46, 0.14, trim, -1.90, 1.40, -2.92);    // meter box
  box(3.00, 0.10, 0.06, dark, 0.80, 3.50, -2.90);     // rail
  cyl(0.07, 0.07, 3.56, 8, trim, -3.30, 1.92, -2.78); // downpipe
  for (const y of [0.80, 2.80]) box(0.18, 0.06, 0.18, trim, -3.30, y, -2.78);

  // ---- contract: base at y=0, centred on x and z ---------------------------
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
