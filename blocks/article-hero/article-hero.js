/**
 * Article header: title, authors, then "date / read time" on a gradient.
 * @param {Element} block
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;
  cell.classList.add('article-hero-info');
  const meta = [...cell.querySelectorAll(':scope > p')].find((p) => !p.children.length
    && p.textContent.includes(' / '));
  if (!meta) return;
  // the source pads the slash between the date and the read time
  const [date, ...rest] = meta.textContent.split(' / ');
  const slash = document.createElement('span');
  slash.className = 'article-hero-slash';
  slash.textContent = '/';
  meta.replaceChildren(`${date} `, slash, ` ${rest.join(' / ')}`);
}
