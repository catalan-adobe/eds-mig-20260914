import { getMetadata } from '../../scripts/aem.js';
import { getLanguage, languageRoot } from '../../scripts/site.js';
import { loadFragment } from '../fragment/fragment.js';

const MOBILE = window.matchMedia('(width <= 992px)');
// The source's footer has four column slots. An unused slot still takes one pixel.
const COLUMN_SLOTS = 4;

function create(tag, className, ...children) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.append(...children);
  return element;
}

const trimSlash = (path) => path.replace(/\/$/, '');

/** The logo as a link to the home page. Without a brand section the link stays empty. */
function buildLogo(brand, position) {
  const logo = create('a', `footer-logo footer-logo-${position}`);
  const picture = brand?.querySelector('picture');
  if (!picture) return logo;
  logo.href = brand.querySelector('a[href]')?.href ?? `${languageRoot()}/`;
  logo.append(picture.cloneNode(true));
  return logo;
}

function decorateColumnLink(a) {
  if (!a.title) a.title = a.textContent.trim();
  // as the source: its other sites (careers, investor, news, online) open in a new tab
  if (a.hostname.endsWith('.synopsys.com') && a.hostname !== 'www.synopsys.com') {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
}

/** One nav per h3 with the list after it. Below the desktop width a nav is an accordion item. */
function buildColumns(links) {
  const columns = [];
  links?.querySelectorAll('h3, ul').forEach((element) => {
    if (element.tagName === 'H3') {
      // the pipeline's heading id could repeat an anchor of the page
      element.removeAttribute('id');
      const toggle = create('button', '', ...element.childNodes);
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      element.append(toggle);
      const column = create('nav', 'footer-column', element);
      column.setAttribute('aria-label', toggle.textContent.trim());
      columns.push(column);
    } else if (columns.length) {
      element.querySelectorAll('a').forEach(decorateColumnLink);
      columns.at(-1).append(element);
    }
  });
  while (columns.length < COLUMN_SLOTS) columns.push(create('div', 'footer-column'));

  const toggles = columns.map((column) => column.querySelector('button'));
  const open = (index, expanded) => {
    columns[index].classList.toggle('active', expanded);
    toggles[index]?.setAttribute('aria-expanded', expanded);
  };
  toggles.forEach((toggle, index) => toggle?.addEventListener('click', () => {
    const expanded = !columns[index].classList.contains('active');
    columns.forEach((_, other) => open(other, other === index && expanded));
  }));
  // the lists are always open at the desktop width: nothing to toggle there
  const reset = () => toggles.forEach((toggle, index) => {
    open(index, false);
    if (toggle) toggle.disabled = !MOBILE.matches;
  });
  MOBILE.addEventListener('change', reset);
  reset();
  return columns;
}

/**
 * Goes to the page's twin in the chosen language when it exists, else to that language's home.
 * @param {string} home The home page of the chosen language
 */
async function changeLanguage(home) {
  const here = window.location.pathname;
  const root = languageRoot();
  if (trimSlash(home) === root) return;
  const twin = trimSlash(home) + here.slice(root.length);
  // GET, not HEAD as the source: the local development server answers HEAD with 502
  const hasTwin = trimSlash(here) !== root && (await fetch(twin).catch(() => null))?.ok;
  window.location.href = hasTwin ? twin : home;
}

/** The language select, from the list of language home pages, and the image under it. */
function buildTools(languages, footerPath) {
  const options = [...languages.querySelectorAll('li a')];
  if (!options.length) return null;
  const select = create('select', 'footer-language');
  select.setAttribute('aria-label', 'Language');
  const current = languageRoot(footerPath);
  options.forEach((a) => {
    const home = new URL(a.href).pathname;
    const option = new Option(a.textContent.trim(), home);
    option.selected = trimSlash(home) === current;
    select.append(option);
  });
  select.addEventListener('change', () => changeLanguage(select.value));
  const tools = create('div', 'footer-tools', select);
  const picture = languages.querySelector('picture');
  if (picture) {
    picture.classList.add('footer-qr');
    tools.append(picture);
  }
  return tools;
}

/** The copyright line, then the legal items (links, or text) with a bar before each. */
function buildLegal(legal) {
  const row = create('div', 'footer-legal');
  const copyright = legal?.querySelector('p');
  if (copyright) row.append(create('span', '', ...copyright.childNodes));
  legal?.querySelectorAll('li').forEach((item) => {
    row.append('|', item.querySelector('a') ?? create('span', '', ...item.childNodes));
  });
  return row;
}

/**
 * Loads the footer document of the page's language, or the one the page's `footer` metadata
 * names, and renders it.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const meta = getMetadata('footer');
  const path = meta ? new URL(meta, window.location).pathname : `${languageRoot()}/footer`;
  const fragment = await loadFragment(path);
  block.textContent = '';
  if (!fragment) return;

  const section = (role) => fragment.querySelector(`.section.${role}`);
  const brand = section('brand');
  const languages = section('languages');
  const links = create('div', 'footer-links', ...buildColumns(section('links')));
  const tools = languages && buildTools(languages, path);
  if (tools) links.append(tools);

  const social = create('div', 'footer-social');
  const icons = section('social')?.querySelector('ul');
  if (icons) {
    icons.className = 'footer-icons';
    social.append(icons);
  }
  social.append(buildLogo(brand, 'bottom'));

  // the footer document's language picks the glyphs of Chinese, Japanese and Korean text
  block.lang = getLanguage(path);
  block.append(create(
    'div',
    'footer-inner',
    buildLogo(brand, 'top'),
    links,
    social,
    buildLegal(section('legal')),
  ));
}
