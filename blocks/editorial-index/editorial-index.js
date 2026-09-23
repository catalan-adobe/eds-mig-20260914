/**
 * Editorial index: rows of [number, heading + text].
 * @param {Element} block The editorial-index block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.className = 'editorial-item';
    row.firstElementChild.className = 'editorial-number';
  });
}
