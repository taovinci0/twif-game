// Const shrine — 3.4 x 3.2 x 2.4 m, canon.
//
// Chosen from three candidates by looking at the verifier sheet. The primitive
// assembly and the swept-profile one both put a plain black slab over a black
// void: correct in plan, unreadable at frame scale and worse from behind. This
// one reads the shrine as carved stone rather than joinery — the front is a
// single plate with the alcove cut through it, and the roof carries half-round
// tile battens — and it is the only one of the three whose fourth view still
// says "shrine" rather than "box".
//
// Same black-and-gold treatment as subnet_gate.js, so the pair reads as one
// set. No glyphs anywhere: the tablet is a blank 0.70 x 0.95 quad facing +Z,
// material named 'plaster' so the lighting system can make it emit, and the
// portrait art goes on it as a texture at load time.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0, side) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (side) m.side = side;
    m.name = name;
    return m;
  };
  const D = THREE.DoubleSide;
  const dark   = M(0x080A0B, 0.86, 'stone');
  const char   = M(0x111315, 0.82, 'stone');
  const stone  = M(0x8C816F, 0.90, 'stone');
  const block  = M(0x111315, 0.84, 'stone', 0, D);
  const red    = M(0x8E2B2B, 0.72, 'timber');
  const gold   = M(0xD4A24C, 0.36, 'metal', 0.65);
  const cream  = M(0xE7DFC9, 0.74, 'plaster', 0, D);
  const paper  = M(0xE7DFC9, 0.88, 'fabric', 0, D);
  const cord   = M(0x8C816F, 0.95, 'fabric');
  const inside = M(0x111315, 0.92, 'stone', 0, D);
  const tile   = M(0x080A0B, 0.70, 'tile');

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    g.add(m);
    return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const P = (w, h) => new THREE.PlaneGeometry(w, h);

  // ---- two-step stone plinth --------------------------------------------
  add(B(2.56, 0.20, 2.26), dark,  0, 0.10, -0.13);
  add(B(2.14, 0.18, 1.64), char,  0, 0.29, -0.30);
  add(B(1.86, 0.12, 1.24), stone, 0, 0.44, -0.38);
  add(B(1.92, 0.03, 1.30), gold,  0, 0.515, -0.38);
  for (const s of [-1, 1]) add(B(0.10, 0.20, 2.26), gold, s * 1.24, 0.10, -0.13);

  // ---- the block: one front plate with the alcove cut through -----------
  const plate = new THREE.Shape();
  plate.moveTo(-0.85, -0.78);
  plate.lineTo(0.85, -0.78);
  plate.lineTo(0.85, 0.78);
  plate.lineTo(-0.85, 0.78);
  plate.lineTo(-0.85, -0.78);
  const hole = new THREE.Path();
  hole.moveTo(-0.55, -0.66);
  hole.lineTo(-0.55, 0.68);
  hole.lineTo(0.55, 0.68);
  hole.lineTo(0.55, -0.66);
  hole.lineTo(-0.55, -0.66);
  plate.holes.push(hole);
  add(new THREE.ExtrudeGeometry(plate, { depth: 0.18, bevelEnabled: false }), block, 0, 1.28, 0.02);

  // gold reveal round the opening, so the alcove has an edge to catch light
  add(B(1.18, 0.04, 0.04), gold, 0, 1.98, 0.21);
  add(B(1.18, 0.04, 0.04), gold, 0, 0.60, 0.21);
  for (const s of [-1, 1]) add(B(0.04, 1.42, 0.04), gold, s * 0.57, 1.29, 0.21);

  // the mass behind the plate
  add(B(1.70, 1.56, 0.16), block, 0, 1.28, -0.82);                       // back
  for (const s of [-1, 1]) add(B(0.30, 1.56, 0.86), block, s * 0.70, 1.28, -0.31);
  add(B(1.70, 0.10, 1.04), block, 0, 0.55, -0.38);                       // floor
  add(B(1.84, 0.16, 1.16), char,  0, 2.14, -0.36);                       // capping course
  add(B(1.92, 0.04, 1.22), gold,  0, 2.24, -0.36);

  // ---- the recess, lined on every face so it is never a hole -----------
  add(P(1.10, 1.34), inside, 0, 1.29, -0.735);
  add(P(1.10, 0.86), inside, 0, 0.62, -0.31, -Math.PI / 2);
  add(P(1.10, 0.86), inside, 0, 1.96, -0.31, Math.PI / 2);
  for (const s of [-1, 1]) add(P(0.86, 1.34), inside, s * 0.55, 1.29, -0.31, 0, -s * Math.PI / 2);

  // ---- stepped pedestal and the blank tablet ----------------------------
  add(B(0.98, 0.10, 0.54), char,  0, 0.67, -0.46);
  add(B(0.84, 0.10, 0.44), stone, 0, 0.77, -0.46);
  add(B(0.88, 0.03, 0.04), gold,  0, 0.835, -0.25);
  add(B(0.80, 1.01, 0.05), dark,  0, 1.34, -0.46);
  // texture-ready panel: blank quad, 0.70 wide x 0.95 tall, facing +Z,
  // centred at (0, 1.34, -0.425) before the group is re-centred.
  add(P(0.70, 0.95), cream, 0, 1.34, -0.425);
  for (const s of [-1, 1]) add(B(0.04, 1.03, 0.03), gold, s * 0.38, 1.34, -0.42);
  add(B(0.80, 0.04, 0.03), gold, 0, 1.865, -0.42);

  // ---- slim posts on the plate face, rope and two paper pendants --------
  for (const s of [-1, 1]) {
    add(B(0.12, 1.52, 0.12), red,  s * 0.78, 1.28, 0.24);
    add(B(0.16, 0.06, 0.16), gold, s * 0.78, 0.58, 0.24);
    add(B(0.16, 0.06, 0.16), gold, s * 0.78, 1.98, 0.24);
  }
  // the rope rides high, clear of the tablet, and the pendants hang outboard
  // of it — cream on cream reads as nothing and would mask the texture panel.
  add(new THREE.CylinderGeometry(0.06, 0.06, 1.60, 8), cord, 0, 2.00, 0.30, 0, 0, Math.PI / 2);
  for (const s of [-1, 1]) {
    add(B(0.17, 0.32, 0.02), paper, s * 0.60, 1.79, 0.30);
    add(B(0.12, 0.22, 0.02), paper, s * 0.60, 1.56, 0.30);
  }

  // ---- roof: two slabs under half-round tile battens --------------------
  const rz0 = -0.28, ang = Math.atan2(0.72, 1.00);
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const batten = new THREE.CylinderGeometry(0.055, 0.055, 1.28, 6);
  for (const s of [-1, 1]) {
    add(B(2.66, 0.10, 1.28), char, 0, 2.52, rz0 + s * 0.50, s * ang);
    for (let i = -3; i <= 3; i++) {
      add(batten, tile, i * 0.40, 2.52 + 0.105 * ca, rz0 + s * (0.50 + 0.105 * sa), s * (Math.PI / 2 + ang));
    }
  }
  // upturned corner tiles and the eave fascia
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(B(0.48, 0.10, 0.46), char, sx * 1.10, 2.22, rz0 + sz * 0.86, -sz * 0.36);
    add(B(0.13, 0.13, 0.13), gold, sx * 1.28, 2.32, rz0 + sz * 1.00);
  }
  for (const sz of [-1, 1]) add(B(2.70, 0.08, 0.09), gold, 0, 2.15, rz0 + sz * 1.02);

  // ridge beam, cap and end finials
  add(B(2.76, 0.20, 0.34), dark, 0, 2.94, rz0);
  add(B(2.84, 0.05, 0.38), gold, 0, 3.065, rz0);
  for (const s of [-1, 1]) add(new THREE.ConeGeometry(0.10, 0.19, 6), gold, s * 1.38, 3.105, rz0);

  // ---- stone lantern posts flanking the steps ---------------------------
  for (const s of [-1, 1]) {
    const x = s * 1.47, z = 0.56;
    add(B(0.34, 0.12, 0.34), dark,  x, 0.06, z);
    add(B(0.24, 0.80, 0.24), stone, x, 0.52, z);
    add(B(0.40, 0.34, 0.40), stone, x, 1.09, z);
    add(B(0.22, 0.22, 0.02), cream, x, 1.09, z + 0.205);
    add(B(0.02, 0.22, 0.22), cream, x + s * 0.205, 1.09, z);
    add(B(0.46, 0.07, 0.46), gold,  x, 1.29, z);
    add(new THREE.ConeGeometry(0.32, 0.22, 4), dark, x, 1.44, z, 0, Math.PI / 4);
    add(new THREE.SphereGeometry(0.08, 8, 6), gold, x, 1.60, z);
  }

  // ---- offering tray and a pair of bowls on the top step ----------------
  add(B(0.64, 0.07, 0.24), dark, 0, 0.415, 0.36);
  add(B(0.68, 0.03, 0.28), gold, 0, 0.465, 0.36);
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.09, 0.06, 0.10, 10, 1, true), stone, s * 0.20, 0.53, 0.36);
    add(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 10), stone, s * 0.20, 0.485, 0.36);
  }

  // ---- contract: base at y=0, centred on x and z ------------------------
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
