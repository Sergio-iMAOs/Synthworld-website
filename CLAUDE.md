# CLAUDE.md

This file guides Claude Code (claude.ai/code) when working in this repository.

## What this is

The website of SynthWorld, a C++20 framework for making plugin synthesizers, and of the synths made with it (EARL, its example synth, is the first). It shows them and is where they are distributed from.

The framework is another repository: https://github.com/Sergio-iMAOs/SynthWorld (private for now), usually checked out next to this one at `../Synthworld`. It is the source of truth for anything the site says about the framework or EARL: read its `README.md`, `CLAUDE.md` and `docs/` instead of guessing, and don't state features, platforms or formats it doesn't have. Both are works in progress: nothing has been released, and only Linux has been built and tested.

## Commands

```bash
npm run dev        # Dev server at http://localhost:4321
npm run build      # astro check (types) and then the build, into dist/
npm run check      # Only the type check
npm run preview    # Serves dist/
```

There are no tests or linter: `npm run build` is the check to run before finishing a change.

## Structure

A static Astro site (no UI framework, no client-side JavaScript so far), in TypeScript (`astro/tsconfigs/strict`). `@/` is `src/`.

- `src/site.ts`: the site's name, tagline, description, navigation and the framework's repository URL. Pages read them from here.
- `src/content/synths/*.md`: one file per synth, a content collection whose fields are in `src/content.config.ts`. A synth's page (`src/pages/synths/[id].astro`), the list of synths and the download page are all made from it, so adding a synth is adding a file.
- `src/layouts/Base.astro`: the page every page is in (`title` and `description` props).
- `src/styles/global.css`: the only global stylesheet. Its colours are the palette of SynthWorld's default skin (`modules/synthworld_gui/skin/Skin.h` in the framework), as custom properties with the skin's names (`--background`, `--recess`, `--surface`, `--foreground`, `--accent`, `--highlight`, `--warning`): use them, not literal colours. What's only one component's goes in its own `<style>`.
- `src/assets/fonts/`: Oscilla, SynthWorld's own UI font, used for headings and navigation. It is built in the framework (`assets/oscilla/build_oscilla.py`): copy it again from there when it changes, don't edit it here.

## Free and paid synths

EARL is free. Some later synths will be paid (none exists yet), so nothing may assume a synth is free or that its files are public:

- A synth's `paid` field (`price`, `buyUrl`) makes it a paid one; without it, it's free. `downloads` are only the files anyone may have: a free synth itself, a paid synth's demo. `src/components/SynthGet.astro` shows both, on the synth's page and the download page.
- A paid synth's files never go in this repository or in `public/`: everything here is served to everyone. The site stays static: selling (payment, licences, delivering the files) is an outside service's, which `buyUrl` links to.

## Not decided yet

- Which service sells the paid synths, and whether they need licence keys (the framework has nothing for that yet).
- The hosting: `site` (and `base`) are unset in `astro.config.mjs`. Internal links are written from the root (`/synths/`), so they need changing if the site is served from a subpath.
- Where the downloads are hosted (a synth's `downloads` are plain URLs).
