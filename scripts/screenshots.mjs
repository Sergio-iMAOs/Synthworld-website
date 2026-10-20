// Takes the synths' screenshots (npm run screenshots): the framework's snapshot tool draws a synth's window
// without a window or a host, driven by a script of clicks, into the PNG files its synth.yaml shows. Run it after
// the synth's UI changes, look at them, and commit them. The tools are built in the framework's tree:
//   cmake --build build --target synthworld_earl_snapshot      (in ../Synthworld)
// The framework is looked for next to this repository (../Synthworld), or where SYNTHWORLD_DIR says, and its build
// in its build/ folder, or where SYNTHWORLD_BUILD_DIR says. `npm run screenshots -- earl` takes one synth's only,
// `npm run screenshots -- earl/wavetable` one of its shots (and its loop), and `npm run screenshots -- synthworld`
// SynthWorld's marks only. The loops are made with ffmpeg (with libx264), which must be installed.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const framework = path.resolve(root, process.env.SYNTHWORLD_DIR ?? '../Synthworld');
const build = path.resolve(framework, process.env.SYNTHWORLD_BUILD_DIR ?? 'build');

/** Pixels per unit of the synth's window: twice its size, for screens that have two pixels for one. */
const SCALE = 2;
// The site shows a picture at most half its pixels wide: the window at its size, a close-up taken at a scale of 3
// half again bigger.

// Each synth's tool and shots. A shot's actions are the tool's (tests/snapshot/SnapshotScript.h in the framework:
// click=x,y, wheel=x,y,n, wait=ms...), in the window's units at a scale of 1; its env, the tool's settings
// (tests/snapshot/EarlSnapshot.cpp: SYNTHWORLD_SNAPSHOT_AUDIO to play a chord, SYNTHWORLD_SNAPSHOT_SKIN...); its
// crop, [x, y, width, height] in the window's units, a part of the window alone; its scale, if not SCALE; its patch, a
// preset file's changed for it (see patchFile()), in place of SYNTHWORLD_SNAPSHOT_PATCH. A shot
// with a tool of its own is drawn by it, with its args in place of the scale and the actions (the logo).
// Its file is where synth.yaml looks for it, from the synth's folder. Its loop, if it has one, a silent video of it
// showing how the window answers its controls (see takeLoop()), is public/loops/<synth>/<its file's name>.mp4.

// EARL's oscillators as its window shows them: the first a wavetable one, as it is, the second a granular one (turned
// on, Granular from its menu, its sample from its selector's, some POSITION and SPRAY). The sample is the one the tool
// has, "Pluck", a stand-in for EARL's Click_01 until the tool has EARL's stock samples
const earlOscillators = ['click=315,47', 'click=450,46', 'click=380,135', 'click=480,65', 'click=480,115', 'click=620,115', 'wheel=340,230,8', 'wheel=540,263,8'];
// The voice's saturator's OUTPUT turned up from -12 dB, the default patch's, to 0 dB: a third of its travel, 0.15 of it a
// wheel's unit of 0.3 notches (Slider.cpp)
const earlSaturatorOutput = 'wheel=1083,406,7.408';
// More of its panels on, for more of a skin's colours: the noise, the sub-oscillator, Filter 1 and the saturator (its
// OUTPUT at 0 dB)
const earlPanels = ['click=905,47', 'click=907,234', 'click=17,352', 'click=614,352', earlSaturatorOutput];
// Its third oscillator on, showing its unison: its unison button, 9 voices, DETUNE, WIDTH, BLEND, WT SPREAD and BIAS
// turned up
const earlThirdOscillator = ['click=611,47', 'click=612,90', 'wheel=641,224,12', 'wheel=757,224,6', 'wheel=868,224,4', 'wheel=641,288,3', 'wheel=757,288,8', 'wheel=868,288,3'];
// Its window as the home page shows it, playing a factory preset with its oscillators (the third's actions, if it's
// on) and more of its panels on, the master gain, in the header, turned down so that the output's meter doesn't clip,
// and the mouse out of the window
const earlHome = (thirdOscillator) => [...earlOscillators, ...thirdOscillator, ...earlPanels, 'wheel=1185,15,-8', 'move=600,620', 'wait=500'];
// A page of its window alone, between the header (whose preset selector would name a patch from a file "Init") and the
// macros under it
const earlPage = [0, 31, 1200, 533];
// A patch from the framework's benchmarks, which have more in them than the factory presets: "Everything" has every
// processor on and the eight effects, "Modulation Matrix" its rows filled
const earlBench = (name) => path.join(framework, 'synths/EARL/benchmarks/EARL Bench', `Bench ${name}.swpreset`);

/** A loop's frames a second: one each 40 ms of the tool's time, which moves on in steps of 10 ms */
const LOOP_FPS = 25;
/** Where the mouse goes between a loop's moves: under the window's pages, out of every close-up */
const AWAY = 'move=600,620';

// A loop's moves, each what's done before each of its frames, ending as it started, so that the loop goes round
// without a jump. A control turned by the mouse's wheel at x,y so many notches (away from the user; towards them if
// negative) and back, easing in and out, over so many seconds; the mouse away at its end
const turn = (x, y, notches, seconds = 6) => {
  const frames = Math.round(seconds * LOOP_FPS);
  // How far it's turned at each frame, in thousandths of a notch, so that its steps add up to nothing
  const at = (frame) => Math.round(((notches * (1 - Math.cos((2 * Math.PI * frame) / frames))) / 2) * 1000);
  return [...Array(frames).keys()].map((frame) => {
    const step = at(frame + 1) - at(frame);
    return [...(step !== 0 ? [`wheel=${x},${y},${step / 1000}`] : []), ...(frame === frames - 1 ? [AWAY] : [])];
  });
};
// Buttons clicked in turn, each held so many seconds; the last should be the one on at the start
const press = (points, seconds = 1.2) =>
  points.flatMap(([x, y]) => [[`click=${x},${y}`, AWAY], ...Array.from({ length: Math.round(seconds * LOOP_FPS) - 1 }, () => [])]);

const synths = {
  earl: {
    tool: 'synthworld_earl_snapshot',
    // EARL's own default skin, SW Light: its page's pictures, light in space
    env: { SYNTHWORLD_SNAPSHOT_SKIN: 'SW Light' },
    // The pages' tabs, in the header: Synth (130,14), Global (180,14), Mod Matrix (252,14), Graph (297,14),
    // Notes (343,14), Tuning (393,14), Settings (447,14)
    shots: [
      // The header's logo (tests/snapshot/EarlHeaderSnapshot.cpp): the sun and the name, 480 pixels high, the sun's
      // radius; the page draws the horizon under it
      { file: 'logo.png', tool: 'synthworld_earl_header_snapshot', args: ['480'] },
      {
        file: 'screenshots/synth.png',
        env: { SYNTHWORLD_SNAPSHOT_AUDIO: '1' },
        actions: [...earlOscillators, earlSaturatorOutput, 'move=600,620', 'wait=500'],
      },
      // Its skins, in the order it offers them (EarlUI.cpp; Tux is only on Linux): the Synth page in each as on the home
      // page, but with the third oscillator off
      ...['SW Default', 'SW Light', 'Deep Sea', 'Riso', 'Starship', 'Tux'].map((skin) => ({
        file: `skins/${skin.toLowerCase().replaceAll(' ', '-')}.png`,
        env: { SYNTHWORLD_SNAPSHOT_SKIN: skin, SYNTHWORLD_SNAPSHOT_PATCH: 'EARL Factory/Soft Pad', SYNTHWORLD_SNAPSHOT_AUDIO: '1' },
        actions: earlHome([]),
      })),
      // Its window on the home page (in SW Light) and in its node's pane on the synths' page (in SW Default), with the
      // third oscillator on, showing its unison
      ...[['SW Light', 'day'], ['SW Default', 'night']].map(([skin, when]) => ({
        file: `screenshots/home-${when}.png`,
        env: { SYNTHWORLD_SNAPSHOT_SKIN: skin, SYNTHWORLD_SNAPSHOT_PATCH: 'EARL Factory/Soft Pad', SYNTHWORLD_SNAPSHOT_AUDIO: '1' },
        actions: earlHome(earlThirdOscillator),
      })),
      // Its generators, close up, each playing a factory preset's chord: the first oscillator as each of its four (from
      // its menu: Wavetable Oscillator, Triple Oscillator, Sampler, Granular), and the noise as a coloured one with the
      // sub-oscillator under it
      ...[
        // The Wavefolder wavetable (SynthWorld Wavetables, Digital, in its selector's menu), some POS; its loop, POS
        // turned up through the table and back
        ['wavetable', ['click=150,65', 'click=150,137', 'click=320,181', 'click=420,269', 'wheel=258,228,6'], [turn(258, 228, 12)]],
        // Its second and third simple oscillators on, a saw and a square
        ['triple-oscillator', ['click=150,46', 'click=150,91', 'click=17,153', 'click=17,240', 'click=59,174', 'click=99,261']],
        // The sample from its selector's arrow
        ['sampler', ['click=150,46', 'click=150,113', 'click=230,65']],
        // The sample from its selector's menu, some POSITION and SPRAY; its loop, POSITION from 36 % to 90 % and back
        ['granular', ['click=150,46', 'click=150,135', 'click=184,65', 'click=184,115', 'click=314,115', 'wheel=44,230,8', 'wheel=244,263,8'], [turn(40, 224, 12)]],
      ].map(([name, actions, loop]) => ({
        file: `screenshots/${name}.png`,
        scale: 3,
        crop: [4, 34, 294, 281],
        env: { SYNTHWORLD_SNAPSHOT_PATCH: 'EARL Factory/Soft Pad', SYNTHWORLD_SNAPSHOT_AUDIO: '1' },
        actions: [...actions, 'move=600,620', 'wait=500'],
        loop,
      })),
      // The noise turned on, Colour Noise from its menu, pink; the sub-oscillator turned on. Its loop, its colours in
      // turn from pink's: brown, blue, violet, grey, green, white and pink again
      {
        file: 'screenshots/noise.png',
        scale: 3,
        crop: [892, 34, 304, 281],
        env: { SYNTHWORLD_SNAPSHOT_PATCH: 'EARL Factory/Soft Pad', SYNTHWORLD_SNAPSHOT_AUDIO: '1' },
        actions: ['click=905,47', 'click=1030,46', 'click=1000,91', 'click=948,132', 'click=907,234', 'move=600,620', 'wait=500'],
        loop: [press([987, 1024, 1061, 1097, 1134, 914, 948].map((x) => [x, 132]))],
      },
      // What the voice's sound goes through, close up, each in its tab under the oscillators, playing the "Everything"
      // benchmark's chord: its four filters, one of each kind (Filter 1 to 4: ladder, state variable, comb, formant), and
      // its distortions, the saturator in TUBE with its OUTPUT at 0 dB, and the bitcrusher turned on, its RATE at 3000 Hz.
      // Their loops, a knob of each turned and back: the ladder's CUTOFF down, the state variable's TYPE from low-pass
      // through band-pass to high-pass, the comb's FREQ up, the formant's VOWEL through its vowels, the saturator's
      // DRIVE up, and the bitcrusher's RATE down. The benchmark modulates the ladder's cutoff (an envelope) and the
      // formant's vowel (an LFO), which their displays would follow instead of their knobs: those modulations left out
      ...[
        ['filter-ladder', 'click=34,327', [3, 339, 597, 102], turn(258, 406, -7), ['Ladder Filter 1/cutoff']],
        ['filter-state-variable', 'click=95,327', [3, 339, 597, 102], turn(330, 406, 12)],
        ['filter-comb', 'click=157,327', [3, 339, 597, 102], turn(253, 406, 9)],
        ['filter-formant', 'click=219,327', [3, 339, 597, 102], turn(258, 406, 18), ['Formant Filter 4/vowel']],
        ['saturator', 'click=636,327', [600, 339, 597, 102], turn(1010, 406, 15)],
        ['bitcrusher', 'click=712,327', [600, 339, 597, 102], turn(1002, 406, -3)],
      ].map(([name, tab, crop, move, unmodulated]) => ({
        file: `screenshots/${name}.png`,
        scale: 3,
        crop,
        patch: {
          from: earlBench('Everything'),
          values: { 'Voice Saturator/function': 2, 'Voice Saturator/output': 0, 'Voice Bitcrusher/active': 1, 'Voice Bitcrusher/rate': 3000 },
          unmodulated,
        },
        env: { SYNTHWORLD_SNAPSHOT_AUDIO: '1' },
        actions: [tab, 'move=600,620', 'wait=500'],
        loop: [move],
      })),
      // The velvet noise's panel, turned on (its switch at its top left), the mouse away from it; its loop, DENSITY
      // turned up, the pulses thickening, and back
      {
        file: 'screenshots/velvet-noise.png',
        scale: 3,
        crop: [892, 34, 304, 184],
        actions: ['click=905,47', 'move=600,620'],
        loop: [turn(944, 130, 7)],
      },
      // The two unisons, close up: the first oscillator's (its unison button, 6 voices, some WT SPREAD), and the voice's
      // on the Notes page (7 voices, from its menu). Their loops, each one's WIDTH turned down, its voices drawn closer
      // together, and back
      {
        file: 'screenshots/oscillator-unison.png',
        scale: 3,
        crop: [4, 34, 294, 281],
        actions: ['click=20,90', 'wheel=55,225,8', 'wheel=110,288,3', 'move=150,330'],
        loop: [turn(246, 227, -15)],
      },
      {
        file: 'screenshots/voice-unison.png',
        scale: 3,
        crop: [816, 192, 382, 283],
        actions: ['click=343,14', 'click=977,323', 'click=960,478'],
        loop: [turn(1053, 393, -12)],
      },
      // The randomiser's panel, opened from the die in the header beside the window (which widens it), with CHOICES,
      // MOD AMOUNTS and CONNECTIONS on besides VALUES
      {
        file: 'screenshots/randomiser.png',
        scale: 3,
        crop: [1201, 1, 339, 312],
        actions: ['click=1062,14', 'click=1350,120', 'click=1350,155', 'click=1350,225', 'move=700,500'],
      },
      // Its pages, each with something in it, a chord playing. The Graph of every processor, zoomed in a notch and
      // dragged right to show the notes' nodes, its nodes alone
      {
        file: 'screenshots/graph.png',
        crop: [14, 32, 1158, 390],
        env: { SYNTHWORLD_SNAPSHOT_PATCH: earlBench('Everything'), SYNTHWORLD_SNAPSHOT_AUDIO: '1' },
        actions: ['click=297,14', 'wheel=600,200,1', 'drag=700,470,790,480', 'move=600,620', 'wait=500'],
      },
      // The voice's matrix alone (the global one is empty)
      {
        file: 'screenshots/mod-matrix.png',
        crop: [0, 31, 600, 533],
        env: { SYNTHWORLD_SNAPSHOT_PATCH: earlBench('Modulation Matrix'), SYNTHWORLD_SNAPSHOT_AUDIO: '1' },
        actions: ['click=252,14', 'move=900,620', 'wait=500'],
      },
      // The FX page's eight effects, with the global envelope and the audio input on. The chorus, the flanger, the phaser
      // and the reverb as they are by default, but the chorus' DEPTH at its most (20 ms), and the reverb's WIDTH at its
      // most and its DECAY at 0.5 s; the bitcrusher's RATE at 3000 Hz
      {
        file: 'screenshots/global.png',
        crop: earlPage,
        patch: {
          from: earlBench('Everything'),
          defaults: ['Chorus D', 'Flanger E', 'Phaser F', 'Reverb H'],
          values: { 'Bitcrusher C/rate': 3000, 'Chorus D/depth': 20, 'Reverb H/width': 1, 'Reverb H/decay': 0.5 },
        },
        env: { SYNTHWORLD_SNAPSHOT_AUDIO: '1' },
        actions: ['click=180,14', 'click=17,476', 'click=957,476', 'move=600,620', 'wait=500'],
      },
      // The transposition, the chord maker and the arpeggiator on, and five voices of unison (from its menu)
      {
        file: 'screenshots/notes.png',
        crop: earlPage,
        env: { SYNTHWORLD_SNAPSHOT_PATCH: 'EARL Factory/Soft Pad', SYNTHWORLD_SNAPSHOT_AUDIO: '1' },
        actions: ['click=343,14', 'click=17,46', 'click=237,46', 'click=17,204', 'click=977,323', 'click=960,434', 'move=600,620', 'wait=500'],
      },
      // A microtonal preset's tuning, Bohlen-Pierce, chosen in the browser too (SynthWorld Tunings, Beyond the octave)
      {
        file: 'screenshots/tuning.png',
        crop: earlPage,
        env: { SYNTHWORLD_SNAPSHOT_PATCH: 'EARL Microtonal/Bohlen-Pierce Squares', SYNTHWORLD_SNAPSHOT_AUDIO: '1' },
        actions: ['click=393,14', 'click=25,157', 'click=37,179', 'click=95,223', 'move=600,620', 'wait=500'],
      },
    ],
  },
};

/**
 * SynthWorld's mark, in its two forms. The flat one, as the skin draws it for a symbol (SWSkin::drawMainSymbol(): the
 * ring in the palette's highlight and the planet in its accent), for the site's header and the favicon; the shaded
 * one, the logo (SynthWorldLogo::drawMark(): the planet a lit sphere, the ring fading as it goes behind), for the home
 * page's sky. The logo's tool (tests/snapshot/LogoSnapshot.cpp) draws them on a sheet with its other forms, on the
 * panel's colour: rows of marks of growing sizes, the first row flat in one colour (the foreground), the second flat
 * in the skin's two, the fourth shaded. The largest of each is cut out onto a transparent background: the flat one's
 * cover of each pixel worked out from the first row's, the shaded one's from its own colours (see takeShaded()). Under
 * them, the wide logos (the shaded mark, then the name): the name of the largest is cut out too (see takeName()), for
 * the home page's sky, over the shaded mark.
 */
const MARK = {
  tool: 'synthworld_logo_snapshot',
  /** Pixels per unit of the sheet: its largest mark is 220 units high */
  scale: 4,
  /** The sheet's layout (LogoSnapshot.cpp): its margin, and its rows of marks' height */
  margin: 12,
  row: 220,
  file: 'src/assets/synthworld/mark.png',
  shaded: { row: 3, file: 'src/assets/synthworld/logo.png' },
  /** The name, from the largest wide logo (under the rows of marks, after two smaller ones, each this high) */
  name: { file: 'src/assets/synthworld/name.png', rows: 4, wide: [24, 48, 120] },
  favicon: { file: 'public/favicon.png', size: 64 },
};

/** The colours of a part of an image (RGBA), the most used first: [r, g, b] and how many pixels have it. */
function coloursOf(pixels, width, [left, top, right, bottom]) {
  const counts = new Map();
  for (let y = top; y < bottom; y++)
    for (let x = left; x < right; x++) {
      const i = (y * width + x) * 4;
      const key = (pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2];
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  return [...counts].sort((a, b) => b[1] - a[1]).map(([key]) => [key >> 16, (key >> 8) & 255, key & 255]);
}

/**
 * The shaded mark, cut out of the sheet (its box in it) onto a transparent background. The planet is opaque, and
 * everything drawn on it too: the disc, found from its top and bottom (the mark's), is kept as it is, its edge as
 * much as the disc covers of each pixel. Outside it, only the ring: the foreground, going towards the planet's
 * colour (the accent) as it turns away, and fading as it goes behind; each pixel is worked out as such a colour over
 * the panel, how much of it there is and how far towards the accent it goes the nearest to what's drawn there.
 */
async function takeShaded(sheet, sheetWidth, top, height, { left, width }, panel) {
  const palette = await readFile(path.join(root, 'src/styles/palette.css'), 'utf8');
  const colourOf = (name) => {
    const hex = palette.match(new RegExp(`--${name}:\\s*#([0-9a-f]{6})`, 'i'))?.[1];
    if (!hex) throw new Error(`No --${name} in src/styles/palette.css`);
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  };
  const foreground = colourOf('foreground');
  const accent = colourOf('accent');
  const at = (x, y) => ((top + y) * sheetWidth + left + x) * 4;
  const differs = (i) => [0, 1, 2].some((k) => sheet[i + k] !== panel[k]);

  // The disc: from the mark's top row to its bottom one, centred under the middle of the top row's drawn pixels
  const drawnInRow = (y) => [...Array(width).keys()].filter((x) => differs(at(x, y)));
  let first = 0;
  while (first < height && drawnInRow(first).length === 0) first++;
  let last = height - 1;
  while (last > first && drawnInRow(last).length === 0) last--;
  const topRow = drawnInRow(first);
  const centre = [(topRow[0] + topRow[topRow.length - 1] + 1) / 2, (first + last + 1) / 2];
  const radius = (last + 1 - first) / 2;

  // The ring's colours over the panel: what's drawn there less the panel, as some of the way from the panel to the
  // foreground (u) and some from the foreground to the accent (v), the least squares of the two
  const toForeground = foreground.map((c, k) => c - panel[k]);
  const toAccent = accent.map((c, k) => c - foreground[k]);
  const dot = (a, b) => a.reduce((sum, c, k) => sum + c * b[k], 0);
  const [ff, fa, aa] = [dot(toForeground, toForeground), dot(toForeground, toAccent), dot(toAccent, toAccent)];
  const determinant = ff * aa - fa * fa;

  const logo = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = at(x, y);
      const drawn = [sheet[i], sheet[i + 1], sheet[i + 2]];
      const fromPanel = drawn.map((c, k) => c - panel[k]);
      const [pf, pa] = [dot(fromPanel, toForeground), dot(fromPanel, toAccent)];
      const ring = Math.min(1, Math.max(0, (pf * aa - pa * fa) / determinant));
      const disc = Math.min(1, Math.max(0, radius + 0.5 - Math.hypot(x + 0.5 - centre[0], y + 0.5 - centre[1])));
      const alpha = Math.max(ring, disc);
      // The colour, unmixed from the panel's
      const colour = alpha > 0 ? drawn.map((c, k) => Math.round(Math.min(255, Math.max(0, (c - (1 - alpha) * panel[k]) / alpha)))) : [0, 0, 0];
      logo.set([...colour, Math.round(alpha * 255)], (y * width + x) * 4);
    }
  await sharp(logo, { raw: { width, height, channels: 4 } })
    .extract({ left: 0, top: first, width, height: last + 1 - first })
    .trim({ background: '#00000000', threshold: 0 })
    .png()
    .toFile(path.join(root, MARK.shaded.file));
  console.log(`synthworld: ${MARK.shaded.file}`);
}

/**
 * SynthWorld's name, as the largest wide logo draws it after the mark, in the foreground, cut out onto a transparent
 * background: how much of each pixel it covers is how far it goes from the panel towards the foreground. The wide logo
 * is drawn twice side by side, on the panel and on the background's colour; along the first, the columns drawn in
 * fall into the mark, the name's letters, and the second's box, which fills its band to the top. The name is from
 * the gap after the mark to the one before that box.
 */
async function takeName(sheet, sheetWidth, panel) {
  const { file, rows, wide } = MARK.name;
  const top = Math.round((MARK.margin + rows * (MARK.row + MARK.margin) + wide.slice(0, -1).reduce((sum, h) => sum + h + MARK.margin, 0)) * MARK.scale);
  const height = Math.round(wide[wide.length - 1] * MARK.scale);
  const at = (x, y) => ((top + y) * sheetWidth + x) * 4;
  const differs = (i) => [0, 1, 2].some((k) => sheet[i + k] !== panel[k]);
  const drawnIn = (x) => {
    for (let y = 0; y < height; y++) if (differs(at(x, y))) return true;
    return false;
  };

  // The columns: past the margin, the mark's, then a gap, then the name's until the second box
  let x = Math.round(MARK.margin * MARK.scale);
  while (!drawnIn(x)) x++;
  while (drawnIn(x)) x++;
  while (!drawnIn(x)) x++;
  const left = x;
  let right = left;
  for (; !differs(at(x, 0)); x++) if (drawnIn(x)) right = x;
  const width = right + 1 - left;

  const foreground = (await readFile(path.join(root, 'src/styles/palette.css'), 'utf8')).match(/--foreground:\s*#([0-9a-f]{6})/i)?.[1];
  if (!foreground) throw new Error('No --foreground in src/styles/palette.css');
  const colour = [0, 2, 4].map((i) => parseInt(foreground.slice(i, i + 2), 16));
  const towards = colour.map((c, k) => c - panel[k]);
  const length = towards.reduce((sum, c) => sum + c * c, 0);
  const name = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = at(left + x, y);
      const cover = Math.min(1, Math.max(0, towards.reduce((sum, c, k) => sum + c * (sheet[i + k] - panel[k]), 0) / length));
      name.set([...colour, Math.round(cover * 255)], (y * width + x) * 4);
    }
  await sharp(name, { raw: { width, height, channels: 4 } })
    .trim({ background: '#00000000', threshold: 0 })
    .png()
    .toFile(path.join(root, file));
  console.log(`synthworld: ${file}`);
}

async function takeMark() {
  const tool = path.join(build, 'tests', MARK.tool);
  if (!existsSync(tool)) throw new Error(`No ${tool}: build it in the framework (cmake --build build --target ${MARK.tool})`);
  const output = path.join(root, MARK.file);
  await mkdir(path.dirname(output), { recursive: true });
  const sheetFile = `${output}.sheet.png`;
  execFileSync(tool, [sheetFile, String(MARK.scale)], { stdio: 'inherit' });
  const { data: sheet, info } = await sharp(sheetFile).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  await rm(sheetFile);

  const at = (x, y) => (y * info.width + x) * 4;
  const panel = [...sheet.subarray(0, 3)];
  const differs = (i) => Math.abs(sheet[i] - panel[0]) + Math.abs(sheet[i + 1] - panel[1]) + Math.abs(sheet[i + 2] - panel[2]) > 0;

  // The rows' bands, and a row's largest mark's box: its last one, from the rightmost column drawn in to the gap (a
  // margin) before it. The flat marks' rows have the same boxes
  const rowTop = (row) => Math.round((MARK.margin + row * (MARK.row + MARK.margin)) * MARK.scale);
  const height = Math.round(MARK.row * MARK.scale);
  const largestIn = (row) => {
    const drawnIn = (x) => {
      for (let y = rowTop(row); y < rowTop(row) + height; y++) if (differs(at(x, y))) return true;
      return false;
    };
    let right = info.width - 1;
    while (right > 0 && !drawnIn(right)) right--;
    let left = right;
    for (let gap = 0; left > 0 && gap < (MARK.margin * MARK.scale) / 2; left--) gap = drawnIn(left - 1) ? 0 : gap + 1;
    left += Math.round((MARK.margin * MARK.scale) / 2);
    return { left, right, width: right + 1 - left };
  };
  const { left, right, width } = largestIn(0);

  // The colours: the first row's one (the most used but the panel's), the second's two
  const [foreground] = coloursOf(sheet, info.width, [left, rowTop(0), right + 1, rowTop(0) + height]).filter((c) => c.join() !== panel.join());
  const twoColours = coloursOf(sheet, info.width, [left, rowTop(1), right + 1, rowTop(1) + height]).filter((c) => c.join() !== panel.join()).slice(0, 2);

  // Each pixel: how much of it the mark covers (how far the first row's goes from the panel towards the foreground),
  // and the colour of the second row's it's nearer to, so drawn on the panel
  const mark = Buffer.alloc(width * height * 4);
  const towards = foreground.map((c, k) => c - panel[k]);
  const length = towards.reduce((sum, c) => sum + c * c, 0);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const one = at(left + x, rowTop(0) + y);
      const two = at(left + x, rowTop(1) + y);
      const cover = Math.min(1, Math.max(0, towards.reduce((sum, c, k) => sum + c * (sheet[one + k] - panel[k]), 0) / length));
      const error = (colour) => colour.reduce((sum, c, k) => sum + (sheet[two + k] - (cover * c + (1 - cover) * panel[k])) ** 2, 0);
      const colour = error(twoColours[0]) <= error(twoColours[1]) ? twoColours[0] : twoColours[1];
      mark.set([...colour, Math.round(cover * 255)], (y * width + x) * 4);
    }
  await sharp(mark, { raw: { width, height, channels: 4 } }).png().toFile(output);
  console.log(`synthworld: ${MARK.file}`);
  await takeShaded(sheet, info.width, rowTop(MARK.shaded.row), height, largestIn(MARK.shaded.row), panel);
  await takeName(sheet, info.width, panel);

  // The favicon: the mark on the background's colour, in a square with round corners (a tab may be light)
  const { size } = MARK.favicon;
  const background = (await readFile(path.join(root, 'src/styles/palette.css'), 'utf8')).match(/--background:\s*(#[0-9a-f]{6})/i)?.[1];
  if (!background) throw new Error('No --background in src/styles/palette.css');
  const inner = Math.round(size * 0.84);
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${background}"/></svg>`))
    .composite([{ input: await sharp(output).resize(inner, inner, { fit: 'contain', background: '#0000' }).toBuffer(), gravity: 'center' }])
    .png()
    .toFile(path.join(root, MARK.favicon.file));
  console.log(`synthworld: ${MARK.favicon.file}`);
}

/**
 * A shot's patch (its `patch`): a preset file's (`from`), with the parameters of the processors it names in `defaults`
 * left out, so that they're as they are by default, its `values` set (in the parameters' own units), and the
 * modulations of the parameters it names in `unmodulated` left out, so that their displays show them as their knobs
 * do, in a file of its own in a temporary folder.
 */
async function patchFile({ from, defaults = [], values = {}, unmodulated = [] }) {
  const preset = JSON.parse(await readFile(from, 'utf8'));
  const patch = preset.patch ?? preset;
  for (const name of Object.keys(patch.parameters))
    if (defaults.some((processor) => name.startsWith(`${processor}/`))) delete patch.parameters[name];
  Object.assign(patch.parameters, values);
  patch.modulations = (patch.modulations ?? []).filter(({ parameter }) => !unmodulated.includes(parameter));
  const file = path.join(await mkdtemp(path.join(os.tmpdir(), 'synthworld-site-patch-')), 'patch.json');
  await writeFile(file, JSON.stringify(patch));
  return file;
}

/**
 * A shot's loop, into public/loops/<synth>/<its file's name>.mp4: after its actions, it holds still for a second (as
 * its picture shows it), then its moves in turn, each frame drawn by the tool at the shot's scale, its part of the
 * window alone, and the frames made into a silent H.264 video (in 4:2:0, which every browser plays; an even number of
 * pixels each way, the last row or column left out if need be), the palette's colours as the picture has them (sRGB,
 * tagged as such).
 */
async function takeLoop(tool, env, scale, shot, output) {
  const frames = [...Array.from({ length: LOOP_FPS }, () => []), ...shot.loop.flat()];
  const folder = await mkdtemp(path.join(os.tmpdir(), 'synthworld-site-loop-'));
  const frameFile = (index) => path.join(folder, `${String(index).padStart(4, '0')}.png`);
  const actions = [
    `scale=${scale}`,
    ...shot.actions,
    ...(shot.crop ? [`crop=${shot.crop.join(',')}`] : []),
    ...frames.flatMap((done, index) => [...done, `wait=${1000 / LOOP_FPS}`, `shot=${frameFile(index)}`]),
  ];
  execFileSync(tool, [path.join(folder, 'last.png'), ...actions], { env, stdio: 'inherit' });
  await mkdir(path.dirname(output), { recursive: true });
  // prettier-ignore
  execFileSync('ffmpeg', [
    '-loglevel', 'error', '-y', '-framerate', String(LOOP_FPS), '-i', path.join(folder, '%04d.png'),
    '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2:0:0,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,setparams=colorspace=bt709:color_primaries=bt709:color_trc=iec61966-2-1:range=tv',
    '-c:v', 'libx264', '-preset', 'veryslow', '-crf', '22', '-tune', 'animation',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'iec61966-2-1',
    '-movflags', '+faststart', '-an', output,
  ], { stdio: 'inherit' });
  await rm(folder, { recursive: true });
}

// What to take: everything, or the synths named ("earl"), or their shots named after their files ("earl/wavetable")
const only = process.argv.slice(2);
if (only.length === 0 || only.includes('synthworld')) await takeMark();
for (const [id, synth] of Object.entries(synths)) {
  const shots = only.filter((name) => name.startsWith(`${id}/`)).map((name) => name.slice(id.length + 1));
  if (only.length > 0 && !only.includes(id) && shots.length === 0) continue;

  for (const shot of synth.shots) {
    const name = path.basename(shot.file, path.extname(shot.file));
    if (shots.length > 0 && !only.includes(id) && !shots.includes(name)) continue;
    const tool = path.join(build, 'tests', shot.tool ?? synth.tool);
    if (!existsSync(tool)) throw new Error(`No ${tool}: build it in the framework (cmake --build build --target ${path.basename(tool)})`);

    const output = path.join(root, 'src/content/synths', id, shot.file);
    const scale = shot.scale ?? SCALE;
    const drawn = shot.crop ? `${output}.whole.png` : output;
    const args = shot.tool ? (shot.args ?? []) : [`scale=${scale}`, ...(shot.actions ?? [])];
    const patch = shot.patch && (await patchFile(shot.patch));
    const env = { ...process.env, ...synth.env, ...shot.env, ...(patch && { SYNTHWORLD_SNAPSHOT_PATCH: patch }) };
    execFileSync(tool, [drawn, ...args], { env, stdio: 'inherit' });
    if (shot.crop) {
      const [left, top, width, height] = shot.crop.map((units) => Math.round(units * scale));
      await sharp(drawn).extract({ left, top, width, height }).toFile(output);
      await rm(drawn);
    }
    console.log(`${id}: ${shot.file}`);
    if (shot.loop) {
      const loop = path.join('public/loops', id, `${name}.mp4`);
      await takeLoop(tool, env, scale, shot, path.join(root, loop));
      console.log(`${id}: ${loop}`);
    }
    if (patch) await rm(path.dirname(patch), { recursive: true });
  }
}
