# refs/

## What is where

- `style/` — full character and vehicle sheets. **Art direction only.** Multi-panel collages;
  never hand one to an asset generator, it will model the sheet.
- `characters/<name>/` — isolated views cropped from those sheets. These are the 404 references.
- `props/`, `environment/` — same, per object.
- `target_frames/` — full scene frames for the critic. See `../CLAIMS.md` before using them.

## Ready to generate

| object | views | suitability |
|---|---|---|
| TWIF | front, back, left, right | ideal — chunky silhouette, no face detail |
| Subnet Summer van | 3/4, front, side, rear | ideal — hard surface, simple curves |
| Subnet gate / torii node | 3/4 | **best reference in the set** — already isolated, plain background |
| Big AI grunt | front, 3/4, back, side, hero | ideal — helmeted, no face |
| Big AI boss | front, 3/4, side, back, hero | good — helmeted; the coat will need care |

## Still needed as isolated references

Max Sensei, dojo exterior/interior kit, shrine, lantern, convenience store, signpost,
modular street kit, control node, Big AI tower, and the flavour props.

## Two rules carried forward

1. **All lettering is a texture, never geometry.** The T roundel, banner text, shop signs,
   the 継続 lantern panels. Build the frame or board as geometry; put art on it as an image.
2. **Faces do not survive this method.** The enemies are helmeted, which is why they suit it.
   Anything that must read as a specific person belongs on a poster or billboard as 2D art.
