// Turns one source page into the HTML document DA stores.
import { parseHTML } from 'linkedom';
import {
  block, pageHtml, rewriteLink, section,
} from './html.js';
import {
  cleanEl, iconLinks, link, text, walk,
} from './components.js';

const TEMPLATES = { 'adventure-page-template': 'adventure', 'article-page-template': 'article' };
const MERGE = new Set(['cards people', 'cards locked']);
const FRAGMENTS = 'header.experiencefragment, footer.experiencefragment';

const render = (part) => (typeof part === 'string' ? part : block(part.block, part.rows));

/** Adjacent blocks of the same mergeable kind are one block with more rows. */
function add(parts, item) {
  const last = parts[parts.length - 1];
  const merge = item.block && MERGE.has(item.block) && last?.block === item.block;
  if (merge) last.rows.push(...item.rows);
  else parts.push(item.block ? { ...item, rows: [...item.rows] } : item);
}

function assemble(items, path) {
  const sections = [];
  let current = { parts: [], styles: [] };
  const flush = () => {
    if (current.parts.length) sections.push(current);
    current = { parts: [], styles: [] };
  };
  items.forEach((item) => {
    if (item.divider) {
      current.styles.push(item.divider === 'medium' ? 'divider-medium' : 'divider');
      flush();
    } else if (item.style) {
      current.styles.push(item.style);
    } else if (item.items) {
      flush();
      const inner = assemble(item.items, path);
      if (inner.length > 1) throw new Error(`Divider inside a column on ${path}`);
      const [only] = inner;
      if (only) sections.push({ ...only, styles: [...only.styles, item.group].filter(Boolean) });
    } else {
      add(current.parts, item);
    }
  });
  flush();
  return sections;
}

function metadata(document) {
  const content = (selector) => document.querySelector(selector)?.getAttribute('content');
  const image = content('meta[property="og:image"]');
  return block('metadata', [
    ['Title', text(document.querySelector('title'))],
    ['Description', content('meta[name="description"]')],
    ['Image', image && `<img src="${image}">`],
    ['Template', TEMPLATES[content('meta[name="template"]')]],
  ].filter(([, value]) => value));
}

export function convertPage(html, path, prefix) {
  const { document } = parseHTML(html);
  document.querySelectorAll(FRAGMENTS).forEach((el) => el.remove());
  const noGrid = !document.querySelector('main [class*="aem-Grid--"]');
  const sections = assemble(walk(document.querySelector('body > .root'), { path, prefix }), path)
    .map(({ parts, styles }) => {
      const all = noGrid ? [...styles, 'no-gutter'] : styles;
      return section(parts.map(render), [...new Set(all)].join(', '));
    });
  return pageHtml([...sections, section([metadata(document)])]);
}

/** The header lists the home page first: only the mobile menu shows it. The footer never does. */
function navLinks(fragment, prefix, withHome) {
  const levels = withHome ? '--level-0, --level-1' : '--level-1';
  const item = (level) => `.cmp-navigation__item${level} > a`;
  const selector = levels.split(', ').map(item).join(', ');
  const items = [...fragment.querySelectorAll(selector)];
  if (!items.length) return '';
  return `<ul>${items.map((a) => `<li>${link(a, { prefix })}</li>`).join('')}</ul>`;
}

function brand(fragment, prefix, icon) {
  const home = fragment.querySelector('.cmp-navigation__item--level-0 > a').getAttribute('href');
  return `<p><a href="${rewriteLink(home, prefix)}">:${icon}:</a></p>`;
}

function languages(fragment, prefix) {
  const groups = [...fragment.querySelectorAll('.cmp-languagenavigation__item--level-0')];
  const countries = groups.map((country) => {
    const name = text(country.querySelector('.cmp-languagenavigation__item-title'));
    const links = [...country.querySelectorAll('a')].map((a) => `<li>${link(a, { prefix })}</li>`);
    return `<li>${name}<ul>${links.join('')}</ul></li>`;
  });
  return `<ul>${countries.join('')}</ul>`;
}

export function convertNav(html, prefix) {
  const fragment = parseHTML(html).document.querySelector('header.experiencefragment');
  const signIn = fragment.querySelector('.wknd-sign-in-buttons__button--sign-in');
  const search = fragment.querySelector('.cmp-button--header-search a');
  const tools = [
    signIn && `<p>${link(signIn, { prefix })}</p>`,
    languages(fragment, prefix),
    search && `<p>${link(search, { prefix }, ':search:')}</p>`,
  ].filter(Boolean);
  return pageHtml([
    section([brand(fragment, prefix, 'wknd-logo-dk')]),
    section([navLinks(fragment, prefix, true)]),
    section(tools),
  ]);
}

export function convertFooter(html, prefix) {
  const fragment = parseHTML(html).document.querySelector('footer.experiencefragment');
  const texts = [...fragment.querySelectorAll('.cmp-text')];
  const legal = texts.flatMap((el) => [...el.children]).map((el) => cleanEl(el, { prefix }));
  return pageHtml([
    section([
      brand(fragment, prefix, 'wknd-logo-light'),
      navLinks(fragment, prefix),
      `<p>${text(fragment.querySelector('.cmp-title__text'))}</p>`,
      iconLinks(fragment, { prefix }),
    ]),
    section(legal),
  ]);
}
