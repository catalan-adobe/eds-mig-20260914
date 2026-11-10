const INDEX_PATH = '/f52-1011-02/search-index.json';
const PREFIX = '/f52-1011-02';
const SOURCE_ORIGIN = 'https://wknd.site';
const SOURCE_API = `${SOURCE_ORIGIN}/content/wknd/us/en/ai-powered-search/jcr:content/root/container/contentaisearch`;
const PAGE_SIZE = 8;
const MIN_LOADING_MS = 300;
const REVEAL_MS = 12;

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

/** Path of the migrated twin of a source page URL; other URLs are returned absolute. */
function toLocal(url) {
  const { origin, pathname, href } = new URL(url, SOURCE_ORIGIN);
  if (origin !== SOURCE_ORIGIN || !pathname.endsWith('.html')) return href;
  return `${PREFIX}${pathname.slice(0, -'.html'.length)}`;
}

function labelFromUrl(url) {
  const last = new URL(url, SOURCE_ORIGIN).pathname.split('/').filter(Boolean).pop() || url;
  return decodeURIComponent(last)
    .replace(/\.html?$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

async function fetchSource(selector, query, cursors) {
  const params = new URLSearchParams({ q: query });
  if (cursors) params.set('cursors', JSON.stringify(cursors));
  const resp = await fetch(`${SOURCE_API}.${selector}.json?${params}`);
  // the source answers 204 without a body to origins it does not allow
  if (resp.status !== 200) throw new Error(`search: ${selector} answered ${resp.status}`);
  return resp.json();
}

async function searchSource(query, cursors) {
  const json = await fetchSource('search', query, cursors);
  const rows = (json.results || []).map((result) => {
    const meta = (result.data && result.data.metadata) || {};
    const url = meta.canonical_url || meta.url || meta.source || result.data.source || '';
    return {
      id: result.id,
      score: result.score || 0,
      path: url && toLocal(url),
      title: meta.title || (url && labelFromUrl(url)) || result.id,
      description: meta.description || '',
      image: meta.image || (meta.meta && meta.meta.image) || '',
    };
  });
  return { rows, hasMore: Boolean(json.hasMore), cursors: json.sourceCursors };
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

function searchIndex(rows, query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return rows
    .map((row) => ({ row, rank: rank(row, words) }))
    .filter((match) => match.rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .map((match) => match.row);
}

/** Results of the source's search service, or of the local index when it is out of reach. */
async function search(query) {
  try {
    return await searchSource(query);
  } catch (error) {
    return { rows: searchIndex(await loadIndex(), query), hasMore: false, local: true };
  }
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

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, label, url) => `<a href="${toLocal(url)}">${label}</a>`);
}

/** The answer uses paragraphs, "- " list items, **bold** and [label](url) only. */
function markdownToHtml(markdown) {
  let html = '';
  let inList = false;
  markdown.split(/\r?\n/).map((line) => line.trimStart()).forEach((line) => {
    const item = /^[-*]\s+/.test(line);
    if (item !== inList && (item || inList)) html += item ? '<ul>' : '</ul>';
    inList = item;
    if (item) html += `<li>${inlineMarkdown(line.replace(/^[-*]\s+/, ''))}</li>`;
    else if (line) html += `<p>${inlineMarkdown(line)}</p>`;
  });
  return inList ? `${html}</ul>` : html;
}

function buildSource(hit) {
  const url = (hit.metadata && (hit.metadata.url || hit.metadata.source)) || hit.source || '';
  const label = (hit.metadata && hit.metadata.title) || (url && labelFromUrl(url)) || hit.id;
  const chip = url ? el('a', { href: toLocal(url) }) : el('span');
  chip.className = 'search-source';
  chip.textContent = label;
  return el('li', {}, chip);
}

function buildForm(inputId, placeholder) {
  const input = el('input', {
    id: inputId, className: 'search-input', type: 'text', name: 'q', placeholder, autocomplete: 'off',
  });
  const clear = el('button', {
    type: 'button', className: 'search-clear', 'aria-label': 'Clear', hidden: true,
  });
  const toggle = el('input', { type: 'checkbox', 'aria-label': 'Show AI-generated summary' });
  toggle.checked = true;
  const icon = el('i', { className: 'search-icon', 'aria-hidden': 'true' });
  const spinner = el('span', { className: 'search-spinner', hidden: true });
  const form = el(
    'form',
    { className: 'search-form', autocomplete: 'off' },
    el(
      'div',
      { className: 'search-field' },
      el('label', { className: 'search-label', for: inputId, textContent: 'Search' }),
      icon,
      spinner,
      input,
      clear,
    ),
    el('label', { className: 'search-toggle' }, toggle, 'Show AI-generated summary'),
  );
  return {
    form, input, clear, toggle, icon, spinner,
  };
}

function buildSummary() {
  const loading = el(
    'div',
    { className: 'search-summary-loading', 'aria-live': 'polite', hidden: true },
    el(
      'div',
      { className: 'search-summary-card' },
      el('span', { className: 'search-summary-spinner', 'aria-hidden': 'true' }),
      el('p', { textContent: 'Generating answer...' }),
    ),
  );
  const text = el('div', { className: 'search-summary-text' });
  const sources = el('ul', { className: 'search-sources' });
  const summary = el(
    'div',
    { className: 'search-summary', hidden: true },
    el(
      'div',
      { className: 'search-summary-card' },
      el(
        'div',
        { className: 'search-summary-header' },
        el('span', { className: 'search-summary-icon', 'aria-hidden': 'true' }),
        el(
          'div',
          {},
          el('p', { className: 'search-summary-title', textContent: 'Generative answer' }),
          el('p', { className: 'search-summary-attribution', textContent: 'Powered by Content AI' }),
        ),
      ),
      text,
      el(
        'div',
        { className: 'search-sources-section' },
        el('p', { className: 'search-sources-label', textContent: 'Sources' }),
        sources,
      ),
      el('p', {
        className: 'search-disclaimer',
        textContent: 'AI-generated responses may be inaccurate. Verify important information before you travel.',
      }),
    ),
  );
  return {
    loading, summary, text, sources,
  };
}

function buildResults() {
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
  return {
    section, results, more, cardButton, listButton,
  };
}

const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/** Shows the generative answer of the source for a query; stays hidden when it fails. */
function summaryController(view) {
  let request = 0;
  const hide = () => {
    request += 1;
    view.summary.hidden = true;
    view.loading.hidden = true;
  };
  const reveal = async (answer, current) => {
    const tokens = (answer.result || '').split(/(\s+)/);
    view.sources.replaceChildren(...(answer.hits || []).map(buildSource));
    view.sources.style.visibility = 'hidden';
    view.summary.hidden = false;
    for (let count = 1; count <= tokens.length && current === request; count += 1) {
      view.text.innerHTML = markdownToHtml(tokens.slice(0, count).join(''));
      // eslint-disable-next-line no-await-in-loop
      await wait(REVEAL_MS);
    }
    view.sources.style.visibility = '';
  };
  const show = async (query) => {
    hide();
    const current = request;
    view.loading.hidden = false;
    const [answer] = await Promise.all([
      fetchSource('gensearch', query).catch(() => null),
      wait(MIN_LOADING_MS),
    ]);
    if (current !== request) return;
    view.loading.hidden = true;
    if (answer) reveal(answer, current);
  };
  return { show, hide };
}

export default function decorate(block) {
  searchCount += 1;
  const field = buildForm(`search-${searchCount}-input`, block.textContent.trim());
  const summaryView = buildSummary();
  const view = buildResults();
  const summary = summaryController(summaryView);
  const state = {
    query: '', rows: [], shown: 0, pageSize: PAGE_SIZE, hasMore: false, layout: 'list',
  };

  const render = () => {
    view.results.className = `search-results ${state.layout}`;
    view.results.replaceChildren(
      ...state.rows.slice(0, state.shown).map((row) => buildItem(row, state.layout)),
    );
    view.section.hidden = !state.rows.length;
    view.more.hidden = !state.hasMore && state.shown >= state.rows.length;
  };

  const setLayout = (layout) => {
    state.layout = layout;
    view.cardButton.setAttribute('aria-pressed', String(layout === 'card'));
    view.listButton.setAttribute('aria-pressed', String(layout === 'list'));
    render();
  };

  const setLoading = (loading) => {
    field.spinner.hidden = !loading;
    field.icon.hidden = loading;
  };

  const reset = () => {
    Object.assign(state, {
      query: '', rows: [], shown: 0, hasMore: false,
    });
    summary.hide();
    setLoading(false);
    render();
  };

  const runQuery = async () => {
    const query = field.input.value;
    if (!query.trim()) {
      reset();
      return;
    }
    state.query = query;
    if (field.toggle.checked) summary.show(query);
    else summary.hide();
    setLoading(true);
    const [found] = await Promise.all([search(query), wait(MIN_LOADING_MS)]);
    if (query !== state.query) return;
    setLoading(false);
    Object.assign(state, found);
    state.pageSize = found.local ? PAGE_SIZE : found.rows.length;
    state.shown = state.pageSize;
    render();
  };

  const loadMore = async () => {
    const { query } = state;
    state.shown += state.pageSize;
    if (state.hasMore && state.shown > state.rows.length) {
      view.more.disabled = true;
      const next = await searchSource(query, state.cursors)
        .catch(() => ({ rows: [], hasMore: false }));
      view.more.disabled = false;
      if (query !== state.query) return;
      const known = new Set(state.rows.map((row) => row.id));
      state.rows = [...state.rows, ...next.rows.filter((row) => !known.has(row.id))]
        .sort((a, b) => b.score - a.score);
      state.hasMore = next.hasMore;
      state.cursors = next.cursors;
    }
    render();
  };

  field.form.addEventListener('submit', (event) => {
    event.preventDefault();
    runQuery();
  });
  field.input.addEventListener('input', () => {
    field.clear.hidden = !field.input.value;
  });
  field.clear.addEventListener('click', () => {
    field.input.value = '';
    field.clear.hidden = true;
    reset();
    field.input.focus();
  });
  field.toggle.addEventListener('change', () => {
    if (!field.toggle.checked) summary.hide();
    else if (state.query && state.query === field.input.value) summary.show(state.query);
  });
  view.cardButton.addEventListener('click', () => setLayout('card'));
  view.listButton.addEventListener('click', () => setLayout('list'));
  view.more.addEventListener('click', loadMore);

  block.setAttribute('role', 'search');
  block.replaceChildren(field.form, summaryView.loading, summaryView.summary, view.section);
}
