// crate_c — a different part breakdown: six slatted panels assembled over a
// liner, steel angle irons at the corners, and the banding read as a parcel
// wrap that goes up and over the lid rather than only round the waist.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name; return m;
  };
  const wood  = M(0x8C816F, 0.92, 'timber');
  const pale  = M(0xA1957F, 0.92, 'timber');
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

  // --- liner: set back behind the slats so the gaps read as a dark recess
  add(B(0.67, 0.68, 0.67), dark, 0, 0.35, 0);

  // --- four slatted panels. Slat pitch 0.175, gap 0.035.
  const slatY = [0.10, 0.275, 0.45, 0.625];
  slatY.forEach((y, i) => {
    const mat = i % 2 ? pale : wood;
    for (const sz of [-1, 1]) add(B(0.72, 0.140, 0.05), mat, 0, y, sz * 0.355);
    for (const sx of [-1, 1]) add(B(0.05, 0.140, 0.72), mat, sx * 0.355, y, 0);
  });

  // --- lid: three planks with gaps, on a lip
  for (const x of [-0.245, 0, 0.245]) add(B(0.225, 0.05, 0.76), wood, x, 0.745, 0);
  add(B(0.80, 0.035, 0.80), dark, 0, 0.7025, 0);

  // --- steel angle irons, two plates per vertical edge
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(B(0.14, 0.72, 0.02), steel, sx * 0.31, 0.36, sz * 0.390);
    add(B(0.02, 0.72, 0.14), steel, sx * 0.390, 0.36, sz * 0.31);
  }

  // --- banding: one belt round the waist, two wraps up and over the lid
  for (const sz of [-1, 1]) add(B(0.80, 0.04, 0.02), steel, 0, 0.36, sz * 0.392);
  for (const sx of [-1, 1]) add(B(0.02, 0.04, 0.80), steel, sx * 0.392, 0.36, 0);
  for (const sx of [-0.22, 0.22]) {
    for (const sz of [-1, 1]) add(B(0.05, 0.72, 0.02), steel, sx, 0.36, sz * 0.392);
    add(B(0.05, 0.02, 0.80), steel, sx, 0.785, 0);
  }
  add(B(0.08, 0.07, 0.03), gold, -0.22, 0.52, 0.397);

  // --- small blank plate, front face
  add(B(0.20, 0.13, 0.018), cream, 0.08, 0.275, 0.388);

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
