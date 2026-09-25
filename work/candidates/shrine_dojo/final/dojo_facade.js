// Dojo facade — 9.0 x 5.2 x 4.0 m, canon.
//
// Chosen from three candidates by looking at the verifier sheet. The swept
// roof had the prettier curve but a bare slab surface and spherical lanterns
// that read as balloons; the walled-plate version buried the screens and went
// flat on three sides. This one won on the fourth view and on the roof: the
// battened slopes give the biggest surface in frame something to read at
// distance, and the deep eave on visible brackets holds the silhouette.
//
// Same black-and-gold family as subnet_gate.js and const_shrine.js. Every
// panel is blank — the screens, the sign board and the back window are plain
// geometry, material named 'plaster', and carry their art and their light from
// the game layer. No glyphs as geometry anywhere.
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
  const tile   = M(0x080A0B, 0.70, 'tile');

  const add = (geo, m2, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const me = new THREE.Mesh(geo, m2);
    me.position.set(x, y, z);
    me.rotation.set(rx, ry, rz);
    g.add(me);
    return me;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const P = (w, h) => new THREE.PlaneGeometry(w, h);

  const DECK = 0.46;          // deck top
  const POSTZ = 0.88;         // the post / screen plane
  const HEAD = 3.32;          // post top, underside of the lintel

  // ---- ground step and raised timber deck -------------------------------
  add(B(8.20, 0.24, 0.40), kerb, 0, 0.12, 1.75);
  add(B(8.60, 0.38, 3.45), kerb, 0, 0.19, -0.175);
  add(B(8.68, 0.08, 3.52), beam, 0, 0.42, -0.175);
  add(B(8.74, 0.07, 0.10), gold, 0, 0.42, 1.58);

  // ---- low rail along the deck edge, broken at the entrance -------------
  const railRun = (x0, x1, z) => {
    add(B(x1 - x0, 0.08, 0.12), red, (x0 + x1) / 2, DECK + 0.46, z);
    add(B(x1 - x0, 0.05, 0.08), beam, (x0 + x1) / 2, DECK + 0.26, z);
    const n = Math.max(2, Math.round((x1 - x0) / 0.85));
    for (let i = 0; i <= n; i++) {
      add(B(0.09, 0.50, 0.09), beam, x0 + (i * (x1 - x0)) / n, DECK + 0.25, z);
    }
  };
  railRun(-4.26, -1.20, 1.48);
  railRun(1.20, 4.26, 1.48);
  for (const s of [-1, 1]) {
    add(B(0.12, 0.08, 3.00), red, s * 4.26, DECK + 0.46, 0.0);
    for (const z of [-1.30, -0.62, 0.06, 0.74, 1.42]) add(B(0.09, 0.50, 0.09), beam, s * 4.26, DECK + 0.25, z);
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

  // ---- sliding paper screens in the two side bays -----------------------
  const screen = (cx, w, cy, h, z) => {
    add(B(w - 0.10, h - 0.10, 0.04), paper, cx, cy, z);
    add(B(w, 0.09, 0.07), beam, cx, cy + h / 2 - 0.045, z);
    add(B(w, 0.09, 0.07), beam, cx, cy - h / 2 + 0.045, z);
    for (const s of [-1, 1]) add(B(0.08, h, 0.07), beam, cx + s * (w / 2 - 0.04), cy, z);
    for (let i = 1; i <= 2; i++) {
      add(B(0.035, h - 0.14, 0.06), beam, cx - w / 2 + (i * w) / 3, cy, z + 0.015);
    }
    for (let j = 1; j <= 5; j++) {
      add(B(w - 0.10, 0.035, 0.06), beam, cx, cy - h / 2 + (j * h) / 6, z + 0.015);
    }
  };
  const SCY = (DECK + 3.18) / 2, SCH = 3.18 - DECK;
  for (const s of [-1, 1]) {
    screen(s * 2.06, 1.27, SCY, SCH, POSTZ);
    screen(s * 3.33, 1.27, SCY, SCH, POSTZ - 0.09);
  }
  // transom band over the screens
  for (const s of [-1, 1]) {
    add(B(2.54, 0.13, 0.16), beam, s * 2.70, 3.25, POSTZ);
    for (let i = 0; i < 6; i++) add(B(0.05, 0.13, 0.10), gold, s * 2.70 - 1.06 + i * 0.42, 3.25, POSTZ + 0.05);
  }

  // ---- open centre bay: a real recess, lined so it is never a void ------
  add(P(2.36, 2.60), mat,    0, DECK + 0.01, -0.45, -Math.PI / 2);
  for (let i = -1; i <= 1; i++) add(B(2.36, 0.012, 0.05), kerb, 0, DECK + 0.02, -0.45 + i * 0.80);
  add(P(2.36, 2.72), inside, 0, DECK + 1.36, -1.72);
  add(P(2.60, 2.72), inside, -1.18, DECK + 1.36, -0.45, 0, Math.PI / 2);
  add(P(2.60, 2.72), inside, 1.18, DECK + 1.36, -0.45, 0, -Math.PI / 2);
  add(P(2.36, 2.60), inside, 0, DECK + 2.72, -0.45, Math.PI / 2);
  add(B(2.76, 0.28, 0.38), beam, 0, 3.18, POSTZ);
  // the centre screens, slid aside against the posts
  for (const s of [-1, 1]) {
    add(B(0.34, SCH - 0.12, 0.05), paper, s * 1.00, SCY, POSTZ - 0.18);
    add(B(0.40, 0.08, 0.08), beam, s * 1.00, SCY + SCH / 2 - 0.08, POSTZ - 0.18);
    add(B(0.40, 0.08, 0.08), beam, s * 1.00, SCY - SCH / 2 + 0.08, POSTZ - 0.18);
  }

  // ---- roof: two low-pitched battened slopes, upturned corners ----------
  const EAVE = 3.90, APEX = 5.06;
  const ang = Math.atan2(APEX - EAVE, 1.97);
  for (const s of [-1, 1]) {
    add(B(8.96, 0.16, 2.30), beam, 0, (EAVE + APEX) / 2, s * 0.985, s * ang);
    add(B(9.00, 0.07, 0.12), gold, 0, EAVE + 0.04, s * 1.94);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(B(1.10, 0.15, 0.64), beam, sx * 3.88, EAVE + 0.10, sz * 1.70, -sz * 0.34, 0, sx * 0.14);
    add(new THREE.ConeGeometry(0.13, 0.26, 4), gold, sx * 4.30, EAVE + 0.32, sz * 1.86, 0, Math.PI / 4);
  }
  add(B(9.00, 0.16, 0.38), dark, 0, 5.08, 0);
  add(B(8.94, 0.04, 0.42), gold, 0, 5.18, 0);
  for (const s of [-1, 1]) add(B(0.20, 0.30, 0.44), tile, s * 4.40, 5.03, 0);
  // battens across both slopes — the roof is the biggest surface in frame and
  // a bare slab at this size reads as nothing at all.
  for (let i = -10; i <= 10; i++) {
    for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.05, 0.05, 2.24, 5), tile,
      i * 0.42, (EAVE + APEX) / 2 + 0.13 * Math.cos(ang), s * (0.985 + 0.13 * Math.sin(ang)), s * (Math.PI / 2 + ang));
  }

  // ---- visible angled brackets under the eaves --------------------------
  for (const x of POSTX) for (const sz of [-1, 1]) {
    const z = sz > 0 ? 1.34 : -0.02;
    add(B(0.16, 0.86, 0.16), beam, x, 3.92, z, -sz * 0.62);
    add(B(0.18, 0.14, 0.90), beam, x, 3.82, z + sz * 0.16);
  }

  // ---- blank sign board hanging under the eave over the entrance -------
  add(B(2.50, 0.64, 0.10), beam,  0, 3.98, 1.40);
  add(B(2.30, 0.48, 0.04), board, 0, 3.98, 1.46);
  add(B(2.56, 0.08, 0.16), gold,  0, 4.33, 1.40);
  for (const s of [-1, 1]) add(B(0.05, 0.34, 0.05), dark, s * 1.10, 4.52, 1.40);

  // ---- a paper lantern at each end of the deck --------------------------
  for (const s of [-1, 1]) {
    const x = s * 3.62;
    add(B(0.04, 0.42, 0.04), dark, x, 3.20, 1.30);
    add(new THREE.CylinderGeometry(0.23, 0.23, 0.48, 10, 1, true), paper, x, 2.74, 1.30);
    add(new THREE.CylinderGeometry(0.11, 0.11, 0.07, 10), dark, x, 3.00, 1.30);
    add(new THREE.CylinderGeometry(0.11, 0.11, 0.07, 10), dark, x, 2.48, 1.30);
    add(new THREE.CylinderGeometry(0.235, 0.235, 0.03, 10, 1, true), gold, x, 2.74, 1.30);
  }

  // ---- the back: rendered wall on a plinth, pilasters, high window ------
  add(B(8.60, 3.95, 0.18), render, 0, 1.975, -1.81);
  add(B(8.76, 0.36, 0.28), kerb,   0, 0.18, -1.82);
  add(B(8.70, 0.10, 0.26), render, 0, 2.40, -1.82);
  add(B(8.70, 0.12, 0.26), beam,   0, 3.80, -1.82);
  for (const x of [-3.30, -1.10, 1.10, 3.30]) add(B(0.24, 3.36, 0.14), render, x, 1.92, -1.90);
  for (const x of [-3.30, -1.10, 1.10, 3.30]) add(B(0.30, 0.10, 0.18), beam, x, 3.66, -1.90);
  add(B(1.22, 0.78, 0.12), beam,   0, 3.12, -1.86);
  add(B(1.02, 0.58, 0.05), paper,  0, 3.12, -1.89);
  add(B(1.02, 0.05, 0.06), beam,   0, 3.12, -1.90);
  add(B(0.05, 0.58, 0.06), beam,   0, 3.12, -1.90);
  // closed ends, so the hall is a building and not a flat
  for (const s of [-1, 1]) {
    add(B(0.20, 3.50, 2.62), render, s * 4.05, 1.75, -0.51);
    add(B(0.26, 3.60, 0.26), beam,   s * 4.13, 1.80, -1.74);
    add(B(0.24, 0.12, 2.62), gold,   s * 4.05, 3.44, -0.51);
    add(B(0.24, 0.10, 0.20), beam,   s * 4.06, 2.20, -1.40);
    add(B(0.24, 0.10, 0.20), beam,   s * 4.06, 2.20, 0.34);
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
