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

/**
 * Rays of light round a middle, as a repeating conic gradient draws them (its angles in degrees, round from the top,
 * clockwise): from `from`, every `every` degrees, dark until `rise`, its colour at `alpha` at `peak`, dark again from
 * `fall`.
 */
export interface Rays {
  from: number;
  every: number;
  rise: number;
  peak: number;
  fall: number;
  colour: number;
  alpha: number;
}

/**
 * Rays of light (a synth's planet's, as it opens), not the skin's: the site's own, as its CSS drew them, and made a
 * picture because a browser draws a picture turning and growing much faster than gradients faded by a mask. Its
 * `rays` one over the other, the first on top, faded out from the middle as `fade` says: its opacity at each distance
 * from the middle, of half its side, evenly between them.
 */
export function makeRays(side: number, rays: Rays[], fade: [number, number][]): Tile {
  const tile = blank(side, [0, 0, 0]);
  const colours = rays.map(({ colour }) => rgb(colour));
  const faded = (distance: number) => {
    const next = fade.findIndex(([at]) => at > distance);
    if (next === 0) return fade[0][1];
    if (next < 0) return fade[fade.length - 1][1];
    const [[from, a], [to, b]] = [fade[next - 1], fade[next]];
    return a + ((b - a) * (distance - from)) / (to - from);
  };
  const lightOf = ({ from, every, rise, peak, fall, alpha }: Rays, angle: number) => {
    const at = (((angle - from) % 360) + 360) % 360 % every;
    if (at <= rise || at >= fall) return 0;
    return alpha * (at < peak ? (at - rise) / (peak - rise) : (fall - at) / (fall - peak));
  };

  for (let y = 0; y < side; y++)
    for (let x = 0; x < side; x++) {
      const [dx, dy] = [x + 0.5 - side / 2, y + 0.5 - side / 2];
      const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
      // Each one over the ones under it, its colour weighed by its light
      let [colour, light]: [Vec3, number] = [[0, 0, 0], 0];
      for (let index = rays.length - 1; index >= 0; index--) {
        const alpha = lightOf(rays[index], angle);
        colour = add(scale(colours[index], alpha), scale(colour, 1 - alpha));
        light = alpha + light * (1 - alpha);
      }
      const opacity = light * faded(Math.hypot(dx, dy) / (side / 2));
      if (opacity > 0) setPixel(tile, x, y, scale(colour, 1 / light), opacity);
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

/** Each effect's own, smaller than a planet and not round: an asteroid made of what it does (asteroidLooks). */
const asteroids = ['helixx'] as const;
type Asteroid = (typeof asteroids)[number];

/** The kinds of planet: the skin's, then each synth's own, then the effects' asteroids. */
export const worlds = [...skinWorlds, ...synthWorlds, ...asteroids] as const;
export type World = (typeof worlds)[number];
const isSynthWorld = (world: World): world is SynthWorld => (synthWorlds as readonly World[]).includes(world);
const isAsteroid = (world: World): world is Asteroid => (asteroids as readonly World[]).includes(world);

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

/**
 * What's more to an asteroid: how far it reaches along each of its axes (of a planet's radius), its longest first; how
 * much narrower its neck is, between its two lobes; how many flat faces it's been broken into, how far its lumps stand
 * out of them and its craters sink into them (of its reach); and its strata from the lowest up, each a channel of what
 * it works on, at its pitch (of the lowest's).
 */
interface AsteroidLook extends WorldLook {
  reach: Vec3;
  neck: number;
  faces: number;
  lumps: number;
  dents: number;
  strata: number[];
}

const asteroidLooks: Record<Asteroid, AsteroidLook> = {
  // Helixx's: a stratum for each string of a hexaphonic guitar, at its open note (E, A, D, G, B and E)
  helixx: {
    atmosphere: rgb(0xb894f0),
    haze: 0,
    tilt: 0.34,
    pitch: 0.16,
    craters: 12,
    reach: [1.1, 0.72, 0.78],
    neck: 0.3,
    faces: 18,
    lumps: 0.2,
    dents: 0.16,
    strata: [1, 1.335, 1.782, 2.378, 2.997, 4],
  },
};

const looks: Record<World, WorldLook> = {
  ...synthLooks,
  ...asteroidLooks,
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

/**
 * A planet's picture's address (src/pages/space/[picture].ts): lit by the sun, or uncharted, against the light. A
 * synth's or an asteroid's is its inside, its chunks in a picture of their own.
 */
export const planetPicture = (world: World, uncharted = false) => `/space/${uncharted ? 'uncharted' : 'world'}-${world}.webp`;
export const chunksPicture = (world: World) => `/space/world-${world}-chunks.webp`;

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

/** The sun: from the top left and in front, as the skin's; for an uncharted planet, from the top left and behind it. */
const SUNLIGHT = normalise([-0.62, -0.5, 0.6]);
const BACKLIGHT = normalise([-0.6, -0.45, -0.66]);

/**
 * How a kind of planet is seen: a point seen on its disc (towards us) as a point of its sphere, turned by its tilt and
 * its pole leant towards us by its pitch; and back.
 */
function viewOf({ tilt, pitch = 0 }: WorldLook) {
  const [cosTilt, sinTilt] = [Math.cos(tilt), Math.sin(tilt)];
  const [cosPitch, sinPitch] = [Math.cos(pitch), Math.sin(pitch)];
  return {
    onSphere: ([nx, ny, z]: Vec3): Vec3 => {
      const [sideways, down] = [nx * cosTilt - ny * sinTilt, nx * sinTilt + ny * cosTilt];
      return [sideways, down * cosPitch - z * sinPitch, down * sinPitch + z * cosPitch];
    },
    onDisc: ([sideways, y, z]: Vec3): Vec3 => {
      const down = y * cosPitch + z * sinPitch;
      return [sideways * cosTilt + down * sinTilt, -sideways * sinTilt + down * cosTilt, -y * sinPitch + z * cosPitch];
    },
  };
}

/**
 * A pixel of a planet's picture: on its disc, where (`normal`, towards us), and how much of it the disc covers; how
 * much of its atmosphere's glow there is round the disc there; and how much it's on the light's side (-1 to 1).
 */
interface DiscPixel {
  normal: Vec3;
  cover: number;
  halo: number;
  towardLight: number;
}

/** Each pixel of a planet's picture `side` wide, lit by `light`. */
function eachPixel(side: number, look: WorldLook, light: Vec3, at: (x: number, y: number, pixel: DiscPixel) => void) {
  const centre = side * 0.5;
  const radius = side * WORLD_DISC;
  const lightAcross = Math.hypot(light[0], light[1]);
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
      const normal: Vec3 = [nx, ny, Math.sqrt(Math.max(0, 1 - distance * distance))];
      at(x, y, { normal, cover, halo, towardLight });
    }
}

/**
 * A planet's colour at a point of its disc: its ground lit by the sun (as it slants there: `shading`, towards us), the
 * night side dark; its atmosphere thicker towards its edge, the sun glinting on it; its own light, then the cockpit's
 * round its far edge.
 */
function shade(ground: Ground, { normal, towardLight }: DiscPixel, shading: Vec3, look: WorldLook, light: Vec3, cockpit: Vec3) {
  const z = normal[2];
  const lit = smoothstep(WORLD_TERMINATOR_FROM, WORLD_TERMINATOR_TO, dot(shading, light));
  let colour = scale(ground.colour, WORLD_AMBIENT + (1 - WORLD_AMBIENT) * lit);
  colour = mix(colour, look.atmosphere, clamp01((1 - z) ** WORLD_EDGE_POWER * look.haze * (0.2 + 0.8 * lit)));
  if (ground.shine) {
    const halfway = normalise(add(light, [0, 0, 1]));
    colour = add(colour, scale([1, 1, 1], ground.shine * Math.max(0, dot(shading, halfway)) ** WORLD_SHININESS));
  }
  if (ground.glow) colour = add(colour, ground.glow);
  return add(colour, scale(cockpit, WORLD_RIM * (1 - z) ** WORLD_RIM_POWER * clamp01(-towardLight)));
}

/** Writes a pixel of a disc that covers so much of it, over its atmosphere's glow at its edge. */
function setDiscPixel(tile: Tile, x: number, y: number, colour: Vec3, { cover, halo }: DiscPixel, atmosphere: Vec3) {
  const alpha = cover + (1 - cover) * halo;
  if (alpha > 0) setPixel(tile, x, y, scale(add(scale(colour, cover), scale(atmosphere, halo * (1 - cover))), 1 / alpha), alpha);
}

/**
 * A planet of one of the skin's kinds: its disc lit from the top left, a cockpit's light (`rim`, 0xrrggbb) round its
 * far edge, its atmosphere glowing round it; see-through beyond. An `uncharted` one is seen against the light: only a
 * crescent of it is lit, at its edge towards the light. (A synth's own is makeSynthWorld()'s.)
 */
export function makeWorld(world: World, rim: number, uncharted = false): Tile {
  if (isSynthWorld(world) || isAsteroid(world)) throw new Error(`The planet "${world}" is in pieces: makeSynthWorld() or makeAsteroid() makes it`);
  const look = looks[world];
  const craters = makeCraters(look.craters, 0xc0ffee + worlds.indexOf(world));
  const tile = blank(WORLD_SIDE, look.atmosphere);
  const light = uncharted ? BACKLIGHT : SUNLIGHT;
  const { onSphere } = viewOf(look);
  eachPixel(WORLD_SIDE, look, light, (x, y, pixel) => {
    const colour = pixel.cover > 0 ? shade(getGround(world, onSphere(pixel.normal), craters), pixel, pixel.normal, look, light, rgb(rim)) : look.atmosphere;
    setDiscPixel(tile, x, y, colour, pixel, look.atmosphere);
  });
  return tile;
}

/** A picture a planet is made of (a synth's window): its size, and its pixels, so many channels each (red, green, blue). */
export interface Picture {
  width: number;
  height: number;
  channels: number;
  pixels: Uint8Array;
}

/**
 * A synth's planet's chunks: so many; how much of its window each shows (of the window's width, per radian of the
 * planet), how far each is turned at most (radians), and how much lighter or darker it is at most. Between them, a
 * crack so wide (radians), the planet's inside's light spilling so much onto their edges, fading so fast. Each is a
 * plate, its edges bevelled so far in and so steeply, what's dark in its piece of the window standing out of it so
 * high (of the planet's radius), casting a shadow so far (in the window's pixels) and so dark
 */
const CHUNKS = 14;
const CHUNK_SHOWS = 0.17;
const CHUNK_TURN = 0.18;
const CHUNK_TONE = 0.06;
const CHUNK_CRACK = 0.018;
const CHUNK_SPILL = 0.55;
const CHUNK_SPILL_REACH = 0.02;
const CHUNK_BEVEL = 0.035;
const CHUNK_BEVEL_SLOPE = 1.2;
const CHUNK_RELIEF = 0.009;
const CHUNK_SHADOW_REACH = 3;
const CHUNK_SHADOW = 0.4;

/** A chunk of a synth's planet: its middle on the sphere, its right and its down there, and its piece of the window. */
interface Chunk {
  middle: Vec3;
  east: Vec3;
  south: Vec3;
  u: number;
  v: number;
  cos: number;
  sin: number;
  tone: number;
}

/**
 * A synth's planet's chunks, the same each time: their middles evenly round the sphere (a Fibonacci spiral's points),
 * each strayed a little, the nearest its front first (its point most in view and in the light); each a flat piece of
 * the window, upright as it is on screen and turned a little, the parts of it its look names on the first ones.
 */
function chunksOf(world: SynthWorld): Chunk[] {
  const look = synthLooks[world];
  const front = viewOf(look).onSphere(normalise(add(SUNLIGHT, [0, 0, 1.5])));
  const next = random(0xc4a2c + worlds.indexOf(world));
  const middles = Array.from({ length: CHUNKS }, (_, index) => {
    const y = 1 - (2 * (index + 0.5)) / CHUNKS;
    const ring = Math.sqrt(1 - y * y);
    const angle = index * Math.PI * (3 - Math.sqrt(5));
    const stray: Vec3 = [(next() - 0.5) * 0.25, (next() - 0.5) * 0.25, (next() - 0.5) * 0.25];
    return normalise(add([ring * Math.cos(angle), y, ring * Math.sin(angle)], stray));
  }).sort((a, b) => dot(b, front) - dot(a, front));
  return middles.map((middle, index) => {
    const right = cross(middle, [0, -1, 0]);
    const east = Math.hypot(...right) > 1e-3 ? normalise(right) : ([1, 0, 0] as Vec3);
    const [u, v] = look.parts[index] ?? [0.15 + next() * 0.7, 0.2 + next() * 0.6];
    const turn = (next() - 0.5) * 2 * CHUNK_TURN;
    return { middle, east, south: cross(middle, east), u, v, cos: Math.cos(turn), sin: Math.sin(turn), tone: 1 + (next() - 0.5) * 2 * CHUNK_TONE };
  });
}

/** The chunk a point of the sphere is on (and its index), the next nearest, and how far the point is from the edge between them (radians). */
function chunkAt(chunks: Chunk[], p: Vec3) {
  let [first, second] = dot(p, chunks[0].middle) > dot(p, chunks[1].middle) ? [0, 1] : [1, 0];
  for (let index = 2; index < chunks.length; index++) {
    const near = dot(p, chunks[index].middle);
    if (near > dot(p, chunks[first].middle)) [first, second] = [index, first];
    else if (near > dot(p, chunks[second].middle)) second = index;
  }
  const [a, b] = [chunks[first].middle, chunks[second].middle];
  const edge = (dot(p, a) - dot(p, b)) / Math.hypot(...add(a, scale(b, -1)));
  return { index: first, chunk: chunks[first], next: chunks[second], edge };
}

/** How many chunks a synth's planet has, and which is seen at a point of its disc. */
function synthChunkSeen(world: SynthWorld): [number, (nx: number, ny: number) => number | undefined] {
  const chunks = chunksOf(world);
  const { onSphere } = viewOf(synthLooks[world]);
  return [chunks.length, (nx, ny) => (nx * nx + ny * ny < 1 ? chunkAt(chunks, onSphere([nx, ny, Math.sqrt(1 - nx * nx - ny * ny)])).index : undefined)];
}

/**
 * A chunk as a page places it: which of the planet's it is, its piece of the planet's picture (in its pixels), where
 * that is in the picture of the chunks, and its middle on the disc (from its centre, of its radius).
 */
export interface ChunkPlace {
  chunk: number;
  x: number;
  y: number;
  width: number;
  height: number;
  atlasX: number;
  atlasY: number;
  middle: [number, number];
}

/** Where a planet's chunks in sight are: in its picture (`side` wide), and in theirs (so wide and high). */
export interface ChunkLayout {
  side: number;
  width: number;
  height: number;
  chunks: ChunkPlace[];
}

/** How finely the chunks' places are found (pixels), how much wider than found each is, and the room between them in their picture. */
const LAYOUT_STEP = 4;
const LAYOUT_MARGIN = 6;
const LAYOUT_GAP = 2;

const layouts = new Map<World, ChunkLayout>();

/**
 * Where a synth's planet's or an asteroid's chunks in sight are, the same each time (a page places them by it,
 * src/pages/space/ makes their picture by it); none for the skin's kinds. Each's box is found on a coarser grid than the picture's, so
 * a little wider; in their picture, they're side by side, row after row.
 */
export function chunkLayout(world: World): ChunkLayout | undefined {
  if (!isSynthWorld(world) && !isAsteroid(world)) return undefined;
  const known = layouts.get(world);
  if (known) return known;

  // Which chunk is seen at a point of its disc, if any
  const [count, chunkSeen] = isSynthWorld(world) ? synthChunkSeen(world) : asteroidChunkSeen(world);
  const side = SYNTH_WORLD_SIDE;
  const [centre, radius] = [side * 0.5, side * WORLD_DISC];
  const boxes = Array.from({ length: count }, () => ({ left: side, top: side, right: 0, bottom: 0, x: 0, y: 0, count: 0 }));
  for (let y = 0; y < side; y += LAYOUT_STEP)
    for (let x = 0; x < side; x += LAYOUT_STEP) {
      const [nx, ny] = [(x + LAYOUT_STEP / 2 - centre) / radius, (y + LAYOUT_STEP / 2 - centre) / radius];
      const seen = chunkSeen(nx, ny);
      if (seen === undefined) continue;
      const box = boxes[seen];
      Object.assign(box, { left: Math.min(box.left, x), top: Math.min(box.top, y), right: Math.max(box.right, x + LAYOUT_STEP), bottom: Math.max(box.bottom, y + LAYOUT_STEP) });
      box.x += nx;
      box.y += ny;
      box.count++;
    }

  const places: ChunkPlace[] = [];
  let [atlasX, atlasY, row, width] = [0, 0, 0, 0];
  for (const [chunk, box] of boxes.entries()) {
    if (box.count === 0) continue;
    const [x, y] = [Math.max(0, box.left - LAYOUT_MARGIN), Math.max(0, box.top - LAYOUT_MARGIN)];
    const [w, h] = [Math.min(side, box.right + LAYOUT_MARGIN) - x, Math.min(side, box.bottom + LAYOUT_MARGIN) - y];
    if (atlasX > 0 && atlasX + w > side) [atlasX, atlasY, row] = [0, atlasY + row + LAYOUT_GAP, 0];
    places.push({ chunk, x, y, width: w, height: h, atlasX, atlasY, middle: [box.x / box.count, box.y / box.count] });
    [atlasX, row, width] = [atlasX + w + LAYOUT_GAP, Math.max(row, h), Math.max(width, atlasX + w)];
  }
  const layout = { side, width, height: atlasY + row, chunks: places };
  layouts.set(world, layout);
  return layout;
}

/** A picture of so many pixels by so many, each red, green, blue and alpha. */
export interface Atlas {
  width: number;
  height: number;
  pixels: Uint8Array;
}

/**
 * A synth's planet, in layers. Its inside (`core`): the light it's full of, the atmosphere glowing round it. Over it,
 * its chunks (`chunks`, in one picture, each where chunkLayout() says): its `window`'s pieces, each a raised plate,
 * what's dark in it standing out of it, its edges bevelled down into the cracks between them, where the inside's
 * light shows and spills onto them; lit by the sun from the top left, the cockpit's light (`rim`) round the far edge.
 */
export function makeSynthWorld(world: World, rim: number, window: Picture): { core: Tile; chunks: Atlas } {
  if (!isSynthWorld(world)) throw new Error(`The planet "${world}" is one of the skin's: makeWorld() makes it`);
  const look = synthLooks[world];
  const chunks = chunksOf(world);
  const layout = chunkLayout(world)!;
  const { onSphere, onDisc } = viewOf(look);
  const sun = onSphere(SUNLIGHT);
  const side = layout.side;
  const cockpit = rgb(rim);
  const core = blank(side, look.atmosphere);
  const atlas = { width: layout.width, height: layout.height, pixels: new Uint8Array(layout.width * layout.height * 4) };
  const placeOf = chunks.map((_, index) => layout.chunks.find((place) => place.chunk === index));

  // The window between its pixels (its edges going on past them), and its height: what's dark in it standing out
  const { width, height, channels, pixels } = window;
  const pixel = (x: number, y: number): Vec3 => {
    const at = (Math.min(height - 1, Math.max(0, y)) * width + Math.min(width - 1, Math.max(0, x))) * channels;
    return [pixels[at] / 255, pixels[at + 1] / 255, pixels[at + 2] / 255];
  };
  const between = <T,>(get: (x: number, y: number) => T, blend: (a: T, b: T, t: number) => T) => (x: number, y: number) => {
    const [fx, fy] = [Math.floor(x), Math.floor(y)];
    const [tx, ty] = [x - fx, y - fy];
    return blend(blend(get(fx, fy), get(fx + 1, fy), tx), blend(get(fx, fy + 1), get(fx + 1, fy + 1), tx), ty);
  };
  const sample = between(pixel, mix);
  const heights = new Float32Array(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      let dark = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) dark += 1 - dot(pixel(x + dx, y + dy), [0.3, 0.59, 0.11]);
      heights[y * width + x] = smoothstep(0.3, 0.8, dark / 9);
    }
  const heightAt = between(
    (x, y) => heights[Math.min(height - 1, Math.max(0, y)) * width + Math.min(width - 1, Math.max(0, x))],
    (a, b, t) => a + (b - a) * t,
  );
  const shows = CHUNK_SHOWS * width;

  eachPixel(side, look, SUNLIGHT, (x, y, pixel) => {
    // The inside: light, whiter towards its middle
    const inside = mix(cockpit, [1, 1, 1], 0.25 + 0.45 * pixel.normal[2]);
    setDiscPixel(core, x, y, pixel.cover > 0 ? inside : look.atmosphere, pixel, look.atmosphere);
    if (pixel.cover <= 0) return;

    // The chunk there, its piece of the window, and how far into it from the crack
    const p = onSphere(pixel.normal);
    const { index, chunk, next, edge } = chunkAt(chunks, p);
    const crack = 1 - smoothstep(CHUNK_CRACK * 0.5, CHUNK_CRACK, edge);
    const place = placeOf[index];
    if (crack >= 1 || !place || x < place.x || y < place.y || x >= place.x + place.width || y >= place.y + place.height) return;
    const [a, b] = [dot(p, chunk.east), dot(p, chunk.south)];
    const [wx, wy] = [chunk.u * width + (a * chunk.cos - b * chunk.sin) * shows, chunk.v * height + (a * chunk.sin + b * chunk.cos) * shows];
    const inward = Math.max(0, edge - CHUNK_CRACK);

    // Its slant there: its window's relief, and its bevel, down towards the crack
    const [hx, hy] = [(heightAt(wx + 1, wy) - heightAt(wx - 1, wy)) / 2, (heightAt(wx, wy + 1) - heightAt(wx, wy - 1)) / 2];
    const uphill = add(scale(chunk.east, shows * (hx * chunk.cos + hy * chunk.sin)), scale(chunk.south, shows * (-hx * chunk.sin + hy * chunk.cos)));
    const toCrack = add(next.middle, scale(chunk.middle, -1));
    const outward = normalise(add(toCrack, scale(p, -dot(toCrack, p))));
    const bevel = CHUNK_BEVEL_SLOPE * (1 - clamp01(inward / CHUNK_BEVEL)) ** 2;
    const slant = normalise(add(add(p, scale(uphill, -CHUNK_RELIEF)), scale(outward, bevel)));

    // What stands out of it towards the sun shades it: the sun's way along it, in the window
    const sunAlong = add(sun, scale(p, -dot(sun, p)));
    const [se, ss] = [dot(sunAlong, chunk.east), dot(sunAlong, chunk.south)];
    const [sx, sy] = [se * chunk.cos - ss * chunk.sin, se * chunk.sin + ss * chunk.cos];
    const reach = CHUNK_SHADOW_REACH / (Math.hypot(sx, sy) || 1);
    const shadow = CHUNK_SHADOW * clamp01((heightAt(wx + sx * reach, wy + sy * reach) - heightAt(wx, wy)) * 1.5);

    const ground: Ground = {
      colour: scale(sample(wx, wy), chunk.tone * (1 - shadow)),
      glow: scale(cockpit, CHUNK_SPILL * Math.exp(-inward / CHUNK_SPILL_REACH)),
      shine: 0.1 + 0.35 * heightAt(wx, wy),
    };
    const colour = shade(ground, pixel, onDisc(slant), look, SUNLIGHT, cockpit);

    // Into its place in the chunks' picture, as much of it as isn't crack
    const at = ((y - place.y + place.atlasY) * atlas.width + (x - place.x + place.atlasX)) * 4;
    atlas.pixels.set([...colour.map((c) => Math.round(clamp01(c) * 255)), Math.round(clamp01(pixel.cover * (1 - crack)) * 255)], at);
  });
  return { core, chunks: atlas };
}

/**
 * An asteroid's surface: how finely how far out it is is kept (each way round its long way, half that the other), how
 * finely it's looked for along a line of sight, and closer between the last two steps; how close together its lumps
 * are; and how far from a point a slant is measured
 */
const ASTEROID_GRID = 360;
const ASTEROID_STEPS = 40;
const ASTEROID_CLOSER = 6;
const ASTEROID_LUMPS = 1.7;
const ASTEROID_SLANT = 0.012;
/**
 * Its flat faces: how far from its middle the nearest can be, how much further the others are, how sharply they
 * meet, and how far it reaches between them
 */
const ASTEROID_FACE_FROM = 0.7;
const ASTEROID_FACE_SPREAD = 0.36;
const ASTEROID_FACE_SHARPNESS = 16;
const ASTEROID_FACE_TOP = 1.08;
/** Its neck: where it is along its long way, off its middle so that its lobes aren't alike, and how wide */
const ASTEROID_NECK_AT = 0.16;
const ASTEROID_NECK_WIDTH = 0.34;

/** A piece of an asteroid seen on it: its point (on its axes, before it's stretched), and the normal there, towards us. */
interface AsteroidPoint {
  q: Vec3;
  normal: Vec3;
}

/** An asteroid's shape: the point seen at a point of its disc, if it's there; and a direction on its axes, towards us. */
interface AsteroidShape {
  at(nx: number, ny: number): AsteroidPoint | undefined;
  onDisc(direction: Vec3): Vec3;
}

const shapes = new Map<Asteroid, AsteroidShape>();

/**
 * An asteroid's shape: lumpy, dented by its craters, stretched along its axes; where a line of sight at a point of its
 * disc first meets it. Its surface's height each way is worked out once and kept, as it's looked for many times over.
 */
function shapeOf(world: Asteroid): AsteroidShape {
  const known = shapes.get(world);
  if (known) return known;

  const look = asteroidLooks[world];
  const { onSphere, onDisc } = viewOf(look);
  const seed = 0xa57e + worlds.indexOf(world);
  const craters = makeCraters(look.craters, 0xc0ffee + worlds.indexOf(world));
  const next = random(seed);
  const faces = Array.from({ length: look.faces }, () => {
    const [z, angle] = [next() * 2 - 1, next() * 2 * Math.PI];
    const ring = Math.sqrt(1 - z * z);
    return { facing: [ring * Math.cos(angle), ring * Math.sin(angle), z] as Vec3, at: ASTEROID_FACE_FROM + next() * ASTEROID_FACE_SPREAD };
  });
  const [wide, high] = [ASTEROID_GRID, ASTEROID_GRID / 2];
  const heights = new Float32Array((wide + 1) * (high + 1));
  for (let row = 0; row <= high; row++)
    for (let column = 0; column <= wide; column++) {
      const [polar, around] = [(row / high) * Math.PI, (column / wide) * 2 * Math.PI];
      const direction: Vec3 = [Math.sin(polar) * Math.sin(around), Math.cos(polar), Math.sin(polar) * Math.cos(around)];
      const bowls = craters.reduce((sum, { centre, reach }) => sum + (1 - smoothstep(0, reach * 1.2, 1 - dot(direction, centre))) * (0.4 + reach * 12), 0);
      // The nearest of its faces, each way: rounded off where they meet
      const nearness = faces.reduce((sum, { facing, at }) => sum + (Math.max(0, dot(direction, facing)) / at) ** ASTEROID_FACE_SHARPNESS, ASTEROID_FACE_TOP ** -ASTEROID_FACE_SHARPNESS);
      const cut = nearness ** (-1 / ASTEROID_FACE_SHARPNESS);
      const neck = 1 - look.neck * Math.exp(-(((direction[0] - ASTEROID_NECK_AT) / ASTEROID_NECK_WIDTH) ** 2));
      heights[row * (wide + 1) + column] = cut * neck * (1 + look.lumps * (2 * fbm(scale(direction, ASTEROID_LUMPS), seed, 4) - 1) - look.dents * bowls);
    }
  const heightTowards = ([x, y, z]: Vec3) => {
    const [row, column] = [(Math.acos(Math.max(-1, Math.min(1, y))) / Math.PI) * high, ((Math.atan2(x, z) / (2 * Math.PI) + 1) % 1) * wide];
    const [r, c] = [Math.min(high - 1, Math.floor(row)), Math.min(wide - 1, Math.floor(column))];
    const [tr, tc] = [row - r, column - c];
    const at = (r: number, c: number) => heights[r * (wide + 1) + c];
    const [top, bottom] = [at(r, c) + (at(r, c + 1) - at(r, c)) * tc, at(r + 1, c) + (at(r + 1, c + 1) - at(r + 1, c)) * tc];
    return top + (bottom - top) * tr;
  };

  // Above zero, outside it; `q` is a point on its axes, before it's stretched
  const outside = (q: Vec3) => {
    const length = Math.sqrt(dot(q, q));
    return length - heightTowards(scale(q, 1 / length));
  };
  const onAxes = (p: Vec3): Vec3 => [p[0] / look.reach[0], p[1] / look.reach[1], p[2] / look.reach[2]];
  const front = Math.max(...look.reach) * (1 + look.lumps);

  const shape: AsteroidShape = {
    at(nx, ny) {
      const point = (z: number) => onAxes(onSphere([nx, ny, z]));
      const step = (2 * front) / ASTEROID_STEPS;
      for (let z = front; z > -front; z -= step) {
        if (outside(point(z - step)) > 0) continue;
        let [near, far] = [z, z - step];
        for (let closer = 0; closer < ASTEROID_CLOSER; closer++) {
          const middle = (near + far) / 2;
          if (outside(point(middle)) > 0) near = middle;
          else far = middle;
        }
        const q = point(far);
        const here = outside(q);
        const slope = [0, 1, 2].map((axis) => {
          const moved: Vec3 = [...q];
          moved[axis] += ASTEROID_SLANT;
          return (outside(moved) - here) / look.reach[axis];
        }) as Vec3;
        return { q, normal: onDisc(normalise(slope)) };
      }
      return undefined;
    },
    onDisc,
  };
  shapes.set(world, shape);
  return shape;
}

/**
 * How an asteroid breaks: its strata reach so far out along their stack (a little uneven), each in so many pieces
 * round it; between them, a crack so wide (of its reach), a seam between strata wider, the light inside it spilling so
 * much onto their edges, fading so fast; each piece's edges bevelled so far in and so steeply
 */
const STRATA_REACH = 1.02;
const STRATA_UNEVEN = 0.3;
const STRATUM_PIECES = 4;
const PIECE_UNEVEN = 0.6;
const STRATUM_SEAM = 0.007;
const PIECE_CRACK = 0.004;
const ROCK_SPILL = 0.3;
const ROCK_SPILL_REACH = 0.006;
const ROCK_BEVEL = 0.022;
const ROCK_BEVEL_SLOPE = 0.8;

/** Where a point of an asteroid is in its strata. */
interface StratumPoint {
  /** Its stratum, from the lowest up, and which of its pieces it's on: a chunk */
  stratum: number;
  chunk: number;
  /** How far from its stratum's middle, -1 at its top to 1 at its bottom; how far along the asteroid, -1 to 1 or so */
  across: number;
  along: number;
  /** How far from the nearest crack (of its reach), and which way that is: along its stack, or round it */
  edge: number;
  towards: Vec3;
}

/** A point of an asteroid (on its axes, before it's stretched) in its strata: cut flat across its stack, then round it. */
function stratumAt(q: Vec3, look: AsteroidLook, seed: number): StratumPoint {
  const strata = look.strata.length;
  const thickness = (2 * STRATA_REACH) / strata;

  // Its strata's edges wander, and each's cracks are where they are for it
  const wander = fbm(scale(q, 1.6), seed + 1, 3) - 0.5;
  const height = (STRATA_REACH - q[1] + STRATA_UNEVEN * wander) / thickness;
  const stratum = Math.min(strata - 1, Math.max(0, Math.floor(height)));
  const within = height - stratum;
  const around = Math.atan2(q[0], q[2]);
  const ring = Math.hypot(q[0], q[2]);

  const shift = latticeValue(stratum, 3, 7, seed) * STRATUM_PIECES;
  const wandered = ((around + PIECE_UNEVEN * (fbm(scale(q, 2.3), seed + 2, 3) - 0.5)) / (2 * Math.PI) + 1) * STRATUM_PIECES + shift;
  const piece = Math.floor(wandered);
  const along = wandered - piece;

  const seam = [stratum > 0 ? within : Infinity, stratum < strata - 1 ? 1 - within : Infinity];
  const toSeam = Math.min(...seam) * thickness * look.reach[1] - STRATUM_SEAM;
  const toCrack = Math.min(along, 1 - along) * ((2 * Math.PI) / STRATUM_PIECES) * ring - PIECE_CRACK;
  const up: Vec3 = [0, seam[0] < seam[1] ? 1 : -1, 0];
  const round: Vec3 = [(along < 0.5 ? -1 : 1) * Math.cos(around), 0, (along < 0.5 ? 1 : -1) * Math.sin(around)];

  return {
    stratum,
    chunk: stratum * STRATUM_PIECES + (piece % STRATUM_PIECES),
    across: 1 - within * 2,
    along: q[0],
    edge: Math.min(toSeam, toCrack),
    towards: toSeam < toCrack ? up : round,
  };
}

/** How many chunks an asteroid has, and which is seen at a point of its disc. */
function asteroidChunkSeen(world: Asteroid): [number, (nx: number, ny: number) => number | undefined] {
  const look = asteroidLooks[world];
  const shape = shapeOf(world);
  const seed = worlds.indexOf(world);
  return [
    look.strata.length * STRATUM_PIECES,
    (nx, ny) => {
      const point = shape.at(nx, ny);
      return point && stratumAt(point.q, look, seed).chunk;
    },
  ];
}

/**
 * What each stratum of an asteroid carries: frequency modulation, drawn. A wave along it, so many cycles from its
 * middle to its end at the lowest stratum's pitch, so high of its stratum, its modulator a cycle for so many of its own
 * (a stratum's pitch moves both, as Helixx's modulators follow what they're on), so deep; a line so wide, glowing so
 * far (of its reach)
 */
const WAVE_CYCLES = 4;
const WAVE_HEIGHT = 0.46;
const WAVE_MODULATOR = 4.5;
const WAVE_INDEX = 3;
const WAVE_LINE = 0.0045;
const WAVE_GLOW = 0.011;
const WAVE_LOOK = 30;
const WAVE_LOOK_STEP = 0.0011;

/** The rock's colours, its waves', and how much each piece is lighter or darker */
const ROCK = [0x1f1b25, 0x3d3746, 0x6a6172, 0xa79cae].map(rgb);
const WAVE_COLOUR = rgb(0xff9d2e);
const WAVE_HOT = rgb(0xffe6b8);
const ROCK_TONE = 0.1;

/** How far a point is from the wave on its stratum, of the asteroid's reach: the nearest of it, looked for to each side. */
function fromWave({ stratum, across, along }: StratumPoint, look: AsteroidLook) {
  const half = (STRATA_REACH / look.strata.length) * look.reach[1];
  const carrier = 2 * Math.PI * WAVE_CYCLES * look.strata[stratum];
  const height = (x: number) => WAVE_HEIGHT * Math.sin(carrier * x + WAVE_INDEX * Math.sin((carrier * x) / WAVE_MODULATOR + stratum * 1.7));
  let nearest = Infinity;
  for (let sample = -WAVE_LOOK; sample <= WAVE_LOOK; sample++) {
    const aside = sample * WAVE_LOOK_STEP;
    nearest = Math.min(nearest, Math.hypot(aside * look.reach[0], (across - height(along + aside)) * half));
  }
  return nearest;
}

/**
 * An asteroid, in layers, as a synth's planet is. Its inside (`core`): the light it's full of. Over it, its chunks
 * (`chunks`, in one picture, each where chunkLayout() says): the pieces of its strata, dark rock, bevelled down into
 * the seams between them, where the inside's light shows, each stratum carrying its wave; lit by the sun from the top
 * left, the cockpit's light (`rim`) round its far edge.
 */
export function makeAsteroid(world: World, rim: number): { core: Tile; chunks: Atlas } {
  if (!isAsteroid(world)) throw new Error(`"${world}" isn't an asteroid`);
  const look = asteroidLooks[world];
  const shape = shapeOf(world);
  const layout = chunkLayout(world)!;
  const side = layout.side;
  const [centre, radius] = [side * 0.5, side * WORLD_DISC];
  const cockpit = rgb(rim);
  const seed = worlds.indexOf(world);
  const craters = makeCraters(look.craters, 0xc0ffee + seed);
  const lightAcross = Math.hypot(SUNLIGHT[0], SUNLIGHT[1]);
  const placeOf = new Map(layout.chunks.map((place) => [place.chunk, place]));

  // What's on it first, to soften its outline: a pixel's cover is how much of what's round it is rock
  const seen: (AsteroidPoint | undefined)[] = [];
  for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) seen.push(shape.at((x + 0.5 - centre) / radius, (y + 0.5 - centre) / radius));
  const coverOf = (x: number, y: number) => {
    let rock = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (seen[(y + dy) * side + x + dx]) rock++;
    return rock / 9;
  };

  const core = blank(side, look.atmosphere);
  const atlas = { width: layout.width, height: layout.height, pixels: new Uint8Array(layout.width * layout.height * 4) };
  for (let y = 1; y < side - 1; y++)
    for (let x = 1; x < side - 1; x++) {
      const point = seen[y * side + x];
      if (!point) continue;
      const { q, normal } = point;
      const cover = coverOf(x, y);

      // The inside: light, whiter towards its middle
      const inside = mix(cockpit, [1, 1, 1], 0.25 + 0.45 * normal[2]);
      setPixel(core, x, y, inside, cover);

      const stratum = stratumAt(q, look, seed);
      const crack = 1 - smoothstep(-0.004, 0.002, stratum.edge);
      const place = placeOf.get(stratum.chunk);
      if (crack >= 1 || !place || x < place.x || y < place.y || x >= place.x + place.width || y >= place.y + place.height) continue;
      const inward = Math.max(0, stratum.edge);

      // Its rock, a little different on each piece, and its slant: bevelled down towards the crack, rough
      const direction = normalise(q);
      const tone = 1 + (latticeValue(stratum.chunk, 1, 2, seed) - 0.5) * 2 * ROCK_TONE;
      const grain = fbm(scale(q, 3.4), seed + 3, 5);
      const speckle = fbm(scale(q, 14), seed + 4, 3);
      const rock = ramp(ROCK, (grain - 0.5) * 1.3 + 0.5 + (speckle - 0.5) * 0.4);
      const bump: Vec3 = [speckle - fbm(scale(add(q, [0.03, 0, 0]), 14), seed + 4, 3), speckle - fbm(scale(add(q, [0, 0.03, 0]), 14), seed + 4, 3), 0];
      const bevel = ROCK_BEVEL_SLOPE * (1 - clamp01(inward / ROCK_BEVEL)) ** 2;
      const slant = normalise(add(add(normal, scale(shape.onDisc(stratum.towards), bevel)), scale(bump, 1.4)));

      // Its wave: a line of light, glowing round it
      const distance = fromWave(stratum, look);
      const line = 1 - smoothstep(WAVE_LINE * 0.5, WAVE_LINE * 1.6, distance);
      const wave = add(scale(WAVE_COLOUR, 0.4 * Math.exp(-distance / WAVE_GLOW) + 0.5 * line), scale(WAVE_HOT, 0.65 * line));

      const ground: Ground = {
        colour: scale(craterise(rock, direction, craters), tone),
        glow: add(wave, scale(cockpit, ROCK_SPILL * Math.exp(-inward / ROCK_SPILL_REACH))),
        shine: 0.08,
      };
      const towardLight = (x + 0.5 - centre) * SUNLIGHT[0] + (y + 0.5 - centre) * SUNLIGHT[1];
      const pixel = { normal, cover, halo: 0, towardLight: towardLight / (Math.hypot(x + 0.5 - centre, y + 0.5 - centre) * lightAcross) };
      const colour = shade(ground, pixel, slant, look, SUNLIGHT, cockpit);

      const at = ((y - place.y + place.atlasY) * atlas.width + (x - place.x + place.atlasX)) * 4;
      atlas.pixels.set([...colour.map((c) => Math.round(clamp01(c) * 255)), Math.round(clamp01(cover * (1 - crack)) * 255)], at);
    }
  return { core, chunks: atlas };
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
