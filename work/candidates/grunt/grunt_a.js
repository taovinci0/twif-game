// Big AI grunt — candidate A: assembled from primitives.
// Box / Cylinder / Capsule / Sphere. Cloth limbs as capsules, armour as
// chamfer-less slabs, helmet as a stack of boxes with an angled face plate.
// 2.05 m. Articulated: every joint is a Group placed AT the joint, with the
// geometry offset inside it as a child.
export default function (THREE) {
  const g = new THREE.Group();

  const M = (color, roughness, name, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness, metalness }, extra));
    m.name = name;
    return m;
  };
  const GLOSS = M(0x080A0B, 0.26, 'metal', 0.45);              // gloss-black armour
  const SUIT  = M(0x111315, 0.92, 'fabric');                   // black suit cloth
  const GUN   = M(0x3A3F46, 0.30, 'metal', 0.72);              // gunmetal plate
  const SHIRT = M(0xE9E9EC, 0.76, 'fabric');                   // white shirt
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
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const CAP = (r, l) => new THREE.CapsuleGeometry(r, l, 2, 8);
  const CYL = (rt, rb, h, s) => new THREE.CylinderGeometry(rt, rb, h, s);

  // ---------------------------------------------------------------- pelvis
  // Root of the whole figure. Hip joints live on it.
  const pelvis = grp(g, 0, 1.00, 0);
  add(pelvis, B(0.46, 0.26, 0.34), SUIT, 0, 0.04);
  add(pelvis, B(0.42, 0.14, 0.33), GLOSS, 0, -0.13);            // seat / short trouser break
  add(pelvis, B(0.50, 0.10, 0.36), GLOSS, 0, 0.17);             // utility belt
  add(pelvis, B(0.11, 0.09, 0.04), GUN, 0, 0.17, 0.19);         // buckle
  // belt pouches, all four quadrants so the back reads
  const pouch = (x, z, ry) => {
    add(pelvis, B(0.12, 0.14, 0.09), GLOSS, x, 0.09, z, 0, ry, 0);
    add(pelvis, B(0.12, 0.03, 0.10), GUN, x, 0.155, z, 0, ry, 0);
  };
  pouch(0.15, 0.19, 0); pouch(-0.15, 0.19, 0);
  pouch(0.15, -0.19, 0); pouch(-0.15, -0.19, 0);
  pouch(0.26, 0.00, Math.PI / 2); pouch(-0.26, 0.00, Math.PI / 2);

  // ---------------------------------------------------------------- legs
  const joints = {};
  const leg = (side, s) => {
    const up = grp(pelvis, s * 0.155, 0.00, 0);                 // hip pivot, world y = 1.00
    add(up, CAP(0.132, 0.20), SUIT, 0, -0.23);
    add(up, B(0.11, 0.30, 0.25), GUN, s * 0.115, -0.25, 0.01, 0, 0, -s * 0.07);  // outer thigh plate
    add(up, B(0.22, 0.20, 0.09), GLOSS, 0, -0.30, 0.115);       // front thigh plate
    if (s < 0) {                                                // holster rig on the right thigh
      add(up, B(0.10, 0.20, 0.13), GLOSS, s * 0.16, -0.34, 0.02);
      add(up, B(0.11, 0.04, 0.14), GUN, s * 0.16, -0.24, 0.02);
    }

    const lo = grp(up, 0, -0.44, 0);                            // knee pivot, world y = 0.56
    add(lo, B(0.19, 0.12, 0.18), GLOSS, 0, -0.01, 0.03);        // knee cap
    add(lo, CAP(0.112, 0.20), SUIT, 0, -0.22);
    add(lo, B(0.17, 0.26, 0.10), GUN, 0, -0.20, 0.11);          // shin plate
    add(lo, B(0.13, 0.10, 0.07), GLOSS, 0, -0.34, 0.12);

    const ft = grp(lo, 0, -0.44, 0);                            // ankle, world y = 0.12
    add(ft, B(0.23, 0.20, 0.26), GLOSS, 0, 0.02, -0.01);        // boot shaft
    add(ft, B(0.25, 0.11, 0.36), GLOSS, 0, -0.055, 0.05);       // boot body
    add(ft, B(0.27, 0.05, 0.40), SUIT, 0, -0.095, 0.06);        // sole -> world y = 0
    add(ft, B(0.23, 0.06, 0.10), GUN, 0, -0.035, 0.21);         // toe cap
    add(ft, B(0.24, 0.04, 0.24), GUN, 0, 0.09, 0.00);           // ankle strap

    joints[side + 'UpperLeg'] = up;
    joints[side + 'LowerLeg'] = lo;
    joints[side + 'Foot'] = ft;
  };
  leg('left', 1); leg('right', -1);

  // ---------------------------------------------------------------- torso
  const torso = grp(pelvis, 0, 0.16, 0);                        // spine pivot, world y = 1.16
  add(torso, B(0.44, 0.20, 0.32), SUIT, 0, 0.08);               // abdomen
  add(torso, B(0.53, 0.30, 0.37), SUIT, 0, 0.30);               // chest
  add(torso, B(0.60, 0.12, 0.35), SUIT, 0, 0.46);               // shoulder yoke
  add(torso, B(0.56, 0.06, 0.33), GLOSS, 0, 0.525);             // yoke cap

  // shirt, tie, lapels — the corporate read
  add(torso, B(0.17, 0.24, 0.05), SHIRT, 0, 0.40, 0.180);
  add(torso, B(0.09, 0.07, 0.05), SHIRT, 0.07, 0.505, 0.155, 0, 0, -0.5);
  add(torso, B(0.09, 0.07, 0.05), SHIRT, -0.07, 0.505, 0.155, 0, 0, 0.5);
  add(torso, B(0.05, 0.05, 0.04), GLOSS, 0, 0.475, 0.205);      // tie knot
  add(torso, B(0.06, 0.20, 0.03), GLOSS, 0, 0.365, 0.208);      // tie blade
  add(torso, B(0.13, 0.27, 0.05), GLOSS, 0.13, 0.37, 0.180, 0, 0, -0.16);
  add(torso, B(0.13, 0.27, 0.05), GLOSS, -0.13, 0.37, 0.180, 0, 0, 0.16);

  // harness: two straps over the chest and their mirror on the back
  for (const s of [1, -1]) {
    add(torso, B(0.055, 0.42, 0.03), GLOSS, s * 0.155, 0.34, 0.190, 0, 0, s * 0.24);
    add(torso, B(0.055, 0.42, 0.03), GLOSS, s * 0.155, 0.34, -0.190, 0, 0, -s * 0.24);
    add(torso, B(0.05, 0.10, 0.36), GLOSS, s * 0.185, 0.50, 0.00);   // strap over the shoulder
    add(torso, B(0.07, 0.05, 0.04), GUN, s * 0.155, 0.24, 0.195);    // strap clip
  }
  add(torso, B(0.34, 0.05, 0.03), GLOSS, 0, 0.22, 0.195);       // chest strap

  // blank emblem plate on the back — art comes from a texture, never geometry
  add(torso, B(0.28, 0.32, 0.03), GLOSS, 0, 0.34, -0.195);
  add(torso, B(0.22, 0.26, 0.02), GUN, 0, 0.34, -0.212);
  add(torso, B(0.44, 0.07, 0.04), GLOSS, 0, 0.11, -0.175);      // lower back rig

  // ---------------------------------------------------------------- arms
  const arm = (side, s) => {
    const up = grp(torso, s * 0.255, 0.44, 0);                  // shoulder pivot, world y = 1.60
    // pauldron
    add(up, B(0.22, 0.21, 0.31), GLOSS, s * 0.065, 0.02, 0, 0, 0, -s * 0.13);
    add(up, B(0.20, 0.05, 0.29), GUN, s * 0.085, -0.10, 0, 0, 0, -s * 0.13);
    add(up, B(0.17, 0.07, 0.27), GLOSS, s * 0.045, 0.125, 0, 0, 0, -s * 0.13);
    // blank shoulder plate, the emblem's home
    add(up, B(0.02, 0.13, 0.15), GUN, s * 0.175, 0.02, 0.01);
    add(up, CAP(0.098, 0.18), SUIT, 0, -0.19);
    add(up, B(0.13, 0.13, 0.19), GLOSS, 0, -0.30, 0.00);        // upper-arm cuff

    const lo = grp(up, 0, -0.36, 0);                            // elbow, world y = 1.24
    add(lo, CAP(0.088, 0.16), SUIT, 0, -0.17);
    add(lo, B(0.17, 0.24, 0.18), GUN, 0, -0.16, 0.01);          // forearm bracer
    add(lo, B(0.13, 0.05, 0.14), GLOSS, 0, -0.02, 0.01);        // elbow cap
    add(lo, B(0.045, 0.03, 0.03), GLOW, s * 0.09, -0.24, 0.05); // bracer telltale

    const hd = grp(lo, 0, -0.34, 0);                            // wrist, world y = 0.90
    add(hd, B(0.105, 0.15, 0.135), GLOSS, 0, -0.075, 0.01);     // glove
    add(hd, B(0.05, 0.09, 0.06), GLOSS, -s * 0.06, -0.045, 0.04, 0, 0, s * 0.35);
    add(hd, B(0.11, 0.05, 0.14), GUN, 0, 0.005, 0.01);          // gauntlet cuff

    joints[side + 'UpperArm'] = up;
    joints[side + 'LowerArm'] = lo;
    joints[side + 'Hand'] = hd;
  };
  arm('left', 1); arm('right', -1);

  // ---------------------------------------------------------------- head
  const head = grp(torso, 0, 0.50, 0);                          // neck pivot, world y = 1.66
  add(head, CYL(0.085, 0.095, 0.13, 10), SUIT, 0, 0.035);
  add(head, B(0.215, 0.10, 0.23), GLOSS, 0, 0.125, -0.005);     // jaw block
  add(head, B(0.235, 0.16, 0.265), GLOSS, 0, 0.235, -0.005);    // skull block
  add(head, B(0.20, 0.06, 0.225), GLOSS, 0, 0.360, -0.01);      // crown -> world y = 2.05
  add(head, B(0.185, 0.24, 0.06), GLOSS, 0, 0.225, 0.130, -0.13); // angled face plate
  add(head, B(0.15, 0.06, 0.05), GLOSS, 0, 0.100, 0.120, 0.35);   // chin bevel
  add(head, CYL(0.048, 0.048, 0.035, 8), GUN, 0.118, 0.215, -0.01, 0, 0, Math.PI / 2);
  add(head, CYL(0.048, 0.048, 0.035, 8), GUN, -0.118, 0.215, -0.01, 0, 0, Math.PI / 2);
  add(head, B(0.09, 0.05, 0.14), GUN, 0, 0.315, -0.135);        // nape fitting

  // the visor bar: its own mesh so the game can flare it on a wind-up
  const visor = add(head, B(0.168, 0.038, 0.022), GLOW, 0, 0.262, 0.163, -0.13);
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
