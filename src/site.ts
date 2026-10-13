/** What doesn't depend on the language. The site's texts are in src/i18n/ui.ts. */
export const site = {
  name: 'SynthWorld',
  /** The user manual every synth shares: one page of its own, only in English (public/manual). */
  manual: '/manual/',
  /** An address for the About page to show; none is shown while it's undefined. */
  contact: undefined as string | undefined,
  /** The author's portfolio: pages of this site with a look of their own (src/layouts/Portfolio.astro). A path for `pathIn`. */
  portfolio: '/Sergio-iMAOs/',
};

/** The portfolio's author, and where to find them. */
export const author = {
  name: 'Sergio iMAOs',
  email: 'sergioimaos@proton.me',
  instagram: { handle: '@sergioimaos', url: 'https://www.instagram.com/sergioimaos/' },
  soundcloud: 'https://soundcloud.com/user-997510603',
};
