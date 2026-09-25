// banner_pole candidate A — primitive assembly.
// Pole, base and arms are Box/Cylinder/Cone. The cloth is a PlaneGeometry grid
// whose z is displaced into a double curve across its width, held still at the
// rod and at the weight bar so those stay flush with it. Faces point +Z and -Z,
// so a texture maps cleanly. Blank geometry: no lettering anywhere.
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
  const cloth = M(0xE7DFC9, 0.88, 'fabric', 0, { side: THREE.DoubleSide });

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    g.add(m);
    return m;
  };

  // A hanging sheet: a double curve across the width plus a slight twist, faded
  // out at top and bottom where the rod and the bar hold it, and a shallow V cut
  // into the hem.
  const sheet = (w, h, nx, ny, amp, twist, vcut) => {
    const geo = new THREE.PlaneGeometry(w, h, nx, ny);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      const u = x / w + 0.5;              // 0..1 across the width
      const t = 0.5 - y / h;              // 0 at the rod, 1 at the hem
      const env = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, t))), 0.8);
      p.setZ(i, env * (amp * Math.sin(2 * Math.PI * u) + twist * (u - 0.5)));
      if (t > 0.995) p.setY(i, y + vcut * (1 - Math.abs(2 * u - 1)));
    }
    geo.computeVertexNormals();
    return geo;
  };

  // --- heavy square base block
  add(new THREE.BoxGeometry(0.72, 0.20, 0.72), black, 0, 0.10, 0);
  add(new THREE.BoxGeometry(0.54, 0.14, 0.54), dark,  0, 0.27, 0);
  add(new THREE.CylinderGeometry(0.150, 0.172, 0.07, 10), gold, 0, 0.375, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(new THREE.BoxGeometry(0.06, 0.05, 0.06), gold, sx * 0.27, 0.225, sz * 0.27);
  }

  // --- pole
  add(new THREE.CylinderGeometry(0.062, 0.080, 3.70, 10), dark, 0, 2.19, 0);
  add(new THREE.CylinderGeometry(0.086, 0.086, 0.05, 10), gold, 0, 3.08, 0);
  add(new THREE.CylinderGeometry(0.080, 0.080, 0.05, 10), gold, 0, 3.96, 0);
  add(new THREE.SphereGeometry(0.075, 10, 6), gold, 0, 4.075, 0);
  add(new THREE.ConeGeometry(0.042, 0.095, 8), gold, 0, 4.1525, 0);

  // --- top arm and the long banner
  add(new THREE.BoxGeometry(1.18, 0.055, 0.055), dark, 0.48, 3.90, 0);
  add(new THREE.BoxGeometry(0.44, 0.032, 0.032), dark, 0.23, 3.79, 0, 0, 0, -0.60);
  add(new THREE.CylinderGeometry(0.024, 0.024, 1.00, 8), gold, 0.56, 3.855, 0, 0, 0, Math.PI / 2);
  for (const x of [0.18, 0.94]) add(new THREE.BoxGeometry(0.016, 0.075, 0.016), dark, x, 3.885, 0);
  add(sheet(0.90, 2.60, 6, 10, 0.060, 0.050, 0.160), cloth, 0.56, 2.54, 0);
  add(new THREE.BoxGeometry(0.96, 0.045, 0.072), black, 0.56, 1.430, 0);
  for (const x of [0.13, 0.99]) add(new THREE.BoxGeometry(0.05, 0.05, 0.085), gold, x, 1.430, 0);

  // --- shorter banner on the far side, hung lower
  add(new THREE.BoxGeometry(0.90, 0.050, 0.050), dark, -0.37, 3.04, 0);
  add(new THREE.BoxGeometry(0.36, 0.030, 0.030), dark, -0.20, 2.94, 0, 0, 0, 0.60);
  add(new THREE.CylinderGeometry(0.021, 0.021, 0.70, 8), gold, -0.46, 2.995, 0, 0, 0, Math.PI / 2);
  for (const x of [-0.72, -0.20]) add(new THREE.BoxGeometry(0.014, 0.065, 0.014), dark, x, 3.018, 0);
  add(sheet(0.62, 1.80, 5, 8, 0.045, 0.036, 0.120), cloth, -0.46, 2.08, 0);
  add(new THREE.BoxGeometry(0.67, 0.040, 0.062), black, -0.46, 1.310, 0);
  for (const x of [-0.755, -0.165]) add(new THREE.BoxGeometry(0.044, 0.044, 0.072), gold, x, 1.310, 0);

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
