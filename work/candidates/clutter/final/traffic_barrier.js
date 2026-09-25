// Traffic barrier — 1.6 x 1.0 x 0.5 m, placed in numbers along the street.
//
// Chosen from three candidates by looking at the verifier sheet. Both of the
// others built the hazard banding from boxes rotated 45 degrees, which cannot
// reach the ends of the panel without hanging off it: their bands came out as
// short lozenges floating in a white field and read as decoration rather than
// as a barrier. Here each band is a parallelogram clipped to the panel and then
// swept, so the banding runs edge to edge and reads at any distance.
//
// The trestle is one A-shaped outline with two voids, swept sideways, so the
// end views are as modelled as the faces. Banding is on both faces. No glyphs.
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
  const poly = (pts) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    return s;
  };
  // no bevel: bevelSize grows a profile outward and drops it below its own base
  const ex = (shape, depth) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 });

  // --- trestle profile, drawn in (depth, height) and swept along x
  const apex = 0.87, botOut = 0.235, topOut = 0.090, legT = 0.075;
  const out = (y) => botOut - (botOut - topOut) * (y / apex);
  const hi = (y) => out(y) - legT;
  const frame = poly([[-botOut, 0], [botOut, 0], [topOut, apex], [-topOut, apex]]);
  const void_ = (ya, yb) => {
    const h = new THREE.Path();
    h.moveTo(-hi(ya), ya); h.lineTo(hi(ya), ya);
    h.lineTo(hi(yb), yb); h.lineTo(-hi(yb), yb); h.closePath();
    return h;
  };
  frame.holes.push(void_(0.07, 0.46), void_(0.54, 0.73));
  const frameGeo = ex(frame, 0.085);
  for (const sx of [-1, 1]) {
    add(frameGeo, steel, sx * 0.66 - 0.0425, 0, 0, 0, Math.PI / 2);
    add(B(0.09, 0.07, 0.24), steel, sx * 0.66, 0.505, 0);            // crossbar
    add(B(0.11, 0.09, 0.30), steel, sx * 0.66, 0.700, 0);            // panel cleat
    for (const sz of [-1, 1]) {
      add(B(0.20, 0.045, 0.14), dark, sx * 0.66, 0.022, sz * 0.18);  // weighted pad
      add(B(0.11, 0.028, 0.08), gold, sx * 0.66, 0.056, sz * 0.18);
    }
  }

  // --- panel and lower rail
  const y0 = 0.56, y1 = 0.84;
  add(B(1.60, y1 - y0, 0.07), cream, 0, (y0 + y1) / 2, 0);
  add(B(1.52, 0.13, 0.055), cream, 0, 0.42, 0);

  // --- diagonal bands: parallelograms clipped to the panel ends, then swept.
  // Clipping is why these are shapes and not rotated boxes: a rotated box hangs
  // off the end of the panel and has to be hidden behind a stile.
  const clipX = (pts, lo, hiX) => {
    const pass = (src, keep, at) => {
      const outp = [];
      for (let i = 0; i < src.length; i++) {
        const a = src[i], b = src[(i + 1) % src.length];
        const ka = keep(a[0]), kb = keep(b[0]);
        if (ka) outp.push(a);
        if (ka !== kb) {
          const t = (at - a[0]) / (b[0] - a[0]);
          outp.push([at, a[1] + (b[1] - a[1]) * t]);
        }
      }
      return outp;
    };
    return pass(pass(pts, (x) => x >= lo, lo), (x) => x <= hiX, hiX);
  };
  const band = (yA, yB, w, pitch, from, zf, zb) => {
    const h = yB - yA;
    for (let a = from; a <= 0.80; a += pitch) {
      const cut = clipX([[a, yA], [a + w, yA], [a + w + h, yB], [a + h, yB]], -0.80, 0.80);
      if (cut.length < 3) continue;
      const geo = ex(poly(cut), 0.022);
      add(geo, red, 0, 0, zf);
      add(geo, red, 0, 0, zb);
    }
  };
  band(y0, y1, 0.17, 0.34, -1.10, 0.036, -0.058);
  // the lower rail gets the same banding at half pitch rather than a plain
  // stripe, so the two rails read as one object from a car's distance
  band(0.355, 0.485, 0.09, 0.30, -1.00, 0.028, -0.050);

  // --- squat lamp at one end
  add(B(0.15, 0.05, 0.15), steel, 0.58, 0.865, 0);
  add(new THREE.CylinderGeometry(0.062, 0.072, 0.075, 8), dark, 0.58, 0.925, 0);
  add(new THREE.CylinderGeometry(0.058, 0.058, 0.045, 8), glass, 0.58, 0.980, 0);
  add(new THREE.CylinderGeometry(0.066, 0.040, 0.030, 8), steel, 0.58, 1.010, 0);

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
