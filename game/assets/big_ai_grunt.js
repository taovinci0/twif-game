// Big AI grunt — corporate enforcer, 2.05 m. Canon height, deliberately
// imposing beside the 1.65 m player.
//
// Chosen from three candidates by looking at the verifier sheet. The primitive
// assembly held the silhouette that matters: separate pauldrons with a real gap
// between plate and arm, a readable suit-and-tie chest and a blank back plate
// that still reads from behind. The swept-profile build inflated — bevelled
// extrusions fused the arms into the torso and the whole figure went doughy —
// and the faceted-carapace reading grew a pointed crown and sloped shoulders
// that read as a knight, not an office enforcer.
//
// Refined from the candidate: the boxy "camera head" became a smooth gloss dome
// with an angled face plate and cheek wedges, the side pods stopped reading as
// lenses, the boots lost their protruding sole plank, and the legs were
// thickened to match the suit's bulk.
//
// No glyphs anywhere. The shoulder plates and the back plate are blank
// geometry; their art is applied later as a texture by the game layer.
//
// Articulated. Load with { keepHierarchy: true } and drive g.userData.joints:
//   head, torso, pelvis,
//   left/rightUpperArm, left/rightLowerArm, left/rightHand,
//   left/rightUpperLeg, left/rightLowerLeg, left/rightFoot
// Every joint is a Group placed AT the joint with the geometry offset inside it.
// g.userData.visor is the visor bar's own mesh, so the game can flare it on a
// wind-up without touching the rest of the helmet.
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
  // Root of the figure; the hip joints hang off it.
  const pelvis = grp(g, 0, 1.00, 0);
  add(pelvis, B(0.47, 0.26, 0.35), SUIT, 0, 0.04);
  add(pelvis, B(0.43, 0.14, 0.34), GLOSS, 0, -0.13);            // seat / trouser break
  add(pelvis, B(0.51, 0.10, 0.37), GLOSS, 0, 0.17);             // utility belt
  add(pelvis, B(0.11, 0.09, 0.04), GUN, 0, 0.17, 0.195);        // buckle
  const pouch = (x, z, ry) => {
    add(pelvis, B(0.12, 0.14, 0.09), GLOSS, x, 0.09, z, 0, ry, 0);
    add(pelvis, B(0.12, 0.03, 0.10), GUN, x, 0.155, z, 0, ry, 0);
  };
  pouch(0.15, 0.195, 0); pouch(-0.15, 0.195, 0);
  pouch(0.15, -0.195, 0); pouch(-0.15, -0.195, 0);
  pouch(0.265, 0.00, Math.PI / 2); pouch(-0.265, 0.00, Math.PI / 2);

  // ---------------------------------------------------------------- legs
  const joints = {};
  const leg = (side, s) => {
    const up = grp(pelvis, s * 0.160, 0.00, 0);                 // hip pivot, world y = 1.00
    add(up, CAP(0.145, 0.18), SUIT, 0, -0.235);
    add(up, B(0.10, 0.30, 0.26), GUN, s * 0.128, -0.25, 0.01, 0, 0, -s * 0.07);   // outer thigh plate
    add(up, B(0.23, 0.20, 0.09), GLOSS, 0, -0.30, 0.125);       // front thigh plate
    if (s < 0) {                                                // holster rig, right thigh
      add(up, B(0.10, 0.20, 0.13), GLOSS, s * 0.175, -0.34, 0.02);
      add(up, B(0.11, 0.04, 0.14), GUN, s * 0.175, -0.24, 0.02);
    }

    const lo = grp(up, 0, -0.44, 0);                            // knee pivot, world y = 0.56
    add(lo, B(0.20, 0.13, 0.19), GLOSS, 0, -0.015, 0.03);       // knee cap
    add(lo, CAP(0.122, 0.19), SUIT, 0, -0.22);
    add(lo, B(0.18, 0.26, 0.10), GUN, 0, -0.20, 0.115);         // shin plate
    add(lo, B(0.14, 0.10, 0.07), GLOSS, 0, -0.345, 0.125);

    const ft = grp(lo, 0, -0.44, 0);                            // ankle, world y = 0.12
    add(ft, B(0.235, 0.21, 0.265), GLOSS, 0, 0.02, -0.01);      // boot shaft
    add(ft, B(0.245, 0.12, 0.345), GLOSS, 0, -0.050, 0.045);    // boot body
    add(ft, B(0.25, 0.05, 0.365), SUIT, 0, -0.095, 0.050);      // sole -> world y = 0
    add(ft, B(0.225, 0.07, 0.09), GUN, 0, -0.040, 0.195);       // toe cap
    add(ft, B(0.245, 0.04, 0.245), GUN, 0, 0.09, 0.00);         // ankle strap

    joints[side + 'UpperLeg'] = up;
    joints[side + 'LowerLeg'] = lo;
    joints[side + 'Foot'] = ft;
  };
  leg('left', 1); leg('right', -1);

  // ---------------------------------------------------------------- torso
  const torso = grp(pelvis, 0, 0.16, 0);                        // spine pivot, world y = 1.16
  add(torso, B(0.45, 0.20, 0.33), SUIT, 0, 0.08);               // abdomen
  add(torso, B(0.54, 0.30, 0.38), SUIT, 0, 0.30);               // chest
  add(torso, B(0.60, 0.13, 0.36), SUIT, 0, 0.465);              // shoulder yoke
  add(torso, B(0.50, 0.05, 0.33), GLOSS, 0, 0.520);             // yoke cap

  // shirt, tie, lapels — the corporate read
  add(torso, B(0.17, 0.24, 0.05), SHIRT, 0, 0.40, 0.185);
  add(torso, B(0.09, 0.07, 0.05), SHIRT, 0.07, 0.505, 0.160, 0, 0, -0.5);
  add(torso, B(0.09, 0.07, 0.05), SHIRT, -0.07, 0.505, 0.160, 0, 0, 0.5);
  add(torso, B(0.05, 0.05, 0.04), GLOSS, 0, 0.475, 0.210);      // tie knot
  add(torso, B(0.06, 0.20, 0.03), GLOSS, 0, 0.365, 0.213);      // tie blade
  add(torso, B(0.13, 0.27, 0.05), GLOSS, 0.13, 0.37, 0.185, 0, 0, -0.16);
  add(torso, B(0.13, 0.27, 0.05), GLOSS, -0.13, 0.37, 0.185, 0, 0, 0.16);

  // harness: straps over the chest, mirrored on the back
  for (const s of [1, -1]) {
    add(torso, B(0.055, 0.42, 0.03), GLOSS, s * 0.155, 0.34, 0.195, 0, 0, s * 0.24);
    add(torso, B(0.055, 0.42, 0.03), GLOSS, s * 0.155, 0.34, -0.195, 0, 0, -s * 0.24);
    add(torso, B(0.05, 0.10, 0.37), GLOSS, s * 0.190, 0.505, 0.00);  // strap over the shoulder
    add(torso, B(0.07, 0.05, 0.04), GUN, s * 0.155, 0.24, 0.200);    // strap clip
  }
  add(torso, B(0.34, 0.05, 0.03), GLOSS, 0, 0.22, 0.200);       // chest strap

  // blank emblem plate on the back — the art is a texture, never geometry
  add(torso, B(0.28, 0.32, 0.03), GLOSS, 0, 0.34, -0.200);
  add(torso, B(0.22, 0.26, 0.02), GUN, 0, 0.34, -0.217);
  add(torso, B(0.45, 0.07, 0.04), GLOSS, 0, 0.11, -0.180);      // lower back rig

  // ---------------------------------------------------------------- arms
  const arm = (side, s) => {
    const up = grp(torso, s * 0.255, 0.44, 0);                  // shoulder pivot, world y = 1.60
    add(up, B(0.175, 0.15, 0.21), GLOSS, 0, -0.045, 0);         // deltoid cap under the plate
    add(up, B(0.22, 0.21, 0.31), GLOSS, s * 0.065, 0.02, 0, 0, 0, -s * 0.13);
    add(up, B(0.20, 0.05, 0.29), GUN, s * 0.085, -0.10, 0, 0, 0, -s * 0.13);
    add(up, B(0.17, 0.07, 0.27), GLOSS, s * 0.045, 0.125, 0, 0, 0, -s * 0.13);
    add(up, B(0.02, 0.13, 0.15), GUN, s * 0.175, 0.02, 0.01);   // blank shoulder plate
    add(up, CAP(0.102, 0.17), SUIT, 0, -0.19);
    add(up, B(0.135, 0.13, 0.195), GLOSS, 0, -0.30, 0.00);      // upper-arm cuff

    const lo = grp(up, 0, -0.36, 0);                            // elbow, world y = 1.24
    add(lo, CAP(0.090, 0.16), SUIT, 0, -0.17);
    add(lo, B(0.175, 0.24, 0.185), GUN, 0, -0.16, 0.01);        // forearm bracer
    add(lo, B(0.135, 0.05, 0.145), GLOSS, 0, -0.02, 0.01);      // elbow cap
    add(lo, B(0.045, 0.03, 0.03), GLOW, s * 0.093, -0.24, 0.05); // bracer telltale

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
  // Smooth gloss shell, no face. Angular plate over a rounded back.
  const head = grp(torso, 0, 0.50, 0);                          // neck pivot, world y = 1.66
  add(head, CYL(0.088, 0.098, 0.13, 10), SUIT, 0, 0.035);
  add(head, B(0.205, 0.10, 0.215), GLOSS, 0, 0.125, -0.005);    // jaw block
  const dome = add(head, new THREE.SphereGeometry(0.125, 10, 7), GLOSS, 0, 0.258, -0.004);
  dome.scale.set(0.94, 1.055, 1.05);                            // -> crown at world y = 2.05
  add(head, B(0.185, 0.235, 0.055), GLOSS, 0, 0.225, 0.120, -0.13);   // angled face plate
  add(head, B(0.045, 0.145, 0.10), GLOSS, 0.095, 0.205, 0.070, 0, -0.55, 0);  // cheek wedge
  add(head, B(0.045, 0.145, 0.10), GLOSS, -0.095, 0.205, 0.070, 0, 0.55, 0);
  add(head, B(0.15, 0.06, 0.05), GLOSS, 0, 0.100, 0.115, 0.35); // chin bevel
  add(head, B(0.030, 0.075, 0.105), GUN, 0.120, 0.215, -0.015);  // side pods, flat not round
  add(head, B(0.030, 0.075, 0.105), GUN, -0.120, 0.215, -0.015);
  add(head, B(0.075, 0.045, 0.08), GUN, 0, 0.168, -0.110);      // nape fitting

  // the visor bar: its own mesh so the game can flare it on a wind-up
  const visor = add(head, B(0.172, 0.040, 0.022), GLOW, 0, 0.262, 0.150, -0.13);
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
