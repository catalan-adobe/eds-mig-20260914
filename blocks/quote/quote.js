/**
 * Rows: the quotation, then an optional attribution.
 * @param {Element} block The quote block element
 */
export default function decorate(block) {
  const [quotation, attribution] = [...block.children];
  if (!quotation) return;
  const blockquote = document.createElement('blockquote');
  blockquote.append(...quotation.firstElementChild.childNodes);
  quotation.replaceWith(blockquote);
  attribution?.classList.add('quote-attribution');
}
