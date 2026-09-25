/**
 * editorial-index — numbered editorial list: one row per item,
 * cell 1 = number, cell 2 = h3 + paragraph.
 * Schema: stardust/eds-schema/index.json sections[6] (reconstructive, 3 items).
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [numCell, bodyCell] = [...row.children];
    if (!numCell || !bodyCell) return;
    row.className = 'editorial-index-item';
    numCell.className = 'editorial-index-number';
    bodyCell.className = 'editorial-index-body';
  });
}
