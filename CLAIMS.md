# Claims — what a round can fail on

From `refs/target_frames/`. The recipe's method: a critic holding a picture argues taste, so
write down what is *true* of the reference as statements a machine or a fresh critic can check.

## Why these frames cannot be the bar as-is

The target frames are dense neon streets: hundreds of NPCs, dozens of lit signs, traffic,
drones, blossom, wet reflective ground — and almost every readable element is **printed text**.
Legible text on props is the single documented property that separated a code-asset build from
real frames, and it cannot be done. Held up as a blind-comparison bar, these frames fail the
build every round for the same structural reason, which GAME.md names as the signal to change
the plan rather than run another round.

So they are used two ways: **art direction**, and the claims below. Not as the pass/fail image.

## The claims

1. **The surround is dark and everything readable sits in a pool of light.** Unlit areas go
   near-black. No flat, evenly-lit street.
2. **Two colour temperatures are always in frame.** Warm lantern orange/gold against cool
   blue/violet city light. Never one temperature everywhere — that is the lit-box failure.
3. **The ground is wet and carries the reflection of every light source.** Reflections are a
   large fraction of the frame area, not a detail.
4. **Every warm light in frame has a physical source object.** A lantern, a sign box, a
   doorway. Light that emits without a visible fixture, or a fixture that does not light the
   floor beneath it, is the named failure mode of this whole domain.
5. **Vertical elements interrupt the silhouette at regular intervals.** Banners, lanterns,
   poles, signboards. The street is never an empty corridor.
6. **The hero is a near-black silhouette carrying exactly one high-chroma accent** — the green
   eyes. Nothing else in frame competes at that chroma.
7. **Signage reads as lit shape, colour and silhouette, never as letterforms.** A sign is a
   glowing coloured rectangle at frame scale. This is the rule that keeps 1–6 achievable.

## What the HUD frames are for

`driving_hud`, `combat_hud`, `exploration_hud` specify the **UI**, which is DOM or canvas and
costs no draw calls and no triangles. Minimap, objective list, ability row, speed and gear.
This is the one part of those frames that can be matched exactly, and cheaply.

## Budget reality check

900 draw calls, 1.5M triangles, 10 MB, on a phone. The frames show perhaps fifty times that.
Match the *claims*, not the density.
