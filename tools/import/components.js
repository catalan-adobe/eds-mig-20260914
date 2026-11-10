// One mapper per AEM Core Component. A mapper returns a list of items:
//   string                      default content HTML
//   { block, rows }             a block
//   { divider: true|'medium' }  ends the section with a rule, a tighter one for 'medium'
//   { style }                   adds a style to the current section
//   { group, items }            a column that becomes its own section (group is its style)
import { picture, rewriteLink } from './html.js';

const WRAPPERS = new Set([
  'root', 'container', 'cmp-container', 'aem-Grid', 'xf-content-height', 'contentfragment',
]);
const RAW_TAGS = new Set([
  'P', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'TABLE',
]);
const CONTAINER_TAGS = new Set(['DIV', 'MAIN', 'ASIDE', 'ARTICLE', 'SECTION']);
const KEEP_ATTRS = new Set(['href', 'src', 'alt', 'colspan', 'rowspan']);
const RENAME = { B: 'strong', I: 'em' };
const NBSP_MARK = '\uE000';

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
    const href = node.getAttribute('href');
    if (href !== null) node.setAttribute('href', rewriteLink(href, ctx.prefix));
  });
  copy.querySelectorAll('img').forEach((img) => { img.outerHTML = picture(img); });
  let html = copy.innerHTML;
  Object.entries(RENAME).forEach(([from, to]) => {
    html = html.replace(new RegExp(`<(/?)${from}>`, 'gi'), `<$1${to}>`);
  });
  const marked = html.replace(/&nbsp;|&#160;|\u00a0/g, NBSP_MARK).replace(/\s+/g, ' ').trim();
  // a non-breaking space beside a space keeps its gap two spaces wide.
  // A single one between words stays, so the words wrap together; a run of them is one space.
  return marked
    .replace(/ \uE000/g, ' &nbsp;')
    .replace(/\uE000 /g, '&nbsp; ')
    .replace(/(?<!\uE000)\uE000(?!\uE000)/g, '&nbsp;')
    .replaceAll(NBSP_MARK, ' ')
    .replace(/ {2,}/g, ' ');
}

function cleanEl(el, ctx) {
  const inner = cleanInner(el, ctx);
  const tag = el.tagName.toLowerCase();
  return inner ? `<${tag}>${inner}</${tag}>` : '';
}

function link(a, ctx, label = text(a)) {
  return `<a href="${rewriteLink(a.getAttribute('href'), ctx.prefix)}">${label}</a>`;
}

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
  const underlined = el.classList.contains('cmp-title--underline');
  if (heading.tagName === 'H1' && underlined) items.push({ style: 'underline' });
  return items;
}

function textComponent(el, ctx) {
  const content = el.querySelector('.cmp-text');
  if (!el.classList.contains('cmp-text--quote')) {
    const small = el.classList.contains('cmp-text--font-small') && { style: 'small-text' };
    return [[...content.children].map((child) => cleanEl(child, ctx)).join(''), small];
  }
  const quotation = content.querySelector('blockquote');
  const others = [...content.children].filter((child) => child !== quotation);
  const rows = [[esc(text(quotation || content))], [esc(others.map(text).join(' '))]];
  return [{ block: 'quote', rows: rows.filter(([cell]) => cell) }];
}

function image(el) {
  const img = el.querySelector('img');
  if (!img) return [];
  const caption = text(el.querySelector('.cmp-image__title'));
  const inset = el.classList.contains('aem-GridColumn--phone--8') && { style: 'inset-image' };
  return [`<p>${picture(img)}${caption ? `<em>${esc(caption)}</em>` : ''}</p>`, inset];
}

function buttonComponent(el, ctx) {
  if (el.classList.contains('cmp-button--icononly')) return [iconLinks(el, ctx)];
  return [button(el.querySelector('a.cmp-button'), ctx)];
}

function separator(el) {
  if (el.classList.contains('cmp-separator--hidden')) return [{ style: 'spaced' }];
  return [{ divider: el.classList.contains('cmp-separator--space-medium') ? 'medium' : true }];
}

/**
 * A list teaser description without a paragraph has no paragraph margin below it.
 * The content pipeline wraps bare text in a paragraph, so italics mark that case.
 */
function teaserDescription(el, description, ctx) {
  if (description?.querySelector('p')) return cleanInner(description, ctx);
  const plain = el.classList.contains('cmp-teaser--list');
  return plain ? `<p><em>${esc(text(description))}</em></p>` : para(text(description));
}

function teaserContent(el, ctx) {
  const heading = el.querySelector('.cmp-teaser__title');
  const description = el.querySelector('.cmp-teaser__description');
  const actions = el.querySelector('.cmp-teaser__action-container');
  const links = actions ? [...actions.querySelectorAll('a')] : [];
  return [
    para(text(el.querySelector('.cmp-teaser__pretitle'))),
    heading ? cleanEl(heading, ctx) : '',
    teaserDescription(el, description, ctx),
    links.map((a) => button(a, ctx)).join('') || para(text(actions)),
  ].filter(Boolean).join('');
}

function teaserRow(el, ctx) {
  const teaserImage = picture(el.querySelector('.cmp-teaser__image img'));
  return [teaserImage, teaserContent(el, ctx)].filter(Boolean);
}

function teaser(el, ctx) {
  const has = (variant) => el.classList.contains(`cmp-teaser--${variant}`);
  let name = 'carousel static';
  if (has('featured')) name = 'columns featured';
  else if (has('list')) name = 'cards locked';
  else if (has('imagebottom')) name = 'carousel image-bottom static';
  return [{ block: name, rows: [teaserRow(el, ctx)] }];
}

function carousel(el, ctx) {
  const rows = [...el.querySelectorAll('.cmp-carousel__item')].map((item) => {
    const slide = item.querySelector('.cmp-teaser');
    if (slide) return teaserRow(item.querySelector('.teaser'), ctx);
    return [picture(item.querySelector('img'))];
  });
  return [{ block: 'carousel', rows }];
}

function cardRow(item, ctx) {
  const a = item.querySelector('.cmp-image-list__item-title-link');
  return [
    picture(item.querySelector('img')),
    // a plain link: bold links are buttons
    `<p>${link(a, ctx)}</p>${para(text(item.querySelector('.cmp-image-list__item-description')))}`,
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
  const isList = (p) => p.children.length === 1 && p.querySelector(':scope > .image-list');
  const onlyLists = panels.every(isList);
  if (onlyLists) return filterCards(labels, panels, ctx);
  const content = (panel) => inline(walkChildren(panel, ctx), ctx, 'tabs');
  const rows = panels.map((panel, i) => [esc(labels[i]), content(panel)]);
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
  const itemTitle = (item) => esc(text(item.querySelector('.cmp-list__item-title')));
  const rows = [...el.querySelectorAll('.cmp-list__item')].map((item) => [
    [
      `<p>${link(item.querySelector('a'), ctx, itemTitle(item))}</p>`,
      para(text(item.querySelector('.cmp-list__item-date'))),
    ].join(''),
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
  const block = byline ? 'cards byline' : 'cards people';
  return [{ block, rows: [[picture(el.querySelector('img')), body]] }];
}

function download(el, ctx) {
  const action = el.querySelector('.cmp-download__action');
  if (!action) return [];
  const description = text(el.querySelector('.cmp-download__description'));
  const values = [...el.querySelectorAll('.cmp-download__property-content')];
  const properties = values.map((value) => `<li>${esc(text(value))}</li>`).join('');
  return [
    `<h5>${esc(text(el.querySelector('.cmp-download__title')))}</h5>`,
    description && `<p><strong>${esc(description)}</strong></p>`,
    properties && `<ul>${properties}</ul>`,
    `<p><em>${link(action, ctx, `:download: ${esc(text(action))}`)}</em></p>`,
  ];
}

function search(el) {
  const placeholder = el.querySelector('input[type="text"]').getAttribute('placeholder');
  const toggle = text(el.querySelector('.cmp-contentaisearch__ai-toggle'));
  return [{ block: 'search', rows: [[esc(placeholder)], [esc(toggle)]].filter(([cell]) => cell) }];
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

/** A container with a title and no grid has no side gutter. */
const onlyTitle = (items) => items.length > 0
  && items.every((item) => item.style || (typeof item === 'string' && /^<h[1-6][\s>]/.test(item)));

/**
 * A 3-wide grid column is an aside. The 8- or 9-wide column beside it is its partner.
 * Without a grid inside, an aside of a page with an outer grid has no side gutter.
 */
function column(el, items, ctx) {
  const gridless = !el.querySelector('[class*="aem-Grid--"]');
  if (gridless && onlyTitle(items)) return [{ group: 'no-gutter', items }];
  const span = [...el.classList].find((c) => /^aem-GridColumn--default--\d+$/.test(c));
  const width = span?.split('--')[2];
  if (width === '3') {
    const left = el.classList.contains('aem-GridColumn--offset--default--0');
    const aside = left ? 'aside-left' : 'aside';
    return [{ group: gridless && !ctx.flat ? [aside, 'no-gutter'] : aside, items }];
  }
  return width === '8' || width === '9' ? [{ group: '', items }] : items;
}

export function walk(el, ctx) {
  const [name] = [...el.classList]; // linkedom has no indexed access on classList
  if (MAPPERS[name]) return MAPPERS[name](el, ctx).filter(Boolean);
  if (!name || WRAPPERS.has(name) || name.startsWith('cmp-experiencefragment')) {
    if (!name && RAW_TAGS.has(el.tagName)) {
      const plain = el.tagName === 'H2' && { style: 'plain-headings' };
      return [cleanEl(el, ctx), plain].filter(Boolean);
    }
    if (!name && !CONTAINER_TAGS.has(el.tagName)) {
      if (!text(el)) return [];
      const tag = el.tagName.toLowerCase();
      throw new Error(`Unmapped <${tag}> "${text(el).slice(0, 40)}" on ${ctx.path}`);
    }
    return name === 'container' ? column(el, walkChildren(el, ctx), ctx) : walkChildren(el, ctx);
  }
  throw new Error(`Unknown component "${name}" on ${ctx.path}`);
}

export function walkChildren(el, ctx) {
  return [...el.children].flatMap((child) => walk(child, ctx));
}

export {
  cleanEl, iconLinks, link, text,
};
