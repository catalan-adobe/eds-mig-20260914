import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — WKND chrome: a fixed utility bar (account links + language menu) over the
 * masthead (logo, primary nav, site search) that morphs on scroll (body.scrolly), plus
 * the off-canvas mobile panel and its toggle below 1025px.
 *
 * /nav document, three sections (default content only):
 *   1. brand    — <p><a href="/us/en"><img alt="WKND Logo"></a></p>
 *   2. sections — <ul> of the primary nav links, Home first
 *   3. tools    — <p>Welcome</p> <p><a>Sign In</a></p> <p><a>Sign Out</a></p>
 *                 <p><a>en-US</a></p> (language toggle) and a <ul> of countries, each
 *                 holding a <ul> of locale links
 *
 * Every authored node is MOVED into the template (EW1); the search form is chrome (DF-11).
 * The primary <ul> lives in the masthead on desktop and in the mobile panel below 1025px —
 * one element, re-placed on the breakpoint change, never cloned.
 */

const isDesktop = window.matchMedia('(min-width: 1025px)');
const PANEL_CLASS = 'nav-panel-visible';

const TEMPLATE = `
  <div class="utility-bar">
    <div class="utility-bar-inner">
      <div class="utility-account">
        <div class="account-links">
          <div class="account-greeting"></div>
          <div class="account-sign-in"></div>
          <div class="account-sign-out"></div>
        </div>
      </div>
      <div class="language-nav">
        <div class="language-toggle"></div>
        <nav class="language-menu" aria-label="Language"></nav>
      </div>
    </div>
  </div>
  <div class="masthead">
    <div class="masthead-inner">
      <div class="logo"></div>
      <nav class="primary-nav" aria-label="Primary"></nav>
      <div class="site-search" role="search">
        <form class="site-search-form">
          <div class="site-search-field">
            <i class="site-search-icon"></i>
            <input class="site-search-input" type="text" name="fulltext" placeholder="Search"
              role="combobox" aria-autocomplete="list" aria-haspopup="true" aria-expanded="false"
              aria-controls="site-search-results">
            <button class="site-search-clear" aria-label="Clear" type="button">
              <i class="site-search-clear-icon"></i>
            </button>
          </div>
        </form>
        <div class="site-search-results" id="site-search-results" role="listbox"
          aria-label="Search results"></div>
      </div>
    </div>
  </div>
  <div class="nav-toggle">
    <button type="button" aria-controls="mobile-nav" aria-expanded="false"
      aria-label="Open hidden mobile navigation">
      <span class="glyph glyph-menu" aria-hidden="true"></span>
    </button>
  </div>
  <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile"></nav>
`;

function localePath(href) {
  try {
    return new URL(href, window.location.href).pathname.replace(/\.html$/, '');
  } catch (e) {
    return '';
  }
}

/* utility bar: greeting, sign-in, sign-out paragraphs by authored order */
function slotAccount(tools, root) {
  const ps = [...tools.querySelectorAll('p')];
  const toggleIndex = ps.findIndex((p) => p.querySelector('a') && !p.querySelector('img')
    && /^[a-z]{2}-[A-Z]{2}$/.test(p.textContent.trim()));
  const account = ps.slice(0, toggleIndex < 0 ? ps.length : toggleIndex);
  ['greeting', 'sign-in', 'sign-out'].forEach((name, i) => {
    if (account[i]) root.querySelector(`.account-${name}`).append(account[i]);
  });
  return toggleIndex < 0 ? null : ps[toggleIndex];
}

/* language menu: the toggle paragraph, the country list, the active locale, the flag */
function slotLanguage(tools, root, togglePara) {
  const toggleSlot = root.querySelector('.language-toggle');
  const menu = root.querySelector('.language-menu');
  if (togglePara) toggleSlot.append(togglePara);
  const list = tools.querySelector('ul');
  if (list) menu.append(list);
  const toggle = toggleSlot.querySelector('a');
  if (!toggle || !list) return;

  const current = toggle.textContent.trim();
  const active = [...list.querySelectorAll('li li')]
    .find((li) => li.textContent.trim() === current);
  if (active) {
    active.classList.add('is-active');
    const [, country] = localePath(active.querySelector('a').href).split('/');
    if (country) {
      toggleSlot.style.setProperty('--flag', `url('/blocks/header/flags/${country}.svg')`);
    }
  }

  const close = () => {
    menu.classList.remove('show-menu');
    toggleSlot.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    menu.style.left = `${toggle.offsetLeft - 240}px`;
    const open = menu.classList.toggle('show-menu');
    toggleSlot.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  window.addEventListener('click', (e) => {
    if (e.target !== toggle && toggleSlot.classList.contains('open')) close();
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && toggleSlot.classList.contains('open')) close();
  });
}

/* the primary list sits in the masthead on desktop, in the off-canvas panel below */
function placeNav(list, root) {
  const target = root.querySelector(isDesktop.matches ? '.primary-nav' : '.mobile-nav');
  if (list.parentElement !== target) target.append(list);
}

function wireMobilePanel(root) {
  const button = root.querySelector('.nav-toggle button');
  const panel = root.querySelector('.mobile-nav');
  const setOpen = (open) => {
    document.body.classList.toggle(PANEL_CLASS, open);
    button.setAttribute('aria-expanded', String(open));
    const label = open ? 'Close mobile navigation' : 'Open hidden mobile navigation';
    button.setAttribute('aria-label', label);
  };
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!document.body.classList.contains(PANEL_CLASS));
  });
  document.addEventListener('click', (e) => {
    if (document.body.classList.contains(PANEL_CLASS) && !panel.contains(e.target)
      && !button.contains(e.target)) setOpen(false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && document.body.classList.contains(PANEL_CLASS)) {
      setOpen(false);
      button.focus();
    }
  });
  return setOpen;
}

function wireSearch(root) {
  const field = root.querySelector('.site-search-field');
  const input = field.querySelector('input');
  const clear = field.querySelector('.site-search-clear');
  input.addEventListener('input', () => {
    field.classList.toggle('has-value', input.value.length > 0);
  });
  clear.addEventListener('click', () => {
    input.value = '';
    field.classList.remove('has-value');
    input.focus();
  });
}

function wireScroll() {
  const update = () => document.body.classList.toggle('scrolly', window.scrollY > 15);
  update();
  document.addEventListener('scroll', update, { passive: true });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const root = document.createElement('div');
  root.className = 'site-header';
  root.innerHTML = TEMPLATE;

  const [brand, sections, tools] = [...fragment.children];

  const brandLink = brand ? brand.querySelector('a') : null;
  const homePath = brandLink ? localePath(brandLink.href) : '';
  const brandPara = brand ? brand.querySelector('p, picture, img') : null;
  if (brandPara) root.querySelector('.logo').append(brandPara.closest('p') || brandPara);

  const list = sections ? sections.querySelector('ul') : null;
  if (list) {
    [...list.querySelectorAll('li')].forEach((li) => {
      const a = li.querySelector('a');
      if (a && homePath && localePath(a.href) === homePath) li.classList.add('is-home');
    });
    placeNav(list, root);
  }

  if (tools) {
    const togglePara = slotAccount(tools, root);
    slotLanguage(tools, root, togglePara);
  }

  const setOpen = wireMobilePanel(root);
  isDesktop.addEventListener('change', () => {
    if (list) placeNav(list, root);
    setOpen(false);
  });
  wireSearch(root);
  wireScroll();

  block.replaceChildren(root);
}
