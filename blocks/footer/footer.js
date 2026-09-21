import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — synopsys.com site footer, template-slotted from /footer:
 *   1 mobile logo · 2 four link columns (h3 + ul, repeated) · 3 language list ·
 *   4 social icons + desktop logo · 5 legal line.
 * Authored nodes are MOVED into the slots (EW1); the language list is rendered as a
 * <select> for parity with the source.
 * @ew-exempt language options — form control (<option>) cannot host an editor
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'site-footer';
  const [logoTop, links, language, social, legal] = [...fragment.children];

  if (logoTop) {
    logoTop.className = 'footer-logo-top';
    footer.append(logoTop);
  }

  const grid = document.createElement('div');
  grid.className = 'footer-links';
  if (links) {
    const wrapper = links.querySelector('.default-content-wrapper') || links;
    let col = null;
    [...wrapper.children].forEach((node) => {
      if (node.tagName === 'H3' || !col) {
        col = document.createElement('nav');
        col.className = 'footer-col';
        grid.append(col);
      }
      col.append(node);
    });
  }
  if (language) {
    const col = document.createElement('div');
    col.className = 'footer-col footer-language';
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Language');
    language.querySelectorAll('li').forEach((li) => {
      const option = document.createElement('option');
      option.append(...li.childNodes);
      select.append(option);
    });
    col.append(select);
    grid.append(col);
  }
  footer.append(grid);

  if (social) {
    social.className = 'footer-social';
    footer.append(social);
  }
  if (legal) {
    legal.className = 'footer-legal';
    footer.append(legal);
  }

  block.append(footer);
}
