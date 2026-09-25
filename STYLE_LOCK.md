# STYLE LOCK

> Hand this file, whole and unedited, to every agent that generates anything.
> Agents generating in parallel cannot see each other's work. This file is the only thing
> they share, and it is what makes 20+ objects read as one game instead of a pile.

## The style sentence

> Stylised neo-samurai Bittensor city: hard-surface objects with simple readable forms and
> chunky silhouettes, flat matte colours with a little gloss on metal and wet ground, lit
> at night by warm practical lanterns against cool neon, finished cinematic rather than
> cel-shaded or photoreal.

Reuse that sentence verbatim for every object in the set.

## Render direction — RIG, not toon

Use `harness/rig.js`, the cinematic semi-realistic direction of the reference frames. **Do not**
write a custom cel shader. Develop and measure on the **phone tier**: the rig's own header
records 549 draw calls against 183 for the same scene, because a second shadow cascade and a
composer pass redraw the world. The phone tier drops both, and the budget is 900.

## Palette

| role | hex | where it belongs |
|---|---|---|
| Black | `0x080A0B` | TWIF's cloak, enforcer suits, deep shadow |
| Charcoal | `0x111315` | road, building mass, banner cloth |
| Gunmetal | `0x3A3F46` | enforcer armour plate, gate structure, hardware |
| Stone | `0x8C816F` | shrine stone, kerbs, statue, paving |
| Cream | `0xE7DFC9` | paper, banner ground, van upper body, signage field |
| Warm Gold | `0xD4A24C` | shrine trim, torii fittings, boss coat trim, lantern frame |
| Lantern Orange | `0xE66D32` | lantern glow, practical lights, warm windows |
| Deep Red | `0x8E2B2B` | torii posts, dojo belt, shrine accents |
| Van Teal | `0x1C7B74` | Subnet Summer van body, seat fabric, roof box |
| Van Marigold | `0xE9A93F` | van wave stripe, surfboard |
| TWIF Green | `0x9AFF43` | TWIF's eyes, active node, artefact. **One accent only** |
| Enforcer White | `0xE9E9EC` | boss coat, grunt shirt, sterile corporate surfaces |
| Visor Blue | `0xBFE4FF` | grunt visor, weapon glow, dormant node locks |
| Cool Blue | `0x315B78` | night sky, shade, distance haze |
| Violet | `0x6B3FD4` | city neon, far towers, sky gradient |
| Hot Pink | `0xFF2D8A` | neon signs, the MOGGED poster, accent trim |

**Chroma rule.** TWIF Green is the hero accent and nothing else in frame competes with it at
that chroma. Violet and hot pink live in the *distance* and on signage, never on gameplay
objects the player must read.

## Scale — metres

| object | size | note |
|---|---|---|
| TWIF | 1.65 h | the hero silhouette |
| Human NPC | 1.75 h | |
| Max Sensei | 1.75 h | |
| Big AI grunt | 2.05 h | deliberately taller and bulkier than TWIF — see the sheet's scale comparison |
| Big AI boss | 2.15 h | plus coat; reads taller still |
| Control drone | 0.60 w | instanced, never unique |
| Subnet Summer van | 1.95 h · 4.50 l · 1.80 w | |
| Street lantern | 2.80 h | |
| Shopfront | 3.00–4.00 h | |
| Torii / subnet gate | 6.00 h | |
| Hub node gate | 5.00 h | ×128, instanced |
| Control node / artefact | 4.00–8.00 h | |

> Grunt, boss, drone and gate heights were read off the reference sheets rather than stated in
> the brief. Confirm or overrule them here before generating — sizes drift more than colours do,
> and a set that drifts does not assemble.

## Materials

Name every material after a recipe from the asset contract, which `surfaces.js` reads.
Use only these names:

`plaster` · `stone` · `timber` · `tile` · `metal` · `fabric` · `foliage` · `ground`

```js
const wall = new THREE.MeshStandardMaterial({ color: 0x8C816F, roughness: 0.9 });
wall.name = 'stone';
```

## Fixed decisions

- **Metres.** Base at `y = 0`, centred on x and z, front faces `+Z`.
- **Flat colours in the module.** No textures, no image loading, no imports, no network inside
  an asset module. Surfaces are applied at load time by `surfaces.js`.
- **Anything open-ended gets `side: THREE.DoubleSide`** — lantern shells, pipes, crate liners,
  an open cylinder is a hole from inside otherwise.
- **No glyphs as geometry, anywhere.** Every letterform, logo, poster and sign is a **texture
  applied by the game layer** onto simple generated geometry. Build the frame, board, banner
  cloth or roundel disc; the art goes on it as an image file. At frame scale a raised plate
  reads as a smudge.
- **Nothing glows without lighting its surroundings.** Every emissive surface has a real light
  near it that reaches the ground, or a baked pool of light beneath it. This is the named
  failure mode of this domain and it went four rounds unfixed in the recipe's own runs.
- **Wet ground is faked.** Low roughness, environment contribution, emissive streaks and light
  pools under signs and lanterns. No second reflection pass.
- **Characters load with the hierarchy, then bake back per joint.** Merging naively costs
  65–90 draw calls each; per joint took four characters from 335 to 146.
- **Concurrent enemies: 3–4 grunts max**, boss only when required, drones instanced. Never the
  twelve-enemy concept frame.
- **TWIF's cloak** is a small number of deliberate layered tattered panels, not dozens of tiny
  pieces and not a smooth cone. The tail is a chunky stylised form, never simulated fur.
  Four-side verification is mandatory before the character is accepted.
