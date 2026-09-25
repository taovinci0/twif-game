// street_lantern candidate C — a different part breakdown.
// Read as ironwork rather than as a carved post: a square box-section mast, four
// independent framed panel units bolted on to make the housing, a two-tier roof
// with a flared skirt and separate upturned corner blades, and a round paper
// lamp hung off a braced bracket. All panels blank; art arrives as a texture.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    m.name = name;
    return m;
  };
  const dark  = M(0x111315, 0.76, 'metal', 0.34);
  const black = M(0x080A0B, 0.86, 'stone');
  const gold  = M(0xD4A24C, 0.34, 'metal', 0.62);
  // The lighting system finds panels by this material name.
  const panel = M(0xE7DFC9, 0.68, 'plaster', 0, { side: THREE.DoubleSide });

  const Q = Math.PI / 4;
  const R = (halfWidth) => halfWidth * Math.SQRT2;   // half-width -> 4-segment circumradius
  const add = (parent, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  // --- plinth: flat pad, chamfered block, collar, corner bolts
  add(g, box(0.50, 0.08, 0.50), black, 0, 0.04, 0);
  add(g, new THREE.CylinderGeometry(R(0.170), R(0.210), 0.12, 4), dark, 0, 0.14, 0, 0, Q, 0);
  add(g, box(0.30, 0.05, 0.30), black, 0, 0.225, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(g, box(0.045, 0.035, 0.045), gold, sx * 0.19, 0.0975, sz * 0.19);
  }

  // --- box-section mast
  add(g, box(0.095, 1.58, 0.095), dark, 0, 1.04, 0);
  add(g, box(0.135, 0.055, 0.135), gold, 0, 0.44, 0);
  add(g, box(0.125, 0.050, 0.125), gold, 0, 1.66, 0);
  add(g, box(0.105, 0.20, 0.022), black, 0, 0.92, 0.058);   // access plate

  // --- braced bracket with a round paper lamp
  add(g, box(0.54, 0.040, 0.040), dark, -0.14, 1.715, 0);
  add(g, box(0.30, 0.028, 0.026), dark, -0.155, 1.610, 0, 0, 0, 0.62);
  const hx = -0.34;
  add(g, box(0.016, 0.10, 0.016), dark, hx, 1.645, 0);
  const bulb = new THREE.SphereGeometry(0.118, 10, 7);
  bulb.scale(1, 0.90, 1);
  add(g, bulb, panel, hx, 1.492, 0);
  add(g, new THREE.CylinderGeometry(0.052, 0.062, 0.030, 8), dark, hx, 1.596, 0);
  add(g, new THREE.CylinderGeometry(0.048, 0.040, 0.026, 8), dark, hx, 1.390, 0);

  // --- housing: four independent framed panel units, each tilted in by the taper
  const hb = 1.87, bw = 0.205, tw = 0.168, hh = 0.500;
  const slant = Math.hypot(hh, bw - tw), tilt = Math.atan2(bw - tw, hh);
  const edge = Math.atan2(bw - tw, slant);
  add(g, box(0.50, 0.05, 0.50), dark, 0, 1.845, 0);
  for (let k = 0; k < 4; k++) {
    const u = new THREE.Group();
    u.rotation.y = k * Math.PI / 2;
    const p = new THREE.Group();
    p.position.set(0, hb, bw);
    p.rotation.x = -tilt;
    const s = new THREE.Shape();
    s.moveTo(-bw, 0); s.lineTo(bw, 0); s.lineTo(tw, slant); s.lineTo(-tw, slant); s.lineTo(-bw, 0);
    add(p, new THREE.ShapeGeometry(s), panel, 0, 0, 0);
    add(p, box(0.030, slant + 0.02, 0.032), dark,  0.187, slant / 2, 0.016, 0, 0,  edge);
    add(p, box(0.030, slant + 0.02, 0.032), dark, -0.187, slant / 2, 0.016, 0, 0, -edge);
    add(p, box(0.33, 0.030, 0.032), dark, 0, slant - 0.018, 0.016);
    add(p, box(0.41, 0.032, 0.032), dark, 0, 0.018, 0.016);
    u.add(p);
    g.add(u);
  }
  add(g, box(0.44, 0.05, 0.44), dark, 0, 2.395, 0);

  // --- two-tier roof: flared skirt, corner blades, cap
  add(g, new THREE.CylinderGeometry(R(0.220), R(0.330), 0.14, 4, 1, true), black, 0, 2.490, 0, 0, Q, 0);
  for (const s of [-1, 1]) {
    add(g, box(0.68, 0.030, 0.050), gold, 0, 2.428, s * 0.330);
    add(g, box(0.050, 0.030, 0.68), gold, s * 0.330, 2.428, 0);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const blade = new THREE.Group();
    blade.rotation.y = Math.atan2(-sz, sx);
    add(blade, box(0.15, 0.030, 0.085), gold, 0.47, 2.448, 0, 0, 0, 0.52);
    g.add(blade);
  }
  add(g, box(0.50, 0.035, 0.50), dark, 0, 2.578, 0);
  add(g, new THREE.ConeGeometry(R(0.212), 0.145, 4), black, 0, 2.668, 0, 0, Q, 0);

  // --- finial
  add(g, box(0.10, 0.05, 0.10), gold, 0, 2.725, 0, 0, Q, 0);
  add(g, new THREE.ConeGeometry(0.032, 0.075, 6), gold, 0, 2.7625, 0);

  // --- contract: base at y=0, centred on x and z
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
