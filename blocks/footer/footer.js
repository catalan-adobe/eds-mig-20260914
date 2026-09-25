import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — the source footer, template-slotted from the /footer document's sections:
 *   1. brand: logo link (<img> + wordmark text) and the tagline paragraph
 *   2..4. link columns: <h4> + <ul> of links
 *   5. bottom bar: two paragraphs (copyright, sign-off)
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const sections = [...fragment.children];
  const bottom = sections.length > 1 ? sections.pop() : null;
  const [brand, ...columns] = sections;

  const top = document.createElement('div');
  top.className = 'footer-top';
  if (brand) {
    brand.className = 'footer-brand';
    const link = brand.querySelector('a');
    if (link) {
      link.className = 'footer-logo';
      const img = link.querySelector('picture, img');
      if (img) {
        const icon = document.createElement('span');
        icon.className = 'footer-logo-icon';
        icon.append(img);
        link.prepend(icon);
      }
      const text = document.createElement('span');
      text.className = 'logo-text';
      [...link.childNodes].filter((n) => !n.classList || !n.classList.contains('footer-logo-icon'))
        .forEach((n) => text.append(n));
      link.append(text);
    }
    top.append(brand);
  }
  columns.forEach((col) => {
    col.className = 'footer-col';
    top.append(col);
  });
  block.append(top);
  if (bottom) {
    bottom.className = 'footer-bottom';
    block.append(bottom);
  }
}
