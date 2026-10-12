# SynthWorld website

The website of [SynthWorld](https://github.com/Sergio-iMAOs/SynthWorld), the C++ framework for making plugin synthesizers: it shows the framework and the synths made with it (EARL), and is where they are downloaded from.

A static site made with [Astro](https://astro.build) and TypeScript.

## Develop

Node 22 or later.

```bash
npm install
npm run dev        # The site at http://localhost:4321, reloading as you edit
npm run build      # Type-checks, then builds the site into dist/
npm run preview    # Serves dist/
```

## Where things are

```
src/site.ts              The site's name, description, navigation and the framework's repository
src/content/synths/      One Markdown file per synth (its fields: src/content.config.ts)
src/pages/               The pages: the framework (index), the synths, the downloads
src/layouts/Base.astro   The page every page is in: head, header, footer
src/components/          Header, Footer, SynthGet (a synth's buy button and downloads)
src/styles/global.css    The palette (SynthWorld's default skin), the fonts and the shared styles
src/assets/fonts/        Oscilla, SynthWorld's UI font (copied from the framework's assets/)
public/                  Files served as they are
```

To add a synth, add its Markdown file to `src/content/synths/`: it gets its page and its place in the list. Its `downloads` are the files anyone can have (a paid synth's demo); a paid synth also has `paid`, its price and where it's bought.
