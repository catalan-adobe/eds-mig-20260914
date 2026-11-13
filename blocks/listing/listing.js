import { getLanguage, siteRoot } from '../../scripts/site.js';
import faceted from './faceted.js';
import {
  element,
  formatDate,
  href,
  image,
  loadRows,
  loadSheet,
  pageNumbers,
  pairs,
  param,
  setParams,
} from './shared.js';

const PAGE_SIZES = [10, 25, 50];
// the blogsDev filters of the category page, in the source's order: URL key, label
const FILTERS = [
  ['products', 'Products'],
  ['solutions', 'Solutions'],
  ['year', 'Year'],
  ['content-type/blog', 'Blog Series'],
  ['regions', 'Regions'],
];

/** The authored rows of the block: { key: text }. */
function readConfig(block) {
  return Object.fromEntries(
    [...block.children]
      .map((row) => {
        const [key, value] = [...row.children].map((c) => c.textContent.trim());
        return [key?.toLowerCase(), value ?? ''];
      })
      .filter(([key]) => key),
  );
}

/** Links of `Name=/path;…` pairs, comma separated, after a label. */
function linkLine(className, label, list, toHref) {
  if (!list.length) return null;
  const line = element('div', className, `${label} `);
  list.forEach(([key, text], i) => {
    const a = element('a', '', text);
    a.href = toHref(key);
    line.append(a, i < list.length - 1 ? ', ' : '');
  });
  return line;
}

const isWebinar = (row) => /webinar/i.test(row.label || row.type);

/** The date line of a post: "Aug 16, 2023 / 3 min read", or "On Demand" for a past webinar. */
function dateLine(row) {
  const line = element('span', 'listing-post-date');
  if (isWebinar(row) && row.date && new Date(`${row.date}T23:59:59`) < new Date()) {
    line.append('On Demand');
    return line;
  }
  line.append(formatDate(row.date));
  if (row.readTime) {
    line.append(element('span', 'listing-post-slash', '/'), `${row.readTime} min read`);
  }
  return line;
}

/** One post of the author and category lists, as the source's blogsDev item. */
function post(row, categoryOf) {
  const label = (row.label || row.type || '').toUpperCase();
  const link = element('a', 'listing-post-image', image(row));
  link.href = href(row.path);
  link.title = row.title;
  const title = element('a', '', row.title);
  title.href = href(row.path);
  const tags = pairs(row.tags);
  const authors = pairs(row.authors).map(([name, path]) => [path, name]);
  return element(
    'article',
    'listing-post',
    element(
      'div',
      'listing-post-left',
      link,
      element('div', 'listing-post-row', element('span', 'listing-label', label), dateLine(row)),
    ),
    element(
      'div',
      'listing-post-right',
      element('span', 'listing-label', label),
      element('h2', 'listing-post-title', title),
      linkLine('listing-post-authors', row.byline || 'By', authors, href),
      linkLine(
        'listing-post-tags',
        'Tags:',
        tags,
        (slug) => `${href(categoryOf(row))}?tag=${slug}`,
      ),
    ),
  );
}

function pagerLink(content, page, active, onPage) {
  const a = element('a', `listing-page${active ? ' active' : ''}`, content);
  const params = new URLSearchParams(window.location.search);
  params.set('pageno', page);
  a.href = `?${params}`;
  a.addEventListener('click', (e) => {
    e.preventDefault();
    onPage(page);
  });
  return a;
}

/** The pager and the page size choice of the post lists; empty below the smallest size. */
function postPager(total, state, render) {
  const nav = element('div', 'listing-pager');
  if (total <= Math.min(...PAGE_SIZES)) return nav;
  const pages = Math.ceil(total / state.size);
  const go = (page) => {
    state.page = page;
    setParams({ pageno: page });
    render(true);
  };
  const wrap = element('div', 'listing-pages');
  const arrow = (dir) => element('span', `listing-arrow ${dir}`);
  wrap.append(pagerLink(arrow('prev'), Math.max(state.page - 1, 1), false, go));
  pageNumbers(state.page, pages).forEach((n) => wrap.append(
    n === '...'
      ? element('span', 'listing-dots', '...')
      : pagerLink(String(n), n, n === state.page, go),
  ));
  wrap.append(pagerLink(arrow('next'), Math.min(state.page + 1, pages), false, go));
  const sizes = element('div', 'listing-sizes');
  PAGE_SIZES.forEach((size) => {
    const a = element('a', `listing-size${size === state.size ? ' active' : ''}`, String(size));
    a.addEventListener('click', () => {
      if (size === state.size) return;
      state.size = size;
      state.page = 1;
      setParams({ pagesize: size, pageno: 1 });
      render(true);
    });
    sizes.append(a);
  });
  nav.append(
    wrap,
    element(
      'div',
      'listing-size-wrap',
      element('div', 'listing-size-label', 'Results per page'),
      sizes,
    ),
  );
  return nav;
}

/** A paged list of posts; `rows()` gives the rows after the filters. */
function postList(container, rows, categoryOf) {
  const state = {
    size: parseInt(param('pagesize'), 10) || PAGE_SIZES[0],
    page: Math.max(parseInt(param('pageno'), 10) || 1, 1),
  };
  setParams({ pagesize: state.size, pageno: state.page }, false);
  const render = (scroll) => {
    const list = rows();
    const pages = Math.max(Math.ceil(list.length / state.size), 1);
    state.page = Math.min(state.page, pages);
    const shown = list.slice((state.page - 1) * state.size, state.page * state.size);
    container.replaceChildren(
      ...shown.map((row) => post(row, categoryOf)),
      postPager(list.length, state, render),
    );
    if (scroll) container.scrollIntoView({ behavior: 'smooth' });
  };
  return render;
}

/** The category page of a language: blogs and articles each have their own. */
const categoryOf = (row) => row.category
  || (/article/i.test(row.type)
    ? '/articles/category'
    : `${getLanguage() === 'en' ? '' : `/${getLanguage()}`}/blogs/chip-design/category`);

/** The posts of the author page, in the order of the author's `posts` in the index. */
async function author(block, config) {
  const sheets = (config.sheet || 'posts')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const page = window.location.pathname.slice(siteRoot().length).replace(/\.html$/, '');
  const [people, all] = await Promise.all([loadSheet('authors'), loadRows(sheets)]);
  const listed = people.find((a) => a.path === page)?.posts;
  const byPath = new Map(all.map((row) => [row.path, row]));
  const mine = listed
    ? listed
      .split(';')
      .map((path) => byPath.get(path))
      .filter(Boolean)
    : all.filter((row) => pairs(row.authors).some(([, path]) => path === page));
  const list = element('div', 'listing-posts');
  block.replaceChildren(list);
  postList(list, () => mine, categoryOf)();
}

/** The tag ids of a row's filters under one key: products, year, content-type/blog. */
function valuesOf(row, key) {
  if (key === 'year') return row.date ? [[row.date.slice(0, 4), row.date.slice(0, 4)]] : [];
  return pairs(row.filters)
    .filter(([id]) => id.startsWith(`${key}/`))
    .map(([id, label]) => [
      id
        .slice(key.length + 1)
        .split('/')
        .pop(),
      label,
    ]);
}

function selected() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    FILTERS.map(([key]) => [key, (params.get(key) ?? '').split(',').filter(Boolean)]),
  );
}

const matches = (row, chosen, except) => FILTERS.every(
  ([key]) => key === except
      || !chosen[key].length
      || valuesOf(row, key).some(([v]) => chosen[key].includes(v)),
);

/** The filter accordions of the category page. */
function filters(rows, onChange) {
  const box = element('div', 'listing-filters');
  const expanded = new Set();
  const draw = () => {
    const chosen = selected();
    box.replaceChildren(
      ...FILTERS.map(([key, label]) => {
        const values = new Map();
        rows
          .filter((row) => matches(row, chosen, key))
          .forEach((row) => valuesOf(row, key).forEach(([v, text]) => values.set(v, text)));
        if (!values.size) return null;
        const content = element('div', 'listing-filter-content');
        [...values]
          .sort((a, b) => (key === 'year' ? b[0] - a[0] : a[1].localeCompare(b[1])))
          .forEach(([value, text], i) => {
            const input = element('input');
            input.type = 'checkbox';
            input.id = `filter-${key.replace(/\W/g, '-')}-${value}`;
            input.checked = chosen[key].includes(value);
            input.addEventListener('change', () => {
              const next = input.checked
                ? [...chosen[key], value]
                : chosen[key].filter((v) => v !== value);
              setParams({ [key]: next.join(','), pageno: 1 });
              onChange();
              draw();
            });
            const lab = element('label', 'listing-filter-label', text);
            lab.htmlFor = input.id;
            content.append(
              element('div', `listing-filter-item${i >= 5 ? ' more' : ''}`, input, lab),
            );
          });
        if (values.size > 5) {
          const more = element('a', 'listing-filter-more', '+ Show More');
          more.addEventListener('click', () => {
            const open = content.classList.toggle('all');
            more.textContent = open ? '- Show Less' : '+ Show More';
          });
          content.append(more);
        }
        const header = element('button', 'listing-filter-header', label);
        header.type = 'button';
        header.classList.toggle('active', expanded.has(key));
        header.addEventListener('click', () => {
          if (header.classList.toggle('active')) expanded.add(key);
          else expanded.delete(key);
        });
        const clear = element(
          'button',
          'listing-filter-clear',
          chosen[key].length ? `Clear (${chosen[key].length})` : '',
        );
        clear.type = 'button';
        clear.hidden = !chosen[key].length;
        clear.addEventListener('click', () => {
          setParams({ [key]: null, pageno: 1 });
          onChange();
          draw();
        });
        return element('div', 'listing-filter', header, clear, content);
      }).filter(Boolean),
    );
  };
  draw();
  return box;
}

/** Stories and writers of the category, and its top writers with their photos. */
async function summary(rows) {
  const writers = new Map();
  rows.forEach((row) => pairs(row.authors).forEach(([name, path]) => {
    const entry = writers.get(path) ?? { name, path, count: 0 };
    entry.count += 1;
    writers.set(path, entry);
  }));
  const number = (n, text) => element(
    'div',
    `listing-count ${text.toLowerCase()}`,
    element('span', 'listing-number', rows.length ? String(n) : ''),
    element('p', 'listing-count-text', text),
  );
  const counts = element(
    'div',
    'listing-counts',
    number(rows.length, 'Stories'),
    number(writers.size, 'Writers'),
  );
  const top = [...writers.values()].sort((a, b) => b.count - a.count).slice(0, 3);
  const photos = top.length
    ? new Map((await loadSheet('authors')).map((a) => [a.path, a.image]))
    : new Map();
  const writersBox = element(
    'div',
    'listing-writers',
    element('div', 'listing-writers-title', 'Top Writers'),
  );
  top.forEach(({ name, path }) => {
    const a = element(
      'a',
      'listing-writer',
      image({ image: photos.get(path), title: name }, 'listing-writer-photo'),
      element('p', '', name),
    );
    a.href = href(path);
    writersBox.append(a);
  });
  return { counts, writersBox };
}

async function category(block, config) {
  const tag = param('tag');
  const all = tag ? await loadRows([config.sheet || 'blogs']) : [];
  const rows = all.filter((row) => pairs(row.tags).some(([slug]) => slug === tag));
  const label = rows.length && pairs(rows[0].tags).find(([slug]) => slug === tag)[1];
  if (label && document.title.startsWith('|')) document.title = `${label} ${document.title}`;
  const list = element('div', 'listing-posts');
  let render = () => {};
  const filterBox = filters(rows, () => render(true));
  render = postList(list, () => rows.filter((row) => matches(row, selected())), categoryOf);
  const { counts, writersBox } = await summary(rows);
  const close = element('button', 'listing-filters-close');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close');
  const panel = element('div', 'listing-filter-panel', close, filterBox);
  close.addEventListener('click', () => panel.classList.remove('open'));
  const open = element('button', 'listing-filters-open', 'Filter');
  open.type = 'button';
  open.addEventListener('click', () => panel.classList.add('open'));
  const mobile = element(
    'div',
    'listing-mobile',
    element(
      'div',
      'listing-mobile-row',
      counts.cloneNode(true),
      element('div', 'listing-vl'),
      writersBox.cloneNode(true),
    ),
    element('hr'),
    open,
  );
  block.replaceChildren(
    element('div', 'listing-main', mobile, list),
    element('div', 'listing-aside', counts, element('hr'), writersBox, element('hr'), panel),
  );
  render();
}

export default async function decorate(block) {
  const config = readConfig(block);
  block.textContent = '';
  if (block.classList.contains('faceted')) await faceted(block, config);
  else if (block.classList.contains('category')) await category(block, config);
  else await author(block, config);
}
