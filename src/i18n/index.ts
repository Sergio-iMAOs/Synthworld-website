import { ui } from './ui';

/** The site's languages and their names in the language switch. English is at the root, the others under their code (/es/). */
export const languages = { en: 'English', es: 'Español' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

const isLang = (code: string | undefined): code is Lang => code !== undefined && code in languages;

/** The language of a page, from its URL. */
export function langOf(url: URL): Lang {
  const first = url.pathname.split('/')[1];
  return isLang(first) ? first : defaultLang;
}

/** The site's texts in a language. */
export const textsOf = (lang: Lang) => ui[lang];

/** A path written for the default language ("/synths/") as the same page's in a language. */
export function pathIn(lang: Lang, path: string): string {
  return lang === defaultLang ? path : `/${lang}${path}`;
}

/** A page's path without its language: what `pathIn` takes. */
export function pathWithoutLang(url: URL): string {
  const lang = langOf(url);
  return lang === defaultLang ? url.pathname : url.pathname.slice(lang.length + 1) || '/';
}

/** For `getStaticPaths` of the pages in src/pages/[...lang]: one page per language. */
export function langPaths() {
  return (Object.keys(languages) as Lang[]).map((lang) => ({
    params: { lang: lang === defaultLang ? undefined : lang },
  }));
}
