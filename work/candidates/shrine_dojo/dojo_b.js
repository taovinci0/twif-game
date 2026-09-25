// dojo_facade — candidate B: swept profiles.
// The roof is one extruded section swept the full 9 m: a low pitch that sags
// between ridge and eave and lifts at the tips. Brackets and the deck nosing
// are extruded profiles too; the lanterns are lathed.
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

  const add = (geo, m2, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const me = new THREE.Mesh(geo, m2);
    me.position.set(x, y, z);
    me.rotation.set(rx, ry, rz);
    g.add(me);
    return me;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const P = (w, h) => new THREE.PlaneGeometry(w, h);

  // Profiles are drawn in (z, y) and swept along x.
  const sweep = (shape, width, seg = 6) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false, curveSegments: seg });
    geo.rotateY(-Math.PI / 2);
    geo.translate(width / 2, 0, 0);
    return geo;
  };

  const DECK = 0.46, POSTZ = 0.88, HEAD = 3.32;

  // ---- deck as an extruded section: step, fascia, floor, nosing ---------
  const deck = new THREE.Shape();
  deck.moveTo(-1.90, 0);
  deck.lineTo(1.95, 0);
  deck.lineTo(1.95, 0.24);
  deck.lineTo(1.58, 0.24);
  deck.lineTo(1.58, 0.38);
  deck.lineTo(1.66, 0.40);
  deck.lineTo(1.66, DECK);
  deck.lineTo(-1.90, DECK);
  deck.lineTo(-1.90, 0);
  add(sweep(deck, 8.60), kerb, 0, 0, 0);
  add(B(8.68, 0.07, 3.30), beam, 0, DECK - 0.03, -0.20);
  add(B(8.74, 0.06, 0.12), gold, 0, DECK - 0.02, 1.62);

  // ---- low rail along the deck edge, broken at the entrance -------------
  const railRun = (x0, x1, z) => {
    add(B(x1 - x0, 0.08, 0.12), red, (x0 + x1) / 2, DECK + 0.46, z);
    add(B(x1 - x0, 0.05, 0.08), beam, (x0 + x1) / 2, DECK + 0.26, z);
    const n = Math.max(2, Math.round((x1 - x0) / 0.85));
    for (let i = 0; i <= n; i++) add(B(0.09, 0.50, 0.09), beam, x0 + (i * (x1 - x0)) / n, DECK + 0.25, z);
  };
  railRun(-4.24, -1.20, 1.46);
  railRun(1.20, 4.24, 1.46);
  for (const s of [-1, 1]) {
    add(B(0.12, 0.08, 3.00), red, s * 4.24, DECK + 0.46, -0.02);
    for (const z of [-1.32, -0.64, 0.04, 0.72, 1.40]) add(B(0.09, 0.50, 0.09), beam, s * 4.24, DECK + 0.25, z);
  }

  // ---- four heavy posts and the deep lintel -----------------------------
  const POSTX = [-4.05, -1.35, 1.35, 4.05];
  for (const x of POSTX) {
    add(B(0.34, HEAD - DECK, 0.34), beam, x, (DECK + HEAD) / 2, POSTZ);
    add(B(0.40, 0.06, 0.40), gold, x, DECK + 0.05, POSTZ);
  }
  add(B(8.74, 0.12, 0.48), red,  0, HEAD + 0.06, POSTZ);
  add(B(8.70, 0.40, 0.44), beam, 0, HEAD + 0.32, POSTZ);
  add(B(8.76, 0.07, 0.50), gold, 0, HEAD + 0.55, POSTZ);

  // ---- sliding paper screens --------------------------------------------
  const screen = (cx, w, cy, h, z) => {
    add(B(w - 0.10, h - 0.10, 0.04), paper, cx, cy, z);
    add(B(w, 0.09, 0.07), beam, cx, cy + h / 2 - 0.045, z);
    add(B(w, 0.09, 0.07), beam, cx, cy - h / 2 + 0.045, z);
    for (const s of [-1, 1]) add(B(0.08, h, 0.07), beam, cx + s * (w / 2 - 0.04), cy, z);
    for (let i = 1; i <= 3; i++) add(B(0.03, h - 0.14, 0.06), beam, cx - w / 2 + (i * w) / 4, cy, z + 0.015);
    for (let j = 1; j <= 6; j++) add(B(w - 0.10, 0.03, 0.06), beam, cx, cy - h / 2 + (j * h) / 7, z + 0.015);
  };
  const SCY = (DECK + 3.18) / 2, SCH = 3.18 - DECK;
  for (const s of [-1, 1]) {
    screen(s * 2.06, 1.27, SCY, SCH, POSTZ);
    screen(s * 3.33, 1.27, SCY, SCH, POSTZ - 0.09);
  }
  for (const s of [-1, 1]) {
    add(B(2.54, 0.13, 0.16), beam, s * 2.70, 3.25, POSTZ);
    for (let i = 0; i < 6; i++) add(B(0.05, 0.13, 0.10), gold, s * 2.70 - 1.06 + i * 0.42, 3.25, POSTZ + 0.05);
  }

  // ---- open centre bay, lined recess ------------------------------------
  add(P(2.36, 2.60), mat,    0, DECK + 0.01, -0.45, -Math.PI / 2);
  for (let i = -1; i <= 1; i++) add(B(2.36, 0.012, 0.05), kerb, 0, DECK + 0.02, -0.45 + i * 0.80);
  add(P(2.36, 2.72), inside, 0, DECK + 1.36, -1.72);
  add(P(2.60, 2.72), inside, -1.18, DECK + 1.36, -0.45, 0, Math.PI / 2);
  add(P(2.60, 2.72), inside, 1.18, DECK + 1.36, -0.45, 0, -Math.PI / 2);
  add(P(2.36, 2.60), inside, 0, DECK + 2.72, -0.45, Math.PI / 2);
  add(B(2.76, 0.28, 0.38), beam, 0, 3.18, POSTZ);
  for (const s of [-1, 1]) {
    add(B(0.34, SCH - 0.12, 0.05), paper, s * 1.00, SCY, POSTZ - 0.18);
    add(B(0.40, 0.08, 0.08), beam, s * 1.00, SCY + SCH / 2 - 0.08, POSTZ - 0.18);
    add(B(0.40, 0.08, 0.08), beam, s * 1.00, SCY - SCH / 2 + 0.08, POSTZ - 0.18);
  }

  // ---- roof: one swept section, upturned tips ---------------------------
  const roof = new THREE.Shape();
  roof.moveTo(0, 5.05);
  roof.quadraticCurveTo(1.06, 4.52, 1.72, 4.00);
  roof.quadraticCurveTo(1.90, 3.88, 2.00, 4.06);
  roof.lineTo(1.88, 3.98);
  roof.quadraticCurveTo(1.80, 3.80, 1.66, 3.84);
  roof.quadraticCurveTo(1.04, 4.34, 0, 4.86);
  roof.quadraticCurveTo(-1.04, 4.34, -1.66, 3.84);
  roof.quadraticCurveTo(-1.80, 3.80, -1.88, 3.98);
  roof.lineTo(-2.00, 4.06);
  roof.quadraticCurveTo(-1.90, 3.88, -1.72, 4.00);
  roof.quadraticCurveTo(-1.06, 4.52, 0, 5.05);
  add(sweep(roof, 8.94, 6), beam, 0, 0, 0);

  // barge boards down both ends, following the same section
  const barge = new THREE.Shape();
  barge.moveTo(0, 5.09);
  barge.quadraticCurveTo(1.06, 4.56, 1.74, 4.03);
  barge.quadraticCurveTo(1.93, 3.90, 2.04, 4.12);
  barge.lineTo(1.94, 4.06);
  barge.quadraticCurveTo(1.84, 3.86, 1.70, 3.90);
  barge.quadraticCurveTo(1.04, 4.40, 0, 4.94);
  barge.quadraticCurveTo(-1.04, 4.40, -1.70, 3.90);
  barge.quadraticCurveTo(-1.84, 3.86, -1.94, 4.06);
  barge.lineTo(-2.04, 4.12);
  barge.quadraticCurveTo(-1.93, 3.90, -1.74, 4.03);
  barge.quadraticCurveTo(-1.06, 4.56, 0, 5.09);
  for (const s of [-1, 1]) add(sweep(barge, 0.10, 6), gold, s * 4.44, 0, 0);

  add(B(9.00, 0.16, 0.38), dark, 0, 5.08, 0);
  add(B(8.94, 0.04, 0.42), gold, 0, 5.18, 0);
  for (const s of [-1, 1]) add(B(0.20, 0.30, 0.44), dark, s * 4.38, 5.03, 0);

  // ---- extruded angled brackets under the eaves -------------------------
  const br = new THREE.Shape();
  br.moveTo(0, 0);
  br.lineTo(0.12, 0);
  br.lineTo(0.98, 0.78);
  br.lineTo(0.98, 0.96);
  br.lineTo(0.84, 0.96);
  br.lineTo(0, 0.22);
  br.lineTo(0, 0);
  for (const x of POSTX) {
    add(sweep(br, 0.16), beam, x, 2.98, POSTZ + 0.06);
    add(sweep(br, 0.16), beam, x, 2.98, -0.06, 0, Math.PI, 0);
  }

  // ---- blank sign board hanging under the eave over the entrance -------
  add(B(2.50, 0.64, 0.10), beam,  0, 3.98, 1.36);
  add(B(2.30, 0.48, 0.04), board, 0, 3.98, 1.42);
  add(B(2.56, 0.08, 0.16), gold,  0, 4.33, 1.36);
  for (const s of [-1, 1]) add(B(0.05, 0.30, 0.05), dark, s * 1.10, 4.50, 1.36);

  // ---- lathed paper lanterns, one at each end of the deck ---------------
  const lp = [[0.001, 0], [0.09, 0.02], [0.10, 0.06], [0.20, 0.14], [0.24, 0.30],
              [0.24, 0.42], [0.19, 0.54], [0.10, 0.60], [0.09, 0.64], [0.001, 0.66]];
  const lantern = new THREE.LatheGeometry(lp.map(([r, y]) => new THREE.Vector2(r, y)), 10);
  for (const s of [-1, 1]) {
    const x = s * 3.62;
    add(B(0.04, 0.46, 0.04), dark, x, 3.22, 1.28);
    add(lantern, paper, x, 2.34, 1.28);
  }

  // ---- the back: rendered wall, base course, small high window ---------
  add(B(8.60, 3.95, 0.18), render, 0, 1.975, -1.81);
  add(B(8.76, 0.36, 0.28), kerb,   0, 0.18, -1.82);
  add(B(8.70, 0.10, 0.26), render, 0, 2.40, -1.82);
  add(B(8.70, 0.12, 0.26), beam,   0, 3.80, -1.82);
  add(B(1.22, 0.78, 0.12), beam,   0, 3.12, -1.86);
  add(B(1.02, 0.58, 0.05), paper,  0, 3.12, -1.90);
  add(B(1.02, 0.05, 0.06), beam,   0, 3.12, -1.92);
  add(B(0.05, 0.58, 0.06), beam,   0, 3.12, -1.92);
  for (const s of [-1, 1]) {
    add(B(0.20, 3.50, 2.62), render, s * 4.05, 1.75, -0.51);
    add(B(0.26, 3.60, 0.26), beam,   s * 4.13, 1.80, -1.74);
    add(B(0.24, 0.12, 2.62), gold,   s * 4.05, 3.44, -0.51);
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
