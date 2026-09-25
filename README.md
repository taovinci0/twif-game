# TWIF: Subnet One

A third-person neo-samurai action-comedy set inside Bittensor. One hub, one playable subnet,
5–8 minutes of required gameplay, ending 1/128 complete.

Built for the 404 game jam with the [404 game recipe](https://github.com/404-Repo/404-game-recipe):
every 3D object is Three.js code generated through the 404 loop. No meshes, no asset store,
no hand modelling.

## Documents

| | |
|---|---|
| `GAME_BRIEF.md` | premise, tone, cast, constraints |
| `LEVEL_01.md` | the eight beats of the slice |
| `STYLE_LOCK.md` | **handed whole to every generating agent** — style sentence, palette, scale, materials |
| `ASSET_LIST.md` | what gets generated, and its 404 loop state |
| `CLAIMS.md` | what a critic round can fail on |
| `REVIEW.md` | pre-build risk review and the decisions taken |
| `CLAUDE_START_PROMPT.md` | the build prompt |

## Layout

```
refs/       reference images: isolated object views, texture sources, target frames
assets/     generated asset modules (code) + textures/ (image files)
src/        game code, plus assetlib.js, surfaces.js, rig.js copied from the harness
```

## Running the harness

The harness lives in the sibling `404-game-recipe/` checkout and needs a **native arm64 Node**.

```bash
export PATH="../.tooling/node/bin:$PATH"
node ../404-game-recipe/harness/verify.mjs   assets/
node ../404-game-recipe/harness/playtest.mjs .
node ../404-game-recipe/harness/ship.mjs     . --stamp
```

## Budget

900 draw calls · 1.5M triangles · 10 MB total · phone viewport on a 4G profile.
