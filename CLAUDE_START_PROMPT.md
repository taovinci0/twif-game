Read the 404 recipe before doing anything:
- GAME.md
- 404.md
- docs/concept-images.md
- docs/traps.md

Then read the following files in this game folder:
- GAME_BRIEF.md
- LEVEL_01.md
- STYLE_LOCK.md
- ASSET_LIST.md
- all images inside refs/

This project is a separate game project using the 404 recipe.
Do not build inside the recipe repo itself.

Important:
- build only one polished 10–15 minute vertical slice
- build the hub + one playable subnet level
- 127 nodes are inactive, one is playable
- prioritize movement, combat, driving and readability
- do not expand scope into a full open-world game
- do not build 128 levels
- reuse assets where possible
- every final 3D object must be generated through the 404 workflow

First tasks:
1. inspect all project files and references
2. identify the minimum architecture for the game
3. identify the minimum reusable asset set
4. identify which references need better isolated images
5. build the playable greybox first
6. prove third-person movement works
7. prove simple combat works
8. prove Subnet Summer van driving works
9. prove level progression from start to completion works
10. only then replace greybox assets with proper generated assets

Stop after the first playable greybox and present the result before expanding content.
