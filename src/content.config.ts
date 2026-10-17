import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// A synth is a folder in src/content/synths: its synth.yaml (what doesn't depend on the language) and one
// Markdown file per language (en.md, es.md).

/** A text in every language (what a synth.yaml or a project.yaml has of them: its images' descriptions). */
const inEveryLanguage = z.object({ en: z.string(), es: z.string() });

/** A synth's facts. Its id is its folder's name, and its page's address. */
const synths = defineCollection({
  loader: glob({
    pattern: '*/synth.yaml',
    base: './src/content/synths',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z.object({
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
      /**
       * Its logo, its page's header in place of its name, a path from its folder: a sun's radius high, the sun and the
       * name standing on its bottom edge, on a horizon the page draws (scripts/screenshots.mjs).
       */
      logo: image().optional(),
      /** Its picture at the top of its page and in the lists: its whole window, a path from its folder. */
      cover: z.object({ image: image(), alt: inEveryLanguage }).optional(),
      /**
       * Its page's other pictures: its pages or parts of its window, each with what it shows. Its texts place each
       * one with <!-- screenshot: <id> -->; one they don't place is shown after them.
       */
      screenshots: z
        .array(z.object({ id: z.string(), image: image(), alt: inEveryLanguage, caption: inEveryLanguage }))
        .default([]),
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

// A project of the portfolio is a folder in src/content/projects, like a synth: its project.yaml, en.md and es.md,
// and its images next to them.

/** A project's facts. Its id is its folder's name, and its page's address. */
const projects = defineCollection({
  loader: glob({
    pattern: '*/project.yaml',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      /** The years it was made in. Without `to`, only one. */
      from: z.number(),
      to: z.union([z.number(), z.literal('today')]).optional(),
      /** Where it's shown in the list of projects (lowest first). */
      order: z.number().default(0),
      /** Its picture in the lists, a path from its folder ("./cover.jpg"). */
      cover: image(),
      /** False for a project that is only in the list, without a page of its own. */
      page: z.boolean().default(true),
      /** A video, by its YouTube id. */
      youtube: z.string().optional(),
      /** Its page's pictures, in order: images from its folder, or silent video loops (in public/portfolio/<project>/). */
      media: z
        .array(
          z.union([
            z.object({ image: image(), alt: inEveryLanguage }),
            z.object({ video: z.string(), width: z.number(), height: z.number(), alt: inEveryLanguage }),
          ]),
        )
        .default([]),
    }),
});

/** A project's texts in one language: "<project>/<language>". */
const projectTexts = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/projects' }),
  schema: z.object({
    /** One sentence: under its name, in the lists and for search engines. */
    summary: z.string(),
    /** A second sentence, only for the list of projects. */
    blurb: z.string().optional(),
    /** A link at the end of its page: a path of this site or a URL. */
    link: z.object({ label: z.string(), url: z.string() }).optional(),
  }),
});

export const collections = { synths, synthTexts, projects, projectTexts };
