// Candidate B — "Subnet Summer" microbus built from swept profiles.
// The body is two ExtrudeGeometry sweeps of the van's SIDE outline pushed
// across its width: a teal belly whose bottom edge carries the two wheel
// arches as real arcs, and a cream greenhouse whose profile carries the
// windscreen rake, the roof crown and the engine-lid fall.  Bevelled
// extrusion gives the rounded roof and body edges for nothing.
// The flank wave is one swept ribbon per side.  No glyphs anywhere.
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

  const HW = 0.86;
  const AX = 0.345, TRACK = 0.70, FA = 1.45, RA = -1.35, ARCH = 0.44;
  const BELT = 0.99, ROOF = 1.63;

  // A side profile lives in the shape's XY; sweep it across the width.
  // shape x -> world z, shape y -> world y, extrusion -> world -x.
  const sweepSide = (shape, halfWidth, bevel, mat) => {
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: halfWidth * 2 - bevel * 2,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1,
      curveSegments: 5,
    });
    return add(geo, mat, halfWidth - bevel, 0, 0, 0, -Math.PI / 2, 0);
  };

  // ---- teal belly, wheel arches cut into its lower edge
  const belly = new THREE.Shape();
  belly.moveTo(2.02, 0.52);
  belly.lineTo(1.93, 0.33);
  belly.lineTo(FA + ARCH, 0.30);
  belly.absarc(FA, 0.30, ARCH, 0, Math.PI, false);
  belly.lineTo(RA + ARCH, 0.30);
  belly.absarc(RA, 0.30, ARCH, 0, Math.PI, false);
  belly.lineTo(-1.94, 0.32);
  belly.lineTo(-2.03, 0.52);
  belly.lineTo(-2.04, BELT);
  belly.lineTo(2.04, BELT);
  belly.quadraticCurveTo(2.09, 0.78, 2.02, 0.52);
  sweepSide(belly, HW, 0.05, teal);

  // ---- cream greenhouse: windscreen rake, roof crown, engine-lid fall
  const house = new THREE.Shape();
  house.moveTo(2.045, BELT - 0.02);
  house.lineTo(2.035, 1.30);
  house.quadraticCurveTo(2.00, 1.54, 1.76, ROOF - 0.02);
  house.lineTo(-1.78, ROOF);
  house.quadraticCurveTo(-2.00, 1.56, -2.035, 1.26);
  house.lineTo(-2.045, BELT - 0.02);
  house.closePath();
  sweepSide(house, HW - 0.02, 0.05, cream);

  // ---- floor pan, narrow enough to clear the wheels
  add(box(1.14, 0.10, 3.70), dark, 0, 0.35, -0.02);

  // ---- marigold wave: one swept ribbon per side, cresting over the arches
  const wave = new THREE.Shape();
  const SAMP = 26, wz0 = -1.92, wz1 = 1.92, band = 0.19;
  const waveY = (z) => {
    const y = 0.78 + 0.135 * Math.sin((z - wz0) / (wz1 - wz0) * Math.PI * 3.0 + 0.6);
    const overArch = Math.abs(z - FA) < ARCH + 0.06 || Math.abs(z - RA) < ARCH + 0.06;
    return overArch ? Math.max(y, 0.88) : y;
  };
  for (let i = 0; i <= SAMP; i++) {
    const z = wz0 + (wz1 - wz0) * i / SAMP;
    const y = waveY(z) + band / 2;
    if (i === 0) wave.moveTo(z, y); else wave.lineTo(z, y);
  }
  for (let i = SAMP; i >= 0; i--) {
    const z = wz0 + (wz1 - wz0) * i / SAMP;
    wave.lineTo(z, waveY(z) - band / 2);
  }
  wave.closePath();
  for (const s of [-1, 1]) {
    const geo = new THREE.ExtrudeGeometry(wave, { depth: 0.06, bevelEnabled: false, curveSegments: 1 });
    // ry = -PI/2 puts shape-x on world +Z and pushes the extrusion toward -X,
    // so the two sides differ only in where the near face lands.
    add(geo, gold, s > 0 ? HW + 0.05 : -HW + 0.01, 0, 0, 0, -Math.PI / 2, 0);
  }

  // ---- beltline trim and running boards
  for (const s of [-1, 1]) {
    add(box(0.05, 0.06, 3.70), cream, s * (HW + 0.005), BELT - 0.02, 0);
    add(box(0.12, 0.06, (FA - ARCH) - (RA + ARCH)), cream, s * (HW - 0.02), 0.38, ((FA - ARCH) + (RA + ARCH)) / 2);
  }

  // ---- wheel arch trim, following the swept arcs
  for (const sx of [-1, 1]) for (const z of [FA, RA]) for (let i = 0; i < 7; i++) {
    const a = Math.PI * (i + 0.5) / 7;
    add(box(0.07, 0.10, 0.22), cream, sx * (HW + 0.005), 0.30 + Math.sin(a) * ARCH, z - Math.cos(a) * ARCH, Math.PI / 2 - a);
  }

  // ---- the cream V on the nose
  for (const s of [-1, 1]) add(box(1.00, 0.19, 0.06), cream, s * 0.41, 0.86, 2.05, 0, 0, s * 0.40);

  // ---- glass, split windscreen with a centre pillar
  for (const s of [-1, 1]) add(box(0.72, 0.36, 0.05), glass, s * 0.40, 1.26, 2.05, 0.09);
  add(box(0.08, 0.42, 0.07), cream, 0, 1.26, 2.055);
  add(box(1.66, 0.06, 0.07), cream, 0, 1.06, 2.05);
  for (const s of [-1, 1]) add(cyl(0.012, 0.42, 5), chrome, s * 0.36, 1.12, 2.08, 0, 0, 1.15 * s);

  const panes = [[1.24, 0.78], [0.32, 0.66], [-0.38, 0.66], [-1.08, 0.66]];
  for (const s of [-1, 1]) for (const [pz, pw] of panes)
    add(box(0.05, 0.38, pw), glass, s * (HW - 0.005), 1.26, pz);
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++)
    add(box(0.05, 0.035, 0.34), dark, s * (HW + 0.01), 1.10 + i * 0.07, -1.68);
  add(box(1.12, 0.36, 0.05), glass, 0, 1.26, -2.05);

  // ---- door seams, handles, engine lid
  for (const s of [-1, 1]) {
    for (const dz of [1.90, 0.94, -0.14]) add(box(0.03, 0.28, 0.03), dark, s * (HW + 0.008), 0.86, dz);
    for (const dz of [1.30, 0.42]) add(box(0.05, 0.05, 0.16), chrome, s * (HW + 0.03), 0.90, dz);
  }
  add(box(0.92, 0.03, 0.03), dark, 0, 0.76, -2.045);
  add(box(0.10, 0.06, 0.05), chrome, 0, 0.88, -2.06);

  // ---- wheels: torus tyre with a rounded shoulder, on named axle pivots
  const joints = {};
  const makeWheel = (name, x, z) => {
    const p = new THREE.Group();
    p.position.set(x, AX, z);
    g.add(p);
    add(new THREE.TorusGeometry(AX - 0.08, 0.085, 6, 14), dark, 0, 0, 0, 0, Math.PI / 2, 0, p);
    add(cyl(AX - 0.055, 0.18, 14), dark, 0, 0, 0, 0, 0, Math.PI / 2, p);
    for (const s of [-1, 1]) {
      add(cyl(0.185, 0.03, 12), chrome, s * 0.095, 0, 0, 0, 0, Math.PI / 2, p);
      add(new THREE.SphereGeometry(0.105, 10, 6), chrome, s * 0.105, 0, 0, 0, 0, 0, p);
    }
    joints[name] = p;
    return p;
  };
  makeWheel('wheelFL', -TRACK, FA);
  makeWheel('wheelFR',  TRACK, FA);
  makeWheel('wheelRL', -TRACK, RA);
  makeWheel('wheelRR',  TRACK, RA);

  // ---- bumpers: a plan-view profile swept upward, so they wrap the corners.
  // rx = -PI/2 maps the extrusion to world +Y and the shape's +y to world -Z,
  // so `dir` flips the wrap to trail rearward at the front and forward at the back.
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
    const geo = new THREE.ExtrudeGeometry(bumperShape(0.84, 0.26, 0.11, s), { depth: 0.15, bevelEnabled: false, curveSegments: 4 });
    add(geo, chrome, 0, 0.47, zb, -Math.PI / 2);
    for (const x of [-0.56, 0.56]) add(box(0.10, 0.34, 0.10), chrome, x, 0.62, zb - s * 0.03);
    for (const x of [-0.72, 0.72]) add(box(0.09, 0.10, 0.24), chrome, x, 0.54, zb - s * 0.17);
    add(cyl(0.045, 1.42, 8), chrome, 0, 0.36, zb - s * 0.03, 0, 0, Math.PI / 2);
    for (const x of [-0.62, 0.62]) add(cyl(0.04, 0.22, 8), chrome, x, 0.45, zb - s * 0.03);
  }

  // ---- lamps
  for (const s of [-1, 1]) {
    add(cyl(0.145, 0.07, 12), chrome, s * 0.62, 0.98, 2.05, Math.PI / 2);
    add(cyl(0.115, 0.05, 12), lamp,   s * 0.62, 0.98, 2.09, Math.PI / 2);
    add(cyl(0.055, 0.06, 10), lamp,   s * 0.79, 0.74, 2.01, Math.PI / 2);
    add(cyl(0.065, 0.05, 10), lamp, s * 0.62, 0.90, -2.07, Math.PI / 2);
    add(cyl(0.065, 0.05, 10), red,  s * 0.62, 0.72, -2.07, Math.PI / 2);
  }

  // ---- spare wheel on the nose and its blank roundel
  add(cyl(0.30, 0.16, 16), dark,   0, 0.80, 2.12, Math.PI / 2);
  add(cyl(0.235, 0.06, 16), dark,  0, 0.80, 2.20, Math.PI / 2);
  add(cyl(0.225, 0.02, 16), cream, 0, 0.80, 2.235, Math.PI / 2);

  // ---- blank plates
  add(box(0.44, 0.13, 0.03), cream, 0, 0.46, -2.08);
  add(box(0.40, 0.12, 0.03), cream, 0, 0.44, 2.09);

  // ---- mirrors, which set the overall width
  for (const s of [-1, 1]) {
    add(cyl(0.022, 0.22, 6), chrome, s * 0.82, 1.20, 1.92, 0, 0, s * Math.PI / 2.6);
    add(cyl(0.075, 0.035, 10), chrome, s * 0.895, 1.25, 1.92, 0, 0, Math.PI / 2);
  }

  // ---- interior hint
  add(box(1.50, 0.12, 0.46), seat, 0, 1.00, 1.08);
  add(box(1.50, 0.34, 0.10), seat, 0, 1.16, 0.86);
  add(cyl(0.16, 0.03, 12), dark, -0.45, 1.20, 1.56, Math.PI / 2.4);

  // ---- roof rack
  const rx = 0.64, rzF = 1.34, rzR = -1.58, deck = 1.74;
  for (const sx of [-1, 1]) for (const z of [rzF, 0.0, rzR])
    add(cyl(0.028, 0.16, 6), chrome, sx * rx, 1.66, z);
  for (const sx of [-1, 1])
    add(cyl(0.030, rzF - rzR, 6), chrome, sx * rx, deck, (rzF + rzR) / 2, Math.PI / 2);
  for (const z of [rzF, rzR])
    add(cyl(0.030, rx * 2, 6), chrome, 0, deck, z, 0, 0, Math.PI / 2);
  for (let i = 0; i < 6; i++)
    add(cyl(0.020, rx * 2 - 0.06, 5), chrome, 0, deck - 0.012, rzR + 0.22 + i * ((rzF - rzR - 0.44) / 5), 0, 0, Math.PI / 2);
  for (const sx of [-1, 1]) {
    add(cyl(0.022, rzF - rzR, 5), chrome, sx * rx, deck + 0.13, (rzF + rzR) / 2, Math.PI / 2);
    for (const z of [rzF - 0.10, 0.0, rzR + 0.10]) add(cyl(0.018, 0.13, 5), chrome, sx * rx, deck + 0.07, z);
  }
  add(cyl(0.022, rx * 2, 5), chrome, 0, deck + 0.13, rzR + 0.10, 0, 0, Math.PI / 2);

  // ---- blank signboard across the front of the rack
  add(box(1.34, 0.20, 0.045), gold,  0, 1.83, rzF + 0.03);
  add(box(1.40, 0.25, 0.02), chrome, 0, 1.83, rzF - 0.005);
  for (const sx of [-1, 1]) add(cyl(0.016, 0.16, 5), chrome, sx * 0.55, 1.71, rzF + 0.02, 0, 0, 0.5 * sx);

  // ---- luggage box
  add(box(0.86, 0.18, 1.44), teal,  0.20, 1.84, -0.74);
  add(box(0.88, 0.04, 1.46), cream, 0.20, 1.92, -0.74);

  // ---- surfboard: a swept plan outline, so it has a proper tapered shape
  const boardPlan = new THREE.Shape();
  boardPlan.moveTo(0, -1.22);
  boardPlan.quadraticCurveTo(0.26, -0.20, 0.20, 0.90);
  boardPlan.quadraticCurveTo(0.16, 1.24, 0, 1.32);
  boardPlan.quadraticCurveTo(-0.16, 1.24, -0.20, 0.90);
  boardPlan.quadraticCurveTo(-0.26, -0.20, 0, -1.22);
  const boardGeo = new THREE.ExtrudeGeometry(boardPlan, { depth: 0.09, bevelEnabled: false, curveSegments: 3 });
  add(boardGeo, gold, -0.46, 1.75, 0.10, -Math.PI / 2);
  add(box(0.04, 0.14, 0.20), cream, -0.46, 1.90, -0.86);

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
