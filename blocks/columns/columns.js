/**
 * columns — two side-by-side content columns (Block Collection model: one row, N cells).
 *   .key-benefits  each cell: <h3> column title, then 6 × [icon <p><img>, title <p><a>, text <p>]
 *                  → every triple becomes one linked benefit (card-as-link, EW6)
 *   .divider       each cell: <h2>, <p>, text-link <p>; a vertical rule between the columns
 * Reconstructive by content: items are segmented on the leading picture paragraph, never
 * on rows[N]. Authored nodes are MOVED (EW1); the benefit href is read then unwrapped (EW6).
 * Schema: stardust/eds-schema/index.json §component-column.
 */
// wrap an AUTHORED element in a generated wrapper carrying the layout class (EW2)
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function groupBenefits(col) {
  const nodes = [...col.children];
  const out = document.createDocumentFragment();
  let item = null;
  nodes.forEach((node) => {
    const leadsWithPicture = node.tagName === 'P' && node.querySelector('picture, img') && !node.textContent.trim();
    if (leadsWithPicture) {
      item = document.createElement('a');
      item.className = 'columns-benefit';
      item.append(wrapNode(node, 'columns-benefit-icon'));
      out.append(item);
      return;
    }
    if (item) {
      const link = node.querySelector('a');
      if (link && !item.getAttribute('href')) {
        item.href = link.getAttribute('href');
        item.append(wrapNode(node, 'columns-benefit-title'));
        link.replaceWith(...link.childNodes);
      } else {
        item.append(wrapNode(node, 'columns-benefit-text'));
      }
      return;
    }
    out.append(node);
  });
  col.replaceChildren(out);
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  cols.forEach((col) => {
    col.classList.add('columns-col');
    if (block.classList.contains('key-benefits')) groupBenefits(col);
  });
}
