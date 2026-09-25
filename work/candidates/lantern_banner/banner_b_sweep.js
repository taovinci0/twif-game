// banner_pole candidate B — swept profiles.
// Base, pole and finial are LatheGeometry profiles; arms are tapered
// ExtrudeGeometry profiles; the cloth is a thin closed S-section ribbon extruded
// down its drop, so it has a real edge thickness, then warped so the S fades out
// at the rod and the bar and the hem is cut into a shallow V.
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

  const Q = Math.PI / 4;
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    g.add(m);
    return m;
  };
  const lathe = (pts, seg, phi = 0) =>
    new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg, phi);

  // A hanging sheet as a swept section: the horizontal S profile of the cloth,
  // closed to a thin ribbon, extruded down the drop and then relaxed.
  const sheet = (w, h, th, amp, twist, steps, np, vcut) => {
    const S = (u) => amp * Math.sin(2 * Math.PI * u) + twist * (u - 0.5);
    const s = new THREE.Shape();
    s.moveTo(-w / 2, S(0) - th / 2);
    for (let i = 1; i <= np; i++) s.lineTo(i / np * w - w / 2, S(i / np) - th / 2);
    for (let i = np; i >= 0; i--) s.lineTo(i / np * w - w / 2, S(i / np) + th / 2);
    s.lineTo(-w / 2, S(0) - th / 2);
    const geo = new THREE.ExtrudeGeometry(s, { depth: h, steps, bevelEnabled: false });
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const u = Math.min(1, Math.max(0, x / w + 0.5));
      const t = Math.min(1, Math.max(0, 1 - z / h));      // 0 at the rod, 1 at the hem
      const env = Math.pow(Math.sin(Math.PI * t), 0.8);
      p.setY(i, y + (env - 1) * S(u));
      if (z < 1e-4) p.setZ(i, z + vcut * (1 - Math.abs(2 * u - 1)));
    }
    geo.computeVertexNormals();
    return geo;
  };
  const armGeo = (len, h0, h1, d) => {
    const s = new THREE.Shape();
    s.moveTo(0, -h0 / 2); s.lineTo(len, -h1 / 2); s.lineTo(len, h1 / 2);
    s.lineTo(0, h0 / 2); s.lineTo(0, -h0 / 2);
    return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  };

  // --- heavy square base block, one revolved stepped profile
  add(lathe([[0.001, 0], [0.509, 0], [0.509, 0.190], [0.382, 0.206], [0.382, 0.322],
             [0.240, 0.338], [0.110, 0.346]], 4, Q), black, 0, 0, 0);
  add(lathe([[0.110, 0.346], [0.168, 0.362], [0.168, 0.408], [0.098, 0.428]], 10), gold, 0, 0, 0);

  // --- pole and finial, swept
  add(lathe([[0.092, 0.415], [0.078, 0.470], [0.074, 3.020], [0.090, 3.052],
             [0.090, 3.108], [0.070, 3.142], [0.064, 3.910], [0.082, 3.940],
             [0.082, 3.986], [0.062, 4.020]], 10), dark, 0, 0, 0);
  add(lathe([[0.001, 3.990], [0.078, 4.006], [0.078, 4.032], [0.048, 4.058],
             [0.056, 4.092], [0.030, 4.120], [0.024, 4.142], [0.001, 4.200]], 8), gold, 0, 0, 0);

  // --- top arm and the long banner
  add(armGeo(1.16, 0.075, 0.048, 0.052), dark, -0.06, 3.900, -0.026);
  add(armGeo(0.48, 0.040, 0.026, 0.032), dark, 0.05, 3.720, -0.016, 0, 0, 0.38);
  add(new THREE.CylinderGeometry(0.024, 0.024, 1.00, 8), gold, 0.56, 3.855, 0, 0, 0, Math.PI / 2);
  for (const x of [0.18, 0.94]) add(new THREE.BoxGeometry(0.016, 0.075, 0.016), dark, x, 3.885, 0);
  add(sheet(0.90, 2.60, 0.026, 0.060, 0.050, 7, 6, 0.160), cloth, 0.56, 1.240, 0, -Math.PI / 2);
  add(new THREE.BoxGeometry(0.96, 0.045, 0.076), black, 0.56, 1.430, 0);
  for (const x of [0.13, 0.99]) add(new THREE.BoxGeometry(0.05, 0.05, 0.088), gold, x, 1.430, 0);

  // --- shorter banner on the far side, hung lower
  add(armGeo(0.88, 0.064, 0.040, 0.046), dark, 0.06, 3.040, 0.023, 0, Math.PI, 0);
  add(armGeo(0.40, 0.034, 0.024, 0.028), dark, -0.05, 2.880, 0.014, 0, Math.PI, 0.38);
  add(new THREE.CylinderGeometry(0.021, 0.021, 0.70, 8), gold, -0.46, 2.995, 0, 0, 0, Math.PI / 2);
  for (const x of [-0.72, -0.20]) add(new THREE.BoxGeometry(0.014, 0.065, 0.014), dark, x, 3.018, 0);
  add(sheet(0.62, 1.80, 0.024, 0.045, 0.036, 6, 5, 0.120), cloth, -0.46, 1.180, 0, -Math.PI / 2);
  add(new THREE.BoxGeometry(0.67, 0.040, 0.066), black, -0.46, 1.310, 0);
  for (const x of [-0.755, -0.165]) add(new THREE.BoxGeometry(0.044, 0.044, 0.076), gold, x, 1.310, 0);

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
