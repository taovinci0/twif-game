// Candidate A — "Subnet Summer" microbus, assembled from primitives.
// Boxes for the body masses, cylinders for the rounded roof edges and plan
// corners, cylinders for the wheels and lamps.  The lower body is built in
// sections so the wheel arches are real openings rather than painted-on trim.
// No glyphs: the nose roundel, the rack signboard and the plates are blank.
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

  // ---- key dimensions
  const HW = 0.86;                 // body half width
  const FZ = 2.00, RZ = -2.02;     // nose / tail panel planes
  const TUB = 0.72;                // underside of the full-length body tub
  const BELT = 1.00;               // top of the teal lower body
  const UPTOP = 1.54;              // top of the cream upper body
  const ROCK = 0.36;               // underside of the rockers and valances
  const AX = 0.345, TRACK = 0.70, FA = 1.45, RA = -1.35, ARCH = 0.44;

  // ---- body tub (teal), full length, sitting above the wheel arches
  add(box(HW * 2, BELT - TUB, FZ - RZ), teal, 0, (BELT + TUB) / 2, (FZ + RZ) / 2);
  // rockers between the arches, and the valances under nose and tail
  add(box(HW * 2, TUB - ROCK, (FA - ARCH) - (RA + ARCH)), teal, 0, (TUB + ROCK) / 2, ((FA - ARCH) + (RA + ARCH)) / 2);
  add(box(HW * 2, TUB - ROCK, FZ - (FA + ARCH)), teal, 0, (TUB + ROCK) / 2, (FZ + FA + ARCH) / 2);
  add(box(HW * 2, TUB - ROCK, (RA - ARCH) - RZ), teal, 0, (TUB + ROCK) / 2, (RZ + RA - ARCH) / 2);
  // floor pan, narrow enough to clear the wheels, so there is no hole underneath
  add(box(1.16, 0.10, FZ - RZ - 0.30), dark, 0, ROCK + 0.05, (FZ + RZ) / 2);

  // ---- upper body (cream)
  add(box(HW * 2 - 0.04, UPTOP - BELT, FZ - RZ - 0.06), cream, 0, (UPTOP + BELT) / 2, (FZ + RZ) / 2);

  // rounded plan corners, so the body is not a slab seen from above
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const z = sz > 0 ? FZ - 0.20 : RZ + 0.20;
    add(cyl(0.20, BELT - TUB, 10), teal,  sx * (HW - 0.20), (BELT + TUB) / 2, z);
    add(cyl(0.19, UPTOP - BELT, 10), cream, sx * (HW - 0.20), (UPTOP + BELT) / 2, z);
  }

  // ---- rounded roof: a slab between long edge cylinders, capped at the ends
  add(box(HW * 2 - 0.28, 0.16, FZ - RZ - 0.28), cream, 0, 1.60, 0);
  for (const sx of [-1, 1])
    add(cyl(0.14, FZ - RZ - 0.28, 10), cream, sx * (HW - 0.14), 1.54, (FZ + RZ) / 2, Math.PI / 2);
  for (const sz of [-1, 1])
    add(cyl(0.14, HW * 2 - 0.28, 10), cream, 0, 1.54, sz > 0 ? FZ - 0.14 : RZ + 0.14, 0, 0, Math.PI / 2);
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(new THREE.SphereGeometry(0.14, 8, 6), cream, sx * (HW - 0.14), 1.54, sz > 0 ? FZ - 0.14 : RZ + 0.14);

  // ---- the cream V on the nose: two angled slabs meeting low and centre
  for (const s of [-1, 1])
    add(box(1.02, 0.20, 0.05), cream, s * 0.42, 0.88, FZ + 0.015, 0, 0, s * 0.40);
  add(box(HW * 2 - 0.02, 0.14, 0.05), cream, 0, 1.16, FZ + 0.015);

  // ---- beltline trim, and the running boards along the rockers
  for (const s of [-1, 1]) {
    add(box(0.04, 0.07, FZ - RZ - 0.30), cream, s * (HW + 0.01), BELT - 0.03, (FZ + RZ) / 2);
    add(box(0.10, 0.06, (FA - ARCH) - (RA + ARCH)), cream, s * (HW - 0.01), ROCK + 0.05, ((FA - ARCH) + (RA + ARCH)) / 2);
  }

  // ---- marigold wave along each flank; it crests over the wheel arches
  const N = 22, z0 = RZ + 0.16, z1 = FZ - 0.16, seg = (z1 - z0) / N;
  for (const s of [-1, 1]) for (let i = 0; i < N; i++) {
    const zc = z0 + seg * (i + 0.5);
    let y = 0.76 + 0.14 * Math.sin((zc - z0) / (z1 - z0) * Math.PI * 3.0 + 0.7);
    const overArch = Math.abs(zc - FA) < ARCH + 0.04 || Math.abs(zc - RA) < ARCH + 0.04;
    if (overArch) y = Math.max(y, 0.86);
    add(box(0.035, 0.20, seg * 1.3), gold, s * (HW + 0.012), y, zc);
  }

  // ---- glass.  The windscreen is split by a central pillar.
  for (const s of [-1, 1])
    add(box(0.72, 0.36, 0.05), glass, s * 0.40, 1.28, FZ + 0.012, 0.10);
  add(box(0.08, 0.42, 0.07), cream, 0, 1.28, FZ + 0.02);
  add(box(1.66, 0.06, 0.07), cream, 0, 1.08, FZ + 0.02);
  // wipers
  for (const s of [-1, 1]) add(cyl(0.012, 0.42, 5), chrome, s * 0.36, 1.14, FZ + 0.05, 0, 0, 1.15 * s);

  // side glass: cab door pane then three saloon panes
  const panes = [[1.24, 0.78], [0.32, 0.66], [-0.38, 0.66], [-1.08, 0.66]];
  for (const s of [-1, 1]) for (const [pz, pw] of panes)
    add(box(0.05, 0.38, pw), glass, s * (HW + 0.005), 1.27, pz);
  // rear quarter air intake slats
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++)
    add(box(0.05, 0.035, 0.34), dark, s * (HW + 0.012), 1.12 + i * 0.07, -1.70);
  // rear window
  add(box(1.12, 0.36, 0.05), glass, 0, 1.27, RZ - 0.012);

  // ---- door seams and handles on the flanks
  for (const s of [-1, 1]) {
    for (const dz of [1.90, 0.94, -0.14]) add(box(0.03, 0.30, 0.03), dark, s * (HW + 0.008), 0.86, dz);
    for (const dz of [1.30, 0.42]) add(box(0.05, 0.05, 0.16), chrome, s * (HW + 0.03), 0.90, dz);
  }
  // rear engine lid seam and handle
  add(box(0.92, 0.03, 0.03), dark, 0, 0.78, RZ - 0.014);
  add(box(0.10, 0.06, 0.05), chrome, 0, 0.90, RZ - 0.035);

  // ---- wheels, on named pivots at the axle centres
  const joints = {};
  const makeWheel = (name, x, z) => {
    const p = new THREE.Group();
    p.position.set(x, AX, z);
    g.add(p);
    add(cyl(AX, 0.20, 14), dark, 0, 0, 0, 0, 0, Math.PI / 2, p);
    add(cyl(AX - 0.07, 0.23, 14), dark, 0, 0, 0, 0, 0, Math.PI / 2, p);
    for (const s of [-1, 1]) {
      add(cyl(0.185, 0.03, 12), chrome, s * 0.105, 0, 0, 0, 0, Math.PI / 2, p);
      add(new THREE.SphereGeometry(0.105, 10, 6), chrome, s * 0.115, 0, 0, 0, 0, 0, p);
    }
    joints[name] = p;
    return p;
  };
  makeWheel('wheelFL', -TRACK, FA);
  makeWheel('wheelFR',  TRACK, FA);
  makeWheel('wheelRL', -TRACK, RA);
  makeWheel('wheelRR',  TRACK, RA);

  // ---- wheel arch trim, stepped round each opening
  for (const sx of [-1, 1]) for (const z of [FA, RA]) for (let i = 0; i < 7; i++) {
    const a = Math.PI * (i + 0.5) / 7;
    add(box(0.07, 0.10, 0.22), cream, sx * (HW + 0.005), AX + Math.sin(a) * ARCH, z - Math.cos(a) * ARCH, Math.PI / 2 - a);
  }

  // ---- bumpers, front and rear, with overriders and a nudge bar
  for (const s of [-1, 1]) {
    const z = s > 0 ? 2.19 : -2.19;
    add(box(1.68, 0.15, 0.11), chrome, 0, 0.54, z);
    for (const x of [-0.56, 0.56]) add(box(0.10, 0.34, 0.10), chrome, x, 0.62, z);
    for (const x of [-0.72, 0.72]) add(box(0.09, 0.10, 0.24), chrome, x, 0.54, z - s * 0.13);
    add(cyl(0.045, 1.42, 8), chrome, 0, 0.36, z, 0, 0, Math.PI / 2);
    for (const x of [-0.62, 0.62]) add(cyl(0.04, 0.24, 8), chrome, x, 0.45, z);
  }

  // ---- lamps
  for (const s of [-1, 1]) {
    add(cyl(0.145, 0.07, 12), chrome, s * 0.62, 1.00, FZ + 0.03, Math.PI / 2);
    add(cyl(0.115, 0.05, 12), lamp,   s * 0.62, 1.00, FZ + 0.07, Math.PI / 2);
    add(cyl(0.055, 0.06, 10), lamp,   s * 0.80, 0.76, FZ - 0.01, Math.PI / 2);
    add(cyl(0.065, 0.05, 10), lamp, s * 0.62, 0.92, RZ - 0.035, Math.PI / 2);
    add(cyl(0.065, 0.05, 10), red,  s * 0.62, 0.74, RZ - 0.035, Math.PI / 2);
  }

  // ---- spare wheel on the nose + blank roundel disc (art applied later)
  add(cyl(0.30, 0.16, 16), dark,   0, 0.82, FZ + 0.09, Math.PI / 2);
  add(cyl(0.235, 0.06, 16), dark,  0, 0.82, FZ + 0.17, Math.PI / 2);
  add(cyl(0.225, 0.02, 16), cream, 0, 0.82, FZ + 0.205, Math.PI / 2);

  // ---- blank number plates, front and rear
  add(box(0.44, 0.13, 0.03), cream, 0, 0.46, RZ - 0.05);
  add(box(0.40, 0.12, 0.03), cream, 0, 0.44, FZ + 0.06);

  // ---- mirrors on stalks; these set the overall width
  for (const s of [-1, 1]) {
    add(cyl(0.022, 0.22, 6), chrome, s * 0.82, 1.22, FZ - 0.10, 0, 0, s * Math.PI / 2.6);
    add(cyl(0.075, 0.035, 10), chrome, s * 0.895, 1.27, FZ - 0.10, 0, 0, Math.PI / 2);
  }

  // ---- interior hint so the glass is not a void
  add(box(1.50, 0.12, 0.46), seat, 0, 1.02, 1.08);
  add(box(1.50, 0.34, 0.10), seat, 0, 1.18, 0.86);
  add(cyl(0.16, 0.03, 12), dark, -0.45, 1.22, 1.54, Math.PI / 2.4);

  // ---- roof rack: legs, perimeter rails, slats, raised side railing
  const rx = 0.64, rzF = 1.34, rzR = -1.58, deck = 1.74;
  for (const sx of [-1, 1]) for (const z of [rzF, 0.0, rzR])
    add(cyl(0.028, 0.14, 6), chrome, sx * rx, 1.67, z);
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

  // ---- luggage box on the rack
  add(box(0.86, 0.18, 1.44), teal,  0.20, 1.84, -0.74);
  add(box(0.88, 0.04, 1.46), cream, 0.20, 1.92, -0.74);

  // ---- surfboard alongside it
  const bd = new THREE.Group();
  bd.position.set(-0.46, 1.79, 0.10);
  bd.rotation.x = Math.PI / 2;
  bd.scale.set(1, 1, 0.26);
  g.add(bd);
  add(cyl(0.24, 1.50, 8), gold, 0, 0, 0, 0, 0, 0, bd);
  add(new THREE.ConeGeometry(0.24, 0.62, 8), gold, 0,  1.06, 0, 0, 0, 0, bd);
  add(new THREE.ConeGeometry(0.24, 0.46, 8), gold, 0, -0.98, 0, Math.PI, 0, 0, bd);
  add(box(0.05, 0.02, 0.20), cream, -0.46, 1.74, -0.70);

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
