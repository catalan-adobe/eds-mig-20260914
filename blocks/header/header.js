import { loadFragment } from '../fragment/fragment.js';

const SITE = '/f52-1011-02';
const SIGN_IN_FRAGMENT = `${SITE}/fragments/sign-in`;
const SCROLL_THRESHOLD = 15;
const FADE_OUT_MS = 200;
const isDesktop = window.matchMedia('(width >= 1025px)');

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([name, value]) => {
    if (name === 'class') node.className = value;
    else node.setAttribute(name, value);
  });
  node.append(...children);
  return node;
}

function icon(name) {
  return `${window.hlx.codeBasePath}/icons/${name}.svg`;
}

function pathOf(link) {
  return new URL(link.href, window.location.href).pathname.replace(/\/$/, '');
}

function countryOf(link) {
  const [, country] = pathOf(link).match(/\/([a-z]{2})\/[a-z]{2}$/) || [];
  return country;
}

function copyLink(link, current) {
  const copy = el('a', { href: link.getAttribute('href') }, link.textContent.trim());
  const path = pathOf(link);
  if (path === current) copy.setAttribute('aria-current', 'page');
  return copy;
}

/* utility bar */

function buildLanguageRow(item, root) {
  const links = [...item.querySelectorAll('a')];
  if (!links.length) return null;
  const name = (item.querySelector(':scope > p') || item.firstChild).textContent;
  const country = countryOf(links[0]);
  const row = el(
    'li',
    {},
    el('span', { class: 'header-lang-country' }, name.trim()),
    el('ul', {}, ...links.map((link) => el('li', {}, copyLink(link, root)))),
  );
  if (country) row.style.backgroundImage = `url("${icon(`flag-${country}`)}")`;
  return row;
}

/**
 * As on the source, a locale links to its copy of the current page when it has one and to
 * its root otherwise. Only the server knows which copies exist, so each one is probed.
 */
function linkToSamePage(panel, root) {
  const { pathname } = window.location;
  const below = pathname.replace(/\/$/, '').slice(root.length);
  if (!pathname.startsWith(root) || !below) return;
  panel.querySelectorAll('a').forEach(async (link) => {
    if (link.hasAttribute('aria-current')) {
      link.href = pathname;
      return;
    }
    const twin = `${pathOf(link)}${below}`;
    // GET, because the local dev server answers 502 to HEAD requests
    const response = await fetch(`${twin}.plain.html`).catch(() => null);
    if (response && response.ok) link.href = twin;
  });
}

function buildLanguage(list, root) {
  const rows = [...list.children].map((item) => buildLanguageRow(item, root)).filter(Boolean);
  const current = list.querySelector(`a[href="${root}"]`);
  const label = current ? current.textContent.trim() : 'Language';
  const country = current && countryOf(current);

  const toggle = el('button', {
    class: 'header-lang-toggle',
    type: 'button',
    'aria-expanded': 'false',
    'aria-controls': 'header-lang-panel',
    'aria-label': `Toggle Language ${label}`,
  }, label);
  if (country) toggle.style.backgroundImage = `url("${icon(`flag-${country}`)}")`;
  const panel = el('nav', {
    class: 'header-lang-panel',
    id: 'header-lang-panel',
    'aria-label': 'Language',
  }, el('ul', {}, ...rows));

  // as on the source: any click that is not on the toggle closes the panel
  document.addEventListener('click', (e) => {
    const open = e.target === toggle && toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggle.setAttribute('aria-expanded', 'false');
  });
  linkToSamePage(panel, root);

  return el('div', { class: 'header-lang' }, el('div', { class: 'header-lang-anchor' }, toggle, panel));
}

/* sign-in dialog */

function buildSignInForm(content) {
  const [username, password] = [...content.querySelectorAll('li')].map((item, i) => {
    const label = item.textContent.trim();
    return el('input', {
      type: i === 1 ? 'password' : 'text',
      name: i === 1 ? 'password' : 'username',
      placeholder: label,
      'aria-label': label,
    });
  });
  const submit = content.querySelector('p > strong:only-child');
  const form = el('form', { novalidate: '' });
  if (username) form.append(username);
  if (password) form.append(password);
  content.querySelectorAll('p').forEach((p) => {
    if (!submit || p !== submit.parentElement) form.append(p);
  });
  if (submit) form.append(el('button', { type: 'submit' }, submit.textContent.trim()));

  // nothing is sent: the source answers every login with its "invalid login" state
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.querySelectorAll('input').forEach((input) => input.classList.add('error'));
  });
  return form;
}

async function buildSignInDialog() {
  const fragment = await loadFragment(SIGN_IN_FRAGMENT);
  if (!fragment) throw new Error(`header: sign-in fragment not found at ${SIGN_IN_FRAGMENT}`);
  const content = fragment.querySelector('.default-content-wrapper') || fragment;
  const headings = [...content.querySelectorAll('h1, h2, h3')];
  headings.forEach((heading) => heading.removeAttribute('id'));
  const title = headings[0] ? headings[0].textContent.trim() : 'Sign In';
  return el(
    'div',
    {
      class: 'header-modal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': title,
    },
    el('div', { class: 'header-modal-panel' }, ...headings, buildSignInForm(content), el('hr')),
  );
}

function initSignIn(block, trigger) {
  let dialog = null;
  let opening = false;

  const close = () => {
    if (!dialog) return;
    const closing = dialog;
    dialog = null;
    closing.classList.remove('open');
    setTimeout(() => closing.remove(), FADE_OUT_MS);
    trigger.focus();
  };

  const open = async () => {
    if (dialog || opening) return;
    opening = true;
    try {
      dialog = await buildSignInDialog();
    } finally {
      opening = false;
    }
    block.append(dialog);
    // force a style flush so that the fade-in transition runs
    dialog.getBoundingClientRect();
    dialog.classList.add('open');
  };

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    if (!dialog) open();
  });
  document.addEventListener('click', (e) => {
    if (dialog && !dialog.contains(e.target)) {
      e.preventDefault();
      close();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function buildUtility(tools, root, block) {
  const list = tools && tools.querySelector('ul');
  const links = tools ? [...tools.querySelectorAll('a')].filter((a) => !list || !list.contains(a)) : [];
  const signIn = links.find((a) => a.getAttribute('href') === '#sign-in');
  const search = links.find((a) => a !== signIn);

  const inner = el('div', { class: 'header-utility-inner' });
  const signInCell = el('div', { class: 'header-sign-in' });
  if (signIn) {
    const trigger = el('a', { href: '#sign-in' }, signIn.textContent.trim());
    signInCell.append(trigger);
    initSignIn(block, trigger);
  }
  inner.append(signInCell);
  if (list) inner.append(buildLanguage(list, root));
  return { utility: el('div', { class: 'header-utility' }, inner), search };
}

/* main bar */

function isActive(link) {
  const path = pathOf(link);
  const current = window.location.pathname.replace(/\/$/, '');
  return current === path || current.startsWith(`${path}/`);
}

function buildNavItem(link, markActive) {
  const current = window.location.pathname.replace(/\/$/, '');
  const copy = copyLink(link, current);
  if (markActive && isActive(link)) copy.classList.add('active');
  return el('li', {}, copy);
}

function buildMain(brand, sections, search, root) {
  const brandLink = brand && brand.querySelector('a');
  const logo = el('img', {
    src: icon('wknd-logo-dk'),
    alt: 'WKND Logo',
    width: '128',
    height: '48',
  });
  const logoLink = el('a', { href: brandLink ? brandLink.getAttribute('href') : root }, logo);

  // the top item ("Home") is not shown in the desktop navigation
  const nested = sections ? [...sections.querySelectorAll('li li a')] : [];
  const nav = el(
    'nav',
    { class: 'header-nav', 'aria-label': 'Main' },
    el('ul', {}, ...nested.map((link) => buildNavItem(link, true))),
  );

  const inner = el(
    'div',
    { class: 'header-main-inner' },
    el('div', { class: 'header-logo' }, logoLink),
    nav,
  );
  if (search) {
    const label = search.textContent.trim();
    inner.append(el('a', {
      class: 'header-search',
      href: search.getAttribute('href'),
      'aria-label': label,
      title: label,
    }));
  }
  return el('div', { class: 'header-main' }, inner);
}

/* mobile menu */

function buildMobileMenu(sections) {
  const links = sections ? [...sections.querySelectorAll('li a')] : [];
  const panel = el(
    'div',
    { class: 'header-mobile-nav', id: 'header-mobile-nav' },
    el('nav', { 'aria-label': 'Mobile' }, el('ul', {}, ...links.map((link) => buildNavItem(link, false)))),
  );
  const button = el('button', {
    class: 'header-menu-toggle',
    type: 'button',
    'aria-controls': 'header-mobile-nav',
    'aria-expanded': 'false',
    'aria-label': 'Open navigation',
  });

  const setOpen = (open) => {
    document.body.classList.toggle('nav-open', open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  };
  const isOpen = () => document.body.classList.contains('nav-open');

  button.addEventListener('click', () => setOpen(!isOpen()));
  // a click on a link of the panel or anywhere outside the panel closes it
  document.addEventListener('click', (e) => {
    if (!isOpen() || button.contains(e.target)) return;
    if (!panel.contains(e.target) || e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      button.focus();
    }
  });
  isDesktop.addEventListener('change', () => setOpen(false));

  return { panel, button };
}

function watchScroll(block) {
  const update = () => block.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  document.addEventListener('scroll', update, { passive: true });
  update();
}

/**
 * Loads the navigation document of the current locale and builds the header: utility bar
 * (sign in, language switcher), main bar (logo, navigation, search) and the mobile menu.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const [root] = window.location.pathname.match(/^\/f52-1011-02\/[a-z]{2}\/[a-z]{2}/)
    || [`${SITE}/us/en`];
  const fragment = await loadFragment(`${root}/nav`);
  if (!fragment) throw new Error(`header: navigation not found at ${root}/nav`);
  const [brand, sections, tools] = fragment.children;

  const { utility, search } = buildUtility(tools, root, block);
  const { panel, button } = buildMobileMenu(sections);
  const bars = el('div', { class: 'header-bars' }, utility, buildMain(brand, sections, search, root));

  block.replaceChildren(bars, button, panel);
  watchScroll(block);
}
