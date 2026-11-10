import { getMetadata } from '../../scripts/aem.js';
import { getLocaleRoot } from '../../scripts/locale.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Loads the footer page of the current locale.
 * Its first section holds the logo, links and social icons. The second holds the legal text.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const root = getLocaleRoot(window.location.pathname);
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : root && `${root}/footer`;
  const fragment = footerPath && await loadFragment(footerPath);
  block.textContent = '';
  if (!fragment) return;

  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  const [top, legal] = footer.children;
  top?.classList.add('footer-top');
  legal?.classList.add('footer-legal');
  top?.querySelectorAll('p').forEach((p) => {
    const icons = p.querySelectorAll('.icon').length;
    if (!icons) p.className = 'footer-follow';
    else p.className = p.querySelector('[class*="icon-wknd-logo"]') ? 'footer-brand' : 'footer-social';
  });
  top?.querySelector('.footer-brand a')?.setAttribute('aria-label', 'WKND home');
  top?.querySelectorAll('.footer-social a').forEach((a) => {
    const name = [...a.querySelector('.icon').classList].find((c) => c.startsWith('icon-')).slice(5);
    a.setAttribute('aria-label', name);
  });
  const here = window.location.pathname.replace(/\/$/, '');
  top?.querySelectorAll('ul a').forEach((a) => {
    const path = new URL(a.href).pathname;
    if (path === here) a.setAttribute('aria-current', 'page');
    else if (here.startsWith(`${path}/`)) a.classList.add('active');
  });
  block.append(footer);
}
