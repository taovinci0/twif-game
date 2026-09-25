// Candidate C — "Subnet Summer" microbus read as CROSS-SECTIONS swept along
// its length.  One front-view profile (rounded flanks) is swept over three
// separate z ranges so the wheel arches fall out as gaps between sweeps; a
// second, crowned profile with tumblehome is swept the full length as the
// greenhouse and roof in one piece.  The glazing is genuinely recessed with
// standing pillars, so the window band has depth from any angle.
// No glyphs: roundel, signboard and plates are blank geometry.
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
  const AX = 0.345, TRACK = 0.70, FA = 1.45, RA = -1.35, ARCH = 0.45;
  const FZ = 2.02, RZ = -2.02, BELT = 1.00, TUB = 0.76, ROCK = 0.36;

  // A cross-section lives in the shape's XY and sweeps straight along +Z.
  const sweepLong = (shape, z0, z1, bevel, mat) => {
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: (z1 - z0) - bevel * 2,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1,
      curveSegments: 4,
    });
    return add(geo, mat, 0, 0, z0 + bevel, 0, 0, 0);
  };

  // ---- lower cross-section: flanks tucked under, flaring out to full width
  const lowerCS = (yTop) => {
    const s = new THREE.Shape();
    s.moveTo(-0.60, ROCK);
    s.lineTo(0.60, ROCK);
    s.quadraticCurveTo(HW, ROCK + 0.02, HW, ROCK + 0.22);
    s.lineTo(HW, yTop);
    s.lineTo(-HW, yTop);
    s.lineTo(-HW, ROCK + 0.22);
    s.quadraticCurveTo(-HW, ROCK + 0.02, -0.60, ROCK);
    s.closePath();
    return s;
  };
  // swept over three ranges — the gaps between them ARE the wheel arches
  sweepLong(lowerCS(TUB + 0.02), FA + ARCH, FZ, 0.05, teal);
  sweepLong(lowerCS(TUB + 0.02), RA + ARCH, FA - ARCH, 0.0, teal);
  sweepLong(lowerCS(TUB + 0.02), RZ, RA - ARCH, 0.05, teal);

  // ---- full-length tub above the arches
  const tubCS = new THREE.Shape();
  tubCS.moveTo(-HW, TUB); tubCS.lineTo(HW, TUB); tubCS.lineTo(HW, BELT); tubCS.lineTo(-HW, BELT); tubCS.closePath();
  sweepLong(tubCS, RZ, FZ, 0.05, teal);

  // ---- floor pan, narrow enough to clear the wheels
  add(box(1.10, 0.09, 3.76), dark, 0, 0.40, 0);

  // ---- greenhouse + roof: one crowned cross-section with tumblehome
  const houseCS = new THREE.Shape();
  houseCS.moveTo(-0.85, BELT - 0.03);
  houseCS.lineTo(0.85, BELT - 0.03);
  houseCS.lineTo(0.85, 1.30);
  houseCS.quadraticCurveTo(0.85, 1.55, 0.62, 1.615);
  houseCS.quadraticCurveTo(0, 1.685, -0.62, 1.615);
  houseCS.quadraticCurveTo(-0.85, 1.55, -0.85, 1.30);
  houseCS.closePath();
  sweepLong(houseCS, RZ + 0.02, FZ - 0.02, 0.06, cream);

  // ---- raked windscreen surround and sloping engine lid, as separate caps
  add(box(1.70, 0.50, 0.08), cream, 0, 1.30, FZ - 0.03, -0.20);
  add(box(1.66, 0.34, 0.09), teal,  0, 1.44, RZ + 0.10, 0.34);

  // ---- recessed glazing.  Panes sit inboard; pillars stand proud.
  const panes = [[1.24, 0.74], [0.38, 0.68], [-0.40, 0.68], [-1.18, 0.68]];
  for (const s of [-1, 1]) {
    for (const [pz, pw] of panes) add(box(0.05, 0.40, pw), glass, s * 0.805, 1.26, pz);
    for (const [pz, pw] of [[1.68, 0.16], [0.795, 0.15], [-0.01, 0.11], [-0.79, 0.11], [-1.62, 0.18]])
      add(box(0.07, 0.42, pw), cream, s * 0.848, 1.26, pz);
    add(box(0.07, 0.07, 3.50), cream, s * 0.846, 1.49, 0.05);   // window header
    add(box(0.07, 0.07, 3.50), cream, s * 0.846, 1.04, 0.05);   // window sill
    for (let i = 0; i < 5; i++) add(box(0.06, 0.035, 0.34), dark, s * 0.842, 1.10 + i * 0.07, -1.78);
  }

  // split windscreen, two panes either side of a centre pillar
  for (const s of [-1, 1]) add(box(0.70, 0.38, 0.05), glass, s * 0.40, 1.28, FZ - 0.02, -0.20);
  add(box(0.09, 0.44, 0.09), cream, 0, 1.28, FZ + 0.005, -0.20);
  for (const s of [-1, 1]) add(cyl(0.012, 0.42, 5), chrome, s * 0.36, 1.13, FZ + 0.07, 0, 0, 1.15 * s);
  // rear window, recessed into the lid cap
  add(box(1.10, 0.34, 0.05), glass, 0, 1.28, RZ + 0.08, 0.34);

  // ---- the cream V on the nose
  for (const s of [-1, 1]) add(box(1.02, 0.19, 0.06), cream, s * 0.41, 0.87, FZ + 0.03, 0, 0, s * 0.40);
  add(box(1.70, 0.05, 0.06), cream, 0, BELT - 0.02, FZ + 0.03);

  // ---- beltline trim and running boards
  for (const s of [-1, 1]) {
    add(box(0.05, 0.06, 3.76), cream, s * (HW + 0.01), BELT - 0.03, 0);
    add(box(0.12, 0.06, (FA - ARCH) - (RA + ARCH)), cream, s * (HW - 0.02), ROCK + 0.22, ((FA - ARCH) + (RA + ARCH)) / 2);
  }

  // ---- marigold wave: short boxes rotated to the curve's own tangent
  const NW = 24, wz0 = RZ + 0.14, wz1 = FZ - 0.14, step = (wz1 - wz0) / NW;
  const waveY = (z) => {
    const y = 0.78 + 0.135 * Math.sin((z - wz0) / (wz1 - wz0) * Math.PI * 3.0 + 0.6);
    const overArch = Math.abs(z - FA) < ARCH + 0.06 || Math.abs(z - RA) < ARCH + 0.06;
    return overArch ? Math.max(y, 0.89) : y;
  };
  for (const s of [-1, 1]) for (let i = 0; i < NW; i++) {
    const za = wz0 + step * i, zb = za + step;
    const ya = waveY(za), yb = waveY(zb);
    const ang = Math.atan2(yb - ya, zb - za);
    add(box(0.035, 0.19, Math.hypot(zb - za, yb - ya) + 0.03), gold,
        s * (HW + 0.012), (ya + yb) / 2, (za + zb) / 2, -ang);
  }

  // ---- wheel arch trim around each opening
  for (const sx of [-1, 1]) for (const z of [FA, RA]) for (let i = 0; i < 8; i++) {
    const a = Math.PI * (i + 0.5) / 8;
    add(box(0.07, 0.11, 0.20), cream, sx * (HW + 0.005), AX + Math.sin(a) * ARCH, z - Math.cos(a) * ARCH, Math.PI / 2 - a);
  }

  // ---- door seams and handles
  for (const s of [-1, 1]) {
    for (const dz of [1.92, 0.94, -0.14]) add(box(0.03, 0.30, 0.03), dark, s * (HW + 0.012), 0.88, dz);
    for (const dz of [1.30, 0.42]) add(box(0.06, 0.05, 0.16), chrome, s * (HW + 0.035), 0.92, dz);
  }
  add(box(0.10, 0.06, 0.05), chrome, 0, 0.92, RZ - 0.03);

  // ---- wheels: rim with spokes, on named axle pivots
  const joints = {};
  const makeWheel = (name, x, z) => {
    const p = new THREE.Group();
    p.position.set(x, AX, z);
    g.add(p);
    add(cyl(AX, 0.21, 14), dark, 0, 0, 0, 0, 0, Math.PI / 2, p);
    add(cyl(AX - 0.075, 0.23, 14), dark, 0, 0, 0, 0, 0, Math.PI / 2, p);
    for (const s of [-1, 1]) {
      add(cyl(0.195, 0.025, 12), cream, s * 0.108, 0, 0, 0, 0, Math.PI / 2, p);
      add(cyl(0.125, 0.045, 12), chrome, s * 0.118, 0, 0, 0, 0, Math.PI / 2, p);
      for (let k = 0; k < 5; k++)
        add(box(0.03, 0.05, 0.16), chrome, s * 0.118, Math.sin(k * 1.2566) * 0.115, Math.cos(k * 1.2566) * 0.115, -k * 1.2566, 0, 0, p);
    }
    joints[name] = p;
    return p;
  };
  makeWheel('wheelFL', -TRACK, FA);
  makeWheel('wheelFR',  TRACK, FA);
  makeWheel('wheelRL', -TRACK, RA);
  makeWheel('wheelRR',  TRACK, RA);

  // ---- bumpers wrapping the corners, built from short angled segments
  for (const s of [-1, 1]) {
    const zb = s > 0 ? 2.19 : -2.19;
    add(box(1.42, 0.15, 0.12), chrome, 0, 0.54, zb);
    for (const sx of [-1, 1]) {
      add(box(0.26, 0.15, 0.12), chrome, sx * 0.79, 0.54, zb - s * 0.05, 0, sx * s * 0.55, 0);
      add(box(0.09, 0.10, 0.26), chrome, sx * 0.80, 0.54, zb - s * 0.18);
      add(box(0.10, 0.34, 0.10), chrome, sx * 0.56, 0.62, zb);
    }
    add(cyl(0.045, 1.44, 8), chrome, 0, 0.37, zb, 0, 0, Math.PI / 2);
    for (const x of [-0.62, 0.62]) add(cyl(0.04, 0.22, 8), chrome, x, 0.46, zb);
  }

  // ---- lamps
  for (const s of [-1, 1]) {
    add(cyl(0.15, 0.08, 12), chrome, s * 0.62, 0.99, FZ + 0.02, Math.PI / 2);
    add(cyl(0.115, 0.05, 12), lamp,  s * 0.62, 0.99, FZ + 0.07, Math.PI / 2);
    add(cyl(0.055, 0.07, 10), lamp,  s * 0.80, 0.75, FZ - 0.01, Math.PI / 2);
    add(cyl(0.065, 0.05, 10), lamp, s * 0.62, 0.91, RZ - 0.03, Math.PI / 2);
    add(cyl(0.065, 0.05, 10), red,  s * 0.62, 0.73, RZ - 0.03, Math.PI / 2);
  }

  // ---- spare wheel on the nose + blank roundel
  add(cyl(0.30, 0.16, 16), dark,   0, 0.80, FZ + 0.08, Math.PI / 2);
  add(cyl(0.235, 0.06, 16), dark,  0, 0.80, FZ + 0.16, Math.PI / 2);
  add(cyl(0.225, 0.02, 16), cream, 0, 0.80, FZ + 0.195, Math.PI / 2);

  // ---- blank plates
  add(box(0.44, 0.13, 0.03), cream, 0, 0.47, RZ - 0.05);
  add(box(0.40, 0.12, 0.03), cream, 0, 0.45, FZ + 0.05);

  // ---- mirrors on stalks; these set the overall width
  for (const s of [-1, 1]) {
    add(cyl(0.022, 0.22, 6), chrome, s * 0.82, 1.20, FZ - 0.14, 0, 0, s * Math.PI / 2.6);
    add(cyl(0.078, 0.035, 10), chrome, s * 0.895, 1.25, FZ - 0.14, 0, 0, Math.PI / 2);
  }

  // ---- interior hint
  add(box(1.50, 0.12, 0.46), seat, 0, 1.02, 1.10);
  add(box(1.50, 0.34, 0.10), seat, 0, 1.18, 0.88);
  add(cyl(0.16, 0.03, 12), dark, -0.45, 1.22, 1.56, Math.PI / 2.4);

  // ---- roof rack, built as a flat ladder frame on short legs
  const rx = 0.64, rzF = 1.34, rzR = -1.58, deck = 1.76;
  for (const sx of [-1, 1]) for (const z of [rzF, 0.0, rzR])
    add(box(0.05, 0.16, 0.05), chrome, sx * rx, 1.68, z);
  for (const sx of [-1, 1]) add(box(0.06, 0.06, rzF - rzR), chrome, sx * rx, deck, (rzF + rzR) / 2);
  for (const z of [rzF, rzR]) add(box(rx * 2, 0.06, 0.06), chrome, 0, deck, z);
  for (let i = 0; i < 6; i++)
    add(box(rx * 2 - 0.08, 0.035, 0.05), chrome, 0, deck - 0.012, rzR + 0.22 + i * ((rzF - rzR - 0.44) / 5));
  for (const sx of [-1, 1]) {
    add(box(0.04, 0.04, rzF - rzR), chrome, sx * rx, deck + 0.13, (rzF + rzR) / 2);
    for (const z of [rzF - 0.10, 0.0, rzR + 0.10]) add(box(0.035, 0.13, 0.035), chrome, sx * rx, deck + 0.07, z);
  }
  add(box(rx * 2, 0.04, 0.04), chrome, 0, deck + 0.13, rzR + 0.10);

  // ---- blank signboard across the front of the rack
  add(box(1.34, 0.20, 0.045), gold,  0, 1.83, rzF + 0.03);
  add(box(1.40, 0.25, 0.02), chrome, 0, 1.83, rzF - 0.005);
  for (const sx of [-1, 1]) add(box(0.03, 0.16, 0.03), chrome, sx * 0.55, 1.71, rzF + 0.02, 0, 0, 0.5 * sx);

  // ---- luggage box
  add(box(0.86, 0.17, 1.44), teal,  0.20, 1.86, -0.74);
  add(box(0.88, 0.04, 1.46), cream, 0.20, 1.93, -0.74);

  // ---- surfboard, tapered from stacked segments
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.5) / 9;
    const w = 0.50 * Math.sin(Math.PI * Math.pow(t, 0.62)) * 0.98 + 0.06;
    add(box(w, 0.08, 2.44 / 9 + 0.01), gold, -0.46, 1.84, -1.12 + t * 2.44);
  }
  add(box(0.04, 0.14, 0.20), cream, -0.46, 1.94, -0.94);

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
