// Subnet gate, candidate A — assembled from primitives.
// Box, Cylinder, Cone only. The kasagi curve is implied by three segments with
// a slight rotation each rather than a swept profile.
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

  // --- stepped plinth
  add(new THREE.BoxGeometry(6.40, 0.30, 3.00), dark,  0, 0.15, 0);
  add(new THREE.BoxGeometry(5.60, 0.26, 2.50), stone, 0, 0.43, 0);
  add(new THREE.BoxGeometry(4.90, 0.22, 2.10), dark,  0, 0.67, 0);
  // gold banding on the top step
  add(new THREE.BoxGeometry(5.00, 0.05, 2.20), gold, 0, 0.79, 0);

  // --- the lit disc the node sits over
  add(new THREE.CylinderGeometry(1.30, 1.30, 0.10, 24), gold,  0, 0.83, 0);
  add(new THREE.CylinderGeometry(0.85, 0.85, 0.12, 20), cream, 0, 0.87, 0);

  // --- posts, slightly tapered inward like a real torii
  const postH = 3.30;
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.19, 0.24, postH, 12), dark, s * 1.75, 0.78 + postH / 2, 0);
    // gold collar at foot and head
    add(new THREE.CylinderGeometry(0.27, 0.27, 0.16, 12), gold, s * 1.75, 0.86, 0);
    add(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 12), gold, s * 1.75, 0.78 + postH - 0.20, 0);
  }

  // --- nuki, the lower tie beam, and its centre tablet
  add(new THREE.BoxGeometry(4.30, 0.28, 0.34), stone, 0, 3.42, 0);
  add(new THREE.BoxGeometry(4.40, 0.06, 0.38), gold,  0, 3.57, 0);
  add(new THREE.BoxGeometry(0.90, 0.62, 0.16), dark,  0, 3.92, 0.16);
  add(new THREE.BoxGeometry(0.98, 0.70, 0.05), gold,  0, 3.92, 0.10);

  // --- shimanagi: the flat beam under the curved cap
  add(new THREE.BoxGeometry(4.90, 0.22, 0.42), dark, 0, 4.36, 0);

  // --- kasagi: three segments, each tilted, to lift the ends
  add(new THREE.BoxGeometry(3.20, 0.30, 0.54), stone, 0, 4.68, 0);
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(1.35, 0.28, 0.52), stone, s * 2.22, 4.73, 0, 0, 0, -s * 0.13);
    add(new THREE.BoxGeometry(0.42, 0.24, 0.48), stone, s * 2.94, 4.87, 0, 0, 0, -s * 0.30);
    // gold tip
    add(new THREE.BoxGeometry(0.20, 0.20, 0.50), gold, s * 3.12, 4.95, 0, 0, 0, -s * 0.30);
  }
  // gold edge along the cap
  add(new THREE.BoxGeometry(3.24, 0.05, 0.56), gold, 0, 4.84, 0);

  // --- shimenawa rope between the posts, with paper pendants
  add(new THREE.CylinderGeometry(0.11, 0.11, 3.30, 10), rope, 0, 3.05, 0.26, 0, 0, Math.PI / 2);
  for (const x of [-1.05, 0, 1.05]) {
    add(new THREE.BoxGeometry(0.20, 0.44, 0.03), cream, x, 2.76, 0.26);
    add(new THREE.BoxGeometry(0.14, 0.30, 0.03), cream, x, 2.44, 0.26);
  }

  // --- lantern pillars either side
  for (const s of [-1, 1]) {
    const x = s * 2.62;
    add(new THREE.BoxGeometry(0.46, 1.90, 0.46), dark,  x, 1.78, 0);
    add(new THREE.BoxGeometry(0.34, 1.30, 0.06), cream, x, 1.86, 0.24);
    add(new THREE.BoxGeometry(0.06, 1.30, 0.34), cream, x + s * 0.24, 1.86, 0);
    add(new THREE.BoxGeometry(0.56, 0.10, 0.56), gold,  x, 2.78, 0);
    add(new THREE.ConeGeometry(0.44, 0.34, 4), dark,   x, 2.99, 0, 0, Math.PI / 4);
    add(new THREE.SphereGeometry(0.09, 8, 6), gold,    x, 3.20, 0);
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
