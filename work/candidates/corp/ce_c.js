// corp_entrance — candidate C: a different reading of the same frontage.
// Read as a thick portal frame rather than two pillars beside a flat wall: the
// jambs step inward in two planes, the glazing sits a metre and a half back, the
// canopy is a thin braced blade instead of a fat slab, the drum stands free in
// the recess, and the flight of steps narrows as it rises so it wraps the
// corners. 10.0 x 7.0 x 3.0, front faces +Z.
export default function (THREE) {
  const g = new THREE.Group();

  const M = (color, roughness, name, metalness = 0, side) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (side) m.side = side;
    m.name = name;
    return m;
  };
  const white = M(0xE9E9EC, 0.52, 'metal', 0.08);
  const conc  = M(0xE9E9EC, 0.88, 'stone');
  const gun   = M(0x3A3F46, 0.40, 'metal', 0.70);
  const black = M(0x080A0B, 0.55, 'metal', 0.25);
  const glass = M(0x111315, 0.14, 'metal', 0.40);
  const glassD = M(0x111315, 0.14, 'metal', 0.40, THREE.DoubleSide);
  const lit   = M(0xBFE4FF, 0.42, 'plaster');

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent = g) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  // ------------------------------------------------------- the portal frame
  add(B(10.00, 6.55, 0.72), white, 0, 3.275, -1.14);        // back mass, z -1.50 .. -0.78
  for (const s of [-1, 1]) {
    add(B(1.40, 7.00, 1.40), white, s * 4.30, 3.50, -0.08);  // outer blade, front +0.62
    add(B(0.50, 6.55, 0.88), white, s * 3.35, 3.275, -0.34); // inner jamb, front +0.10
    add(B(1.40, 0.20, 1.46), gun,   s * 4.30, 0.55, -0.08);  // blade collars
    add(B(1.40, 0.16, 1.46), gun,   s * 4.30, 6.72, -0.08);
    add(B(0.08, 5.90, 0.08), lit,   s * 3.06, 3.45,  0.06);  // lit arris on the inner jamb
  }
  add(B(6.20, 0.55, 0.88), white, 0, 3.725, -0.34);          // head beam over the bay
  add(B(6.20, 2.55, 0.88), white, 0, 5.275, -0.34);          // fascia above the canopy
  add(B(6.30, 0.10, 0.92), gun,   0, 4.03, -0.34);

  // --------------------------------------------- the deep glazed wall, set back
  add(B(6.12, 2.92, 0.06), glass, 0, 1.94, -0.74);
  add(B(6.16, 0.16, 0.20), gun, 0, 0.46, -0.68);
  add(B(6.16, 0.16, 0.20), gun, 0, 3.46, -0.68);
  for (const x of [-2.55, -1.70, 1.70, 2.55])
    add(B(0.08, 2.92, 0.14), gun, x, 1.94, -0.66);
  for (const y of [1.14, 1.84, 2.54]) for (const s of [-1, 1])
    add(B(1.66, 0.07, 0.14), gun, s * 2.24, y, -0.66);
  add(B(6.12, 0.07, 0.14), gun, 0, 3.06, -0.66);
  add(B(6.12, 0.46, 0.10), black, 0, 3.23, -0.70);           // spandrel above the glazing

  // ------------------------------- revolving drum, freestanding in the recess
  const DZ = -0.42;
  add(B(1.96, 2.52, 0.08), black, 0, 1.74, -0.70);
  add(new THREE.CylinderGeometry(0.88, 0.88, 2.18, 16, 1, true), glassD, 0, 1.58, DZ);
  add(new THREE.CylinderGeometry(0.98, 0.98, 0.10, 16), gun,   0, 0.50, DZ);
  add(new THREE.CylinderGeometry(0.98, 0.98, 0.22, 16), white, 0, 2.78, DZ);
  add(new THREE.CylinderGeometry(0.10, 0.10, 2.16, 8), gun,    0, 1.58, DZ);
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Group(); p.position.set(0, 0, DZ); p.rotation.y = i * Math.PI / 2 + 0.45; g.add(p);
    add(B(0.05, 2.12, 0.80), glass, 0, 1.58, 0.44, 0, 0, 0, p);
    add(B(0.09, 2.12, 0.09), gun,   0, 1.58, 0.86, 0, 0, 0, p);
  }
  // the squared surround the drum sits in
  for (const s of [-1, 1]) add(B(0.34, 3.06, 0.96), white, s * 1.32, 1.98, -0.28);
  add(B(2.98, 0.34, 0.96), white, 0, 3.34, -0.28);
  add(B(2.60, 0.08, 0.12), lit, 0, 3.15, 0.14);

  // ------------------------------------------- the canopy: a braced thin blade
  add(B(8.40, 0.18, 1.60), white, 0, 3.71, 0.70);            // slab 3.62 .. 3.80
  add(B(8.40, 0.10, 0.28), conc, 0, 3.57, 1.36);             // soffit rim, front
  add(B(8.40, 0.10, 0.28), conc, 0, 3.57, 0.04);             // soffit rim, back
  for (const s of [-1, 1]) add(B(0.34, 0.10, 1.04), conc, s * 4.03, 3.57, 0.70);
  add(B(7.40, 0.05, 0.34), lit, 0, 3.645, 0.70);             // recessed lit strip
  add(B(8.46, 0.08, 1.60), gun, 0, 3.84, 0.70);              // edge band
  for (const s of [-1, 1])
    add(B(0.16, 1.203, 0.22), gun, s * 3.72, 4.20, 0.75, -0.842);   // struts back to the blades

  // ------------------------------------------------ blank emblem plate, fascia
  add(B(2.50, 1.70, 0.07), gun,   0, 5.20, 0.13);
  add(B(2.20, 1.42, 0.10), white, 0, 5.20, 0.17);
  for (const y of [4.24, 6.16]) add(B(4.40, 0.07, 0.05), gun, 0, y, 0.13);

  // --------------------------------------- parapet, roof deck and service plant
  add(B(7.20, 0.10, 1.66), conc, 0, 6.60, -0.65);            // deck z -1.48 .. 0.18
  add(B(7.20, 0.45, 0.26), conc, 0, 6.77, 0.05);             // front parapet
  add(B(7.20, 0.45, 0.24), conc, 0, 6.77, -1.36);            // back parapet
  add(B(3.20, 0.38, 0.84), gun,  0, 6.84, -0.78);            // service unit, set back
  for (const x of [-1.00, 0, 1.00]) add(B(0.72, 0.12, 0.88), black, x, 7.00 - 0.06, -0.78);
  add(B(0.70, 0.30, 0.70), gun, 2.10, 6.80, -0.78);

  // ------------------------------- steps: each course narrower, so they wrap
  add(B(7.80, 0.15, 0.88), conc, 0, 0.075, 1.06);
  add(B(7.40, 0.15, 0.58), conc, 0, 0.225, 0.91);
  add(B(7.00, 0.15, 0.28), conc, 0, 0.375, 0.76);
  for (const [y, z, w] of [[0.145, 1.47, 7.84], [0.295, 1.17, 7.44], [0.445, 0.87, 7.04]])
    add(B(w, 0.03, 0.06), gun, 0, y, z);
  add(B(6.20, 0.45, 1.40), conc, 0, 0.225, -0.08);           // bay floor

  // ------------------------------------------------- planters and bollards
  for (const s of [-1, 1]) {
    add(B(1.10, 0.58, 0.62), conc,  s * 4.45, 0.29, 0.95);
    add(B(0.86, 0.10, 0.40), black, s * 4.45, 0.56, 0.95);
    add(B(1.10, 0.07, 0.72), white, s * 4.45, 0.62, 0.95);
    add(new THREE.CylinderGeometry(0.10, 0.11, 1.02, 10), gun, s * 4.45, 0.51, 1.37);
    add(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 10), lit, s * 4.45, 1.00, 1.37);
  }

  // --------------------------------------------- the back: plain, but modelled
  add(B(10.00, 0.66, 0.08), conc, 0, 0.33, -1.46);
  add(B(10.00, 0.30, 0.08), conc, 0, 6.40, -1.46);
  for (const x of [-3.60, -1.20, 1.20, 3.60]) add(B(0.56, 5.40, 0.08), white, x, 3.45, -1.46);
  add(B(2.10, 2.50, 0.08), gun,  -2.40, 1.25, -1.46);        // loading door
  add(B(1.86, 2.26, 0.05), black, -2.40, 1.23, -1.455);
  add(B(1.60, 1.10, 0.08), gun,   2.40, 1.90, -1.46);        // louvre grille
  for (const y of [1.54, 1.82, 2.10, 2.38]) add(B(1.42, 0.09, 0.05), black, 2.40, y, -1.455);
  add(B(0.80, 4.20, 0.10), gun,   0.00, 3.60, -1.45);        // riser duct
  add(B(1.20, 0.26, 0.10), gun,   0.00, 5.86, -1.45);

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
