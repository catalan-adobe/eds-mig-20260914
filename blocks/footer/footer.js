import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/* social platform -> icon name, matched by link hostname */
const SOCIAL_ICONS = [
  [/x\.com|twitter\.com/, 'x-twitter'],
  [/linkedin\.com/, 'linkedin'],
  [/facebook\.com/, 'facebook'],
  [/youtube\.com/, 'youtube'],
  [/instagram\.com/, 'instagram'],
];

function iconFor(href) {
  const match = SOCIAL_ICONS.find(([re]) => re.test(href));
  return match ? match[1] : null;
}

function icon(name, alt = '') {
  const span = document.createElement('span');
  span.className = 'icon';
  span.innerHTML = `<img src="/icons/${name}.svg" alt="${alt}" loading="lazy">`;
  return span;
}

/**
 * Builds the 4 link columns (Company/Resources/Trending/Learn) from an h3+ul
 * sequence, turning each heading into an accessible accordion toggle for mobile.
 * @param {Element} section The section holding the authored nav columns
 * @returns {Element|null} The decorated nav element
 */
function buildNav(section) {
  const wrapper = section?.querySelector('.default-content-wrapper');
  if (!wrapper) return null;
  const nav = document.createElement('div');
  nav.className = 'footer-nav';
  let col = null;
  [...wrapper.children].forEach((el) => {
    if (el.tagName === 'H3') {
      col = document.createElement('div');
      col.className = 'footer-nav-col';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'footer-nav-heading';
      button.textContent = el.textContent;
      button.setAttribute('aria-expanded', 'false');
      el.textContent = '';
      el.append(button);
      col.append(el);
      nav.append(col);
    } else if (el.tagName === 'UL' && col) {
      col.append(el);
    }
  });
  nav.querySelectorAll('.footer-nav-heading').forEach((button) => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      button.closest('.footer-nav-col').classList.toggle('is-expanded', !expanded);
    });
  });
  return nav;
}

/**
 * Builds the language selector (button + dropdown) from a ul of language links;
 * the first list item is treated as the current language.
 * @param {Element} list The authored language ul
 * @returns {Element|null} The decorated language selector
 */
function buildLangSelector(list) {
  if (!list) return null;
  const items = [...list.querySelectorAll(':scope > li')];
  const currentLi = items.shift();
  if (!currentLi) return null;
  const box = document.createElement('div');
  box.className = 'footer-lang';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'footer-lang-toggle';
  toggle.setAttribute('aria-haspopup', 'true');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.append(icon('globe'));
  const label = document.createElement('span');
  label.className = 'footer-lang-current';
  label.textContent = currentLi.textContent.trim();
  toggle.append(label);
  const caret = document.createElement('span');
  caret.className = 'footer-lang-caret';
  toggle.append(caret);

  const menu = document.createElement('ul');
  menu.className = 'footer-lang-menu';
  menu.hidden = true;
  items.forEach((li) => menu.append(li));

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    menu.hidden = expanded;
  });
  document.addEventListener('click', (e) => {
    if (!box.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    }
  });

  box.append(toggle, menu);
  return box;
}

/**
 * Decorates the authored social links list with brand icons matched by hostname.
 * @param {Element} list The authored social ul
 * @returns {Element|null} The decorated social list
 */
function buildSocial(list) {
  if (!list) return null;
  list.className = 'footer-social';
  list.querySelectorAll(':scope > li > a').forEach((a) => {
    const name = iconFor(a.href);
    const label = a.textContent.trim();
    a.textContent = '';
    a.title = label;
    a.setAttribute('aria-label', label);
    if (name) a.append(icon(name));
    else a.append(document.createTextNode(label));
  });
  return list;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  if (!fragment) {
    block.append(inner);
    return;
  }

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const navSection = sections.find((s) => s.classList.contains('footer-nav'));
  const toolsSection = sections.find((s) => s.classList.contains('footer-tools'));
  const legalSection = sections.find((s) => s.classList.contains('footer-legal'));

  const nav = buildNav(navSection);

  const toolsWrapper = toolsSection?.querySelector('.default-content-wrapper');
  const logoPicture = toolsWrapper?.querySelector('picture') || toolsWrapper?.querySelector('img');
  const lists = toolsWrapper ? [...toolsWrapper.querySelectorAll(':scope > ul')] : [];
  const langSelector = buildLangSelector(lists[0]);
  const socialList = buildSocial(lists[1]);

  const topRow = document.createElement('div');
  topRow.className = 'footer-top-row';
  if (nav) topRow.append(nav);
  if (langSelector) topRow.append(langSelector);

  const brandRow = document.createElement('div');
  brandRow.className = 'footer-brand-row';
  if (socialList) brandRow.append(socialList);
  if (logoPicture) {
    const topLogo = document.createElement('a');
    topLogo.className = 'footer-logo footer-logo-top';
    topLogo.href = 'https://www.synopsys.com/';
    topLogo.append(logoPicture.cloneNode(true));
    inner.append(topLogo);

    const bottomLogo = document.createElement('a');
    bottomLogo.className = 'footer-logo footer-logo-bottom';
    bottomLogo.href = 'https://www.synopsys.com/';
    bottomLogo.append(logoPicture.cloneNode(true));
    brandRow.append(bottomLogo);
  }

  inner.append(topRow, brandRow);

  const legalWrapper = legalSection?.querySelector('.default-content-wrapper');
  if (legalWrapper) {
    legalWrapper.classList.add('footer-legal');
    legalWrapper.querySelectorAll('a[href="#"]').forEach((a) => {
      a.addEventListener('click', (e) => e.preventDefault());
    });
    inner.append(legalWrapper);
  }

  block.append(inner);
}
