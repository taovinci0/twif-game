// Big AI boss — candidate C: a different reading of the shape.
// Instead of a body with panels hung on it, the whole figure is lofted from
// angular rings written straight into BufferGeometry. The coat is ONE shell
// whose front opening widens as it descends (closed high on the chest, open
// over the legs) and whose sawtooth hem is part of the surface rather than
// blades stuck on. Flat-shaded so every facet stays crisp. 2.15 m, no glyphs.
export default function (THREE) {
  const g = new THREE.Group();
  const root = new THREE.Group();
  g.add(root);
  g.userData.joints = {};

  const M = (color, roughness, name, metalness = 0, flat = true, side) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading: flat });
    if (side) m.side = side;
    m.name = name;
    return m;
  };
  const white  = M(0xE9E9EC, 0.62, 'fabric');
  const whiteD = M(0xE9E9EC, 0.62, 'fabric', 0, true, THREE.DoubleSide);
  const black  = M(0x080A0B, 0.66, 'fabric');
  const blackD = M(0x080A0B, 0.66, 'fabric', 0, true, THREE.DoubleSide);
  const char   = M(0x111315, 0.48, 'metal', 0.40);
  const gun    = M(0x3A3F46, 0.34, 'metal', 0.78);
  const glow   = new THREE.MeshStandardMaterial({
    color: 0xBFE4FF, roughness: 0.22, metalness: 0.0,
    emissive: 0xBFE4FF, emissiveIntensity: 1.0,
  });
  glow.name = 'metal';

  const joint = (parent, name, x, y, z) => {
    const o = new THREE.Group();
    o.position.set(x, y, z);
    parent.add(o);
    g.userData.joints[name] = o;
    return o;
  };

  // Build a surface from a stack of rings. Each ring is an array of [x,y,z];
  // every ring has the same point count. `closed` wraps the last column to the
  // first. This is the one primitive the whole asset is made of.
  const loft = (parent, mat, rings, closed, x = 0, y = 0, z = 0) => {
    const n = rings[0].length, rows = rings.length, pos = [], uv = [], idx = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < n; j++) {
        const p = rings[i][j];
        pos.push(p[0], p[1], p[2]);
        // surfaces.js scales these by the mesh's own size; it only needs a sane
        // 0..1 parameterisation, and a hand-built geometry with no uv at all
        // silently samples one texel for the whole surface.
        uv.push(j / (closed ? n : n - 1), i / (rows - 1));
      }
    }
    const lim = closed ? n : n - 1;
    for (let i = 0; i < rows - 1; i++) {
      for (let j = 0; j < lim; j++) {
        const a = i * n + j, b = i * n + (j + 1) % n;
        const c = (i + 1) * n + j, d = (i + 1) * n + (j + 1) % n;
        idx.push(a, c, b, b, c, d);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  // angular cross-sections, as unit offsets
  const SEC6 = [[0, 1], [0.87, 0.52], [0.87, -0.52], [0, -1], [-0.87, -0.52], [-0.87, 0.52]];
  const SEC8 = [[0, 1], [0.70, 0.74], [0.95, 0], [0.70, -0.78], [0, -1],
                [-0.70, -0.78], [-0.95, 0], [-0.70, 0.74]];
  // spec rows are [y, halfWidth, halfDepth, zOffset]
  const tube = (parent, mat, sec, spec, x = 0, y = 0, z = 0) =>
    loft(parent, mat, spec.map((s) =>
      sec.map((p) => [p[0] * s[1], s[0], p[1] * s[2] + (s[3] || 0)])), true, x, y, z);

  const put = (parent, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const torso = joint(root, 'torso', 0, 0, 0);

  // ----------------------------------------------------- faceted under-body
  tube(torso, black, SEC6, [
    [1.045, 0.010, 0.008], [1.075, 0.150, 0.110], [1.190, 0.158, 0.116],
    [1.310, 0.126, 0.094], [1.460, 0.148, 0.106], [1.630, 0.166, 0.116],
    [1.745, 0.140, 0.100], [1.775, 0.010, 0.008],
  ]);
  tube(torso, char, SEC6, [
    [1.380, 0.010, 0.008], [1.400, 0.142, 0.104], [1.580, 0.158, 0.112],
    [1.660, 0.130, 0.096], [1.680, 0.010, 0.008],
  ], 0, 0, 0.012);
  put(torso, box(0.345, 0.072, 0.245), gun, 0, 1.240, 0);        // belt
  put(torso, box(0.100, 0.090, 0.030), char, 0, 1.240, 0.130);   // blank buckle
  put(torso, box(0.055, 0.40, 0.020), white, 0.118, 1.030, 0.132);
  put(torso, box(0.045, 0.27, 0.020), gun, -0.104, 1.090, 0.132);

  // rank tag on its chain — both blank, art applied later
  // it has to hang clear of the coat front or it is swallowed by it
  put(torso, new THREE.CylinderGeometry(0.009, 0.009, 0.30, 6), gun, 0.084, 1.575, 0.176, 0.09, 0, 0.17);
  put(torso, new THREE.CylinderGeometry(0.009, 0.009, 0.30, 6), gun, -0.024, 1.575, 0.176, 0.09, 0, -0.17);
  tube(torso, white, SEC6, [
    [1.490, 0.010, 0.006], [1.478, 0.050, 0.011], [1.362, 0.050, 0.011], [1.318, 0.010, 0.006],
  ], 0.030, 0, 0.208);
  put(torso, box(0.062, 0.110, 0.012), char, 0.030, 1.420, 0.222);

  // ------------------------------------------------------------- the coat
  // One shell. rAt/gapAt drive it: the front opening is 0.11 rad at the
  // shoulder and 0.80 rad at the hem, so the coat crosses the chest and then
  // falls open over the legs. The hem y varies per column: that sawtooth IS
  // the silhouette, and it is what stops the back reading as a cone.
  const coat = joint(torso, 'coat', 0, 0, 0);
  const TBL = [[1.760, 0.212], [1.620, 0.234], [1.440, 0.208], [1.250, 0.196],
               [1.020, 0.230], [0.780, 0.274], [0.540, 0.316], [0.300, 0.358],
               [0.040, 0.392]];
  const rAt = (y) => {
    if (y >= TBL[0][0]) return TBL[0][1];
    for (let i = 0; i < TBL.length - 1; i++) {
      if (y <= TBL[i][0] && y >= TBL[i + 1][0]) {
        const t = (TBL[i][0] - y) / (TBL[i][0] - TBL[i + 1][0]);
        return TBL[i][1] + t * (TBL[i + 1][1] - TBL[i][1]);
      }
    }
    return TBL[TBL.length - 1][1];
  };
  const gapAt = (y) => 0.11 + (0.80 - 0.11) * Math.min(1, Math.max(0, (1.76 - y) / 1.25));
  // ZK squashes the coat front-to-back: a coat of circular section reads as a
  // gown in profile, and the figure has to be narrow from the side too.
  const NC = 13, ZK = 0.80;
  // per-column hem height — long daggers, short notches, left side lower
  const HEM = [0.10, 0.46, 0.06, 0.42, 0.13, 0.38, 0.19, 0.35, 0.16, 0.44, 0.23, 0.50, 0.31];
  // t is a fractional column index, so a stripe can be laid on the same surface
  const coatPt = (t, y, inset) => {
    const gp = gapAt(y);
    const a = gp + t * (Math.PI * 2 - 2 * gp) / (NC - 1);
    const r = rAt(y) - inset;
    return [Math.sin(a) * r, y, Math.cos(a) * r * ZK];
  };
  const coatRing = (yOf, inset) => {
    const out = [];
    for (let i = 0; i < NC; i++) out.push(coatPt(i, typeof yOf === 'number' ? yOf : yOf[i], inset));
    return out;
  };
  const coatYs = [1.760, 1.620, 1.440, 1.250, 1.020, 0.780, 0.600];
  for (const [mat, inset] of [[whiteD, 0], [blackD, 0.030]]) {
    loft(coat, mat, [...coatYs.map((y) => coatRing(y, inset)), coatRing(HEM, inset)], false);
  }
  // close the two front edges so the shell has thickness
  for (const s of [0, NC - 1]) {
    const o = [], n2 = [];
    for (const y of [...coatYs, null]) {
      const yy = y === null ? HEM[s] : y;
      o.push(coatPt(s, yy, 0));
      n2.push(coatPt(s, yy, 0.030));
    }
    loft(coat, whiteD, o.map((p, i) => [p, n2[i]]), false);
  }
  // the dark spine, laid proud on the back of the same shell. Without it the
  // back is one unbroken white field and the figure loses its read from behind.
  loft(coat, blackD, [1.640, 1.250, 0.900, 0.620, 0.440, 0.320].map((y, i, arr) => {
    const w = i === arr.length - 1 ? 0.02 : 0.26 - i * 0.03;
    return [coatPt(6 - w, y, -0.013), coatPt(6 + w, y, -0.013)];
  }), false);
  // ...and the placket down the front opening, same trick, mirrored in
  for (const t of [0.55, NC - 1.55]) {
    loft(coat, blackD, [1.700, 1.400, 1.100, 0.800, 0.560].map((y) =>
      [coatPt(t - 0.30, y, -0.011), coatPt(t + 0.30, y, -0.011)]), false);
  }

  // shoulder mantle: a second, shorter shell over the top of the coat
  tube(coat, whiteD, SEC8, [
    [1.800, 0.148, 0.118], [1.768, 0.216, 0.166], [1.706, 0.248, 0.188],
    [1.646, 0.252, 0.190], [1.606, 0.194, 0.150],
  ]);
  put(coat, box(0.500, 0.026, 0.340), char, 0, 1.616, 0);

  // high stiff collar, lofted as a flared open wall behind the head
  const COL = [];
  for (const [y, r] of [[1.752, 0.088], [1.818, 0.118], [1.892, 0.148], [1.958, 0.170], [1.972, 0.177]]) {
    const row = [];
    for (let i = 0; i < 7; i++) {
      const a = 1.05 + i * (Math.PI * 2 - 2.10) / 6;
      row.push([Math.sin(a) * r, y, Math.cos(a) * r * 0.88 - 0.022]);
    }
    COL.push(row);
  }
  loft(torso, whiteD, COL, false);
  loft(torso, blackD, COL.map((r) => r.map((p) => [p[0] * 0.88, p[1] - 0.006, p[2] * 0.88])), false);
  for (const s of [1, -1]) {
    put(torso, box(0.022, 0.185, 0.130), white, s * 0.116, 1.848, 0.070, 0.24, s * 0.55, 0);
  }
  tube(torso, char, SEC6, [[1.740, 0.075, 0.068], [1.860, 0.070, 0.064]]);   // neck

  // ---------------------------------------------------------- pauldrons
  for (const s of [1, -1]) {
    tube(torso, white, SEC6, [
      [0.110, 0.070, 0.090], [0.060, 0.112, 0.118], [-0.050, 0.118, 0.124],
      [-0.140, 0.074, 0.086], [-0.170, 0.020, 0.030],
    ], s * 0.252, 1.700, 0);
    tube(torso, white, SEC6, [
      [0.030, 0.062, 0.082], [-0.020, 0.086, 0.100], [-0.090, 0.050, 0.064],
    ], s * 0.292, 1.545, 0);
  }
  // blank plate where the shoulder emblem goes
  put(torso, box(0.014, 0.110, 0.100), char, 0.362, 1.700, 0.010);

  // --------------------------------------------------------------- arms
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const up = joint(torso, side + 'UpperArm', s * 0.256, 1.675, 0);
    up.rotation.z = -s * 0.17;
    tube(up, black, SEC6, [
      [0.030, 0.008, 0.008], [0.010, 0.066, 0.070], [-0.070, 0.070, 0.074],
      [-0.220, 0.056, 0.058], [-0.310, 0.062, 0.064], [-0.370, 0.052, 0.054],
      [-0.384, 0.008, 0.008],
    ]);
    tube(up, gun, SEC6, [[-0.085, 0.074, 0.078], [-0.140, 0.070, 0.074]]);

    const lo = joint(up, side + 'LowerArm', 0, -0.380, 0);
    // the gauntlet's segmentation is in the ring stack: four hard steps, and
    // gunmetal collars between them, or a black arm on a black coat vanishes
    tube(lo, black, SEC6, [
      [0.020, 0.008, 0.008], [0.004, 0.062, 0.064], [-0.034, 0.066, 0.068],
      [-0.062, 0.046, 0.048], [-0.094, 0.058, 0.060], [-0.132, 0.061, 0.063],
      [-0.160, 0.043, 0.045], [-0.196, 0.054, 0.056], [-0.232, 0.055, 0.057],
      [-0.260, 0.039, 0.041], [-0.296, 0.048, 0.050], [-0.336, 0.043, 0.045],
      [-0.350, 0.008, 0.008],
    ]);
    for (const yb of [-0.030, -0.128, -0.228]) {
      tube(lo, gun, SEC6, [[yb + 0.012, 0.068, 0.070], [yb - 0.016, 0.064, 0.066]]);
    }
    put(lo, box(0.078, 0.100, 0.052), char, 0, -0.400, 0);
    for (let f = 0; f < 3; f++) put(lo, box(0.018, 0.090, 0.022), gun, (f - 1) * 0.026, -0.494, 0.006);
  }

  // --------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const up = joint(torso, side + 'UpperLeg', s * 0.106, 1.140, 0);
    tube(up, black, SEC6, [
      [0.010, 0.008, 0.008], [-0.012, 0.100, 0.104], [-0.110, 0.110, 0.114],
      [-0.300, 0.092, 0.096], [-0.430, 0.102, 0.106], [-0.525, 0.092, 0.096],
      [-0.545, 0.008, 0.008],
    ]);
    tube(up, char, SEC6, [
      [-0.320, 0.070, 0.086], [-0.400, 0.092, 0.104], [-0.475, 0.074, 0.088],
    ], 0, 0, 0.008);

    const lo = joint(up, side + 'LowerLeg', 0, -0.545, 0);
    tube(lo, black, SEC6, [
      [0.015, 0.008, 0.008], [0.000, 0.084, 0.088], [-0.060, 0.092, 0.096],
      [-0.230, 0.070, 0.074], [-0.340, 0.064, 0.068], [-0.420, 0.080, 0.084],
      [-0.440, 0.008, 0.008],
    ]);
    tube(lo, gun, SEC6, [
      [0.055, 0.050, 0.062], [-0.010, 0.072, 0.088], [-0.085, 0.056, 0.070],
    ], 0, 0, 0.014);
    // boot
    tube(lo, char, SEC6, [
      [-0.330, 0.008, 0.008], [-0.345, 0.076, 0.086], [-0.470, 0.080, 0.104],
      [-0.560, 0.078, 0.140], [-0.598, 0.070, 0.132],
    ], 0, 0, 0.030);
    put(lo, box(0.160, 0.040, 0.320), gun, 0, -0.580, 0.058);

    // -------------------------------------------------------------- head
  }
  const head = joint(torso, 'head', 0, 1.845, 0);
  // faceless angular helm, lofted with a forward chin wedge
  tube(head, char, SEC8, [
    [-0.108, 0.008, 0.008, 0.030], [-0.082, 0.056, 0.066, 0.026],
    [0.010, 0.094, 0.106, 0.004], [0.130, 0.101, 0.110, 0],
    [0.232, 0.092, 0.099, -0.004], [0.288, 0.050, 0.054, -0.006],
    [0.298, 0.008, 0.008, -0.006],
  ]);
  tube(head, gun, SEC8, [
    [0.203, 0.094, 0.102, -0.003], [0.247, 0.088, 0.095, -0.004],
    [0.288, 0.052, 0.056, -0.006], [0.298, 0.008, 0.008, -0.006],
  ]);
  // a crest fin that comes to a point. Anything with a flat top and a squared
  // footprint reads as a mortarboard from the side, which is what it was.
  tube(head, white, SEC6, [
    [0.224, 0.042, 0.098], [0.272, 0.030, 0.070], [0.300, 0.007, 0.016],
  ], 0, 0, -0.012);
  for (const s of [1, -1]) put(head, box(0.030, 0.056, 0.110), white, s * 0.100, 0.212, -0.022);
  put(head, box(0.126, 0.200, 0.038), black, 0, 0.112, 0.092);        // faceplate
  put(head, box(0.046, 0.238, 0.014), gun, 0, 0.114, 0.104);          // bezel
  const light = put(head, box(0.022, 0.216, 0.024), glow, 0, 0.114, 0.116);
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
