/*
 * Tabs: the source's floating tabs, horizontal or vertical, an accordion below 730.
 * A row is one band of a panel: label | cells side by side | optional styles. A row with a
 * label starts a panel; rows without one continue it. The style `box-links` draws the lists
 * of links of a row as box links. A style that names a block, as `cards (cols-3)`, makes the
 * row a row of that block: it is loaded inside the panel. `cell columns (media, narrow)` draws,
 * in every cell, each image and the text after it as one such block.
 */
import { decorateBlock, loadBlock } from '../../scripts/aem.js';

const STYLE = new RegExp(`^(${['(top|bottom)-(xs|sm|md)', 'w-(3-9|9-3|4-8|8-4)',
  'image-pad-(sm|md|lg)', 'title-(dark|small|large)', 'center', 'right', 'rule', 'rich-text',
  'light-grey', 'white', 'divider', 'box-links'].join('|')})$`);
const NESTED = new RegExp(`^(${['accordion', 'cards', 'carousel', 'columns', 'content-tile',
  'embed', 'key-benefits', 'mosaic', 'promo', 'quote', 'table', 'teasers', 'video']
  .join('|')})( \\(([a-z0-9-]+(, )?)+\\))?$`);
const CELL = /^cell (columns( \(([a-z0-9-]+(, )?)+\))?)$/;
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

/** Each image paragraph of the cell and what follows it, up to the next one, as a block. */
function cellBlocks(cell, name) {
  const isImage = (el) => el.tagName === 'P' && !el.textContent.trim() && el.querySelector('img');
  [...cell.children].filter(isImage).forEach((image) => {
    const text = element('div', '');
    while (image.nextElementSibling && !isImage(image.nextElementSibling)) {
      text.append(image.nextElementSibling);
    }
    const media = element('div', '', ...image.childNodes);
    const block = element('div', name.replace(/[(),]/g, ''), element('div', '', media, text));
    block.dataset.nested = name;
    // a wrapper of its own: the block is not the row's only content
    image.replaceWith(element('div', '', block));
  });
}

function decorateCell(cell, styles, inCell) {
  cell.className = 'tabs-cell';
  if (inCell) cellBlocks(cell, inCell.slice('cell '.length));
  const image = !cell.textContent.trim() && cell.querySelector('picture, img');
  if (image) cell.classList.add('tabs-image');
  else if (!styles.includes('rich-text')) {
    cell.classList.add('text-content');
    cell.querySelectorAll(':scope > h2').forEach((title) => title.classList.add('title'));
  }
  if (styles.includes('box-links')) cell.querySelectorAll(':scope > ul').forEach(decorateBoxLinks);
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
    const inCell = words.find((word) => CELL.test(word));
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
    const band = element('div', ['tabs-row', ...styles].join(' '), ...cells);
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
