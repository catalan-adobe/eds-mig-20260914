import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — WKND site footer: logo, footer nav, "Follow Us" + social icon buttons, legal text.
 *
 * /footer document, sections classified by content (authored order is the source's):
 *   - a section with an image  — the logo link
 *   - a <ul> without icons     — the footer nav (Home first, hidden like the source)
 *   - a heading                — the "Follow Us" title
 *   - a <ul> whose links carry :facebook: / :twitter: / :instagram: icons — the social buttons
 *   - paragraphs               — the legal / attribution text
 *
 * Every authored node is MOVED into the template (EW1).
 */

const TEMPLATE = `
  <div class="footer-container">
    <div class="footer-grid">
      <div class="logo"></div>
      <nav class="footer-nav" aria-label="Footer navigation"></nav>
      <div class="footer-follow"></div>
      <div class="social-buttons"></div>
      <div class="footer-separator"></div>
      <div class="footer-text"></div>
    </div>
  </div>
`;

function pathOf(href) {
  try {
    return new URL(href, window.location.href).pathname.replace(/\.html$/, '');
  } catch (e) {
    return '';
  }
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  const root = document.createElement('div');
  root.className = 'site-footer';
  root.innerHTML = TEMPLATE;
  const slots = {
    logo: root.querySelector('.logo'),
    nav: root.querySelector('.footer-nav'),
    follow: root.querySelector('.footer-follow'),
    social: root.querySelector('.social-buttons'),
    text: root.querySelector('.footer-text'),
  };

  let homePath = '';
  [...fragment.children].forEach((section) => {
    [...section.querySelectorAll(':scope > div > *')].forEach((node) => {
      const hasImage = node.matches('picture, img') || node.querySelector('picture, img');
      if (hasImage && !node.matches('ul, ol')) {
        const link = node.querySelector('a');
        if (link && !homePath) homePath = pathOf(link.href);
        slots.logo.append(node);
      } else if (node.matches('ul, ol') && node.querySelector('.icon')) {
        slots.social.append(node);
      } else if (node.matches('ul, ol')) {
        [...node.querySelectorAll('li')].forEach((li) => {
          const a = li.querySelector('a');
          if (a && homePath && pathOf(a.href) === homePath) li.classList.add('is-home');
        });
        slots.nav.append(node);
      } else if (node.matches('h1, h2, h3, h4, h5, h6')) {
        slots.follow.append(node);
      } else {
        slots.text.append(node);
      }
    });
  });

  block.replaceChildren(root);
}
