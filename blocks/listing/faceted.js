// The result pages that Coveo draws on the source: text filter, facets, sort, list and grid
// view, pager and page size, rendered from an index sheet. The state lives in the URL query.
import {
  element, formatDate, href, image, loadRows, param, setParams,
} from './shared.js';

const SIZES = [10, 25, 50, 100];
const PLACEHOLDER = {
  blogs: 'Search Blogs',
  'success-stories': 'Search Success Stories',
  webinars: 'Search Webinars',
  articles: 'Search Articles',
  news: 'Search News Releases',
  resources: 'Search Resources',
  events: 'Search Events',
};
const SHOWN_VALUES = 8;
const split = (value) => (value ?? '')
  .split(';')
  .map((v) => v.trim())
  .filter(Boolean);
const unique = (list) => [...new Set(list)];

/** The facet values of a row in one column; products count at their first level. */
function valuesOf(row, column) {
  if (column === 'year') return row.date ? [row.date.slice(0, 4)] : [];
  if (column === 'availability') {
    if (!row.date) return [];
    return [new Date(`${row.date}T23:59:59`) < new Date() ? 'On-Demand' : 'Upcoming'];
  }
  const values = split(row[column]);
  if (column !== 'product') return unique(values);
  // the category facet of the source: first level, and the second below a chosen first level
  return unique(
    values.flatMap((v) => {
      const [top, sub] = v.split('|');
      return sub ? [top, `${top}|${sub}`] : [top];
    }),
  );
}

/** The authored `facets` row: "Products=product, Year=year" to [{ label, column }]. */
const facetsOf = (text) => (text ?? '')
  .split(',')
  .map((pair) => pair.split('='))
  .filter(([, column]) => column)
  .map(([label, column]) => ({
    label: label.trim(),
    column: column.trim(),
  }));

function readState(facets, config) {
  const chosen = Object.fromEntries(
    facets.map(({ column }) => [column, (param(`f-${column}`) ?? '').split('|').filter(Boolean)]),
  );
  return {
    q: param('q') ?? '',
    chosen,
    defaultSort: /^relevan/i.test(config.sort) ? 'relevance' : 'date',
    sort: param('sort') ?? (/^relevan/i.test(config.sort) ? 'relevance' : 'date'),
    size: SIZES.includes(Number(param('size')))
      ? Number(param('size'))
      : parseInt(config['page-size'], 10) || SIZES[0],
    page: Math.max(parseInt(param('page'), 10) || 1, 1),
    view: param('view') === 'grid' ? 'grid' : 'list',
    collapsed: new Set(),
  };
}

function writeState(state, facets) {
  const params = {
    q: state.q || null,
    sort: state.sort === state.defaultSort ? null : state.sort,
    size: state.size === SIZES[0] ? null : state.size,
    page: state.page > 1 ? state.page : null,
    view: state.view === 'grid' ? 'grid' : null,
  };
  facets.forEach(({ column }) => {
    params[`f-${column}`] = state.chosen[column].join('|') || null;
  });
  setParams(params);
}

const terms = (q) => q.toLowerCase().split(/\s+/).filter(Boolean);
const textOf = (row) => [
  row.title, row.description, row.authors, row.tags, row.product, row.solution,
]
  .join(' ')
  .toLowerCase();

/** The rows that match the query and the chosen values of every facet but `except`. */
function filter(rows, state, facets, except) {
  const words = terms(state.q);
  return rows.filter(
    (row) => words.every((w) => textOf(row).includes(w))
      && facets.every(
        ({ column }) => column === except
          || !state.chosen[column].length
          || valuesOf(row, column).some((v) => state.chosen[column].includes(v)),
      ),
  );
}

function sorted(rows, state) {
  if (state.sort !== 'relevance' || !state.q) return rows;
  const words = terms(state.q);
  const title = (row) => (row.title ?? '').toLowerCase();
  const score = (row) => words.filter((w) => title(row).includes(w)).length;
  return [...rows].sort((a, b) => score(b) - score(a));
}

/** The values a facet shows: products show one level of their tree at a time. */
function shownValues(column, counts, chosen) {
  const all = [...counts.keys()];
  if (column !== 'product') return all;
  const [parent] = chosen;
  return parent
    ? all.filter((v) => v.startsWith(`${parent}|`))
    : all.filter((v) => !v.includes('|'));
}

function facetValue(column, value, count, checked, toggle) {
  const text = element('span', 'listing-facet-label', value.split('|').pop());
  const counted = element('span', 'listing-facet-count', `(${count.toLocaleString('en-US')})`);
  if (column === 'product') {
    const button = element('button', 'listing-facet-node', text);
    button.type = 'button';
    button.addEventListener('click', toggle);
    return button;
  }
  const input = element('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', toggle);
  return element('label', '', input, text, counted);
}

function facetBox({ label, column }, rows, state, update) {
  const counts = new Map();
  const add = (v) => counts.set(v, (counts.get(v) ?? 0) + 1);
  rows.forEach((row) => valuesOf(row, column).forEach(add));
  const chosen = state.chosen[column];
  chosen.forEach((v) => counts.set(v, counts.get(v) ?? 0));
  if (!counts.size) return null;
  const order = column === 'year' ? (a, b) => b.localeCompare(a) : (a, b) => a.localeCompare(b);
  const values = shownValues(column, counts, chosen).sort(order);
  const list = element('ul', 'listing-facet-values');
  if (column === 'product' && chosen.length) {
    const back = element(
      'button',
      'listing-facet-node active',
      element('span', 'listing-facet-label', chosen[0]),
    );
    back.type = 'button';
    back.addEventListener('click', () => update(() => {
      state.chosen[column] = [];
    }));
    list.append(element('li', 'parent', back));
  }
  values.forEach((value, i) => {
    const checked = chosen.includes(value);
    const toggle = () => update(() => {
      if (column === 'product') state.chosen[column] = [value];
      else state.chosen[column] = checked ? chosen.filter((v) => v !== value) : [...chosen, value];
    });
    const item = facetValue(column, value, counts.get(value), checked, toggle);
    list.append(element('li', i >= SHOWN_VALUES ? 'more' : '', item));
  });
  const title = element('button', 'listing-facet-title', label);
  title.type = 'button';
  const box = element(
    'div',
    `listing-facet ${column}${state.collapsed.has(column) ? ' collapsed' : ''}`,
    title,
  );
  title.addEventListener('click', () => {
    if (box.classList.toggle('collapsed')) state.collapsed.add(column);
    else state.collapsed.delete(column);
  });
  if (values.length > SHOWN_VALUES) {
    const search = element('input', 'listing-facet-search');
    search.type = 'search';
    search.placeholder = 'Search';
    search.setAttribute('aria-label', `Search ${label}`);
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      list.classList.toggle('searching', Boolean(q));
      list.querySelectorAll('li').forEach((li) => {
        li.hidden = Boolean(q) && !li.textContent.toLowerCase().includes(q);
      });
    });
    box.append(element('div', 'listing-facet-find', search));
  }
  box.append(list);
  if (values.length > SHOWN_VALUES) {
    const more = element('button', 'listing-facet-more', '+ Show more');
    more.type = 'button';
    more.addEventListener('click', () => {
      more.textContent = list.classList.toggle('all') ? '- Show less' : '+ Show more';
    });
    box.append(more);
  }
  return box;
}

// What the source's result template of each sheet shows: the badge field, where the date goes
// (`head`: beside the badge, `visual`: under the picture), and the authors line.
const CARDS = {
  blogs: { date: 'visual', authors: true },
  articles: { badge: 'type', date: 'head', authors: true },
  resources: { badge: 'type', authors: true },
  'success-stories': { badge: 'type', plain: true },
  webinars: { badge: 'availability', date: 'head' },
  events: { badge: 'availability', date: 'head' },
  news: { badge: 'type', date: 'head' },
};

/** "Tags: A, B, C, 2 more...": first level of the products, then the solutions, three shown. */
function tagLine(row) {
  const tags = unique([...split(row.product).map((v) => v.split('|')[0]), ...split(row.solution)]);
  if (!tags.length) return null;
  const more = tags.length > 3 ? `, ${tags.length - 3} more...` : '';
  const text = ` ${tags.slice(0, 3).join(', ')}${more}`;
  return element('p', 'listing-result-tags', element('strong', '', 'Tags:'), text);
}

function resultHead(row, card, date) {
  if (!card.badge && card.date !== 'head') return null;
  const badge = card.badge && valuesOf(row, card.badge)[0];
  return element(
    'div',
    'listing-result-head',
    badge ? element('span', `listing-badge${card.plain ? ' plain' : ''}`, badge) : element('span'),
    card.date === 'head' ? element('span', 'listing-result-date', date) : null,
  );
}

/** One result, as the source's Coveo template: badge and date, text, then the picture. */
function result(row, sheet) {
  const card = CARDS[sheet] ?? CARDS.news;
  const link = (child, className) => {
    const a = element('a', className, child);
    a.href = href(row.path);
    return a;
  };
  const date = [formatDate(row.date), row.readTime && `${row.readTime} min read`]
    .filter(Boolean).join(' / ');
  const authors = split(row.authors).map((a) => a.split('=')[0]);
  const text = element(
    'div',
    'listing-result-text',
    element('h2', 'listing-result-title', link(row.title)),
    row.description ? element('p', 'listing-result-excerpt', row.description) : null,
    card.authors && authors.length
      ? element('p', 'listing-result-authors', `By: ${authors.join(', ')}`) : null,
    tagLine(row),
    link('Read Article', 'listing-result-cta'),
  );
  const visual = element(
    'div',
    'listing-result-visual',
    link(image(row) ?? element('span', 'listing-result-noimage'), 'listing-result-image'),
    card.date === 'visual' ? element('p', 'listing-result-date', date) : null,
  );
  const head = resultHead(row, card, date);
  return element(
    'li',
    `listing-result${head ? '' : ' no-head'}`,
    head,
    element('div', 'listing-result-body', text, visual),
  );
}

function pager(total, state, update) {
  const pages = Math.ceil(total / state.size);
  const nav = element('nav', 'listing-pagination');
  if (pages > 1) {
    const button = (content, page, className = '') => {
      const b = element('button', `listing-page ${className}`.trim(), content);
      b.type = 'button';
      b.disabled = page < 1 || page > pages;
      if (page === state.page && !className) b.setAttribute('aria-current', 'page');
      b.addEventListener('click', () => update(() => {
        state.page = page;
      }, true));
      return b;
    };
    const from = Math.max(1, Math.min(state.page - 2, pages - 4));
    const numbers = Array.from({ length: Math.min(5, pages) }, (_, i) => from + i)
      .map((n) => button(String(n), n));
    nav.append(
      element(
        'div',
        'listing-pages',
        button(element('span', 'listing-arrow prev'), state.page - 1, 'prev'),
        ...numbers,
        button(element('span', 'listing-arrow next'), state.page + 1, 'next'),
      ),
    );
  }
  const sizes = element(
    'div',
    'listing-sizes',
    element('span', 'listing-size-label', 'Results per page'),
  );
  SIZES.forEach((size) => {
    const b = element(
      'button',
      `listing-size${size === state.size ? ' active' : ''}`,
      String(size),
    );
    b.type = 'button';
    b.addEventListener('click', () => update(() => {
      state.size = size;
      state.page = 1;
    }, true));
    sizes.append(b);
  });
  if (total > SIZES[0]) nav.append(sizes);
  return nav;
}

function searchBox(state, sheet, onSearch) {
  const input = element('input', 'listing-search-input');
  input.type = 'search';
  input.placeholder = PLACEHOLDER[sheet] ?? 'Search';
  input.setAttribute('aria-label', input.placeholder);
  input.value = state.q;
  const submit = element('button', 'listing-search-submit');
  submit.type = 'submit';
  submit.setAttribute('aria-label', 'Search');
  const form = element('form', 'listing-search', submit, input);
  form.role = 'search';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    onSearch(input.value.trim());
  });
  return form;
}

function statusBar(shown, total, state, update) {
  const summary = element('div', 'listing-summary');
  if (total) {
    summary.append(
      'Results ',
      element(
        'strong',
        '',
        `${(state.page - 1) * state.size + 1}-${(state.page - 1) * state.size + shown}`,
      ),
      ' of ',
      element('strong', '', total.toLocaleString('en-US')),
    );
    if (state.q) summary.append(' for ', element('strong', '', state.q));
  }
  const select = element('select', 'listing-sort');
  [
    ['date', 'Date'],
    ['relevance', 'Relevance'],
  ].forEach(([value, label]) => {
    const option = element('option', '', label);
    option.value = value;
    option.selected = state.sort === value;
    select.append(option);
  });
  select.setAttribute('aria-label', 'Sort by');
  select.addEventListener('change', () => update(() => {
    state.sort = select.value;
    state.page = 1;
  }));
  const view = (name) => {
    const b = element('button', `listing-view ${name}${state.view === name ? ' active' : ''}`);
    b.type = 'button';
    b.setAttribute('aria-label', `${name} view`);
    b.setAttribute('aria-pressed', String(state.view === name));
    b.addEventListener('click', () => update(() => {
      state.view = name;
    }));
    return b;
  };
  const refine = element('button', 'listing-refine', 'Sort & Filter');
  refine.type = 'button';
  refine.addEventListener('click', () => {
    refine.closest('.listing').classList.toggle('refine-open');
  });
  return element(
    'div',
    'listing-status',
    summary,
    refine,
    element(
      'div',
      'listing-group',
      element('label', 'listing-sort-label', element('strong', '', 'Sort by:'), ' ', select),
      element('div', 'listing-views', view('list'), view('grid')),
    ),
  );
}

/** The chosen facet values, each with a remove button, and "Clear" (the source's breadbox). */
function breadbox(state, update) {
  const chosen = Object.entries(state.chosen).flatMap(([column, values]) => values
    .map((value) => [column, value]));
  if (!chosen.length) return null;
  const list = element('ul', 'listing-breadbox-list');
  chosen.forEach(([column, value]) => {
    const remove = element('button', 'listing-crumb', value.split('|').pop());
    remove.type = 'button';
    remove.setAttribute('aria-label', `Remove ${value}`);
    remove.addEventListener('click', () => update(() => {
      state.chosen[column] = state.chosen[column].filter((v) => v !== value);
    }));
    list.append(element('li', '', remove));
  });
  const clear = element('button', 'listing-breadbox-clear', 'Clear');
  clear.type = 'button';
  clear.addEventListener('click', () => update(() => {
    Object.keys(state.chosen).forEach((k) => { state.chosen[k] = []; });
  }));
  list.append(element('li', '', clear));
  return element('div', 'listing-breadbox', list);
}

function empty(state, update) {
  const box = element(
    'div',
    'listing-empty',
    element(
      'p',
      'listing-empty-title',
      state.q ? `We couldn't find anything for “${state.q}”` : 'No results',
    ),
  );
  box.append(
    element(
      'p',
      '',
      'You may want to try using different keywords, deselecting filters, '
        + 'or checking for spelling mistakes.',
    ),
  );
  const clear = element('button', 'listing-empty-clear', 'Clear all filters');
  clear.type = 'button';
  clear.addEventListener('click', () => update(() => {
    state.q = '';
    Object.keys(state.chosen).forEach((k) => {
      state.chosen[k] = [];
    });
  }));
  box.append(clear);
  return box;
}

export default async function faceted(block, config) {
  const sheet = (config.sheet || 'blogs').trim();
  const facets = facetsOf(config.facets);
  const state = readState(facets, config);
  const rows = await loadRows([sheet]);
  const facetsCol = element('div', 'listing-facets');
  const main = element('div', 'listing-results');
  let input;
  let render;
  const update = (change, scroll) => {
    const before = state.page;
    change();
    if (state.page === before && !scroll) state.page = 1;
    writeState(state, facets);
    render(scroll);
  };
  render = (scroll) => {
    const found = sorted(filter(rows, state, facets), state);
    const pages = Math.max(Math.ceil(found.length / state.size), 1);
    state.page = Math.min(state.page, pages);
    const shown = found.slice((state.page - 1) * state.size, state.page * state.size);
    const others = (f) => filter(rows, state, facets, f.column);
    const boxes = facets.map((f) => facetBox(f, others(f), state, update));
    facetsCol.replaceChildren(...boxes.filter(Boolean));
    const list = element(
      'ul',
      `listing-list ${state.view}`,
      ...shown.map((row) => result(row, sheet)),
    );
    const children = [
      statusBar(shown.length, found.length, state, update),
      breadbox(state, update),
      found.length ? list : empty(state, update),
      pager(found.length, state, update),
    ];
    main.replaceChildren(...children.filter(Boolean));
    if (input) input.value = state.q;
    if (scroll) block.scrollIntoView({ behavior: 'smooth' });
  };
  const parts = [];
  if (config.title) {
    const form = searchBox(state, sheet, (q) => update(() => {
      state.q = q;
    }));
    input = form.querySelector('input');
    parts.push(
      element(
        'div',
        'listing-search-head',
        element('h3', 'listing-search-title', config.title),
        form,
      ),
    );
  }
  parts.push(element('div', 'listing-layout', facetsCol, main));
  block.replaceChildren(...parts);
  window.addEventListener('popstate', () => {
    Object.assign(state, readState(facets, config));
    render();
  });
  render();
}
