export default function decorate(block) {
  const [image, quote, cite] = [...block.querySelectorAll(':scope > div > div')];
  const blockquote = document.createElement('blockquote');
  const picture = image?.querySelector('picture');
  if (picture) {
    const figure = document.createElement('figure');
    figure.append(picture);
    blockquote.append(figure);
  }
  const p = document.createElement('p');
  p.textContent = quote?.textContent.trim() ?? '';
  blockquote.append(p);
  if (cite?.textContent.trim()) {
    const c = document.createElement('cite');
    c.textContent = cite.textContent.trim();
    blockquote.append(c);
  }
  block.replaceChildren(blockquote);
}
