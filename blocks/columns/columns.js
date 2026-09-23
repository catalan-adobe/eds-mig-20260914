/**
 * Columns: one row, two cells (text, image) side by side; stacked in authored order on mobile.
 * @param {Element} block The columns block element
 */
export default function decorate(block) {
  block.firstElementChild.className = 'columns-row';
}
