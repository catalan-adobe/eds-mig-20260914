/**
 * Header — the WKND fixed chrome (utility bar + masthead + off-canvas mobile nav),
 * template-slotted from the locale's authored nav document (`/<country>/<lang>/nav`,
 * overridable with `nav` page metadata). The document's sections, in order:
 *   1 brand    — the logo link (`<p><a>:wknd-logo-dk:</a></p>`)
 *   2 sections — the nav tree (`<ul>`: root item + child items)
 *   3 tools    — search labels: placeholder, clear, results (three `<p>`)
 *   4 account  — greeting `<p>`, sign-in `<p><a>`, sign-out `<p><a>`
 *   5 language — the toggle `<p><a>` + the country/locale `<ul>`
 * Every authored node is MOVED into the chrome template (EW1); the off-canvas panel
 * carries a stripped clone of the nav list (EW4).
 *
 * Behaviour lifted from clientlib-site (stardust/prototypes/canon.js): body.scrolly past
 * 15px, language menu toggle + outside-click close, off-canvas panel at <= 1024px,
 * search field with clear button (results list is a presence shell until the site index
 * exists — dynamic-features-plan P4).
 *
 * @ew-exempt <p> search labels (section 3: placeholder, clear, results) — attribute text,
 *   never displayed
 */
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 1025px)');
const PANEL_CLASS = 'nav-panel-visible';
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

function stripInstrumentation(node) {
  node.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  node.removeAttribute('data-prose-index');
  return node;
}

/** The pipeline wraps a list item's leading link / text in a <p> on live (#98). */
function unwrapListParagraphs(list) {
  list.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
}

function isCurrentSection(href) {
  const path = new URL(href, window.location).pathname.replace(/\/$/, '');
  const here = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  return here === path || here.startsWith(`${path}/`);
}

function markActiveItems(list) {
  list.querySelectorAll('a[href]').forEach((a) => {
    if (isCurrentSection(a.getAttribute('href'))) a.closest('li').classList.add('nav-item-active');
  });
}

function buildNav(sectionsDiv, ariaLabel) {
  const nav = el('nav', 'nav', { role: 'navigation' });
  if (ariaLabel) nav.setAttribute('aria-label', ariaLabel);
  const list = sectionsDiv.querySelector('ul');
  if (list) {
    unwrapListParagraphs(list);
    markActiveItems(list);
    nav.append(list);
  }
  return nav;
}

function buildBrand(brandDiv) {
  const col = el('div', 'col masthead-logo');
  const logo = el('div', 'logo');
  const link = brandDiv.querySelector('a');
  const img = brandDiv.querySelector('img');
  if (img && link && !img.alt) img.alt = link.title;
  brandDiv.querySelectorAll(':scope > p').forEach((p) => logo.append(p));
  col.append(logo);
  return col;
}

function buildSearch(labels) {
  const [placeholder, clear, results] = labels;
  const col = el('div', 'col masthead-search');
  const search = el('div', 'search', { role: 'search' });
  const form = el('form', 'search-form');
  const field = el('div', 'search-field');
  const input = el('input', 'search-input', {
    type: 'text',
    name: 'fulltext',
    placeholder,
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-haspopup': 'true',
    'aria-invalid': 'false',
    'aria-expanded': 'false',
    'aria-owns': 'search-results',
  });
  const clearButton = el('button', 'search-clear', { type: 'button', 'aria-label': clear });
  clearButton.append(el('i', 'search-clear-icon'));
  field.append(el('i', 'search-icon'), el('span', 'search-loading-indicator'), input, clearButton);
  form.append(field);
  const list = el('div', 'search-results', {
    id: 'search-results',
    role: 'listbox',
    'aria-label': results,
    'aria-multiselectable': 'false',
  });
  search.append(form, list);
  col.append(search);

  form.addEventListener('submit', (e) => e.preventDefault());
  input.addEventListener('input', () => {
    clearButton.style.display = input.value ? 'block' : '';
  });
  clearButton.addEventListener('click', () => {
    input.value = '';
    clearButton.style.display = '';
    input.focus();
  });
  return col;
}

function buildAccount(accountDiv) {
  const col = el('div', 'col utility-bar-account');
  const buttons = el('div', 'account-buttons');
  const roles = ['account-sign-in', 'account-sign-out'];
  accountDiv.querySelectorAll(':scope > p').forEach((p) => {
    const role = p.querySelector('a') ? roles.shift() : 'account-greeting';
    const wrap = el('div', `account-button ${role || 'account-button-extra'}`);
    wrap.append(p);
    buttons.append(wrap);
  });
  col.append(buttons);
  return col;
}

function decorateLanguageList(list) {
  unwrapListParagraphs(list);
  const root = localeRoot();
  list.querySelectorAll(':scope > li').forEach((country) => {
    const title = el('span', 'language-nav-title');
    while (country.firstChild && country.firstChild.nodeName !== 'UL') {
      title.append(country.firstChild);
    }
    country.prepend(title);
    country.classList.add('language-nav-country');
    const first = country.querySelector('a[href]');
    const code = first && first.getAttribute('href').match(/^\/([a-z]{2})\//);
    if (code) country.classList.add(`country-${code[1]}`);
    country.querySelectorAll('ul > li').forEach((locale) => {
      locale.classList.add('language-nav-locale');
      const a = locale.querySelector('a[href]');
      const path = a && new URL(a.href).pathname.replace(/\/$/, '');
      if (path === root) locale.classList.add('is-active');
    });
  });
}

function wireLanguageMenu(toggle, menu) {
  const link = toggle.querySelector('a');
  if (!link) return;
  link.setAttribute('aria-expanded', 'false');
  const close = () => {
    menu.classList.remove('show-menu');
    link.classList.remove('open');
    link.setAttribute('aria-expanded', 'false');
  };
  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const opening = !link.classList.contains('open');
    menu.style.left = `${link.getBoundingClientRect().left + window.scrollX - 240}px`;
    menu.classList.toggle('show-menu', opening);
    link.classList.toggle('open', opening);
    link.setAttribute('aria-expanded', String(opening));
  });
  window.addEventListener('click', (e) => {
    if (!link.contains(e.target) && link.classList.contains('open')) close();
  });
}

function buildLanguage(languageDiv) {
  const col = el('div', 'col utility-bar-language');
  const toggle = el('div', 'language-nav-toggle');
  const menu = el('nav', 'language-nav-menu', { role: 'navigation' });
  languageDiv.querySelectorAll(':scope > p').forEach((p) => toggle.append(p));
  const link = toggle.querySelector('a');
  if (link) {
    link.id = 'lang-nav-toggle-header';
    link.setAttribute('aria-label', `Toggle Language ${link.textContent}`);
  }
  const list = languageDiv.querySelector('ul');
  if (list) {
    decorateLanguageList(list);
    menu.append(list);
  }
  col.append(toggle, menu);
  wireLanguageMenu(toggle, menu);
  return col;
}

function buildUtilityBar(accountDiv, languageDiv) {
  const bar = el('div', 'utility-bar');
  const inner = el('div', 'utility-bar-inner');
  inner.append(buildAccount(accountDiv), buildLanguage(languageDiv));
  bar.append(inner);
  return bar;
}

function buildMasthead(brandDiv, sectionsDiv, labels) {
  const masthead = el('div', 'masthead');
  const inner = el('div', 'grid-inner masthead-inner');
  const navCol = el('div', 'col masthead-nav');
  navCol.append(buildNav(sectionsDiv));
  inner.append(buildBrand(brandDiv), navCol, buildSearch(labels));
  masthead.append(inner);
  return masthead;
}

function buildOffCanvas(nav, block) {
  const toggle = el('div', 'toggle-nav', { id: 'toggle-nav' });
  const link = el('a', 'toggle', {
    href: '#mobile-nav',
    'aria-label': 'Open hidden mobile navigation',
  });
  link.append(el('i', 'icon glyph-menu', { 'aria-hidden': 'true' }));
  toggle.append(link);

  const panel = el('nav', 'mobile-nav', { id: 'mobile-nav', role: 'navigation' });
  const list = nav.querySelector('ul');
  if (list) panel.append(stripInstrumentation(list.cloneNode(true)));

  const { body } = document;
  const hide = () => body.classList.remove(PANEL_CLASS);
  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    body.classList.toggle(PANEL_CLASS);
  });
  panel.addEventListener('click', (e) => {
    if (e.target.closest('a')) hide();
  });
  document.addEventListener('click', (e) => {
    if (body.classList.contains(PANEL_CLASS) && !panel.contains(e.target)) hide();
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') hide();
  });
  isDesktop.addEventListener('change', hide);
  block.append(toggle, panel);
}

function wireScrollState() {
  const update = () => document.body.classList.toggle('scrolly', window.scrollY > 15);
  update();
  document.addEventListener('scroll', update, { passive: true });
}

/**
 * Loads the locale's nav document and slots it into the WKND chrome.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : `${localeRoot()}/nav`;
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const [brand, sections, tools, account, language] = [...fragment.children]
    .filter((section) => !section.querySelector('.metadata'))
    .map((section) => section.querySelector(':scope > .default-content-wrapper') || section);
  const labels = tools ? [...tools.querySelectorAll('p')].map((p) => p.textContent) : [];

  block.textContent = '';
  const siteHeader = el('div', 'site-header');
  if (account && language) siteHeader.append(buildUtilityBar(account, language));
  siteHeader.append(buildMasthead(brand, sections, labels));
  block.append(siteHeader);
  buildOffCanvas(siteHeader.querySelector('.masthead-nav .nav'), block);
  wireScrollState();
}
