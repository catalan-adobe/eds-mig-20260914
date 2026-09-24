/**
 * Footer — the WKND dark footer, template-slotted from the locale's authored footer
 * document (`/<country>/<lang>/footer`, overridable with `footer` page metadata).
 * The document's sections, in order:
 *   1 brand  — the logo link (`<p><a>:wknd-logo-light:</a></p>`)
 *   2 nav    — the footer nav tree (`<ul>`: root item + child items)
 *   3 follow — the "Follow Us" heading (`<h4>`)
 *   4 social — the social links (`<ul>` of `<a>`; the glyph is keyed on each link's text)
 *   5+ text  — the legal / about paragraphs, one section per source text component
 * Every authored node is MOVED into the footer template (EW1).
 */
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const DEFAULT_LOCALE_ROOT = '/us/en';

function localeRoot() {
  const match = window.location.pathname.match(/^\/([a-z]{2})\/([a-z]{2})(?=\/|$)/);
  return match ? match[0] : DEFAULT_LOCALE_ROOT;
}

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

function unwrapListParagraphs(list) {
  list.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
}

function isCurrentSection(href) {
  const path = new URL(href, window.location).pathname.replace(/\/$/, '');
  const here = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  return here === path || here.startsWith(`${path}/`);
}

function buildLogo(brandDiv) {
  const col = el('div', 'col site-footer-logo');
  const logo = el('div', 'logo');
  const link = brandDiv.querySelector('a');
  const img = brandDiv.querySelector('img');
  if (img && link && !img.alt) img.alt = link.title;
  brandDiv.querySelectorAll(':scope > p').forEach((p) => logo.append(p));
  col.append(logo);
  return col;
}

function buildNav(navDiv) {
  const col = el('div', 'col site-footer-nav');
  const nav = el('nav', 'nav', { role: 'navigation', 'aria-label': 'Footer navigation' });
  const list = navDiv.querySelector('ul');
  if (list) {
    unwrapListParagraphs(list);
    list.querySelectorAll('a[href]').forEach((a) => {
      if (isCurrentSection(a.getAttribute('href'))) a.closest('li').classList.add('nav-item-active');
    });
    nav.append(list);
  }
  col.append(nav);
  return col;
}

function buildFollow(followDiv) {
  const col = el('div', 'col site-footer-follow');
  const title = el('div', 'title');
  followDiv.querySelectorAll(':scope > :is(h1, h2, h3, h4, h5, h6, p)').forEach((n) => title.append(n));
  col.append(title);
  return col;
}

/** Social icon-only buttons: the authored list moves whole; the glyph is keyed on the
 *  network name each link carries (li.social-<name>). */
function buildSocial(socialDiv) {
  const col = el('div', 'col site-footer-social');
  const list = el('div', 'button-list');
  const authored = socialDiv.querySelector('ul');
  if (authored) {
    unwrapListParagraphs(authored);
    authored.querySelectorAll('li').forEach((li) => {
      const a = li.querySelector('a');
      if (!a) return;
      const name = a.textContent.trim();
      li.classList.add(`social-${name.toLowerCase()}`);
      const label = a.getAttribute('title') || name;
      a.setAttribute('aria-label', label);
      a.removeAttribute('title');
      const text = el('span', 'button-text');
      text.append(...a.childNodes);
      a.append(el('span', 'button-icon', { 'aria-hidden': 'true' }), text);
    });
    list.append(authored);
  }
  col.append(list);
  return col;
}

function buildText(textDiv) {
  const col = el('div', 'col site-footer-text');
  const text = el('div', 'text');
  [...textDiv.children].forEach((n) => text.append(n));
  col.append(text);
  return col;
}

/**
 * Loads the locale's footer document and slots it into the WKND footer.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const path = footerMeta ? new URL(footerMeta, window.location).pathname : `${localeRoot()}/footer`;
  const fragment = await loadFragment(path);
  if (!fragment) return;

  const sections = [...fragment.children]
    .filter((section) => !section.querySelector('.metadata'))
    .map((section) => section.querySelector(':scope > .default-content-wrapper') || section);
  const [brand, nav, follow, social, ...texts] = sections;

  block.textContent = '';
  const footer = el('div', 'site-footer');
  const inner = el('div', 'site-footer-inner');
  const grid = el('div', 'grid-inner site-footer-grid');
  grid.append(buildLogo(brand), buildNav(nav), buildFollow(follow), buildSocial(social));
  const separator = el('div', 'col separator-col');
  separator.append(el('div', 'separator'));
  grid.append(separator);
  texts.forEach((textDiv) => grid.append(buildText(textDiv)));
  inner.append(grid);
  footer.append(inner);
  block.append(footer);
}
