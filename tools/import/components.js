// One mapper per AEM Core Component. A mapper returns a list of items:
//   string                      default content HTML
//   { block, rows }             a block
//   { divider: true }           ends the section with a rule
//   { style }                   adds a style to the current section
//   { group, items }            a column that becomes its own section (group is its style)
import { picture, rewriteLink } from './html.js';

const WRAPPERS = new Set([
  'root', 'container', 'cmp-container', 'aem-Grid', 'xf-content-height', 'contentfragment',
]);
const RAW_TAGS = new Set(['P', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'TABLE']);
const CONTAINER_TAGS = new Set(['DIV', 'MAIN', 'ASIDE', 'ARTICLE', 'SECTION']);
const KEEP_ATTRS = new Set(['href', 'src', 'alt', 'colspan', 'rowspan']);
const RENAME = { B: 'strong', I: 'em' };

const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const para = (s) => (s ? `<p>${esc(s)}</p>` : '');

/** Inner HTML with links rewritten, presentational attributes dropped and b/i normalised. */
function cleanInner(el, ctx) {
  const copy = el.cloneNode(true);
  copy.querySelectorAll('*').forEach((node) => {
    [...node.attributes].forEach((attr) => {
      if (!KEEP_ATTRS.has(attr.name)) node.removeAttribute(attr.name);
    });
    if (node.hasAttribute('href')) node.setAttribute('href', rewriteLink(node.getAttribute('href'), ctx.prefix));
  });
  copy.querySelectorAll('img').forEach((img) => { img.outerHTML = picture(img); });
  let html = copy.innerHTML;
  Object.entries(RENAME).forEach(([from, to]) => {
    html = html.replace(new RegExp(`<(/?)${from}>`, 'gi'), `<$1${to}>`);
  });
  return html.replace(/&nbsp;|&#160;|\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanEl(el, ctx) {
  const inner = cleanInner(el, ctx);
  const tag = el.tagName.toLowerCase();
  return inner ? `<${tag}>${inner}</${tag}>` : '';
}

const link = (a, ctx, label = text(a)) => `<a href="${rewriteLink(a.getAttribute('href'), ctx.prefix)}">${label}</a>`;
const button = (a, ctx) => `<p><strong>${link(a, ctx)}</strong></p>`;

function iconLinks(el, ctx) {
  const links = [...el.querySelectorAll('a.cmp-button')].map((a) => {
    const icon = [...a.querySelector('.cmp-button__icon').classList]
      .find((c) => c.startsWith('cmp-button__icon--')).split('--')[1];
    return link(a, ctx, `:${icon}:`);
  });
  return links.length ? `<p>${links.join(' ')}</p>` : '';
}

/** Default content only: tabs and accordion panels cannot hold blocks. */
function inline(items, ctx, where) {
  return items.map((item) => {
    if (typeof item === 'string') return item;
    if (item.style || item.divider) return '';
    throw new Error(`Block "${item.block || 'column'}" inside ${where} on ${ctx.path}`);
  }).join('');
}

function title(el, ctx) {
  const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
  const items = [cleanEl(heading, ctx)];
  if (heading.tagName === 'H1' && el.classList.contains('cmp-title--underline')) items.push({ style: 'underline' });
  return items;
}

function textComponent(el, ctx) {
  const html = [...el.querySelector('.cmp-text').children].map((child) => cleanEl(child, ctx)).join('');
  const quote = el.classList.contains('cmp-text--quote') && !html.includes('<blockquote>');
  return [quote ? `<blockquote>${html}</blockquote>` : html];
}

function image(el) {
  const caption = text(el.querySelector('.cmp-image__title'));
  if (!el.querySelector('img')) return [];
  return [`<p>${picture(el.querySelector('img'))}</p>`, caption ? `<p><em>${esc(caption)}</em></p>` : ''];
}

function buttonComponent(el, ctx) {
  if (el.classList.contains('cmp-button--icononly')) return [iconLinks(el, ctx)];
  return [button(el.querySelector('a.cmp-button'), ctx)];
}

function separator(el) {
  return el.classList.contains('cmp-separator--hidden') ? [] : [{ divider: true }];
}

function teaserContent(el, ctx) {
  const heading = el.querySelector('.cmp-teaser__title');
  const description = el.querySelector('.cmp-teaser__description');
  const actions = el.querySelector('.cmp-teaser__action-container');
  const links = actions ? [...actions.querySelectorAll('a')] : [];
  return [
    para(text(el.querySelector('.cmp-teaser__pretitle'))),
    heading ? cleanEl(heading, ctx) : '',
    description && (description.querySelector('p') ? cleanInner(description, ctx) : para(text(description))),
    links.map((a) => button(a, ctx)).join('') || para(text(actions)),
  ].filter(Boolean).join('');
}

function teaserRow(el, ctx) {
  return [picture(el.querySelector('.cmp-teaser__image img')), teaserContent(el, ctx)].filter(Boolean);
}

function teaser(el, ctx) {
  const has = (variant) => el.classList.contains(`cmp-teaser--${variant}`);
  let name = 'carousel';
  if (has('featured')) name = 'columns featured';
  else if (has('list')) name = 'cards locked';
  else if (has('imagebottom')) name = 'carousel image-bottom';
  return [{ block: name, rows: [teaserRow(el, ctx)] }];
}

function carousel(el, ctx) {
  const rows = [...el.querySelectorAll('.cmp-carousel__item')].map((item) => {
    const slide = item.querySelector('.cmp-teaser');
    return slide ? teaserRow(item.querySelector('.teaser'), ctx) : [picture(item.querySelector('img'))];
  });
  return [{ block: 'carousel', rows }];
}

function cardRow(item, ctx) {
  const a = item.querySelector('.cmp-image-list__item-title-link');
  return [
    picture(item.querySelector('img')),
    `<p><strong>${link(a, ctx)}</strong></p>${para(text(item.querySelector('.cmp-image-list__item-description')))}`,
  ];
}

function imageList(el, ctx) {
  const rows = [...el.querySelectorAll('.cmp-image-list__item')].map((item) => cardRow(item, ctx));
  return [{ block: 'cards', rows }];
}

/** Tabs that only hold image lists are one list filtered by category. */
function filterCards(labels, panels, ctx) {
  const cards = new Map();
  panels.forEach((panel, i) => {
    panel.querySelectorAll('.cmp-image-list__item').forEach((item) => {
      const key = item.querySelector('a').getAttribute('href');
      if (!cards.has(key)) cards.set(key, { row: cardRow(item, ctx), categories: [] });
      if (i > 0) cards.get(key).categories.push(labels[i]);
    });
  });
  const rows = [...cards.values()].map(({ row, categories }) => [...row, categories.join(', ')]);
  return [{ block: 'cards filter', rows }];
}

function tabs(el, ctx) {
  const labels = [...el.querySelectorAll('.cmp-tabs__tab')].map(text);
  const panels = [...el.querySelectorAll('.cmp-tabs__tabpanel')];
  const onlyLists = panels.every((p) => p.children.length === 1 && p.querySelector(':scope > .image-list'));
  if (onlyLists) return filterCards(labels, panels, ctx);
  const rows = panels.map((panel, i) => [esc(labels[i]), inline(walkChildren(panel, ctx), ctx, 'tabs')]);
  return [{ block: 'tabs', rows }];
}

function accordion(el, ctx) {
  const rows = [...el.querySelectorAll('.cmp-accordion__item')].map((item) => [
    esc(text(item.querySelector('.cmp-accordion__title'))),
    inline(walkChildren(item.querySelector('.cmp-accordion__panel'), ctx), ctx, 'accordion'),
  ]);
  return [{ block: 'accordion', rows }];
}

function list(el, ctx) {
  const rows = [...el.querySelectorAll('.cmp-list__item')].map((item) => [
    `<p>${link(item.querySelector('a'), ctx, esc(text(item.querySelector('.cmp-list__item-title'))))}</p>${
      para(text(item.querySelector('.cmp-list__item-date')))}`,
  ]);
  return [{ block: 'cards list', rows }];
}

function contentFragment(el, ctx) {
  const facts = el.querySelector('dl.cmp-contentfragment__elements');
  if (facts) {
    const rows = [...facts.querySelectorAll('.cmp-contentfragment__element')].map((row) => [
      esc(text(row.querySelector('dt'))), esc(text(row.querySelector('dd'))),
    ]);
    return [{ block: 'facts', rows }];
  }
  return walkChildren(el.querySelector('.cmp-contentfragment__elements'), ctx);
}

/** A contributor: article byline, or a card on the About page. */
function experienceFragment(el, ctx) {
  const byline = el.querySelector('.cmp-byline');
  const name = text(el.querySelector('.cmp-byline__name, h3'));
  if (!name || !el.querySelector('img')) return walkChildren(el, ctx);
  const roles = text(el.querySelector('.cmp-byline__occupations, h5'));
  const body = `<h3>${esc(name)}</h3>${para(roles)}${iconLinks(el, ctx)}`;
  return [{ block: byline ? 'cards byline' : 'cards people', rows: [[picture(el.querySelector('img')), body]] }];
}

function download(el, ctx) {
  const action = el.querySelector('.cmp-download__action');
  if (!action) return [];
  return [
    `<h3>${esc(text(el.querySelector('.cmp-download__title')))}</h3>`,
    para(text(el.querySelector('.cmp-download__description'))),
    button(action, ctx),
  ];
}

function search(el) {
  return [{ block: 'search', rows: [[esc(el.querySelector('input[type="text"]').getAttribute('placeholder'))]] }];
}

const MAPPERS = {
  title,
  text: textComponent,
  image,
  button: buttonComponent,
  separator,
  teaser,
  carousel,
  tabs,
  accordion,
  'image-list': imageList,
  list,
  'cmp-contentfragment': contentFragment,
  experiencefragment: experienceFragment,
  download,
  contentaisearch: search,
  breadcrumb: () => [],
  sharing: () => [],
};

/** A 3-wide grid column is an aside. The 8- or 9-wide column beside it is its partner. */
function column(el, items) {
  const width = [...el.classList].find((c) => /^aem-GridColumn--default--\d+$/.test(c))?.split('--')[2];
  if (width === '3') {
    const left = el.classList.contains('aem-GridColumn--offset--default--0');
    return [{ group: left ? 'aside-left' : 'aside', items }];
  }
  return width === '8' || width === '9' ? [{ group: '', items }] : items;
}

export function walk(el, ctx) {
  const [name] = [...el.classList]; // linkedom has no indexed access on classList
  if (MAPPERS[name]) return MAPPERS[name](el, ctx).filter(Boolean);
  if (!name || WRAPPERS.has(name) || name.startsWith('cmp-experiencefragment')) {
    if (!name && RAW_TAGS.has(el.tagName)) return [cleanEl(el, ctx)].filter(Boolean);
    if (!name && !CONTAINER_TAGS.has(el.tagName)) {
      if (!text(el)) return [];
      throw new Error(`Unmapped <${el.tagName.toLowerCase()}> "${text(el).slice(0, 40)}" on ${ctx.path}`);
    }
    return name === 'container' ? column(el, walkChildren(el, ctx)) : walkChildren(el, ctx);
  }
  throw new Error(`Unknown component "${name}" on ${ctx.path}`);
}

export function walkChildren(el, ctx) {
  return [...el.children].flatMap((child) => walk(child, ctx));
}

export {
  cleanEl, iconLinks, link, text,
};
