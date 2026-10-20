import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { makeNebula, makeStars, type Tile } from '@/space';

const encode = ({ side, pixels }: Tile) => sharp(pixels, { raw: { width: side, height: side, channels: 4 } });

// The pictures of space (src/space.ts), made at build time. The stars as they are; the nebula, drawn five times larger
// than its picture, lossy (a sixth of the size, and no different), and twice as wide as the skin's, as a page is wider
// than a synth's window: it repeats every 1280 pixels, not every 640
const pictures = {
  'stars.png': { type: 'image/png', make: () => encode(makeStars()).png().toBuffer() },
  'nebula.webp': { type: 'image/webp', make: () => encode(makeNebula(8)).webp({ quality: 80 }).toBuffer() },
};

export const getStaticPaths = () => Object.keys(pictures).map((picture) => ({ params: { picture } }));

export const GET: APIRoute = async ({ params }) => {
  const { type, make } = pictures[params.picture as keyof typeof pictures];
  return new Response(new Uint8Array(await make()), { headers: { 'Content-Type': type } });
};
