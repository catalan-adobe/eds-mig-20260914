/**
 * image-list — the WKND adventure listing (source .cmp-image-list, one list per
 * .cmp-tabs panel). Schema: stardust/eds-schema/us-en-adventures-html.json § 3 (the
 * 32 card units). Decode tier: reconstructive (repeat group; authors add and remove
 * cards and tabs).
 *
 * Authoring (container shape), classified by row shape — never by index:
 *   - a single-cell text row is a tab label; it opens a new panel that takes every
 *     card row after it (no label rows = one flat list, no tab strip)
 *   - a card row is `picture | title link | description`; the card's href is the
 *     title link's (the source's image link repeats it — that anchor is generated,
 *     it carries no text)
 * Every authored node MOVES (EW1): the label paragraph into its <li role="tab">
 * (a list item, not a <button> — EW7), the image paragraph into .image, the title
 * paragraph into .title, the description paragraph into .description; wrappers carry
 * the layout classes (EW2). Interaction as the source tabs: click swaps the active
 * tab + panel, no transition. Re-entrant (EW9).
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

function isLabelRow(cells) {
  return cells.length === 1
    && !cells[0].querySelector('picture, img')
    && cells[0].textContent.trim() !== '';
}

function buildCard(cells) {
  const item = el('li', 'item');
  const card = el('article', 'card');
  const media = cells.find((cell) => cell.querySelector('picture, img'));
  const titleCell = cells.find((cell) => cell !== media && cell.querySelector('a[href]'));
  const href = titleCell?.querySelector('a[href]')?.getAttribute('href');
  if (media) {
    const image = el('div', 'image');
    image.append(...media.childNodes);
    const frame = el('div', 'image-frame');
    frame.append(image);
    if (href) {
      const link = el('a', 'image-link', { href });
      link.append(frame);
      card.append(link);
    } else {
      card.append(frame);
    }
  }
  if (titleCell) {
    const title = el('div', 'title');
    title.append(...titleCell.childNodes);
    card.append(title);
  }
  cells.filter((cell) => cell !== media && cell !== titleCell).forEach((cell) => {
    const description = el('div', 'description');
    description.append(...cell.childNodes);
    card.append(description);
  });
  item.append(card);
  return item;
}

function buildTabs(block, groups) {
  const tablist = el('ol', 'tablist', { role: 'tablist' });
  const tabs = [];
  const panels = [];
  groups.forEach((group, i) => {
    const base = `image-list-${slugify(group.label?.textContent || '') || i + 1}`;
    const tab = el('li', 'tab', { role: 'tab', id: `${base}-tab`, 'aria-controls': base });
    if (group.label) tab.append(...group.label.childNodes);
    tabs.push(tab);
    tablist.append(tab);
    const panel = el('div', 'panel', { role: 'tabpanel', id: base, 'aria-labelledby': tab.id });
    panel.append(group.list);
    panels.push(panel);
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
  block.replaceChildren(tablist, ...panels);
}

export default function decorate(block) {
  if (block.querySelector(':scope > .tablist, :scope > .items')) return;
  const groups = [];
  let current = null;
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (isLabelRow(cells)) {
      current = { label: cells[0], list: el('ul', 'items') };
      groups.push(current);
      return;
    }
    if (!current) {
      current = { label: null, list: el('ul', 'items') };
      groups.push(current);
    }
    current.list.append(buildCard(cells));
  });
  if (!groups.length) return;
  if (groups.some((group) => group.label)) {
    buildTabs(block, groups);
  } else {
    block.replaceChildren(...groups.map((group) => group.list));
  }
}
