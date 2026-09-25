// shop_a — primitive assembly. Generic 9 x 11 x 9 m city block: heavy base
// storey with a recessed shopfront on two adjacent sides, a banded window shaft,
// a stepped setback, roof furniture, sign panels and a fire escape.
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
  // 'plaster' is what the lighting system looks for to make a panel emit
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

  // ============ base storey, 0 -> 3.0
  add(B(9.00, 0.40, 9.00), trim, 0, 0.20, 0);
  add(B(8.40, 2.30, 8.40), dark, 0, 1.55, 0);
  add(B(9.00, 0.36, 9.00), trim, 0, 2.84, 0);
  // the two sides without a shopfront are solid wall, flush to the plinth
  add(B(9.00, 2.30, 0.32), mass, 0, 1.55, -4.34);
  add(B(0.32, 2.30, 9.00), mass, -4.34, 1.55, 0);
  // shopfront piers and lit glazing on +Z and +X
  for (const p of [-3.90, -1.30, 1.30, 3.90]) {
    add(B(0.45, 2.30, 0.34), mass, p, 1.55, 4.33);
    add(B(0.34, 2.30, 0.45), mass, 4.33, 1.55, p);
  }
  for (const b of [-2.60, 0, 2.60]) {
    add(pane(2.00, 1.90), shopw, b, 1.52, 4.22);
    add(pane(2.00, 1.90), shopw, 4.22, 1.52, b, 0, Math.PI / 2);
  }
  add(B(0.62, 2.30, 0.62), mass, 4.19, 1.55, 4.19);   // corner column
  add(B(1.10, 2.10, 0.12), steel, 0, 1.05, 4.26);      // entrance
  add(B(0.12, 2.10, 1.10), steel, 4.26, 1.05, 0);

  // ============ window shaft, 3.0 -> 8.2, five floors
  add(B(8.40, 5.20, 8.40), dark, 0, 5.60, 0);
  const floors = [3.05, 4.05, 5.05, 6.05, 7.05, 8.05];
  for (const y of floors) {
    add(B(8.94, 0.30, 8.94), mass, 0, y, 0);           // spandrel band
    add(B(9.00, 0.09, 9.00), trim, 0, y + 0.19, 0);    // slim sill ledge
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(B(0.40, 5.20, 0.40), mass, sx * 4.15, 5.60, sz * 4.15);
  const mull = [-2.52, -0.84, 0.84, 2.52];
  for (const u of mull) {
    for (const s of [-1, 1]) {
      add(B(0.24, 5.20, 0.30), mass, u, 5.60, s * 4.28);
      add(B(0.30, 5.20, 0.24), mass, s * 4.28, 5.60, u);
    }
  }
  const cols = [-3.36, -1.68, 0, 1.68, 3.36];
  const rows = [3.55, 4.55, 5.55, 6.55, 7.55];
  for (const y of rows) for (const u of cols) {
    add(pane(1.25, 0.70), win, u, y, 4.21);
    add(pane(1.25, 0.70), win, u, y, -4.21, 0, Math.PI);
    add(pane(1.25, 0.70), win, 4.21, y, u, 0, Math.PI / 2);
    add(pane(1.25, 0.70), win, -4.21, y, u, 0, -Math.PI / 2);
  }

  // ============ stepped setback, 8.2 -> 9.7
  add(B(7.60, 0.28, 7.60), trim, 0, 8.34, 0);
  add(B(7.00, 1.30, 7.00), dark, 0, 9.05, 0);
  add(B(7.10, 0.22, 7.10), mass, 0, 9.60, 0);
  for (const u of [-2.30, 0, 2.30]) {
    add(pane(1.30, 0.70), win, u, 9.00, 3.51);
    add(pane(1.30, 0.70), win, u, 9.00, -3.51, 0, Math.PI);
    add(pane(1.30, 0.70), win, 3.51, 9.00, u, 0, Math.PI / 2);
    add(pane(1.30, 0.70), win, -3.51, 9.00, u, 0, -Math.PI / 2);
  }

  // ============ roof: deck, parapet, stair head, tank, ducting
  add(B(7.00, 0.10, 7.00), mass, 0, 9.76, 0);
  for (const s of [-1, 1]) {
    add(B(7.10, 0.46, 0.26), mass, 0, 9.94, s * 3.42);
    add(B(0.26, 0.46, 7.10), mass, s * 3.42, 9.94, 0);
  }
  add(B(2.20, 1.20, 1.80), mass, -1.70, 10.30, -1.50);   // stair head box
  add(B(2.34, 0.14, 1.94), trim, -1.70, 10.95, -1.50);
  add(B(0.90, 1.00, 0.10), steel, -1.70, 10.20, -0.58);
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(B(0.16, 0.50, 0.16), steel, 1.85 + sx * 0.52, 10.06, -1.60 + sz * 0.52);
  add(new THREE.CylinderGeometry(0.82, 0.82, 0.62, 12), steel, 1.85, 10.62, -1.60);
  add(new THREE.CylinderGeometry(0.88, 0.88, 0.08, 12), trim, 1.85, 10.97, -1.60);
  for (const z of [1.40, 2.30]) {
    add(B(3.80, 0.34, 0.34), steel, 0.20, 10.00, z);
    for (const x of [-1.40, 1.70]) add(B(0.14, 0.24, 0.14), steel, x, 9.86, z);
  }

  // ============ two slim blank sign panels off the +X/+Z upper corner
  for (const z of [3.20, 2.05]) {
    add(B(0.14, 3.40, 0.80), sign, 4.66, 6.20, z);
    for (const y of [4.80, 7.60]) add(B(0.42, 0.12, 0.12), steel, 4.38, y, z);
  }

  // ============ fire escape zigzagging up the -Z side
  // rotation.z is positive because +x is to rotate up towards +y on the way out
  const esc = -4.68, rise = Math.atan2(1.00, 2.40);
  const flight = B(Math.hypot(2.40, 1.00), 0.09, 0.90);
  const frail = B(Math.hypot(2.40, 1.00), 0.50, 0.07);
  for (let i = 0; i < 6; i++) {
    const y = 3.20 + i * 1.00, x = i % 2 ? 1.30 : -1.30;
    add(B(1.90, 0.09, 0.86), steel, x, y, esc);
    add(B(1.90, 0.50, 0.07), steel, x, y + 0.29, esc - 0.40);
    add(B(0.09, 0.50, 0.86), steel, x + (i % 2 ? 0.94 : -0.94), y + 0.29, esc);
    if (i < 5) {
      const s = i % 2 ? -1 : 1;
      add(flight, steel, 0, y + 0.50, esc - 0.02, 0, 0, s * rise);
      add(frail, steel, 0, y + 0.80, esc - 0.40, 0, 0, s * rise);
    }
  }
  for (const x of [-2.30, 2.30]) add(B(0.12, 5.40, 0.12), steel, x, 5.70, esc - 0.40);

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
