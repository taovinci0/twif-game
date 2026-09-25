// Shop block — 9 x 11 x 9 m filler block, placed dozens of times behind the
// hero buildings.
//
// Chosen from three candidates by looking at the verifier sheet. The ribbed
// tower read as a multi-storey car park: its fins were too fine and too many,
// and its off-centre setback broke the roofline. The banded-shaft one read as
// a stack of louvres, because its sills were the pale trim colour and merged
// with the glazing into horizontal ribbons. This one won on one thing: with the
// wall around each opening in the dark mass colour and a real 0.35 m reveal,
// the windows read as a grid of separate lit rectangles at street distance.
//
// Refined after the choice. The winner drew each elevation as one extruded
// Shape with sixteen holes, which is 2,520 triangles for geometry that is
// mostly two triangulated caps, one of them buried in the core and never seen.
// The reveal is rebuilt here from proud mullions and transom rings at the same
// dimensions: identical reading, roughly a third of the cost, which matters
// when the street holds dozens of these.
//
// All four elevations are modelled: the two without a shopfront carry a service
// door, a shutter and vents, and the fire escape zigzags up the back. Window and
// sign materials are named 'plaster' so the lighting system can find them and
// make them emit. Every panel is blank geometry; no glyphs anywhere.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0, side) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (side) m.side = side;
    m.name = name; return m;
  };
  const mass  = M(0x111315, 0.90, 'stone');
  const trim  = M(0x8C816F, 0.88, 'stone');
  const dark  = M(0x080A0B, 0.88, 'stone');
  const steel = M(0x3A3F46, 0.50, 'metal', 0.65);
  const win   = M(0xE7DFC9, 0.62, 'plaster', 0, THREE.DoubleSide);
  const shopw = M(0xE66D32, 0.55, 'plaster', 0, THREE.DoubleSide);
  const sign  = M(0xE7DFC9, 0.70, 'plaster');

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
    g.add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  // a window is a panel, not a bevelled frame: two triangles each
  const pane = (w, h) => new THREE.PlaneGeometry(w, h);
  // never bevel: bevelSize grows a profile outward and drops it below its base
  const ex = (shape, depth) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 });
  const elevation = (w, h) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.closePath();
    return s;
  };
  const holeAt = (cx, cy, w, h) => {
    const p = new THREE.Path();
    p.moveTo(cx - w / 2, cy - h / 2); p.lineTo(cx - w / 2, cy + h / 2);
    p.lineTo(cx + w / 2, cy + h / 2); p.lineTo(cx + w / 2, cy - h / 2); p.closePath();
    return p;
  };
  const ring = (outer, inner) => {
    const o = outer / 2, i = inner / 2;
    const s = new THREE.Shape();
    s.moveTo(-o, -o); s.lineTo(o, -o); s.lineTo(o, o); s.lineTo(-o, o); s.closePath();
    const h = new THREE.Path();
    h.moveTo(-i, -i); h.lineTo(-i, i); h.lineTo(i, i); h.lineTo(i, -i); h.closePath();
    s.holes.push(h);
    return s;
  };
  // the same four panes on all four elevations, facing outward
  const around = (geo, mat, u, r, y) => {
    add(geo, mat, u, y, r);
    add(geo, mat, u, y, -r, 0, Math.PI);
    add(geo, mat, r, y, u, 0, Math.PI / 2);
    add(geo, mat, -r, y, u, 0, -Math.PI / 2);
  };

  // ============ base storey, 0 -> 3.20, shopfront on +Z and +X
  add(B(9.00, 0.40, 9.00), trim, 0, 0.20, 0);
  add(B(8.30, 2.44, 8.30), dark, 0, 1.62, 0);
  const solidBase = ex(elevation(9.00, 2.44), 0.36);
  const shopBase = (() => {
    const s = elevation(9.00, 2.44);
    for (const b of [-2.60, 0, 2.60]) s.holes.push(holeAt(b, 1.28, 2.00, 1.86));
    return ex(s, 0.36);
  })();
  add(solidBase, mass, 0, 0.40, -4.50);
  add(solidBase, mass, -4.50, 0.40, 0, 0, Math.PI / 2);
  add(shopBase, mass, 0, 0.40, 4.14);
  add(shopBase, mass, 4.14, 0.40, 0, 0, Math.PI / 2);
  for (const b of [-2.60, 0, 2.60]) {
    add(pane(2.00, 1.86), shopw, b, 1.68, 4.26);
    add(pane(2.00, 1.86), shopw, 4.26, 1.68, b, 0, Math.PI / 2);
  }
  // the two blind elevations are service frontage, not blank wall
  add(B(1.30, 2.10, 0.10), steel, -1.40, 1.45, -4.53);        // service door
  add(B(1.50, 0.14, 0.40), trim, -1.40, 2.58, -4.66);         // its canopy
  for (const x of [1.10, 2.60]) add(B(0.90, 0.60, 0.10), steel, x, 1.90, -4.53);
  add(B(0.10, 2.30, 2.70), steel, -4.53, 1.55, -1.20);        // roller shutter
  for (const z of [1.30, 2.80]) add(B(0.10, 0.60, 0.90), steel, -4.53, 1.90, z);
  add(B(9.06, 0.36, 9.06), trim, 0, 3.02, 0);

  // ============ shaft, 3.20 -> 8.00. Four rows of four on every elevation,
  // recessed 0.35 behind proud mullions and continuous transom rings.
  add(B(8.30, 4.80, 8.30), dark, 0, 5.60, 0);
  const transoms = [[3.35, 0.30], [4.50, 0.40], [5.70, 0.40], [6.90, 0.40], [7.95, 0.10]];
  for (const [y, h] of transoms) add(B(9.00, h, 9.00), mass, 0, y, 0);
  const mull = new THREE.BoxGeometry(0.60, 4.80, 0.35);
  for (const u of [-2.10, 0, 2.10]) {
    add(mull, mass, u, 5.60, 4.325);
    add(mull, mass, u, 5.60, -4.325);
    add(mull, mass, 4.325, 5.60, u, 0, Math.PI / 2);
    add(mull, mass, -4.325, 5.60, u, 0, Math.PI / 2);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(B(0.60, 4.80, 0.60), mass, sx * 4.20, 5.60, sz * 4.20);
  const glass = pane(1.52, 0.82);
  for (const y of [3.90, 5.10, 6.30, 7.50])
    for (const u of [-3.15, -1.05, 1.05, 3.15]) around(glass, win, u, 4.30, y);
  // slim sill ledges, one continuous course per row, right the way round
  for (const y of [3.50, 4.70, 5.90, 7.10]) add(B(9.10, 0.08, 9.10), trim, 0, y, 0);
  add(B(9.14, 0.34, 9.14), trim, 0, 8.17, 0);

  // ============ stepped setback, 8.34 -> 9.64
  add(B(6.60, 1.30, 6.60), dark, 0, 8.99, 0);
  add(B(6.96, 0.26, 6.96), mass, 0, 8.47, 0);
  add(B(6.96, 0.26, 6.96), mass, 0, 9.51, 0);
  for (const u of [-1.15, 1.15]) {
    add(B(0.50, 1.30, 0.20), mass, u, 8.99, 3.40);
    add(B(0.50, 1.30, 0.20), mass, u, 8.99, -3.40);
    add(B(0.20, 1.30, 0.50), mass, 3.40, 8.99, u);
    add(B(0.20, 1.30, 0.50), mass, -3.40, 8.99, u);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(B(0.50, 1.30, 0.50), mass, sx * 3.25, 8.99, sz * 3.25);
  const upper = pane(1.55, 0.72);
  for (const u of [-2.20, 0, 2.20]) around(upper, win, u, 3.31, 8.99);

  // ============ roof: deck, swept parapet ring, stair head, lathed tank, ducts
  add(B(7.00, 0.12, 7.00), mass, 0, 9.70, 0);
  add(ex(ring(7.10, 6.60), 0.44), mass, 0, 9.70, 0, -Math.PI / 2);
  add(B(2.10, 1.10, 1.70), mass, -1.70, 10.31, -1.40);
  add(B(2.24, 0.12, 1.84), trim, -1.70, 10.92, -1.40);
  add(B(0.86, 0.95, 0.10), steel, -1.70, 10.24, -0.52);
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(B(0.15, 0.40, 0.15), steel, 1.80 + sx * 0.48, 9.96, -1.50 + sz * 0.48);
  const tank = [[0, 0], [0.76, 0], [0.80, 0.06], [0.80, 0.56], [0.74, 0.64], [0.44, 0.70], [0, 0.72]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(tank, 10), steel, 1.80, 10.16, -1.50);
  for (const z of [1.30, 2.20]) {
    add(B(3.60, 0.32, 0.32), steel, 0.20, 9.94, z);
    for (const x of [-1.30, 1.60]) add(B(0.13, 0.22, 0.13), steel, x, 9.82, z);
  }

  // ============ two slim blank sign panels off the +X/+Z upper corner
  for (const z of [3.20, 2.05]) {
    add(ex(elevation(0.80, 3.40), 0.14), sign, 4.72, 4.40, z, 0, Math.PI / 2);
    for (const y of [5.00, 7.50]) add(B(0.40, 0.11, 0.11), steel, 4.38, y, z);
  }

  // ============ fire escape up the -Z side
  const esc = -4.70, rise = Math.atan2(1.00, 2.40);
  const flight = B(Math.hypot(2.40, 1.00), 0.09, 0.88);
  const frail = B(Math.hypot(2.40, 1.00), 0.48, 0.07);
  for (let i = 0; i < 5; i++) {
    const y = 3.40 + i * 1.00, x = i % 2 ? 1.30 : -1.30;
    add(B(1.90, 0.09, 0.84), steel, x, y, esc);
    add(B(1.90, 0.48, 0.07), steel, x, y + 0.28, esc - 0.39);
    add(B(0.09, 0.48, 0.84), steel, x + (i % 2 ? 0.94 : -0.94), y + 0.28, esc);
    if (i < 4) {
      // rotation.z carries the flight up towards +x; the sign alternates so the
      // stair zigzags rather than stacking one flight on top of another
      const s = i % 2 ? -1 : 1;
      add(flight, steel, 0, y + 0.50, esc - 0.02, 0, 0, s * rise);
      add(frail, steel, 0, y + 0.78, esc - 0.39, 0, 0, s * rise);
    }
  }
  for (const x of [-2.30, 2.30]) add(B(0.12, 4.60, 0.12), steel, x, 5.70, esc - 0.39);

  // --- contract: base at y=0, centred on x and z
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
