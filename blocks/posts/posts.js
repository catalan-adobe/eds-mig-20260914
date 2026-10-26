/**
 * Posts: one row per article — picture | linked heading (+ optional teaser)
 * [| author picture + byline]. Variant `featured`: the first row is the lead card in the
 * left column, the other rows stack in the right column; default: two-up grid.
 */

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function buildCard(row, lead) {
  const [mediaCell, textCell, bylineCell] = [...row.children];
  const heading = textCell.querySelector('h2, h3, h4');
  const link = heading.querySelector('a');
  const card = el('a', '');
  card.href = link.href;
  link.replaceWith(...link.childNodes);
  card.append(el('figure', '', el('span', ''), mediaCell.querySelector('picture')), heading);
  const teaser = textCell.querySelector('p');
  if (lead && teaser) card.append(el('div', 'post-teaser', teaser));
  const article = el('article', lead ? 'post-card-lead' : 'post-card', card);
  if (lead && bylineCell) {
    const avatar = el('figure', '', bylineCell.querySelector('picture'));
    bylineCell.querySelectorAll('p:empty').forEach((p) => p.remove());
    article.append(el('div', 'post-byline', avatar, el('div', 'post-byline-text', ...bylineCell.childNodes)));
  }
  return article;
}

export default function decorate(block) {
  const featured = block.classList.contains('featured');
  const rows = [...block.children];
  const grid = el('div', 'post-grid');
  if (featured) {
    const [leadRow, ...rest] = rows;
    grid.append(
      el('div', 'post-col', buildCard(leadRow, true)),
      el('div', 'post-col', ...rest.map((row) => buildCard(row, false))),
    );
  } else {
    rows.forEach((row) => grid.append(el('div', 'post-col', buildCard(row, false))));
  }
  block.textContent = '';
  block.append(grid);
}
