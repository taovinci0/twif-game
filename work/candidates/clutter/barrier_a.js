// barrier_a — primitive assembly. Portable road barrier, 1.6 x 1.0 x 0.5 m.
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

  // --- two A-frame trestles, splayed front to back
  const apex = 0.82, splay = 0.185, legLen = Math.hypot(apex, splay);
  const tilt = Math.atan2(splay, apex);
  for (const sx of [-1, 1]) {
    const x = sx * 0.66;
    // rotation.x = -tilt leans the top of a +z leg towards -z, which is the one
    // sign in this file that is worth checking in the render rather than reading
    for (const sz of [-1, 1]) {
      add(B(0.085, legLen, 0.075), steel, x, apex / 2, sz * splay / 2, -sz * tilt);
      add(B(0.19, 0.045, 0.145), dark, x, 0.022, sz * 0.195);   // weighted foot pad
      add(B(0.11, 0.028, 0.085), gold, x, 0.055, sz * 0.195);
    }
    add(B(0.075, 0.075, 0.30), steel, x, 0.30, 0);              // cross brace
    add(B(0.13, 0.055, 0.13), steel, x, 0.845, 0);              // apex cap
  }

  // --- panel: a plank across the top half, and a thinner rail below it
  const panY = 0.70, panH = 0.28;
  add(B(1.60, panH, 0.07), cream, 0, panY, 0);
  add(B(1.50, 0.11, 0.055), cream, 0, 0.44, 0);
  add(B(0.055, panH + 0.03, 0.09), steel, -0.775, panY, 0);     // end stiles
  add(B(0.055, panH + 0.03, 0.09), steel, 0.775, panY, 0);

  // --- diagonal bands, as inset blocks on BOTH faces. Sized so the rotated
  // block's bounding box is exactly the panel height: (L + W) * cos45 = panH.
  const bw = 0.10, bl = panH / Math.cos(Math.PI / 4) - bw;
  for (const zs of [-1, 1]) {
    for (let i = -2; i <= 2; i++) {
      add(B(bl, bw, 0.022), red, i * 0.315, panY, zs * 0.046, 0, 0, zs * Math.PI / 4);
    }
    add(B(1.50, 0.05, 0.022), red, 0, 0.44, zs * 0.039);        // lower rail stripe
  }

  // --- squat lamp at one end
  add(B(0.15, 0.05, 0.15), steel, 0.60, 0.868, 0);
  add(new THREE.CylinderGeometry(0.062, 0.072, 0.075, 8), dark, 0.60, 0.930, 0);
  add(new THREE.CylinderGeometry(0.058, 0.058, 0.045, 8), glass, 0.60, 0.988, 0);
  add(new THREE.CylinderGeometry(0.066, 0.040, 0.030, 8), steel, 0.60, 1.020, 0);

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
