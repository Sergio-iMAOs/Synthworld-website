import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import sharp from 'sharp';
import { chunksPicture, makeNebula, makeRays, makeStars, makeSynthWorld, makeWorld, planetPicture, skinOf, type Tile, type World } from '@/space';
import { unchartedWorlds } from '@/synths';
import palette from '@/styles/palette.css?raw';

const encode = ({ side, pixels }: Tile) => sharp(pixels, { raw: { width: side, height: side, channels: 4 } });
const paletteColour = (name: string, otherwise: number) => Number.parseInt(new RegExp(`--${name}:\\s*#([0-9a-f]{6})`, 'i').exec(palette)?.[1] ?? otherwise.toString(16), 16);

// The light bursting out of a synth's planet as it opens (its page's .rays): violet rays, white ones under them, faded
// out from the middle; as wide as they're drawn at most (the planet at its largest, grown as it opens)
const RAYS_SIDE = 1200;
const makeOpeningRays = () =>
  makeRays(
    RAYS_SIDE,
    [
      { from: 3, every: 13, rise: 5, peak: 6.5, fall: 8, colour: paletteColour('accent', 0xa57edb), alpha: 0.55 },
      { from: 31, every: 19, rise: 9, peak: 10, fall: 11, colour: paletteColour('foreground', 0xf7f6fa), alpha: 0.35 },
    ],
    [
      [0.15, 1],
      [0.4, 0.6],
      [0.8, 0],
    ],
  );

// The pictures of space (src/space.ts), made at build time. The stars as they are; the nebula, drawn five times larger
// than its picture, lossy (a sixth of the size, and no different), and twice as wide as the skin's, as a page is wider
// than a synth's window: it repeats every 1280 pixels, not every 640
const pictures = {
  'stars.png': { type: 'image/png', make: () => encode(makeStars()).png().toBuffer() },
  'nebula.webp': { type: 'image/webp', make: () => encode(makeNebula(8)).webp({ quality: 80 }).toBuffer() },
  'rays.webp': { type: 'image/webp', make: () => encode(makeOpeningRays()).webp({ quality: 80, alphaQuality: 80 }).toBuffer() },
};

/**
 * A planet's picture to make: its kind, whether it's uncharted, and, a synth's, the window it's made of and which of its
 * layers it is (its inside, or its chunks).
 */
interface Planet {
  world: World;
  uncharted: boolean;
  window?: string;
  layer?: 'core' | 'chunks';
}

// The planets (Planet), lossy too: the synths' and the uncharted ones' kinds only, as each takes a moment to make. The
// cockpit's light round their far edge is the palette's accent, as the skin's is its own cyan. A synth's is made of its
// window in its planet's skin, its picture where `npm run screenshots` puts it: skins/<skin>.png in its folder, at a
// width enough for the planet; it's made once for both its layers
const accent = paletteColour('accent', 0xa57edb);
const WINDOW_WIDTH = 1200;
const nameOf = ({ world, uncharted, layer }: Planet) => (layer === 'chunks' ? chunksPicture(world) : planetPicture(world, uncharted)).replace('/space/', '');
const windowOf = (world: World, synthFile?: string) => {
  const skin = skinOf(world);
  if (!skin) return undefined;
  if (!synthFile) throw new Error(`The planet "${world}" is made of a synth's window, but its synth has no folder`);
  return `${synthFile.slice(0, synthFile.lastIndexOf('/'))}/skins/${skin.toLowerCase().replaceAll(' ', '-')}.png`;
};
const synthWorlds = new Map<string, ReturnType<typeof makeSynthWorld>>();
const makePlanet = async ({ world, uncharted, window, layer }: Planet) => {
  const options = { quality: 85, alphaQuality: 90 };
  if (!window) return encode(makeWorld(world, accent, uncharted)).webp(options).toBuffer();
  if (!synthWorlds.has(window)) {
    const { data, info } = await sharp(window).resize({ width: WINDOW_WIDTH }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    synthWorlds.set(window, makeSynthWorld(world, accent, { ...info, pixels: data }));
  }
  const { core, chunks } = synthWorlds.get(window)!;
  if (layer === 'core') return encode(core).webp(options).toBuffer();
  return sharp(chunks.pixels, { raw: { width: chunks.width, height: chunks.height, channels: 4 } }).webp(options).toBuffer();
};

export async function getStaticPaths() {
  const planets: Planet[] = [
    ...(await getCollection('synths')).flatMap(({ data, filePath }) => {
      const window = windowOf(data.planet, filePath);
      const planet = { world: data.planet, uncharted: false, window };
      return window ? [{ ...planet, layer: 'core' as const }, { ...planet, layer: 'chunks' as const }] : [planet];
    }),
    ...unchartedWorlds.map((world) => ({ world, uncharted: true })),
  ];
  return [
    ...Object.keys(pictures).map((picture) => ({ params: { picture }, props: {} })),
    ...[...new Map(planets.map((planet) => [nameOf(planet), planet])).entries()].map(([picture, planet]) => ({ params: { picture }, props: { planet } })),
  ];
}

export const GET: APIRoute<{ planet?: Planet }> = async ({ params, props }) => {
  const fixed = pictures[params.picture as keyof typeof pictures];
  const made = fixed ? await fixed.make() : props.planet && (await makePlanet(props.planet));
  if (!made) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(made), { headers: { 'Content-Type': fixed?.type ?? 'image/webp' } });
};
