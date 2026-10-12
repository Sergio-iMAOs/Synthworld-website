/** What doesn't depend on the language. The site's texts are in src/i18n/ui.ts. */
export const site = {
  name: 'SynthWorld',
  /** The user manual every synth shares: one page of its own, only in English (public/manual). */
  manual: '/manual/',
  /** An address for the About page to show; none is shown while it's undefined. */
  contact: undefined as string | undefined,
  /** The author's portfolio, linked from the About page once it has a URL. */
  portfolio: undefined as string | undefined,
};
