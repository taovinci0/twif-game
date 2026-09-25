// Big AI boss — candidate B: swept profiles.
// The coat is a LatheGeometry wrapped through 300 degrees with the missing 60
// left open at the front, so it is a garment that wraps rather than a cone; the
// hem daggers and the two front flaps are ExtrudeGeometry outlines; the helmet
// is a side profile swept across. Limbs are lathes whose profile carries the
// gauntlet segmentation. 2.15 m. No glyphs anywhere.
export default function (THREE) {
  const g = new THREE.Group();
  const root = new THREE.Group();
  g.add(root);
  g.userData.joints = {};

  const M = (color, roughness, name, metalness = 0, side) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (side) m.side = side;
    m.name = name;
    return m;
  };
  const white  = M(0xE9E9EC, 0.62, 'fabric');
  const whiteD = M(0xE9E9EC, 0.62, 'fabric', 0, THREE.DoubleSide);
  const black  = M(0x080A0B, 0.66, 'fabric');
  const blackD = M(0x080A0B, 0.66, 'fabric', 0, THREE.DoubleSide);
  const char   = M(0x111315, 0.48, 'metal', 0.40);
  const gun    = M(0x3A3F46, 0.34, 'metal', 0.78);
  const glow   = new THREE.MeshStandardMaterial({
    color: 0xBFE4FF, roughness: 0.22, metalness: 0.0,
    emissive: 0xBFE4FF, emissiveIntensity: 1.0,
  });
  glow.name = 'metal';

  const V2 = (x, y) => new THREE.Vector2(x, y);
  const put = (parent, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
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

  // sweep a profile around Y. phi = 0 faces +Z, so a gap centred on the front
  // is simply a phiStart past zero.
  const lathe = (pts, seg, phiStart, phiLen) =>
    new THREE.LatheGeometry(pts.map((p) => V2(p[0], p[1])), seg, phiStart, phiLen);

  // an outline extruded along Z and re-centred on it
  const ex = (pts, depth, bevel = 0) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, {
      depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel,
      bevelSegments: 1, curveSegments: 1, steps: 1,
    });
    geo.translate(0, 0, -depth / 2);
    return geo;
  };

  const torso = joint(root, 'torso', 0, 0, 0);

  // ----------------------------------------------------------- under-suit
  // swept torso, squashed front-to-back so the figure is narrow in section
  const tors = put(torso, lathe([
    [0.004, 1.76], [0.135, 1.74], [0.160, 1.63], [0.145, 1.47],
    [0.115, 1.32], [0.140, 1.22], [0.150, 1.12], [0.004, 1.08],
  ], 10, 0, Math.PI * 2), black, 0, 0, 0);
  tors.scale.z = 0.76;
  put(torso, ex([[-0.15, 1.66], [0.15, 1.66], [0.13, 1.44], [0, 1.36], [-0.13, 1.44]], 0.06), char, 0, 0, 0.145);
  put(torso, ex([[-0.17, 1.27], [0.17, 1.27], [0.17, 1.20], [-0.17, 1.20]], 0.26, 0.010), gun, 0, 0, 0);
  put(torso, ex([[-0.05, 1.27], [0.05, 1.27], [0.05, 1.18], [-0.05, 1.18]], 0.03), char, 0, 0, 0.145);

  // hanging belt straps
  put(torso, ex([[0.085, 1.21], [0.145, 1.21], [0.135, 0.86], [0.110, 0.80], [0.092, 0.88]], 0.02), white, 0, 0, 0.145);
  put(torso, ex([[-0.135, 1.21], [-0.088, 1.21], [-0.082, 0.98], [-0.112, 0.92], [-0.130, 1.00]], 0.02), gun, 0, 0, 0.145);

  // rank tag on a chain, both blank
  put(torso, new THREE.CylinderGeometry(0.009, 0.009, 0.27, 6), gun, 0.082, 1.58, 0.128, 0.09, 0, 0.17);
  put(torso, new THREE.CylinderGeometry(0.009, 0.009, 0.27, 6), gun, -0.022, 1.58, 0.128, 0.09, 0, -0.17);
  put(torso, ex([[-0.043, 1.48], [0.043, 1.48], [0.043, 1.37], [0, 1.325], [-0.043, 1.37]], 0.018), white, 0.030, 0, 0.150);
  put(torso, ex([[-0.030, 1.465], [0.030, 1.465], [0.030, 1.385], [0, 1.352], [-0.030, 1.385]], 0.008), char, 0.030, 0, 0.161);

  // -------------------------------------------------------------- the coat
  const coat = joint(torso, 'coat', 0, 0, 0);
  const GAP = 0.50;                                   // half the front opening
  const coatProfile = [
    [0.215, 1.745], [0.232, 1.615], [0.208, 1.46], [0.196, 1.30],
    [0.222, 1.10], [0.268, 0.88], [0.312, 0.68], [0.340, 0.56],
  ];
  put(coat, lathe(coatProfile, 11, GAP, Math.PI * 2 - GAP * 2), whiteD, 0, 0, 0);
  // black lining just inside it, so the open front is not a hole
  put(coat, lathe(coatProfile.map((p) => [p[0] - 0.022, p[1]]), 11, GAP - 0.05, Math.PI * 2 - GAP * 2 + 0.10), blackD, 0, 0, 0);

  // hem daggers — flat blades hung round the hem at uneven lengths
  const blade = (angle, wTop, yTop, yTip, mat, lean) => {
    const r = 0.335;
    const geo = ex([[-wTop / 2, yTop], [wTop / 2, yTop], [0.012, yTip], [-0.012, yTip]], 0.05);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(Math.sin(angle) * r, 0, Math.cos(angle) * r);
    m.rotation.set(lean, angle, 0);
    coat.add(m);
  };
  blade(0.62, 0.30, 0.62, 0.08, white, 0.16);
  blade(-0.62, 0.28, 0.62, 0.32, white, 0.16);
  blade(1.55, 0.32, 0.60, 0.24, white, 0.16);
  blade(-1.55, 0.32, 0.60, 0.18, white, 0.16);
  blade(2.50, 0.32, 0.58, 0.05, white, 0.16);
  blade(-2.50, 0.32, 0.58, 0.22, white, 0.16);
  blade(Math.PI, 0.26, 0.58, 0.14, char, 0.16);

  // the two front flaps: long pointed outlines, the left one longer
  put(coat, ex([
    [0.030, 1.735], [0.255, 1.700], [0.320, 0.640], [0.195, 0.090],
    [0.085, 0.660], [0.030, 1.180],
  ], 0.05), white, 0, 0, 0.175, -0.07);
  put(coat, ex([
    [-0.030, 1.735], [-0.245, 1.700], [-0.300, 0.680], [-0.180, 0.340],
    [-0.082, 0.700], [-0.030, 1.180],
  ], 0.05), white, 0, 0, 0.175, -0.07);
  // the dark placket between them
  put(coat, ex([[-0.038, 1.72], [0.038, 1.72], [0.038, 0.70], [0, 0.56], [-0.038, 0.70]], 0.04), char, 0, 0, 0.162, -0.07);

  // back spine stripe — what keeps the back from reading as a cone
  put(coat, ex([
    [-0.048, 1.66], [0.048, 1.66], [0.058, 0.66], [0, 0.34], [-0.058, 0.66],
  ], 0.05), char, 0, 0, -0.268, 0.105);

  // shoulder yoke, swept as a short flared lathe
  put(coat, lathe([
    [0.150, 1.795], [0.215, 1.760], [0.240, 1.700], [0.248, 1.640], [0.180, 1.615],
  ], 11, 0, Math.PI * 2), whiteD, 0, 0, 0).scale.z = 0.88;

  // -------------------------------------------------------- collar, swept
  // a high stiff wall around the back and sides, open at the face
  put(torso, lathe([
    [0.082, 1.760], [0.112, 1.810], [0.150, 1.880], [0.178, 1.965], [0.196, 1.980],
  ], 9, 1.05, Math.PI * 2 - 2.10), whiteD, 0, 0, -0.012);
  put(torso, lathe([
    [0.070, 1.760], [0.098, 1.812], [0.132, 1.882], [0.158, 1.962], [0.172, 1.974],
  ], 9, 1.10, Math.PI * 2 - 2.20), blackD, 0, 0, -0.012);
  // the two front wings of the collar
  for (const s of [1, -1]) {
    // DoubleSide: mirroring with a negative scale flips the winding
    put(torso, ex([[0, 1.760], [0.075, 1.775], [0.115, 1.935], [0.020, 1.870]], 0.024),
      whiteD, s * 0.105, 0, 0.060, 0, 0, 0).scale.x = s;
  }
  put(torso, new THREE.CylinderGeometry(0.070, 0.080, 0.17, 8), char, 0, 1.785, -0.01);

  // ---------------------------------------------------- pauldrons, extruded
  for (const s of [1, -1]) {
    const p = put(torso, ex([
      [-0.115, 0.095], [0.115, 0.075], [0.135, -0.055], [0.055, -0.150], [-0.125, -0.115],
    ], 0.21, 0.014), white, s * 0.250, 1.700, 0, 0, Math.PI / 2, 0);
    p.scale.z = 1;
    put(torso, ex([
      [-0.075, 0.020], [0.080, 0.010], [0.070, -0.090], [-0.060, -0.075],
    ], 0.18, 0.012), white, s * 0.292, 1.545, 0, 0, Math.PI / 2, 0);
  }
  // blank plate for the shoulder emblem — texture goes on later
  put(torso, ex([[-0.05, 0.055], [0.05, 0.055], [0.05, -0.055], [-0.05, -0.055]], 0.012),
    char, 0.358, 1.700, 0.015, 0, Math.PI / 2, 0);

  // ----------------------------------------------------------------- arms
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const up = joint(torso, side + 'UpperArm', s * 0.248, 1.675, 0);
    up.rotation.z = -s * 0.13;
    put(up, lathe([
      [0.004, 0.030], [0.064, 0.010], [0.070, -0.060], [0.056, -0.200],
      [0.062, -0.300], [0.056, -0.360], [0.004, -0.372],
    ], 9, 0, Math.PI * 2), char, 0, 0, 0);

    const lo = joint(up, side + 'LowerArm', 0, -0.380, 0);
    // the segmentation lives in the profile: four swellings down the gauntlet
    put(lo, lathe([
      [0.004, 0.020], [0.060, 0.005], [0.064, -0.030], [0.046, -0.062],
      [0.058, -0.095], [0.060, -0.130], [0.043, -0.160], [0.053, -0.195],
      [0.054, -0.230], [0.039, -0.258], [0.047, -0.292], [0.042, -0.335],
      [0.004, -0.348],
    ], 9, 0, Math.PI * 2), black, 0, 0, 0);
    // hand
    put(lo, ex([[-0.038, -0.352], [0.038, -0.352], [0.034, -0.452], [-0.034, -0.452]], 0.048, 0.008), char, 0, 0, 0);
    for (let f = 0; f < 3; f++) {
      put(lo, ex([[-0.010, -0.450], [0.010, -0.450], [0.008, -0.545], [-0.008, -0.545]], 0.022, 0.004),
        gun, (f - 1) * 0.025, 0, 0.006);
    }
  }

  // ----------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const up = joint(torso, side + 'UpperLeg', s * 0.106, 1.140, 0);
    put(up, lathe([
      [0.004, 0.010], [0.098, -0.015], [0.108, -0.110], [0.090, -0.300],
      [0.100, -0.430], [0.090, -0.525], [0.004, -0.540],
    ], 9, 0, Math.PI * 2), black, 0, 0, 0);
    put(up, ex([[-0.085, -0.330], [0.085, -0.330], [0.080, -0.470], [-0.080, -0.470]], 0.175, 0.012),
      char, 0, 0, 0.008);

    const lo = joint(up, side + 'LowerLeg', 0, -0.545, 0);
    put(lo, lathe([
      [0.004, 0.015], [0.082, 0.000], [0.090, -0.060], [0.068, -0.230],
      [0.062, -0.340], [0.078, -0.420], [0.004, -0.440],
    ], 9, 0, Math.PI * 2), black, 0, 0, 0);
    put(lo, ex([[-0.068, 0.045], [0.068, 0.045], [0.062, -0.075], [-0.062, -0.075]], 0.145, 0.012),
      gun, 0, 0, 0.012);
    // boot: a side profile swept across the foot
    put(lo, ex([
      [-0.105, -0.330], [0.090, -0.330], [0.115, -0.430], [0.185, -0.470],
      [0.190, -0.545], [0.150, -0.595], [-0.110, -0.595], [-0.125, -0.470],
    ], 0.150, 0.012), char, 0, 0, 0, 0, -Math.PI / 2, 0);
    put(lo, ex([
      [-0.118, -0.560], [0.185, -0.560], [0.195, -0.600], [-0.128, -0.600],
    ], 0.160, 0.008), gun, 0, 0, 0, 0, -Math.PI / 2, 0);
  }

  // ----------------------------------------------------------------- head
  const head = joint(torso, 'head', 0, 1.845, 0);
  // the helmet is one swept side profile: faceless, angular, chin wedge forward
  put(head, ex([
    [-0.100, 0.020], [-0.112, 0.145], [-0.082, 0.250], [0.000, 0.292],
    [0.086, 0.248], [0.116, 0.150], [0.108, 0.035], [0.058, -0.078],
    [-0.055, -0.048],
  ], 0.180, 0.014), char, 0, 0, 0, 0, -Math.PI / 2, 0);
  // gunmetal crown band and a white crest, both swept the same way
  put(head, ex([
    [-0.086, 0.248], [0.000, 0.292], [0.086, 0.248], [0.070, 0.205], [-0.070, 0.205],
  ], 0.196, 0.010), gun, 0, 0, 0, 0, -Math.PI / 2, 0);
  put(head, ex([
    [-0.070, 0.240], [0.000, 0.290], [0.070, 0.238], [0.060, 0.212], [-0.060, 0.212],
  ], 0.070, 0.008), white, 0, 0, 0, 0, -Math.PI / 2, 0);
  for (const s of [1, -1]) {
    put(head, ex([[-0.090, 0.250], [-0.020, 0.230], [-0.010, 0.150], [-0.095, 0.170]], 0.030),
      white, s * 0.104, 0, 0, 0, -Math.PI / 2, 0);
  }
  // faceplate and the single vertical light, kept a separate mesh to flare
  put(head, ex([[-0.062, 0.215], [0.062, 0.215], [0.050, 0.015], [0, -0.045], [-0.050, 0.015]], 0.040),
    black, 0, 0, 0.098);
  put(head, ex([[-0.026, 0.222], [0.026, 0.222], [0.020, 0.010], [0, -0.052], [-0.020, 0.010]], 0.012),
    gun, 0, 0, 0.116);
  const light = put(head, ex([[-0.013, 0.208], [0.013, 0.208], [0.010, 0.020], [0, -0.030], [-0.010, 0.020]], 0.018),
    glow, 0, 0, 0.124);
  g.userData.joints.helmetLight = light;

  // ------------------------------------ contract: base at y=0, centred on x/z
  const bb = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const putv = (mat) => { for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); putv(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    putv(n.matrixWorld);
  });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
