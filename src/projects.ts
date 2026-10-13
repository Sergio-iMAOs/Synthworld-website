import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { defaultLang, type Lang } from '@/i18n';

/** A project of the portfolio with its texts in one language. */
export interface Project {
  id: string;
  data: CollectionEntry<'projects'>['data'];
  text: CollectionEntry<'projectTexts'>;
}

/** The projects in the order they're shown, with their texts in a language (in English where it's missing). */
export async function getProjects(lang: Lang): Promise<Project[]> {
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);

  return Promise.all(
    projects.map(async ({ id, data }) => {
      const text = (await getEntry('projectTexts', `${id}/${lang}`)) ?? (await getEntry('projectTexts', `${id}/${defaultLang}`));
      if (!text) throw new Error(`The project "${id}" has no ${defaultLang}.md`);
      return { id, data, text };
    }),
  );
}

/** A project's years as they're shown: "2019", "2025 – 2026", "2026 – Today". */
export function yearsOf({ from, to }: Project['data'], today: string): string {
  return to === undefined || to === from ? `${from}` : `${from} – ${to === 'today' ? today : to}`;
}
