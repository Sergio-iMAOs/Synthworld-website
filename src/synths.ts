import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { defaultLang, type Lang } from '@/i18n';

/** A synth with its texts in one language. */
export interface Synth {
  id: string;
  data: CollectionEntry<'synths'>['data'];
  text: CollectionEntry<'synthTexts'>;
}

/** The synths in the order they're shown, with their texts in a language (in English where it's missing). */
export async function getSynths(lang: Lang): Promise<Synth[]> {
  const synths = (await getCollection('synths')).sort((a, b) => a.data.order - b.data.order);

  return Promise.all(
    synths.map(async ({ id, data }) => {
      const text = (await getEntry('synthTexts', `${id}/${lang}`)) ?? (await getEntry('synthTexts', `${id}/${defaultLang}`));
      if (!text) throw new Error(`The synth "${id}" has no ${defaultLang}.md`);
      return { id, data, text };
    }),
  );
}
