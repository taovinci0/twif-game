// dojo_facade — candidate C: a different part breakdown.
// Read as a walled hall rather than an open frame: the facade is one plate
// with the three bays cut through it and the posts applied as pilasters, and
// the roof is hipped — four slopes with upturned corner blocks — instead of
// gabled. Screens sit behind the plate, the centre bay is a deep recess.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0, side) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (side) m.side = side;
    m.name = name;
    return m;
  };
  const D = THREE.DoubleSide;
  const dark   = M(0x080A0B, 0.86, 'timber');
  const beam   = M(0x111315, 0.78, 'timber');
  const red    = M(0x8E2B2B, 0.72, 'timber');
  const gold   = M(0xD4A24C, 0.36, 'metal', 0.65);
  const paper  = M(0xE7DFC9, 0.82, 'plaster', 0, D);
  const board  = M(0xE7DFC9, 0.80, 'plaster');
  const render = M(0x8C816F, 0.92, 'stone');
  const kerb   = M(0x111315, 0.88, 'stone');
  const mat    = M(0x8C816F, 0.94, 'fabric', 0, D);
  const inside = M(0x080A0B, 0.94, 'timber', 0, D);
  const tile   = M(0x111315, 0.72, 'tile', 0, D);

  const add = (geo, m2, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const me = new THREE.Mesh(geo, m2);
    me.position.set(x, y, z);
    me.rotation.set(rx, ry, rz);
    g.add(me);
    return me;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const P = (w, h) => new THREE.PlaneGeometry(w, h);

  const DECK = 0.46, PLATE = 0.88, HEAD = 3.32;

  // ---- stone plinth with a timber deck on top ---------------------------
  add(B(8.20, 0.22, 0.40), kerb,   0, 0.11, 1.75);
  add(B(8.80, 0.24, 3.52), kerb,   0, 0.12, -0.20);
  add(B(8.58, 0.16, 3.36), render, 0, 0.32, -0.20);
  add(B(8.66, 0.08, 3.42), beam,   0, 0.44, -0.20);
  add(B(8.72, 0.06, 0.12), gold,   0, 0.44, 1.56);

  // ---- low rail along the deck edge, broken at the entrance -------------
  const railRun = (x0, x1, z) => {
    add(B(x1 - x0, 0.09, 0.13), red, (x0 + x1) / 2, DECK + 0.44, z);
    const n = Math.max(2, Math.round((x1 - x0) / 0.80));
    for (let i = 0; i <= n; i++) add(B(0.10, 0.48, 0.10), beam, x0 + (i * (x1 - x0)) / n, DECK + 0.24, z);
  };
  railRun(-4.22, -1.22, 1.44);
  railRun(1.22, 4.22, 1.44);
  for (const s of [-1, 1]) {
    add(B(0.13, 0.09, 2.96), red, s * 4.22, DECK + 0.44, -0.04);
    for (const z of [-1.34, -0.64, 0.06, 0.76, 1.40]) add(B(0.10, 0.48, 0.10), beam, s * 4.22, DECK + 0.24, z);
  }

  // ---- the facade plate: one piece with the three bays cut through ------
  const plate = new THREE.Shape();
  plate.moveTo(-4.30, -1.43);
  plate.lineTo(4.30, -1.43);
  plate.lineTo(4.30, 1.43);
  plate.lineTo(-4.30, 1.43);
  plate.lineTo(-4.30, -1.43);
  for (const [x0, x1] of [[-3.88, -1.52], [-1.18, 1.18], [1.52, 3.88]]) {
    const h = new THREE.Path();
    h.moveTo(x0, -1.27);
    h.lineTo(x0, 1.29);
    h.lineTo(x1, 1.29);
    h.lineTo(x1, -1.27);
    h.lineTo(x0, -1.27);
    plate.holes.push(h);
  }
  add(new THREE.ExtrudeGeometry(plate, { depth: 0.22, bevelEnabled: false }), render, 0, 1.89, 0.77);

  // ---- four heavy posts applied as pilasters ----------------------------
  const POSTX = [-4.05, -1.35, 1.35, 4.05];
  for (const x of POSTX) {
    add(B(0.34, HEAD - DECK, 0.36), beam, x, (DECK + HEAD) / 2, PLATE + 0.20);
    add(B(0.42, 0.07, 0.42), gold, x, DECK + 0.06, PLATE + 0.20);
    add(B(0.42, 0.07, 0.42), gold, x, HEAD - 0.06, PLATE + 0.20);
  }
  add(B(8.74, 0.14, 0.52), red,  0, HEAD + 0.07, PLATE + 0.14);
  add(B(8.70, 0.42, 0.48), beam, 0, HEAD + 0.35, PLATE + 0.14);
  add(B(8.78, 0.07, 0.54), gold, 0, HEAD + 0.60, PLATE + 0.14);

  // ---- sliding screens set behind the two side bays --------------------
  const screen = (cx, w, cy, h, z) => {
    add(B(w - 0.08, h - 0.08, 0.04), paper, cx, cy, z);
    add(B(w, 0.08, 0.07), beam, cx, cy + h / 2 - 0.04, z);
    add(B(w, 0.08, 0.07), beam, cx, cy - h / 2 + 0.04, z);
    for (const s of [-1, 1]) add(B(0.07, h, 0.07), beam, cx + s * (w / 2 - 0.035), cy, z);
    for (let i = 1; i <= 2; i++) add(B(0.035, h - 0.12, 0.06), beam, cx - w / 2 + (i * w) / 3, cy, z + 0.015);
    for (let j = 1; j <= 5; j++) add(B(w - 0.08, 0.035, 0.06), beam, cx, cy - h / 2 + (j * h) / 6, z + 0.015);
  };
  const SCY = 1.90, SCH = 2.56;
  for (const s of [-1, 1]) {
    screen(s * 2.11, 1.18, SCY, SCH, PLATE - 0.22);
    screen(s * 3.29, 1.18, SCY, SCH, PLATE - 0.32);
  }

  // ---- centre bay: a deep recess with matting, lined on every face ------
  add(P(2.36, 2.70), mat,    0, DECK + 0.01, -0.62, -Math.PI / 2);
  for (let i = -1; i <= 1; i++) add(B(2.36, 0.012, 0.05), kerb, 0, DECK + 0.02, -0.62 + i * 0.84);
  add(P(2.36, 2.72), inside, 0, DECK + 1.36, -1.97);
  add(P(2.70, 2.72), inside, -1.18, DECK + 1.36, -0.62, 0, Math.PI / 2);
  add(P(2.70, 2.72), inside, 1.18, DECK + 1.36, -0.62, 0, -Math.PI / 2);
  add(P(2.36, 2.70), inside, 0, DECK + 2.72, -0.62, Math.PI / 2);
  add(B(2.48, 0.12, 0.30), beam, 0, DECK + 0.06, 0.58);       // threshold sill
  // the centre screens, slid aside inside the jambs
  for (const s of [-1, 1]) {
    add(B(0.30, SCH - 0.10, 0.05), paper, s * 1.00, SCY, PLATE - 0.28);
    add(B(0.36, 0.08, 0.08), beam, s * 1.00, SCY + SCH / 2 - 0.07, PLATE - 0.28);
    add(B(0.36, 0.08, 0.08), beam, s * 1.00, SCY - SCH / 2 + 0.07, PLATE - 0.28);
  }

  // ---- hipped roof: two trapezoid slopes and two triangular hips --------
  const EAVE = 3.88, APEX = 5.02, HX = 4.44, HZ = 1.97, RX = 2.86;
  const rise = APEX - EAVE;
  const slopeZ = Math.hypot(HZ, rise), slopeX = Math.hypot(HX - RX, rise);
  const slab = (shape, thick, fn) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false });
    geo.translate(0, 0, -thick / 2);
    fn(geo);
    add(geo, tile, 0, 0, 0);
  };
  const trap = new THREE.Shape();
  trap.moveTo(-HX, 0); trap.lineTo(HX, 0); trap.lineTo(RX, slopeZ); trap.lineTo(-RX, slopeZ); trap.lineTo(-HX, 0);
  for (const s of [-1, 1]) {
    slab(trap, 0.16, (geo) => { geo.rotateX(-s * Math.atan2(HZ, rise)); geo.translate(0, EAVE, s * HZ); });
  }
  const hip = new THREE.Shape();
  hip.moveTo(-HZ, 0); hip.lineTo(HZ, 0); hip.lineTo(0, slopeX); hip.lineTo(-HZ, 0);
  for (const s of [-1, 1]) {
    slab(hip, 0.16, (geo) => {
      geo.rotateY(Math.PI / 2);
      geo.rotateZ(s * Math.atan2(HX - RX, rise));
      geo.translate(s * HX, EAVE, 0);
    });
  }
  // eave fascia all the way round, and upturned corner blocks
  for (const s of [-1, 1]) add(B(8.90, 0.09, 0.14), gold, 0, EAVE + 0.02, s * HZ);
  for (const s of [-1, 1]) add(B(0.14, 0.09, 3.96), gold, s * HX, EAVE + 0.02, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(B(0.70, 0.13, 0.70), tile, sx * 4.16, EAVE + 0.12, sz * 1.70, -sz * 0.26, 0, sx * 0.26);
    add(new THREE.ConeGeometry(0.14, 0.26, 4), gold, sx * 4.30, EAVE + 0.34, sz * 1.84, 0, Math.PI / 4);
  }
  // ridge and hip capping
  add(B(RX * 2 + 0.24, 0.18, 0.40), dark, 0, APEX + 0.04, 0);
  add(B(RX * 2 + 0.16, 0.04, 0.44), gold, 0, APEX + 0.15, 0);
  for (const s of [-1, 1]) add(B(0.22, 0.30, 0.46), dark, s * (RX + 0.02), APEX - 0.02, 0);

  // ---- stepped bracket stacks under the eaves ---------------------------
  for (const x of POSTX) for (const sz of [-1, 1]) {
    const z = sz > 0 ? 1.06 : -0.30;
    add(B(0.30, 0.16, 0.30), beam, x, 3.86, z);
    add(B(0.24, 0.16, 0.82), beam, x, 3.70, z + sz * 0.22);
    add(B(0.20, 0.16, 0.20), beam, x, 3.54, z + sz * 0.06);
  }

  // ---- blank sign board hanging under the eave over the entrance -------
  add(B(2.60, 0.70, 0.12), beam,  0, 3.92, 1.28);
  add(B(2.38, 0.52, 0.04), board, 0, 3.92, 1.35);
  add(B(2.66, 0.09, 0.18), gold,  0, 4.30, 1.28);
  for (const s of [-1, 1]) add(B(0.05, 0.26, 0.05), dark, s * 1.14, 4.47, 1.28);

  // ---- square paper lanterns at each end of the deck --------------------
  for (const s of [-1, 1]) {
    const x = s * 3.62;
    add(B(0.04, 0.44, 0.04), dark,  x, 3.24, 1.22);
    add(B(0.34, 0.50, 0.34), paper, x, 2.77, 1.22);
    add(B(0.40, 0.06, 0.40), dark,  x, 3.05, 1.22);
    add(B(0.38, 0.05, 0.38), dark,  x, 2.50, 1.22);
    for (const sx of [-1, 1]) add(B(0.04, 0.50, 0.04), dark, x + sx * 0.17, 2.77, 1.39);
  }

  // ---- the back: rendered wall, buttress rhythm, small high window -----
  add(B(8.60, 3.92, 0.20), render, 0, 1.96, -2.05);
  add(B(8.80, 0.38, 0.30), kerb,   0, 0.19, -2.06);
  add(B(8.72, 0.12, 0.28), beam,   0, 3.76, -2.06);
  for (const x of [-3.10, -1.04, 1.04, 3.10]) add(B(0.26, 3.30, 0.14), render, x, 1.75, -2.12);
  add(B(1.30, 0.82, 0.14), beam,  0, 3.10, -2.10);
  add(B(1.08, 0.60, 0.05), paper, 0, 3.10, -2.14);
  add(B(1.08, 0.05, 0.06), beam,  0, 3.10, -2.16);
  add(B(0.05, 0.60, 0.06), beam,  0, 3.10, -2.16);
  for (const s of [-1, 1]) {
    add(B(0.20, 3.60, 2.94), render, s * 4.10, 1.80, -0.58);
    add(B(0.26, 3.70, 0.26), beam,   s * 4.17, 1.85, -1.96);
    add(B(0.24, 0.12, 2.94), gold,   s * 4.10, 3.54, -0.58);
  }

  // ---- contract: base at y=0, centred on x and z ------------------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), m4 = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mm) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mm)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m4.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
