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
npm run sync       # Copies the font and the palette from the framework (see below)
npm run screenshots  # Takes the synths' screenshots with the framework's snapshot tool (see below)
```

There are no tests or linter: `npm run build` is the check to run before finishing a change.

## Structure

A static Astro site (no UI framework; the only client-side JavaScript is `SynthGet`'s, which picks the visitor's system, `SynthSkins`', its slideshow's buttons, `SynthDayNight`'s, its line's dragging, `SynthGraph`'s, its view's moving and its planets' opening (one line of it inline, so that its layout is there before it loads), and `SineTrail`'s and `Space`'s, decorations; the pages work without it), in TypeScript (`astro/tsconfigs/strict`). `@/` is `src/`.

- `src/site.ts`: what doesn't depend on the language (the name, the portfolio's path, the contact address, unset for now) and the portfolio's `author`.
- `src/i18n/`: the languages (`index.ts`) and the site's own texts in each (`ui.ts`).
- `src/content/synths/<synth>/`: a synth. `synth.yaml` has its facts (version, formats, platforms, price, downloads, audio and video demos, its `logo`, its `cover` and `screenshots` with their descriptions in both languages, its `skins` with a picture of each, `nightAndDay`, pairs of them for the home page, and its `planet` on the synths' page), `en.md` and `es.md` its texts, `screenshots/` and `skins/` its pictures. A text places each screenshot with `<!-- screenshot: <id> -->` and the slideshow of its skins with `<!-- skins -->`, and can set a part apart in `<div class="spotlight">` (EARL's velvet noise). They are two content collections (`synths`, `synthTexts`; fields in `src/content.config.ts`) that `getSynths(lang)` in `src/synths.ts` joins: pages use it, not the collections. Adding a synth is adding a folder. The home page shows each synth's window by night and by day from pairs of its `skins` (`nightAndDayOf()`): SynthWorld's own two, SW Default and SW Light, which every synth has, then the pairs its `nightAndDay` names (EARL's: Riso by day, Starship by night); without any, its `cover`. The synths' page is a synth's graph in space (`SynthGraph`): SynthWorld's planet (back to the home page) beaming into each synth's, a planet of its `planet`'s kind, then the synths still to come, uncharted planets of the kinds `unchartedWorlds` in `src/synths.ts` lists; the places for them are the component's (`places`), so a new synth needs one.
- `src/pages/[...lang]/`: the pages, each built once per language.
- `src/layouts/Base.astro`: the page every page of the synths' site is in (`title` and `description` props).
- `src/layouts/Portfolio.astro`: the same for the portfolio's pages (see below).
- `src/components/`: `ProjectCard` (a project of the portfolio in a list), `SynthGet` (its buy button, and its download: a button for the visitor's system with a menu of the others), `SynthScreenshot` (a picture of it in its page), `SynthSkins` (the slideshow of its skins: a row of pictures that scrolls without the script), `SynthDemos` (its audio and videos), `SynthDayNight` (its window in a light skin by day and a dark one by night, split by a line you drag, a button going to its next pair, on the home page), `SineTrail` (a sine wave following the mouse over the home page, behind its content and under the header), `SynthGraph` (the synths as planets in a graph you drag and zoom, a pane of glass for each, on the synths' page), `Planet` (a planet of the Starship skin's, for it), `Space` (the space behind the home page and the synths' page, see below), `SpaceObject` (a thing in space drawn for each of the engine's features on the home page, in their order in `ui.ts`: a new feature needs one), `Header`, `Footer`.
- `src/styles/global.css`: the synths' site's only global stylesheet. What's only one component's goes in its own `<style>`.
- `public/demos/<synth>/`: the audio demos' files.
- `src/assets/synthworld/`: SynthWorld's mark (see below): `mark.png`, the flat one, in the header; `logo.png`, the shaded one, floating in the home page's hero over `name.png` (the name, as the wide logo draws it); under them, each synth with a `logo` rises over a horizon as the page scrolls.

## Languages

English and Spanish. English is at the root (`/synths/`), Spanish under `/es/` (`/es/synths/`).

- Every text a visitor reads is in both: a string of the site in `src/i18n/ui.ts` (the Spanish object has the English one's type, so a missing key doesn't build), a synth's text in its `en.md` and `es.md`. No text is written in a page or a component.
- A page gets its language from its URL (`langOf(Astro.url)`) and its texts with `textsOf(lang)`. Links between pages go through `pathIn(lang, '/synths/')`, never a bare path.
- A new page goes in `src/pages/[...lang]/` with `export const getStaticPaths = langPaths`.

## The portfolio

The author's portfolio (Sergio iMAOs: music, projects, about, contact) is in this site, at `/Sergio-iMAOs/` (`/es/Sergio-iMAOs/`): the pages in `src/pages/[...lang]/Sergio-iMAOs/`. It is about the author, not the synths, and is a site of its own inside this one:

- Its pages are in `Portfolio.astro`, not `Base.astro`: its own header and footer, without the synths' navigation. The synths' About page links to it, and its footer links back.
- Its look is `src/styles/portfolio.css` only: its own colours and fonts, nothing of `global.css`, the synths' palette or Oscilla.
- The rules on languages are the same, but its texts are in `src/i18n/portfolio.ts` (`portfolioTextsOf(lang)`), not `ui.ts`.
- `src/content/projects/<project>/`: a project, like a synth: `project.yaml` (years, cover, its page's pictures and their descriptions in both languages), `en.md` and `es.md`, and its images next to them. The collections are `projects` and `projectTexts`, joined by `getProjects(lang)` in `src/projects.ts`. `page: false` leaves a project in the list without a page.
- `src/music.ts`: the works of the music page, played from SoundCloud and YouTube.
- `src/assets/portfolio/`: the other pages' photos. `public/portfolio/<project>/`: the projects' video loops (silent MP4s, instead of GIFs).
- `author` in `src/site.ts`: the name, the email and the profiles.

Its content came from the author's previous portfolio (sergioimaos.myportfolio.com): the texts and images, not the design. Its Synthworld project describes the framework as the author's work, which the synths' pages don't; it still doesn't link to the framework's repository.

## From the framework

`npm run sync` (`scripts/sync-framework.mjs`) copies two things from `../Synthworld` (or `SYNTHWORLD_DIR`). They are committed here, so the site builds without the framework, but never edited here: change them there and sync.

- `src/assets/fonts/`: Oscilla, SynthWorld's UI font, used for headings and navigation.
- `src/styles/palette.css`: the default skin's palette (`struct Palette` in `modules/synthworld_gui/skin/Skin.h`) as custom properties with its names (`--background`, `--recess`, `--surface`, `--foreground`, `--accent`, `--highlight`, `--warning`). Use them, not literal colours.

The site looks like the synths' UI, which is still changing: sync when it does.

The home page is in space: the one EARL's Starship skin draws behind its graph (`EarlStarshipSkin::drawProcessorGraphBody()` in `synths/EARL/EarlStarshipSkin.cpp`), without the rest of that skin's UI. Its pictures, the stars and the nebula, are that skin's `makeStars()` and `makeNebula()` ported to `src/space.ts`, same seeds and numbers (the nebula a larger piece, which repeats less), made at build time by `src/pages/space/[picture].ts`; `Space` layers them as the skin does, each drifting at its own pace as the page scrolls, as they do there as the view is panned. Its near black (`#03070d`, the skin's) is the one colour not from the palette. The synths' page is that skin's graph itself, with the synths for nodes: its planets are the skin's `makeWorld()` ported the same way (the cockpit's light round their edge in `--accent`, not its cyan; an uncharted one lit from behind), made at build time for the kinds the synths and `unchartedWorlds` use. A synth's planet is its own kind, added to `synthWorlds` there, that looks like the synth while it looks like a planet: made of chunks of its window in a skin (its picture in `skins/`, as `npm run screenshots` names it), the parts its look names on the chunks most in view (EARL's: in SW Light, its logo and tabs, its wavetables, its velvet noise...), ringed with its velvet noise's pulses; a new synth needs one; its beams, its nodes' sights and its star chart's marks are the skin's, in the palette's colours; its zoom's bounds are the framework's graph's (`GraphViewport`); and `Space` drifts with its view, up and down and sideways (`pannedBy="graph"`). Nothing syncs them: if the skin's space or planets change, change the port.

`npm run screenshots` (`scripts/screenshots.mjs`) takes the synths' screenshots the same way: the framework's off-screen snapshot tool (`synthworld_earl_snapshot`, built in `../Synthworld/build`, or `SYNTHWORLD_BUILD_DIR`) draws the synth's window, driven by the clicks the script lists for each shot, into `src/content/synths/<synth>/screenshots/`, in the SW Default skin (the site's palette) at twice the window's size, or a part of it (`crop`) at its own `scale`; the page shows each at most half its pixels wide. A synth's `logo` is drawn the same way by a tool of its own (EARL's: `synthworld_earl_header_snapshot`, its mark and name on a transparent background): its page's header, standing on a horizon the page draws across the whole width. SynthWorld's mark, the flat one the skin draws as a symbol (`SWSkin::drawMainSymbol()`: the ring in `--highlight`, the planet in `--accent`), is cut from the logo tool's sheet (`synthworld_logo_snapshot`) onto a transparent background, into `src/assets/synthworld/mark.png`, and the favicon (`public/favicon.png`) made from it; the shaded one, the logo (`SynthWorldLogo::drawMark()`), is cut from the same sheet into `src/assets/synthworld/logo.png`, and the name from its wide logo into `name.png` (`npm run screenshots -- synthworld`). They're committed too, and retaken, never edited, when the UI changes. The shots and how each is taken are in the script; what each shows, in `synth.yaml`.

## Free and paid synths

EARL is free. Some later synths will be paid (none exists yet), so nothing may assume a synth is free or that its files are public:

- A synth's `paid` field (`price`, `buyUrl`) makes it a paid one; without it, it's free. `downloads` are the systems it's made for (`os`, `arch`), each with the file anyone may have for it once there is one (`url`): a free synth itself, a paid synth's demo. A system without a `url` is offered as not available yet.
- A paid synth's files never go in this repository, in `public/`, or anywhere the web server serves to everyone. The site stays static: selling (payment, licences, delivering the files) is an outside service's, which `buyUrl` links to.

## Hosting

The domain is `synthworldaudio.com` (`site` in `astro.config.mjs`); the site is served from its root, so paths start at `/`.

For now the site is on GitHub Pages, from this repository, which is public: `.github/workflows/deploy.yml` builds it and publishes `dist/` on every push to `main`, and `public/CNAME` is the domain. So everything committed here, and everything in `dist/`, is public. GitHub Pages serves only what the build makes: no server configuration, headers or redirects.

It will move to the author's own server, maybe before EARL's release: `dist/` uploaded to it, the DNS pointed at it, and the workflow and `public/CNAME` removed. There, the files to download (free synths, demos) will be at `/downloads/<synth>/<file>`, in a folder outside `dist/` and this repository, so that a deploy doesn't delete them and builds don't carry them. Until then, a free synth's files can be in a GitHub Release, linked from its `downloads`. A closed beta's builds are never put on the site or in the repository.

## Not decided yet

- How the site will be uploaded to the author's server (no deploy script yet).
- Which service sells the paid synths, and whether they need licence keys.
- The contact address (`src/site.ts`).
- Where videos are hosted: `SynthDemos` assumes YouTube.
