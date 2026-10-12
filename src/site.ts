/** What the whole site says about SynthWorld: change it here, not in the pages. */
export const site = {
  name: 'SynthWorld',
  tagline: 'A C++ framework for making plugin synthesizers',
  description:
    'SynthWorld is a C++20 framework for making plugin synthesizers: write your DSP processors, and it makes them a deep polyphonic synth with free routing and a modulation matrix where anything modulates anything.',
  /** The framework's repository (private for now: the links to it only work once it's public). */
  repo: 'https://github.com/Sergio-iMAOs/SynthWorld',
  nav: [
    { href: '/', label: 'Framework' },
    { href: '/synths/', label: 'Synths' },
    { href: '/download/', label: 'Download' },
  ],
} as const;
