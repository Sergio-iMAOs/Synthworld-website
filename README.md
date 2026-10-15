# SynthWorld website

The website of SynthWorld's synthesizers (EARL is the first): it shows them and is where they are downloaded from. In English and Spanish.

A static site made with [Astro](https://astro.build) and TypeScript.

## Develop

Node 22 or later.

```bash
npm install
npm run dev        # The site at http://localhost:4321, reloading as you edit
npm run build      # Type-checks, then builds the site into dist/
npm run preview    # Serves dist/
npm run sync       # Copies the font, the manual and the palette from the framework's repository
```

## Where things are

```
src/site.ts              What doesn't depend on the language: the name, the contact address, the portfolio
src/i18n/                The languages (index.ts) and the site's texts in each (ui.ts)
src/content/synths/      One folder per synth: synth.yaml (its facts), en.md and es.md (its texts)
src/pages/[...lang]/     The pages, each built in every language: home, synths, download, about, and the portfolio (Sergio-iMAOs/)
src/layouts/Base.astro   The page every page is in: head, header, footer
src/layouts/Portfolio.astro   The same for the portfolio, which has a look of its own (src/styles/portfolio.css)
src/i18n/portfolio.ts    The portfolio's texts in each language
src/content/projects/    One folder per project of the portfolio: project.yaml, en.md, es.md and its images
src/music.ts             The works of the portfolio's music page
src/components/          Header, Footer, and a synth's card, demos, buy button and downloads
src/styles/              global.css, and palette.css (synced from the framework)
src/assets/fonts/        Oscilla, SynthWorld's UI font (synced from the framework)
public/manual/           The user manual (synced from the framework), served at /manual/
public/demos/            The synths' audio demos
scripts/                 sync-framework.mjs: what `npm run sync` runs
```

## Adding a synth

Add a folder to `src/content/synths/` with its `synth.yaml`, `en.md` and `es.md` (copy `earl/`): it gets its page and its place in the lists, in both languages. The fields of `synth.yaml` are described in `src/content.config.ts`.

- `downloads` are the files anyone can have: a free synth itself, or a paid synth's demo.
- A paid synth also has `paid`: its price and where it's bought. Its files are never put in this repository.
- `audio` are sound examples, their files in `public/demos/<synth>/`; `videos` are YouTube ids.

## Syncing from the framework

The Oscilla font, the palette and the user manual come from the framework's repository and are committed here. After they change there, run `npm run sync` (it looks for the framework at `../Synthworld`, or where `SYNTHWORLD_DIR` says) and commit the result.

## Deploying

For now the site is on GitHub Pages, at synthworldaudio.com: pushing to `main` builds and publishes it (`.github/workflows/deploy.yml`). The domain is in `public/CNAME`, and the repository's Settings → Pages has "GitHub Actions" as its source.

On the author's own server, later: build and upload `dist/`. The files to download are kept on the server in a folder of their own, served at `/downloads/`, outside `dist/`: an upload that mirrors `dist/` must not delete it.
