/**
 * The pictures of space behind the home page (the Space component): the ones EARL's Starship skin draws its graph's
 * space with, made the same way and with the same numbers (makeStars() and makeNebula() in the framework's
 * synths/EARL/EarlStarshipSkin.cpp), so the same stars and the same nebula. They're made at build time
 * (src/pages/space/[picture].png.ts); if the skin's change, change these.
 */

/** A square picture that tiles: its side, and each pixel's red, green, blue and alpha. */
export interface Tile {
  side: number;
  pixels: Uint8Array;
}

/** A point, or a colour's red, green and blue (0 to 1). */
type Vec3 = [number, number, number];

const STARS_SIDE = 256;
/** Of its pixels, a star */
const STARS_DENSITY = 0.0045;
/** Of the stars, the ones past this are bright, with a glint (the skin's float) */
const STARS_BRIGHT = Math.fround(0.93);
/** A bright star's arms, in pixels */
const STAR_GLINT = 3.5;
/** Its coarsest noise's cells across the tile, and each one's side (the skin's: 4 of 32 pixels) */
const NEBULA_CELLS = 4;
const NEBULA_CELL = 32;
/** Its densest cloud's opacity */
const NEBULA_DENSITY = 0.62;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (from: number, to: number, value: number) => {
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};
const rgb = (hex: number): Vec3 => [((hex >> 16) & 0xff) / 255, ((hex >> 8) & 0xff) / 255, (hex & 0xff) / 255];
const mix = (a: Vec3, b: Vec3, amount: number): Vec3 => [0, 1, 2].map((k) => a[k] + (b[k] - a[k]) * amount) as Vec3;
const scale = (p: Vec3, factor: number): Vec3 => [p[0] * factor, p[1] * factor, p[2] * factor];

/** Between `stops`, evenly spaced from 0 to 1. */
function ramp(stops: Vec3[], position: number): Vec3 {
  const scaled = clamp01(position) * (stops.length - 1);
  const index = Math.min(Math.floor(scaled), stops.length - 2);
  return mix(stops[index], stops[index + 1], scaled - index);
}

/** The same numbers each time a picture is made: xorshift, 0 to 1. */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return (state >>> 8) / 2 ** 24;
  };
}

function mixBits(h: number) {
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}

/** A lattice point's value, 0 to 1. */
function latticeValue(x: number, y: number, z: number, seed: number) {
  let h = mixBits(seed + Math.imul(x, 0x9e3779b1));
  h = mixBits(h + Math.imul(y, 0x85ebca77));
  h = mixBits(h + Math.imul(z, 0xc2b2ae3d));
  return (h >>> 8) / 2 ** 24;
}

/** Smooth value noise, 0 to 1. With a `period`, it wraps round on x and y every so many cells. */
function noise([px, py, pz]: Vec3, seed: number, period = 0) {
  const [fx, fy, fz] = [Math.floor(px), Math.floor(py), Math.floor(pz)];
  const ease = (t: number) => t * t * (3 - 2 * t);
  const [tx, ty, tz] = [ease(px - fx), ease(py - fy), ease(pz - fz)];
  const wrap = (cell: number) => (period > 0 ? ((cell % period) + period) % period : cell);
  const at = (dx: number, dy: number, dz: number) => latticeValue(wrap(fx + dx), wrap(fy + dy), fz + dz, seed);

  const x00 = at(0, 0, 0) + (at(1, 0, 0) - at(0, 0, 0)) * tx;
  const x10 = at(0, 1, 0) + (at(1, 1, 0) - at(0, 1, 0)) * tx;
  const x01 = at(0, 0, 1) + (at(1, 0, 1) - at(0, 0, 1)) * tx;
  const x11 = at(0, 1, 1) + (at(1, 1, 1) - at(0, 1, 1)) * tx;
  const y0 = x00 + (x10 - x00) * ty;
  const y1 = x01 + (x11 - x01) * ty;
  return y0 + (y1 - y0) * tz;
}

/** Noise of finer and finer detail added up, 0 to 1 (about 0.5 mostly). A `period` doubles with each octave. */
function fbm(p: Vec3, seed: number, octaves: number, period = 0) {
  let [sum, amplitude, total] = [0, 0.5, 0];
  for (let octave = 0; octave < octaves; octave++) {
    sum += amplitude * noise(p, (seed + octave * 7919) >>> 0, period);
    total += amplitude;
    p = scale(p, period > 0 ? 2 : 2.03);
    period *= 2;
    amplitude *= 0.5;
  }
  return sum / total;
}

/** A tile of `side` by `side`, every pixel `colour` and transparent. */
function blank(side: number, colour: Vec3): Tile {
  const pixels = new Uint8Array(side * side * 4);
  for (let pixel = 0; pixel < side * side; pixel++) pixels.set([...colour.map((c) => Math.round(c * 255)), 0], pixel * 4);
  return { side, pixels };
}

/** Writes `colour` at `alpha` (0 to 1) into a pixel. */
function setPixel({ side, pixels }: Tile, x: number, y: number, colour: Vec3, alpha: number) {
  pixels.set([...colour.map((c) => Math.round(clamp01(c) * 255)), Math.round(clamp01(alpha) * 255)], (y * side + x) * 4);
}

/** Adds a star's light at `alpha` to a pixel, wrapping round the tile. */
function addStarLight(tile: Tile, x: number, y: number, colour: Vec3, alpha: number) {
  const { side, pixels } = tile;
  x = ((x % side) + side) % side;
  y = ((y % side) + side) % side;
  if (alpha <= pixels[(y * side + x) * 4 + 3] / 255) return;
  setPixel(tile, x, y, colour, alpha);
}

/** Stars on nothing, tiled: most faint, a few bright ones with a glint, white, blue or warm. */
export function makeStars(): Tile {
  const colours = [0xffffff, 0xcfe2ff, 0xffe8c8, 0xc4f6ff].map(rgb);
  const tile = blank(STARS_SIDE, rgb(0xe4efff));

  const next = random(0x51a75);
  const count = Math.trunc(STARS_SIDE * STARS_SIDE * STARS_DENSITY);
  for (let star = 0; star < count; star++) {
    const x = next() * STARS_SIDE;
    const y = next() * STARS_SIDE;
    const brightness = next();
    const colour = colours[Math.trunc(next() * colours.length) % colours.length];
    const [px, py] = [Math.trunc(x), Math.trunc(y)];

    // A bright one: a soft disc and a glint
    if (brightness > STARS_BRIGHT) {
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) addStarLight(tile, px + dx, py + dy, colour, Math.exp(-(dx * dx + dy * dy) * 0.9));
      for (let arm = 1; arm <= Math.trunc(STAR_GLINT); arm++) {
        const alpha = 0.55 * (1 - arm / (STAR_GLINT + 1));
        addStarLight(tile, px + arm, py, colour, alpha);
        addStarLight(tile, px - arm, py, colour, alpha);
        addStarLight(tile, px, py + arm, colour, alpha);
        addStarLight(tile, px, py - arm, colour, alpha);
      }
      continue;
    }

    // A faint one: its light shared between the pixels it falls between
    const alpha = 0.18 + 0.7 * brightness * brightness;
    const [fx, fy] = [x - px, y - py];
    addStarLight(tile, px, py, colour, alpha * Math.max((1 - fx) * (1 - fy), 0.45));
    addStarLight(tile, px + 1, py, colour, alpha * fx * (1 - fy));
    addStarLight(tile, px, py + 1, colour, alpha * (1 - fx) * fy);
    addStarLight(tile, px + 1, py + 1, colour, alpha * fx * fy);
  }
  return tile;
}

/**
 * Clouds of teal and violet gas, tiled: drawn larger than they are, so smooth. With more `cells` than the skin's, a
 * larger piece of the same kind of clouds, which repeats less.
 */
export function makeNebula(cells = NEBULA_CELLS): Tile {
  const colours = [0x0e4f63, 0x1d3a7a, 0x52226e, 0x7a2a66].map(rgb);
  const side = cells * NEBULA_CELL;
  const tile = blank(side, rgb(0x123a4e));

  for (let y = 0; y < side; y++)
    for (let x = 0; x < side; x++) {
      const p: Vec3 = [x / NEBULA_CELL, y / NEBULA_CELL, 0.5];
      const density = fbm(p, 0xa11ce, 4, cells);
      const hue = fbm([p[0] * 0.5, p[1] * 0.5, p[2] * 0.5 + 3.7], 0xb0b5, 3, cells / 2);
      const dust = fbm([p[0] * 2, p[1] * 2, p[2] * 2 + 9.1], 0xd057, 3, cells * 2);
      const colour = ramp(colours, smoothstep(0.35, 0.65, hue));
      const alpha = NEBULA_DENSITY * smoothstep(0.42, 0.78, density) * (0.55 + 0.45 * smoothstep(0.3, 0.6, dust));
      setPixel(tile, x, y, colour, alpha);
    }
  return tile;
}
