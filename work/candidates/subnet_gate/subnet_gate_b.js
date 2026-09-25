// Subnet gate, candidate B — swept profiles.
// The kasagi is a real curve: a Shape with a quadratic sweep, extruded through Z.
// The plinth and the finials are Lathe profiles. Where A stacks boxes, this
// builds outlines and sweeps them.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name;
    return m;
  };
  const stone = M(0x111315, 0.82, 'stone');
  const dark  = M(0x080A0B, 0.86, 'stone');
  const gold  = M(0xD4A24C, 0.36, 'metal', 0.65);
  const cream = M(0xE7DFC9, 0.74, 'plaster');
  const rope  = M(0xB9A882, 0.95, 'fabric');

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    g.add(m);
    return m;
  };
  const extrude = (shape, depth) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });

  // --- plinth as a lathed stepped profile
  const plinth = new THREE.LatheGeometry([
    new THREE.Vector2(0.00, 0.00), new THREE.Vector2(3.20, 0.00),
    new THREE.Vector2(3.20, 0.30), new THREE.Vector2(2.80, 0.30),
    new THREE.Vector2(2.80, 0.56), new THREE.Vector2(2.45, 0.56),
    new THREE.Vector2(2.45, 0.80), new THREE.Vector2(0.00, 0.80),
  ], 28);
  add(plinth, dark, 0, 0, 0);
  add(new THREE.TorusGeometry(2.45, 0.05, 6, 30), gold, 0, 0.80, 0, Math.PI / 2);

  // --- the lit disc
  add(new THREE.CylinderGeometry(1.25, 1.25, 0.09, 26), gold,  0, 0.84, 0);
  add(new THREE.CylinderGeometry(0.82, 0.82, 0.11, 22), cream, 0, 0.88, 0);

  // --- the kasagi: an actual curved cap, swept
  const cap = new THREE.Shape();
  cap.moveTo(-3.30, 0.00);
  cap.quadraticCurveTo(0.00, -0.62, 3.30, 0.00);
  cap.lineTo(3.30, 0.30);
  cap.quadraticCurveTo(0.00, -0.30, -3.30, 0.30);
  cap.lineTo(-3.30, 0.00);
  const capGeo = extrude(cap, 0.56);
  add(capGeo, stone, 0, 4.72, -0.28);
  // gold lip following the same curve, thinner
  const lip = new THREE.Shape();
  lip.moveTo(-3.34, 0.00);
  lip.quadraticCurveTo(0.00, -0.62, 3.34, 0.00);
  lip.lineTo(3.34, 0.08);
  lip.quadraticCurveTo(0.00, -0.54, -3.34, 0.08);
  lip.lineTo(-3.34, 0.00);
  add(extrude(lip, 0.60), gold, 0, 4.70, -0.30);

  // --- shimanagi, a flat swept beam
  const beam = new THREE.Shape();
  beam.moveTo(-2.50, 0); beam.lineTo(2.50, 0); beam.lineTo(2.50, 0.22); beam.lineTo(-2.50, 0.22);
  add(extrude(beam, 0.44), dark, 0, 4.30, -0.22);

  // --- posts, lathed with a taper and a foot
  const postProfile = [
    new THREE.Vector2(0.26, 0.00), new THREE.Vector2(0.26, 0.10),
    new THREE.Vector2(0.235, 0.14), new THREE.Vector2(0.215, 1.80),
    new THREE.Vector2(0.195, 3.30), new THREE.Vector2(0.00, 3.30),
  ].map((p) => new THREE.Vector2(p.x, p.y));
  for (const s of [-1, 1]) {
    add(new THREE.LatheGeometry(postProfile, 14), dark, s * 1.75, 0.78, 0);
    add(new THREE.TorusGeometry(0.235, 0.045, 6, 14), gold, s * 1.75, 0.94, 0, Math.PI / 2);
    add(new THREE.TorusGeometry(0.215, 0.04, 6, 14), gold, s * 1.75, 3.82, 0, Math.PI / 2);
  }

  // --- nuki and tablet
  const nuki = new THREE.Shape();
  nuki.moveTo(-2.15, 0); nuki.lineTo(2.15, 0); nuki.lineTo(2.15, 0.28); nuki.lineTo(-2.15, 0.28);
  add(extrude(nuki, 0.34), stone, 0, 3.28, -0.17);
  add(new THREE.BoxGeometry(0.88, 0.60, 0.14), dark, 0, 3.90, 0.15);
  add(new THREE.TorusGeometry(0.40, 0.035, 6, 4), gold, 0, 3.90, 0.09, 0, 0, Math.PI / 4);

  // --- rope, a torus arc sagging between the posts
  const sag = new THREE.TorusGeometry(2.90, 0.10, 8, 22, Math.PI * 0.42);
  add(sag, rope, 0, 5.62, 0.26, 0, 0, Math.PI * 1.29);
  for (const x of [-1.00, 0, 1.00]) {
    const paper = new THREE.Shape();
    paper.moveTo(-0.10, 0); paper.lineTo(0.10, 0); paper.lineTo(0.10, -0.26);
    paper.lineTo(0.02, -0.26); paper.lineTo(0.02, -0.46); paper.lineTo(-0.10, -0.46);
    add(extrude(paper, 0.03), cream, x, 2.96, 0.25);
  }

  // --- lantern pillars, lathed cap
  for (const s of [-1, 1]) {
    const x = s * 2.62;
    add(new THREE.CylinderGeometry(0.24, 0.28, 1.90, 10), dark, x, 1.75, 0);
    add(new THREE.CylinderGeometry(0.22, 0.22, 1.20, 10, 1, true), cream, x, 1.86, 0);
    add(new THREE.LatheGeometry([
      new THREE.Vector2(0.00, 0.00), new THREE.Vector2(0.44, 0.00),
      new THREE.Vector2(0.30, 0.22), new THREE.Vector2(0.10, 0.34),
      new THREE.Vector2(0.00, 0.36),
    ], 12), dark, x, 2.74, 0);
    add(new THREE.SphereGeometry(0.09, 8, 6), gold, x, 3.16, 0);
  }

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
