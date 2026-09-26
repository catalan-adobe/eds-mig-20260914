import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Replaces every <a> inside el with its text content, keeping the first
 * href found so the whole card can become a single link.
 * @param {Element} el container to unwrap links in
 * @returns {string|null} the first href found, or null
 */
function unwrapLinks(el) {
  let href = null;
  el.querySelectorAll('a[href]').forEach((a) => {
    href = href || a.href;
    a.replaceWith(document.createTextNode(a.textContent));
  });
  return href;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img')) || cells[0];
    const bodyCell = cells.find((c) => c !== imageCell) || cells[cells.length - 1];

    const href = (bodyCell && unwrapLinks(bodyCell)) || '#';

    const image = document.createElement('div');
    image.className = 'cards-card-image';
    if (imageCell) image.append(...imageCell.childNodes);

    const overlay = document.createElement('div');
    overlay.className = 'cards-card-overlay';

    const body = document.createElement('div');
    body.className = 'cards-card-body';
    if (bodyCell) body.append(...bodyCell.childNodes);
    const paragraphs = body.querySelectorAll('p');
    if (paragraphs.length) paragraphs[paragraphs.length - 1].classList.add('cards-card-cta');

    const a = document.createElement('a');
    a.className = 'cards-card-link';
    a.href = href;
    a.append(image, overlay, body);

    const li = document.createElement('li');
    li.append(a);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(ul);
}
