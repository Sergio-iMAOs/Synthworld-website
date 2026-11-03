import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { defaultLang, type Lang } from '@/i18n';
import type { World } from '@/space';

/** The synths still to come, on the synths' page after the others: an uncharted planet each, of these kinds. */
export const unchartedWorlds: World[] = ['giant', 'ice'];

/** A synth with its texts in one language, or an effect (`data.effect`), which is the same but for where it's listed. */
export interface Synth {
  id: string;
  data: CollectionEntry<'synths'>['data'];
  text: CollectionEntry<'synthTexts'>;
}

/** A skin of a synth, with its picture. */
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

/** What's in src/content/synths, effects or not, in the order it's shown, with its texts in a language (in English where it's missing). */
async function getEntries(lang: Lang, effects: boolean): Promise<Synth[]> {
  const entries = (await getCollection('synths', ({ data }) => data.effect === effects)).sort((a, b) => a.data.order - b.data.order);

  return Promise.all(
    entries.map(async ({ id, data }) => {
      const text = (await getEntry('synthTexts', `${id}/${lang}`)) ?? (await getEntry('synthTexts', `${id}/${defaultLang}`));
      if (!text) throw new Error(`The synth "${id}" has no ${defaultLang}.md`);
      return { id, data, text };
    }),
  );
}

/** The synths in the order they're shown, with their texts in a language. */
export const getSynths = (lang: Lang) => getEntries(lang, false);

/** The effects: SynthWorld is about its synths, so they're only asteroids on the synths' page, with a page each. */
export const getEffects = (lang: Lang) => getEntries(lang, true);
