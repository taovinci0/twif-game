// Big AI grunt — candidate C: a different reading of the shape.
// Read as faceted hard-surface masses: every volume is a low-segment tapered
// prism (6/8-sided CylinderGeometry, scaled to an aspect), and the armour is a
// continuous carapace — one shoulder yoke shell spanning both pauldrons, one
// greave running shin-into-boot — rather than separate plates bolted on.
// Proportions also read differently: shorter legs, longer torso, heavier.
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
  // a faceted tapered mass: unit prism scaled to half-width / half-depth
  const mass = (parent, mat, opt) => {
    const seg = opt.seg || 6;
    const geo = new THREE.CylinderGeometry(opt.t === undefined ? 1 : opt.t, 1, opt.h, seg, 1, false,
      opt.theta === undefined ? Math.PI / seg : opt.theta);
    const m = new THREE.Mesh(geo, mat);
    m.scale.set(opt.w, 1, opt.d === undefined ? opt.w : opt.d);
    m.position.set(opt.x || 0, opt.y || 0, opt.z || 0);
    m.rotation.set(opt.rx || 0, opt.ry || 0, opt.rz || 0);
    parent.add(m);
    return m;
  };
  const slab = (parent, mat, w, h, d, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };

  const joints = {};

  // ---------------------------------------------------------------- pelvis
  const pelvis = grp(g, 0, 0.95, 0);                            // hip line, low and heavy
  mass(pelvis, SUIT,  { t: 1.16, h: 0.30, w: 0.205, d: 0.165, y: 0.01 });
  mass(pelvis, GLOSS, { t: 1.0,  h: 0.12, w: 0.245, d: 0.195, y: 0.20, seg: 8 });   // belt band
  mass(pelvis, GUN,   { t: 1.0,  h: 0.085, w: 0.055, d: 0.02, y: 0.20, z: 0.195, seg: 4, theta: Math.PI / 4 });
  const pouch = (x, z, ry) => {
    mass(pelvis, GLOSS, { t: 1.12, h: 0.15, w: 0.062, d: 0.048, x, y: 0.11, z, ry, seg: 6 });
    slab(pelvis, GUN, 0.125, 0.026, 0.10, x, 0.185, z, 0, ry, 0);
  };
  pouch(0.155, 0.185, 0); pouch(-0.155, 0.185, 0);
  pouch(0.155, -0.185, 0); pouch(-0.155, -0.185, 0);
  pouch(0.26, 0, Math.PI / 2); pouch(-0.26, 0, Math.PI / 2);

  // ---------------------------------------------------------------- legs
  const leg = (side, s) => {
    const up = grp(pelvis, s * 0.16, 0, 0);                     // hip, world 0.95
    mass(up, SUIT,  { t: 0.90, h: 0.44, w: 0.150, d: 0.165, y: -0.21 });
    // one continuous thigh shell wrapping outer + front
    mass(up, GUN,   { t: 0.86, h: 0.30, w: 0.075, d: 0.150, x: s * 0.135, y: -0.24, z: 0.015, seg: 6, rz: -s * 0.07 });
    mass(up, GLOSS, { t: 0.92, h: 0.26, w: 0.115, d: 0.045, y: -0.30, z: 0.155, seg: 6, theta: Math.PI / 6 });
    if (s < 0) {
      mass(up, GLOSS, { t: 1.0, h: 0.22, w: 0.055, d: 0.07, x: s * 0.17, y: -0.34, z: 0.02, seg: 6 });
      slab(up, GUN, 0.12, 0.03, 0.15, s * 0.17, -0.235, 0.02);
    }

    const lo = grp(up, 0, -0.42, 0);                            // knee, world 0.53
    mass(lo, GLOSS, { t: 1.0, h: 0.13, w: 0.105, d: 0.115, y: -0.02, seg: 6 });     // knee
    mass(lo, SUIT,  { t: 0.90, h: 0.42, w: 0.128, d: 0.140, y: -0.21 });
    // greave: shin armour that runs straight on into the boot shaft
    mass(lo, GUN,   { t: 0.88, h: 0.32, w: 0.092, d: 0.075, y: -0.23, z: 0.085, seg: 6 });

    const ft = grp(lo, 0, -0.41, 0);                            // ankle, world 0.12
    mass(ft, GLOSS, { t: 1.10, h: 0.22, w: 0.115, d: 0.125, y: 0.01, seg: 6 });     // boot shaft
    mass(ft, GLOSS, { t: 1.0, h: 0.11, w: 0.125, d: 0.185, y: -0.055, z: 0.055, seg: 8, theta: Math.PI / 8 });
    slab(ft, SUIT, 0.27, 0.05, 0.40, 0, -0.095, 0.055);         // sole -> world y = 0
    slab(ft, GUN, 0.235, 0.055, 0.11, 0, -0.04, 0.215);         // toe cap
    slab(ft, GUN, 0.245, 0.04, 0.245, 0, 0.085, 0.01);          // ankle strap

    joints[side + 'UpperLeg'] = up;
    joints[side + 'LowerLeg'] = lo;
    joints[side + 'Foot'] = ft;
  };
  leg('left', 1); leg('right', -1);

  // ---------------------------------------------------------------- torso
  const torso = grp(pelvis, 0, 0.18, 0);                        // spine, world 1.13
  mass(torso, SUIT, { t: 1.16, h: 0.26, w: 0.205, d: 0.160, y: 0.03 });             // abdomen
  mass(torso, SUIT, { t: 1.06, h: 0.32, w: 0.245, d: 0.190, y: 0.29 });             // chest
  // the carapace: one yoke shell across both shoulders, not two pauldrons
  const yoke = mass(torso, GLOSS, { t: 0.60, h: 0.20, w: 0.405, d: 0.200, y: 0.50, seg: 8, theta: Math.PI / 8 });
  mass(torso, GUN, { t: 1.0, h: 0.035, w: 0.395, d: 0.196, y: 0.395, seg: 8, theta: Math.PI / 8 });
  mass(torso, GLOSS, { t: 1.0, h: 0.06, w: 0.185, d: 0.140, y: 0.605, seg: 8, theta: Math.PI / 8 });   // collar

  // shirt wedge, tie, lapels
  slab(torso, SHIRT, 0.17, 0.24, 0.05, 0, 0.38, 0.180);
  slab(torso, SHIRT, 0.09, 0.07, 0.05, 0.068, 0.487, 0.150, 0, 0, -0.5);
  slab(torso, SHIRT, 0.09, 0.07, 0.05, -0.068, 0.487, 0.150, 0, 0, 0.5);
  mass(torso, GLOSS, { t: 1.0, h: 0.05, w: 0.028, d: 0.022, y: 0.462, z: 0.200, seg: 4, theta: Math.PI / 4 });
  mass(torso, GLOSS, { t: 1.35, h: 0.21, w: 0.026, d: 0.016, y: 0.345, z: 0.203, seg: 4, theta: Math.PI / 4 });
  for (const s of [1, -1]) {
    slab(torso, GLOSS, 0.13, 0.27, 0.05, s * 0.135, 0.35, 0.178, 0, 0, -s * 0.16);
    slab(torso, GLOSS, 0.055, 0.40, 0.03, s * 0.155, 0.32, 0.188, 0, 0, s * 0.24);
    slab(torso, GLOSS, 0.055, 0.40, 0.03, s * 0.155, 0.32, -0.188, 0, 0, -s * 0.24);
    slab(torso, GUN, 0.07, 0.045, 0.035, s * 0.155, 0.22, 0.193);
  }
  slab(torso, GLOSS, 0.33, 0.045, 0.03, 0, 0.20, 0.193);

  // blank emblem plate on the back
  mass(torso, GLOSS, { t: 1.0, h: 0.32, w: 0.145, d: 0.018, y: 0.32, z: -0.195, seg: 6, theta: Math.PI / 6 });
  mass(torso, GUN,   { t: 1.0, h: 0.25, w: 0.110, d: 0.014, y: 0.32, z: -0.214, seg: 6, theta: Math.PI / 6 });
  slab(torso, GLOSS, 0.44, 0.07, 0.04, 0, 0.09, -0.172);

  // ---------------------------------------------------------------- arms
  const arm = (side, s) => {
    const up = grp(torso, s * 0.285, 0.46, 0);                  // shoulder, world 1.59
    // the arm's own cap under the yoke, so nothing tears open when it lifts
    mass(up, GLOSS, { t: 1.10, h: 0.17, w: 0.115, d: 0.155, y: -0.03, seg: 6 });
    mass(up, GUN,   { t: 1.0, h: 0.13, w: 0.02, d: 0.075, x: s * 0.115, y: -0.02, z: 0.01, seg: 4, theta: Math.PI / 4 });  // blank emblem plate
    mass(up, SUIT,  { t: 0.90, h: 0.30, w: 0.100, d: 0.105, y: -0.22 });
    mass(up, GLOSS, { t: 1.0, h: 0.10, w: 0.085, d: 0.095, y: -0.31, seg: 6 });

    const lo = grp(up, 0, -0.38, 0);                            // elbow, world 1.21
    mass(lo, SUIT,  { t: 0.92, h: 0.34, w: 0.085, d: 0.090, y: -0.17 });
    mass(lo, GUN,   { t: 0.86, h: 0.26, w: 0.092, d: 0.098, y: -0.16, z: 0.01, seg: 6 });   // bracer
    mass(lo, GLOSS, { t: 1.0, h: 0.06, w: 0.075, d: 0.080, y: -0.01, seg: 6 });
    slab(lo, GLOW, 0.04, 0.026, 0.02, s * 0.092, -0.245, 0.055);

    const hd = grp(lo, 0, -0.34, 0);                            // wrist, world 0.87
    mass(hd, GLOSS, { t: 0.92, h: 0.16, w: 0.055, d: 0.068, y: -0.075, seg: 6 });
    slab(hd, GLOSS, 0.05, 0.09, 0.06, -s * 0.06, -0.05, 0.04, 0, 0, s * 0.35);
    mass(hd, GUN,   { t: 1.0, h: 0.05, w: 0.062, d: 0.074, y: 0.005, seg: 6 });

    joints[side + 'UpperArm'] = up;
    joints[side + 'LowerArm'] = lo;
    joints[side + 'Hand'] = hd;
  };
  arm('left', 1); arm('right', -1);

  // ---------------------------------------------------------------- head
  const head = grp(torso, 0, 0.55, 0);                          // neck, world 1.68
  mass(head, SUIT, { t: 1.0, h: 0.12, w: 0.092, d: 0.092, y: 0.00, seg: 8 });
  // faceted gem helmet: jaw cone, skull barrel, crown taper
  mass(head, GLOSS, { t: 1.55, h: 0.10, w: 0.075, d: 0.082, y: 0.06, seg: 6 });
  mass(head, GLOSS, { t: 1.09, h: 0.17, w: 0.108, d: 0.118, y: 0.185, seg: 6 });
  mass(head, GLOSS, { t: 0.19, h: 0.115, w: 0.118, d: 0.129, y: 0.3125, seg: 6 });
  // angled face plate and chin bevel
  slab(head, GLOSS, 0.175, 0.22, 0.055, 0, 0.215, 0.105, -0.14);
  slab(head, GLOSS, 0.145, 0.055, 0.05, 0, 0.095, 0.095, 0.38);
  for (const s of [1, -1]) mass(head, GUN, { t: 1.0, h: 0.035, w: 0.046, d: 0.046, x: s * 0.118, y: 0.20, rz: Math.PI / 2, seg: 8 });
  slab(head, GUN, 0.09, 0.05, 0.13, 0, 0.29, -0.115);

  const visor = slab(head, GLOW, 0.162, 0.036, 0.022, 0, 0.252, 0.138, -0.14);
  visor.name = 'visorBar';

  joints.head = head;
  joints.torso = torso;
  joints.pelvis = pelvis;
  g.userData.joints = joints;
  g.userData.visor = visor;
  g.userData.yoke = yoke;

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
