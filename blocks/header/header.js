import { getMetadata } from '../../scripts/aem.js';
import { getLocaleRoot } from '../../scripts/locale.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 1025px)');

function icon(name, alt = '') {
  const img = document.createElement('img');
  img.src = `${window.hlx.codeBasePath}/icons/${name}.svg`;
  img.alt = alt;
  img.loading = 'lazy';
  return img;
}

/** Marks the link of the current page, and of the section the page is in. */
function markCurrent(links, root) {
  const here = window.location.pathname.replace(/\/$/, '');
  links.forEach((a) => {
    const path = new URL(a.href).pathname;
    if (path === root) a.closest('li')?.classList.add('nav-home');
    if (path === here) a.setAttribute('aria-current', 'page');
    else if (path !== root && here.startsWith(`${path}/`)) a.classList.add('active');
  });
}

function setExpanded(button, expanded) {
  button.setAttribute('aria-expanded', expanded);
}

function buildLanguage(list, root) {
  const [country, language] = root.split('/').slice(-2);
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-language';
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-controls', 'nav-language-menu');
  button.setAttribute('aria-label', `Change language, current ${language}-${country}`);
  const label = document.createElement('span');
  label.textContent = `${language}-${country}`;
  button.append(icon(`flag-${country}`), label);
  setExpanded(button, false);
  list.id = 'nav-language-menu';
  list.querySelectorAll(':scope > li').forEach((item) => {
    const first = item.querySelector('a');
    const code = first && new URL(first.href).pathname.split('/').slice(-2)[0];
    if (code) item.prepend(icon(`flag-${code}`));
    item.querySelector(`a[href$="/${country}/${language}"]`)?.setAttribute('aria-current', 'true');
  });
  button.addEventListener('click', () => setExpanded(button, button.getAttribute('aria-expanded') !== 'true'));
  wrapper.addEventListener('focusout', (e) => {
    if (!wrapper.contains(e.relatedTarget)) setExpanded(button, false);
  });
  wrapper.append(button, list);
  return wrapper;
}

function buildHamburger(nav) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-hamburger';
  button.setAttribute('aria-controls', 'nav-sections');
  button.append(icon('menu'));
  const toggle = (open) => {
    setExpanded(button, open);
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.querySelector('.nav-sections').inert = !open && !isDesktop.matches;
    document.body.classList.toggle('nav-open', open);
  };
  button.addEventListener('click', () => toggle(button.getAttribute('aria-expanded') !== 'true'));
  isDesktop.addEventListener('change', () => toggle(false));
  toggle(false);
  return button;
}

function closeOnEscape(nav) {
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    const open = nav.querySelector('button[aria-expanded="true"]');
    if (!open) return;
    open.click();
    open.focus();
  });
}

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  node.className = className;
  node.append(...children.filter(Boolean));
  return node;
}

function buildUtility(tools, root) {
  const signIn = tools?.querySelector('p > a:not(:has(.icon))');
  const languages = tools?.querySelector('ul');
  return el('div', 'nav-utility', el('div', '', signIn, languages && root && buildLanguage(languages, root)));
}

function buildMain(brand, sections, tools, root) {
  const brandLink = brand?.querySelector('a');
  if (brandLink) {
    brandLink.className = 'nav-brand';
    brandLink.setAttribute('aria-label', 'WKND home');
  }
  const list = sections?.querySelector('ul');
  if (list) markCurrent(list.querySelectorAll('a'), root);
  const links = el('div', 'nav-sections', list);
  links.id = 'nav-sections';
  const search = tools?.querySelector('a:has(.icon-search)');
  if (search) {
    search.className = 'nav-search';
    search.setAttribute('aria-label', 'Search');
  }
  const main = el('div', 'nav-main', brandLink, links, search);
  main.prepend(buildHamburger(main));
  return main;
}

/**
 * Loads the nav page of the current locale and builds the header.
 * The nav page has three sections: brand, links, tools (sign in, languages, search).
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const root = getLocaleRoot(window.location.pathname);
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : root && `${root}/nav`;
  const fragment = navPath && await loadFragment(navPath);
  block.textContent = '';
  if (!fragment) return;

  const [brand, sections, tools] = [...fragment.children];
  const nav = el('nav', '', buildUtility(tools, root), buildMain(brand, sections, tools, root));
  nav.id = 'nav';
  closeOnEscape(nav);
  const wrapper = el('div', 'nav-wrapper', nav);
  block.append(wrapper);

  const onScroll = () => wrapper.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
