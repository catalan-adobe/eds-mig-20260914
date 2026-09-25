/**
 * tabs — Block Collection `tabs` model: one row per tab, cell 1 = tab label, cell 2 = panel.
 * Schema: stardust/eds-schema/index.json sections[2] (reconstructive: 4 panels x 3 article cards).
 *
 * Panel content: per card, in authored order — <p><img></p>, <p><strong>tag</strong></p>,
 * <h3><a href>title</a></h3>, <p>teaser</p>. Cards segment on the h3 boundary; the picture
 * and tag preceding a heading belong to the card it opens (#76). The card becomes a link
 * (EW6: the authored anchor is unwrapped after its href is read).
 * @ew-exempt none — tab labels are authored cells moved into the tab buttons' sibling label.
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function segmentCards(panel) {
  const nodes = [...panel.children];
  const cards = [];
  let pending = [];
  nodes.forEach((node) => {
    if (node.matches('h1, h2, h3, h4, h5, h6')) {
      cards.push({ heading: node, before: pending, after: [] });
      pending = [];
    } else if (cards.length && !pending.length && !cards[cards.length - 1].closed) {
      const card = cards[cards.length - 1];
      if (node.querySelector('picture, img')) {
        card.closed = true;
        pending.push(node);
      } else {
        card.after.push(node);
      }
    } else {
      pending.push(node);
    }
  });
  return cards;
}

function buildCard({ heading, before, after }) {
  const link = heading.querySelector('a[href]');
  const card = document.createElement(link ? 'a' : 'div');
  card.className = 'article-card';
  if (link) {
    card.href = link.getAttribute('href');
    link.replaceWith(...link.childNodes);
  }
  const image = document.createElement('div');
  image.className = 'article-card-image';
  const body = document.createElement('div');
  body.className = 'article-card-body';
  const meta = document.createElement('div');
  meta.className = 'article-card-meta';
  before.forEach((node) => {
    if (node.querySelector('picture, img')) image.append(node);
    else meta.append(node);
  });
  if (meta.childElementCount) body.append(meta);
  body.append(wrapNode(heading, 'card-title'));
  after.forEach((node) => body.append(wrapNode(node, 'card-teaser')));
  if (image.childElementCount) card.append(image);
  card.append(body);
  return card;
}

export default function decorate(block) {
  const rows = [...block.children];
  const menu = document.createElement('div');
  menu.className = 'tab-menu';
  menu.setAttribute('role', 'tablist');
  const panes = document.createElement('div');
  panes.className = 'tab-panes';

  rows.forEach((row, i) => {
    const [labelCell, panelCell] = [...row.children];
    if (!labelCell || !panelCell) return;
    const id = `tab-${i}-${labelCell.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const button = document.createElement('button');
    button.className = 'tab-menu-link';
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', String(i === 0));
    button.append(...labelCell.childNodes);
    if (i === 0) button.classList.add('is-active');
    menu.append(button);

    const pane = document.createElement('div');
    pane.className = 'tab-pane';
    pane.id = id;
    pane.setAttribute('role', 'tabpanel');
    if (i === 0) pane.classList.add('is-active');
    const grid = document.createElement('div');
    grid.className = 'card-grid';
    segmentCards(panelCell).forEach((card) => grid.append(buildCard(card)));
    pane.append(grid);
    panes.append(pane);
  });

  menu.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab-menu-link');
    if (!tab) return;
    menu.querySelectorAll('.tab-menu-link').forEach((b) => {
      b.classList.remove('is-active');
      b.setAttribute('aria-selected', 'false');
    });
    panes.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('is-active'));
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    const pane = panes.querySelector(`#${tab.getAttribute('aria-controls')}`);
    if (pane) pane.classList.add('is-active');
  });

  block.replaceChildren(menu, panes);
}
