// Takes the synths' screenshots (npm run screenshots): the framework's snapshot tool draws a synth's window
// without a window or a host, driven by a script of clicks, into the PNG files its synth.yaml shows. Run it after
// the synth's UI changes, look at them, and commit them. The tools are built in the framework's tree:
//   cmake --build build --target synthworld_earl_snapshot      (in ../Synthworld)
// The framework is looked for next to this repository (../Synthworld), or where SYNTHWORLD_DIR says, and its build
// in its build/ folder, or where SYNTHWORLD_BUILD_DIR says. `npm run screenshots -- earl` takes one synth's only.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
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
// crop, [x, y, width, height] in the window's units, a part of the window alone; its scale, if not SCALE. A shot
// with a tool of its own is drawn by it, with its args in place of the scale and the actions (the logo).
// Its file is where synth.yaml looks for it, from the synth's folder.
const synths = {
  earl: {
    tool: 'synthworld_earl_snapshot',
    // The skin the site's colours are taken from (src/styles/palette.css), not EARL's own default (SW Light)
    env: { SYNTHWORLD_SNAPSHOT_SKIN: 'SW Default' },
    // The pages' tabs, in the header: Synth (130,14), Global (180,14), Mod Matrix (252,14), Graph (297,14),
    // Notes (343,14), Tuning (393,14), Settings (447,14)
    shots: [
      // The header's logo (tests/snapshot/EarlHeaderSnapshot.cpp): the sun and the name, 480 pixels high, the sun's
      // radius; the page draws the horizon under it
      { file: 'logo.png', tool: 'synthworld_earl_header_snapshot', args: ['480'] },
      { file: 'screenshots/synth.png', env: { SYNTHWORLD_SNAPSHOT_AUDIO: '1' }, actions: ['wait=500'] },
      // The velvet noise's panel, turned on (its switch at its top left)
      { file: 'screenshots/velvet-noise.png', scale: 3, crop: [892, 34, 304, 184], actions: ['click=905,47'] },
      // The two unisons, close up: the first oscillator's (its unison button, 6 voices, some WT SPREAD), and the voice's
      // on the Notes page (7 voices, from its menu)
      {
        file: 'screenshots/oscillator-unison.png',
        scale: 3,
        crop: [4, 34, 294, 281],
        actions: ['click=20,90', 'wheel=55,225,8', 'wheel=110,288,3', 'move=150,330'],
      },
      {
        file: 'screenshots/voice-unison.png',
        scale: 3,
        crop: [816, 192, 382, 283],
        actions: ['click=343,14', 'click=977,323', 'click=960,478'],
      },
      // The randomiser's panel, opened from the die in the header, with more than VALUES on
      {
        file: 'screenshots/randomiser.png',
        scale: 3,
        crop: [412, 41, 339, 316],
        actions: ['click=1062,14', 'click=561,160', 'click=561,195', 'click=561,301', 'move=700,500'],
      },
      { file: 'screenshots/graph.png', actions: ['click=297,14'] },
      { file: 'screenshots/mod-matrix.png', actions: ['click=252,14'] },
      { file: 'screenshots/global.png', actions: ['click=180,14'] },
      { file: 'screenshots/notes.png', actions: ['click=343,14'] },
      { file: 'screenshots/tuning.png', actions: ['click=393,14'] },
    ],
  },
};

const only = process.argv.slice(2);
for (const [id, synth] of Object.entries(synths)) {
  if (only.length > 0 && !only.includes(id)) continue;

  for (const shot of synth.shots) {
    const tool = path.join(build, 'tests', shot.tool ?? synth.tool);
    if (!existsSync(tool)) throw new Error(`No ${tool}: build it in the framework (cmake --build build --target ${path.basename(tool)})`);

    const output = path.join(root, 'src/content/synths', id, shot.file);
    const scale = shot.scale ?? SCALE;
    const drawn = shot.crop ? `${output}.whole.png` : output;
    const args = shot.tool ? (shot.args ?? []) : [`scale=${scale}`, ...(shot.actions ?? [])];
    execFileSync(tool, [drawn, ...args], {
      env: { ...process.env, ...synth.env, ...shot.env },
      stdio: 'inherit',
    });
    if (shot.crop) {
      const [left, top, width, height] = shot.crop.map((units) => Math.round(units * scale));
      await sharp(drawn).extract({ left, top, width, height }).toFile(output);
      await rm(drawn);
    }
    console.log(`${id}: ${shot.file}`);
  }
}
