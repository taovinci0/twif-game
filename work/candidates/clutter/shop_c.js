// shop_c — a different part breakdown. Read as a ribbed tower rather than a
// punched wall: continuous floor slabs, full-height fins and ribbon glazing
// between them, a chamfered corner, an arcaded two-storey base, and a setback
// pushed off to one corner so the silhouette steps differently on each side.
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

  // ============ arcaded two-storey base, 0 -> 3.70
  add(B(9.00, 0.30, 9.00), trim, 0, 0.15, 0);
  add(B(8.40, 3.10, 8.40), dark, 0, 1.85, 0);
  add(B(9.00, 3.10, 0.30), mass, 0, 1.85, -4.35);
  add(B(0.30, 3.10, 9.00), mass, -4.35, 1.85, 0);
  const col = new THREE.CylinderGeometry(0.24, 0.24, 3.10, 6);
  for (const u of [-3.40, -1.70, 0, 1.70, 3.40]) {
    add(col, mass, u, 1.85, 4.30);
    add(col, mass, 4.30, 1.85, u);
  }
  for (const u of [-2.55, -0.85, 0.85, 2.55]) {
    add(pane(1.55, 2.30), shopw, u, 1.75, 4.22);
    add(pane(1.55, 2.30), shopw, 4.22, 1.75, u, 0, Math.PI / 2);
  }
  add(B(9.10, 0.42, 9.10), trim, 0, 3.49, 0);

  // ============ ribbed shaft, 3.70 -> 8.30
  add(B(8.00, 4.60, 8.00), dark, 0, 6.00, 0);
  const levels = [3.80, 4.70, 5.60, 6.50, 7.40, 8.30];
  for (const y of levels) {
    add(B(9.00, 0.22, 9.00), mass, 0, y, 0);
    add(B(9.10, 0.07, 9.10), trim, 0, y + 0.15, 0);     // slim sill ledge
  }
  // ribbon glazing: one lit band per floor per side, read as a window row
  for (let i = 0; i < 5; i++) {
    const y = levels[i] + 0.56;
    add(pane(8.00, 0.58), win, 0, y, 4.02);
    add(pane(8.00, 0.58), win, 0, y, -4.02, 0, Math.PI);
    add(pane(8.00, 0.58), win, 4.02, y, 0, 0, Math.PI / 2);
    add(pane(8.00, 0.58), win, -4.02, y, 0, 0, -Math.PI / 2);
  }
  // full-height fins split the band into a repeating grid of windows
  for (const u of [-3.50, -2.50, -1.50, -0.50, 0.50, 1.50, 2.50, 3.50]) {
    add(B(0.20, 4.60, 0.26), mass, u, 6.00, 4.12);
    add(B(0.20, 4.60, 0.26), mass, u, 6.00, -4.12);
    add(B(0.26, 4.60, 0.20), mass, 4.12, 6.00, u);
    add(B(0.26, 4.60, 0.20), mass, -4.12, 6.00, u);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(B(0.46, 4.60, 0.46), mass, sx * 4.20, 6.00, sz * 4.20);
  // chamfered corner pier, on the diagonal
  add(B(1.50, 8.10, 0.50), trim, 4.00, 4.05, 4.00, 0, Math.PI / 4);

  // ============ setback, pushed to one corner, 8.30 -> 10.50
  add(B(5.60, 2.20, 5.60), dark, -1.10, 9.40, -1.10);
  add(B(5.72, 0.20, 5.72), trim, -1.10, 8.50, -1.10);
  for (const u of [-2.40, -1.10, 0.20]) {
    add(pane(1.05, 0.72), win, u, 9.40, 1.72);
    add(pane(1.05, 0.72), win, u, 9.40, -3.92, 0, Math.PI);
    add(pane(1.05, 0.72), win, 1.72, 9.40, u, 0, Math.PI / 2);
    add(pane(1.05, 0.72), win, -3.92, 9.40, u, 0, -Math.PI / 2);
  }
  for (const s of [-1, 1]) {
    add(B(5.80, 0.46, 0.24), mass, -1.10, 10.73, -1.10 + s * 2.78);
    add(B(0.24, 0.46, 5.80), mass, -1.10 + s * 2.78, 10.73, -1.10);
  }
  add(B(5.40, 0.10, 5.40), mass, -1.10, 10.55, -1.10);

  // ============ lower roof: parapet, stair head, water tank, ducting
  add(B(8.60, 0.10, 8.60), mass, 0, 8.46, 0);
  for (const s of [-1, 1]) {
    add(B(9.00, 0.44, 0.24), mass, 0, 8.63, s * 4.38);
    add(B(0.24, 0.44, 9.00), mass, s * 4.38, 8.63, 0);
  }
  add(B(1.90, 1.30, 2.00), mass, 3.10, 9.06, -1.60);     // stair head box
  add(B(2.04, 0.12, 2.14), trim, 3.10, 9.77, -1.60);
  add(B(0.80, 1.00, 0.10), steel, 3.10, 8.91, -0.58);
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(B(0.15, 0.50, 0.15), steel, 2.95 + sx * 0.52, 8.66, 2.90 + sz * 0.52);
  add(new THREE.CylinderGeometry(0.84, 0.84, 0.70, 12), steel, 2.95, 9.26, 2.90);
  add(new THREE.CylinderGeometry(0.90, 0.90, 0.08, 12), trim, 2.95, 9.65, 2.90);
  for (const z of [-3.10, -3.70]) {
    add(B(2.60, 0.30, 0.30), steel, 3.00, 8.66, z);
    for (const x of [2.00, 4.00]) add(B(0.13, 0.22, 0.13), steel, x, 8.55, z);
  }

  // ============ two slim blank sign panels bracketed off the chamfered corner
  // the face is on the diagonal, so the panel's thin axis has to rotate with it:
  // ry = +PI/4 sends local +z to (0.707, 0, 0.707), which is outward here
  for (const u of [0.50, -0.50]) {
    add(B(0.90, 3.20, 0.14), sign, 4.35 + u * 0.71, 6.40, 4.35 - u * 0.71, 0, Math.PI / 4);
    for (const y of [5.10, 7.60])
      add(B(0.12, 0.12, 0.50), steel, 4.24 + u * 0.71, y, 4.24 - u * 0.71, 0, Math.PI / 4);
  }

  // ============ fire escape up the -Z side
  const esc = -4.68, rise = Math.atan2(0.90, 2.40);
  const flight = B(Math.hypot(2.40, 0.90), 0.09, 0.88);
  const frail = B(Math.hypot(2.40, 0.90), 0.48, 0.07);
  for (let i = 0; i < 5; i++) {
    const y = 4.00 + i * 0.90, x = i % 2 ? 1.30 : -1.30;
    add(B(1.90, 0.09, 0.84), steel, x, y, esc);
    add(B(1.90, 0.48, 0.07), steel, x, y + 0.28, esc - 0.39);
    add(B(0.09, 0.48, 0.84), steel, x + (i % 2 ? 0.94 : -0.94), y + 0.28, esc);
    if (i < 4) {
      const s = i % 2 ? -1 : 1;
      add(flight, steel, 0, y + 0.45, esc - 0.02, 0, 0, s * rise);
      add(frail, steel, 0, y + 0.73, esc - 0.39, 0, 0, s * rise);
    }
  }
  for (const x of [-2.30, 2.30]) add(B(0.12, 4.40, 0.12), steel, x, 6.00, esc - 0.39);

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
