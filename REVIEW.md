> **STATUS — decisions locked by the project owner.** Section 1 (brand, likeness, TAO MART, the
> van) is a **closed project constraint**: the Bittensor/TWIF visual language is intentional
> creative direction for a community jam prototype and is kept exactly as supplied. Do not raise
> it as a blocker, and do not genericise it during the build.
>
> Everything else was accepted and is now written into `STYLE_LOCK.md` and the build order:
> rig not toon · phone tier · palette and scales fixed · signage as texture atlases · faked wet
> ground · hierarchy-then-bake characters · 3–4 concurrent grunts · 128 nodes instanced ·
> touch controls from the first greybox · transitions before polish · audio in scope ·
> repo from the start. Scope cut to **5–8 minutes** of required gameplay, no post-game free roam.

# REVIEW — risks before building TWIF: Subnet One

Written after reading the 404 recipe, the jam rules, the asset contract, and all 15 reference
images. The purpose is to name what will go wrong *before* it costs a round, not to talk the
project down. The concept is strong and several parts of it are unusually well suited to this
method — that list is at the end.

Severity: **[1] stops the entry** · **[2] costs rounds or budget** · **[3] worth deciding early**

---

## 1. Compliance — CLOSED BY PROJECT DECISION, do not re-raise

### 1.1 The T roundel is on every surface of every image **[closed — keep]**
The jam rule is literal: *"No trademarked characters, names or logos."* The T mark appears on
hubcaps, clothing, banners, lanterns, helmets, mugs, number plates, shop fronts and the hub
itself. This is not a detail that can be removed late — it is currently the visual identity of
the whole game.

**Decide:** either you hold the rights / have permission, or the mark is replaced with an
original glyph before anything is generated. An entry can be disqualified with a written reason
and 24 hours to respond.

### 1.2 Four characters are recognisable real people **[closed — keep]**
Const, Mog Motivational, Max Sensei and Sam Dare are drawn as specific individuals — one is
plainly a founder likeness. Entering warrants that *you hold the rights to everything in your
entry, including third party content*, and grants 404 a perpetual licence to display and stream
it. Likeness rights are separate from trademark and are not covered by "it's a parody".

**Decide:** explicit permission from each person, or restyle them so they are not identifiable.

### 1.3 TAO MART wears 7-Eleven's trade dress **[closed — keep]**
In `street_district` and `driving_hud` the store uses the green/orange/red stripe livery and
sign proportions. Trade dress is protected independently of the name.

### 1.4 The Subnet Summer van is a VW Type 2 **[closed — keep]**
Split windscreen, roof rack, proportions — it is unmistakable, and Volkswagen enforces its
design marks. Stylising toward a generic 60s microbus (different face, different screen split,
different light shapes) keeps the joke and removes the mark.

### 1.5 Provenance must be declared **[3]**
The entry JSON asks for every model that made code, images and sound, plus `own_art`. All 15
references are AI-generated; that is fine and allowed, but it must be named honestly.

---

## 2. Art direction versus what this method can produce

### 2.1 Every frame is built from legible printed text **[1]**
TAO MART · BUILD TRAIN EARN CREATE · DISCIPLINE BUILDS FREEDOM · SAME DOG HIGHER INTELLIGENCE ·
the subnet board · 継続 on every lantern. The recipe is unambiguous: assets are code with no
image files, text can only be geometry, and at frame scale a raised plate reads as a smudge.
It also records that legible printed text was *the* property that separated a code-asset build
from the real game it imitated, with no errors, before any measurement was taken.

**Route through:** signage is a **texture on simple geometry**, applied at the game level. The
jam permits image files for textures and sprites; the asset *module* may not load them
(the contract forbids imports, files and network inside a module). So: frame, board and roundel
are generated geometry; the art on them is an image file placed by the game. See 3.4 for what
that costs.

### 2.2 Wet reflective ground is the defining look and one of the most expensive **[2]**
All six scene frames are dominated by wet ground carrying every light source. True reflections
mean a second render pass or mirrored geometry — either roughly doubles what is drawn, against
a 900 draw call budget.

**Cheaper routes:** a low-roughness ground with an environment map and emissive "pools" painted
into the albedo; or vertical smeared gradients under each light source. Both read as wet at
speed and cost nothing per frame.

### 2.3 Neon night is exactly the failure mode the recipe says goes unfixed for rounds **[1]**
GAME.md names one failure in advance: *lights that emit without coupling to the surfaces around
them, so the world is lit and the floor it stands on is not.* It went four rounds unfixed in
their runs while being correctly diagnosed every time. Every frame here is a neon night street —
this build walks straight into it.

**Rule to write down now:** every emissive surface must have a real light near it that reaches
the ground, or a baked pool of light beneath it. "It glows" is not "it lights".

### 2.4 The lighting rig costs three times the draw calls **[2]**
`harness/rig.js` is recommended and genuinely better than two lights — but its own header
records **549 draw calls against 183** for the same scene, because a second shadow cascade and a
composer pass redraw the world. Against a 900 budget that is most of it before the game draws
anything. The phone tier drops the second cascade and the composer for this reason, and the
README notes nobody has measured either on a real GPU.

**Implication:** budget the rig explicitly, develop on the phone tier, and measure draws early
rather than at gate time.

### 2.5 Cel shading and the rig are different directions **[3]**
STYLE_LOCK asks for cel-shaded / comic-anime. The rig is a physically-flavoured setup with tone
mapping, aerial perspective and a sky that agrees with the light. You can have the rig's depth
or a toon look, but combining them is a custom shader job nobody has budgeted.

**Decide before generating:** toon materials with hand-placed lights, or the rig. The concept
frames are painted semi-realism with bloom — closer to the rig than to cel shading, so the style
lock and the art may already disagree about which game this is.

### 2.6 TWIF's silhouette is made of tatters, and tatters are the hardest thing here **[2]**
The ragged cloak edge *is* the character. In code geometry with no alpha textures, that is a lot
of small pieces, and merged the wrong way it becomes a smooth cone — at which point the
character stops being TWIF. Same for the boss's long coat.

**Route through:** build the tatters as a modest number of deliberate geometry panels, and check
the silhouette from all four sides in the verifier, which is exactly the check it exists for.

### 2.7 The fluffy tail and fur cannot be fur **[3]**
No fur shader, no alpha cards. A chunky stylised tail shape is the only option and it is fine —
but it must be designed as a shape, not as fur.

### 2.8 Faces **[2]**
Covered already: Const, Mog, Max, Sam Dare are semi-photoreal. Only Max Sensei is required as a
3D character; the other three are poster, shrine and billboard art in your own brief, which is
where they will look best. The enemies are helmeted and carry no face risk at all.

### 2.9 The palette in STYLE_LOCK does not match the art **[2]**
The lock has no teal, yet the van is teal and marigold. The frames are dominated by magenta,
violet and hot pink, none of which are in the lock. The lock is the one file handed to every
generating agent, so whichever an agent reads, the set will not agree with itself. Nine agents
producing one coherent set is the entire reason the file exists.

**Fix before generating anything.** Also convert `#hex` to `0x` for agents, and name materials
from the contract's list — `plaster | stone | timber | tile | metal | fabric | foliage | ground`
— which `surfaces.js` reads.

### 2.10 Missing scales **[3]**
The lock gives TWIF 1.65 m and NPCs 1.75 m, but the grunt's own scale comparison shows it far
taller than TWIF, and neither grunt, boss, drone, torii gate nor hub structures have a height.
Sizes drift more than colours do, and a set that drifts does not assemble.

---

## 3. Budget — 900 draws · 1.5M triangles · 10 MB · on a phone

### 3.1 Characters are the biggest single line item **[1]**
Measured in the asset contract: a rigged figure loaded the default way was **65 draw calls**,
and each of three pursuers **90** — four characters took **335 of 900** before the world drew.
This game wants TWIF, Max, multiple grunts, a boss and drones on screen at once.

**Mandatory:** load with the hierarchy, then bake back per joint. Anything rigid with respect to
one joint merges without losing motion. It took those same four from 335 to **146**.

### 3.2 The combat frame shows a dozen enemies at once **[2]**
`combat_hud` has twelve enforcers plus drones plus the city. Even at the good 36-per-character
number, twelve enemies is over 400 draw calls. Cap concurrent enemies, and instance the drones.

### 3.3 The 128-gate hub is the cheap shot, if instanced **[3]**
127 dormant gates are one repeated object — as an `InstancedMesh` that is roughly one draw call
for the ring. The contract's own trap applies: instanced copies live in the instance matrices,
so bounds must be measured per instance or you measure one copy of the prototype and every size,
ground and centring check silently lies.

### 3.4 Textures are the only thing big enough to break 10 MB **[2]**
Signage is the fix for 2.1, and it is also the thing that will blow the size gate. One 1024²
PNG is around a megabyte. Posters, shop fronts, banners, newspapers and packaging add up fast.

**Budget it:** one or two atlases, 512² or smaller per poster, compressed, and count the total
before shipping. `surfaces.js` already generates albedo, roughness and normal procedurally from
a seed and a material name — free, and it should carry every non-signage surface.

### 3.5 Audio is missing from the plan entirely **[2]**
Not in ASSET_LIST. needs.md is blunt: *a silent game reads as unfinished to a judge whatever the
frames look like, and generated audio is the cheapest fix available.* It also counts against the
10 MB. A sword hit, a footstep, an engine loop, a UI blip and one music cue is the minimum.

---

## 4. Build process

### 4.1 The supplied gate tests none of this game **[1]**
`playtest.mjs` drives forward. It cannot swing, drive, dodge, reach a menu, a death screen or a
restart. Pointed at this game it will report a clean pass having tested nothing — which the
recipe calls worse than no gate, *because you believe it*.

**Write your own** (`docs/gates.md`, about sixty lines). Drive it with real pointer, key and
touch events, never through debug hooks — a build there shipped unstartable on every phone for
weeks because every check drove it through its own hooks.

### 4.2 Mode transitions are where this will actually break **[1]**
On foot → enter van → drive → chase → exit van → combat → return to hub → hub state updates.
Each transition is a state change, and state changes are exactly what no automated gate reaches.
This is the highest-risk code in the project and it is invisible to every tool in the harness.

**Treat each transition as a checkpoint the gate can force**, and test the full run manually
every round.

### 4.3 Mobile controls are unsolved and the gate requires them **[1]**
The HUD frames show console prompts (RT / LT / Y / B / X). The jam gate requires the game to
start from a real tap and move under a real finger, on a phone viewport under a 4G profile.
Third-person camera + movement + attack + dodge + driving on a touch screen is a genuine design
problem, not a port.

### 4.4 The blind comparison needs frames it can actually win **[2]**
Covered in CLAIMS.md: the target frames are an unreachable bar and will fail the build every
round for the same structural reason. Judge against the seven claims instead, and remember the
critic must be allowed to reject the metric as well as the picture.

### 4.5 No repo yet **[2]**
The entry must be a public repo whose *history is real* — "the work is in the commits, not in
one upload at the end". Initialise before the first asset, not after.

---

## 5. Scope

### 5.1 This is larger than the recipe's own worked example **[1]**
Their kart racer — 60 objects, 9 subsystems — took 25 agents, ~10M tokens and about **ten hours**
end to end, and they tripped usage limits twice and a credit cap once, killing the running
agents each time. TWIF asks for three mechanics (melee, driving, chase), eight level beats, a
hub, a tutorial, ~20 asset groups and a 10–15 minute story.

**The brief's own instinct is right** — one polished vertical slice. Hold it there. Cut "free
roam after completion" now rather than later; it is the kind of line that quietly becomes a
week.

### 5.2 A 10–15 minute story is a lot of content to reach AAA-looking **[2]**
Judging weights **40 play / 30 looks / 20 what nobody else tried / 10 receipts**. A tight
five-minute slice that looks finished will outscore fifteen minutes that looks unfinished, on
both of the two heaviest criteria.

### 5.3 Hub, dojo, street and corporate tower are four distinct art sets **[2]**
Each needs its own props to read as a place. Reuse aggressively: one modular kit that
re-dresses, and lean on lighting and colour to separate the districts rather than new geometry.

---

## 6. What is genuinely well suited

Worth stating plainly, because the list above is one-sided.

- **TWIF** is close to an ideal subject: chunky readable silhouette, no facial subtlety to lose,
  and four clean reference views already cropped.
- **The enemies are helmeted.** Hard surfaces, bold shapes, no faces — the best case for
  generated geometry, and there are two of them plus drones.
- **The subnet gate reference is the best in the set** and needs no preparation at all.
- **The hub's 128 gates** are the signature image and, instanced, one of the cheapest things in
  the game.
- **The HUD costs nothing.** Minimap, objective list, ability row, speed and gear are DOM or
  canvas — zero draws, zero triangles, and the one part of the concept frames that can be
  matched exactly.
- **The premise answers "what nobody else tried"** — 20% of the score — without retrofitting.

---

## Decisions needed before a single asset is generated

1. The T mark, the four likenesses, the store livery and the van shape — rights, or redesign.
2. Toon or rig. One lighting direction, written into the style lock.
3. Palette reconciled (teal, the neon range), converted to `0x`, materials named from the
   contract, and heights added for grunt, boss, drone, gate and hub.
4. Signage policy: every glyph is a texture, with a stated MB budget.
5. Emissive rule: nothing glows without lighting the floor.
6. Character loading rule: hierarchy, then bake per joint.
7. Enemy concurrency cap, and drones instanced.
8. Touch control scheme, before the greybox rather than after.
9. Audio in the asset list, with its MB budget.
10. Repo initialised, so the history is real from the first commit.
