// Signage — the part that makes the street read like the concept art.
//
// Assets are code and cannot do legible lettering: at frame scale a raised plate
// is a smudge, and legible printed text was the single property that separated a
// code-asset build from the real game it imitated. So every glyph in this game is
// an IMAGE FILE applied here, by the game layer, onto blank generated geometry.
// The jam permits exactly that: geometry must be code, textures may be files.
//
// Signs are LIT. A night sign that only reflects is a grey rectangle, so each one
// carries its art as an emissive map as well as a colour map — and per the style
// lock, nothing glows without lighting its surroundings, so every sign registers
// a practical light with the lighting rig.
import * as THREE from 'three';

const SRC = './assets/textures/';

// name -> [file, aspect (w/h)]
const SIGNS = {
  banner_build:  ['banner_build_train_earn_create.jpg', 341 / 512],
  poster_const:  ['poster_const.jpg',                   384 / 512],
  poster_max:    ['poster_max_sensei.jpg',              384 / 512],
  poster_mog:    ['poster_mog_mogged.jpg',              384 / 512],
  poster_dare:   ['poster_sam_dare.jpg',                384 / 512],
  poster_gym:    ['poster_tao_gym_protocol.jpg',        341 / 512],
  sign_taomart:  ['sign_tao_mart.jpg',                  512 / 170],
};

const tex = {};
export const ASPECT = {};

/** Load every sign texture up front. Called before __READY__. */
export function loadSignage(onProgress = () => {}) {
  const loader = new THREE.TextureLoader();
  const names = Object.keys(SIGNS);
  let done = 0;
  return Promise.all(names.map((name) => new Promise((resolve, reject) => {
    const [file, aspect] = SIGNS[name];
    ASPECT[name] = aspect;
    loader.load(SRC + file, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      tex[name] = t;
      onProgress(++done / names.length, 'signage');
      resolve();
    }, undefined, () => reject(new Error('signage failed to load: ' + file)));
  })));
}

export const signTexture = (name) => tex[name] || null;

/**
 * A lit sign panel. `height` in metres; width follows the artwork's aspect so
 * nothing is ever stretched.
 *  glow 0   = a printed poster, lit only by what is around it
 *  glow 1+  = an illuminated box, a shopfront or a screen
 */
export function makeSign(name, height, { glow = 0.85, doubleSided = false } = {}) {
  const t = tex[name];
  if (!t) return null;
  const w = height * ASPECT[name];
  const mat = new THREE.MeshStandardMaterial({
    map: t,
    roughness: 0.62,
    metalness: 0.0,
    side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
  });
  if (glow > 0) {
    mat.emissive = new THREE.Color(0xffffff);
    mat.emissiveMap = t;
    mat.emissiveIntensity = glow;
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, height), mat);
  m.userData.signWidth = w;
  m.userData.signHeight = height;
  return m;
}

/** A hanging cloth banner: a sign with a pole and a weighted hem. */
export function makeBanner(name, height, frameMat) {
  const g = new THREE.Group();
  const sign = makeSign(name, height, { glow: 0.5, doubleSided: true });
  if (!sign) return g;
  const w = sign.userData.signWidth;
  sign.position.y = -height / 2 - 0.12;
  g.add(sign);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, w + 0.28, 6), frameMat);
  bar.rotation.z = Math.PI / 2;
  g.add(bar);
  const hem = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.07, 0.07), frameMat);
  hem.position.y = -height - 0.16;
  g.add(hem);
  return g;
}

/** A framed poster, flat against a wall. */
export function makePoster(name, height, frameMat) {
  const g = new THREE.Group();
  const sign = makeSign(name, height, { glow: 0.35 });
  if (!sign) return g;
  const w = sign.userData.signWidth;
  sign.position.z = 0.03;
  g.add(sign);
  const back = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, height + 0.12, 0.05), frameMat);
  g.add(back);
  return g;
}

/** An illuminated shop fascia: the sign in a lit box with a deep frame. */
export function makeFascia(name, width, frameMat) {
  const g = new THREE.Group();
  const h = width / ASPECT[name];
  const sign = makeSign(name, h, { glow: 1.35 });
  if (!sign) return g;
  sign.position.z = 0.11;
  g.add(sign);
  const box = new THREE.Mesh(new THREE.BoxGeometry(width + 0.18, h + 0.18, 0.22), frameMat);
  g.add(box);
  g.userData.lit = true;
  g.userData.litSize = [width, h];
  return g;
}
