/**
 * Index-backed site search for the header (DF-01, dynamics § search-index-backed).
 *
 * The source (AEM core search) matched whole words — `surf` answered 3 title hits and
 * skipped "Arctic Surfing" — so a term matches a field only as a whole word. Title hits
 * rank first; description hits are consulted only below the visible cap; results are
 * deduped by title + description and the dropdown is capped like the source (10 items).
 */

const INDEX_URL = '/us/en/query-index.json';
const MIN_LENGTH = 3;
const VISIBLE = 10;
const DEBOUNCE_MS = 150;

let indexRows = null;

async function loadIndex() {
  if (indexRows) return indexRows;
  const res = await fetch(`${INDEX_URL}?limit=500`);
  indexRows = res.ok ? (await res.json()).data : [];
  return indexRows;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wordMatchers(query) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map((t) => new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(t)}(?![\\p{L}\\p{N}])`, 'iu'));
}

export function rank(rows, query) {
  const matchers = wordMatchers(query);
  if (matchers.length === 0) return [];
  const hasAll = (s) => matchers.every((re) => re.test(String(s || '')));
  const titleHits = rows.filter((r) => hasAll(r.title));
  const descHits = titleHits.length < VISIBLE
    ? rows.filter((r) => !hasAll(r.title) && hasAll(r.description))
    : [];
  const seen = new Set();
  return [...titleHits, ...descHits]
    .filter((r) => {
      const key = `${r.title}|${r.description}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, VISIBLE);
}

function markTitle(title, query) {
  const span = document.createElement('span');
  span.className = 'site-search-item-title';
  const words = query.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  const re = new RegExp(`(${words.join('|')})`, 'giu');
  title.split(re).forEach((part, i) => {
    if (i % 2 === 1) {
      const mark = document.createElement('mark');
      mark.className = 'site-search-item-mark';
      mark.textContent = part;
      span.append(mark);
    } else if (part) {
      span.append(part);
    }
  });
  return span;
}

function renderResults(results, box, input, query) {
  box.replaceChildren();
  results.forEach((r) => {
    const a = document.createElement('a');
    a.className = 'site-search-item';
    a.href = r.path;
    a.setAttribute('role', 'option');
    a.append(markTitle(r.title, query));
    box.append(a);
  });
  const open = results.length > 0;
  box.classList.toggle('is-open', open);
  input.setAttribute('aria-expanded', String(open));
}

/**
 * Wires the header search field to the query index.
 * @param {Element} search the `.site-search` root (form + results box)
 */
export default function wireIndexSearch(search) {
  const input = search.querySelector('input');
  const box = search.querySelector('.site-search-results');
  const form = search.querySelector('form');
  let timer;

  const run = async () => {
    const query = input.value.trim();
    if (query.length < MIN_LENGTH) {
      renderResults([], box, input, query);
      return;
    }
    const rows = await loadIndex();
    if (input.value.trim() !== query) return;
    renderResults(rank(rows, query), box, input, query);
  };

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(run, DEBOUNCE_MS);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run();
  });
  input.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') renderResults([], box, input, '');
  });
  document.addEventListener('click', (e) => {
    if (!search.contains(e.target)) renderResults([], box, input, '');
  });

  const initial = new URLSearchParams(window.location.search).get(input.name);
  if (initial) {
    input.value = initial;
    input.dispatchEvent(new Event('input'));
  }
}
