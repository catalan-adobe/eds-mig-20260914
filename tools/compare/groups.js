// Names the group of each page, so a task can score only its own pages.
import { readFileSync } from 'node:fs';

export const GROUPS = [
  'stub', 'search', 'about', 'faqs', 'members',
  'home', 'adventures', 'magazine', 'adventure', 'article',
];

const PAGES = readFileSync(new URL('../import/pages.txt', import.meta.url), 'utf8')
  .split('\n')
  .filter(Boolean);
const FULL_LOCALES = ['/us/en', '/ca/en'];
const PLAIN = { 'ai-powered-search': 'search', 'about-us': 'about', faqs: 'faqs' };
const MEMBERS = '/ca/en/magazine/members-only';

export function groupOf(path) {
  const [, language, locale, section, child] = path.split('/');
  const root = `/${language}/${locale}`;
  if (!section) return FULL_LOCALES.includes(root) ? 'home' : 'stub';
  if (path === MEMBERS) return 'members';
  if (section === 'adventures' || section === 'magazine') {
    if (child) return section === 'adventures' ? 'adventure' : 'article';
    return section;
  }
  if (PLAIN[section]) return PLAIN[section];
  throw new Error(`no group for page ${path}`);
}

export function pagesIn(groups) {
  const unknown = groups.find((group) => !GROUPS.includes(group));
  if (unknown) throw new Error(`unknown group "${unknown}". Known: ${GROUPS.join(', ')}`);
  return PAGES.filter((path) => groups.includes(groupOf(path)));
}
