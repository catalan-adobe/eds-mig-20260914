/**
 * Featured article: one row, image cell + text cell (tag, h2, summary, button).
 * @param {Element} block The featured block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  row.className = 'featured-row';
  const [media, text] = row.children;
  media.className = 'featured-image';
  text.className = 'featured-text';
  text.querySelector('.button-group')?.classList.add('featured-footer');
}
