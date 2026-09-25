// Subnet Summer van — 1.95 h · 4.50 l · 1.80 w, nose facing +Z.
//
// Chosen from three candidates by looking at the verifier sheet.  The swept
// profile won: the body is two ExtrudeGeometry sweeps of the van's SIDE
// outline pushed across its width, so the wheel arches, the windscreen rake,
// the roof crown and the engine-lid fall are all one continuous line, and a
// bevelled extrusion rounds every body edge for almost nothing.  The
// primitive assembly read as a brick with a flat plank roof from the front,
// and the cross-section sweep buried its own glazing behind proud pillars
// until the flank went blank.
//
// Refined after the pick: the beltline was raised so the teal reads as half
// the body rather than a skirt, and the marigold wave is now phase-locked to
// the wheelbase — one cosine whose crests sit over the two axles, which is
// both what the reference does and what keeps the stripe off the open arches.
//
// No glyphs anywhere.  The nose roundel, the rack signboard and both number
// plates are blank geometry; their art is applied later by the game layer.
export default function (THREE) {
  const g = new THREE.Group();

  const M = (color, roughness, name, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name;
    return m;
  };
  const teal   = M(0x1C7B74, 0.52, 'metal', 0.10);
  const cream  = M(0xE7DFC9, 0.56, 'metal', 0.06);
  const gold   = M(0xE9A93F, 0.54, 'metal', 0.08);
  const chrome = M(0x3A3F46, 0.28, 'metal', 0.85);
  const dark   = M(0x111315, 0.92, 'stone');
  const glass  = M(0x1B2226, 0.18, 'tile', 0.35);
  const lamp   = M(0xE66D32, 0.35, 'tile', 0.10);
  const red    = M(0x8E2B2B, 0.38, 'tile', 0.10);
  const seat   = M(0x1C7B74, 0.88, 'fabric');

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent = g) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r, h, s) => new THREE.CylinderGeometry(r, r, h, s);

  const HW = 0.86;                                   // body half width
  const AX = 0.36, TRACK = 0.72, FA = 1.45, RA = -1.35, ARCH = 0.46;
  const BELT = 1.08, ROOF = 1.68, FLOOR = 0.30;

  // A side profile lives in the shape's XY; sweep it across the width.
  // ry = -PI/2 maps shape x -> world +Z, shape y -> world y, and pushes the
  // extrusion toward -X, so the mesh starts at +halfWidth and ends at -halfWidth.
  const sweepSide = (shape, halfWidth, bevel, mat) => {
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: halfWidth * 2 - bevel * 2,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1,
      curveSegments: 5,
    });
    return add(geo, mat, halfWidth - bevel, 0, 0, 0, -Math.PI / 2, 0);
  };

  // ---- teal belly.  Its lower edge carries both wheel arches as real arcs.
  const belly = new THREE.Shape();
  belly.moveTo(2.02, 0.52);
  belly.lineTo(1.93, FLOOR + 0.03);
  belly.lineTo(FA + ARCH, FLOOR);
  belly.absarc(FA, FLOOR, ARCH, 0, Math.PI, false);
  belly.lineTo(RA + ARCH, FLOOR);
  belly.absarc(RA, FLOOR, ARCH, 0, Math.PI, false);
  belly.lineTo(-1.94, FLOOR + 0.02);
  belly.lineTo(-2.03, 0.52);
  belly.lineTo(-2.04, BELT);
  belly.lineTo(2.04, BELT);
  belly.quadraticCurveTo(2.09, 0.80, 2.02, 0.52);
  sweepSide(belly, HW, 0.05, teal);

  // ---- cream greenhouse: windscreen rake, roof crown, engine-lid fall
  const house = new THREE.Shape();
  house.moveTo(2.045, BELT - 0.02);
  house.lineTo(2.035, 1.36);
  house.quadraticCurveTo(2.00, 1.60, 1.76, ROOF - 0.02);
  house.lineTo(-1.78, ROOF);
  house.quadraticCurveTo(-2.00, 1.61, -2.035, 1.32);
  house.lineTo(-2.045, BELT - 0.02);
  house.closePath();
  sweepSide(house, HW - 0.02, 0.05, cream);

  // ---- floor pan, narrow enough to clear the wheels
  add(box(1.12, 0.10, 3.70), dark, 0, 0.35, -0.02);

  // ---- marigold wave: one swept ribbon per side.  A single cosine on the
  // wheelbase puts a crest over each axle and a trough between, which is what
  // the reference does and what keeps the band clear of the open arches.
  const wave = new THREE.Shape();
  const SAMP = 28, wz0 = -1.96, wz1 = 1.96, band = 0.17;
  const waveY = (z) => 0.71 + 0.17 * Math.cos(2 * Math.PI * (z - FA) / ((FA - RA) / 2));
  for (let i = 0; i <= SAMP; i++) {
    const z = wz0 + (wz1 - wz0) * i / SAMP;
    if (i === 0) wave.moveTo(z, waveY(z) + band / 2); else wave.lineTo(z, waveY(z) + band / 2);
  }
  for (let i = SAMP; i >= 0; i--) {
    const z = wz0 + (wz1 - wz0) * i / SAMP;
    wave.lineTo(z, waveY(z) - band / 2);
  }
  wave.closePath();
  for (const s of [-1, 1]) {
    const geo = new THREE.ExtrudeGeometry(wave, { depth: 0.05, bevelEnabled: false, curveSegments: 1 });
    add(geo, gold, s > 0 ? HW + 0.03 : -HW + 0.02, 0, 0, 0, -Math.PI / 2, 0);
  }

  // ---- beltline trim, roof drip rail, running boards
  for (const s of [-1, 1]) {
    add(box(0.05, 0.07, 3.74), cream, s * (HW + 0.006), BELT - 0.02, 0);
    add(box(0.04, 0.04, 3.40), chrome, s * (HW - 0.03), 1.555, 0);
    add(box(0.09, 0.06, (FA - ARCH) - (RA + ARCH)), cream, s * 0.845, 0.39, ((FA - ARCH) + (RA + ARCH)) / 2);
  }

  // ---- wheel arch trim, following the swept arcs
  for (const sx of [-1, 1]) for (const z of [FA, RA]) for (let i = 0; i < 8; i++) {
    const a = Math.PI * (i + 0.5) / 8;
    add(box(0.045, 0.07, 0.20), cream, sx * 0.87, FLOOR + Math.sin(a) * ARCH, z - Math.cos(a) * ARCH, Math.PI / 2 - a);
  }

  // ---- the cream V on the nose: arms running from the beltline corners down
  // to a point behind the spare wheel, leaving teal in the lower corners
  for (const s of [-1, 1]) add(box(0.98, 0.20, 0.06), cream, s * 0.40, 0.92, 2.05, 0, 0, s * 0.50);

  // ---- glazing.  The windscreen is split by a centre pillar.
  for (const s of [-1, 1]) add(box(0.72, 0.34, 0.05), glass, s * 0.40, 1.33, 2.05, 0.09);
  add(box(0.08, 0.40, 0.07), cream, 0, 1.33, 2.056);
  add(box(1.66, 0.06, 0.07), cream, 0, 1.14, 2.05);
  for (const s of [-1, 1]) add(cyl(0.012, 0.42, 5), chrome, s * 0.36, 1.19, 2.08, 0, 0, 1.15 * s);

  const panes = [[1.24, 0.78], [0.32, 0.66], [-0.38, 0.66], [-1.08, 0.66]];
  for (const s of [-1, 1]) for (const [pz, pw] of panes)
    add(box(0.05, 0.36, pw), glass, s * 0.855, 1.33, pz);
  // rear quarter air intake slats, on the flank and on the tail panel
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++)
    add(box(0.05, 0.035, 0.34), dark, s * 0.87, 1.16 + i * 0.07, -1.68);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++)
    add(box(0.26, 0.035, 0.05), dark, s * 0.72, 1.18 + i * 0.07, -2.06);
  add(box(1.10, 0.38, 0.05), glass, 0, 1.33, -2.05);
  add(box(1.18, 0.05, 0.05), cream, 0, 1.11, -2.055);

  // ---- door seams, handles, engine lid
  for (const s of [-1, 1]) {
    for (const dz of [1.90, 0.94, -0.14]) add(box(0.03, 0.30, 0.03), dark, s * 0.868, 0.98, dz);
    for (const dz of [1.30, 0.42]) add(box(0.035, 0.05, 0.16), chrome, s * 0.875, 1.00, dz);
  }
  add(box(0.92, 0.03, 0.03), dark, 0, 0.82, -2.045);
  add(box(0.10, 0.06, 0.05), chrome, 0, 0.94, -2.06);

  // ---- wheels: torus tyre with a rounded shoulder, on named axle pivots
  const joints = {};
  const makeWheel = (name, x, z) => {
    const p = new THREE.Group();
    p.position.set(x, AX, z);
    g.add(p);
    add(new THREE.TorusGeometry(AX - 0.085, 0.09, 6, 14), dark, 0, 0, 0, 0, Math.PI / 2, 0, p);
    add(cyl(AX - 0.06, 0.18, 14), dark, 0, 0, 0, 0, 0, Math.PI / 2, p);
    for (const s of [-1, 1]) {
      add(cyl(0.19, 0.03, 12), chrome, s * 0.095, 0, 0, 0, 0, Math.PI / 2, p);
      add(new THREE.SphereGeometry(0.075, 10, 6), chrome, s * 0.10, 0, 0, 0, 0, 0, p);
    }
    joints[name] = p;
    return p;
  };
  makeWheel('wheelFL', -TRACK, FA);
  makeWheel('wheelFR',  TRACK, FA);
  makeWheel('wheelRL', -TRACK, RA);
  makeWheel('wheelRR',  TRACK, RA);

  // ---- bumpers: a plan-view profile swept upward, so they wrap the corners.
  // rx = -PI/2 maps the extrusion to world +Y and shape +y to world -Z, so
  // `dir` trails the wrap rearward at the front and forward at the back.
  const bumperShape = (halfW, wrap, thick, dir) => {
    const s = new THREE.Shape();
    const p = (x, y) => [x, y * dir];
    s.moveTo(...p(-halfW, wrap));
    s.quadraticCurveTo(...p(0, -0.03), ...p(halfW, wrap));
    s.lineTo(...p(halfW, wrap + thick));
    s.quadraticCurveTo(...p(0, -0.03 + thick), ...p(-halfW, wrap + thick));
    s.closePath();
    return s;
  };
  for (const s of [-1, 1]) {
    const zb = s > 0 ? 2.22 : -2.22;
    const geo = new THREE.ExtrudeGeometry(bumperShape(0.82, 0.26, 0.11, s), { depth: 0.15, bevelEnabled: false, curveSegments: 4 });
    add(geo, chrome, 0, 0.47, zb, -Math.PI / 2);
    for (const x of [-0.56, 0.56]) add(box(0.10, 0.36, 0.10), chrome, x, 0.63, zb - s * 0.03);
    for (const x of [-0.70, 0.70]) add(box(0.09, 0.10, 0.24), chrome, x, 0.54, zb - s * 0.17);
    add(cyl(0.045, 1.42, 8), chrome, 0, 0.36, zb - s * 0.03, 0, 0, Math.PI / 2);
    for (const x of [-0.62, 0.62]) add(cyl(0.04, 0.22, 8), chrome, x, 0.45, zb - s * 0.03);
  }

  // ---- lamps: round headlights, indicators, stacked tail lights
  for (const s of [-1, 1]) {
    add(cyl(0.15, 0.07, 12), chrome, s * 0.62, 1.03, 2.05, Math.PI / 2);
    add(cyl(0.115, 0.05, 12), lamp,  s * 0.62, 1.03, 2.09, Math.PI / 2);
    add(cyl(0.055, 0.06, 10), lamp,  s * 0.79, 0.76, 2.01, Math.PI / 2);
    add(cyl(0.065, 0.05, 10), lamp, s * 0.62, 0.96, -2.07, Math.PI / 2);
    add(cyl(0.065, 0.05, 10), red,  s * 0.62, 0.78, -2.07, Math.PI / 2);
  }

  // ---- spare wheel on the nose and its blank roundel disc
  add(cyl(0.31, 0.16, 16), dark,   0, 0.82, 2.12, Math.PI / 2);
  add(cyl(0.245, 0.06, 16), dark,  0, 0.82, 2.20, Math.PI / 2);
  add(cyl(0.235, 0.02, 16), cream, 0, 0.82, 2.235, Math.PI / 2);

  // ---- blank number plates, front and rear
  add(box(0.44, 0.13, 0.03), cream, 0, 0.48, -2.08);
  add(box(0.40, 0.12, 0.03), cream, 0, 0.46, 2.09);

  // ---- mirrors on stalks; these set the overall width
  for (const s of [-1, 1]) {
    add(cyl(0.022, 0.18, 6), chrome, s * 0.79, 1.26, 1.92, 0, 0, s * Math.PI / 2.6);
    add(cyl(0.085, 0.04, 10), chrome, s * 0.876, 1.32, 1.92, 0, 0, Math.PI / 2);
  }

  // ---- interior hint so the glass is not a void
  add(box(1.50, 0.12, 0.46), seat, 0, 1.08, 1.08);
  add(box(1.50, 0.34, 0.10), seat, 0, 1.24, 0.86);
  add(cyl(0.16, 0.03, 12), dark, -0.45, 1.26, 1.56, Math.PI / 2.4);

  // ---- roof rack
  const rx = 0.64, rzF = 1.34, rzR = -1.58, deck = 1.76;
  for (const sx of [-1, 1]) for (const z of [rzF, 0.0, rzR])
    add(cyl(0.028, 0.12, 6), chrome, sx * rx, 1.71, z);
  for (const sx of [-1, 1])
    add(cyl(0.030, rzF - rzR, 6), chrome, sx * rx, deck, (rzF + rzR) / 2, Math.PI / 2);
  for (const z of [rzF, rzR])
    add(cyl(0.030, rx * 2, 6), chrome, 0, deck, z, 0, 0, Math.PI / 2);
  for (let i = 0; i < 6; i++)
    add(cyl(0.020, rx * 2 - 0.06, 5), chrome, 0, deck - 0.012, rzR + 0.22 + i * ((rzF - rzR - 0.44) / 5), 0, 0, Math.PI / 2);
  for (const sx of [-1, 1]) {
    add(cyl(0.022, rzF - rzR, 5), chrome, sx * rx, deck + 0.12, (rzF + rzR) / 2, Math.PI / 2);
    for (const z of [rzF - 0.10, 0.0, rzR + 0.10]) add(cyl(0.018, 0.12, 5), chrome, sx * rx, deck + 0.06, z);
  }
  add(cyl(0.022, rx * 2, 5), chrome, 0, deck + 0.12, rzR + 0.10, 0, 0, Math.PI / 2);

  // ---- blank signboard across the front of the rack
  add(box(1.34, 0.20, 0.045), gold,  0, 1.82, rzF + 0.03);
  add(box(1.40, 0.25, 0.02), chrome, 0, 1.82, rzF - 0.005);
  for (const sx of [-1, 1]) add(cyl(0.016, 0.16, 5), chrome, sx * 0.55, 1.70, rzF + 0.02, 0, 0, 0.5 * sx);

  // ---- luggage box on the rack
  add(box(0.86, 0.18, 1.44), teal,  0.20, 1.855, -0.74);
  add(box(0.88, 0.03, 1.46), cream, 0.20, 1.935, -0.74);

  // ---- surfboard: a swept plan outline, so it tapers properly at both ends
  const boardPlan = new THREE.Shape();
  boardPlan.moveTo(0, -1.22);
  boardPlan.quadraticCurveTo(0.22, -0.20, 0.17, 0.90);
  boardPlan.quadraticCurveTo(0.13, 1.24, 0, 1.32);
  boardPlan.quadraticCurveTo(-0.13, 1.24, -0.17, 0.90);
  boardPlan.quadraticCurveTo(-0.22, -0.20, 0, -1.22);
  const boardGeo = new THREE.ExtrudeGeometry(boardPlan, { depth: 0.09, bevelEnabled: false, curveSegments: 3 });
  add(boardGeo, gold, -0.46, 1.78, 0.10, -Math.PI / 2);
  add(box(0.04, 0.10, 0.20), cream, -0.46, 1.90, -0.86);

  g.userData.joints = joints;

  // ---- contract: base at y=0, centred on x and z
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
