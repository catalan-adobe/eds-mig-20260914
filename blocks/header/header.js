import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const DESKTOP = window.matchMedia('(min-width: 1025px)');
const CLOSE_DELAY_MS = 200;

/**
 * Turns `<li><a>Title</a> description</li>` into a megamenu link card.
 * @param {HTMLLIElement} li authored list item
 * @returns {HTMLAnchorElement} the decorated link
 */
function buildLink(li) {
  const a = li.querySelector('a');
  const host = a.parentElement;
  const title = document.createElement('strong');
  title.append(...a.childNodes);
  const desc = document.createElement('span');
  desc.append(...[...host.childNodes].filter((n) => n !== a));
  a.className = 'nav-link';
  a.append(title, desc);
  return a;
}

/**
 * Label nodes of a list item that also holds a sub-list (the pipeline may wrap them in a <p>).
 * @param {HTMLLIElement} li list item
 * @param {HTMLUListElement} sub its sub-list
 * @returns {Node[]} label nodes
 */
function labelNodes(li, sub) {
  const nodes = [...li.childNodes].filter((n) => n !== sub);
  const p = nodes.find((n) => n.nodeName === 'P');
  return p ? [...p.childNodes] : nodes;
}

/**
 * Builds the dropdown panel for one top-level menu.
 * Plain link lists render as a 4-column grid; a list that also holds a labelled
 * sub-list (Stories) renders as pages + labelled article grid.
 * @param {HTMLUListElement} list authored sub-list
 * @returns {HTMLDivElement} the panel
 */
function buildPanel(list) {
  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  const inner = document.createElement('div');
  inner.className = 'nav-panel-inner';
  const items = [...list.children];
  const group = items.find((li) => li.querySelector(':scope > ul'));
  if (!group) {
    inner.classList.add('nav-grid');
    inner.append(...items.map(buildLink));
  } else {
    inner.classList.add('nav-stories');
    const pages = document.createElement('div');
    pages.className = 'nav-stories-pages';
    pages.append(...items.filter((li) => li !== group).map(buildLink));
    const sub = group.querySelector(':scope > ul');
    const label = document.createElement('p');
    label.className = 'nav-label';
    label.append(...labelNodes(group, sub));
    const articles = document.createElement('div');
    articles.className = 'nav-articles';
    articles.append(...[...sub.children].map(buildLink));
    const aside = document.createElement('div');
    aside.append(label, articles);
    inner.append(pages, aside);
  }
  panel.append(inner);
  return panel;
}

/**
 * Wires hover (desktop, with close delay) and click (mobile accordion) on a menu item.
 * @param {HTMLLIElement} item menu item
 * @param {HTMLButtonElement} trigger its trigger button
 */
function wireItem(item, trigger) {
  let timer;
  trigger.addEventListener('click', () => {
    if (DESKTOP.matches) return;
    trigger.setAttribute('aria-expanded', String(item.classList.toggle('is-open')));
  });
  item.addEventListener('mouseenter', () => {
    if (!DESKTOP.matches) return;
    clearTimeout(timer);
    item.classList.add('is-open');
  });
  item.addEventListener('mouseleave', () => {
    if (!DESKTOP.matches) return;
    timer = setTimeout(() => item.classList.remove('is-open'), CLOSE_DELAY_MS);
  });
}

/**
 * Builds the main menu from the authored nested list.
 * @param {HTMLUListElement} list top-level list
 * @returns {HTMLElement} nav element
 */
function buildMenu(list) {
  const nav = document.createElement('nav');
  nav.className = 'nav-menu';
  nav.id = 'nav-menu';
  nav.setAttribute('aria-label', 'Main navigation');
  list.className = 'nav-list';
  [...list.children].forEach((item) => {
    const sub = item.querySelector(':scope > ul');
    const trigger = document.createElement('button');
    trigger.className = 'nav-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.append(...labelNodes(item, sub));
    [...item.childNodes].filter((n) => n !== sub).forEach((n) => n.remove());
    const caret = document.createElement('span');
    caret.className = 'nav-caret';
    trigger.append(label, caret);
    item.className = 'nav-item';
    item.prepend(trigger);
    if (sub) item.append(buildPanel(sub));
    sub?.remove();
    wireItem(item, trigger);
  });
  nav.append(list);
  return nav;
}

function buildToggle(menu) {
  const toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.setAttribute('aria-label', 'Toggle navigation');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'nav-menu');
  toggle.innerHTML = `
    <svg class="icon-open" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="2" fill="currentColor"/><rect x="3" y="11" width="18" height="2" fill="currentColor"/><rect x="3" y="16" width="18" height="2" fill="currentColor"/></svg>
    <svg class="icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5L19 19M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  toggle.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', String(menu.classList.toggle('is-open')));
  });
  return toggle;
}

/**
 * Loads the /nav document: section 1 brand, section 2 menu list, section 3 tools.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const [brandSection, menuSection, toolsSection] = fragment.querySelectorAll(':scope > .section');

  const brand = brandSection.querySelector('a');
  brand.className = 'logo';
  brand.setAttribute('aria-label', 'WKND Adventures home');
  const text = document.createElement('span');
  text.className = 'logo-text';
  text.append(...[...brand.childNodes].filter((n) => !n.classList?.contains('icon')));
  brand.append(text);

  const menu = buildMenu(menuSection.querySelector('ul'));
  const right = document.createElement('div');
  right.className = 'nav-right';
  const cta = toolsSection.querySelector('a');
  cta.className = 'button';
  right.append(cta, buildToggle(menu));

  const inner = document.createElement('div');
  inner.className = 'nav-inner';
  inner.append(brand, menu, right);
  block.textContent = '';
  block.append(inner);
}
