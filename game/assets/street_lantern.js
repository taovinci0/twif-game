// Street lantern — 2.80 m, the practical warm light of the street district.
//
// Chosen from three candidates by looking at the verifier sheet. The primitive
// assembly hung four gold chips off the roof edge that read as a crown of blades
// rather than as upturned corners, and the ironwork reading lost the pagoda
// entirely to a two-tier bell with horns and a finial you could not see. This
// one sweeps the roof as a revolved profile, squares it off and lifts its
// corners, so the flare and the corner lift are real geometry.
//
// Its one real weakness on the sheet, a foot whose sloped treads read as a
// pyramid rather than as a stepped square plinth, is cut with sharp risers here,
// borrowed from the primitive candidate that got that part right.
//
// No glyphs anywhere. The panels are blank and carry their art as a texture
// applied by the game layer. The panel material is named 'plaster' because the
// lighting system finds the panels by that name to make them emit.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    m.name = name;
    return m;
  };
  const dark  = M(0x111315, 0.78, 'metal', 0.30);
  const black = M(0x080A0B, 0.86, 'stone');
  const gold  = M(0xD4A24C, 0.34, 'metal', 0.62);
  // A roof lathe has no underside, so it is a hole from below without this.
  const roofM = M(0x080A0B, 0.84, 'tile', 0.05, { side: THREE.DoubleSide });
  const panel = M(0xE7DFC9, 0.68, 'plaster', 0, { side: THREE.DoubleSide });

  const Q = Math.PI / 4;
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    g.add(m);
    return m;
  };
  const V2 = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
  const lathe = (pts, seg, phi = 0) => new THREE.LatheGeometry(V2(pts), seg, phi);
  const ring = (outer, inner, depth) => {
    const s = new THREE.Shape(), o = outer / 2, i = inner / 2;
    s.moveTo(-o, -o); s.lineTo(o, -o); s.lineTo(o, o); s.lineTo(-o, o); s.lineTo(-o, -o);
    const h = new THREE.Path();
    h.moveTo(-i, -i); h.lineTo(-i, i); h.lineTo(i, i); h.lineTo(i, -i); h.lineTo(-i, -i);
    s.holes.push(h);
    return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  };
  const slab = (side, depth) => {
    const s = new THREE.Shape(), o = side / 2;
    s.moveTo(-o, -o); s.lineTo(o, -o); s.lineTo(o, o); s.lineTo(-o, o); s.lineTo(-o, -o);
    return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  };
  const flat = -Math.PI / 2;    // lay an extruded profile down onto the ground plane

  // A revolved roof, then squared off: each ring is pushed out to a square of the
  // same half-width, and the corners of the outer rings are lifted. Four radial
  // segments would put every vertex on a corner and nothing could lift relative
  // to anything, so this sweeps eight and squares them.
  const pagoda = (pts, lift, eaveY, apexY) => {
    const geo = lathe(pts, 8);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const r = Math.hypot(x, z);
      if (r < 1e-5) continue;
      const k = r / Math.max(Math.abs(x), Math.abs(z));     // circle -> square
      const corner = (k - 1) / (Math.SQRT2 - 1);            // 0 at a face, 1 at a corner
      const out = Math.min(1, Math.max(0, (apexY - y) / Math.max(1e-5, apexY - eaveY)));
      p.setXYZ(i, x * k, y + lift * corner * out * out * out, z * k);
    }
    geo.computeVertexNormals();
    return geo;
  };

  // --- small square stepped foot: sharp risers, flat treads
  add(lathe([[0.001, 0], [0.325, 0], [0.325, 0.090], [0.2546, 0.090], [0.2546, 0.168],
             [0.198, 0.168], [0.198, 0.232], [0.120, 0.232]], 4, Q), black, 0, 0, 0);
  add(lathe([[0.120, 0.232], [0.132, 0.248], [0.132, 0.278], [0.100, 0.296]], 8), gold, 0, 0, 0);

  // --- post, rising to two thirds of the height, mouldings swept into one profile
  add(lathe([[0.090, 0.290], [0.064, 0.338], [0.060, 0.500], [0.076, 0.522], [0.076, 0.576],
             [0.058, 0.612], [0.052, 1.610], [0.070, 1.640], [0.070, 1.700], [0.052, 1.735],
             [0.052, 1.845]], 8), dark, 0, 0, 0);

  // --- crossarm, longer to one side, carrying the small secondary lamp
  const armShape = new THREE.Shape();
  armShape.moveTo(-0.022, 0); armShape.lineTo(0.022, 0);
  armShape.lineTo(0.015, 0.55); armShape.lineTo(-0.015, 0.55); armShape.lineTo(-0.022, 0);
  add(new THREE.ExtrudeGeometry(armShape, { depth: 0.044, bevelEnabled: false }),
      dark, 0.18, 1.740, -0.022, 0, 0, Math.PI / 2);
  const hx = -0.35;
  add(new THREE.BoxGeometry(0.020, 0.110, 0.020), dark, hx, 1.658, 0);
  add(new THREE.CylinderGeometry(0.038, 0.030, 0.030, 8), gold, hx, 1.720, 0);
  add(slab(0.25, 0.032), dark, hx, 1.578, 0, flat);
  add(lathe([[0.156, 1.288], [0.130, 1.552]], 4, Q), panel, hx, 0, 0);
  add(ring(0.25, 0.21, 0.022), dark, hx, 1.408, 0, flat);
  add(slab(0.23, 0.030), dark, hx, 1.258, 0, flat);
  add(pagoda([[0.135, 0.012], [0.116, 0.000], [0.074, 0.042], [0.012, 0.084]], 0.024, 0, 0.084),
      roofM, hx, 1.596, 0);
  add(lathe([[0.001, 0], [0.030, 0.006], [0.022, 0.032], [0.001, 0.050]], 6), gold, hx, 1.222, 0);

  // --- housing: a tapered four-sided box of blank panels in a swept dark frame
  add(slab(0.50, 0.05), dark, 0, 1.840, 0, flat);
  add(lathe([[0.294, 1.890], [0.243, 2.390]], 4, Q), panel, 0, 0, 0);
  add(slab(0.42, 0.05), dark, 0, 2.390, 0, flat);
  add(ring(0.44, 0.39, 0.026), dark, 0, 2.128, 0, flat);
  const cb = 0.208, ct = 0.172, tilt = Math.atan2(cb - ct, 0.50);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(new THREE.BoxGeometry(0.030, 0.56, 0.030), dark,
        sx * (cb + ct) / 2, 2.140, sz * (cb + ct) / 2, -tilt * sz, 0, tilt * sx);
  }

  // --- pagoda roof: swept, squared, corners lifted
  add(ring(0.50, 0.42, 0.030), gold, 0, 2.440, 0, flat);
  add(pagoda([[0.300, 0.020], [0.262, 0.000], [0.196, 0.046], [0.110, 0.108], [0.016, 0.175]],
             0.058, 0, 0.175), roofM, 0, 2.462, 0);

  // --- finial: bead and short spike, one profile
  add(lathe([[0.001, 2.620], [0.076, 2.632], [0.076, 2.650], [0.050, 2.670],
             [0.056, 2.700], [0.030, 2.722], [0.024, 2.740], [0.001, 2.800]], 6), gold, 0, 0, 0);

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
