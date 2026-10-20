import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { defaultLang, type Lang } from '@/i18n';

/** A synth with its texts in one language. */
export interface Synth {
  id: string;
  data: CollectionEntry<'synths'>['data'];
  text: CollectionEntry<'synthTexts'>;
}

/** A skin of a synth's slideshow, with its picture. */
export type Skin = Synth['data']['skins'][number];

/** A pair of a synth's skins its window is shown in by night and by day: a dark one and a light one. */
export interface NightAndDay {
  night: Skin;
  day: Skin;
}

/**
 * The pairs of skins a synth's window is shown in by night and by day: first SynthWorld's own two, which every synth
 * made with it has (the framework's SWSkin and SWLightSkin), if its synth.yaml has both, then its `nightAndDay`.
 */
export function nightAndDayOf({ id, data }: Synth): NightAndDay[] {
  const skin = (name: string) => {
    const found = data.skins.find((skin) => skin.name === name);
    if (!found) throw new Error(`The synth "${id}" shows its window in a skin "${name}" that its skins don't have`);
    return found;
  };
  const own = ['SW Default', 'SW Light'].every((name) => data.skins.some((skin) => skin.name === name));
  return [
    ...(own ? [{ night: skin('SW Default'), day: skin('SW Light') }] : []),
    ...data.nightAndDay.map(({ night, day }) => ({ night: skin(night), day: skin(day) })),
  ];
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
