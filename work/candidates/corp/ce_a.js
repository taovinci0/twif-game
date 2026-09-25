// corp_entrance — candidate A: primitive assembly.
// Boxes for the mass, steps, pillars, canopy and mullion grid; cylinders for the
// revolving-door drum and the bollards. 10.0 x 7.0 x 3.0, front faces +Z.
export default function (THREE) {
  const g = new THREE.Group();

  const M = (color, roughness, name, metalness = 0, side) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (side) m.side = side;
    m.name = name;
    return m;
  };
  const white = M(0xE9E9EC, 0.52, 'metal', 0.08);   // sterile panel
  const conc  = M(0xE9E9EC, 0.88, 'stone');         // steps, planters, parapet
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

  // ------------------------------------------------------ mass behind the bay
  add(B(7.40, 6.50, 0.94), white, 0, 3.25, -0.95);          // z -1.42 .. -0.48
  add(B(7.40, 2.64, 0.68), white, 0, 5.18, -0.14);          // fascia, front z +0.20
  add(B(7.40, 0.16, 0.74), gun,   0, 3.78, -0.11);          // band over the bay head

  // ----------------------------------------------- the two full-height pillars
  for (const s of [-1, 1]) {
    add(B(1.30, 7.00, 1.30), white, s * 4.35, 3.50, -0.05);  // square pillar, front +0.60
    add(B(1.18, 6.50, 0.82), white, s * 4.35, 3.25, -1.01);  // flank wall behind it
    add(B(1.30, 0.18, 1.42), gun,   s * 4.35, 0.52, -0.05);  // pillar base band
    add(B(1.30, 0.14, 1.42), gun,   s * 4.35, 6.70, -0.05);  // pillar head band
    add(B(0.07, 5.90, 0.07), lit,   s * 3.66, 3.60,  0.56);  // slim lit arris on the reveal
  }

  // -------------------------------------------------------- the glazed wall
  add(B(7.36, 2.91, 0.06), glass, 0, 1.905, -0.45);
  add(B(7.40, 0.16, 0.16), gun,   0, 0.45, -0.42);          // sill
  add(B(7.40, 0.14, 0.16), gun,   0, 3.42, -0.42);          // head
  for (const x of [-3.067, -2.454, -1.841, 1.841, 2.454, 3.067])
    add(B(0.07, 2.91, 0.10), gun, x, 1.905, -0.40);          // slim mullions
  for (const y of [1.20, 1.95, 2.70]) for (const s of [-1, 1])
    add(B(2.13, 0.06, 0.10), gun, s * 2.615, y, -0.40);      // transoms
  add(B(7.36, 0.06, 0.10), gun, 0, 3.14, -0.40);

  // ---------------------------------------------------- revolving door drum
  add(B(1.90, 2.45, 0.08), black, 0, 1.675, -0.65);          // blocks the drum interior
  add(new THREE.CylinderGeometry(0.85, 0.85, 2.30, 18, 1, true), glassD, 0, 1.60, -0.55);
  add(new THREE.CylinderGeometry(0.95, 0.95, 0.18, 18), white, 0, 2.84, -0.55);
  add(new THREE.CylinderGeometry(0.95, 0.95, 0.07, 18), gun,   0, 0.485, -0.55);
  add(new THREE.CylinderGeometry(0.09, 0.09, 2.28, 8), gun,    0, 1.60, -0.55);
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Group(); p.position.set(0, 0, -0.55); p.rotation.y = i * Math.PI / 2 + 0.4; g.add(p);
    add(B(0.05, 2.24, 0.78), glass, 0, 1.60, 0.42, 0, 0, 0, p);
    add(B(0.07, 2.24, 0.07), gun,   0, 1.60, 0.80, 0, 0, 0, p);
  }
  // squared surround
  for (const s of [-1, 1]) add(B(0.30, 2.62, 0.34), white, s * 1.28, 1.76, -0.32);
  add(B(2.86, 0.30, 0.34), white, 0, 3.22, -0.32);
  add(B(2.40, 0.08, 0.10), lit,   0, 3.06, -0.18);

  // ------------------------------------------------------------ canopy slab
  add(B(7.80, 0.34, 1.98), white, 0, 3.69, 0.51);            // 3.52 .. 3.86
  add(B(7.80, 0.16, 0.36), conc,  0, 3.44, 1.32);            // soffit rim, front
  add(B(7.80, 0.16, 0.36), conc,  0, 3.44, -0.30);           // soffit rim, back
  for (const s of [-1, 1]) add(B(0.50, 0.16, 1.26), conc, s * 3.65, 3.44, 0.51);
  add(B(6.40, 0.05, 0.34), lit, 0, 3.495, 0.51);             // recessed lit strip
  add(B(7.86, 0.08, 1.98), gun, 0, 3.90, 0.51);              // upstand fascia trim

  // ------------------------------------------------- blank emblem plate above
  add(B(1.96, 1.96, 0.06), gun,   0, 5.10, 0.22);
  add(B(1.68, 1.68, 0.09), white, 0, 5.10, 0.26);
  add(B(3.60, 0.06, 0.05), gun,   0, 3.98, 0.22);
  add(B(3.60, 0.06, 0.05), gun,   0, 6.22, 0.22);

  // -------------------------------------------------- parapet and roof plant
  add(B(7.40, 0.10, 1.70), conc, 0, 6.55, -0.62);            // roof deck
  add(B(7.40, 0.50, 0.32), conc, 0, 6.75, 0.04);             // front parapet
  add(B(7.40, 0.50, 0.26), conc, 0, 6.75, -1.29);            // back parapet
  add(B(2.80, 0.38, 0.80), gun,  0, 6.74, -0.90);            // service unit, set back
  for (const x of [-0.9, 0, 0.9]) add(B(0.60, 0.10, 0.84), black, x, 6.95, -0.90);

  // ------------------------------------------------------------ the steps
  add(B(7.90, 0.15, 0.90), conc, 0, 0.075, 1.05);
  add(B(7.70, 0.15, 0.60), conc, 0, 0.225, 0.90);
  add(B(7.50, 0.15, 0.30), conc, 0, 0.375, 0.75);
  for (const [y, z, w] of [[0.145, 1.47, 7.90], [0.295, 1.17, 7.70], [0.445, 0.87, 7.50]])
    add(B(w, 0.03, 0.06), gun, 0, y, z);                     // nosings
  add(B(7.36, 0.45, 1.16), conc, 0, 0.225, 0.04);            // bay floor plinth

  // ------------------------------------------------- planters and bollards
  for (const s of [-1, 1]) {
    add(B(1.16, 0.62, 0.50), conc,  s * 4.35, 0.31, 0.85);
    add(B(0.92, 0.10, 0.30), black, s * 4.35, 0.60, 0.85);   // recessed soil
    add(B(1.22, 0.07, 0.56), white, s * 4.35, 0.66, 0.85);   // rim
    add(new THREE.CylinderGeometry(0.10, 0.11, 1.00, 10), gun, s * 4.35, 0.50, 1.35);
    add(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 10), lit, s * 4.35, 0.98, 1.35);
  }

  // --------------------------------------------- the back: plain, but modelled
  add(B(10.00, 0.60, 0.08), conc,  0, 0.30, -1.46);          // plinth band
  add(B(10.00, 0.34, 0.08), conc,  0, 6.62, -1.46);          // eaves band
  for (const x of [-2.55, 0, 2.55]) add(B(0.62, 5.70, 0.08), white, x, 3.47, -1.46);
  add(B(1.40, 2.20, 0.08), gun,   -1.40, 1.10, -1.46);       // service door
  add(B(1.16, 1.96, 0.05), black, -1.40, 1.10, -1.455);
  add(B(1.30, 1.00, 0.08), gun,    1.45, 1.60, -1.46);       // louvre grille
  for (const y of [1.26, 1.50, 1.74, 1.98]) add(B(1.14, 0.08, 0.05), black, 1.45, y, -1.455);
  add(B(0.70, 3.40, 0.10), gun,    3.10, 4.20, -1.45);       // riser duct
  for (const s of [-1, 1]) add(B(1.18, 6.50, 0.06), white, s * 4.35, 3.25, -1.45);

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
