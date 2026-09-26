import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const DESKTOP = window.matchMedia('(min-width: 1130px)');
const SEARCH_URL = 'https://www.synopsys.com/search.html?q=';
const ASK_URL = 'https://www.synopsys.com/?q=';

const iconCache = new Map();

/**
 * Fetches an icon from /icons and returns it as an inline <svg> element so its
 * fill can be controlled with currentColor from block CSS.
 * @param {string} name icon file name without extension
 * @returns {Promise<SVGElement|null>}
 */
async function inlineIcon(name) {
  if (!iconCache.has(name)) {
    iconCache.set(name, fetch(`/icons/${name}.svg`).then((r) => (r.ok ? r.text() : '')).catch(() => ''));
  }
  const markup = await iconCache.get(name);
  if (!markup) return null;
  const span = document.createElement('span');
  span.className = `header-icon header-icon-${name}`;
  span.innerHTML = markup;
  return span;
}

function textOf(el) {
  return el ? el.textContent.trim() : '';
}

/**
 * Parses the "menus" section (h3 = top-level item, h4 = column heading,
 * ul = link list, p = image or description) into a data structure.
 * @param {Element} section default-content-wrapper of the menus section
 */
function parseMenus(section) {
  const wrap = section?.querySelector(':scope > div');
  if (!wrap) return [];
  const items = [];
  let current = null;
  let col = null;
  [...wrap.children].forEach((el) => {
    if (el.tagName === 'H3') {
      const a = el.querySelector('a');
      current = {
        label: textOf(el), href: a ? a.getAttribute('href') : '#', cols: [],
      };
      items.push(current);
      col = null;
    } else if (el.tagName === 'H4' && current) {
      const a = el.querySelector('a');
      col = {
        heading: textOf(el), href: a ? a.getAttribute('href') : null, items: [], media: null, desc: null,
      };
      current.cols.push(col);
    } else if (el.tagName === 'UL' && col) {
      col.items = [...el.querySelectorAll(':scope > li')].map((li) => {
        const a = li.querySelector('a');
        return { label: textOf(li), href: a ? a.getAttribute('href') : '#' };
      });
    } else if (el.tagName === 'P' && col) {
      const img = el.querySelector('img');
      if (img) col.media = { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' };
      else col.desc = textOf(el);
    }
  });
  return items;
}

function parseUtility(section) {
  const wrap = section?.querySelector(':scope > div');
  const links = wrap ? [...wrap.querySelectorAll(':scope > p > a')] : [];
  const langs = wrap ? [...wrap.querySelectorAll(':scope > ul > li')].map((li) => ({
    label: textOf(li),
    href: li.querySelector('a')?.getAttribute('href') || '#',
  })) : [];
  return {
    brandHref: links[0]?.getAttribute('href') || 'https://www.synopsys.com',
    ansysHref: links[1]?.getAttribute('href') || 'https://ansys.synopsys.com',
    langs,
  };
}

function parseBrand(section) {
  const a = section?.querySelector(':scope > div > p > a');
  return { href: a ? a.getAttribute('href') : 'https://www.synopsys.com', label: textOf(a) || 'Synopsys' };
}

function parseTools(section) {
  const wrap = section?.querySelector(':scope > div');
  const ps = wrap ? [...wrap.querySelectorAll(':scope > p')] : [];
  const contact = ps[0]?.querySelector('a');
  const ansys = ps[1]?.querySelector('a');
  return {
    contactHref: contact ? contact.getAttribute('href') : '#',
    contactLabel: textOf(contact) || 'Contact Sales',
    ansysHref: ansys ? ansys.getAttribute('href') : 'https://ansys.synopsys.com',
    promoText: textOf(ps[2]),
  };
}

function parseChat(section) {
  const wrap = section?.querySelector(':scope > div');
  const p = wrap?.querySelector(':scope > p');
  return { placeholder: textOf(p) || 'Ask a question to get instant answers about our tools and solutions.' };
}

/** Builds one mega-menu column. */
function buildMegaCol(col) {
  const colEl = document.createElement('div');
  colEl.className = 'header-mega-col';
  if (col.media) colEl.classList.add('header-mega-col-promo');
  const headingTag = col.href ? 'a' : 'span';
  const heading = document.createElement(headingTag);
  heading.className = 'header-mega-col-heading';
  heading.textContent = col.heading;
  if (col.href) heading.setAttribute('href', col.href);
  colEl.append(heading);
  if (col.media) {
    const link = document.createElement('a');
    link.href = col.href || '#';
    link.className = 'header-mega-col-media';
    const img = document.createElement('img');
    img.src = col.media.src;
    img.alt = col.media.alt;
    img.loading = 'lazy';
    link.append(img);
    colEl.append(link);
  }
  if (col.desc) {
    const p = document.createElement('p');
    p.className = 'header-mega-col-desc';
    p.textContent = col.desc;
    colEl.append(p);
  }
  if (col.items.length) {
    const ul = document.createElement('ul');
    col.items.forEach(({ label, href }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      li.append(a);
      ul.append(li);
    });
    colEl.append(ul);
  }
  return colEl;
}

const COL_VARIANT = { 2: 'two-col', 3: 'three-col', 5: 'five-col' };

function buildMegaPanel(item) {
  const panel = document.createElement('div');
  panel.className = 'header-mega';
  panel.dataset.menu = item.label;
  panel.id = `mega-${item.label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  panel.hidden = true;
  const inner = document.createElement('div');
  inner.className = `header-mega-inner ${COL_VARIANT[item.cols.length] || ''}`;
  item.cols.forEach((col) => inner.append(buildMegaCol(col)));
  panel.append(inner);
  return panel;
}

function buildLanguageDropdown(langs) {
  const wrap = document.createElement('div');
  wrap.className = 'header-lang';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'header-lang-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-haspopup', 'true');
  const label = document.createElement('span');
  [label.textContent] = langs.length ? [langs[0].label] : ['English'];
  toggle.append(label);
  wrap.append(toggle);
  const menu = document.createElement('ul');
  menu.className = 'header-lang-menu';
  menu.hidden = true;
  const title = document.createElement('li');
  title.className = 'header-lang-title';
  title.textContent = 'Language';
  menu.append(title);
  langs.forEach(({ label: l, href }, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = l;
    if (i === 0) li.className = 'active';
    li.append(a);
    menu.append(li);
  });
  wrap.append(menu);
  inlineIcon('globe').then((icon) => icon && toggle.prepend(icon));
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    menu.hidden = open;
  });
  document.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  });
  return wrap;
}

function buildUtilityBar(utility) {
  const bar = document.createElement('div');
  bar.className = 'header-utility';
  const left = document.createElement('div');
  left.className = 'header-utility-left';
  const synLink = document.createElement('a');
  synLink.href = utility.brandHref;
  synLink.title = 'Synopsys';
  synLink.setAttribute('aria-label', 'Synopsys');
  const ansysLink = document.createElement('a');
  ansysLink.href = utility.ansysHref;
  ansysLink.title = 'Ansys';
  ansysLink.setAttribute('aria-label', 'Ansys');
  inlineIcon('synopsys-logo').then((icon) => icon && synLink.append(icon));
  inlineIcon('ansys-logo').then((icon) => icon && ansysLink.append(icon));
  const divider = document.createElement('span');
  divider.className = 'header-utility-divider';
  left.append(synLink, divider, ansysLink);

  const right = document.createElement('div');
  right.className = 'header-utility-right';
  right.append(buildLanguageDropdown(utility.langs));
  const ask = document.createElement('button');
  ask.type = 'button';
  ask.id = 'header-ask';
  ask.className = 'header-ask';
  const askLabel = document.createElement('span');
  askLabel.textContent = 'Ask';
  inlineIcon('sparkle').then((icon) => icon && askLabel.prepend(icon));
  ask.append(askLabel);
  right.append(ask);

  bar.append(left, right);
  return bar;
}

function buildMobileMenu(brand, menus, tools) {
  const mobile = document.createElement('div');
  mobile.className = 'header-mobile-menu';
  mobile.hidden = true;
  const search = document.createElement('form');
  search.className = 'header-mobile-search';
  search.action = 'https://www.synopsys.com/search.html';
  search.method = 'get';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.name = 'q';
  searchInput.placeholder = 'Search Synopsys.com';
  search.append(searchInput);
  mobile.append(search);
  const list = document.createElement('ul');
  list.className = 'header-mobile-list';
  menus.forEach((item) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'header-mobile-item';
    btn.textContent = item.label;
    btn.dataset.menu = item.label;
    li.append(btn);
    const sub = document.createElement('div');
    sub.className = 'header-mobile-sub';
    sub.hidden = true;
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'header-mobile-back';
    back.textContent = `← ${item.label}`;
    sub.append(back);
    item.cols.forEach((col) => sub.append(buildMegaCol(col)));
    li.append(sub);
    list.append(li);
  });
  mobile.append(list);

  const ctaHolder = document.createElement('div');
  ctaHolder.className = 'header-mobile-cta';
  const cta = document.createElement('a');
  cta.href = tools.contactHref;
  cta.className = 'header-mobile-contact';
  cta.textContent = tools.contactLabel;
  ctaHolder.append(cta);
  const promo = document.createElement('a');
  promo.href = tools.ansysHref;
  promo.target = '_blank';
  promo.rel = 'noopener noreferrer';
  promo.className = 'header-mobile-promo';
  const promoLogo = document.createElement('span');
  promoLogo.className = 'header-mobile-promo-logo';
  inlineIcon('ansys-logo').then((icon) => icon && promoLogo.append(icon));
  const promoText = document.createElement('p');
  promoText.textContent = tools.promoText;
  promo.append(promoLogo, promoText);
  ctaHolder.append(promo);
  mobile.append(ctaHolder);

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.header-mobile-item');
    if (!btn) return;
    const sub = btn.parentElement.querySelector('.header-mobile-sub');
    sub.hidden = false;
    mobile.classList.add('drilled');
  });
  mobile.addEventListener('click', (e) => {
    if (e.target.closest('.header-mobile-back')) {
      e.target.closest('.header-mobile-sub').hidden = true;
      mobile.classList.remove('drilled');
    }
  });
  return mobile;
}

function buildSearchPanel() {
  const panel = document.createElement('div');
  panel.className = 'header-search-panel';
  panel.hidden = true;
  const form = document.createElement('form');
  form.action = 'https://www.synopsys.com/search.html';
  form.method = 'get';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = 'Search Synopsys.com';
  input.autocomplete = 'off';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'header-search-submit';
  submit.textContent = 'Search';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'header-search-close';
  close.setAttribute('aria-label', 'Close search');
  close.textContent = '×';
  form.append(input, submit);
  panel.append(form, close);
  close.addEventListener('click', () => { panel.hidden = true; });
  form.addEventListener('submit', () => {
    if (!input.value.trim()) return;
    form.action = SEARCH_URL.replace(/\?q=$/, '');
  });
  return panel;
}

function buildChatBar(chat) {
  const bar = document.createElement('div');
  bar.id = 'chat-bar';
  bar.className = 'chat-bar';
  const inner = document.createElement('div');
  inner.className = 'chat-bar-inner';
  const left = document.createElement('span');
  left.className = 'chat-bar-left';
  inlineIcon('sparkle').then((icon) => icon && left.append(icon));
  const wrap = document.createElement('div');
  wrap.className = 'chat-bar-input-wrap';
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'chat-bar-input';
  input.placeholder = chat.placeholder;
  input.autocomplete = 'off';
  const send = document.createElement('button');
  send.id = 'chat-bar-send';
  send.type = 'button';
  send.title = 'Send';
  wrap.append(input, send);
  inner.append(left, wrap);
  const minimize = document.createElement('button');
  minimize.id = 'chat-minimize';
  minimize.title = 'Minimize';
  minimize.textContent = '×';
  bar.append(inner, minimize);

  const floating = document.createElement('button');
  floating.id = 'floating-icon';
  floating.className = 'header-floating-icon';
  inlineIcon('sparkle').then((icon) => icon && floating.prepend(icon));
  const floatingLabel = document.createElement('span');
  floatingLabel.textContent = 'Ask a Question';
  floating.append(floatingLabel);

  const submitChat = () => {
    const q = input.value.trim();
    if (!q) return;
    window.location.href = `${ASK_URL}${encodeURIComponent(q)}`;
  };
  send.addEventListener('click', submitChat);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitChat(); });
  minimize.addEventListener('click', () => bar.classList.add('bc-hidden'));
  floating.addEventListener('click', () => bar.classList.toggle('mobile-open'));

  return { bar, floating };
}

/**
 * Toggles the transparent-over-hero vs. sticky/opaque header state based on
 * scroll position, mirroring the site's 80px threshold.
 * @param {Element} navBar the nav bar element
 */
function initStickyNav(navBar) {
  const onScroll = () => {
    navBar.classList.toggle('is-sticky', window.scrollY > 80 || document.documentElement.scrollTop > 80);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initDesktopMegaMenus(navBar, navItems, megaWrap) {
  let closeTimer;
  const closeAll = () => {
    navItems.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
    megaWrap.querySelectorAll('.header-mega').forEach((p) => { p.hidden = true; });
    megaWrap.hidden = true;
  };
  const open = (btn) => {
    clearTimeout(closeTimer);
    if (!DESKTOP.matches) return;
    closeAll();
    btn.setAttribute('aria-expanded', 'true');
    const panel = megaWrap.querySelector(`[data-menu="${CSS.escape(btn.dataset.menu)}"]`);
    if (panel) {
      panel.hidden = false;
      megaWrap.hidden = false;
    }
  };
  navItems.forEach((btn) => {
    btn.addEventListener('mouseenter', () => open(btn));
    btn.addEventListener('focus', () => open(btn));
    btn.addEventListener('click', (e) => {
      if (DESKTOP.matches) e.preventDefault();
    });
  });
  navBar.addEventListener('mouseleave', () => {
    if (DESKTOP.matches) closeTimer = setTimeout(closeAll, 150);
  });
  megaWrap.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  megaWrap.addEventListener('mouseleave', () => {
    if (DESKTOP.matches) closeTimer = setTimeout(closeAll, 150);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
  DESKTOP.addEventListener('change', closeAll);
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const sections = [...fragment.children];
  const utility = parseUtility(sections[0]);
  const brand = parseBrand(sections[1]);
  const menus = parseMenus(sections[2]);
  const tools = parseTools(sections[3]);
  const chat = parseChat(sections[4]);

  block.textContent = '';

  block.append(buildUtilityBar(utility));

  const navBar = document.createElement('div');
  navBar.className = 'header-nav';

  const brandLink = document.createElement('a');
  brandLink.href = brand.href;
  brandLink.className = 'header-logo';
  brandLink.setAttribute('aria-label', brand.label);
  inlineIcon('synopsys-logo').then((icon) => icon && brandLink.append(icon));

  const navItemsWrap = document.createElement('ul');
  navItemsWrap.className = 'header-nav-items';
  const navItems = menus.map((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    a.className = 'header-nav-item';
    a.textContent = item.label;
    a.dataset.menu = item.label;
    a.setAttribute('aria-expanded', 'false');
    a.setAttribute('aria-haspopup', 'true');
    li.append(a);
    navItemsWrap.append(li);
    return a;
  });

  const toolsWrap = document.createElement('div');
  toolsWrap.className = 'header-tools';
  const searchBtn = document.createElement('button');
  searchBtn.type = 'button';
  searchBtn.className = 'header-search-btn';
  searchBtn.setAttribute('aria-label', 'Search Synopsys.com');
  inlineIcon('search').then((icon) => icon && searchBtn.append(icon));
  const contactLink = document.createElement('a');
  contactLink.href = tools.contactHref;
  contactLink.className = 'header-contact';
  contactLink.textContent = tools.contactLabel;
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'header-hamburger';
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  const searchPanel = buildSearchPanel();
  toolsWrap.append(searchBtn, contactLink, hamburger);

  const megaWrap = document.createElement('div');
  megaWrap.className = 'header-mega-wrap';
  megaWrap.hidden = true;
  menus.forEach((item) => megaWrap.append(buildMegaPanel(item)));

  navBar.append(brandLink, navItemsWrap, toolsWrap, searchPanel, megaWrap);

  const mobileMenu = buildMobileMenu(brand, menus, tools);

  block.append(navBar, mobileMenu);

  const { bar: chatBar, floating } = buildChatBar(chat);
  block.append(chatBar, floating);

  initStickyNav(navBar);
  initDesktopMegaMenus(navBar, navItems, megaWrap);

  searchBtn.addEventListener('click', () => {
    searchPanel.hidden = !searchPanel.hidden;
    if (!searchPanel.hidden) searchPanel.querySelector('input').focus();
  });

  document.getElementById('header-ask')?.addEventListener('click', () => {
    chatBar.classList.remove('bc-hidden');
    chatBar.scrollIntoView({ block: 'center', behavior: 'smooth' });
    chatBar.querySelector('#chat-bar-input')?.focus();
  });

  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    mobileMenu.hidden = expanded;
    document.body.style.overflowY = expanded ? '' : 'hidden';
  });

  DESKTOP.addEventListener('change', (e) => {
    if (e.matches) {
      mobileMenu.hidden = true;
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflowY = '';
    }
  });
}
