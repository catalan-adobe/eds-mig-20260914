import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Header: fixed promo bar, logo, mega-menu nav, search + Semrush popups, mobile drop.
 * Nav document sections (in order): promo bar · logo · nav list (+ Free Tools notice) ·
 * header tools (search placeholder, CTA, Semrush popup) · mobile call-to-action.
 * @ew-exempt form-controls: the search placeholder and the CTA / notice button labels are
 *   form-control text (input placeholder, <button> label) read from their paragraphs.
 */

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  node.append(...children);
  return node;
}

const svgCache = new Map();

/** Inline SVG glyph (the live header inlines its icons), fetched once per name. */
function icon(name) {
  const span = el('span', { class: `icon icon-${name}` });
  if (!svgCache.has(name)) {
    svgCache.set(name, fetch(`${window.hlx?.codeBasePath || ''}/icons/${name}.svg`)
      .then((resp) => (resp.ok ? resp.text() : ''))
      .then((text) => new DOMParser().parseFromString(text, 'image/svg+xml').documentElement));
  }
  svgCache.get(name).then((svg) => {
    if (svg && svg.tagName === 'svg') span.append(document.importNode(svg, true));
  });
  return span;
}

/** Inline-SVG version of an authored :icon: span (decorateIcons renders an <img>). */
function inlineIcon(span) {
  const name = [...span.classList].find((c) => c.startsWith('icon-')).slice(5);
  const glyph = icon(name);
  span.replaceWith(glyph);
  return glyph;
}

/** Moves a lone paragraph's children up into its list item (the delivered lists are loose). */
function unwrapParagraphs(list) {
  list.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
}

function stripInstrumentation(root) {
  if (root.nodeType !== Node.ELEMENT_NODE) return root;
  [root, ...root.querySelectorAll('*')].forEach((node) => {
    [...node.attributes].forEach(({ name }) => {
      if (name.startsWith('data-aue-') || name.startsWith('data-richtext-')) node.removeAttribute(name);
    });
  });
  return root;
}

/** Moves the nodes after a list item's link (its note) into a span; wraps the link text. */
function decorateLinkItem(li) {
  const link = li.querySelector('a');
  const rest = [];
  let next = link.nextSibling;
  while (next) {
    rest.push(next);
    next = next.nextSibling;
  }
  const hasNote = rest.some((node) => node.textContent.replace(/\s/g, '').length);
  if (hasNote) {
    link.append(el('span', {}, ...link.childNodes));
    li.append(el('span', {}, ...rest));
  }
  return li;
}

/** Splits a nav list item into its label nodes and its nested list. */
function labelOf(li) {
  const sub = li.querySelector(':scope > ul');
  const label = [...li.childNodes].filter((node) => node !== sub);
  return { label, sub };
}

function buildMega(li, notice) {
  const { label, sub } = labelOf(li);
  const name = label.map((node) => node.textContent).join('');
  const button = el('button', { type: 'button' }, ...label);
  const catList = el('ul');
  const lists = el('div', { class: 'mega-lists' });
  const close = el('button', { class: 'mega-close', type: 'button' }, icon('close'));
  lists.append(close);
  [...sub.children].forEach((cat, i) => {
    const { label: catLabel, sub: links } = labelOf(cat);
    const catButton = el('button', { type: 'button' }, ...catLabel, icon('chevron-right'));
    if (i === 0) catButton.classList.add('active');
    catList.append(el('li', {}, catButton));
    if (i === 0) links.classList.add('active');
    [...links.children].forEach(decorateLinkItem);
    lists.append(links);
  });
  if (notice) lists.append(notice);
  const panel = el(
    'div',
    { class: 'mega-panel' },
    el('div', { class: 'mega-scroll' }, el('div', { class: 'mega-inner' }, el('div', { class: 'mega-cats' }, el('span', {}, name), catList), lists)),
  );
  return { item: el('li', { class: 'mega' }, button, panel), name, cats: [...catList.querySelectorAll('button')] };
}

function buildNotice(paragraphs) {
  const [text, action] = paragraphs;
  const notice = el('div', { class: 'mega-notice', role: 'region', 'aria-label': 'Notification' }, text);
  const button = el('button', { type: 'button' }, action.textContent);
  notice.append(button);
  action.remove();
  return notice;
}

function buildNav(section) {
  const list = section.querySelector('ul');
  unwrapParagraphs(list);
  const notice = buildNotice([...section.querySelectorAll(':scope p')]);
  const ul = el('ul');
  const megas = [];
  [...list.children].forEach((li) => {
    if (li.querySelector(':scope > ul')) {
      const panelNotice = megas.length ? stripInstrumentation(notice.cloneNode(true)) : notice;
      const mega = buildMega(li, panelNotice);
      megas.push(mega);
      ul.append(mega.item);
    } else {
      ul.append(li);
    }
  });
  return { nav: el('nav', { class: 'header-nav' }, ul), megas, links: [...ul.querySelectorAll(':scope > li > a')] };
}

function buildSearch(placeholderP) {
  const input = el('input', {
    type: 'text', required: '', minlength: '3', placeholder: placeholderP.textContent,
  });
  placeholderP.remove();
  const form = el('form', {}, input, el('button', { type: 'submit' }, el('span', { class: 'sr-only' }, 'Search'), icon('search')));
  form.action = 'https://backlinko.com/';
  const popup = el(
    'div',
    { class: 'header-popup search-popup' },
    el('div', { class: 'search-form' }, form),
    el('button', { class: 'popup-close', type: 'button' }, icon('close'), el('span', { class: 'sr-only' }, 'Close')),
  );
  const toggle = el('button', { type: 'button' }, icon('search'));
  toggle.addEventListener('click', () => popup.classList.toggle('open'));
  popup.querySelector('.popup-close').addEventListener('click', () => popup.classList.remove('open'));
  return el('div', { class: 'header-search' }, toggle, popup);
}

function buildCta(section) {
  const [ctaP, ...rest] = section.querySelectorAll(':scope > div > :is(p, h3, ul)');
  const button = el('button', { type: 'button' }, ctaP.textContent);
  ctaP.remove();
  const [title, list, footTitle, footText] = rest;
  const helps = [...title.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  helps.forEach((node) => {
    const span = el('span');
    node.replaceWith(span);
    span.append(node);
  });
  const brand = title.querySelector('em');
  if (brand) {
    const srOnly = el('span', { class: 'sr-only' });
    brand.replaceWith(srOnly);
    srOnly.append(brand);
  }
  title.prepend(icon('semrush-logo'));
  const closeButton = el('button', { type: 'button' }, icon('close'), el('span', { class: 'sr-only' }, 'Close'));
  [...list.children].forEach((li) => li.prepend(icon('check')));
  const card = el(
    'div',
    { class: 'semrush-card' },
    el(
      'div',
      {},
      icon('semrush-circle'),
      el('header', {}, title, closeButton),
      list,
      el('footer', {}, footTitle, footText),
    ),
  );
  return el('div', { class: 'header-cta' }, button, el('div', { class: 'header-popup semrush-popup' }, card));
}

/** Presentational clone of a button label (its text, without the glyph). */
function labelClone(button) {
  return [...button.childNodes]
    .filter((node) => !(node.classList && node.classList.contains('icon')))
    .map((node) => stripInstrumentation(node.cloneNode(true)));
}

function buildMobile(megas, links, ctaSection) {
  const ul = el('ul');
  megas.forEach(({ name, cats }) => {
    const items = cats.map((cat) => el(
      'li',
      { class: 'm-acc' },
      el('div', {}, el('button', { type: 'button' }, ...labelClone(cat), icon('chevron-down')), el('div', { class: 'm-acc-body' })),
    ));
    const back = el('button', { type: 'button' }, icon('chevron-left'), 'Back');
    const sub = el(
      'div',
      { class: 'm-sub' },
      el('div', { class: 'm-panel' }, el('div', { class: 'm-scroll' }, el(
        'div',
        { class: 'm-container' },
        el('div', { class: 'm-sub-head' }, el('span', {}, name), back),
        el('ul', {}, ...items),
      ))),
    );
    const open = el('button', { type: 'button' }, name, icon('chevron-right'));
    open.addEventListener('click', () => sub.classList.add('active'));
    back.addEventListener('click', () => sub.classList.remove('active'));
    ul.append(el('li', { class: 'has-children' }, open, sub));
  });
  links.forEach((link) => {
    const clone = stripInstrumentation(link.cloneNode(true));
    clone.append(icon('chevron-right'));
    ul.append(el('li', {}, clone));
  });
  const cta = el('div', { class: 'm-cta' });
  [...ctaSection.querySelectorAll('p')].forEach((p) => {
    const link = p.querySelector('a');
    if (link) {
      link.className = 'purple';
      cta.append(link);
      p.remove();
    } else if (p.querySelector('br')) {
      cta.append(p);
    } else {
      cta.append(el('button', { type: 'button' }, p.textContent));
      p.remove();
    }
  });
  return el('div', { class: 'header-mobile', id: 'header-m-drop' }, el('div', { class: 'm-panel' }, el('div', { class: 'm-scroll' }, el('div', { class: 'm-container m-main' }, el('nav', { class: 'm-nav' }, ul), cta))));
}

function buildTopbar(section) {
  const [text, linkP] = section.querySelectorAll('p');
  const link = linkP.querySelector('a');
  link.target = '_blank';
  link.append(el('span', {}, ...link.childNodes));
  const close = el('button', { class: 'header-topbar-close', type: 'button' }, icon('close'), el('span', { class: 'sr-only' }, 'Close'));
  const bar = el('div', { class: 'header-topbar' }, el('div', { class: 'header-topbar-inner' }, text, link), close);
  close.addEventListener('click', () => bar.remove());
  return bar;
}

function wireBehaviour(block, megas, drop, toggle) {
  const headroom = block.querySelector('.headroom');
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const pastHeader = y > headroom.offsetHeight;
    const down = pastHeader && y > lastY;
    headroom.classList.toggle('headroom-unfixed', !pastHeader);
    headroom.classList.toggle('headroom-unpinned', down);
    headroom.classList.toggle('headroom-pinned', pastHeader && !down);
    headroom.classList.toggle('headroom-scrolled', pastHeader && !down);
    block.classList.toggle('has-shadow', pastHeader);
    lastY = y;
  }, { passive: true });

  megas.forEach(({ item }) => {
    const button = item.querySelector(':scope > button');
    const panel = item.querySelector('.mega-panel');
    const setOpen = (open) => {
      block.querySelectorAll('.header-nav li.mega > .active').forEach((node) => node.classList.remove('active'));
      button.classList.toggle('active', open);
      panel.classList.toggle('active', open);
    };
    button.addEventListener('click', () => setOpen(!panel.classList.contains('active')));
    panel.querySelector('.mega-close').addEventListener('click', () => setOpen(false));
    const cats = [...panel.querySelectorAll('.mega-cats button')];
    const lists = [...panel.querySelectorAll('.mega-lists > ul')];
    cats.forEach((cat, i) => cat.addEventListener('click', () => {
      cats.forEach((c, j) => c.classList.toggle('active', i === j));
      lists.forEach((l, j) => l.classList.toggle('active', i === j));
    }));
  });

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active', drop.classList.toggle('active'));
  });
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const [barSection, logoSection, navSection, toolsSection, mobileSection] = fragment.children;

  const logo = logoSection.querySelector('a');
  logo.querySelectorAll('.icon').forEach(inlineIcon);
  logo.className = 'header-logo';
  logo.title = 'Backlinko';
  const { nav, megas, links } = buildNav(navSection);
  const search = buildSearch(toolsSection.querySelector('p'));
  const cta = buildCta(toolsSection);
  const toggle = el('button', { class: 'header-toggle', type: 'button', title: 'Menu' }, el('i', { 'aria-hidden': 'true' }), el('span', { class: 'sr-only' }, 'Menu'));
  const drop = buildMobile(megas, links, mobileSection);

  const bar = el('div', { class: 'header-bar' }, el('div', { class: 'header-row' }, logo, el('div', { class: 'header-tools' }, nav, search, cta, toggle)));
  block.textContent = '';
  block.append(el('div', { class: 'headroom' }, bar), drop);
  document.body.prepend(el('div', { class: 'header-topbar-spacer' }), buildTopbar(barSection));
  wireBehaviour(block, megas, drop, toggle);
}
