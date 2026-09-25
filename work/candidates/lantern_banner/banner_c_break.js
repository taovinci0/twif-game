// banner_pole candidate C — a different part breakdown.
// Read as a civic mast rather than a temple pole: a square box-section mast on a
// chamfered plinth with four stay struts, knee-braced brackets, and cloths hung
// from rings on a rod so the top edge sags between its two hanging points. The
// cloth is a hand-built grid, so the V hem and the UVs are exact.
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
  const R = (halfWidth) => halfWidth * Math.SQRT2;
  const add = (parent, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  // A hanging sheet, built vertex by vertex: origin at the top centre, hanging
  // down -y. Double curve across the width, fading out at the rod and the bar; a
  // slight sag in the top edge between the two rings; a shallow V cut in the hem.
  // UVs are a clean 0..1 over the face, so a texture maps without surprises.
  const sheet = (w, h, nx, ny, amp, twist, vcut, sag) => {
    const pos = [], uv = [], idx = [];
    for (let j = 0; j <= ny; j++) {
      const t = j / ny;
      const env = Math.pow(Math.sin(Math.PI * t), 0.8);
      for (let i = 0; i <= nx; i++) {
        const u = i / nx;
        let y = -t * h - sag * Math.sin(Math.PI * u) * (1 - t) * (1 - t);
        if (j === ny) y += vcut * (1 - Math.abs(2 * u - 1));
        pos.push((u - 0.5) * w, y, env * (amp * Math.sin(2 * Math.PI * u) + twist * (u - 0.5)));
        uv.push(u, 1 - t);
      }
    }
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  };

  // --- chamfered plinth with corner bolts
  add(g, box(0.78, 0.16, 0.78), black, 0, 0.08, 0);
  add(g, new THREE.CylinderGeometry(R(0.220), R(0.320), 0.18, 4), dark, 0, 0.25, 0, 0, Q, 0);
  add(g, box(0.24, 0.06, 0.24), black, 0, 0.37, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(g, box(0.055, 0.045, 0.055), gold, sx * 0.30, 0.1825, sz * 0.30);
  }

  // --- box-section mast with four stay struts
  add(g, box(0.11, 3.66, 0.11), dark, 0, 2.17, 0);
  for (let k = 0; k < 4; k++) {
    const s = new THREE.Group();
    s.rotation.y = k * Math.PI / 2;
    add(s, box(0.042, 0.745, 0.042), dark, 0.1875, 0.695, 0, 0, 0, 0.307);
    add(s, box(0.070, 0.045, 0.070), gold, 0.300, 0.360, 0);
    g.add(s);
  }
  add(g, box(0.15, 0.05, 0.15), gold, 0, 3.985, 0);
  add(g, new THREE.ConeGeometry(R(0.085), 0.13, 4), black, 0, 4.075, 0, 0, Q, 0);
  add(g, new THREE.ConeGeometry(0.030, 0.075, 6), gold, 0, 4.1625, 0);

  // --- top bracket, rod, rings and the long banner
  add(g, box(1.14, 0.060, 0.060), dark, 0.52, 3.880, 0);
  add(g, box(0.50, 0.034, 0.034), dark, 0.29, 3.762, 0, 0, 0, -0.44);
  add(g, new THREE.CylinderGeometry(0.022, 0.022, 1.00, 8), gold, 0.56, 3.858, 0, 0, 0, Math.PI / 2);
  for (const x of [0.19, 0.93]) {
    add(g, new THREE.TorusGeometry(0.036, 0.010, 5, 8), gold, x, 3.858, 0, 0, Math.PI / 2, 0);
  }
  add(g, sheet(0.90, 2.60, 6, 10, 0.060, 0.048, 0.160, 0.055), cloth, 0.56, 3.836, 0);
  add(g, box(0.96, 0.045, 0.076), black, 0.56, 1.428, 0);
  for (const x of [0.12, 1.00]) add(g, box(0.05, 0.05, 0.088), gold, x, 1.428, 0);

  // --- lower bracket and the shorter banner, on the far side
  add(g, box(0.86, 0.050, 0.050), dark, -0.38, 2.920, 0);
  add(g, box(0.42, 0.030, 0.030), dark, -0.22, 2.812, 0, 0, 0, 0.44);
  add(g, new THREE.CylinderGeometry(0.019, 0.019, 0.68, 8), gold, -0.45, 2.898, 0, 0, 0, Math.PI / 2);
  for (const x of [-0.68, -0.22]) {
    add(g, new THREE.TorusGeometry(0.031, 0.009, 5, 8), gold, x, 2.898, 0, 0, Math.PI / 2, 0);
  }
  add(g, sheet(0.60, 1.65, 5, 8, 0.045, 0.034, 0.110, 0.042), cloth, -0.45, 2.878, 0);
  add(g, box(0.65, 0.040, 0.066), black, -0.45, 1.358, 0);
  for (const x of [-0.74, -0.16]) add(g, box(0.044, 0.044, 0.076), gold, x, 1.358, 0);

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
