import { loadFragment } from '../fragment/fragment.js';

const GLYPHS = ['facebook', 'twitter', 'instagram'];

function el(tag, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  return element;
}

function buildLogo(link) {
  const logo = el('div', 'footer-logo');
  if (!link) return logo;
  const a = el('a');
  a.href = link.getAttribute('href');
  const img = el('img');
  img.src = `${window.hlx.codeBasePath}/icons/wknd-logo-light.svg`;
  img.alt = 'WKND Logo';
  img.width = 128;
  img.height = 48;
  img.loading = 'lazy';
  a.append(img);
  logo.append(a);
  return logo;
}

function buildNav(list) {
  const nav = el('nav', 'footer-nav');
  nav.setAttribute('aria-label', 'Footer navigation');
  const links = list ? [...list.querySelectorAll(':scope > li ul a')] : [];
  if (!links.length) return nav;
  const current = window.location.pathname.replace(/\/$/, '');
  const ul = el('ul');
  links.forEach((link) => {
    const li = el('li');
    const path = new URL(link.href, window.location.href).pathname.replace(/\/$/, '');
    if (current === path) link.setAttribute('aria-current', 'page');
    if (current === path || current.startsWith(`${path}/`)) link.classList.add('active');
    li.append(link);
    ul.append(li);
  });
  nav.append(ul);
  return nav;
}

function buildSocial(list) {
  const social = el('div', 'footer-social');
  if (!list) return social;
  const ul = el('ul');
  list.querySelectorAll('a').forEach((link) => {
    const name = link.textContent.trim().toLowerCase();
    if (GLYPHS.includes(name)) link.classList.add(`footer-social-${name}`);
    link.setAttribute('aria-label', link.title || link.textContent.trim());
    link.removeAttribute('title');
    const li = el('li');
    li.append(link);
    ul.append(li);
  });
  social.append(ul);
  return social;
}

/**
 * Loads the footer of the current locale and builds logo, nav, social buttons and legal text.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const [root] = window.location.pathname.match(/^\/f52-1011-02\/[a-z]{2}\/[a-z]{2}/)
    || ['/f52-1011-02/us/en'];
  const fragment = await loadFragment(`${root}/footer`);
  block.textContent = '';
  if (!fragment) return;

  const content = fragment.querySelector('.default-content-wrapper') || fragment;
  const items = [...content.children];
  const heading = items.find((item) => /^H[1-6]$/.test(item.tagName));
  const headingIndex = heading ? items.indexOf(heading) : items.length;
  const isList = (item) => item.tagName === 'UL';
  const navList = items.slice(0, headingIndex).find(isList);
  const socialList = items.slice(headingIndex + 1).find(isList);
  const logoLink = items.slice(0, headingIndex)
    .find((item) => item.tagName === 'P' && item.querySelector('a'))?.querySelector('a');
  const lastStructural = [socialList, heading, navList].find(Boolean);
  const legalItems = lastStructural ? items.slice(items.indexOf(lastStructural) + 1) : [];

  const title = el('div', 'footer-title');
  if (heading) title.append(heading);
  const legal = el('div', 'footer-legal');
  legal.append(...legalItems);

  const grid = el('div', 'footer-grid');
  grid.append(buildLogo(logoLink), buildNav(navList), title, buildSocial(socialList), legal);
  block.append(grid);
}
