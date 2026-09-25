# Submitting TWIF: Subnet One

Everything that can be prepared locally is prepared. Four steps need you.

## 1. Create the public repo  (you — `gh` is not installed)

On github.com, create a **public, empty** repo named `twif-subnet-one`
(no README, no .gitignore — the history already exists here).

Then, from `twif-game/`:

```bash
git remote add origin https://github.com/taovinci0/twif-subnet-one.git
git push -u origin main
```

## 2. Turn on GitHub Pages  (you)

Repo → Settings → Pages → Source: **Deploy from a branch** → `main` / `/ (root)` → Save.

After a minute the game is live at:

```
https://taovinci0.github.io/twif-subnet-one/game/
```

The deployable game is the `game/` folder only — that is why it is nested. `refs/`,
`work/` and the markdown stay in the repo as receipts but are not part of the payload.
The payload is about 1 MB against a 10 MB limit.

## 3. Run the real jam gate  (me, once the URL is live)

This is the gate that counts. Mine are custom; this is the one the organisers rerun.

```bash
export PATH="../.tooling/node/bin:$PATH"
cd ../404-game-recipe
node harness/ship.mjs ../twif-game/game --stamp
node harness/jam.mjs https://taovinci0.github.io/twif-subnet-one/game/ --commit=<sha>
```

`--stamp` cache-stamps the imports first: static hosts send `max-age=600`, so a visitor
who opened the game just before a push gets the old modules against the new page — a
version that has never existed.

`jam.mjs` loads the live URL on a phone viewport over a 4G profile, taps the real start
button, holds a real control, and checks: ready in time, under 10 MB, moves under a
finger, under 900 draw calls and 1.5M triangles, no 404s, no console errors. It prints a
verdict block.

## 4. Open the pull request  (you, with my help)

1. Fork `404-Repo/404-game-jam`.
2. Copy `submission/twif-subnet-one.json` into the fork as `entries/twif-subnet-one.json`.
3. Fill the two `FILL IN` fields: the commit sha the verdict block names, and a contact.
4. Paste the verdict block **unedited** into the PR body, with the three sentences.
5. Open the PR against `404-Repo/404-game-jam`.

## Known before you submit

- **The jam closed 25 Sep 23:59 UTC.** This is being prepared after that. Entries opened
  late are not judged, per the rules — worth a word with the organisers before spending
  time on the PR, or take it to another jam. The game is yours either way.
- **Frame rate has never been measured on real hardware.** Every number so far is from a
  software rasteriser, which the recipe says is meaningless. `jam.mjs` against the live
  URL is the first honest reading.
- **Nobody has heard the audio.** It is synthesised and soak-tested, but not listened to.
- **The wallet field says `later`** — set it to a Bittensor SS58 address if you want it
  filled in now.
