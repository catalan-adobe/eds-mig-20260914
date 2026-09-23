/**
 * Article aside: one row, [heading + list] and [blockquote with quote + attribution].
 * The quote cell spans two of three columns.
 * @param {Element} block The article-aside block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  row.className = 'article-aside-row';
  row.lastElementChild.className = 'article-aside-quote';
}
