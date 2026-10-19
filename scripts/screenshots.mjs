// Takes the synths' screenshots (npm run screenshots): the framework's snapshot tool draws a synth's window
// without a window or a host, driven by a script of clicks, into the PNG files its synth.yaml shows. Run it after
// the synth's UI changes, look at them, and commit them. The tools are built in the framework's tree:
//   cmake --build build --target synthworld_earl_snapshot      (in ../Synthworld)
// The framework is looked for next to this repository (../Synthworld), or where SYNTHWORLD_DIR says, and its build
// in its build/ folder, or where SYNTHWORLD_BUILD_DIR says. `npm run screenshots -- earl` takes one synth's only, and
// `npm run screenshots -- synthworld` SynthWorld's mark only.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm } from 'node:fs/promises';
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

/**
 * SynthWorld's mark, as the skin draws it for a symbol (SWSkin::drawMainSymbol(): flat, the ring in the palette's
 * highlight and the planet in its accent), for the site's header, the home page's and the favicon. The logo's tool
 * (tests/snapshot/LogoSnapshot.cpp) draws it on a sheet with its other forms, on the panel's colour: rows of marks of
 * growing sizes, the first row in one colour (the foreground), the second in the skin's two. The largest of each is
 * cut out, and how much of each pixel the mark covers worked out from the first, so that the mark's own colours are
 * left on a transparent background.
 */
const MARK = {
  tool: 'synthworld_logo_snapshot',
  /** Pixels per unit of the sheet: its largest mark is 220 units high */
  scale: 4,
  /** The sheet's layout (LogoSnapshot.cpp): its margin, and its rows of marks' height */
  margin: 12,
  row: 220,
  file: 'src/assets/synthworld/mark.png',
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

  // The rows' bands, and the largest mark's box: the last one in the first row, from the rightmost column drawn in to
  // the gap (a margin) before it
  const rowTop = (row) => Math.round((MARK.margin + row * (MARK.row + MARK.margin)) * MARK.scale);
  const height = Math.round(MARK.row * MARK.scale);
  const drawnIn = (x) => {
    for (let y = rowTop(0); y < rowTop(0) + height; y++) if (differs(at(x, y))) return true;
    return false;
  };
  let right = info.width - 1;
  while (right > 0 && !drawnIn(right)) right--;
  let left = right;
  for (let gap = 0; left > 0 && gap < (MARK.margin * MARK.scale) / 2; left--) gap = drawnIn(left - 1) ? 0 : gap + 1;
  left += Math.round((MARK.margin * MARK.scale) / 2);
  const width = right + 1 - left;

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

const only = process.argv.slice(2);
if (only.length === 0 || only.includes('synthworld')) await takeMark();
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
