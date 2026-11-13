/*
 * Tabs: the source's floating tabs, horizontal or vertical, an accordion below 730.
 * A row is one band of a panel: label | cells side by side | optional styles. A row with a
 * label starts a panel; rows without one continue it. The style `box-links` draws the lists
 * of links of a row as box links; `box-links (first, cols-2)` only the first list of each cell,
 * in two columns. A style that names a block, as `cards (cols-3)`, makes the
 * row a row of that block: it is loaded inside the panel. `cell columns (media, narrow)` draws,
 * in every cell, each image and the text after it as one such block; `cell video (modal)` each
 * paragraph that is only a video link. `c2-top-sm` is the spacing
 * of one cell; `gap-top-sm` the spacing before every title of a cell but its first child.
 */
import { decorateBlock, loadBlock } from '../../scripts/aem.js';

const STYLE = new RegExp(`^(${['(c\\d+-|gap-)?(top|bottom)-(xs|sm|md)', 'w-(3-9|9-3|4-8|8-4)',
  'image-pad-(sm|md|lg)', 'title-(dark|small|large)', 'center', 'right', 'rule', 'rich-text',
  'light-grey', 'white', 'divider', 'box-links( \\((first|cols-2)(, cols-2)?\\))?'].join('|')})$`);
const NESTED = new RegExp(`^(${['accordion', 'cards', 'carousel', 'columns', 'content-tile',
  'embed', 'key-benefits', 'mosaic', 'promo', 'quote', 'table', 'teasers', 'video']
  .join('|')})( \\(([a-z0-9-]+(, )?)+\\))?$`);
const CELL = /^cell ((columns|video)( \(([a-z0-9-]+(, )?)+\))?)$/;
const NEXT = {
  ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1,
};
let count = 0;

const slug = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');

function element(tag, className, ...children) {
  const el = document.createElement(tag);
  el.className = className;
  el.append(...children);
  return el;
}

/** The style words of a row: its last cell, when it holds nothing else. */
function takeStyles(cells) {
  const last = cells.at(-1);
  const words = last?.textContent.split(/,(?![^(]*\))/).map((word) => word.trim()) ?? [];
  const plain = last && !last.querySelector(':scope > :not(p), :scope > p > *');
  const known = words.every((word) => [STYLE, NESTED, CELL].some((re) => re.test(word)));
  if (cells.length < 2 || !plain || !known) return [];
  cells.pop();
  return words;
}

/**
 * A block inside a panel: the rows that name it, one after the other, are its rows. Returns
 * the band that holds the block, or nothing when the row joined the band before it.
 */
function nestedBand(previous, name, styles, cells) {
  const row = element('div', '', ...cells);
  if (previous?.dataset.nested === name) {
    previous.querySelector(':scope > div > div').append(row);
    previous.classList.add(...styles.filter((style) => style.startsWith('bottom-')));
    return null;
  }
  const nested = element('div', name.replace(/[(),]/g, ''), row);
  const band = element('div', ['tabs-row', ...styles].join(' '), element('div', '', nested));
  band.dataset.nested = name;
  return band;
}

/**
 * The source's `boxLink`: a list whose items are links; an item with a list opens it.
 * The pipeline writes the items of a list that holds lists as paragraphs.
 */
function decorateBoxLinks(list) {
  const menu = (li) => li.querySelector(':scope > ul');
  const items = [...list.children].map((li) => {
    const rest = [...li.children].filter((child) => child !== menu(li));
    const label = rest.length === 1 && rest[0].tagName === 'P' ? rest[0] : null;
    if (label) label.replaceWith(...label.childNodes);
    const link = li.firstElementChild?.tagName === 'A' && li.children.length === 1
      && li.textContent.trim() === li.firstElementChild.textContent.trim();
    return { li, link, menu: menu(li) };
  });
  if (!items.length || !items.every((item) => item.link || item.menu)) return;
  list.classList.add('tabs-box-links');
  items.forEach(({ li, link }) => {
    if (link) {
      li.firstElementChild.replaceChildren(element('span', '', ...li.firstElementChild.childNodes));
      return;
    }
    const label = [...li.childNodes].filter((node) => node !== menu(li));
    const button = element('button', '', element('span', '', ...label));
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      button.setAttribute('aria-expanded', String(button.getAttribute('aria-expanded') !== 'true'));
    });
    li.prepend(button);
  });
}

/** A block of the cell, in a wrapper of its own: the block is not the cell's only content. */
function wrap(node, name, ...cells) {
  const block = element('div', name.replace(/[(),]/g, ''), element('div', '', ...cells));
  block.dataset.nested = name;
  node.replaceWith(element('div', '', block));
}

/** Each image of the cell and what follows it, up to the next image, as a block. */
function cellColumns(cell, name) {
  // an image alone in its cell comes without a paragraph
  const isImage = (el) => el.tagName === 'PICTURE'
    || (el.tagName === 'P' && !el.textContent.trim() && el.querySelector('img'));
  [...cell.children].filter(isImage).forEach((image) => {
    const text = element('div', '');
    while (image.nextElementSibling && !isImage(image.nextElementSibling)) {
      text.append(image.nextElementSibling);
    }
    const spot = element('div', '');
    image.replaceWith(spot);
    const media = image.tagName === 'P' ? [...image.childNodes] : [image];
    wrap(spot, name, element('div', '', ...media), text);
  });
}

/** Each paragraph that is only a link to its own URL, with the image paragraph before it. */
function cellVideos(cell, name) {
  [...cell.querySelectorAll(':scope > p')].forEach((p) => {
    const link = p.querySelector(':scope > a:only-child');
    if (!link || link.textContent.trim() !== link.href || p.textContent.trim() !== link.href) {
      return;
    }
    const poster = p.previousElementSibling;
    const image = poster?.tagName === 'P' && !poster.textContent.trim()
      && poster.querySelector('img');
    const media = image ? [poster] : [];
    wrap(p, name, element('div', '', ...media, element('p', '', link)));
  });
}

function decorateCell(cell, styles, inCell) {
  cell.className = 'tabs-cell';
  inCell.map((word) => word.slice('cell '.length)).forEach((name) => {
    if (name.startsWith('video')) cellVideos(cell, name);
    else cellColumns(cell, name);
  });
  const image = !cell.textContent.trim() && cell.querySelector('picture, img');
  if (image) cell.classList.add('tabs-image');
  else if (!styles.includes('rich-text')) {
    cell.classList.add('text-content');
    cell.querySelectorAll(':scope > h2').forEach((title) => title.classList.add('title'));
  }
  const links = styles.find((style) => style.startsWith('box-links'));
  if (!links) return;
  const lists = [...cell.querySelectorAll(':scope > ul')];
  (links.includes('first') ? lists.slice(0, 1) : lists).forEach((list) => {
    decorateBoxLinks(list);
    if (!links.includes('cols-2') || !list.matches('.tabs-box-links')) return;
    // the links come column by column, as the source stacks its two columns below 730
    list.classList.add('cols-2');
    list.style.setProperty('--rows', Math.ceil(list.children.length / 2));
  });
}

/** The panels of the block: { label, id, rows }, a row being its cells and its styles. */
function readPanels(block) {
  const panels = [];
  [...block.children].forEach((row) => {
    const [label, ...cells] = [...row.children];
    if (!label) return;
    const words = takeStyles(cells);
    const styles = words.filter((word) => STYLE.test(word));
    const nested = words.find((word) => NESTED.test(word));
    const inCell = words.filter((word) => CELL.test(word));
    const text = label.textContent.trim();
    if (text || !panels.length) {
      const hash = label.querySelector('a[href^="#"]')?.getAttribute('href').slice(1);
      panels.push({ label: text, id: hash || slug(text) || `tab-${panels.length + 1}`, rows: [] });
    }
    const panel = panels.at(-1);
    if (nested) {
      const band = nestedBand(panel.rows.at(-1), nested, styles, cells);
      if (band) panel.rows.push(band);
      return;
    }
    cells.forEach((cell) => decorateCell(cell, styles, inCell));
    styles.map((style) => style.match(/^c(\d+)-(.+)$/)).filter(Boolean)
      .forEach(([, n, edge]) => cells[n - 1]?.classList.add(`cell-${edge}`));
    const band = element('div', ['tabs-row', ...styles.map((style) => style.replace(/[(),]/g, ''))]
      .join(' '), ...cells);
    band.style.setProperty('--cells', cells.length);
    band.style.setProperty('--span', Math.floor(12 / Math.max(1, cells.length)));
    panel.rows.push(band);
  });
  return panels;
}

/** Loads the blocks inside the panels, as `aem.js` loads the blocks of a section. */
function loadNested(block) {
  const section = block.closest('.section');
  const nested = '.tabs-row[data-nested] > div > div, .tabs-cell [data-nested]';
  return Promise.all([...block.querySelectorAll(nested)].map((el) => {
    const had = [...(section?.classList ?? [])];
    decorateBlock(el);
    // `-container` is a class of the sections that hold the block themselves
    if (section) section.className = had.join(' ');
    return loadBlock(el);
  }));
}

/** Opens the panel `index`; `toggle` closes it when it is open, as the accordion does. */
function open(block, index, toggle = false) {
  const tabs = [...block.querySelectorAll(':scope > .tabs-nav > a')];
  [...block.querySelectorAll(':scope > .tabs-content > .tabs-panel')].forEach((panel, i) => {
    const active = i === index && !(toggle && panel.classList.contains('active'));
    panel.classList.toggle('active', active);
    panel.firstElementChild.setAttribute('aria-expanded', String(active));
    tabs[i].classList.toggle('active', active);
    tabs[i].setAttribute('aria-selected', String(active));
  });
}

function onKey(event, block) {
  const tabs = [...block.querySelectorAll(':scope > .tabs-nav > a')];
  const step = NEXT[event.key];
  if (!step) return;
  event.preventDefault();
  const index = (tabs.indexOf(event.currentTarget) + step + tabs.length) % tabs.length;
  tabs[index].focus();
  open(block, index);
}

export default async function decorate(block) {
  count += 1;
  // the source's panels have no ids: a tab's hash must not scroll to a heading
  block.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
  const panels = readPanels(block);
  const nav = element('div', 'tabs-nav');
  const content = element('div', 'tabs-content');
  nav.setAttribute('role', 'tablist');
  if (block.classList.contains('vertical')) nav.setAttribute('aria-orientation', 'vertical');
  panels.forEach(({ label, id, rows }, index) => {
    const bodyId = `tabs-${count}-panel-${index + 1}`;
    const tab = element('a', '', label);
    tab.href = `#${id}`;
    tab.id = `tabs-${count}-tab-${index + 1}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', bodyId);
    tab.addEventListener('click', () => open(block, index));
    tab.addEventListener('keydown', (event) => onKey(event, block));
    const header = element('a', 'tabs-header', label);
    header.href = `#${id}`;
    header.setAttribute('aria-controls', bodyId);
    header.addEventListener('click', () => open(block, index, true));
    const body = element('div', 'tabs-body', ...rows);
    body.id = bodyId;
    body.setAttribute('role', 'tabpanel');
    body.setAttribute('aria-labelledby', tab.id);
    nav.append(tab);
    content.append(element('div', 'tabs-panel', header, body));
  });
  block.replaceChildren(nav, content);
  const hash = window.location.hash.slice(1);
  const wanted = panels.findIndex(({ id }) => hash && [id, encodeURI(id)].includes(hash));
  open(block, Math.max(0, wanted));
  await loadNested(block);
}
