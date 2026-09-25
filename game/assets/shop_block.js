// shop_b — swept profiles. Each elevation is one Shape with real rectangular
// holes, swept inward, so the windows are genuine reveals rather than panels
// stuck on a wall. Cornices and the parapet are swept rings; the tank is a lathe.
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
  const pane = (w, h) => new THREE.PlaneGeometry(w, h);
  // never bevel: bevelSize grows the profile outward and drops it below its base
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

  // ============ base storey, 0 -> 3.20
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
  add(B(9.06, 0.36, 9.06), trim, 0, 3.02, 0);

  // ============ shaft, 3.20 -> 8.00, four rows of real openings on all sides
  add(B(8.30, 4.80, 8.30), dark, 0, 5.60, 0);
  const cols = [-3.15, -1.05, 1.05, 3.15], rows = [0.70, 1.90, 3.10, 4.30];
  const shaftShape = elevation(9.00, 4.80);
  for (const y of rows) for (const x of cols) shaftShape.holes.push(holeAt(x, y, 1.50, 0.80));
  const shaftGeo = ex(shaftShape, 0.35);
  add(shaftGeo, mass, 0, 3.20, 4.15);
  add(shaftGeo, mass, 0, 3.20, -4.15, 0, Math.PI);
  add(shaftGeo, mass, 4.15, 3.20, 0, 0, Math.PI / 2);
  add(shaftGeo, mass, -4.15, 3.20, 0, 0, -Math.PI / 2);
  for (const y of rows) for (const x of cols) {
    add(pane(1.52, 0.82), win, x, 3.20 + y, 4.30);
    add(pane(1.52, 0.82), win, x, 3.20 + y, -4.30, 0, Math.PI);
    add(pane(1.52, 0.82), win, 4.30, 3.20 + y, x, 0, Math.PI / 2);
    add(pane(1.52, 0.82), win, -4.30, 3.20 + y, x, 0, -Math.PI / 2);
  }
  // slim sill ledges, one continuous course per row, right the way round
  for (const y of rows) add(B(9.14, 0.11, 9.14), trim, 0, 3.20 + y - 0.45, 0);
  add(B(9.14, 0.34, 9.14), trim, 0, 8.13, 0);

  // ============ stepped setback, 8.30 -> 9.60
  add(B(6.90, 1.30, 6.90), dark, 0, 8.95, 0);
  const capShape = elevation(7.00, 1.30);
  for (const x of [-2.10, 0, 2.10]) capShape.holes.push(holeAt(x, 0.68, 1.30, 0.72));
  const capGeo = ex(capShape, 0.30);
  add(capGeo, mass, 0, 8.30, 3.15);
  add(capGeo, mass, 0, 8.30, -3.15, 0, Math.PI);
  add(capGeo, mass, 3.15, 8.30, 0, 0, Math.PI / 2);
  add(capGeo, mass, -3.15, 8.30, 0, 0, -Math.PI / 2);
  for (const x of [-2.10, 0, 2.10]) {
    add(pane(1.32, 0.74), win, x, 8.98, 3.32);
    add(pane(1.32, 0.74), win, x, 8.98, -3.32, 0, Math.PI);
    add(pane(1.32, 0.74), win, 3.32, 8.98, x, 0, Math.PI / 2);
    add(pane(1.32, 0.74), win, -3.32, 8.98, x, 0, -Math.PI / 2);
  }

  // ============ roof: deck, swept parapet ring, stair head, lathed tank, ducts
  add(B(7.00, 0.12, 7.00), mass, 0, 9.66, 0);
  add(ex(ring(7.10, 6.60), 0.44), mass, 0, 9.66, 0, -Math.PI / 2);
  add(B(2.10, 1.10, 1.70), mass, -1.70, 10.27, -1.40);
  add(B(2.24, 0.12, 1.84), trim, -1.70, 10.88, -1.40);
  add(B(0.86, 0.95, 0.10), steel, -1.70, 10.20, -0.52);
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(B(0.15, 0.40, 0.15), steel, 1.80 + sx * 0.48, 9.92, -1.50 + sz * 0.48);
  const tank = [[0, 0], [0.76, 0], [0.80, 0.06], [0.80, 0.56], [0.74, 0.64], [0.44, 0.70], [0, 0.72]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(tank, 10), steel, 1.80, 10.12, -1.50);
  for (const z of [1.30, 2.20]) {
    add(B(3.60, 0.32, 0.32), steel, 0.20, 9.90, z);
    for (const x of [-1.30, 1.60]) add(B(0.13, 0.22, 0.13), steel, x, 9.78, z);
  }

  // ============ two slim blank sign panels off the +X/+Z upper corner
  for (const z of [3.20, 2.05]) {
    add(ex(elevation(0.80, 3.40), 0.14), sign, 4.72, 4.40, z, 0, Math.PI / 2);
    for (const y of [5.00, 7.50]) add(B(0.40, 0.11, 0.11), steel, 4.38, y, z);
  }

  // ============ fire escape up the -Z side
  const esc = -4.66, rise = Math.atan2(1.00, 2.40);
  const flight = B(Math.hypot(2.40, 1.00), 0.09, 0.88);
  const frail = B(Math.hypot(2.40, 1.00), 0.48, 0.07);
  for (let i = 0; i < 5; i++) {
    const y = 3.40 + i * 1.00, x = i % 2 ? 1.30 : -1.30;
    add(B(1.90, 0.09, 0.84), steel, x, y, esc);
    add(B(1.90, 0.48, 0.07), steel, x, y + 0.28, esc - 0.39);
    add(B(0.09, 0.48, 0.84), steel, x + (i % 2 ? 0.94 : -0.94), y + 0.28, esc);
    if (i < 4) {
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
