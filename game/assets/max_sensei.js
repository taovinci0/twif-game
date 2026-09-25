// Max Sensei — dojo master, 1.75 m. Ally, not an enforcer: warm timber and
// cream against the enforcers' sterile white, and the only human face in the
// playable set. Built to read at conversation distance, standing, arms folded.
// No glyphs: the gi badge is a blank plate for the game layer to texture.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, roughness, name, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name; return m;
  };
  const gi     = M(0x111315, 0.86, 'fabric');
  const giDark = M(0x080A0B, 0.88, 'fabric');
  const skin   = M(0xC98F63, 0.74, 'plaster');
  const cream  = M(0xE7DFC9, 0.80, 'fabric');
  const belt   = M(0x8E2B2B, 0.82, 'fabric');
  const glass  = M(0x1A1C20, 0.35, 'metal', 0.4);
  const gold   = M(0xD4A24C, 0.38, 'metal', 0.6);

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent = g) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
    parent.add(m); return m;
  };

  // legs: loose gi trousers
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.115, 0.145, 0.86, 8), giDark, s * 0.115, 0.46, 0);
    add(new THREE.BoxGeometry(0.16, 0.09, 0.30), cream, s * 0.115, 0.045, 0.04);
  }

  // torso: crossed gi with lapels
  add(new THREE.CylinderGeometry(0.215, 0.255, 0.62, 10), gi, 0, 1.19, 0);
  add(new THREE.BoxGeometry(0.30, 0.46, 0.06), cream, 0, 1.22, 0.20, 0, 0, 0.22);
  add(new THREE.BoxGeometry(0.30, 0.46, 0.06), cream, 0, 1.22, 0.20, 0, 0, -0.22);
  // belt, tied
  add(new THREE.CylinderGeometry(0.245, 0.245, 0.105, 10), belt, 0, 0.90, 0);
  add(new THREE.BoxGeometry(0.10, 0.22, 0.07), belt, 0.07, 0.80, 0.21, 0.2, 0, 0.12);
  add(new THREE.BoxGeometry(0.09, 0.19, 0.07), belt, -0.05, 0.82, 0.21, 0.2, 0, -0.16);
  // blank badge for the game layer
  add(new THREE.BoxGeometry(0.13, 0.13, 0.02), cream, 0.13, 1.35, 0.235);

  // arms, folded across the chest
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.085, 0.095, 0.34, 8), gi, s * 0.255, 1.33, 0.02, 0, 0, s * 0.42);
    // forearm crosses inward
    add(new THREE.CylinderGeometry(0.075, 0.082, 0.42, 8), gi,
        s * 0.13, 1.10, 0.20, Math.PI / 2 - 0.25, 0, s * 1.30);
    add(new THREE.SphereGeometry(0.062, 8, 6), skin, -s * 0.13, 1.09, 0.235);
  }

  // head: bald, with a short beard and heavy glasses
  const head = add(new THREE.SphereGeometry(0.128, 12, 10), skin, 0, 1.63, 0);
  head.scale.set(1, 1.12, 1.02);
  add(new THREE.CylinderGeometry(0.085, 0.10, 0.10, 8), skin, 0, 1.52, 0);
  // beard and moustache
  add(new THREE.BoxGeometry(0.115, 0.075, 0.055), giDark, 0, 1.565, 0.105);
  add(new THREE.BoxGeometry(0.085, 0.028, 0.05), giDark, 0, 1.615, 0.115);
  // glasses: two lenses in a heavy frame
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(0.072, 0.056, 0.016), glass, s * 0.055, 1.655, 0.118);
  }
  add(new THREE.BoxGeometry(0.043, 0.014, 0.016), glass, 0, 1.655, 0.118);
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(0.016, 0.014, 0.10), glass, s * 0.108, 1.655, 0.065);
  }
  // ears
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.034, 6, 5), skin, s * 0.128, 1.63, 0);

  // a katana on the hip, gold tsuba
  add(new THREE.BoxGeometry(0.035, 0.035, 0.86), giDark, -0.24, 0.98, -0.04, 0.16, 0.10, 0);
  add(new THREE.CylinderGeometry(0.052, 0.052, 0.016, 8), gold, -0.24, 1.02, 0.34, Math.PI / 2, 0, 0);

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
