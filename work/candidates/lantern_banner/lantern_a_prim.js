// street_lantern candidate A — primitive assembly.
// Box/Cylinder/Cone only. Housing shell is an open-ended 4-segment cylinder,
// which is a genuinely tapered four-sided box of panels for 8 triangles.
// No glyphs anywhere: the panels are blank and take their art as a texture.
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
  // The lighting system finds panels by this material name.
  const panel = M(0xE7DFC9, 0.68, 'plaster', 0, { side: THREE.DoubleSide });

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    g.add(m);
    return m;
  };
  const Q = Math.PI / 4;
  // face half-width -> circumradius for a 4-segment cylinder turned by 45 deg
  const R = (halfWidth) => halfWidth * Math.SQRT2;

  // --- stepped square foot
  add(new THREE.BoxGeometry(0.46, 0.09, 0.46), black, 0, 0.045, 0);
  add(new THREE.BoxGeometry(0.36, 0.08, 0.36), dark,  0, 0.130, 0);
  add(new THREE.BoxGeometry(0.28, 0.07, 0.28), black, 0, 0.205, 0);
  add(new THREE.CylinderGeometry(0.105, 0.115, 0.05, 8), gold, 0, 0.265, 0);

  // --- post, rising to two thirds of the height
  add(new THREE.CylinderGeometry(0.048, 0.060, 1.56, 10), dark, 0, 1.06, 0);
  add(new THREE.CylinderGeometry(0.068, 0.068, 0.05, 10), gold, 0, 0.52, 0);
  add(new THREE.CylinderGeometry(0.062, 0.062, 0.05, 10), gold, 0, 1.62, 0);

  // --- crossarm, longer to one side, carrying the secondary lamp
  add(new THREE.BoxGeometry(0.52, 0.042, 0.042), dark, -0.09, 1.74, 0);
  add(new THREE.BoxGeometry(0.05, 0.075, 0.05), gold, -0.33, 1.735, 0);
  add(new THREE.BoxGeometry(0.05, 0.062, 0.05), gold,  0.15, 1.738, 0);
  // small hanging lamp on the long side
  const hx = -0.33;
  add(new THREE.BoxGeometry(0.018, 0.10, 0.018), dark, hx, 1.66, 0);
  add(new THREE.BoxGeometry(0.24, 0.032, 0.24), dark, hx, 1.595, 0);
  add(new THREE.CylinderGeometry(R(0.085), R(0.100), 0.24, 4, 1, true), panel, hx, 1.455, 0, 0, Q, 0);
  add(new THREE.BoxGeometry(0.22, 0.030, 0.22), dark, hx, 1.320, 0);
  add(new THREE.ConeGeometry(0.175, 0.10, 4), dark, hx, 1.665, 0, 0, Q, 0);
  add(new THREE.SphereGeometry(0.030, 6, 4), gold, hx, 1.296, 0);

  // --- lantern housing: tapered four-sided box of blank panels in a dark frame
  const hb = 1.84, hh = 0.50;            // housing sits 1.84 -> 2.34, plus trays
  add(new THREE.BoxGeometry(0.50, 0.05, 0.50), dark, 0, 1.865, 0);
  add(new THREE.CylinderGeometry(R(0.172), R(0.208), hh, 4, 1, true), panel, 0, hb + 0.05 + hh / 2, 0, 0, Q, 0);
  add(new THREE.BoxGeometry(0.42, 0.05, 0.42), dark, 0, 2.415, 0);

  // frame: four corner uprights following the taper, and a mid rail per face
  const cb = 0.208, ct = 0.172, tilt = Math.atan2(cb - ct, hh);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(new THREE.BoxGeometry(0.030, hh + 0.06, 0.030), dark,
        sx * (cb + ct) / 2, hb + 0.05 + hh / 2, sz * (cb + ct) / 2, -tilt * sz, 0, tilt * sx);
  }
  const mid = (cb + ct) / 2;
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(0.38, 0.026, 0.020), dark, 0, 2.14, s * mid);
    add(new THREE.BoxGeometry(0.020, 0.026, 0.38), dark, s * mid, 2.14, 0);
  }

  // --- pagoda roof with lifted corners, and the finial spike
  add(new THREE.CylinderGeometry(R(0.235), R(0.235), 0.035, 4), gold, 0, 2.458, 0, 0, Q, 0);
  add(new THREE.ConeGeometry(0.44, 0.20, 4), black, 0, 2.575, 0, 0, Q, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(new THREE.BoxGeometry(0.11, 0.030, 0.11), gold,
        sx * 0.285, 2.512, sz * 0.285, -0.42 * sz, 0, 0.42 * sx);
  }
  add(new THREE.CylinderGeometry(0.055, 0.075, 0.045, 8), gold, 0, 2.660, 0);
  add(new THREE.SphereGeometry(0.052, 8, 5), gold, 0, 2.712, 0);
  add(new THREE.ConeGeometry(0.030, 0.062, 6), gold, 0, 2.769, 0);

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
