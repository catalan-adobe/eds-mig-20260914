export default function decorate(block) {
  const [quote, attribution] = block.querySelectorAll(':scope > div > div > p');
  if (!quote) return;

  const blockquote = document.createElement('blockquote');
  blockquote.append(...quote.childNodes);
  block.replaceChildren(blockquote);

  if (attribution) {
    attribution.className = 'quote-attribution';
    block.append(attribution);
  }
}
