/**
 * Panels: one bordered text panel per row (optional tag, heading, text, button).
 * Variant `promo`: two-up with larger headings.
 * @param {Element} block The panels block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.className = 'panel';
  });
}
