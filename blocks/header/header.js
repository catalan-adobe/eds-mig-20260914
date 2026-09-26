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
 * Splits a "Title \u2014 Subtitle" list-item label into its two parts, mirroring
 * the site's two-line nav items (bold title + grey description).
 * @param {string} label full item text
 * @returns {{title: string, subtitle: string|null}}
 */
function splitItemLabel(label) {
  const idx = label.indexOf(' \u2014 ');
  if (idx === -1) return { title: label, subtitle: null };
  return { title: label.slice(0, idx), subtitle: label.slice(idx + 3) };
}

/**
 * A <p> made of nothing but a single link is authored as a trailing CTA
 * ("View all X", "Learn more", "Download eBook") rather than descriptive text.
 * @param {Element} p paragraph element
 */
function linkOnlyPara(p) {
  const a = p.querySelector(':scope > a');
  return a && a.textContent.trim() === p.textContent.trim() ? a : null;
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
      const icon = el.querySelector('img');
      col = {
        heading: textOf(el),
        href: a ? a.getAttribute('href') : null,
        icon: icon ? icon.getAttribute('src') : null,
        items: [],
        media: null,
        desc: null,
        cta: null,
      };
      current.cols.push(col);
    } else if (el.tagName === 'UL' && col) {
      col.items = [...el.querySelectorAll(':scope > li')].map((li) => {
        const a = li.querySelector('a');
        const icon = li.querySelector('img');
        return {
          ...splitItemLabel(a ? a.textContent.trim() : textOf(li)),
          href: a ? a.getAttribute('href') : '#',
          icon: icon ? icon.getAttribute('src') : null,
        };
      });
    } else if (el.tagName === 'P' && col) {
      const img = el.querySelector('img');
      const link = linkOnlyPara(el);
      if (img) col.media = { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' };
      else if (link) col.cta = { label: link.textContent.trim(), href: link.getAttribute('href') };
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
  if (col.icon) {
    const icon = document.createElement('img');
    icon.src = col.icon;
    icon.alt = '';
    icon.loading = 'lazy';
    icon.className = 'header-mega-col-icon';
    heading.append(icon);
  }
  heading.append(document.createTextNode(col.heading));
  if (col.href) heading.setAttribute('href', col.href);

  const media = col.media && (() => {
    const link = document.createElement('a');
    link.href = col.href || '#';
    link.className = 'header-mega-col-media';
    const img = document.createElement('img');
    img.src = col.media.src;
    img.alt = col.media.alt;
    img.loading = 'lazy';
    link.append(img);
    return link;
  })();

  const desc = col.desc && (() => {
    const p = document.createElement('p');
    p.className = 'header-mega-col-desc';
    p.textContent = col.desc;
    return p;
  })();

  const cta = col.cta && (() => {
    const a = document.createElement('a');
    a.href = col.cta.href;
    a.className = 'header-mega-col-cta';
    a.textContent = col.cta.label;
    return a;
  })();

  if (col.media) {
    // promo tile: image, then title, then text, then CTA
    colEl.append(media, heading);
    if (desc) colEl.append(desc);
    if (cta) colEl.append(cta);
  } else {
    colEl.append(heading);
    if (desc) colEl.append(desc);
    if (col.items.length) {
      const ul = document.createElement('ul');
      col.items.forEach(({
        title, subtitle, href, icon,
      }) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = href;
        if (icon) {
          const img = document.createElement('img');
          img.src = icon;
          img.alt = '';
          img.loading = 'lazy';
          img.className = 'header-mega-item-icon';
          a.append(img);
        }
        const content = document.createElement('div');
        content.className = 'header-mega-item-content';
        const titleEl = document.createElement('div');
        titleEl.className = 'header-mega-item-title';
        titleEl.textContent = title;
        content.append(titleEl);
        if (subtitle) {
          const subEl = document.createElement('div');
          subEl.className = 'header-mega-item-subtitle';
          subEl.textContent = subtitle;
          content.append(subEl);
        }
        a.append(content);
        li.append(a);
        ul.append(li);
      });
      colEl.append(ul);
    }
    if (cta) colEl.append(cta);
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
  if (item.cols.length === 5) {
    // 4+1 layout: first column stands alone, the rest share a light-grey group
    inner.append(buildMegaCol(item.cols[0]));
    const group = document.createElement('div');
    group.className = 'header-mega-group';
    item.cols.slice(1).forEach((col) => group.append(buildMegaCol(col)));
    inner.append(group);
  } else {
    item.cols.forEach((col) => inner.append(buildMegaCol(col)));
  }
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

function buildMobileMenu(brand, menus, tools, utility, callbacks) {
  const mobile = document.createElement('div');
  mobile.className = 'header-mobile-menu';
  mobile.hidden = true;

  const topbar = document.createElement('div');
  topbar.className = 'header-mobile-topbar';
  const logoLink = document.createElement('a');
  logoLink.href = brand.href;
  logoLink.className = 'header-mobile-logo';
  logoLink.setAttribute('aria-label', brand.label);
  inlineIcon('synopsys-logo').then((icon) => icon && logoLink.append(icon));
  const topbarTools = document.createElement('div');
  topbarTools.className = 'header-mobile-topbar-tools';
  const searchToggle = document.createElement('button');
  searchToggle.type = 'button';
  searchToggle.className = 'header-mobile-search-toggle';
  searchToggle.setAttribute('aria-label', 'Search Synopsys.com');
  inlineIcon('search').then((icon) => icon && searchToggle.append(icon));
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'header-mobile-close';
  closeBtn.setAttribute('aria-label', 'Close navigation');
  closeBtn.innerHTML = '<span></span><span></span>';
  topbarTools.append(searchToggle, closeBtn);
  topbar.append(logoLink, topbarTools);
  mobile.append(topbar);

  const search = document.createElement('form');
  search.className = 'header-mobile-search';
  search.hidden = true;
  search.action = 'https://www.synopsys.com/search.html';
  search.method = 'get';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.name = 'q';
  searchInput.placeholder = 'Search Synopsys.com';
  search.append(searchInput);
  mobile.append(search);
  searchToggle.addEventListener('click', () => {
    search.hidden = !search.hidden;
    if (!search.hidden) searchInput.focus();
  });

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
    back.textContent = `\u2190 ${item.label}`;
    sub.append(back);
    item.cols.forEach((col) => sub.append(buildMegaCol(col)));
    li.append(sub);
    list.append(li);
  });
  mobile.append(list);

  const utilList = document.createElement('ul');
  utilList.className = 'header-mobile-util-list';
  const langLi = document.createElement('li');
  const langBtn = document.createElement('button');
  langBtn.type = 'button';
  langBtn.className = 'header-mobile-item header-mobile-item-lang';
  const langLabel = document.createElement('span');
  langLabel.textContent = 'Language Selector';
  inlineIcon('globe').then((icon) => icon && langBtn.prepend(icon));
  langBtn.append(langLabel);
  langLi.append(langBtn);
  const langSub = document.createElement('div');
  langSub.className = 'header-mobile-sub';
  langSub.hidden = true;
  const langBack = document.createElement('button');
  langBack.type = 'button';
  langBack.className = 'header-mobile-back';
  langBack.textContent = '\u2190 Language Selector';
  langSub.append(langBack);
  const langUl = document.createElement('ul');
  langUl.className = 'header-mega-col';
  (utility.langs || []).forEach(({ label, href }) => {
    const item = document.createElement('li');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    item.append(a);
    langUl.append(item);
  });
  langSub.append(langUl);
  langLi.append(langSub);
  utilList.append(langLi);

  const askLi = document.createElement('li');
  const askBtn = document.createElement('button');
  askBtn.type = 'button';
  askBtn.className = 'header-mobile-item header-mobile-item-ask';
  const askLabel = document.createElement('span');
  askLabel.textContent = 'Ask';
  inlineIcon('sparkle').then((icon) => icon && askBtn.prepend(icon));
  askBtn.append(askLabel);
  askLi.append(askBtn);
  utilList.append(askLi);
  mobile.append(utilList);

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
  langBtn.addEventListener('click', () => {
    langSub.hidden = false;
    mobile.classList.add('drilled');
  });
  askBtn.addEventListener('click', () => callbacks.onAsk());
  closeBtn.addEventListener('click', () => callbacks.onClose());
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
  const caret = document.createElement('div');
  caret.className = 'header-mega-caret';
  megaWrap.append(caret);
  const closeAll = () => {
    navItems.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
    megaWrap.querySelectorAll('.header-mega').forEach((p) => { p.hidden = true; });
    megaWrap.hidden = true;
  };
  /**
   * Positions the panel and its caret so the caret always points at the
   * trigger item's center, while the panel itself is centered in the
   * viewport unless that would push it to the right of the trigger (in
   * which case it's pinned to the trigger's left edge instead) — this is
   * the site's own behaviour, reverse-engineered from the live nav.
   * @param {Element} btn the hovered/focused nav item
   * @param {Element} panel the mega panel being shown
   */
  const position = (btn, panel) => {
    const navRect = navBar.getBoundingClientRect();
    const itemRect = btn.getBoundingClientRect();
    const itemLeft = itemRect.left - navRect.left;
    const itemCenter = itemLeft + itemRect.width / 2;
    const panelWidth = panel.offsetWidth;
    const idealLeft = window.innerWidth / 2 - panelWidth / 2 - navRect.left;
    const margin = 8;
    const maxLeft = window.innerWidth - navRect.left - panelWidth - margin;
    const left = Math.max(margin, Math.min(idealLeft, itemLeft, maxLeft));
    panel.style.left = `${left}px`;
    caret.style.left = `${itemCenter}px`;
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
      position(btn, panel);
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

  const { bar: chatBar, floating } = buildChatBar(chat);

  function openAsk() {
    chatBar.classList.remove('bc-hidden');
    chatBar.scrollIntoView({ block: 'center', behavior: 'smooth' });
    chatBar.querySelector('#chat-bar-input')?.focus();
  }

  let mobileMenu;
  function setMobileOpen(open) {
    hamburger.setAttribute('aria-expanded', String(open));
    mobileMenu.hidden = !open;
    document.body.style.overflowY = open ? 'hidden' : '';
  }

  mobileMenu = buildMobileMenu(brand, menus, tools, utility, {
    onClose: () => setMobileOpen(false),
    onAsk: () => { setMobileOpen(false); openAsk(); },
  });

  block.append(navBar, mobileMenu);
  block.append(chatBar, floating);

  initStickyNav(navBar);
  initDesktopMegaMenus(navBar, navItems, megaWrap);

  searchBtn.addEventListener('click', () => {
    searchPanel.hidden = !searchPanel.hidden;
    if (!searchPanel.hidden) searchPanel.querySelector('input').focus();
  });

  document.getElementById('header-ask')?.addEventListener('click', openAsk);

  hamburger.addEventListener('click', () => {
    setMobileOpen(hamburger.getAttribute('aria-expanded') !== 'true');
  });

  DESKTOP.addEventListener('change', (e) => {
    if (e.matches) setMobileOpen(false);
  });
}
