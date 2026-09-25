// barrier_c — a different part breakdown: the end frames read as a post with
// two braced struts rather than a bent A, and the panel is two stacked planks
// each carrying its own band run, which breaks the silhouette more at distance.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name; return m;
  };
  const steel = M(0x3A3F46, 0.46, 'metal', 0.7);
  const dark  = M(0x111315, 0.72, 'metal', 0.4);
  const cream = M(0xE7DFC9, 0.80, 'plaster');
  const red   = M(0x8E2B2B, 0.80, 'plaster');
  const glass = M(0xE66D32, 0.35, 'plaster');
  const gold  = M(0xD4A24C, 0.40, 'metal', 0.6);

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
    g.add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  // --- end frames: upright post, two splayed struts, weighted pads
  const tilt = Math.atan2(0.20, 0.72), strut = Math.hypot(0.20, 0.72);
  for (const sx of [-1, 1]) {
    const x = sx * 0.70;
    add(B(0.09, 0.88, 0.09), steel, x, 0.44, 0);
    add(B(0.075, 0.075, 0.30), steel, x, 0.20, 0);
    for (const sz of [-1, 1]) {
      add(B(0.07, strut, 0.06), steel, x, 0.40, sz * 0.105, -sz * tilt);
      add(B(0.22, 0.05, 0.14), dark, x, 0.025, sz * 0.175);
      add(B(0.12, 0.03, 0.09), gold, x, 0.060, sz * 0.175);
    }
    add(B(0.13, 0.05, 0.13), steel, x, 0.905, 0);
  }

  // --- panel: two planks with a gap, plus a thin rail low down
  const planks = [0.615, 0.805], ph = 0.16;
  for (const y of planks) {
    add(B(1.60, ph, 0.065), cream, 0, y, 0);
    add(B(1.62, 0.022, 0.085), steel, 0, y - ph / 2 - 0.011, 0);
  }
  add(B(1.52, 0.10, 0.05), cream, 0, 0.40, 0);

  // --- diagonal bands as inset blocks, both planks, both faces
  const bw = 0.09, bl = ph / Math.cos(Math.PI / 4) - bw;
  for (const zs of [-1, 1]) {
    for (const y of planks) {
      for (let i = -3; i <= 3; i++) add(B(bl, bw, 0.02), red, i * 0.235, y, zs * 0.0425, 0, 0, zs * Math.PI / 4);
    }
    add(B(1.52, 0.045, 0.02), red, 0, 0.40, zs * 0.035);
  }
  add(B(0.06, ph + 0.02, 0.09), steel, -0.785, planks[1], 0);
  add(B(0.06, ph + 0.02, 0.09), steel, 0.785, planks[0], 0);

  // --- squat boxy lamp at one end
  add(B(0.17, 0.045, 0.16), steel, 0.62, 0.952, 0);
  add(B(0.13, 0.055, 0.12), dark, 0.62, 1.000, 0);
  add(B(0.115, 0.05, 0.105), glass, 0.62, 1.000, 0.012);
  add(B(0.14, 0.025, 0.13), steel, 0.62, 1.038, 0);

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
