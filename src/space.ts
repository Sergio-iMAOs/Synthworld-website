/**
 * The pictures of space behind the home page (the Space component) and of the synths' planets (Planet): the ones EARL's
 * Starship skin draws its graph with, made the same way and with the same numbers (makeStars(), makeNebula() and
 * makeWorld() in the framework's synths/EARL/EarlStarshipSkin.cpp), so the same stars, the same nebula and the same
 * planets. They're made at build time (src/pages/space/[picture].ts); if the skin's change, change these.
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
const NOISE_OCTAVES = 5;
/**
 * A planet's picture's side: drawn up to about 190 CSS pixels wide, zoomed in up to twice (the skin's is 160); a
 * synth's sharper, as its window is in it
 */
const WORLD_SIDE = 512;
const SYNTH_WORLD_SIDE = 768;
/** Its disc's radius, of its side: the rest is its atmosphere's glow */
export const WORLD_DISC = 0.4;
/** How far the glow reaches round the disc, of its radius, and on the side away from the light, of the lit side's */
const WORLD_HALO = 0.22;
const WORLD_HALO_DARK = 0.25;
/** The night side's light */
const WORLD_AMBIENT = 0.05;
/** Of the light's angle: where the night begins to lighten, and where it's full day */
const WORLD_TERMINATOR_FROM = -0.2;
const WORLD_TERMINATOR_TO = 0.75;
/** How close to the edge the atmosphere tints the surface */
const WORLD_EDGE_POWER = 2.4;
/** The cockpit's light from behind: how close to the edge, and how strong */
const WORLD_RIM_POWER = 4;
const WORLD_RIM = 0.7;
/** An ocean's highlight's tightness */
const WORLD_SHININESS = 28;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (from: number, to: number, value: number) => {
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};
const rgb = (hex: number): Vec3 => [((hex >> 16) & 0xff) / 255, ((hex >> 8) & 0xff) / 255, (hex & 0xff) / 255];
const mix = (a: Vec3, b: Vec3, amount: number): Vec3 => [0, 1, 2].map((k) => a[k] + (b[k] - a[k]) * amount) as Vec3;
const scale = (p: Vec3, factor: number): Vec3 => [p[0] * factor, p[1] * factor, p[2] * factor];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const normalise = (v: Vec3) => scale(v, 1 / Math.sqrt(dot(v, v)));
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

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
function fbm(p: Vec3, seed: number, octaves = NOISE_OCTAVES, period = 0) {
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

/** The kinds of planet the skin draws a graph's nodes as, each telling what its processor is (its World). */
const skinWorlds = [
  /** Seas, land and clouds: a source */
  'ocean',
  /** A banded gas giant: a filter */
  'giant',
  /** Red desert and craters: a modulator */
  'rust',
  /** A cracked ice moon: what's played */
  'ice',
  /** Swirling violet, ringed: a chorus, a delay, a reverb */
  'violet',
  /** Black rock, glowing cracks: a distortion, a dynamics processor */
  'lava',
  /** Green swirls: a note processor */
  'verdant',
  /** Grey craters: a gain, a panner, anything else */
  'moon',
] as const;
type SkinWorld = (typeof skinWorlds)[number];

/** Each synth's own planet, which looks like it: made of chunks of its window (synthLooks). */
const synthWorlds = ['earl'] as const;
type SynthWorld = (typeof synthWorlds)[number];

/** The kinds of planet: the skin's, then each synth's own. */
export const worlds = [...skinWorlds, ...synthWorlds] as const;
export type World = (typeof worlds)[number];
const isSynthWorld = (world: World): world is SynthWorld => (synthWorlds as readonly World[]).includes(world);

/**
 * A planet's ring, drawn round its picture (Planet): the skin's, a band of dust; or pulses, as a velvet noise's
 * display draws them.
 */
export type Ring = 'dust' | 'pulses';

/**
 * What's the same over a kind of planet: its atmosphere's colour, how much of it there is at its edge and round it
 * (0 to 1), its bands' slant (radians), how far its north pole leans towards us (radians: the skin's are seen side
 * on), its craters, and its ring.
 */
interface WorldLook {
  atmosphere: Vec3;
  haze: number;
  tilt: number;
  pitch?: number;
  craters: number;
  ring?: Ring;
}

/**
 * What's more to a synth's planet: the skin of its window its chunks are cut from (its picture as `npm run screenshots`
 * names it), and where in the window the parts on the chunks most in view and in the light are (each's middle, of the
 * window's width and height), the first on the one most in view; the others' are anywhere.
 */
interface SynthWorldLook extends WorldLook {
  skin: string;
  parts: [number, number][];
}

const synthLooks: Record<SynthWorld, SynthWorldLook> = {
  // EARL's, in SW Light: its logo and its tabs, its velvet noise, its oscillators' wavetables, its envelope, LFO and
  // velocity, its filter, its sub-oscillator, its saturator; ringed with its velvet noise, pulses up and down
  earl: {
    atmosphere: rgb(0xb894f0),
    haze: 0.5,
    tilt: -0.12,
    pitch: 0.3,
    craters: 0,
    ring: 'pulses',
    skin: 'SW Light',
    parts: [
      [0.07, 0.09],
      [0.868, 0.195],
      [0.372, 0.195],
      [0.115, 0.84],
      [0.45, 0.84],
      [0.89, 0.84],
      [0.15, 0.645],
      [0.868, 0.46],
      [0.65, 0.645],
      [0.62, 0.195],
      [0.125, 0.41],
    ],
  },
};

const looks: Record<World, WorldLook> = {
  ...synthLooks,
  ocean: { atmosphere: rgb(0x63d2ff), haze: 0.9, tilt: -0.35, craters: 0 },
  giant: { atmosphere: rgb(0xffd08f), haze: 0.55, tilt: -0.25, craters: 0 },
  rust: { atmosphere: rgb(0xff8f6b), haze: 0.35, tilt: 0.2, craters: 14 },
  ice: { atmosphere: rgb(0xc8f1ff), haze: 0.55, tilt: 0.4, craters: 6 },
  violet: { atmosphere: rgb(0xe58dff), haze: 0.7, tilt: -0.3, craters: 0, ring: 'dust' },
  lava: { atmosphere: rgb(0xff7b35), haze: 0.4, tilt: 0.1, craters: 8 },
  verdant: { atmosphere: rgb(0x8dffbe), haze: 0.7, tilt: -0.15, craters: 0 },
  moon: { atmosphere: rgb(0xa9c4e8), haze: 0.15, tilt: 0, craters: 26 },
};

/** A kind of planet's ring, if it has one. */
export const ringOf = (world: World) => looks[world].ring;

/** The skin of the window a synth's planet is made of; none for the skin's kinds. */
export const skinOf = (world: World) => (isSynthWorld(world) ? synthLooks[world].skin : undefined);

/** A planet's picture's address (src/pages/space/[picture].ts): lit by the sun, or uncharted, against the light. */
export const planetPicture = (world: World, uncharted = false) => `/space/${uncharted ? 'uncharted' : 'world'}-${world}.webp`;

/** A crater: its centre on the sphere, and 1 - cos(its angular radius). */
interface Crater {
  centre: Vec3;
  reach: number;
}

function makeCraters(count: number, seed: number): Crater[] {
  const next = random(seed);
  return Array.from({ length: count }, () => {
    const z = next() * 2 - 1;
    const angle = next() * 2 * Math.PI;
    const ring = Math.sqrt(1 - z * z);
    const radius = 0.05 + 0.17 * next() * next();
    return { centre: [ring * Math.cos(angle), ring * Math.sin(angle), z], reach: 1 - Math.cos(radius) };
  });
}

/** `colour` with the craters at `p`: dark floors, bright rims. */
function craterise(colour: Vec3, p: Vec3, craters: Crater[]) {
  for (const { centre, reach } of craters) {
    const distance = 1 - dot(p, centre);
    if (distance > reach * 1.6) continue;
    const t = distance / reach;
    const shade = t < 0.75 ? 0.72 + 0.12 * t : t < 1 ? 0.81 + (0.5 * (t - 0.75)) / 0.25 : 1.08 - (0.08 * (t - 1)) / 0.6;
    colour = scale(colour, shade);
  }
  return colour;
}

/** A planet's ground at `p`, a point of its sphere: its colour, its own light, its shine (0 to 1). */
interface Ground {
  colour: Vec3;
  glow?: Vec3;
  shine?: number;
}

function getGround(world: SkinWorld, p: Vec3, craters: Crater[]): Ground {
  switch (world) {
    case 'ocean': {
      const land = fbm(scale(p, 1.9), 11);
      const warp = fbm(scale(p, 1.3), 12, 3);
      const clouds = fbm(add(scale(p, 3.1), [warp * 1.5, 0, warp * 1.5]), 13);
      const isLand = land > 0.56;
      let colour = isLand
        ? ramp([rgb(0x2c7a55), rgb(0x5c9a52), rgb(0xc7b27c)], (land - 0.56) / 0.16)
        : mix(rgb(0x041d4d), rgb(0x1468b3), smoothstep(0.3, 0.56, land));
      const ice = smoothstep(0.8, 0.88, Math.abs(p[1]) + (land - 0.5) * 0.3);
      colour = mix(colour, rgb(0xe9f5ff), ice);
      const cloud = 0.9 * smoothstep(0.52, 0.72, clouds);
      colour = mix(colour, rgb(0xf4f9ff), cloud);
      return { colour, shine: isLand ? 0 : 0.55 * (1 - cloud) * (1 - ice) };
    }
    case 'giant': {
      const warp = fbm(scale(p, 1.6), 21, 4);
      const bands = 0.5 + 0.5 * Math.sin(p[1] * 7 + (warp - 0.5) * 3);
      const detail = fbm([p[0] * 2, p[1] * 11, p[2] * 2], 22, 4);
      const colour = ramp([rgb(0x5e2c16), rgb(0xa9592b), rgb(0xe2a159), rgb(0xf6e2b8)], bands * 0.75 + (detail - 0.5) * 0.9 + 0.12);
      const [ox, oy, oz] = add(p, scale(normalise([0.42, 0.3, 0.86]), -1));
      const storm = 1 - smoothstep(0.012, 0.03, ox * ox + oz * oz + oy * oy * 5);
      return { colour: mix(colour, rgb(0xc4472a), storm * 0.9) };
    }
    case 'rust': {
      const height = fbm(scale(p, 2.3), 31);
      let colour = ramp([rgb(0x4a130f), rgb(0x9b2f1d), rgb(0xd2573a), rgb(0xeb8d62)], (height - 0.5) * 2.2 + 0.55);
      colour = scale(colour, 1 - 0.4 * smoothstep(0.52, 0.62, fbm(scale(p, 1.2), 32, 3)));
      return { colour: craterise(colour, p, craters) };
    }
    case 'ice': {
      const height = fbm(scale(p, 2.8), 41);
      let colour = ramp([rgb(0x7299bf), rgb(0xb3d3ea), rgb(0xf1f8ff)], (height - 0.5) * 2.4 + 0.5);
      const crack = Math.abs(fbm(scale(p, 3.6), 42, 4) - 0.5);
      colour = mix(colour, rgb(0x3f6f9e), 0.85 * (1 - smoothstep(0.004, 0.022, crack)));
      return { colour: craterise(colour, p, craters), shine: 0.25 };
    }
    case 'violet': {
      const swirl: Vec3 = [fbm(scale(p, 1.7), 51, 3), fbm(scale(p, 1.7), 52, 3), fbm(scale(p, 1.7), 53, 3)];
      const q = add(p, scale(swirl, 0.9));
      const bands = 0.5 + 0.5 * Math.sin(q[1] * 6 + fbm(scale(q, 2.4), 54, 4) * 3);
      return { colour: ramp([rgb(0x1c0a3a), rgb(0x4a1e7c), rgb(0x8f3fbb), rgb(0xdd78e2), rgb(0xffc8f1)], bands * 0.8 + 0.1) };
    }
    case 'lava': {
      const height = fbm(scale(p, 3), 61);
      const rock = ramp([rgb(0x100a0a), rgb(0x2a1a17), rgb(0x46302a)], (height - 0.5) * 2 + 0.5);
      const ridge = 1 - Math.abs(fbm(scale(p, 2.4), 62) * 2 - 1);
      const crack = smoothstep(0.86, 0.97, ridge);
      const glow = scale(ramp([rgb(0xb81d05), rgb(0xff7a1c), rgb(0xffe08a)], crack), crack * 1.1);
      return { colour: scale(craterise(rock, p, craters), 1 - crack), glow };
    }
    case 'verdant': {
      const warp = fbm(scale(p, 1.5), 71, 4);
      const bands = 0.5 + 0.5 * Math.sin(p[1] * 5 + (warp - 0.5) * 4);
      const detail = fbm(scale(p, 4), 72, 4);
      return { colour: ramp([rgb(0x06332a), rgb(0x137556), rgb(0x3cb46c), rgb(0xb5ec7e)], bands * 0.7 + (detail - 0.5) * 1.2 + 0.15) };
    }
    case 'moon': {
      const height = fbm(scale(p, 3), 81);
      const colour = ramp([rgb(0x41464f), rgb(0x767c88), rgb(0xb7bcc6)], (height - 0.5) * 2 + 0.55);
      return { colour: craterise(colour, p, craters) };
    }
  }
}

/** A picture a planet is made of (a synth's window): its size, and its pixels, so many channels each (red, green, blue). */
export interface Picture {
  width: number;
  height: number;
  channels: number;
  pixels: Uint8Array;
}

/**
 * A synth's planet's chunks: so many; the crevices between them so wide (radians), each shaded so far in from its edge,
 * as if it stood out of them; how much of its window each shows (of the window's width, per radian of the planet), how
 * far each is turned at most (radians), and how much lighter or darker it is at most
 */
const CHUNKS = 14;
const CHUNK_CREVICE = 0.014;
const CHUNK_SHADE = 0.07;
const CHUNK_SHOWS = 0.17;
const CHUNK_TURN = 0.18;
const CHUNK_TONE = 0.06;

/**
 * A synth's planet's ground: chunks of its `window` put together into a sphere, crevices between them where a `light`
 * glows from inside. Each chunk is a flat piece of the window, upright as it is on screen and turned a little; the
 * parts of it its look names are on the chunks nearest `front` (the planet's point most in view and in the light).
 */
function chunksOf(world: SynthWorld, window: Picture, light: Vec3, front: Vec3) {
  const { parts } = synthLooks[world];
  const next = random(0xc4a2c + worlds.indexOf(world));

  // Their middles, evenly round the sphere (a Fibonacci spiral's points), each strayed a little; the nearest the front first
  const middles = Array.from({ length: CHUNKS }, (_, index) => {
    const y = 1 - (2 * (index + 0.5)) / CHUNKS;
    const ring = Math.sqrt(1 - y * y);
    const angle = index * Math.PI * (3 - Math.sqrt(5));
    const stray: Vec3 = [(next() - 0.5) * 0.25, (next() - 0.5) * 0.25, (next() - 0.5) * 0.25];
    return normalise(add([ring * Math.cos(angle), y, ring * Math.sin(angle)], stray));
  }).sort((a, b) => dot(b, front) - dot(a, front));

  // Each's piece of the window: where its middle is in it, its right and its down on the sphere, its turn and its tone
  const chunks = middles.map((middle, index) => {
    const right = cross(middle, [0, -1, 0]);
    const east = Math.hypot(...right) > 1e-3 ? normalise(right) : ([1, 0, 0] as Vec3);
    const [u, v] = parts[index] ?? [0.15 + next() * 0.7, 0.2 + next() * 0.6];
    const turn = (next() - 0.5) * 2 * CHUNK_TURN;
    return { middle, east, south: cross(middle, east), u, v, cos: Math.cos(turn), sin: Math.sin(turn), tone: 1 + (next() - 0.5) * 2 * CHUNK_TONE };
  });

  // The window at a point, between its pixels, its edges going on past them
  const { width, height, channels, pixels } = window;
  const pixel = (x: number, y: number): Vec3 => {
    const at = (Math.min(height - 1, Math.max(0, y)) * width + Math.min(width - 1, Math.max(0, x))) * channels;
    return [pixels[at] / 255, pixels[at + 1] / 255, pixels[at + 2] / 255];
  };
  const sample = (x: number, y: number) => {
    const [fx, fy] = [Math.floor(x), Math.floor(y)];
    const [tx, ty] = [x - fx, y - fy];
    return mix(mix(pixel(fx, fy), pixel(fx + 1, fy), tx), mix(pixel(fx, fy + 1), pixel(fx + 1, fy + 1), tx), ty);
  };
  const shows = CHUNK_SHOWS * width;

  return (p: Vec3): Ground => {
    // The nearest chunk, and how far `p` is from the edge it shares with the next nearest
    let [first, second] = dot(p, chunks[0].middle) > dot(p, chunks[1].middle) ? [chunks[0], chunks[1]] : [chunks[1], chunks[0]];
    for (const chunk of chunks.slice(2)) {
      const near = dot(p, chunk.middle);
      if (near > dot(p, first.middle)) [first, second] = [chunk, first];
      else if (near > dot(p, second.middle)) second = chunk;
    }
    const between = add(first.middle, scale(second.middle, -1));
    const edge = (dot(p, first.middle) - dot(p, second.middle)) / Math.hypot(...between);

    // Its piece of the window, shaded towards its edge; in a crevice, dark, lit from inside
    const [a, b] = [dot(p, first.east), dot(p, first.south)];
    const x = first.u * width + (a * first.cos - b * first.sin) * shows;
    const y = first.v * height + (a * first.sin + b * first.cos) * shows;
    const raised = 0.8 + 0.2 * smoothstep(CHUNK_CREVICE, CHUNK_CREVICE + CHUNK_SHADE, edge);
    const crevice = 1 - smoothstep(CHUNK_CREVICE * 0.6, CHUNK_CREVICE, edge);
    return { colour: mix(scale(sample(x, y), first.tone * raised), rgb(0x120c1a), crevice), glow: scale(light, 0.8 * crevice * crevice) };
  };
}

/** The sun: from the top left and in front, as the skin's; for an uncharted planet, from the top left and behind it. */
const SUNLIGHT = normalise([-0.62, -0.5, 0.6]);
const BACKLIGHT = normalise([-0.6, -0.45, -0.66]);

/**
 * A planet of `world`'s kind: its disc lit from the top left, a cockpit's light (`rim`, 0xrrggbb) round its far edge,
 * its atmosphere glowing round it; see-through beyond. An `uncharted` one is seen against the light: only a crescent
 * of it is lit, at its edge towards the light. A synth's is made of its `window` (in its look's skin), the cockpit's
 * light glowing between its chunks.
 */
export function makeWorld(world: World, rim: number, uncharted = false, window?: Picture): Tile {
  const look = looks[world];
  const craters = makeCraters(look.craters, 0xc0ffee + worlds.indexOf(world));
  const side = isSynthWorld(world) ? SYNTH_WORLD_SIDE : WORLD_SIDE;
  const tile = blank(side, look.atmosphere);

  const centre = side * 0.5;
  const radius = side * WORLD_DISC;
  const light = uncharted ? BACKLIGHT : SUNLIGHT;
  const lightAcross = Math.hypot(light[0], light[1]);
  const [cosTilt, sinTilt] = [Math.cos(look.tilt), Math.sin(look.tilt)];
  const [cosPitch, sinPitch] = [Math.cos(look.pitch ?? 0), Math.sin(look.pitch ?? 0)];
  const cockpit = rgb(rim);
  const halfway = normalise(add(light, [0, 0, 1]));

  // A point seen on the disc (towards us) as a point of the sphere: turned by its tilt, its pole leant towards us by
  // its pitch; what's there
  const onSphere = ([nx, ny, z]: Vec3): Vec3 => {
    const [sideways, down] = [nx * cosTilt - ny * sinTilt, nx * sinTilt + ny * cosTilt];
    return [sideways, down * cosPitch - z * sinPitch, down * sinPitch + z * cosPitch];
  };
  let groundAt: (p: Vec3) => Ground;
  if (isSynthWorld(world)) {
    if (!window) throw new Error(`The planet "${world}" is made of its synth's window, which it wasn't given`);
    groundAt = chunksOf(world, window, cockpit, onSphere(normalise(add(SUNLIGHT, [0, 0, 1.5]))));
  } else groundAt = (p) => getGround(world, p, craters);

  for (let y = 0; y < side; y++)
    for (let x = 0; x < side; x++) {
      const nx = (x + 0.5 - centre) / radius;
      const ny = (y + 0.5 - centre) / radius;
      const distance = Math.hypot(nx, ny);

      // The atmosphere round the disc, brighter on the side of the light
      const towardLight = distance > 0 ? (nx * light[0] + ny * light[1]) / (distance * lightAcross) : 0;
      const litSide = 0.5 + 0.5 * towardLight;
      const reach = clamp01(1 - (distance - 1) / WORLD_HALO);
      const halo = distance >= 1 ? look.haze * reach * reach * (WORLD_HALO_DARK + (1 - WORLD_HALO_DARK) * litSide) : 0;

      const cover = clamp01((1 - distance) * radius + 0.5);
      if (cover <= 0) {
        setPixel(tile, x, y, look.atmosphere, halo);
        continue;
      }

      // Its ground
      const z = Math.sqrt(Math.max(0, 1 - distance * distance));
      const normal: Vec3 = [nx, ny, z];
      const ground = groundAt(onSphere(normal));

      // Lit by the sun, the night side dark
      const lit = smoothstep(WORLD_TERMINATOR_FROM, WORLD_TERMINATOR_TO, dot(normal, light));
      let colour = scale(ground.colour, WORLD_AMBIENT + (1 - WORLD_AMBIENT) * lit);

      // Its atmosphere thicker towards its edge, the sun glinting on its seas
      colour = mix(colour, look.atmosphere, clamp01((1 - z) ** WORLD_EDGE_POWER * look.haze * (0.2 + 0.8 * lit)));
      if (ground.shine) colour = add(colour, scale([1, 1, 1], ground.shine * Math.max(0, dot(normal, halfway)) ** WORLD_SHININESS));

      // Its own light, then the cockpit's round its far edge
      if (ground.glow) colour = add(colour, ground.glow);
      colour = add(colour, scale(cockpit, WORLD_RIM * (1 - z) ** WORLD_RIM_POWER * clamp01(-towardLight)));

      // Over its atmosphere's glow at its edge
      const alpha = cover + (1 - cover) * halo;
      setPixel(tile, x, y, scale(add(scale(colour, cover), scale(look.atmosphere, halo * (1 - cover))), 1 / alpha), alpha);
    }
  return tile;
}

/**
 * A ring of pulses round a planet, as velvet noise's display draws them: so many round it and across it, from and to
 * so far out (of the planet's radius), each strayed so far from its place in their grid (0 to 1), each a square so
 * wide (of the radius)
 */
const PULSES_AROUND = 56;
const PULSES_ACROSS = 3;
const PULSES_FROM = 1.16;
export const PULSES_TO = 1.46;
const PULSES_JITTER = 0.8;
export const PULSE_SIDE = 0.045;

/** A pulse of a planet's ring: where it is from its centre (of its radius), as seen; up or down; on the ring's near half. */
export interface Pulse {
  x: number;
  y: number;
  up: boolean;
  near: boolean;
}

/**
 * The pulses of a planet's ring of them: one in each cell of a grid round it, strayed from its place and up or down at
 * random, as velvet noise's are (the same each time); in its equator, seen as the planet is, its tilt and its pitch.
 */
export function ringPulses(world: World): Pulse[] {
  const { tilt, pitch = 0 } = looks[world];
  const next = random(0xe421);
  const pulses: Pulse[] = [];
  for (let around = 0; around < PULSES_AROUND; around++)
    for (let across = 0; across < PULSES_ACROSS; across++) {
      const angle = ((around + 0.5 + (next() - 0.5) * PULSES_JITTER) / PULSES_AROUND) * 2 * Math.PI;
      const radius = PULSES_FROM + ((across + 0.5 + (next() - 0.5) * PULSES_JITTER) / PULSES_ACROSS) * (PULSES_TO - PULSES_FROM);
      const up = next() < 0.5;
      const [sideways, down] = [radius * Math.cos(angle), radius * Math.sin(angle) * Math.sin(pitch)];
      pulses.push({
        x: sideways * Math.cos(tilt) + down * Math.sin(tilt),
        y: -sideways * Math.sin(tilt) + down * Math.cos(tilt),
        up,
        near: Math.sin(angle) > 0,
      });
    }
  return pulses;
}
