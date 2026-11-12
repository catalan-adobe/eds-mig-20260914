import { getLanguage } from '../../scripts/site.js';

// The label of the collapsed list when no section is in view, as the source script has it.
const TITLES = { 'ja-jp': '目次', 'zh-cn': '目录', 'zh-tw': '目錄' };
const mobile = window.matchMedia('(width <= 730px)');

/** Height of the header part that stays on screen: the utility bar, less its 1 px border. */
function stickyTop() {
  const root = getComputedStyle(document.documentElement);
  return Math.max(0, (parseFloat(root.getPropertyValue('--utility-height')) || 0) - 1);
}

// Below 1130 px the source script still measures its hidden utility bar (56.4 px, 58 px where
// the list collapses): its jumps and its mark of the section in view keep that distance.
const jumpTop = () => stickyTop() || (mobile.matches ? 58 : 56.4);

function element(tag, className, ...children) {
  const el = document.createElement(tag);
  el.className = className;
  el.append(...children);
  return el;
}

/** The id a link points to. Its href arrives percent-encoded from the pipeline. */
function targetId(link) {
  const id = link.getAttribute('href').slice(1);
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

/** The nav of the block: title, toggle of the collapsed list, list, optional button. */
function build(block, list, title) {
  list.querySelectorAll('a').forEach((a) => { a.dataset.text = a.textContent; });
  const button = [...block.querySelectorAll('a')].find((a) => !list.contains(a));
  const toggle = element('button', 'toc-toggle', element('span', 'toc-current', title));
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  const nav = element('nav', 'toc-nav', element('div', 'toc-inner', toggle, list));
  nav.setAttribute('aria-label', title);
  if (!block.classList.contains('bar')) nav.prepend(element('p', 'toc-title', title));
  if (button) {
    button.className = 'toc-button';
    if (button.origin !== window.location.origin) button.target = '_blank';
    list.after(button);
  }
  block.replaceChildren(nav);
  return { nav, toggle };
}

/**
 * Marks the link of the section in view, as the source does: the first section whose top lies
 * in the upper half of the window, below the offset of the last jump (its anchor is 1 px high).
 * No match keeps the mark.
 */
function markActive(links, offset) {
  const sections = [...document.querySelectorAll('main .section[id]')];
  if (window.scrollY === 0) links.forEach((a) => a.classList.remove('active'));
  const inView = sections.find((section) => {
    const top = section.getBoundingClientRect().top - offset;
    return top > -1 && top < window.innerHeight / 2;
  });
  if (inView) links.forEach((a) => a.classList.toggle('active', targetId(a) === inView.id));
  return links.find((a) => a.classList.contains('active'));
}

export default function decorate(block) {
  const list = block.querySelector('ul') ?? document.createElement('ul');
  const authored = list.previousElementSibling?.textContent.trim();
  const title = authored || TITLES[getLanguage()] || 'Table of Contents';
  const { nav, toggle } = build(block, list, title);
  const links = [...list.querySelectorAll('a[href^="#"]')];
  const wrapper = block.parentElement;
  const sticks = () => block.classList.contains('bar') || mobile.matches;
  let offset = jumpTop();

  const setOpen = (open) => {
    block.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  // as the source: the nav is fixed from the jump distance on, and its wrapper keeps 42 px
  const update = () => {
    if (!wrapper.offsetParent) return;
    block.classList.toggle('stuck', sticks() && wrapper.getBoundingClientRect().top <= jumpTop());
    const active = markActive(links, offset);
    toggle.firstElementChild.textContent = active ? active.textContent : title;
  };

  toggle.addEventListener('click', () => setOpen(!block.classList.contains('open')));
  list.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    const target = link && document.getElementById(targetId(link));
    if (!target) return;
    event.preventDefault();
    setOpen(false);
    offset = jumpTop() + (sticks() ? nav.clientHeight : 0);
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - offset,
      behavior: mobile.matches ? 'instant' : 'smooth',
    });
    window.history.replaceState(null, '', link.getAttribute('href'));
  });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  // also when the section appears: it has no place on the page before that
  new ResizeObserver(update).observe(wrapper);
}
