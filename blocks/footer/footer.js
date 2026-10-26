import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Footer document sections (in order): brand (logo link + blurb) · link columns (heading + list,
 * one section each) · social (heading + icon links) · legal (links + copyright).
 */

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function wrapperOf(section) {
  return section.querySelector('.default-content-wrapper') || section;
}

function buildBrand(section) {
  const wrapper = wrapperOf(section);
  const logo = wrapper.querySelector('a');
  logo.className = 'footer-logo';
  logo.title = 'Backlinko';
  const logoP = logo.closest('p');
  wrapper.append(logo);
  logoP.remove();
  return el('div', 'footer-col footer-brand', logo, el('div', 'footer-about', ...wrapper.children));
}

function buildLinks(section) {
  const wrapper = wrapperOf(section);
  const heading = wrapper.querySelector('h4, h3, h2');
  const list = wrapper.querySelector('ul');
  return el('div', 'footer-col footer-links-col', heading, el('nav', 'footer-links', list));
}

function buildSocial(section) {
  const wrapper = wrapperOf(section);
  const heading = wrapper.querySelector('h4, h3, h2');
  const list = wrapper.querySelector('ul');
  list.querySelectorAll('a').forEach((link) => {
    const label = [...link.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE);
    const name = label.map((node) => node.textContent).join('').replace(/\s+/g, ' ');
    link.title = name.replace(/^ | $/g, '');
    link.prepend(el('span', 'sr-only', ...label));
  });
  return el('div', 'footer-col footer-social', heading, list);
}

function buildLegal(section) {
  const wrapper = wrapperOf(section);
  const list = wrapper.querySelector('ul');
  const copy = wrapper.querySelector('p');
  copy.className = 'footer-copy';
  return el('div', 'footer-bottom', el('nav', 'footer-legal', list), copy);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  const sections = [...fragment.children];
  const legal = sections.pop();
  const social = sections.pop();
  const [brand, ...linkSections] = sections;

  const left = el(
    'div',
    'footer-col footer-left',
    el('div', 'footer-row', buildBrand(brand), ...linkSections.map(buildLinks)),
  );
  const main = el('div', 'footer-main', el('div', 'footer-row', left, buildSocial(social)));
  block.textContent = '';
  block.append(el('div', 'footer-container', main, buildLegal(legal)));
}
