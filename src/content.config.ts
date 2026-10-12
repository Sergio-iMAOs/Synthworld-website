import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** The synths made with SynthWorld: one Markdown file each in src/content/synths. */
const synths = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/synths' }),
  schema: z.object({
    name: z.string(),
    summary: z.string(),
    version: z.string(),
    formats: z.array(z.string()),
    platforms: z.array(z.string()),
    /** Where it's shown in the list of synths (lowest first). */
    order: z.number().default(0),
    /** A paid synth's price as it's shown ("49 €") and where it's bought; a synth without `paid` is free. */
    paid: z.object({ price: z.string(), buyUrl: z.url().optional() }).optional(),
    /** The files anyone can download: a free synth itself, a paid synth's demo. Empty while there are none. */
    downloads: z
      .array(z.object({ label: z.string(), url: z.url() }))
      .default([]),
  }),
});

export const collections = { synths };
