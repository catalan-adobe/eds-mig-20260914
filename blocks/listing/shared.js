// What the three kinds of list share: markup, dates, the index sheets, the URL state.
import { languageRoot, siteRoot } from '../../scripts/site.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function element(tag, className, ...children) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.append(...children.filter((c) => c instanceof Node || (typeof c === 'string' && c)));
  return el;
}

/** "2023-08-16" to "Aug 16, 2023", as the source writes dates. */
export function formatDate(iso) {
  const [y, m, d] = (iso ?? '').split('-').map(Number);
  return y && m ? `${MONTHS[m - 1]} ${String(d).padStart(2, '0')}, ${y}` : '';
}

/** Every row of a sheet of the language's index, read in pages of 1000. */
export async function loadSheet(name) {
  const rows = [];
  for (let offset = 0, total = 1; offset < total;) {
    const url = `${languageRoot()}/data/index.json?sheet=${encodeURIComponent(name)}`
      + `&limit=1000&offset=${offset}`;
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch(url);
    if (!response.ok) break;
    // eslint-disable-next-line no-await-in-loop
    const json = await response.json();
    rows.push(...(json.data ?? []));
    total = json.total ?? rows.length;
    offset += json.data?.length || total;
  }
  return rows;
}

/** The rows of several sheets, newest first, each path once. */
export async function loadRows(sheets) {
  const lists = await Promise.all(sheets.map(loadSheet));
  const seen = new Set();
  return lists.flat().filter((row) => row.path && !seen.has(row.path) && seen.add(row.path))
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

export const href = (path) => (/^https?:/.test(path) ? path : siteRoot() + path);
export const pairs = (value) => (value ?? '').split(';').filter(Boolean)
  .map((pair) => pair.split('='));

export function image(row, className) {
  if (!row.image) return null;
  const img = element('img', className);
  img.src = href(row.image);
  img.alt = row.title ?? '';
  img.loading = 'lazy';
  return img;
}

/** Sets URL parameters without a reload; `null` removes one. */
export function setParams(params, push = true) {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === '') url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  });
  window.history[push ? 'pushState' : 'replaceState'](null, '', url);
}

export const param = (key) => new URLSearchParams(window.location.search).get(key);

/** The source's page links: first, the current one and its neighbours, last, with "...". */
export function pageNumbers(current, pages) {
  let from = Math.max(current - 1, 1);
  let to = Math.min(current + 1, pages);
  if (current < 2) to = Math.min(3, pages);
  else if (current > pages - 1) from = Math.max(pages - 2, 1);
  const out = [];
  for (let n = 1; n <= pages; n += 1) {
    if (n === 1 || (n >= from && n <= to) || n === pages) {
      out.push(n);
      if (n + 1 < from || (n === to && n + 1 < pages)) out.push('...');
    }
  }
  return out;
}
