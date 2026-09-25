// Big AI boss — candidate A: assembled from primitives.
// Box / Cylinder / Cone / Sphere only. Coat panels are four-sided cylinders
// with the 45-degree turn baked into the geometry so they squash to a flat
// trapezoid slab; hem daggers are four-sided pyramids squashed the same way.
// 2.15 m. No glyphs: the pauldron plate and the rank tag are blank geometry.
export default function (THREE) {
  const g = new THREE.Group();
  const root = new THREE.Group();
  g.add(root);
  g.userData.joints = {};

  const M = (color, roughness, name, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name;
    return m;
  };
  const white = M(0xE9E9EC, 0.62, 'fabric');
  const black = M(0x080A0B, 0.66, 'fabric');
  const char  = M(0x111315, 0.48, 'metal', 0.40);
  const gun   = M(0x3A3F46, 0.34, 'metal', 0.78);
  const glow  = new THREE.MeshStandardMaterial({
    color: 0xBFE4FF, roughness: 0.22, metalness: 0.0,
    emissive: 0xBFE4FF, emissiveIntensity: 1.0,
  });
  glow.name = 'metal';

  const add = (parent, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };
  const joint = (parent, name, x, y, z) => {
    const o = new THREE.Group();
    o.position.set(x, y, z);
    parent.add(o);
    g.userData.joints[name] = o;
    return o;
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt, rb, h, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);

  // A tapered flat slab from a four-sided cylinder. The 45-degree turn is baked
  // into the vertices, so the square section is axis-aligned and scale.z really
  // is the panel thickness rather than a rhombus squashed on the diagonal.
  const slab = (parent, wTop, wBot, h, t, mat, x, y, z, ry = 0, lean = 0) => {
    const geo = new THREE.CylinderGeometry(wTop / Math.SQRT2, wBot / Math.SQRT2, h, 4);
    geo.rotateY(Math.PI / 4);
    const m = new THREE.Mesh(geo, mat);
    m.scale.z = t / wBot;
    m.rotation.set(lean, ry, 0);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  // A hem dagger: a four-sided pyramid, apex down, squashed to a blade.
  const spike = (parent, wBase, yTop, yBot, t, mat, x, z, ry = 0, lean = 0) => {
    const h = yTop - yBot;
    const geo = new THREE.ConeGeometry(wBase / Math.SQRT2, h, 4);
    geo.rotateY(Math.PI / 4);
    geo.rotateX(Math.PI);
    const m = new THREE.Mesh(geo, mat);
    m.scale.z = t / wBase;
    m.rotation.set(lean, ry, 0);
    m.position.set(x, yTop - h / 2, z);
    parent.add(m);
    return m;
  };

  // ---------------------------------------------------------------- torso
  const torso = joint(root, 'torso', 0, 0, 0);

  // black under-suit column, seen in the open front of the coat
  add(torso, cyl(0.125, 0.145, 0.62, 8), black, 0, 1.44, 0).scale.z = 0.78;
  add(torso, box(0.30, 0.30, 0.21), char, 0, 1.60, 0.01);
  add(torso, box(0.20, 0.13, 0.22), gun, 0, 1.30, 0.005);      // waist cinch
  add(torso, box(0.34, 0.07, 0.25), gun, 0, 1.235, 0);          // belt
  add(torso, box(0.10, 0.09, 0.03), char, 0, 1.235, 0.135);     // buckle, blank

  // hanging belt straps
  add(torso, box(0.055, 0.40, 0.02), white, 0.115, 1.03, 0.135);
  add(torso, box(0.045, 0.28, 0.02), gun,  -0.105, 1.09, 0.135);

  // rank tag on a chain — blank plate, art applied later
  add(torso, cyl(0.010, 0.010, 0.26, 6), gun, 0.085, 1.58, 0.120, 0.10, 0, 0.16);
  add(torso, cyl(0.010, 0.010, 0.26, 6), gun, -0.02, 1.58, 0.120, 0.10, 0, -0.16);
  add(torso, box(0.085, 0.145, 0.018), white, 0.035, 1.41, 0.142);
  add(torso, box(0.062, 0.115, 0.010), char, 0.035, 1.41, 0.153);

  // ------------------------------------------------------------- shoulders
  // angular white pauldron plates, worn over the coat yoke
  for (const s of [1, -1]) {
    slab(torso, 0.22, 0.18, 0.24, 0.20, white, s * 0.245, 1.70, 0, 0, 0);
    slab(torso, 0.20, 0.11, 0.13, 0.18, white, s * 0.285, 1.54, 0, 0, 0);
  }
  // blank shoulder plate — the emblem is a texture, never geometry
  add(torso, box(0.016, 0.11, 0.10), char, 0.352, 1.70, 0.02);

  // ---------------------------------------------------------------- collar
  // high stiff collar: a back wall and two swept wings, all leaning outward
  add(torso, box(0.30, 0.32, 0.030), white, 0, 1.93, -0.118, -0.18, 0, 0);
  add(torso, box(0.27, 0.27, 0.022), char, 0, 1.91, -0.093, -0.18, 0, 0);
  for (const s of [1, -1]) {
    add(torso, box(0.026, 0.32, 0.20), white, s * 0.150, 1.91, -0.030, 0, 0, s * 0.20);
    add(torso, box(0.020, 0.21, 0.14), white, s * 0.118, 1.83, 0.082, 0.22, s * 0.50, 0);
  }
  add(torso, cyl(0.072, 0.082, 0.16, 8), char, 0, 1.79, 0);   // neck

  // ------------------------------------------------------------------ coat
  // six deliberate panels plus a dark back spine. Every panel ends in a dagger,
  // and the gaps between them let the legs read from behind.
  const coat = joint(torso, 'coat', 0, 0, 0);
  // front-left is the long one; front-right rides higher — asymmetric hem
  slab(coat, 0.20, 0.27, 1.16, 0.05, white,  0.175, 1.11, 0.152, 0, -0.06);
  slab(coat, 0.19, 0.24, 1.02, 0.05, white, -0.170, 1.18, 0.152, 0, -0.06);
  slab(coat, 0.24, 0.32, 1.28, 0.05, white,  0.225, 1.08, -0.152, 0, 0.05);
  slab(coat, 0.23, 0.30, 1.22, 0.05, white, -0.215, 1.11, -0.152, 0, 0.05);
  slab(coat, 0.30, 0.36, 1.12, 0.05, black,  0.240, 1.14, 0, Math.PI / 2, 0);
  slab(coat, 0.30, 0.36, 1.12, 0.05, black, -0.240, 1.14, 0, Math.PI / 2, 0);

  spike(coat, 0.27, 0.56, 0.12, 0.05, white,  0.175, 0.170, 0, -0.06);
  spike(coat, 0.24, 0.70, 0.34, 0.05, white, -0.170, 0.170, 0, -0.06);
  spike(coat, 0.32, 0.48, 0.05, 0.05, white,  0.225, -0.170, 0, 0.05);
  spike(coat, 0.30, 0.54, 0.16, 0.05, white, -0.215, -0.170, 0, 0.05);
  spike(coat, 0.36, 0.62, 0.30, 0.05, black,  0.252, 0, Math.PI / 2, 0);
  spike(coat, 0.36, 0.62, 0.30, 0.05, black, -0.252, 0, Math.PI / 2, 0);

  // back spine: the dark stripe that stops the back reading as a cone
  slab(coat, 0.085, 0.10, 1.26, 0.055, char, 0, 1.09, -0.180, 0, 0.05);
  spike(coat, 0.10, 0.48, 0.10, 0.055, char, 0, -0.192, 0, 0.05);
  // yoke across the shoulders
  add(coat, box(0.44, 0.14, 0.33), white, 0, 1.73, 0);
  add(coat, box(0.46, 0.030, 0.35), char, 0, 1.648, 0);
  // lapels
  for (const s of [1, -1]) {
    add(coat, box(0.10, 0.46, 0.032), white, s * 0.118, 1.47, 0.178, -0.06, 0, s * 0.10);
  }

  // ------------------------------------------------------------------ arms
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const up = joint(torso, side + 'UpperArm', s * 0.245, 1.67, 0);
    up.rotation.z = -s * 0.12;
    add(up, cyl(0.062, 0.052, 0.36, 10), char, 0, -0.18, 0);
    add(up, new THREE.SphereGeometry(0.068, 10, 7), gun, 0, -0.01, 0);
    add(up, box(0.11, 0.09, 0.11), gun, 0, -0.31, 0);

    const lo = joint(up, side + 'LowerArm', 0, -0.38, 0);
    // slender segmented black gauntlet: three rings down the forearm
    add(lo, cyl(0.050, 0.041, 0.34, 10), black, 0, -0.17, 0);
    add(lo, cyl(0.060, 0.056, 0.055, 8), gun, 0, -0.06, 0);
    add(lo, cyl(0.055, 0.050, 0.050, 8), gun, 0, -0.17, 0);
    add(lo, cyl(0.050, 0.045, 0.050, 8), gun, 0, -0.28, 0);
    // hand
    add(lo, box(0.075, 0.10, 0.048), char, 0, -0.395, 0);
    for (let f = 0; f < 3; f++) {
      add(lo, box(0.018, 0.085, 0.022), gun, (f - 1) * 0.025, -0.485, 0.006);
    }
  }

  // ------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const up = joint(torso, side + 'UpperLeg', s * 0.105, 1.14, 0);
    add(up, cyl(0.095, 0.078, 0.52, 10), black, 0, -0.26, 0);
    add(up, new THREE.SphereGeometry(0.098, 10, 7), char, 0, -0.02, 0);
    add(up, box(0.17, 0.16, 0.17), char, 0, -0.42, 0.005);     // thigh plate

    const lo = joint(up, side + 'LowerLeg', 0, -0.54, 0);
    add(lo, cyl(0.078, 0.060, 0.46, 10), black, 0, -0.23, 0);
    add(lo, box(0.14, 0.13, 0.14), gun, 0, -0.02, 0.012);      // knee guard
    add(lo, box(0.135, 0.21, 0.14), char, 0, -0.44, 0.005);    // boot shaft
    add(lo, box(0.145, 0.085, 0.30), char, 0, -0.545, 0.055);  // boot
    add(lo, box(0.150, 0.045, 0.32), gun, 0, -0.585, 0.060);   // sole
  }

  // ------------------------------------------------------------------ head
  const head = joint(torso, 'head', 0, 1.845, 0);
  add(head, cyl(0.098, 0.105, 0.20, 8), char, 0, 0.115, -0.005, 0, Math.PI / 8);
  add(head, box(0.175, 0.10, 0.21), gun, 0, 0.233, -0.005);              // crown
  add(head, box(0.145, 0.055, 0.18), white, 0, 0.288, -0.005);           // crest
  add(head, new THREE.ConeGeometry(0.095, 0.16, 4), char, 0, 0.015, 0.012, Math.PI, Math.PI / 4, 0);
  add(head, box(0.125, 0.19, 0.040), black, 0, 0.115, 0.092);            // faceplate
  for (const s of [1, -1]) {
    add(head, box(0.024, 0.17, 0.030), gun, s * 0.088, 0.125, 0.035);    // cheek ribs
    add(head, box(0.032, 0.055, 0.11), white, s * 0.098, 0.213, -0.02);  // ear fins
  }
  // the single vertical light, its own mesh so the game can flare it
  add(head, box(0.046, 0.235, 0.014), gun, 0, 0.118, 0.100);             // bezel
  const light = add(head, box(0.022, 0.215, 0.024), glow, 0, 0.118, 0.112);
  g.userData.joints.helmetLight = light;

  // ------------------------------------ contract: base at y=0, centred on x/z
  const bb = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
