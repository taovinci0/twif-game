// crate_a — primitive assembly. Squat slatted timber crate, 0.8 m cube.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name; return m;
  };
  const wood  = M(0x8C816F, 0.92, 'timber');
  const dark  = M(0x111315, 0.88, 'timber');
  const steel = M(0x3A3F46, 0.42, 'metal', 0.7);
  const gold  = M(0xD4A24C, 0.40, 'metal', 0.6);
  const cream = M(0xE7DFC9, 0.78, 'plaster');

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
    g.add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  // --- body: the dark interior mass the slats sit on
  add(B(0.70, 0.70, 0.70), dark, 0, 0.36, 0);

  // --- heavier corner post at each vertical edge
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(B(0.11, 0.74, 0.11), wood, sx * 0.325, 0.37, sz * 0.325);

  // --- horizontal battens, banded on all four faces
  const battenY = [0.14, 0.38, 0.62];
  for (const y of battenY) {
    for (const sz of [-1, 1]) add(B(0.66, 0.15, 0.035), wood, 0, y, sz * 0.365);
    for (const sx of [-1, 1]) add(B(0.035, 0.15, 0.66), wood, sx * 0.365, y, 0);
  }

  // --- lid: slightly proud slab with a lip
  add(B(0.76, 0.05, 0.76), wood,  0, 0.755, 0);
  add(B(0.80, 0.03, 0.80), dark,  0, 0.785, 0);

  // --- two metal banding straps, right the way round
  for (const y of [0.26, 0.56]) {
    for (const sz of [-1, 1]) add(B(0.80, 0.045, 0.022), steel, 0, y, sz * 0.389);
    for (const sx of [-1, 1]) add(B(0.022, 0.045, 0.80), steel, sx * 0.389, y, 0);
  }
  // strap buckles, front and right, so the straps read as hardware not paint
  add(B(0.07, 0.07, 0.03), gold, -0.20, 0.26, 0.395);
  add(B(0.03, 0.07, 0.07), gold, 0.395, 0.56, 0.20);

  // --- small blank plate on the front face
  add(B(0.20, 0.13, 0.018), cream, 0.02, 0.44, 0.392);

  // --- feet skids, so it does not sit dead flat on the road
  for (const sz of [-1, 1]) add(B(0.74, 0.035, 0.10), dark, 0, 0.018, sz * 0.26);

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
