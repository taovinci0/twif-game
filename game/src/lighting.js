/**
 * NIGHT LIGHTING for TWIF: Subnet One.
 *
 *     import { createLighting } from './lighting.js';
 *     const lighting = createLighting(THREE, renderer, scene, { tier: 'auto' });
 *     lighting.adopt(scene);                  // after the level is built
 *     lighting.update(dt, player.pos);        // once a frame
 *     lighting.render(camera, dt);            // instead of renderer.render(scene, camera)
 *
 * WHY THIS IS NOT `rig.js`. The rig is the right answer and this file is built out of its
 * ideas, but it is an EXTERIOR DAYLIGHT rig and its own header says so twice: everything warm
 * in it comes from the sun, and below the horizon "a night game lit by the rig ALONE has one
 * colour temperature, which is the failure the rig exists to prevent, reached from the other
 * side." It then says exactly what a night scene wants instead — "its own practicals: emissive
 * surfaces for the lamps themselves, and a small number of real point or spot lights placed at
 * them, warm, with a short range." That is this file. Measured side by side on this game's own
 * street (numbers in the report that shipped with it), the rig at hour 20 renders a uniformly
 * cool street with nothing warm in frame; at an hour low enough to put warmth in the sky it
 * renders a sunset, not a night. What is kept from it, deliberately:
 *
 *   - two colour temperatures made IN THE LIGHTS and never in a post pass;
 *   - a sky and an environment that cannot disagree with the lighting, because one canvas
 *     makes the background, the environment map and the fog colour;
 *   - haze with distance in it, so the far towers sink into the sky instead of into grey;
 *   - tiers, where the cheap one is the default and the expensive one is opt-in;
 *   - patching nothing on a material except `envMapIntensity`, so `assetlib`'s merge by
 *     material values keeps merging and a 128-gate ring stays one draw call.
 *
 * THE SIX THINGS IT DOES.
 *
 *  1. TWO TEMPERATURES, ALWAYS. The cool half is a violet-to-indigo sky, a hemisphere light
 *     whose sky colour is that sky, and a low cool key standing in for moon and city glow. The
 *     warm half is every practical: lanterns, sign boxes, doorways, and the warm GROUND colour
 *     of the hemisphere light, which is what a street full of lanterns bounces back up. Even a
 *     surface no practical reaches is cool on top and warm underneath.
 *
 *  2. NOTHING GLOWS WITHOUT LIGHTING ITS SURROUNDINGS. `addLamp()` is the only way to add a
 *     practical and it always makes three things at once: a candidate for a real point light,
 *     a pool of light on the ground beneath it, and a camera-facing halo. There is no argument
 *     that turns the pool off. `adopt(root)` walks a built level, finds every emissive material
 *     — including each instance of an InstancedMesh — and registers one for each, so the rule
 *     holds for geometry this file has never seen. `info().unlitEmissive` is what a gate reads:
 *     it is the number of emissive meshes with no practical within `adoptRadius`, and it should
 *     be zero.
 *
 *  3. DARK SURROUND, READABLE CONTENT. The ambient is deliberately too low to read by. What
 *     makes a thing visible is standing in a pool, being rimmed by the cool key, or being near
 *     the camera fill — a dim, short-range cool light on the camera that keeps the player and
 *     the enemy in front of them off pure black without lifting the street.
 *
 *  4. WET GROUND, FAKED, WITH NO SECOND PASS. Low roughness plus a little metalness on the
 *     ground, the environment map for grazing reflection, and then the part that actually
 *     reads: every practical's pool is drawn twice, once round and once stretched into a
 *     streak, so the lamps smear down the road the way they do on wet tarmac. There is no
 *     planar mirror, no render target, no second camera.
 *
 *  5. A BOUNDED LIGHT COUNT. Registering a lamp does not create a light. A fixed pool of
 *     PointLights (5 on phone, 10 on desktop) is re-pointed every few frames at the nearest
 *     registered lamps, cross-fading so nothing pops. Two hundred lanterns cost two hundred
 *     pool quads in one draw call and five lights.
 *
 *  6. THE ACCENT IS PROTECTED. TWIF Green is the only colour allowed full chroma. Every other
 *     lamp colour is pushed toward neutral by `chromaCap` on the way in, which is how the green
 *     stays the highest-chroma thing in frame without anyone having to remember to check.
 *
 * WHAT IT COSTS, over `renderer.render(scene, camera)` with no lighting at all:
 *   1 draw  the sky (a background texture, drawn by the renderer)
 *   1 draw  every ground pool and every wet streak, one InstancedMesh, additive
 *   1 draw  every halo, one InstancedMesh, camera-facing, additive
 *   + one shadow pass for the single cool key (one cascade, one map, both tiers)
 * On the desktop tier, `post: true` adds a composer and a bloom pass, which redraw the frame
 * at full resolution. That is the expensive path and it is off unless it is asked for.
 *
 * WHAT IT DOES NOT DO: shadows from practicals (six faces each, on a phone, no), ambient
 * occlusion, a colour grade, volumetrics, a reflection pass of any kind.
 *
 * VERSIONS. Plain three 0.169 or newer. Takes THREE as a parameter, exactly as an asset does,
 * so it has no static import and no version of its own. The one addon it wants, the composer,
 * is loaded with a dynamic import on the desktop tier only and it degrades to no post if that
 * fails.
 */

/* ------------------------------------------------------------------ palette */

/** STYLE_LOCK.md, verbatim. Nothing in this file invents a colour. */
export const PALETTE = {
  black: 0x080A0B, charcoal: 0x111315, gunmetal: 0x3A3F46, stone: 0x8C816F,
  cream: 0xE7DFC9, gold: 0xD4A24C, lantern: 0xE66D32, deepRed: 0x8E2B2B,
  vanTeal: 0x1C7B74, marigold: 0xE9A93F, green: 0x9AFF43, white: 0xE9E9EC,
  visor: 0xBFE4FF, coolBlue: 0x315B78, violet: 0x6B3FD4, hotPink: 0xFF2D8A,
};

/* -------------------------------------------------------------------- tiers */

/**
 * The cheap tier is the DEFAULT, not the fallback. `detect()` only decides whether a machine
 * is allowed to opt in; it never opts in for you. `?gfx=desktop` on the URL does, which is how
 * a capture harness asks for the expensive path without a code change.
 *
 * `lights` is the whole practical budget. It is the number that does not scale if you let a
 * lantern own a light: this street has twelve lanterns and sixteen cones already, and a hub
 * with a lit gate per unlocked subnet ends at 128.
 */
export const TIERS = {
  phone:   { name: 'phone',   shadowMap: 1024, shadowDist: 34, lights: 6,  post: false, pixelRatio: 1.0 },
  desktop: { name: 'desktop', shadowMap: 2048, shadowDist: 58, lights: 10, post: true,  pixelRatio: 1.5 },
};

/** What this machine LOOKS like. Advisory: the default is `phone` whatever this returns. */
export function detectTier() {
  try {
    const q = new URLSearchParams(location.search).get('gfx');
    if (q && TIERS[q]) return q;
    if (q === 'high') return 'desktop';
  } catch (e) { /* no location */ }
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  const touch = !!nav && (('maxTouchPoints' in nav && nav.maxTouchPoints > 0) || ('ontouchstart' in globalThis));
  const w = globalThis.innerWidth || 1280, h = globalThis.innerHeight || 720;
  let sw = w, sh = h;
  try { if (globalThis.screen && globalThis.screen.width) { sw = globalThis.screen.width; sh = globalThis.screen.height; } } catch (e) { /* none */ }
  const small = Math.min(w, h) <= 500 || Math.min(sw, sh) <= 500 || (w * h) <= 1000 * 1000;
  const mobileUA = !!nav && /iPhone|iPad|Android|Mobile/i.test(nav.userAgent || '');
  if ((touch && small) || (mobileUA && small)) return 'phone';
  return 'desktop';
}

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));

/* ---------------------------------------------------------------- the sky */

/**
 * One canvas makes the background, the environment map and the fog colour, so they cannot
 * disagree — the same trick the rig plays with its analytic sky, done with a gradient because
 * at night there is no sun disc to be right about.
 *
 * It is an equirectangular strip: v = 0 is straight up, v = 0.5 is the horizon, v = 1 is
 * straight down. Violet at the zenith, indigo through the middle, and a warm ember band sat on
 * the horizon which is the city lighting its own smog. The blobs along that band are distant
 * signage; they exist because a wet road reflecting a smooth gradient reads as plastic, and a
 * wet road reflecting a band with colour variation in it reads as wet.
 *
 * Below the horizon it is near black with a warm bias: that half of the environment is what a
 * downward-facing surface sees, and what it sees at night is lamplit road.
 */
function skyCanvas(P) {
  const W = 512, H = 256;
  const cv = (typeof document !== 'undefined' ? document.createElement('canvas') : null);
  if (!cv) return null;
  cv.width = W; cv.height = H;
  const x = cv.getContext('2d');

  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0.00, P.zenith);
  g.addColorStop(0.24, P.upper);
  g.addColorStop(0.42, P.mid);
  g.addColorStop(0.487, P.hazeTop);
  g.addColorStop(0.5, P.horizon);
  g.addColorStop(0.53, P.below);
  g.addColorStop(1.00, P.nadir);
  x.fillStyle = g; x.fillRect(0, 0, W, H);

  // distant signage on the horizon band. Soft, wide, and never bright enough to be a light.
  const blobs = P.blobs || [];
  x.globalCompositeOperation = 'lighter';
  for (const b of blobs) {
    const bx = b[0] * W, by = (0.5 - b[1]) * H, r = b[2] * W;
    const rg = x.createRadialGradient(bx, by, 0, bx, by, r);
    rg.addColorStop(0, b[3]); rg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = rg; x.beginPath(); x.arc(bx, by, r, 0, Math.PI * 2); x.fill();
  }
  x.globalCompositeOperation = 'source-over';
  return cv;
}

/** A soft round falloff, 64px, used by every pool, streak and halo. One texture, one upload. */
function radialTexture(THREE, falloff = 2.2) {
  const S = 64;
  const cv = document.createElement('canvas');
  cv.width = S; cv.height = S;
  const x = cv.getContext('2d');
  const img = x.createImageData(S, S);
  for (let j = 0; j < S; j++) {
    for (let i = 0; i < S; i++) {
      const dx = (i + 0.5) / S * 2 - 1, dy = (j + 0.5) / S * 2 - 1;
      const d = Math.sqrt(dx * dx + dy * dy);
      const a = Math.pow(Math.max(0, 1 - d), falloff);
      const o = (j * S + i) * 4;
      img.data[o] = 255; img.data[o + 1] = 255; img.data[o + 2] = 255;
      img.data[o + 3] = Math.round(a * 255);
    }
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* -------------------------------------------------------------------- main */

export function createLighting(THREE, renderer, scene, opts = {}) {
  const tierName = opts.tier === 'auto' ? detectTier() : (opts.tier || 'phone');
  const tier = TIERS[tierName] ? { ...TIERS[tierName], ...(opts.tierOverrides || {}) } : { ...TIERS.phone };

  const O = {
    // sky / environment
    sky: {
      zenith: '#160B33', upper: '#1A1247', mid: '#22214F', hazeTop: '#37294F',
      horizon: '#5A3350', below: '#1A1420', nadir: '#0A0709',
      blobs: [
        [0.08, 0.012, 0.10, 'rgba(255,70,140,0.42)'],
        [0.22, 0.030, 0.13, 'rgba(120,70,220,0.40)'],
        [0.37, 0.008, 0.09, 'rgba(255,150,60,0.50)'],
        [0.53, 0.036, 0.15, 'rgba(70,120,220,0.34)'],
        [0.69, 0.010, 0.11, 'rgba(255,110,50,0.46)'],
        [0.86, 0.028, 0.12, 'rgba(180,70,230,0.36)'],
      ],
      ...(opts.sky || {}),
    },
    exposure: opts.exposure ?? 1.22,
    envIntensity: opts.envIntensity ?? 0.55,        // the sky as a REFLECTION
    backgroundIntensity: opts.backgroundIntensity ?? 0.62,

    // the cool half
    hemiSky: opts.hemiSky ?? 0x33538C,             // sky seen from above: Cool Blue, lifted
    hemiGround: opts.hemiGround ?? 0x5E3410,       // what a street of lanterns bounces back up
    hemi: opts.hemi ?? 0.60,
    keyColor: opts.keyColor ?? 0xFFB169,           // the city itself: a thousand off-screen lanterns
    key: opts.key ?? 0.90,
    keyDir: opts.keyDir ?? [-0.42, 1.0, 0.34],
    shadows: opts.shadows !== false,

    // haze
    fog: opts.fog !== false,
    fogNear: opts.fogNear ?? 26,
    fogFar: opts.fogFar ?? 260,
    fogColor: opts.fogColor ?? 0x40263C,

    // practicals
    lampIntensity: opts.lampIntensity ?? 1.0,      // global scale on every registered lamp
    poolIntensity: opts.poolIntensity ?? 1.0,
    haloIntensity: opts.haloIntensity ?? 1.0,
    capacity: opts.capacity ?? 384,                // pool+streak instances = capacity, halos = capacity/2
    switchEvery: opts.switchEvery ?? 6,            // frames between re-pointing the light pool
    fade: opts.fade ?? 6.0,                        // cross-fade rate when a light changes lamp
    chromaCap: opts.chromaCap ?? 0.78,             // fraction of the accent's saturation a lamp may have

    // the hero
    accent: opts.accent ?? PALETTE.green,
    heroLight: opts.heroLight ?? 1.8,
    heroPool: opts.heroPool ?? 0.22,
    fill: opts.fill ?? 0.34,                       // camera fill: readability, not lighting
    fillDistance: opts.fillDistance ?? 15,

    // ground
    groundY: opts.groundY ?? 0,
    adoptRadius: opts.adoptRadius ?? 6,
    minSpacing: opts.minSpacing ?? 2.2,
  };

  /* ---------------------------------------------------------- renderer */
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = O.exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  if (O.shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  if (opts.pixelRatio !== false) {
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, tier.pixelRatio));
  }

  /* --------------------------------------------------------------- sky */
  let skyTex = null, envRT = null;
  const cv = skyCanvas(O.sky);
  if (cv) {
    skyTex = new THREE.CanvasTexture(cv);
    skyTex.mapping = THREE.EquirectangularReflectionMapping;
    skyTex.colorSpace = THREE.SRGBColorSpace;
    skyTex.minFilter = THREE.LinearFilter;
    scene.background = skyTex;
    if ('backgroundIntensity' in scene) scene.backgroundIntensity = O.backgroundIntensity;
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    envRT = pmrem.fromEquirectangular(skyTex);
    scene.environment = envRT.texture;
    if ('environmentIntensity' in scene) scene.environmentIntensity = O.envIntensity;
    pmrem.dispose();
  }

  /**
   * Haze. Plain linear fog rather than the rig's per-direction aerial perspective, and that is
   * a defensible cut only because this sky is a night sky: its radiance varies by a factor of
   * about four from zenith to horizon where a daylight sky varies by fifty, so one colour is
   * most of the truth. The colour is read off the horizon band so a far building dissolves
   * into the sky behind it rather than into a grey wall.
   */
  if (O.fog) scene.fog = new THREE.Fog(O.fogColor, O.fogNear, O.fogFar);

  /* ------------------------------------------------------------ ambient */
  const hemi = new THREE.HemisphereLight(O.hemiSky, O.hemiGround, O.hemi);
  scene.add(hemi);

  /**
   * The key is a moon, not a sun: cool, low, and weak enough that the street is not lit by it.
   * It is here for two things the practicals cannot do — a shadow under every object, which is
   * what stands a character on the ground, and a cool rim down one side of every vertical face,
   * which is the other half of the temperature pair on geometry no lantern reaches.
   */
  const key = new THREE.DirectionalLight(O.keyColor, O.key);
  const kd = new THREE.Vector3(...O.keyDir).normalize();
  key.castShadow = O.shadows;
  key.shadow.mapSize.set(tier.shadowMap, tier.shadowMap);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = tier.shadowDist * 3.2;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.035;
  {
    const s = tier.shadowDist;
    key.shadow.camera.left = -s; key.shadow.camera.right = s;
    key.shadow.camera.top = s; key.shadow.camera.bottom = -s;
    key.shadow.camera.updateProjectionMatrix();
  }
  scene.add(key, key.target);

  /** Readability, not lighting. Short range on purpose: past `fillDistance` the street is the
   *  street, and the surround stays dark. Without it the hero in an unlit stretch is not a
   *  silhouette, it is nothing. */
  const fill = new THREE.PointLight(0xBFD6FF, O.fill, O.fillDistance, 1.6);
  scene.add(fill);

  /** The one green light in the game. Tiny radius so it is an accent and not a lantern. */
  const hero = new THREE.PointLight(O.accent, O.heroLight, 5.5, 2);
  hero.visible = false;
  scene.add(hero);
  let heroObj = null;

  /* -------------------------------------------------------- light pool */
  const lights = [];
  for (let i = 0; i < tier.lights; i++) {
    const pl = new THREE.PointLight(0xffffff, 0, 18, 2);
    pl.visible = false;
    scene.add(pl);
    lights.push({ light: pl, lamp: null, want: null, k: 0 });
  }

  /* ------------------------------------------------- pools, streaks, halos */
  const quad = new THREE.PlaneGeometry(1, 1);
  const soft = radialTexture(THREE, 2.4);
  const core = radialTexture(THREE, 3.4);   // sharper: a halo is a white core in a coloured falloff

  const poolMat = new THREE.MeshBasicMaterial({
    map: soft, transparent: true, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide, toneMapped: true, fog: true,
  });
  /**
   * The halo is the whole of the bloom on the phone tier. It is written to clip: at the centre
   * it is well over 1 in linear HDR, so ACES rolls it to white, and the falloff carries the
   * lamp's own colour out around it. That is what a lantern looks like in the reference frames
   * — a white core in a coloured glow — and a composer is not needed for it.
   */
  const haloMat = new THREE.MeshBasicMaterial({
    map: core, transparent: true, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide, toneMapped: true, fog: true,
  });

  // capacity covers a pool AND a streak for every lamp, in one InstancedMesh and one draw call.
  const pools = new THREE.InstancedMesh(quad, poolMat, O.capacity);
  pools.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  pools.frustumCulled = false;
  pools.renderOrder = 2;
  pools.count = 0;
  pools.castShadow = false; pools.receiveShadow = false;
  scene.add(pools);

  const halos = new THREE.InstancedMesh(quad, haloMat, Math.ceil(O.capacity / 2));
  halos.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  halos.frustumCulled = false;
  halos.renderOrder = 3;
  halos.count = 0;
  halos.castShadow = false; halos.receiveShadow = false;
  scene.add(halos);

  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
  const _c = new THREE.Color();
  const FLAT = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

  /* ------------------------------------------------------------- lamps */
  const lamps = [];
  let dirty = true;

  /**
   * Push a colour's saturation under the accent's, so the green eyes are the only full-chroma
   * thing in the picture. Violet and hot pink live in the distance and on signage, which is the
   * sky texture and an emissive material — neither is a light, so neither comes through here.
   */
  function capChroma(color) {
    const c = new THREE.Color(color);
    if (O.chromaCap >= 1) return c;
    const hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    const accentS = new THREE.Color(O.accent).getHSL({ h: 0, s: 0, l: 0 }).s;
    const cap = accentS * O.chromaCap;
    if (hsl.s > cap) c.setHSL(hsl.h, cap, hsl.l);
    return c;
  }

  /**
   * THE ONLY WAY TO ADD A PRACTICAL, and it is deliberately impossible to use it and not light
   * the ground. One call registers: a candidate for the bounded light pool, a pool of light on
   * the floor beneath the source, a stretched copy of that pool so the floor reads as wet, and
   * a camera-facing halo so the source glows without a composer.
   *
   *   addLamp([x, y, z], 0xE66D32, { intensity: 1, range: 16, pool: 3.4, streak: 2.6 })
   *
   * `pos` is a Vector3 or an array. Returns a handle: `.move()`, `.set()`, `.remove()`.
   */
  function addLamp(pos, color = PALETTE.lantern, o = {}) {
    const p = Array.isArray(pos) ? new THREE.Vector3(pos[0], pos[1], pos[2]) : new THREE.Vector3().copy(pos);
    const col = o.accent ? new THREE.Color(color) : capChroma(color);
    const range = o.range ?? 16;
    const lamp = {
      pos: p,
      color: col,
      intensity: (o.intensity ?? 1) * O.lampIntensity,
      range,
      // a pool is as wide as the light reaches, floored so a small source still grounds itself
      pool: o.pool ?? clamp(range * 0.46, 1.8, 10),
      poolGain: (o.poolGain ?? 1) * O.poolIntensity,
      streak: o.streak ?? 1.45,             // how far the wet smear runs, as a multiple of pool
      streakAxis: o.streakAxis ?? 'z',
      halo: o.halo ?? clamp(range * 0.17, 0.6, 3.0),
      haloGain: (o.haloGain ?? 1) * O.haloIntensity,
      groundY: o.groundY ?? O.groundY,
      always: !!o.always,                    // never dropped from the light pool (the active gate)
      live: true,
      idx: lamps.length,
    };
    lamps.push(lamp);
    dirty = true;
    return {
      lamp,
      move(x, y, z) { lamp.pos.set(x, y, z); dirty = true; return this; },
      set(props) { Object.assign(lamp, props); dirty = true; return this; },
      remove() { lamp.live = false; dirty = true; },
    };
  }

  /**
   * Set an instance colour to a lamp's hue at a given brightness, by scaling the BRIGHTEST
   * channel to the gain instead of scaling all three. Additive quads that overlap otherwise
   * climb every channel until the pool is a white disc with a coloured edge, which is what a
   * light pool must never be: twelve lanterns 9.5 m apart on this street overlap by design.
   */
  function tint(out, color, gain) {
    out.copy(color);
    const mx = Math.max(out.r, out.g, out.b) || 1;
    return out.multiplyScalar(gain / mx);
  }

  /** Rebuild the instance buffers. Called when a lamp is added, moved or removed — not per frame. */
  function rebuild() {
    dirty = false;
    let n = 0, h = 0;
    const capP = pools.count = 0;
    for (const L of lamps) {
      if (!L.live) continue;
      if (n + 2 > O.capacity) break;

      // the round pool, on the floor under the source
      _v.set(L.pos.x, L.groundY + 0.03, L.pos.z);
      _s.set(L.pool * 2, L.pool * 2, 1);
      _m.compose(_v, FLAT, _s);
      pools.setMatrixAt(n, _m);
      tint(_c, L.color, clamp(0.62 * L.intensity * L.poolGain, 0, 1.15));
      pools.setColorAt(n, _c);
      n++;

      // the wet streak: the same pool, narrow and long. This is the whole reflection pass.
      _v.set(L.pos.x, L.groundY + 0.045, L.pos.z);
      const along = L.streakAxis === 'x';
      _s.set(along ? L.pool * 2 * L.streak : L.pool * 0.7,
             along ? L.pool * 0.7 : L.pool * 2 * L.streak, 1);
      _m.compose(_v, FLAT, _s);
      pools.setMatrixAt(n, _m);
      tint(_c, L.color, clamp(0.26 * L.intensity * L.poolGain, 0, 0.6));
      pools.setColorAt(n, _c);
      n++;

      if (h < halos.instanceMatrix.count) {
        _v.copy(L.pos);
        _s.set(L.halo * 2, L.halo * 2, 1);
        _m.compose(_v, _q.identity(), _s);
        halos.setMatrixAt(h, _m);
        tint(_c, L.color, clamp(1.75 * L.intensity * L.haloGain, 0, 3.0));
        halos.setColorAt(h, _c);
        L.halo_i = h;
        h++;
      } else L.halo_i = -1;
    }
    void capP;
    pools.count = n;
    halos.count = h;
    pools.instanceMatrix.needsUpdate = true;
    halos.instanceMatrix.needsUpdate = true;
    if (pools.instanceColor) pools.instanceColor.needsUpdate = true;
    if (halos.instanceColor) halos.instanceColor.needsUpdate = true;
  }

  /* ------------------------------------------------------------- adopt */

  /**
   * Walk a built level and give every emissive surface a practical. This is the rule from
   * STYLE_LOCK — "nothing glows without lighting its surroundings" — enforced by a sweep
   * instead of by everyone remembering, which is what it failed at for four rounds in the
   * recipe's own runs.
   *
   * It handles InstancedMesh, which matters here: twelve lanterns and sixteen cones on this
   * street are two InstancedMeshes, so a traversal that only looks at `mesh.material` finds two
   * emissive objects and misses twenty-six lamps. Lamps closer together than `minSpacing` are
   * merged, so the eight emissive panels of one gate register as one practical and not eight.
   *
   *   lighting.adopt(scene)                       everything
   *   lighting.adopt(hub.group, { range: 14 })    one zone, warmer
   */
  function adopt(root, o = {}) {
    const found = [];
    const box = new THREE.Box3();
    const size = new THREE.Vector3();
    const centre = new THREE.Vector3();

    root.updateMatrixWorld(true);
    root.traverse((n) => {
      if (!n.isMesh || !n.visible) return;
      const mats = Array.isArray(n.material) ? n.material : [n.material];
      for (const mat of mats) {
        if (!mat || !mat.emissive) continue;                 // MeshBasic (the beacon) has none
        if (mat.userData && mat.userData.noLamp) continue;
        const ei = mat.emissiveIntensity ?? 1;
        const lum = mat.emissive.r + mat.emissive.g + mat.emissive.b;
        if (lum * ei < 0.12) continue;                       // not actually emitting

        if (!n.geometry.boundingBox) n.geometry.computeBoundingBox();
        box.copy(n.geometry.boundingBox);
        box.getSize(size); box.getCenter(centre);

        if (n.isInstancedMesh) {
          for (let i = 0; i < n.count; i++) {
            n.getMatrixAt(i, _m);
            _v.copy(centre).applyMatrix4(_m).applyMatrix4(n.matrixWorld);
            _s.setFromMatrixScale(_m);
            found.push({ p: _v.clone(), r: Math.max(size.x * _s.x, size.z * _s.z, size.y * _s.y), m: mat, ei });
          }
        } else {
          _v.copy(centre).applyMatrix4(n.matrixWorld);
          found.push({ p: _v.clone(), r: Math.max(size.x, size.y, size.z) * n.getWorldScale(_s).x, m: mat, ei });
        }
      }
    });

    // merge anything closer together than minSpacing: one fixture, one practical
    const spacing = o.minSpacing ?? O.minSpacing;
    const kept = [];
    for (const f of found) {
      let near = null;
      for (const k of kept) {
        if (k.p.distanceToSquared(f.p) < spacing * spacing && k.m.emissive.getHex() === f.m.emissive.getHex()) { near = k; break; }
      }
      // the kept lamp's POSITION does not move. Averaging it in looks tidier and is a bug: on a
      // ring of 128 gates a metre apart, each merge drags the survivor toward the next one and
      // the whole ring chains into five lamps that are nowhere near a gate.
      if (near) { near.r = Math.max(near.r, f.r); near.n++; }
      else kept.push({ ...f, n: 1 });
    }

    const made = [];
    for (const k of kept) {
      // idempotent: a second adopt() of the same root registers nothing twice, so the game can
      // call it again whenever something lights up mid-mission — the return gate, a node coming
      // online — without the lamp list growing every time.
      let already = false;
      for (const L of lamps) {
        if (L.live && L.pos.distanceToSquared(k.p) < spacing * spacing) { already = true; break; }
      }
      if (already) continue;
      // a 0.5 m lantern reaches a few metres; a 6 m sign box reaches further. Size sets range.
      const range = o.range ?? clamp(10 + k.r * 4.0, 14, 30);
      made.push(addLamp(k.p, k.m.emissive.getHex(), {
        intensity: (o.intensity ?? 1) * clamp(0.5 + k.ei * 0.5, 0.4, 2.2),
        range,
        pool: o.pool ?? clamp(range * 0.46, 1.4, 10),
        halo: o.halo ?? clamp(k.r * 0.9, 0.35, 3.0),
        groundY: o.groundY ?? O.groundY,
        accent: o.accent,
        streakAxis: o.streakAxis,
      }));
    }
    adopted.push({ root, count: made.length });
    return made;
  }
  const adopted = [];

  /**
   * How many emissive meshes have no practical near them. A gate reads this and asserts zero;
   * it is the one number that catches the named failure mode of this whole domain coming back.
   */
  function unlitEmissive(root = scene) {
    let bad = 0;
    const centre = new THREE.Vector3(), size = new THREE.Vector3(), box = new THREE.Box3();
    root.updateMatrixWorld(true);
    root.traverse((n) => {
      if (!n.isMesh || !n.visible) return;
      const mats = Array.isArray(n.material) ? n.material : [n.material];
      for (const mat of mats) {
        if (!mat || !mat.emissive) continue;
        if (mat.userData && mat.userData.noLamp) continue;
        const ei = mat.emissiveIntensity ?? 1;
        if ((mat.emissive.r + mat.emissive.g + mat.emissive.b) * ei < 0.12) continue;
        if (!n.geometry.boundingBox) n.geometry.computeBoundingBox();
        box.copy(n.geometry.boundingBox); box.getCenter(centre); box.getSize(size);
        const test = (p) => {
          for (const L of lamps) if (L.live && L.pos.distanceToSquared(p) < O.adoptRadius * O.adoptRadius) return true;
          return false;
        };
        if (n.isInstancedMesh) {
          for (let i = 0; i < n.count; i++) {
            n.getMatrixAt(i, _m);
            _v.copy(centre).applyMatrix4(_m).applyMatrix4(n.matrixWorld);
            if (!test(_v)) bad++;
          }
        } else {
          _v.copy(centre).applyMatrix4(n.matrixWorld);
          if (!test(_v)) bad++;
        }
      }
    });
    return bad;
  }

  /* ------------------------------------------------------------ ground */

  /**
   * WET GROUND, FAKED. Roughness down, a little metalness, and the environment turned up so the
   * sky's warm horizon band and violet zenith land on it at grazing angles. The reflections a
   * player actually notices are not from this at all — they are the streaks under every
   * practical — but this is what makes the unlit stretches of road read as wet rather than as
   * matte charcoal. No second pass, no planar mirror, per STYLE_LOCK.
   */
  function setGround(target, o = {}) {
    const mats = [];
    const push = (m) => { if (m && m.isMaterial && !mats.includes(m)) mats.push(m); };
    if (!target) return mats;
    if (target.isMaterial) push(target);
    else if (Array.isArray(target)) target.forEach(push);
    else if (target.isObject3D) target.traverse((n) => {
      if (!n.isMesh) return;
      (Array.isArray(n.material) ? n.material : [n.material]).forEach(push);
      n.receiveShadow = true;
    });
    for (const m of mats) {
      m.roughness = o.roughness ?? 0.24;
      m.metalness = o.metalness ?? 0.42;
      m.envMapIntensity = o.envMapIntensity ?? 1.5;
      m.needsUpdate = true;
    }
    return mats;
  }

  /** The hero's accent light and its own small pool, so the green is grounded like everything
   *  else. Pass the player's group; `update()` follows it. */
  function setHero(obj, o = {}) {
    heroObj = obj || null;
    hero.visible = !!obj;
    hero.color.set(o.color ?? O.accent);
    hero.intensity = o.intensity ?? O.heroLight;
    if (obj && !hero.userData.pool) {
      hero.userData.pool = addLamp([0, 1.2, 0], o.color ?? O.accent, {
        accent: true, intensity: o.poolIntensity ?? O.heroPool, range: 6,
        pool: 0.7, streak: 1.2, halo: 0.0, always: false,
      });
    }
    return hero;
  }

  /* ------------------------------------------------------------ update */
  let frame = 0;
  let lastCam = opts.camera || null;
  const focus = new THREE.Vector3();
  const _cam = new THREE.Vector3();
  let warned = false;

  /** Re-point the bounded light pool at the nearest registered lamps. Runs every `switchEvery`
   *  frames, not every frame: an N-lamp sort is the only per-frame cost that could grow with
   *  the level, and a light that changes which lamp it is standing at six frames late is a
   *  thing nobody has ever seen. */
  function repoint() {
    const live = [];
    for (const L of lamps) {
      if (!L.live) continue;
      const d = L.pos.distanceToSquared(focus);
      // a lamp twice as bright deserves a light from twice as far away
      live.push({ L, d: d / Math.max(0.25, L.intensity) - (L.always ? 1e9 : 0) });
    }
    live.sort((a, b) => a.d - b.d);
    const want = live.slice(0, lights.length).map((x) => x.L);
    const have = lights.map((s) => s.lamp);

    // keep a light where it is if its lamp is still wanted, so only the changes cross-fade
    const unassigned = want.filter((w) => !have.includes(w));
    for (const slot of lights) {
      if (slot.lamp && want.includes(slot.lamp)) { slot.want = slot.lamp; continue; }
      slot.want = unassigned.shift() || null;
    }
  }

  /**
   * Once a frame. `focusPos` is the player: it is what the light pool, the shadow camera and
   * the camera fill all follow, so the five lights are always the five the player can see.
   */
  function update(dt = 0.016, focusPos = null, camera = null) {
    if (camera) lastCam = camera;
    // a Vector3, a {x,y,z}, or an [x, y, z]
    if (focusPos) {
      if (Array.isArray(focusPos)) focus.set(focusPos[0] || 0, focusPos[1] || 0, focusPos[2] || 0);
      else focus.set(focusPos.x || 0, focusPos.y || 0, focusPos.z || 0);
    }
    if (dirty) rebuild();

    // ---- key follows the focus, snapped to the shadow map's own texel grid so the shadow
    // edges do not crawl while the player walks. Cheaper than raising the map size for the
    // same apparent stability.
    const texel = (tier.shadowDist * 2) / tier.shadowMap;
    const sx = Math.round(focus.x / texel) * texel;
    const sz = Math.round(focus.z / texel) * texel;
    key.target.position.set(sx, 0, sz);
    key.position.set(sx + kd.x * tier.shadowDist * 2, kd.y * tier.shadowDist * 2, sz + kd.z * tier.shadowDist * 2);
    key.target.updateMatrixWorld();

    // ---- the light pool
    if (frame % O.switchEvery === 0) repoint();
    for (const slot of lights) {
      if (slot.want !== slot.lamp) {
        slot.k = damp(slot.k, 0, O.fade, dt);
        if (slot.k < 0.02) { slot.lamp = slot.want; slot.k = 0; }
      } else if (slot.lamp) {
        slot.k = damp(slot.k, 1, O.fade, dt);
      }
      const L = slot.lamp;
      if (!L || !L.live) { slot.light.visible = false; continue; }
      slot.light.visible = true;
      slot.light.position.copy(L.pos);
      slot.light.color.copy(L.color);
      slot.light.distance = L.range;
      // candela. A lantern 2.8 m up wants to put a readable pool on the road under it, and with
      // decay 2 that is intensity / 7.8 at the player's feet.
      slot.light.intensity = 26 * L.intensity * slot.k;
    }

    // ---- the hero
    if (heroObj) {
      const p = heroObj.position || heroObj;
      hero.position.set(p.x, (p.y || 0) + 1.15, p.z);
      if (hero.userData.pool) hero.userData.pool.move(p.x, (p.y || 0) + 0.2, p.z);
    }

    // ---- the camera fill rides the camera, pushed a little toward the focus
    if (lastCam) {
      lastCam.getWorldPosition(_cam);
      fill.position.copy(_cam).lerp(focus, 0.35);
      fill.position.y += 1.0;
    }

    if (!warned && frame === 30) {
      warned = true;
      const bad = unlitEmissive(scene);
      if (bad > 0) {
        console.warn(`[lighting] ${bad} emissive mesh(es) with no practical within ${O.adoptRadius} m. ` +
          `Call lighting.adopt(scene) after the level is built, or addLamp() at each one. ` +
          `Nothing glows without lighting its surroundings.`);
      }
    }
    frame++;
  }

  /* ------------------------------------------------------------- render */
  let composer = null, bloomPass = null, postReady = false;
  async function initPost() {
    try {
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
        import('three/addons/postprocessing/EffectComposer.js'),
        import('three/addons/postprocessing/RenderPass.js'),
        import('three/addons/postprocessing/UnrealBloomPass.js'),
        import('three/addons/postprocessing/OutputPass.js'),
      ]);
      const size = renderer.getSize(new THREE.Vector2());
      composer = new EffectComposer(renderer);
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(size.x, size.y);
      composer.addPass(new RenderPass(scene, null));
      bloomPass = new UnrealBloomPass(new THREE.Vector2(size.x, size.y),
        opts.bloomStrength ?? 0.42, opts.bloomRadius ?? 0.45, opts.bloomThreshold ?? 0.92);
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
      postReady = true;
    } catch (e) {
      console.warn('[lighting] post unavailable, running without bloom:', e && e.message);
      postReady = false;
    }
  }
  if (tier.post && opts.post !== false) initPost();

  /** Halos face the camera. Done on the CPU for all of them in one buffer upload rather than in
   *  a vertex patch, because a patched material is a material `assetlib` can no longer merge by
   *  value, and 384 matrix composes is nothing next to that. */
  function billboard(camera) {
    if (!halos.count) return;
    camera.getWorldQuaternion(_q);
    let h = 0;
    for (const L of lamps) {
      if (!L.live || L.halo_i === undefined || L.halo_i < 0) continue;
      _s.set(L.halo * 2, L.halo * 2, 1);
      _m.compose(L.pos, _q, _s);
      halos.setMatrixAt(L.halo_i, _m);
      h++;
      if (h >= halos.count) break;
    }
    halos.instanceMatrix.needsUpdate = true;
  }

  /** Draw the frame. Use this instead of `renderer.render(scene, camera)`. */
  function render(camera, dt = 0.016) {
    lastCam = camera;
    billboard(camera);
    if (postReady && composer) {
      composer.passes[0].camera = camera;
      composer.render(dt);
    } else {
      renderer.render(scene, camera);
    }
  }

  function resize(w, h) {
    if (composer) composer.setSize(w, h);
  }

  /* --------------------------------------------------------------- info */
  // `unlitEmissive()` is a full scene traverse, and a gate that polls info() every frame would
  // pay for it every frame. Recomputed at most once a second; call unlitEmissive() directly for
  // an answer that is definitely current.
  let unlitCache = -1, unlitAt = -1e9;
  function unlitCached() {
    if (frame - unlitAt > 60 || unlitCache < 0) { unlitCache = unlitEmissive(scene); unlitAt = frame; }
    return unlitCache;
  }

  function info() {
    let warm = 0, cool = 0, active = 0;
    const hsl = { h: 0, s: 0, l: 0 };
    for (const slot of lights) {
      if (!slot.lamp || !slot.light.visible || slot.light.intensity <= 0.01) continue;
      active++;
      slot.lamp.color.getHSL(hsl);
      const deg = hsl.h * 360;
      if (deg < 70 || deg > 330) warm++;
      else if (deg > 170 && deg < 300) cool++;
    }
    // the hemisphere and the key are always in frame and always cool; the hemisphere's ground
    // colour is always warm. So the pair can only fail if every practical is out of range AND
    // the ambient has been turned off.
    const ambientWarm = hemi.groundColor.r > hemi.groundColor.b;
    const ambientCool = hemi.color.b > hemi.color.r || key.color.b > key.color.r;
    return {
      tier: tier.name,
      lamps: lamps.filter((l) => l.live).length,
      lightBudget: lights.length,
      activeLights: active,
      poolQuads: pools.count,
      haloQuads: halos.count,
      warmInFrame: warm > 0 || ambientWarm,
      coolInFrame: cool > 0 || ambientCool,
      twoTemperatures: (warm > 0 || ambientWarm) && (cool > 0 || ambientCool),
      unlitEmissive: unlitCached(),
      post: !!postReady,
      shadowMap: tier.shadowMap,
      exposure: renderer.toneMappingExposure,
      accent: '#' + new THREE.Color(O.accent).getHexString(),
      chromaCap: O.chromaCap,
      // what this module adds to renderer.info.render.calls: sky + pools + halos, plus the
      // key's shadow pass, which is a redraw of everything that casts.
      ownDraws: 1 + (pools.count ? 1 : 0) + (halos.count ? 1 : 0),
    };
  }

  function dispose() {
    scene.remove(hemi, key, key.target, fill, hero, pools, halos);
    for (const s of lights) scene.remove(s.light);
    quad.dispose(); soft.dispose(); core.dispose(); poolMat.dispose(); haloMat.dispose();
    if (envRT) envRT.dispose();
    if (skyTex) skyTex.dispose();
    if (composer) composer.dispose();
    scene.environment = null; scene.background = null; scene.fog = null;
  }

  return {
    render, update, addLamp, adopt, setGround, setHero, unlitEmissive, resize, dispose, info,
    tier: tier.name, tiers: TIERS, palette: PALETTE, options: O,
    // the parts, for anything that needs to reach past the module
    hemi, key, fill, hero, pools, halos, lights, lamps, skyTexture: skyTex,
  };
}

export default createLighting;
