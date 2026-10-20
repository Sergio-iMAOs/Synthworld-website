

EARL's screenshots, Oscillator 1 as wavetable (same as currently), but Oscillator 2 should be Granular (with a loaded sample)

Move the EARL skin slider visulizer from the main page to EARL page (replacing current skins slideshow).
In the main page replace it for just an image of EARL but present it cosmically cool. Clicking the image redirects to EARL page


## EARL

Music samples section
Turn images into animations.

Web version to demo it

## Portfolio
Adjust pictures size. Some of them have unnecesarily high resolution, which takes space

Update my email when I have the domain


## EARL's screenshots

Its page and card show placeholders (`src/content/synths/earl/screenshots/`). Next: take the real ones with
`npm run screenshots` (the script already works: it draws six pages of the Init patch, and close-ups of
the velvet noise's panel, the two unisons and the randomiser) and make them worth
showing:
- A patch with something in it: the snapshot tool can't load a preset yet ("Loading one does nothing here",
  `tests/snapshot/EarlSnapshot.cpp`), so it needs that in the framework, or the patch built by clicks.
- Sound playing where it shows (`SYNTHWORLD_SNAPSHOT_AUDIO`, already on for the cover), and maybe details
  cropped from the window besides whole pages.
- Check each one's `alt` and `caption` in `synth.yaml` against what it ends up showing (the Tuning page's alt
  is only its name).
