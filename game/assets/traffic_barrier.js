// barrier_b — swept profiles. The trestle is one A-shaped outline with a hole,
// swept sideways; the diagonal bands are parallelograms clipped to the panel and
// swept forward, so nothing overhangs and nothing is faked with a rotation.
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
  // outer silhouette only; the A comes from the two voids cut out of it
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
    // crossbar and weighted foot pads
    add(new THREE.BoxGeometry(0.09, 0.07, 0.24), steel, sx * 0.66, 0.505, 0);
    for (const sz of [-1, 1]) {
      add(new THREE.BoxGeometry(0.20, 0.045, 0.14), dark, sx * 0.66, 0.022, sz * 0.18);
      add(new THREE.BoxGeometry(0.11, 0.028, 0.08), gold, sx * 0.66, 0.056, sz * 0.18);
    }
  }

  // --- panel and lower rail
  const y0 = 0.56, y1 = 0.84;
  add(new THREE.BoxGeometry(1.60, y1 - y0, 0.07), cream, 0, (y0 + y1) / 2, 0);
  add(new THREE.BoxGeometry(1.52, 0.11, 0.055), cream, 0, 0.42, 0);

  // --- diagonal bands: parallelograms clipped to the panel ends, then swept.
  // Clipping is why these are shapes and not rotated boxes: a rotated box hangs
  // off the end of the panel and has to be hidden behind a stile.
  const clipX = (pts, lo, hiX) => {
    const pass = (src, keep, at) => {
      const out = [];
      for (let i = 0; i < src.length; i++) {
        const a = src[i], b = src[(i + 1) % src.length];
        const ka = keep(a[0]), kb = keep(b[0]);
        if (ka) out.push(a);
        if (ka !== kb) {
          const t = (at - a[0]) / (b[0] - a[0]);
          out.push([at, a[1] + (b[1] - a[1]) * t]);
        }
      }
      return out;
    };
    return pass(pass(pts, (x) => x >= lo, lo), (x) => x <= hiX, hiX);
  };
  const h = y1 - y0, bw = 0.17, pitch = 0.34;
  for (let a = -1.10; a <= 0.80; a += pitch) {
    const quad = [[a, y0], [a + bw, y0], [a + bw + h, y1], [a + h, y1]];
    const cut = clipX(quad, -0.80, 0.80);
    if (cut.length < 3) continue;
    const gGeo = ex(poly(cut), 0.022);
    add(gGeo, red, 0, 0, 0.036);
    add(gGeo, red, 0, 0, -0.058);
  }
  add(new THREE.BoxGeometry(1.52, 0.05, 0.022), red, 0, 0.42, 0.039);
  add(new THREE.BoxGeometry(1.52, 0.05, 0.022), red, 0, 0.42, -0.039);

  // --- squat lamp at one end
  add(new THREE.BoxGeometry(0.15, 0.05, 0.15), steel, 0.58, 0.868, 0);
  add(new THREE.CylinderGeometry(0.062, 0.072, 0.075, 8), dark, 0.58, 0.930, 0);
  add(new THREE.CylinderGeometry(0.058, 0.058, 0.045, 8), glass, 0.58, 0.988, 0);
  add(new THREE.CylinderGeometry(0.066, 0.040, 0.030, 8), steel, 0.58, 1.020, 0);

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
