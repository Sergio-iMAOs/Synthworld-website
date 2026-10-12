# CLAUDE.md

This file guides Claude Code (claude.ai/code) when working in this repository.

## What this is

The website of SynthWorld's synthesizers (EARL is the first): it shows them to musicians and is where they are distributed from.

The synths are made with SynthWorld, a C++20 framework in another repository, usually checked out next to this one at `../Synthworld`. It is the source of truth for anything the site says about the synths: read its `README.md`, `CLAUDE.md` and `docs/` instead of guessing, and don't state features, platforms or formats they don't have. Nothing has been released yet, and only Linux has been built and tested.

**The framework is private and isn't being released**: the synths come first. So the site is for the people who play the synths, not for developers. It doesn't link to the framework's repository, and has nothing on making synths with it (its API, its build, its code). It may say what the engine gives the player.

## Commands

```bash
npm run dev        # Dev server at http://localhost:4321
npm run build      # astro check (types) and then the build, into dist/
npm run check      # Only the type check
npm run preview    # Serves dist/
npm run sync       # Copies the font, the manual and the palette from the framework (see below)
```

There are no tests or linter: `npm run build` is the check to run before finishing a change.

## Structure

A static Astro site (no UI framework, no client-side JavaScript so far), in TypeScript (`astro/tsconfigs/strict`). `@/` is `src/`.

- `src/site.ts`: what doesn't depend on the language (the name, the manual's address, the contact address and the portfolio's URL, both unset for now).
- `src/i18n/`: the languages (`index.ts`) and the site's own texts in each (`ui.ts`).
- `src/content/synths/<synth>/`: a synth. `synth.yaml` has its facts (version, formats, platforms, price, downloads, audio and video demos), `en.md` and `es.md` its texts. They are two content collections (`synths`, `synthTexts`; fields in `src/content.config.ts`) that `getSynths(lang)` in `src/synths.ts` joins: pages use it, not the collections. Adding a synth is adding a folder.
- `src/pages/[...lang]/`: the pages, each built once per language.
- `src/layouts/Base.astro`: the page every page is in (`title` and `description` props).
- `src/components/`: `SynthCard` (a synth in a list), `SynthGet` (its buy button and downloads), `SynthDemos` (its audio and videos), `Header`, `Footer`.
- `src/styles/global.css`: the only global stylesheet. What's only one component's goes in its own `<style>`.
- `public/demos/<synth>/`: the audio demos' files.

## Languages

English and Spanish. English is at the root (`/synths/`), Spanish under `/es/` (`/es/synths/`).

- Every text a visitor reads is in both: a string of the site in `src/i18n/ui.ts` (the Spanish object has the English one's type, so a missing key doesn't build), a synth's text in its `en.md` and `es.md`. No text is written in a page or a component.
- A page gets its language from its URL (`langOf(Astro.url)`) and its texts with `textsOf(lang)`. Links between pages go through `pathIn(lang, '/synths/')`, never a bare path.
- A new page goes in `src/pages/[...lang]/` with `export const getStaticPaths = langPaths`.
- The manual is the exception: only in English, one address for both.

## From the framework

`npm run sync` (`scripts/sync-framework.mjs`) copies three things from `../Synthworld` (or `SYNTHWORLD_DIR`). They are committed here, so the site builds without the framework, but never edited here: change them there and sync.

- `src/assets/fonts/`: Oscilla, SynthWorld's UI font, used for headings and navigation.
- `src/styles/palette.css`: the default skin's palette (`struct Palette` in `modules/synthworld_gui/skin/Skin.h`) as custom properties with its names (`--background`, `--recess`, `--surface`, `--foreground`, `--accent`, `--highlight`, `--warning`). Use them, not literal colours.
- `public/manual/index.html`: the user manual every SynthWorld synth shares (an outline for now), served at `/manual/` as a page of its own, with its own styles.

The site looks like the synths' UI, which is still changing: sync when it does.

## Free and paid synths

EARL is free. Some later synths will be paid (none exists yet), so nothing may assume a synth is free or that its files are public:

- A synth's `paid` field (`price`, `buyUrl`) makes it a paid one; without it, it's free. `downloads` are only the files anyone may have: a free synth itself, a paid synth's demo.
- A paid synth's files never go in this repository, in `public/`, or anywhere the web server serves to everyone. The site stays static: selling (payment, licences, delivering the files) is an outside service's, which `buyUrl` links to.

## Hosting

The author's own server: `dist/` is uploaded to it. The files to download (free synths, demos) are on the same server at `/downloads/<synth>/<file>`, in a folder outside `dist/` and this repository, so that a deploy doesn't delete them and builds don't carry them.

## Not decided yet

- The domain (not bought): `site` is unset in `astro.config.mjs`. The site is served from the domain's root, so paths start at `/`.
- How the site is uploaded (no deploy script yet).
- Which service sells the paid synths, and whether they need licence keys.
- The contact address and the portfolio's URL (`src/site.ts`).
- Where videos are hosted: `SynthDemos` assumes YouTube.
