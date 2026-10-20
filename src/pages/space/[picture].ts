import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import sharp from 'sharp';
import { makeNebula, makeStars, makeWorld, planetPicture, skinOf, type Tile, type World } from '@/space';
import { unchartedWorlds } from '@/synths';
import palette from '@/styles/palette.css?raw';

const encode = ({ side, pixels }: Tile) => sharp(pixels, { raw: { width: side, height: side, channels: 4 } });

// The pictures of space (src/space.ts), made at build time. The stars as they are; the nebula, drawn five times larger
// than its picture, lossy (a sixth of the size, and no different), and twice as wide as the skin's, as a page is wider
// than a synth's window: it repeats every 1280 pixels, not every 640
const pictures = {
  'stars.png': { type: 'image/png', make: () => encode(makeStars()).png().toBuffer() },
  'nebula.webp': { type: 'image/webp', make: () => encode(makeNebula(8)).webp({ quality: 80 }).toBuffer() },
};

/** A planet's picture to make: its kind, whether it's uncharted, and the window it's made of, if it's a synth's. */
interface Planet {
  world: World;
  uncharted: boolean;
  window?: string;
}

// The planets (Planet), lossy too: the synths' and the uncharted ones' kinds only, as each takes a moment to make. The
// cockpit's light round their far edge is the palette's accent, as the skin's is its own cyan. A synth's is made of its
// window in its planet's skin, its picture where `npm run screenshots` puts it: skins/<skin>.png in its folder, at a
// width enough for the planet
const accent = Number.parseInt(/--accent:\s*#([0-9a-f]{6})/i.exec(palette)?.[1] ?? 'a57edb', 16);
const WINDOW_WIDTH = 1200;
const nameOf = ({ world, uncharted }: Planet) => planetPicture(world, uncharted).replace('/space/', '');
const windowOf = (world: World, synthFile?: string) => {
  const skin = skinOf(world);
  if (!skin) return undefined;
  if (!synthFile) throw new Error(`The planet "${world}" is made of a synth's window, but its synth has no folder`);
  return `${synthFile.slice(0, synthFile.lastIndexOf('/'))}/skins/${skin.toLowerCase().replaceAll(' ', '-')}.png`;
};
const makePlanet = async ({ world, uncharted, window }: Planet) => {
  const picture =
    window && (await sharp(window).resize({ width: WINDOW_WIDTH }).removeAlpha().raw().toBuffer({ resolveWithObject: true }));
  const made = makeWorld(world, accent, uncharted, picture ? { ...picture.info, pixels: picture.data } : undefined);
  return encode(made).webp({ quality: 85, alphaQuality: 90 }).toBuffer();
};

export async function getStaticPaths() {
  const planets: Planet[] = [
    ...(await getCollection('synths')).map(({ data, filePath }) => ({ world: data.planet, uncharted: false, window: windowOf(data.planet, filePath) })),
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
