import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — the source navbar, template-slotted from the /nav document's three sections:
 *   1. brand: <p><a href="/">WKND<br>Adventures</a></p> — the brand mark is a fixed inline SVG
 *   2. sections: <ul> of triggers, each with a nested <ul> of megamenu links
 *      (<a><strong>title</strong> description</a>); a nested <li> holding text + <ul> is a
 *      sub-column with a label (the "Recent from the Field" article list).
 *   3. tools: the Subscribe CTA paragraph.
 * Same state machine as the source js/site.js: megamenu opens on hover above 1024px with a
 * 200ms leave delay (.mega-open), toggles on click at or below 1024px (.is-open); the mobile
 * menu toggles .is-open on #nav-menu.
 */
const MOBILE_MAX = 1024;
const isDesktop = () => window.innerWidth > MOBILE_MAX;

const LOGO_SVG = '<svg width="100%" height="100%" viewBox="0 0 33 33"'
  + ' preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M28,0H5C2.24,0,0,2.24,0,5v23'
  + 'c0,2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1'
  + 'c0-6.63-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z" fill="currentColor"/>'
  + '</svg>';
const ICON_HAMBURGER = '<svg class="nav-icon-hamburger" width="24" height="24" viewBox="0 0 24 24"'
  + ' fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="2" fill="currentColor"/>'
  + '<rect x="3" y="11" width="18" height="2" fill="currentColor"/>'
  + '<rect x="3" y="16" width="18" height="2" fill="currentColor"/></svg>';
const ICON_CLOSE = '<svg class="nav-icon-close" width="24" height="24" viewBox="0 0 24 24"'
  + ' fill="none" aria-hidden="true"><path d="M5 5L19 19M19 5L5 19" stroke="currentColor"'
  + ' stroke-width="2" stroke-linecap="round"/></svg>';

function unwrapParagraph(li) {
  const p = li.querySelector(':scope > p');
  if (p) p.replaceWith(...p.childNodes);
}

function buildLink(li, className) {
  unwrapParagraph(li);
  const a = li.querySelector(':scope > a');
  if (!a) return li;
  a.className = className;
  const strong = a.querySelector('strong');
  if (strong) {
    const title = document.createElement('span');
    title.className = `${className}-title`;
    title.append(...strong.childNodes);
    strong.replaceWith(title);
    const desc = document.createElement('span');
    desc.className = `${className}-desc`;
    const rest = [...a.childNodes].filter((n) => n !== title);
    desc.append(...rest);
    if (desc.textContent.trim()) a.append(desc);
    else desc.remove();
  }
  return a;
}

function buildMegamenu(item, trigger, list) {
  const mega = document.createElement('div');
  mega.className = 'nav-megamenu';
  const container = document.createElement('div');
  container.className = 'nav-megamenu-inner';
  const links = [...list.children].filter((li) => !li.querySelector(':scope > ul'));
  const subs = [...list.children].filter((li) => li.querySelector(':scope > ul'));
  if (subs.length) {
    container.className += ' nav-megamenu-stories';
    const pages = document.createElement('div');
    pages.className = 'nav-megamenu-stories-pages';
    links.forEach((li) => pages.append(buildLink(li, 'nav-megamenu-link')));
    container.append(pages);
    subs.forEach((sub) => {
      const col = document.createElement('div');
      col.className = 'nav-megamenu-stories-articles';
      const subList = sub.querySelector(':scope > ul');
      const label = document.createElement('p');
      label.className = 'nav-megamenu-section-label';
      label.append(...[...sub.childNodes].filter((n) => n !== subList));
      const grid = document.createElement('div');
      grid.className = 'nav-megamenu-articles-grid';
      [...subList.children].forEach((li) => grid.append(buildLink(li, 'nav-megamenu-article')));
      col.append(label, grid);
      container.append(col);
    });
  } else {
    const grid = document.createElement('div');
    grid.className = 'nav-megamenu-grid';
    links.forEach((li) => grid.append(buildLink(li, 'nav-megamenu-link')));
    container.append(grid);
  }
  mega.append(container);
  list.remove();
  item.append(mega);

  let timer;
  const open = () => { clearTimeout(timer); item.classList.add('mega-open'); };
  const close = () => { timer = setTimeout(() => item.classList.remove('mega-open'), 200); };
  item.addEventListener('mouseenter', () => { if (isDesktop()) open(); });
  item.addEventListener('mouseleave', () => { if (isDesktop()) close(); });
  trigger.addEventListener('click', () => {
    if (isDesktop()) return;
    const expanded = item.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(expanded));
  });
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.setAttribute('aria-label', 'Main navigation');
  const inner = document.createElement('div');
  inner.className = 'nav-inner';
  const [brandSection, linksSection, toolsSection] = [...fragment.children];

  if (brandSection) {
    const link = brandSection.querySelector('a');
    if (link) {
      link.className = 'logo';
      const text = document.createElement('span');
      text.className = 'logo-text';
      text.append(...link.childNodes);
      const icon = document.createElement('span');
      icon.className = 'nav-logo-icon';
      icon.innerHTML = LOGO_SVG;
      link.append(icon, text);
      inner.append(link);
    }
  }

  const menu = document.createElement('div');
  menu.className = 'nav-menu';
  menu.id = 'nav-menu';
  if (linksSection) {
    const list = linksSection.querySelector('ul');
    if (list) {
      list.className = 'nav-menu-list';
      [...list.children].forEach((item) => {
        item.className = 'nav-menu-list-item';
        const sub = item.querySelector(':scope > ul');
        unwrapParagraph(item);
        const trigger = document.createElement(sub ? 'button' : 'a');
        trigger.className = 'nav-link';
        const label = document.createElement('span');
        label.append(...[...item.childNodes].filter((n) => n !== sub));
        trigger.append(label);
        if (sub) {
          item.classList.add('nav-megamenu-item');
          trigger.type = 'button';
          trigger.classList.add('nav-megamenu-trigger');
          trigger.setAttribute('aria-expanded', 'false');
          const caret = document.createElement('span');
          caret.className = 'nav-caret';
          trigger.append(caret);
        }
        item.prepend(trigger);
        if (sub) buildMegamenu(item, trigger, sub);
      });
      menu.append(list);
    }
  }
  inner.append(menu);

  const right = document.createElement('div');
  right.className = 'nav-right';
  if (toolsSection) right.append(...toolsSection.querySelectorAll('p'));
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-mobile-menu-button';
  toggle.id = 'nav-toggle';
  toggle.setAttribute('aria-label', 'Toggle navigation');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'nav-menu');
  toggle.innerHTML = ICON_HAMBURGER + ICON_CLOSE;
  toggle.addEventListener('click', () => {
    const expanded = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(expanded));
  });
  right.append(toggle);
  inner.append(right);

  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    nav.querySelectorAll('.mega-open, .is-open').forEach((el) => el.classList.remove('mega-open', 'is-open'));
  });

  nav.append(inner);
  block.append(nav);
}
