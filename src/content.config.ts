import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// A synth is a folder in src/content/synths: its synth.yaml (what doesn't depend on the language) and one
// Markdown file per language (en.md, es.md).

/** A synth's facts. Its id is its folder's name, and its page's address. */
const synths = defineCollection({
  loader: glob({
    pattern: '*/synth.yaml',
    base: './src/content/synths',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: z.object({
    name: z.string(),
    version: z.string(),
    formats: z.array(z.string()),
    platforms: z.array(z.string()),
    /** Where it's shown in the list of synths (lowest first). */
    order: z.number().default(0),
    /** A paid synth's price as it's shown ("49 €") and where it's bought; a synth without `paid` is free. */
    paid: z.object({ price: z.string(), buyUrl: z.url().optional() }).optional(),
    /** The files anyone can download: a free synth itself, a paid synth's demo. Empty while there are none. */
    downloads: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    /** Sound examples: audio files (in public/demos/<synth>/, as "/demos/<synth>/file.mp3"). */
    audio: z.array(z.object({ title: z.string(), src: z.string() })).default([]),
    /** Videos, by their YouTube id. */
    videos: z.array(z.object({ title: z.string(), youtube: z.string() })).default([]),
  }),
});

/** A synth's texts in one language: "<synth>/<language>". */
const synthTexts = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/synths' }),
  schema: z.object({
    /** One sentence: under its name, in the lists and for search engines. */
    summary: z.string(),
  }),
});

export const collections = { synths, synthTexts };
