import type { ImageMetadata } from 'astro';
import conceptPassages from '@/assets/portfolio/concept-passages.jpg';
import viajeDeUnEspectador from '@/assets/portfolio/viaje-de-un-espectador.jpg';

/** A work of the portfolio's music page. What it is (`kind`) and its credit are texts of src/i18n/portfolio.ts. */
export interface Work {
  title: string;
  year: number;
  kind?: 'soundtrack' | 'soundtrackAlbum' | 'album';
  /** Where it plays from: SoundCloud's address of the track or playlist (with its secret token if it's private), or a YouTube id. */
  soundcloud?: string;
  youtube?: string;
  /** A playlist's player is a list of tracks, and taller. */
  playlist?: boolean;
  cover?: ImageMetadata;
  /** Shown under "Selected works"; the others under "All works". */
  selected?: boolean;
  /** Has a credit: `music.credits[title]`. */
  credit?: 'viaje';
}

export const works: Work[] = [
  { title: 'Stride', year: 2026, soundcloud: 'https://api.soundcloud.com/tracks/soundcloud:tracks:2368990001?secret_token=s-1MbZfTXfTVO', selected: true },
  { title: 'Parallel Sages', year: 2025, soundcloud: 'https://api.soundcloud.com/tracks/soundcloud:tracks:2193674587?secret_token=s-GU8gunAS2tr', selected: true },
  { title: 'Approaching', year: 2024, youtube: '9EsuJTxRDwU', selected: true },
  {
    title: 'Concept Passages',
    year: 2025,
    kind: 'soundtrackAlbum',
    soundcloud: 'https://api.soundcloud.com/playlists/soundcloud%3Aplaylists%3A2154642449',
    playlist: true,
    cover: conceptPassages,
  },
  { title: 'Annabelle', year: 2024, soundcloud: 'https://api.soundcloud.com/tracks/soundcloud:tracks:2126573586?secret_token=s-GUDniBZIYbE' },
  { title: 'Diario de Sueños', year: 2024, kind: 'soundtrack', youtube: '6T6ZJf00DtQ' },
  {
    title: 'Viaje de un espectador',
    year: 2023,
    kind: 'album',
    soundcloud: 'https://api.soundcloud.com/playlists/1963771484?secret_token=s-s5tVsRIpaiW',
    playlist: true,
    cover: viajeDeUnEspectador,
    credit: 'viaje',
  },
];

/** The address of SoundCloud's player for a track or playlist. */
export const soundcloudPlayer = (url: string, playlist = false) =>
  `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23b4451f&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=${!playlist}`;

/** The address of YouTube's player for a video. */
export const youtubePlayer = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`;
