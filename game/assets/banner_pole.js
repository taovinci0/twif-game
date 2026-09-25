// Banner pole — 4.20 m, the hanging cloth banners of the hub and the street.
//
// Chosen from three candidates by looking at the verifier sheet. The swept
// candidate gave the cloth a real edge thickness but its ExtrudeGeometry UVs are
// world-projected, which is the wrong surface to hand a texture, and its S
// section banded into visible facets. The civic-mast reading hung the nicest
// cloth of the three but stood it on four stay struts that read as a surveyor's
// tripod at ankle height and contradicted the heavy square base block. This one
// keeps the block and takes the one thing the mast reading got right: a sag in
// the top edge between the two hanging points, so the cloth does not start dead
// straight and then curve.
//
// No glyphs anywhere. The cloth faces are blank, face +Z and -Z, are 0.90 m by
// 2.60 m on the long banner, and carry clean 0..1 UVs, so the game layer's
// texture maps without surprises. No mounts are declared: the pole, arms, base
// and the two banners at different depths give every side something to read, and
// the four-side check passes without an exemption.
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
  // A hanging cloth is a hole from behind without this.
  const cloth = M(0xE7DFC9, 0.88, 'fabric', 0, { side: THREE.DoubleSide });

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    g.add(m);
    return m;
  };

  // A hanging sheet. A double curve across the width plus a slight twist, faded
  // to nothing at the rod and at the weight bar so both stay flush with it; a sag
  // in the top edge between the two hanging points; a shallow V cut in the hem.
  // The grid keeps its PlaneGeometry UVs, so the face maps 0..1 either way.
  const sheet = (w, h, nx, ny, amp, twist, vcut, sag) => {
    const geo = new THREE.PlaneGeometry(w, h, nx, ny);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      const u = Math.min(1, Math.max(0, x / w + 0.5));    // 0..1 across the width
      const t = Math.min(1, Math.max(0, 0.5 - y / h));    // 0 at the rod, 1 at the hem
      const env = Math.pow(Math.sin(Math.PI * t), 0.8);
      p.setZ(i, env * (amp * Math.sin(2 * Math.PI * u) + twist * (u - 0.5)));
      let dy = -sag * Math.sin(Math.PI * u) * (1 - t) * (1 - t);
      if (t > 0.995) dy += vcut * (1 - Math.abs(2 * u - 1));
      p.setY(i, y + dy);
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
  add(new THREE.CylinderGeometry(0.088, 0.088, 0.05, 10), gold, 0, 2.45, 0);
  add(new THREE.CylinderGeometry(0.082, 0.082, 0.05, 10), gold, 0, 3.58, 0);
  add(new THREE.CylinderGeometry(0.080, 0.080, 0.05, 10), gold, 0, 4.015, 0);
  add(new THREE.SphereGeometry(0.075, 10, 6), gold, 0, 4.075, 0);
  add(new THREE.ConeGeometry(0.042, 0.095, 8), gold, 0, 4.1525, 0);

  // --- top arm and the long banner, 0.90 x 2.60 of blank cloth
  add(new THREE.BoxGeometry(1.18, 0.055, 0.055), dark, 0.48, 3.910, 0);
  add(new THREE.BoxGeometry(0.435, 0.034, 0.034), dark, 0.25, 3.785, -0.085, 0, 0, 0.40);
  add(new THREE.CylinderGeometry(0.022, 0.022, 1.00, 8), gold, 0.56, 3.862, 0, 0, 0, Math.PI / 2);
  for (const x of [0.055, 1.065]) add(new THREE.BoxGeometry(0.038, 0.038, 0.038), gold, x, 3.862, 0);
  add(sheet(0.90, 2.60, 6, 10, 0.060, 0.050, 0.160, 0.055), cloth, 0.56, 2.538, 0);
  add(new THREE.BoxGeometry(0.96, 0.045, 0.072), black, 0.56, 1.428, 0);
  for (const x of [0.13, 0.99]) add(new THREE.BoxGeometry(0.05, 0.05, 0.085), gold, x, 1.428, 0);

  // --- shorter banner on the opposite side, hung lower, hem well clear of the other
  add(new THREE.BoxGeometry(0.90, 0.050, 0.050), dark, -0.37, 3.170, 0);
  add(new THREE.BoxGeometry(0.392, 0.030, 0.030), dark, -0.235, 3.065, -0.075, 0, 0, -0.339);
  add(new THREE.CylinderGeometry(0.020, 0.020, 0.68, 8), gold, -0.46, 3.125, 0, 0, 0, Math.PI / 2);
  for (const x of [-0.130, -0.790]) add(new THREE.BoxGeometry(0.034, 0.034, 0.034), gold, x, 3.125, 0);
  add(sheet(0.62, 1.55, 5, 8, 0.045, 0.036, 0.110, 0.042), cloth, -0.46, 2.325, 0);
  add(new THREE.BoxGeometry(0.67, 0.040, 0.062), black, -0.46, 1.688, 0);
  for (const x of [-0.755, -0.165]) add(new THREE.BoxGeometry(0.044, 0.044, 0.072), gold, x, 1.688, 0);

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
