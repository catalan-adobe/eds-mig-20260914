const ENDPOINT = 'https://www.synopsys.com/dw/api/v1/component';
const DOC_BASE = 'https://www.synopsys.com/dw/doc.php';
const TABS = [['products', 'Products'], ['dd', 'Downloads & Documentation']];

function element(tag, className, ...children) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.append(...children);
  return el;
}

function link(href, text) {
  const a = element('a', '', text);
  a.href = href;
  return a;
}

function table(rows) {
  const body = element('tbody', '');
  rows.forEach((cells) => body.append(element('tr', '', ...cells.map((c) => element('td', '', c)))));
  return element('table', '', body);
}

async function post(body) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`dw-products: ${ENDPOINT} answered ${response.status}`);
  const json = await response.json();
  if (!Array.isArray(json?.data)) throw new Error('dw-products: invalid API response');
  return json.data;
}

/** The API's products in the authored order, as the source asks for them: ids, else names. */
async function load(items) {
  const ids = items.filter((i) => i.id).map((i) => i.id);
  const components = items.filter((i) => !i.id && i.name).map((i) => i.name);
  const calls = [];
  if (ids.length) calls.push(post({ ids }));
  if (components.length) calls.push(post({ components }));
  const data = (await Promise.all(calls)).flat();
  const byId = new Map(data.map((d) => [String(d.id), d]));
  const byName = new Map(data.map((d) => [d.name, d]));
  return items.map((i) => byId.get(i.id) ?? byName.get(i.name)).filter(Boolean);
}

function productsTable(data) {
  return table(data.map((d) => [d.description ?? '', link(d.stars, 'STARs'),
    link(d.myDesignWare, 'Subscribe')]));
}

/** Show Documents / Hide Documents, then the documents by type and title, as the source. */
function documentation(docs) {
  const show = element('div', 'dw-toggle', 'Show Documents');
  const hide = element('div', 'dw-toggle', 'Hide Documents');
  const list = [];
  // the default sort, as the source: a missing type sorts as the string 'null'
  const types = [...new Set(docs.map((d) => d.type))].sort();
  types.forEach((type) => {
    if (type !== null && type !== undefined && type !== 'null') {
      list.push(element('div', 'dw-documentation-type', type));
    }
    const ofType = docs.filter((d) => d.type === type);
    [...new Set(ofType.map((d) => d.title))].sort().forEach((title) => {
      const paths = {};
      ofType.filter((d) => d.title === title).forEach((d) => { paths[d.format] = d.pathinfo; });
      const links = ['PDF', 'HTML', 'TEXT'].filter((f) => paths[f])
        .flatMap((f, i) => [...(i ? [' | '] : []), link(`${DOC_BASE}${paths[f]}`, f)]);
      list.push(element('div', '', `${title} ( `, ...links, ' )'));
    });
  });
  const toggle = (open) => {
    list.forEach((el) => { el.hidden = !open; });
    show.hidden = open;
    hide.hidden = !open;
  };
  show.addEventListener('click', () => toggle(true));
  hide.addEventListener('click', () => toggle(false));
  toggle(false);
  return element('div', '', show, hide, ...list);
}

function downloadsTable(d) {
  const rows = [];
  const add = (label, value) => { if (value) rows.push([label, value]); };
  const addLink = (label, url, text) => { if (url) rows.push([label, link(url, text)]); };
  add('Description', d.description);
  add('Name', d.name);
  add('Version', d.version);
  add('ECCN', d.eccn);
  addLink('STARs', d.stars, 'Open and/or Closed STARs');
  addLink('myDesignWare', d.myDesignWare, 'Subscribe for Notifications');
  add('Product Type', d.product_type);
  if (d.documentation?.length) rows.push(['Documentation', documentation(d.documentation)]);
  addLink('Toolsets', d.toolsets, 'Qualified Toolsets');
  addLink('Download', d.download, d.name);
  add('Product Code', (d.product_code ?? []).join(', '));
  return table(rows);
}

/** Tabs from 730 px, an accordion below; one panel open at a time, as the source. */
function tabs(panels) {
  const nav = element('div', 'dw-tabs-nav');
  const content = element('div', 'dw-tabs-content');
  const views = TABS.map(([id, label], i) => {
    const tab = element('button', 'dw-tab', label);
    tab.type = 'button';
    nav.append(element('div', 'dw-tab-item', tab));
    const head = element('button', 'dw-panel-header', element('span', 'dw-panel-title', label));
    head.type = 'button';
    const body = element('div', 'dw-panel-body', ...panels[i]);
    const panel = element('section', 'dw-panel', head, body);
    panel.id = id;
    content.append(panel);
    return {
      id, tab, head, panel,
    };
  });
  const select = (view, toggle) => views.forEach((v) => {
    const open = v === view && !(toggle && v.panel.classList.contains('active'));
    v.panel.classList.toggle('active', open);
    v.tab.classList.toggle('active', open);
    v.head.setAttribute('aria-expanded', open);
    v.tab.setAttribute('aria-selected', open);
  });
  // as the source's links: the URL takes the panel's hash, without a jump to the panel
  const mark = (v) => {
    if (window.location.hash !== `#${v.id}`) window.history.pushState(null, '', `#${v.id}`);
  };
  views.forEach((v) => {
    v.tab.addEventListener('click', () => { select(v); mark(v); });
    v.head.addEventListener('click', (e) => {
      select(v, true);
      if (e.target.closest('.dw-panel-title')) mark(v);
    });
  });
  select(views.find((v) => `#${v.id}` === window.location.hash) ?? views[0]);
  return element('div', 'dw-tabs', nav, content);
}

/**
 * Rows: an optional heading, then name | id per product. The tables come from the source's
 * API; without data the block renders nothing, as the source.
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const items = rows.filter((row) => !row.contains(heading)).map((row) => {
    const [name, id] = [...row.children].map((cell) => cell.textContent.trim());
    return { name: name ?? '', id: id ?? '' };
  }).filter((i) => i.name || i.id);
  block.replaceChildren();
  block.hidden = true;
  if (!items.length) return;
  let data = [];
  try {
    data = await load(items);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e.message);
  }
  if (!data.length) return;
  const products = [element('div', 'dw-products-section', productsTable(data)),
    document.createElement('br'), document.createElement('br')];
  const downloads = [element('div', 'dw-downloads-section', ...data.map(downloadsTable))];
  if (heading) block.append(element('div', 'dw-title', heading));
  block.append(tabs([products, downloads]));
  block.hidden = false;
}
