// corp_entrance — candidate B: swept profiles.
// The steps, the canopy with its recessed soffit tray and the parapet ring are
// sections swept along an axis; the pillars, planters and roof plant are
// extruded plans; the glazed wall is one extruded frame with every pane cut out
// of it as a hole; the revolving-door drum is lathed. 10.0 x 7.0 x 3.0, +Z front.
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

  const add = (geo, mat, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const EX = { bevelEnabled: false };
  const poly = (pts, holes) => {
    const s = new THREE.Shape();
    pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    s.closePath();
    (holes || []).forEach(([x0, y0, x1, y1]) => {
      const h = new THREE.Path();
      h.moveTo(x0, y0); h.lineTo(x1, y0); h.lineTo(x1, y1); h.lineTo(x0, y1); h.closePath();
      s.holes.push(h);
    });
    return s;
  };
  const rect = (x0, y0, x1, y1) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
  const plan = (w, d) => rect(-w / 2, -d / 2, w / 2, d / 2);
  const cut = (s, c) => {
    const h = s / 2;
    return poly([[-h + c, -h], [h - c, -h], [h, -h + c], [h, h - c],
                 [h - c, h], [-h + c, h], [-h, h - c], [-h, -h + c]]);
  };
  // a plan shape swept upward: shape x -> world x, shape y -> world -z
  const upx = (shape, depth) => new THREE.ExtrudeGeometry(shape, { depth, ...EX }).rotateX(-Math.PI / 2);
  // a cross-section swept along the width: shape x -> world -z, shape y -> world y
  const across = (shape, w) =>
    new THREE.ExtrudeGeometry(shape, { depth: w, ...EX }).rotateY(Math.PI / 2).translate(-w / 2, 0, 0);
  // a front-facing elevation swept back in z
  const flat = (shape, d) => new THREE.ExtrudeGeometry(shape, { depth: d, ...EX });
  const lathe = (pts, seg) =>
    new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

  // ------------------------------------------------------------- the steps
  add(across(poly([[-1.50, 0], [-1.50, 0.16], [-1.20, 0.16], [-1.20, 0.32],
                   [-0.90, 0.32], [-0.90, 0.48], [-0.60, 0.48], [-0.60, 0]]), 8.20),
      conc, 0, 0, 0);
  for (const [y, z, w] of [[0.155, 1.47, 8.24], [0.315, 1.17, 8.22], [0.475, 0.87, 8.20]])
    add(B(w, 0.025, 0.06), gun, 0, y, z);

  // ---------------------------------------------- mass, pillars, bay reveals
  add(B(7.00, 6.60, 0.92), white, 0, 3.30, -0.98);                    // z -1.44 .. -0.52
  add(flat(rect(-3.50, 3.92, 3.50, 6.60), 0.76), white, 0, 0, -0.52); // fascia, front +0.24
  add(B(7.00, 0.48, 1.14), conc, 0, 0.24, 0.05);                      // bay floor plinth

  for (const s of [-1, 1]) {
    add(upx(cut(1.50, 0.16), 7.00), white, s * 4.25, 0, -0.13);       // pillar, front +0.62
    add(B(1.50, 6.60, 0.56), white, s * 4.25, 3.30, -1.16);           // flank wall behind
    add(upx(cut(1.50, 0.34), 0.22), gun, s * 4.25, 0.46, -0.13);      // chamfered collars
    add(upx(cut(1.50, 0.34), 0.18), gun, s * 4.25, 6.60, -0.13);
    add(B(0.08, 6.00, 0.08), lit, s * 3.47, 3.56, 0.56);              // lit arris on the reveal
  }

  // ------------------------------------------- the glazed wall, panes cut out
  const holes = [];
  for (const [x0, x1] of [[-3.44, -2.80], [-2.73, -2.09], [-2.02, -1.52],
                          [1.52, 2.02], [2.09, 2.73], [2.80, 3.44]])
    for (const [y0, y1] of [[0.54, 1.46], [1.52, 2.44], [2.50, 3.34]]) holes.push([x0, y0, x1, y1]);
  holes.push([-1.45, 0.54, 1.45, 2.98], [-1.45, 3.04, 1.45, 3.34]);
  add(flat(poly([[-3.50, 0.48], [3.50, 0.48], [3.50, 3.40], [-3.50, 3.40]], holes), 0.10),
      gun, 0, 0, -0.54);
  add(B(7.00, 2.92, 0.06), glass, 0, 1.94, -0.58);
  add(B(7.06, 0.16, 0.20), gun, 0, 0.46, -0.48);
  add(B(7.06, 0.14, 0.20), gun, 0, 3.46, -0.48);

  // ------------------------------------------------ lathed revolving-door drum
  const DZ = -0.56;
  add(B(1.90, 2.50, 0.08), black, 0, 1.73, -0.74);                    // blocks the interior
  add(lathe([[0.84, 0.54], [0.84, 2.70]], 16), glassD, 0, 0, DZ);
  add(lathe([[0, 0.48], [0.94, 0.48], [0.94, 0.60], [0.86, 0.60]], 16), gun, 0, 0, DZ);
  add(lathe([[0.86, 2.66], [0.94, 2.66], [0.94, 2.86], [0, 2.86]], 16), white, 0, 0, DZ);
  add(new THREE.CylinderGeometry(0.10, 0.10, 2.16, 8), gun, 0, 1.62, DZ);
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Group(); p.position.set(0, 0, DZ); p.rotation.y = i * Math.PI / 2 + 0.45; g.add(p);
    const leaf = new THREE.Mesh(B(0.05, 2.12, 0.76), glass); leaf.position.set(0, 1.62, 0.42); p.add(leaf);
    const post = new THREE.Mesh(B(0.08, 2.12, 0.08), gun);  post.position.set(0, 1.62, 0.84); p.add(post);
  }
  for (const s of [-1, 1]) add(flat(rect(s * 1.14, 0.48, s * 1.46, 3.10), 0.36), white, 0, 0, -0.40);
  add(flat(rect(-1.46, 3.10, 1.46, 3.42), 0.36), white, 0, 0, -0.40);
  add(B(2.44, 0.08, 0.10), lit, 0, 3.16, -0.02);

  // -------------------------- canopy: one section, its soffit tray in the profile
  add(across(poly([[0.52, 3.92], [-1.50, 3.92], [-1.50, 3.52], [-1.34, 3.40],
                   [-1.10, 3.40], [-1.10, 3.58], [0.16, 3.58], [0.16, 3.40], [0.52, 3.40]]), 8.00),
      white, 0, 0, 0);
  add(B(6.50, 0.05, 0.36), lit, 0, 3.555, 0.47);                      // strip in the tray
  add(B(8.06, 0.09, 1.98), gun, 0, 3.96, 0.49);

  // --------------------------------------------------- blank emblem plate
  add(flat(cut(2.00, 0.24), 0.06), gun,   0, 5.16, 0.24);
  add(flat(cut(1.70, 0.20), 0.10), white, 0, 5.16, 0.28);
  for (const y of [4.06, 6.26]) add(B(3.80, 0.07, 0.05), gun, 0, y, 0.26);

  // ------------------------------------- parapet ring, roof deck, service unit
  add(upx(rect(-3.50, -0.24, 3.50, 1.44), 0.10), conc, 0, 6.50, 0);
  add(upx(poly([[-3.50, -0.24], [3.50, -0.24], [3.50, 1.44], [-3.50, 1.44]],
               [[-3.22, 0.04, 3.22, 1.16]]), 0.40), conc, 0, 6.60, 0);
  add(upx(cut(2.90, 0.30), 0.34), gun, 0, 6.60, -0.72);
  for (const x of [-0.92, 0, 0.92]) add(B(0.62, 0.10, 0.86), black, x, 6.96, -0.72);

  // ------------------------------------------------- planters and bollards
  for (const s of [-1, 1]) {
    add(upx(plan(1.24, 0.44), 0.62), conc,  s * 4.25, 0, 0.88);
    add(upx(plan(0.96, 0.22), 0.10), black, s * 4.25, 0.54, 0.88);    // recessed soil
    add(upx(plan(1.32, 0.52), 0.08), white, s * 4.25, 0.62, 0.88);    // rim
    add(lathe([[0, 0], [0.12, 0], [0.12, 0.92], [0.09, 1.00], [0, 1.00]], 10), gun, s * 4.25, 0, 1.33);
    add(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 10), lit, s * 4.25, 0.97, 1.33);
  }

  // --------------------------------------------- the back: plain, but modelled
  add(flat(rect(-5.00, 0, 5.00, 0.64), 0.08), conc, 0, 0, -1.50);
  add(flat(rect(-5.00, 6.30, 5.00, 6.64), 0.08), conc, 0, 0, -1.50);
  for (const x of [-2.70, 0, 2.70]) add(flat(rect(x - 0.34, 0.64, x + 0.34, 6.30), 0.08), white, 0, 0, -1.50);
  for (const s of [-1, 1]) add(flat(rect(s * 4.25 - 0.70, 0.64, s * 4.25 + 0.70, 6.30), 0.06), white, 0, 0, -1.50);
  add(flat(rect(-2.16, 0.10, -0.76, 2.30), 0.08), gun, 0, 0, -1.50);  // service door
  add(flat(rect(-2.02, 0.20, -0.90, 2.16), 0.05), black, 0, 0, -1.495);
  add(flat(rect(0.80, 1.10, 2.10, 2.10), 0.08), gun, 0, 0, -1.50);    // louvre grille
  for (const y of [1.24, 1.50, 1.76, 2.02]) add(B(1.14, 0.09, 0.05), black, 1.45, y, -1.465);
  add(flat(rect(3.34, 0.64, 4.02, 4.30), 0.10), gun, 0, 0, -1.50);    // riser duct

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
