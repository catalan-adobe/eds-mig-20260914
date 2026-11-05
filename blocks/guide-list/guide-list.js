import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const link = row.querySelector('a');
    const picture = row.querySelector('picture');
    if (!link) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.href;
    const figure = document.createElement('figure');
    const img = picture?.querySelector('img');
    if (img) figure.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
    const h3 = document.createElement('h3');
    h3.textContent = link.textContent.trim();
    a.append(figure, h3);
    li.append(a);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
