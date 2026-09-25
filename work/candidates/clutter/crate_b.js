// crate_b — swept profiles. Every part is a Shape extruded: the body plan, the
// corner posts, the slat combs and the banding rings.
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
  // bevels grow a profile outward and hang it below its own base, so never any
  const ex = (shape, depth) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 });

  const chamfer = (half, ch) => {
    const s = new THREE.Shape();
    s.moveTo(-half + ch, -half); s.lineTo(half - ch, -half); s.lineTo(half, -half + ch);
    s.lineTo(half, half - ch); s.lineTo(half - ch, half); s.lineTo(-half + ch, half);
    s.lineTo(-half, half - ch); s.lineTo(-half, -half + ch); s.closePath();
    return s;
  };
  const rect = (x0, y0, x1, y1) => {
    const s = new THREE.Shape();
    s.moveTo(x0, y0); s.lineTo(x1, y0); s.lineTo(x1, y1); s.lineTo(x0, y1); s.closePath();
    return s;
  };

  // --- body mass, a chamfered square plan swept up
  add(ex(chamfer(0.345, 0.06), 0.70), dark, 0, 0, 0, -Math.PI / 2);

  // --- corner posts, the same trick at small scale
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(ex(chamfer(0.058, 0.018), 0.74), wood, sx * 0.325, 0, sz * 0.325, -Math.PI / 2);

  // --- slat combs: three slats in one swept profile, one comb per face
  const comb = [rect(-0.33, 0.07, 0.33, 0.215), rect(-0.33, 0.305, 0.33, 0.45), rect(-0.33, 0.545, 0.33, 0.69)];
  const combGeo = new THREE.ExtrudeGeometry(comb, { depth: 0.045, bevelEnabled: false, curveSegments: 1 });
  add(combGeo, wood, 0, 0, 0.345);
  add(combGeo, wood, 0, 0, -0.39);
  add(combGeo, wood, 0.345, 0, 0, 0, Math.PI / 2);
  add(combGeo, wood, -0.39, 0, 0, 0, Math.PI / 2);

  // --- banding straps as true rings: an outer contour with a hole, swept up
  const band = (outer, inner) => {
    const s = chamfer(outer, 0.05);
    const h = new THREE.Path();
    h.moveTo(-inner, -inner); h.lineTo(-inner, inner); h.lineTo(inner, inner); h.lineTo(inner, -inner); h.closePath();
    s.holes.push(h);
    return s;
  };
  add(ex(band(0.40, 0.372), 0.05), steel, 0, 0.235, 0, -Math.PI / 2);
  add(ex(band(0.40, 0.372), 0.05), steel, 0, 0.545, 0, -Math.PI / 2);
  add(ex(rect(-0.035, -0.035, 0.035, 0.035), 0.03), gold, -0.20, 0.26, 0.395);
  add(ex(rect(-0.035, -0.035, 0.035, 0.035), 0.03), gold, 0.395, 0.57, 0.20, 0, Math.PI / 2);

  // --- lid: a proud slab with its own lip ring
  add(ex(chamfer(0.375, 0.06), 0.05), wood, 0, 0.700, 0, -Math.PI / 2);
  add(ex(band(0.40, 0.352), 0.05), dark, 0, 0.750, 0, -Math.PI / 2);

  // --- small blank plate, front face
  add(ex(rect(-0.10, -0.065, 0.10, 0.065), 0.018), cream, 0.02, 0.44, 0.386);

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
