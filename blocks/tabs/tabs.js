/**
 * Tabs — the adventure details (source .cmp-tabs): a flex tab list, one panel per tab, the
 * active panel a content-fragment rich text (hidden fragment title + body).
 * Schema: stardust/eds-schema/us-en-adventures-riverside-camping-australia-html.json
 * § adventure-details. Decode tier: reconstructive (one row per tab).
 *
 * Authoring (container shape): one row per tab — `label | panel content`, or
 * `label | fragment title | panel content` when the source panel carries the (display:none)
 * content-fragment title. Every authored node MOVES (EW1): the label paragraph into its
 * <li role="tab"> (a list item, not a <button> — EW7), the panel nodes into the panel body; an
 * image paragraph followed by `<p><em>caption</em></p>` becomes an .image figure with the
 * caption underneath (source .cmp-image__title).
 * Variant `col-9`: the 75% grid column beside `content-fragment-elements.col-3`.
 * Interaction lifted from the live page (stardust/prototypes/…-html.js): click swaps the active
 * tab + panel, no transition.
 */
function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function isImageParagraph(node) {
  return node.nodeType === 1 && node.matches('p') && node.querySelector('picture, img');
}

function isCaption(node) {
  return node.nodeType === 1 && node.matches('p:has(> em:only-child)');
}

/** Moves a cell's nodes into the body; image paragraphs get an .image wrapper that also takes an
 *  immediately following caption paragraph. */
function fillBody(cell, body) {
  let image = null;
  [...cell.childNodes].forEach((node) => {
    if (isImageParagraph(node)) {
      image = el('div', 'image');
      image.append(node);
      body.append(image);
    } else if (image && isCaption(node)) {
      const title = el('div', 'image-title');
      title.append(node);
      image.append(title);
      image = null;
    } else {
      if (node.nodeType === 1 || node.textContent.trim()) image = null;
      body.append(node);
    }
  });
}

function buildPanel(cells, id, tabId) {
  const panel = el('div', 'panel', { role: 'tabpanel', id, 'aria-labelledby': tabId });
  const fragment = el('article', 'cf');
  const body = el('div', 'cf-body');
  if (cells.length > 1) {
    const title = el('div', 'cf-title');
    cells.slice(0, -1).forEach((cell) => title.append(...cell.childNodes));
    fragment.append(title);
  }
  fillBody(cells[cells.length - 1], body);
  fragment.append(body);
  panel.append(fragment);
  return panel;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const list = el('ol', 'tablist', { role: 'tablist' });
  const tabs = [];
  const panels = [];
  rows.forEach((row, i) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    const base = `tab-${slugify(labelCell.textContent) || i + 1}`;
    const tab = el('li', 'tab', {
      role: 'tab', id: `${base}-tab`, 'aria-controls': base,
    });
    tab.append(...labelCell.childNodes);
    tabs.push(tab);
    list.append(tab);
    const panelCells = cells.length > 1 ? cells.slice(1) : [el('div')];
    panels.push(buildPanel(panelCells, base, tab.id));
  });

  const select = (index) => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.classList.toggle('tab-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.setAttribute('tabindex', on ? '0' : '-1');
      panels[i].classList.toggle('panel-active', on);
    });
  };
  tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)));
  select(0);

  block.replaceChildren(list, ...panels);
}
