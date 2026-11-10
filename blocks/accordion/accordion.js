/**
 * Rows are items: a question, then the answer.
 * @param {Element} block The accordion block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [label, body] = row.children;
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary);
    if (body) {
      body.className = 'accordion-item-body rich-text';
      details.append(body);
    }
    row.replaceWith(details);
  });
}
