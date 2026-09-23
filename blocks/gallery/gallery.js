/**
 * Gallery: first row is a 3-up image grid; any following row is one wide image.
 * @param {Element} block The gallery block element
 */
export default function decorate(block) {
  [...block.children].forEach((row, i) => {
    row.className = i === 0 ? 'gallery-grid' : 'gallery-wide';
  });
}
