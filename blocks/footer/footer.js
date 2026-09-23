import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Loads the /footer document: sections 1–4 are the top grid (brand + three link
 * columns), the last section is the bottom bar.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const bottom = sections.pop();

  const top = document.createElement('div');
  top.className = 'footer-top';
  sections.forEach((section) => top.append(...section.children));

  const logo = top.querySelector('p:has(.icon)');
  if (logo) {
    const text = document.createElement('span');
    text.append(...[...logo.childNodes].filter((n) => !n.classList?.contains('icon')));
    logo.classList.add('footer-logo');
    logo.append(text);
  }

  const bar = document.createElement('div');
  bar.className = 'footer-bottom';
  bar.append(...bottom.querySelector('.default-content-wrapper').children);

  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  inner.append(top, bar);
  block.textContent = '';
  block.append(inner);
}
