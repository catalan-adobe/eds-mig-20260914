const INDEX_PATH = '/f52-1011-02/search-index.json';
const PAGE_SIZE = 8;

let searchCount = 0;
let indexPromise;

function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(INDEX_PATH)
      .then((resp) => {
        if (!resp.ok) throw new Error(`search: ${INDEX_PATH} answered ${resp.status}`);
        return resp.json();
      })
      .then((json) => json.data || [])
      .catch((error) => {
        indexPromise = null;
        // eslint-disable-next-line no-console
        console.error(error);
        return [];
      });
  }
  return indexPromise;
}

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([name, value]) => {
    if (name === 'className' || name === 'textContent' || name === 'hidden') node[name] = value;
    else node.setAttribute(name, value);
  });
  node.append(...children);
  return node;
}

/**
 * Rank of a page for the query words: 0 title, 1 description or keywords, 2 text, -1 no match.
 * Every word must occur somewhere; the rank is the best field that holds all of them,
 * or 2 when the words are spread over several fields.
 */
function rank(row, words) {
  const title = (row.title || '').toLowerCase();
  const meta = `${row.description || ''} ${row.keywords || ''}`.toLowerCase();
  const all = `${title} ${meta} ${row.text || ''}`.toLowerCase();
  if (!words.every((word) => all.includes(word))) return -1;
  if (words.every((word) => title.includes(word))) return 0;
  if (words.every((word) => meta.includes(word))) return 1;
  return 2;
}

function findMatches(rows, query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return rows
    .map((row) => ({ row, rank: rank(row, words) }))
    .filter((match) => match.rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .map((match) => match.row);
}

function buildItem(row, layout) {
  const link = el('a', { href: row.path });
  if (layout === 'card') {
    link.append(row.image
      ? el('img', {
        className: 'search-result-image', src: row.image, alt: '', loading: 'lazy',
      })
      : el('div', { className: 'search-result-image placeholder', 'aria-hidden': 'true' }));
  }
  const body = el('div', { className: 'search-result-body' }, el('h3', { textContent: row.title || row.path }));
  if (row.description) body.append(el('p', { textContent: row.description }));
  link.append(body);
  return el('li', {}, link);
}

export default function decorate(block) {
  searchCount += 1;
  const inputId = `search-${searchCount}-input`;
  const placeholder = block.textContent.trim();
  const state = { matches: [], shown: 0, layout: 'list' };

  const input = el('input', {
    id: inputId, className: 'search-input', type: 'text', name: 'q', placeholder, autocomplete: 'off',
  });
  const clear = el('button', {
    type: 'button', className: 'search-clear', 'aria-label': 'Clear', hidden: true,
  });
  const toggle = el('input', { type: 'checkbox', 'aria-label': 'Show AI-generated summary' });
  toggle.checked = true;
  const form = el(
    'form',
    { className: 'search-form', autocomplete: 'off' },
    el(
      'div',
      { className: 'search-field' },
      el('label', { className: 'search-label', for: inputId, textContent: 'Search' }),
      el('i', { className: 'search-icon', 'aria-hidden': 'true' }),
      input,
      clear,
    ),
    el('label', { className: 'search-toggle' }, toggle, 'Show AI-generated summary'),
  );

  const cardButton = el('button', { type: 'button', 'aria-pressed': 'false', textContent: 'Cards' });
  const listButton = el('button', { type: 'button', 'aria-pressed': 'true', textContent: 'List' });
  const results = el('ul', { className: 'search-results list', 'aria-label': 'Search results' });
  const more = el('button', {
    type: 'button', className: 'search-more', textContent: 'Load more results', hidden: true,
  });
  const section = el(
    'div',
    { className: 'search-results-section', hidden: true },
    el(
      'div',
      { className: 'search-toolbar' },
      el('div', { className: 'search-layout', role: 'group', 'aria-label': 'Results layout' }, cardButton, listButton),
    ),
    results,
    more,
  );

  const render = () => {
    results.className = `search-results ${state.layout}`;
    results.replaceChildren(
      ...state.matches.slice(0, state.shown).map((row) => buildItem(row, state.layout)),
    );
    section.hidden = !state.matches.length;
    more.hidden = state.shown >= state.matches.length;
  };

  const setLayout = (layout) => {
    state.layout = layout;
    cardButton.setAttribute('aria-pressed', String(layout === 'card'));
    listButton.setAttribute('aria-pressed', String(layout === 'list'));
    render();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = input.value;
    const matches = findMatches(await loadIndex(), query);
    if (query !== input.value) return;
    state.matches = matches;
    state.shown = PAGE_SIZE;
    render();
  });
  input.addEventListener('input', () => {
    clear.hidden = !input.value;
  });
  clear.addEventListener('click', () => {
    input.value = '';
    clear.hidden = true;
    state.matches = [];
    state.shown = 0;
    render();
    input.focus();
  });
  cardButton.addEventListener('click', () => setLayout('card'));
  listButton.addEventListener('click', () => setLayout('list'));
  more.addEventListener('click', () => {
    state.shown += PAGE_SIZE;
    render();
  });

  block.setAttribute('role', 'search');
  block.replaceChildren(form, section);
}
