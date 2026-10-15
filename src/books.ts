import type { ImageMetadata } from 'astro';
import berkleeJazzHarmony from '@/assets/portfolio/books/berklee-jazz-harmony.jpg';
import computerMusicTutorial from '@/assets/portfolio/books/computer-music-tutorial.jpg';
import soundReinforcementHandbook from '@/assets/portfolio/books/sound-reinforcement-handbook.jpg';
import peopleSkills from '@/assets/portfolio/books/people-skills.jpg';
import emotionalIntelligence from '@/assets/portfolio/books/emotional-intelligence.jpg';
import makingEmbeddedSystems from '@/assets/portfolio/books/making-embedded-systems.jpg';
import effectiveModernCpp from '@/assets/portfolio/books/effective-modern-cpp.jpg';
import manAndHisSymbols from '@/assets/portfolio/books/man-and-his-symbols.jpg';
import lsdMyProblemChild from '@/assets/portfolio/books/lsd-my-problem-child.jpg';
import island from '@/assets/portfolio/books/island.jpg';

/** A book of the portfolio's books page, in its latest edition. What its group, its edition and a top book's note say are texts of src/i18n/portfolio.ts. */
export interface Book {
  title: string;
  subtitle?: string;
  authors: string[];
  publisher: string;
  /** The year of the edition shown, not of the first one. */
  year: number;
  edition?: 'second' | 'anniversary25';
  group: 'sound' | 'code' | 'people' | 'mind';
  /** The edition's page at its publisher. */
  url: string;
  cover: ImageMetadata;
  /** In the top selection, with a note: `books.notes[top]`. */
  top?: 'berklee' | 'roads';
}

export const books: Book[] = [
  {
    title: 'The Berklee Book of Jazz Harmony',
    authors: ['Joe Mulholland', 'Tom Hojnacki'],
    publisher: 'Berklee Press',
    year: 2013,
    group: 'sound',
    url: 'https://www.halleonard.com/product/113755/the-berklee-book-of-jazz-harmony',
    cover: berkleeJazzHarmony,
    top: 'berklee',
  },
  {
    title: 'The Computer Music Tutorial',
    authors: ['Curtis Roads'],
    publisher: 'The MIT Press',
    year: 2023,
    edition: 'second',
    group: 'sound',
    url: 'https://mitpress.mit.edu/9780262044912/the-computer-music-tutorial/',
    cover: computerMusicTutorial,
    top: 'roads',
  },
  {
    title: 'The Sound Reinforcement Handbook',
    authors: ['Gary Davis', 'Ralph Jones'],
    publisher: 'Yamaha, Hal Leonard',
    year: 1989,
    edition: 'second',
    group: 'sound',
    url: 'https://www.halleonard.com/product/500964/the-sound-reinforcement-handbook',
    cover: soundReinforcementHandbook,
  },
  {
    title: 'Making Embedded Systems',
    subtitle: 'Design Patterns for Great Software',
    authors: ['Elecia White'],
    publisher: "O'Reilly",
    year: 2024,
    edition: 'second',
    group: 'code',
    url: 'https://www.oreilly.com/library/view/-/9781098151539/',
    cover: makingEmbeddedSystems,
  },
  {
    title: 'Effective Modern C++',
    subtitle: '42 Specific Ways to Improve Your Use of C++11 and C++14',
    authors: ['Scott Meyers'],
    publisher: "O'Reilly",
    year: 2014,
    group: 'code',
    url: 'https://www.oreilly.com/library/view/-/9781491908419/',
    cover: effectiveModernCpp,
  },
  {
    title: 'People Skills',
    subtitle: 'How to Assert Yourself, Listen to Others, and Resolve Conflicts',
    authors: ['Robert Bolton'],
    publisher: 'Touchstone',
    year: 1986,
    group: 'people',
    url: 'https://www.simonandschuster.com/books/People-Skills/Robert-Bolton/9780671622480',
    cover: peopleSkills,
  },
  {
    title: 'Emotional Intelligence',
    subtitle: 'Why It Can Matter More Than IQ',
    authors: ['Daniel Goleman'],
    publisher: 'Bantam',
    year: 2020,
    edition: 'anniversary25',
    group: 'people',
    url: 'https://www.penguinrandomhouse.com/books/69105/emotional-intelligence-by-daniel-goleman/',
    cover: emotionalIntelligence,
  },
  {
    title: 'Man and His Symbols',
    authors: ['Carl G. Jung', 'Marie-Louise von Franz', 'Joseph L. Henderson', 'Aniela Jaffé', 'Jolande Jacobi'],
    publisher: 'Bantam',
    year: 2023,
    group: 'mind',
    url: 'https://www.penguinrandomhouse.com/books/isbn/9780593499993/',
    cover: manAndHisSymbols,
  },
  {
    title: 'LSD: My Problem Child',
    subtitle: 'Insights/Outlooks',
    authors: ['Albert Hofmann'],
    publisher: 'Oxford University Press',
    year: 2019,
    group: 'mind',
    url: 'https://global.oup.com/academic/product/lsd-my-problem-child-9780198840206',
    cover: lsdMyProblemChild,
  },
  {
    title: 'Island',
    authors: ['Aldous Huxley'],
    publisher: 'Harper Perennial Modern Classics',
    year: 2009,
    group: 'mind',
    url: 'https://www.harpercollins.com/products/island-aldous-huxley',
    cover: island,
  },
];
