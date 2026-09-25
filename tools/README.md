# Gates

The recipe's `playtest.mjs` drives forward and never swings, drives or interacts. Pointed at
this game it reports a clean pass having tested none of it — which the recipe calls worse than
no gate, because you believe it. These two are the gates this game actually needs.

| | |
|---|---|
| `twif-gate.mjs` | walks the whole mission with real key and mouse events, start to 1/128 |
| `twif-touch.mjs` | phone viewport: real tap to start, real finger to move, real ATK button |
| `twif-skip.mjs` | regression: the mission cannot be walked past |

## Running them

`import puppeteer` resolves from the recipe checkout, not from here, so copy them into the
recipe's `harness/` and run from there:

```bash
export PATH="../.tooling/node/bin:$PATH"          # native arm64 node
cp tools/twif-*.mjs ../404-game-recipe/harness/
cd ../404-game-recipe
node harness/serve.mjs ../twif-game/game &
node harness/twif-gate.mjs   http://localhost:8080/__game__/game/
node harness/twif-touch.mjs  http://localhost:8080/__game__/game/
```

## What they proved, that review would not have

- **Swinging with your back turned.** Facing only updated while moving, so standing still and
  attacking swung wherever you last walked — 81 swings, zero hits, nothing thrown. Fixed with
  soft target-facing on attack.
- **An objective no one could complete.** The arena counted every enemy ever spawned, so two
  street grunts left alive 350 m away held it open forever. Fixed with per-encounter tracking.
- **An exit walled off.** The tower sat directly in front of the return gate. The mission could
  not be finished. Fixed by moving it off-axis.
- **A thumbstick the browser steals.** `touch-action` was set on the canvas but not the touch
  overlay, so a vertical drag fired `pointercancel` and dropped the stick. Real phone bug.
- **A mission you could walk past.** Found by a person playing it, not by the mission gate,
  which walks politely to each objective. Missing Max Sensei's trigger radius left the player
  at a van that would never open — no error, nothing logged. `twif-skip.mjs` covers it now.
- **A gate that lied.** An early version reported stages it never reached, because it pushed
  them after the player had already died. Fixed before it could be believed.

Both gates steer by **distance in metres**, never wall-clock duration: headless renders on a
software rasteriser at a few frames a second and the game clamps its step, so a fixed hold
under-drives a slow machine and reports that the player would not move.
