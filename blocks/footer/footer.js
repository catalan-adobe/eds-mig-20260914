import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — the source footer, template-slotted from the /footer document's sections:
 *   1. brand: logo link (wordmark text; the brand mark is a fixed inline SVG) and the tagline
 *   2..4. link columns: <h4> + <ul> of links
 *   5. bottom bar: two paragraphs (copyright, sign-off)
 */
const LOGO_SVG = '<svg width="100%" height="100%" viewBox="0 0 33 33"'
  + ' preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M28,0H5C2.24,0,0,2.24,0,5v23'
  + 'c0,2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1'
  + 'c0-6.63-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z" fill="currentColor"/>'
  + '</svg>';

/** Moves the section's default-content wrapper children up (the wrapper is a fragment artifact). */
function unwrap(section) {
  section.querySelectorAll(':scope > .default-content-wrapper').forEach((w) => {
    w.replaceWith(...w.childNodes);
  });
  return section;
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const sections = [...fragment.children].map(unwrap);
  const bottom = sections.length > 1 ? sections.pop() : null;
  const [brand, ...columns] = sections;

  const top = document.createElement('div');
  top.className = 'footer-top';
  if (brand) {
    brand.className = 'footer-brand';
    const link = brand.querySelector('a');
    if (link) {
      link.className = 'footer-logo';
      const text = document.createElement('span');
      text.className = 'logo-text';
      text.append(...link.childNodes);
      const icon = document.createElement('span');
      icon.className = 'footer-logo-icon';
      icon.innerHTML = LOGO_SVG;
      link.append(icon, text);
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
