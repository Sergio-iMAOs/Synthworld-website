import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import sharp from 'sharp';
import { makeNebula, makeStars, makeWorld, planetPicture, worlds, type Tile, type World } from '@/space';
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

// The planets (Planet), lossy too: the synths' and the uncharted ones' kinds only, as each takes a moment to make. The
// cockpit's light round their far edge is the palette's accent, as the skin's is its own cyan
const accent = Number.parseInt(/--accent:\s*#([0-9a-f]{6})/i.exec(palette)?.[1] ?? 'a57edb', 16);
const planetName = (address: string) => address.replace('/space/', '');
const planet = (name: string) => {
  const uncharted = name.startsWith('uncharted-');
  const world = worlds.find((world) => name === planetName(planetPicture(world, uncharted)));
  return world && { type: 'image/webp', make: () => encode(makeWorld(world, accent, uncharted)).webp({ quality: 85, alphaQuality: 90 }).toBuffer() };
};

export async function getStaticPaths() {
  const planets = [
    ...(await getCollection('synths')).map(({ data }) => planetPicture(data.planet)),
    ...unchartedWorlds.map((world: World) => planetPicture(world, true)),
  ].map(planetName);
  return [...new Set([...Object.keys(pictures), ...planets])].map((picture) => ({ params: { picture } }));
}

export const GET: APIRoute = async ({ params }) => {
  const name = params.picture!;
  const picture = pictures[name as keyof typeof pictures] ?? planet(name);
  if (!picture) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(await picture.make()), { headers: { 'Content-Type': picture.type } });
};
