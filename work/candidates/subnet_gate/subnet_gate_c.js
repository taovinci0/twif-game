// Subnet gate, candidate C — a different reading of the reference.
// Not post-and-lintel: one monolithic portal wall with the opening cut out of it,
// extruded from a single outlined Shape with a hole. Heavier and more monument
// than shrine, which is a deliberate bet on silhouette: 128 of these stand in a
// ring and the shape has to read as one mass at distance.
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

  // --- the portal wall: one outline, one hole, one extrusion
  const W = 2.95, H = 4.55;
  const wall = new THREE.Shape();
  wall.moveTo(-W, 0);
  wall.lineTo(-W, H - 0.85);
  wall.quadraticCurveTo(-W * 0.55, H, 0, H);                 // shoulder up to the crown
  wall.quadraticCurveTo(W * 0.55, H, W, H - 0.85);
  wall.lineTo(W, 0);
  wall.lineTo(-W, 0);

  const opening = new THREE.Path();
  const ow = 1.28, oh = 2.62;
  opening.moveTo(-ow, 0.02);
  opening.lineTo(-ow, oh - 0.55);
  opening.quadraticCurveTo(-ow * 0.6, oh, 0, oh);
  opening.quadraticCurveTo(ow * 0.6, oh, ow, oh - 0.55);
  opening.lineTo(ow, 0.02);
  opening.lineTo(-ow, 0.02);
  wall.holes.push(opening);

  add(extrude(wall, 0.72), stone, 0, 0.78, -0.36);

  // --- gold inlay following the opening, slightly proud of both faces
  const band = new THREE.Shape();
  const bw = ow + 0.14, bh = oh + 0.14;
  band.moveTo(-bw, 0.02);
  band.lineTo(-bw, bh - 0.55);
  band.quadraticCurveTo(-bw * 0.6, bh, 0, bh);
  band.quadraticCurveTo(bw * 0.6, bh, bw, bh - 0.55);
  band.lineTo(bw, 0.02);
  band.lineTo(-bw, 0.02);
  const bandHole = new THREE.Path();
  bandHole.moveTo(-ow, 0.02);
  bandHole.lineTo(-ow, oh - 0.55);
  bandHole.quadraticCurveTo(-ow * 0.6, oh, 0, oh);
  bandHole.quadraticCurveTo(ow * 0.6, oh, ow, oh - 0.55);
  bandHole.lineTo(ow, 0.02);
  bandHole.lineTo(-ow, 0.02);
  band.holes.push(bandHole);
  for (const z of [0.38, -0.40]) add(extrude(band, 0.04), gold, 0, 0.78, z);

  // --- crown slab across the top, and its gold edge
  add(new THREE.BoxGeometry(6.40, 0.34, 0.92), dark, 0, 5.44, 0);
  add(new THREE.BoxGeometry(6.48, 0.06, 0.98), gold, 0, 5.62, 0);
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(0.34, 0.30, 0.94), dark, s * 3.08, 5.22, 0, 0, 0, -s * 0.22);
  }

  // --- stepped plinth
  add(new THREE.BoxGeometry(6.90, 0.34, 2.10), dark,  0, 0.17, 0);
  add(new THREE.BoxGeometry(6.30, 0.26, 1.72), stone, 0, 0.47, 0);
  add(new THREE.BoxGeometry(6.34, 0.05, 1.76), gold,  0, 0.62, 0);
  add(new THREE.BoxGeometry(5.90, 0.16, 1.44), dark,  0, 0.72, 0);

  // --- the lit threshold disc inside the opening
  add(new THREE.CylinderGeometry(1.05, 1.05, 0.08, 24), gold,  0, 0.84, 0);
  add(new THREE.CylinderGeometry(0.70, 0.70, 0.10, 20), cream, 0, 0.88, 0);

  // --- lantern niches cut into the wall faces, lit panels set back
  for (const s of [-1, 1]) {
    const x = s * 2.14;
    add(new THREE.BoxGeometry(0.62, 1.05, 0.10), dark,  x, 2.60, 0.34);
    add(new THREE.BoxGeometry(0.44, 0.86, 0.04), cream, x, 2.60, 0.40);
    add(new THREE.BoxGeometry(0.62, 1.05, 0.10), dark,  x, 2.60, -0.36);
    add(new THREE.BoxGeometry(0.44, 0.86, 0.04), cream, x, 2.60, -0.42);
    add(new THREE.BoxGeometry(0.70, 0.07, 0.86), gold,  x, 3.18, 0);
  }

  // --- rope across the opening with two pendants
  add(new THREE.CylinderGeometry(0.09, 0.09, 2.50, 10), rope, 0, 3.24, 0.30, 0, 0, Math.PI / 2);
  for (const x of [-0.62, 0.62]) {
    add(new THREE.BoxGeometry(0.17, 0.40, 0.03), cream, x, 2.98, 0.30);
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
