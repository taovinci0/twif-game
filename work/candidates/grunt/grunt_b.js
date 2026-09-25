// Big AI grunt — candidate B: swept profiles.
// Nearly every part is an ExtrudeGeometry of a drawn outline (chamfered by a
// one-segment bevel) or a low-segment LatheGeometry. Armour plates are cut as
// polygons rather than stacked as boxes; the boots and the belt are swept.
// 2.05 m. Articulated with pivots at the joints.
export default function (THREE) {
  const g = new THREE.Group();

  const M = (color, roughness, name, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness, metalness }, extra));
    m.name = name;
    return m;
  };
  const GLOSS = M(0x080A0B, 0.26, 'metal', 0.45);
  const SUIT  = M(0x111315, 0.92, 'fabric');
  const GUN   = M(0x3A3F46, 0.30, 'metal', 0.72);
  const SHIRT = M(0xE9E9EC, 0.76, 'fabric');
  const GLOW  = M(0xBFE4FF, 0.20, 'metal', 0.10, { emissive: 0xBFE4FF, emissiveIntensity: 0.85 });

  const grp = (parent, x, y, z) => {
    const o = new THREE.Group();
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  };
  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };

  // ---- outline helpers -------------------------------------------------
  const shape = (pts, sx = 1) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0] * sx, pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0] * sx, pts[i][1]);
    s.closePath();
    return s;
  };
  const sweep = (s, depth, bev) => new THREE.ExtrudeGeometry(s, {
    depth, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelOffset: 0,
    bevelSegments: 1, curveSegments: 2, steps: 1,
  });
  const centreOn = (geo, axis) => {
    geo.computeBoundingBox();
    const b = geo.boundingBox;
    const off = -(b.min[axis] + b.max[axis]) / 2;
    geo.translate(axis === 'x' ? off : 0, 0, axis === 'z' ? off : 0);
    return geo;
  };
  // outline drawn in (x, y), swept through depth in Z — the front silhouette
  const EZ = (pts, depth, bev = 0.014, sx = 1) => centreOn(sweep(shape(pts, sx), depth, bev), 'z');
  // outline drawn in (z, y), swept through width in X — the side silhouette
  const EX = (pts, width, bev = 0.014) => {
    const geo = sweep(shape(pts), width, bev);
    geo.rotateY(-Math.PI / 2);
    return centreOn(geo, 'x');
  };
  const ring = (w, d, t, height) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, -d / 2); s.lineTo(w / 2, -d / 2); s.lineTo(w / 2, d / 2); s.lineTo(-w / 2, d / 2); s.closePath();
    const h = new THREE.Path();
    h.moveTo(-w / 2 + t, -d / 2 + t); h.lineTo(-w / 2 + t, d / 2 - t); h.lineTo(w / 2 - t, d / 2 - t); h.lineTo(w / 2 - t, -d / 2 + t); h.closePath();
    s.holes.push(h);
    const geo = sweep(s, height, 0);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, height / 2, 0);
    return geo;
  };
  const slab = (w, h, d, bev = 0.012) =>
    EZ([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], d, bev);

  const joints = {};

  // ---------------------------------------------------------------- pelvis
  const pelvis = grp(g, 0, 1.00, 0);
  add(pelvis, EZ([[-0.20, -0.20], [0.20, -0.20], [0.23, 0.02], [0.22, 0.16], [-0.22, 0.16], [-0.23, 0.02]], 0.33), SUIT, 0, 0.02);
  add(pelvis, ring(0.50, 0.37, 0.05, 0.11), GLOSS, 0, 0.12);          // swept belt
  add(pelvis, slab(0.12, 0.09, 0.03), GUN, 0, 0.175, 0.185);          // buckle
  const pouch = (x, z, ry) => {
    add(pelvis, EZ([[-0.06, -0.07], [0.06, -0.07], [0.065, 0.04], [0.05, 0.07], [-0.05, 0.07], [-0.065, 0.04]], 0.09), GLOSS, x, 0.08, z, 0, ry, 0);
    add(pelvis, slab(0.12, 0.025, 0.10, 0.006), GUN, x, 0.145, z, 0, ry, 0);
  };
  pouch(0.15, 0.19, 0); pouch(-0.15, 0.19, 0);
  pouch(0.15, -0.19, 0); pouch(-0.15, -0.19, 0);
  pouch(0.255, 0, Math.PI / 2); pouch(-0.255, 0, Math.PI / 2);

  // ---------------------------------------------------------------- legs
  const thighOutline = [[-0.135, 0.02], [0.135, 0.02], [0.125, -0.22], [0.108, -0.46], [-0.108, -0.46], [-0.128, -0.22]];
  const shinOutline  = [[-0.115, 0.01], [0.115, 0.01], [0.100, -0.24], [0.090, -0.45], [-0.090, -0.45], [-0.102, -0.24]];
  // outer thigh plate, cut as a polygon (z, y) so the side view reads
  const thighPlate = [[-0.10, -0.15], [0.09, -0.11], [0.12, 0.02], [0.08, 0.14], [-0.07, 0.15], [-0.11, 0.02]];
  const shinPlate  = [[-0.06, -0.14], [0.09, -0.12], [0.10, 0.02], [0.06, 0.14], [-0.06, 0.13], [-0.08, 0.0]];
  const bootOutline = [[-0.15, -0.12], [0.25, -0.12], [0.255, -0.055], [0.175, 0.03], [0.12, 0.14], [-0.115, 0.14], [-0.155, 0.02]];

  const leg = (side, s) => {
    const up = grp(pelvis, s * 0.155, 0, 0);                    // hip, world 1.00
    add(up, EZ(thighOutline, 0.30), SUIT, 0, 0);
    add(up, EX(thighPlate, 0.05), GUN, s * 0.145, -0.24, 0.02);
    add(up, EZ([[-0.11, -0.14], [0.11, -0.14], [0.09, 0.13], [-0.09, 0.13]], 0.05), GLOSS, 0, -0.29, 0.155);
    if (s < 0) {
      add(up, EZ([[-0.05, -0.11], [0.05, -0.11], [0.055, 0.08], [-0.055, 0.08]], 0.12), GLOSS, s * 0.165, -0.33, 0.02);
      add(up, slab(0.12, 0.03, 0.13, 0.006), GUN, s * 0.165, -0.23, 0.02);
    }

    const lo = grp(up, 0, -0.44, 0);                            // knee, world 0.56
    add(lo, EZ(shinOutline, 0.26), SUIT, 0, 0);
    add(lo, EX([[-0.09, -0.06], [0.09, -0.05], [0.10, 0.05], [-0.08, 0.06]], 0.20), GLOSS, 0, -0.01, 0.02);
    add(lo, EX(shinPlate, 0.17), GUN, 0, -0.22, 0.10);
    add(lo, slab(0.14, 0.09, 0.07), GLOSS, 0, -0.36, 0.115);

    const ft = grp(lo, 0, -0.44, 0);                            // ankle, world 0.12
    add(ft, EX(bootOutline, 0.25), GLOSS, 0, 0, 0.04);          // swept boot profile
    add(ft, EX([[-0.15, -0.12], [0.25, -0.12], [0.25, -0.075], [-0.15, -0.075]], 0.27, 0.008), SUIT, 0, 0, 0.04);
    add(ft, EX([[0.10, -0.06], [0.24, -0.055], [0.20, 0.02], [0.09, 0.0]], 0.23, 0.008), GUN, 0, 0, 0.04);
    add(ft, ring(0.26, 0.30, 0.04, 0.045), GUN, 0, 0.09, 0.02);

    joints[side + 'UpperLeg'] = up;
    joints[side + 'LowerLeg'] = lo;
    joints[side + 'Foot'] = ft;
  };
  leg('left', 1); leg('right', -1);

  // ---------------------------------------------------------------- torso
  const torso = grp(pelvis, 0, 0.16, 0);                        // spine, world 1.16
  add(torso, EZ([
    [-0.21, -0.05], [0.21, -0.05], [0.235, 0.10], [0.275, 0.30], [0.30, 0.45],
    [0.265, 0.53], [-0.265, 0.53], [-0.30, 0.45], [-0.275, 0.30], [-0.235, 0.10],
  ], 0.36, 0.02), SUIT, 0, 0);
  add(torso, EZ([[-0.28, -0.04], [0.28, -0.04], [0.25, 0.04], [-0.25, 0.04]], 0.34, 0.012), GLOSS, 0, 0.525);

  // shirt / tie / lapels
  add(torso, EZ([[-0.085, -0.13], [0.085, -0.13], [0.085, 0.12], [-0.085, 0.12]], 0.04, 0.008), SHIRT, 0, 0.41, 0.175);
  add(torso, EZ([[-0.05, -0.035], [0.05, -0.035], [0.035, 0.04], [-0.035, 0.04]], 0.05, 0.008), SHIRT, 0.065, 0.505, 0.155);
  add(torso, EZ([[-0.05, -0.035], [0.05, -0.035], [0.035, 0.04], [-0.035, 0.04]], 0.05, 0.008), SHIRT, -0.065, 0.505, 0.155);
  add(torso, EZ([[-0.028, -0.115], [0.028, -0.115], [0.034, 0.10], [-0.034, 0.10]], 0.03, 0.006), GLOSS, 0, 0.375, 0.205);
  add(torso, EZ([[-0.026, -0.024], [0.026, -0.024], [0.026, 0.024], [-0.026, 0.024]], 0.035, 0.006), GLOSS, 0, 0.48, 0.203);
  for (const s of [1, -1]) {
    add(torso, EZ([[-0.075, -0.14], [0.075, -0.14], [0.055, 0.13], [-0.075, 0.13]], 0.045, 0.008, s), GLOSS, s * 0.135, 0.38, 0.175);
    // harness strap, swept as a long thin plate
    add(torso, EZ([[-0.028, -0.21], [0.028, -0.21], [0.028, 0.21], [-0.028, 0.21]], 0.028, 0.006), GLOSS, s * 0.155, 0.34, 0.190, 0, 0, s * 0.24);
    add(torso, EZ([[-0.028, -0.21], [0.028, -0.21], [0.028, 0.21], [-0.028, 0.21]], 0.028, 0.006), GLOSS, s * 0.155, 0.34, -0.190, 0, 0, -s * 0.24);
    add(torso, EX([[-0.18, -0.025], [0.18, -0.025], [0.18, 0.025], [-0.18, 0.025]], 0.05, 0.006), GLOSS, s * 0.185, 0.50, 0);
    add(torso, slab(0.07, 0.045, 0.035, 0.006), GUN, s * 0.155, 0.24, 0.195);
  }
  add(torso, slab(0.33, 0.045, 0.03, 0.006), GLOSS, 0, 0.22, 0.195);

  // blank emblem plate, back. Art is a texture, never geometry.
  add(torso, EZ([[-0.13, -0.16], [0.13, -0.16], [0.145, 0], [0.13, 0.16], [-0.13, 0.16], [-0.145, 0]], 0.03), GLOSS, 0, 0.34, -0.19);
  add(torso, EZ([[-0.10, -0.12], [0.10, -0.12], [0.11, 0], [0.10, 0.12], [-0.10, 0.12], [-0.11, 0]], 0.02, 0.006), GUN, 0, 0.34, -0.215);
  add(torso, EX([[-0.02, -0.035], [0.02, -0.035], [0.02, 0.035], [-0.02, 0.035]], 0.44, 0.006), GLOSS, 0, 0.11, -0.175);

  // ---------------------------------------------------------------- arms
  const pauldron = [[-0.105, -0.06], [-0.04, -0.125], [0.075, -0.115], [0.125, -0.005], [0.095, 0.105], [-0.02, 0.145], [-0.10, 0.09]];
  const arm = (side, s) => {
    const up = grp(torso, s * 0.255, 0.44, 0);                  // shoulder, world 1.60
    add(up, EZ(pauldron, 0.30, 0.018, s), GLOSS, s * 0.055, 0.015, 0, 0, 0, -s * 0.13);
    add(up, EZ([[-0.10, -0.03], [0.10, -0.03], [0.085, 0.03], [-0.085, 0.03]], 0.28, 0.01, s), GUN, s * 0.085, -0.10, 0, 0, 0, -s * 0.13);
    // blank shoulder plate — the emblem's home
    add(up, EX([[-0.07, -0.065], [0.07, -0.065], [0.055, 0.065], [-0.055, 0.065]], 0.022, 0.006), GUN, s * 0.175, 0.02, 0.01);
    add(up, EZ([[-0.105, 0.02], [0.105, 0.02], [0.085, -0.36], [-0.085, -0.36]], 0.21), SUIT, 0, 0);
    add(up, EZ([[-0.075, -0.06], [0.075, -0.06], [0.075, 0.06], [-0.075, 0.06]], 0.19, 0.01), GLOSS, 0, -0.30, 0);

    const lo = grp(up, 0, -0.36, 0);                            // elbow, world 1.24
    add(lo, EZ([[-0.09, 0], [0.09, 0], [0.072, -0.34], [-0.072, -0.34]], 0.18), SUIT, 0, 0);
    add(lo, EX([[-0.09, -0.13], [0.09, -0.12], [0.10, 0.02], [0.05, 0.11], [-0.08, 0.10]], 0.17), GUN, 0, -0.16, 0.01);
    add(lo, EZ([[-0.07, -0.03], [0.07, -0.03], [0.06, 0.035], [-0.06, 0.035]], 0.15, 0.01), GLOSS, 0, -0.02, 0);
    add(lo, slab(0.04, 0.026, 0.02, 0.004), GLOW, s * 0.092, -0.24, 0.05);

    const hd = grp(lo, 0, -0.34, 0);                            // wrist, world 0.90
    add(hd, EZ([[-0.055, -0.08], [0.055, -0.08], [0.05, 0.05], [-0.05, 0.05]], 0.13, 0.012), GLOSS, 0, -0.075, 0.005);
    add(hd, EZ([[-0.025, -0.045], [0.025, -0.045], [0.025, 0.045], [-0.025, 0.045]], 0.06, 0.008), GLOSS, -s * 0.062, -0.05, 0.04, 0, 0, s * 0.35);
    add(hd, EZ([[-0.06, -0.025], [0.06, -0.025], [0.06, 0.025], [-0.06, 0.025]], 0.14, 0.008), GUN, 0, 0.005, 0.005);

    joints[side + 'UpperArm'] = up;
    joints[side + 'LowerArm'] = lo;
    joints[side + 'Hand'] = hd;
  };
  arm('left', 1); arm('right', -1);

  // ---------------------------------------------------------------- head
  const head = grp(torso, 0, 0.50, 0);                          // neck, world 1.66
  add(head, new THREE.CylinderGeometry(0.086, 0.096, 0.13, 8), SUIT, 0, 0.035);
  // helmet: a lathed shell at 8 segments, so it facets rather than balloons
  const prof = [[0.0, 0.055], [0.088, 0.06], [0.112, 0.115], [0.130, 0.20], [0.133, 0.27], [0.118, 0.335], [0.078, 0.378], [0.0, 0.39]];
  const lathePts = prof.map((p) => new THREE.Vector2(p[0], p[1]));
  const shell = add(head, new THREE.LatheGeometry(lathePts, 8, Math.PI / 8), GLOSS, 0, 0);
  shell.scale.set(1.0, 1.0, 1.06);
  // jaw wedge and the angled face plate, swept from outlines
  add(head, EX([[-0.115, 0.005], [0.115, 0.005], [0.125, 0.075], [-0.10, 0.085]], 0.20), GLOSS, 0, 0.055, 0);
  add(head, EZ([[-0.092, -0.125], [0.092, -0.125], [0.10, 0.02], [0.082, 0.125], [-0.082, 0.125], [-0.10, 0.02]], 0.055, 0.012), GLOSS, 0, 0.225, 0.115, -0.13);
  add(head, EZ([[-0.075, -0.03], [0.075, -0.03], [0.06, 0.03], [-0.06, 0.03]], 0.05, 0.01), GLOSS, 0, 0.105, 0.105, 0.35);
  for (const s of [1, -1]) add(head, new THREE.CylinderGeometry(0.046, 0.046, 0.035, 8), GUN, s * 0.122, 0.215, -0.005, 0, 0, Math.PI / 2);
  add(head, EZ([[-0.045, -0.025], [0.045, -0.025], [0.045, 0.025], [-0.045, 0.025]], 0.12, 0.008), GUN, 0, 0.315, -0.125);

  const visor = add(head, EZ([[-0.086, -0.019], [0.086, -0.019], [0.078, 0.019], [-0.078, 0.019]], 0.022, 0.005), GLOW, 0, 0.262, 0.152, -0.13);
  visor.name = 'visorBar';

  joints.head = head;
  joints.torso = torso;
  joints.pelvis = pelvis;
  g.userData.joints = joints;
  g.userData.visor = visor;

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
