/*
 * Header: the utility bar and the navigation bar, from the nav document of the page's language
 * (`<language root>/nav`, or the page metadata `nav`). Its sections, by section style:
 * - `utility`: the two brand links, a heading with the list of languages, and "Ask".
 * - `brand`: the logo as an icon, linked to the home page.
 * - `menus`: one `h3` per menu, each followed by a `columns` block whose variant is the panel's
 *   layout (`two-column`, `two-column-simple`, `three-column`, `five-column`). A column holds
 *   headings with lists of links (text after a link is its second line), a lone link ("view
 *   all"), or a promotion: image (or poster and video link), linked heading, text, link.
 * - `tools`: the call to action (bold link) and the card of the mobile menu: logo, link, text.
 * - `search`: title, placeholder, "Cancel", then a heading and a `cards` block of tiles.
 * Without `menus` the header is the utility bar and, with `brand`, a band with the logo.
 * The page metadata `breadcrumb` (`Label=/path; Label=/path; Current`) fills the utility bar
 * once the page is scrolled.
 */
import { getMetadata } from '../../scripts/aem.js';
import { getLanguage, languageRoot } from '../../scripts/site.js';

// the source's script treats the window as mobile below 1129, its stylesheet below 1130
const DESKTOP = window.matchMedia('(width >= 1130px)');
const SEARCH = 'https://www.synopsys.com';
const TRIANGLE = 'M9.46 0.66C10.26 -0.22 11.65 -0.22 12.44 0.66L21.39 10.66L0.51 10.66L9.46 0.66Z';
const SCROLLED_FROM = 50;
const CLOSE_DELAY = 150;

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children.filter((child) => child !== null && child !== undefined));
  return node;
}

function button(className, ...children) {
  const node = el('button', className, ...children);
  node.type = 'button';
  return node;
}

function link(source, className, ...children) {
  const a = el('a', className, ...children);
  a.href = source.getAttribute('href');
  return a;
}

const icons = {};

/** The icon file as an inline SVG: the source's icons are inline, so they take the text colour. */
async function loadIcon(name) {
  const response = await fetch(`${window.hlx.codeBasePath}/icons/${name}.svg`);
  if (!response.ok) throw new Error(`header: icon ${name} answered ${response.status}`);
  const holder = document.createElement('div');
  holder.innerHTML = await response.text();
  icons[name] = holder.firstElementChild;
  icons[name].setAttribute('aria-hidden', 'true');
}

function icon(name, className) {
  const svg = icons[name].cloneNode(true);
  if (className) svg.setAttribute('class', className);
  return svg;
}

/** The image of an authored picture: an SVG as it is, a photo in the optimized rendition. */
function image(picture, className) {
  const img = picture.querySelector('img');
  if (/\.svg(\?|$)/.test(img.getAttribute('src'))) [img.src] = img.src.split('?');
  else img.src = picture.querySelector('source[type="image/webp"]:not([media])')?.srcset ?? img.src;
  img.loading = 'lazy';
  img.className = className;
  return img;
}

const external = (a) => new URL(a.href, window.location.href).host !== window.location.host;
const isLinkOnly = (p) => p.children.length === 1 && p.firstElementChild.matches('a')
  && p.textContent.trim() === p.firstElementChild.textContent.trim();

async function loadNav() {
  const meta = getMetadata('nav');
  const path = meta ? new URL(meta, window.location.href).pathname : `${languageRoot()}/nav`;
  const response = await fetch(`${path}.plain.html`);
  if (!response.ok) throw new Error(`header: ${path}.plain.html answered ${response.status}`);
  const nav = document.createElement('div');
  nav.innerHTML = await response.text();
  const base = new URL(path, window.location.href);
  nav.querySelectorAll('img[src^="./media_"], source[srcset^="./media_"]').forEach((media) => {
    const attribute = media.matches('img') ? 'src' : 'srcset';
    media.setAttribute(attribute, new URL(media.getAttribute(attribute), base).href);
  });
  return (role) => nav.querySelector(`:scope > .${role}`);
}

/** The trail of the page metadata `breadcrumb`: `Label=/path; Label=/path; Current label`. */
function buildBreadcrumb() {
  const trail = getMetadata('breadcrumb').split(';').map((item) => item.trim()).filter(Boolean);
  if (!trail.length) return null;
  const items = trail.map((item, index) => {
    const [label, href] = item.split('=');
    const li = el('li', 'breadcrumb-item');
    if (href && index < trail.length - 1) {
      const a = el('a', 'breadcrumb-link', el('span', '', label));
      a.href = href;
      li.append(a);
    } else {
      li.classList.add('active');
      li.setAttribute('aria-current', 'page');
      li.append(el('span', '', label));
    }
    return li;
  });
  const nav = el('nav', 'breadcrumb', el('ol', 'breadcrumb-list', ...items));
  nav.setAttribute('aria-label', 'Breadcrumb');
  return nav;
}

/**
 * Goes to the same page in the language of the link when it exists, else to the link itself
 * (the language's home page), as the source does.
 */
async function switchLanguage(event) {
  const a = event.target.closest('a');
  if (!a) return;
  event.preventDefault();
  const target = new URL(a.href);
  const page = window.location.pathname.slice(languageRoot().length).replace(/^\/$/, '');
  if (getLanguage(target.pathname) === getLanguage()) return;
  if (page) {
    const twin = `${languageRoot(target.pathname)}${page}`;
    const found = await fetch(twin, { method: 'HEAD' }).then((r) => r.ok, () => false);
    if (found) {
      window.location.href = twin;
      return;
    }
  }
  window.location.href = a.href;
}

function languageItems(list) {
  return [...list.querySelectorAll('a')].map((source) => {
    const li = el('li', '', link(source, 'dropdown-item', source.textContent));
    const current = getLanguage(new URL(source.href, window.location.href).pathname);
    if (current === getLanguage()) li.className = 'active';
    return li;
  });
}

function buildUtility(section) {
  const [home, partner] = section.querySelectorAll(':scope > p > a');
  const list = section.querySelector('ul');
  const title = section.querySelector('h1, h2, h3, h4')?.textContent ?? '';
  const ask = [...section.querySelectorAll(':scope > p')].find((p) => !p.querySelector('a'));
  const row = el('div', 'utility-logo-row');
  if (home) row.append(link(home, 'utility-nav-text-link', home.textContent));
  if (partner) {
    row.append(
      el('div', 'vr'),
      link(partner, 'ansys-logo-link utility-nav-text-link', partner.textContent),
    );
  }
  const breadcrumb = buildBreadcrumb();
  if (breadcrumb) row.append(breadcrumb);
  const toolbar = el('div', 'utility-tools');
  if (list) {
    const items = languageItems(list);
    const current = items.find((li) => li.className) ?? items[0];
    const toggle = button('dropdown-toggle', current?.textContent);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-haspopup', 'true');
    const menu = el('ul', 'dropdown-menu', el('li', 'title', title), ...items);
    toolbar.append(el('div', 'lang-dropdown', toggle, menu));
  }
  if (ask) {
    toolbar.append(button('ask', el('span', '', ask.textContent)));
  }
  return el('div', 'pre-header', row, toolbar);
}

/** One link of a panel list: optional icon, title, optional second line, new-tab mark. */
function buildItem(source) {
  const a = source.querySelector('a');
  const picture = source.querySelector('picture');
  const note = [...source.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent).join('').trim();
  const title = el('div', 'nav-item-title', (a ?? source).textContent.trim());
  const item = a ? link(a, '') : el('span', 'no-link');
  if (picture) item.append(image(picture, 'nav-item-logo'));
  item.append(title);
  if (note) {
    item.classList.add('has-subtitle');
    item.append(el('span', 'nav-item-subtitle', note));
  }
  if (a && external(a)) {
    title.append(' ', icon('arrow-up-right-from-square', 'external-link-icon'));
    item.target = '_blank';
    item.rel = 'noopener';
  }
  return el('li', '', item);
}

function buildHeading(heading) {
  const a = heading.querySelector('a');
  const picture = heading.querySelector('picture');
  const header = a ? link(a, 'header-item') : el('span', 'header-item');
  if (picture) header.append(image(picture, 'nav-header-logo'));
  header.append(heading.textContent.trim());
  return header;
}

function buildVideo(picture, source) {
  const poster = image(picture, 'video-poster');
  const play = button('video-button', icon('play'));
  play.setAttribute('aria-label', poster.alt || 'Play');
  play.dataset.video = source.href;
  return el('div', 'ad-video', el('div', 'video-container', poster, play));
}

/** A promotion: image or video, then one link around its title, text and call to action. */
function buildAd(cell) {
  const picture = cell.querySelector(':scope > p > picture');
  const paragraphs = [...cell.querySelectorAll(':scope > p')].filter((p) => !p.contains(picture));
  const player = paragraphs.find((p) => isLinkOnly(p) && /brightcove/.test(p.textContent));
  const title = cell.querySelector(':scope > h4 a, :scope > h3 a');
  const cta = paragraphs.find((p) => p !== player && isLinkOnly(p));
  const ad = el('section', 'nav-ad');
  ad.append(player
    ? buildVideo(picture, player.firstElementChild)
    : el('div', 'ad-image', image(picture, '')));
  const target = title ?? cta?.firstElementChild;
  if (!target) return ad;
  const a = link(target, '', el('div', 'title', title?.textContent ?? ''));
  const texts = paragraphs.filter((p) => p !== player && p !== cta);
  // the source keeps the text's box when it is empty: it takes a row gap
  a.append(el('div', 'description', ...texts.map((p) => el('p', '', p.textContent))));
  // the space keeps the arrow of the stylesheet at the source's distance
  if (cta) a.append(el('div', 'ad-cta', `${cta.textContent} `));
  ad.append(a);
  return ad;
}

function buildViewAll(source, footer) {
  if (footer) {
    const a = link(source, 'sub-nav-footer', source.textContent);
    a.target = '_blank';
    a.rel = 'noopener';
    return el('div', '', a);
  }
  const text = el('span', 'cta-text', source.textContent);
  return el('div', 'buttons', link(source, 'cta-link', text, icon('chevron-right', 'arrow-icon')));
}

/** A column of lists: every heading or list starts a group, a lone link is "view all". */
function buildLists(cell, variant) {
  const column = el('div', 'col');
  let group;
  const start = (header) => {
    group = el('div', 'nav-list-group', header ?? el('span', 'header-item no-header'));
    column.append(group);
  };
  [...cell.children].forEach((child) => {
    if (child.matches('h1, h2, h3, h4, h5, h6')) {
      start(buildHeading(child));
    } else if (child.matches('ul, ol')) {
      if (!group || group.querySelector('.nav-list')) start();
      group.append(el('ul', 'nav-list', ...[...child.children].map(buildItem)));
    } else if (child.matches('p') && isLinkOnly(child)) {
      column.append(buildViewAll(child.firstElementChild, variant === 'five-column'));
    } else if (child.matches('p') && group && !group.querySelector('.nav-list')) {
      group.firstElementChild.append(el('span', 'header-subtitle', child.textContent));
    }
  });
  return column;
}

/** The panel of a menu, from its `columns` block: the block's variant is the panel's layout. */
function buildPanel(label, block) {
  const variant = ['two-column', 'two-column-simple', 'three-column', 'five-column']
    .find((name) => block?.classList.contains(name)) ?? 'two-column';
  const cells = [...(block?.querySelectorAll(':scope > div > div') ?? [])];
  const columns = cells.map((cell) => {
    if (!cell.querySelector(':scope > p > picture')) return buildLists(cell, variant);
    const ad = buildAd(cell);
    if (variant === 'three-column') ad.classList.add('hide-on-mobile');
    return el('div', 'col', ad);
  });
  const row = el('div', 'subnav-row');
  if (variant === 'five-column') {
    columns[0]?.classList.add('left-col');
    row.append(...columns.slice(0, 1), el('div', 'grey col-group', ...columns.slice(1)));
  } else {
    if (variant !== 'two-column-simple') columns.at(-1)?.classList.add('grey');
    row.append(...columns);
  }
  const panel = el('div', 'dropdown', el('div', `subnav ${variant}`, row));
  panel.dataset.menu = label;
  return panel;
}

function menuItem(label, className = '') {
  const header = el('span', 'main-nav-item-header', label);
  header.tabIndex = 0;
  header.setAttribute('role', 'button');
  header.setAttribute('aria-haspopup', 'true');
  header.setAttribute('aria-expanded', 'false');
  const li = el('li', `main-nav-item has-dropdown ${className}`.trim(), header);
  li.dataset.menu = label;
  return li;
}

/** The mobile menu's call to action and the promotion card under it. */
function buildPromo(section) {
  const cta = section?.querySelector('strong a');
  const picture = section?.querySelector('picture');
  const paragraphs = [...(section?.querySelectorAll(':scope > p') ?? [])];
  const target = paragraphs.find((p) => isLinkOnly(p) && !p.querySelector('strong'));
  const text = paragraphs.find((p) => !p.querySelector('a, picture'));
  const holder = el('div', 'cta-mobile-holder');
  if (cta) holder.append(link(cta, 'cta cta-mobile', cta.textContent));
  if (!target) return holder;
  const row = el('div', 'promo-row');
  if (picture) row.append(el('div', 'promo-logo', image(picture, '')), el('span', 'promo-divider'));
  row.append(el('div', 'promo-link-text', target.textContent, icon('arrow-right', 'promo-arrow')));
  const card = el('div', 'promo-card', row);
  if (text) {
    card.append(el('div', 'promo-text', el('p', '', ...text.cloneNode(true).childNodes)));
  }
  const a = link(target.firstElementChild, 'promo-card-link', card);
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  holder.append(a);
  return holder;
}

function buildTile(row) {
  const [media, body] = row.children;
  const source = body?.querySelector('a');
  if (!source) return null;
  const picture = media.querySelector('picture');
  const title = el('div', 'title', source.textContent, ' ', icon('chevron-right', 'arrow-icon'));
  const subtitle = [...body.querySelectorAll('p')].find((p) => !p.contains(source));
  const lines = subtitle ? [...subtitle.cloneNode(true).childNodes] : [];
  const text = el('div', 'text-col', title, el('div', 'subtitle', ...lines));
  return link(source, 'media-link-tile', el('div', 'img-col', picture && image(picture, '')), text);
}

/** The search layer: title and cancel, the field, and the "popular content" tiles. */
function buildSearch(section) {
  const [title, popular] = [...section.querySelectorAll('h1, h2, h3, h4')];
  const [placeholder, cancel] = [...section.querySelectorAll(':scope > p')];
  const close = button('close', cancel?.textContent ?? 'Cancel');
  const input = el('input');
  input.type = 'text';
  input.name = 'q';
  input.autocomplete = 'off';
  input.placeholder = placeholder?.textContent ?? '';
  input.setAttribute('aria-label', input.placeholder);
  const form = el('form', 'search-form', el('div', 'search-box', input));
  form.setAttribute('role', 'search');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    // the source's Coveo field redirects to its result page with the query in the fragment
    const folder = getLanguage() === 'en' ? '' : `/${getLanguage()}`;
    const page = `${SEARCH}${folder}/search.html`;
    if (query) window.location.href = `${page}#q=${encodeURIComponent(query)}`;
  });
  const header = el('div', 'search-header', el('h5', '', title?.textContent ?? ''), close);
  const layer = el('div', 'search-layer', header, form);
  const tiles = [...section.querySelectorAll('.cards > div')].map(buildTile).filter(Boolean);
  if (tiles.length) {
    layer.append(
      el('h5', 'popular-content-header', popular?.textContent ?? ''),
      el('div', 'popular-content', ...tiles),
    );
  }
  return el('div', 'search-wrapper', layer);
}

function triangle(className) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 21 11');
  svg.setAttribute('class', `triangle ${className}`);
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', TRIANGLE);
  svg.append(path);
  return svg;
}

/** The logo is the icon the document names: one language has its own drawing. */
function logoName(brand) {
  const classes = [...(brand?.querySelector('.icon')?.classList ?? [])];
  return classes.find((c) => c.startsWith('icon-'))?.slice(5) ?? 'synopsys-logo';
}

/** The bar itself: logo, first-level menu, search button, call to action, menu button. */
function buildBar(brand, menus, utility, tools) {
  const home = brand?.querySelector('a');
  const logo = el('a', 'logo', icon(logoName(brand)));
  logo.href = home?.getAttribute('href') ?? `${languageRoot()}/`;
  logo.firstElementChild.setAttribute('role', 'img');
  logo.firstElementChild.setAttribute('aria-label', 'Synopsys');
  logo.firstElementChild.removeAttribute('aria-hidden');
  const headings = [...(menus?.querySelectorAll(':scope > h3') ?? [])];
  const main = el('ul', 'main-nav-list', ...headings.map((h) => menuItem(h.textContent.trim())));
  const extra = el('ul', 'utility-nav');
  if (utility.querySelector('.dropdown-menu')) {
    extra.append(menuItem('Language Selector', 'language'));
  }
  const ask = utility.querySelector('.ask');
  if (ask) {
    extra.append(el('li', 'ask-item', button('', el('span', '', ask.textContent))));
    // only the source's English menu draws its two lists as one group with a rule between
    main.classList.add('utility-nav-enabled');
  }
  const nav = el('nav', 'main-nav', main, extra);
  nav.setAttribute('aria-label', 'Main');
  const label = el('span', 'visually-hidden', 'Search Synopsys.com');
  const search = button('icon-search', label, icon('magnifying-glass'));
  const right = el('div', 'nav-items-right', search);
  const cta = tools?.querySelector('strong a');
  if (cta) {
    const a = link(cta, 'cta', cta.textContent);
    a.target = '_blank';
    a.rel = 'noopener';
    right.append(a);
  }
  const toggler = button('navbar-toggler', icon('bars', 'svg-open'), icon('xmark', 'svg-close'));
  toggler.setAttribute('aria-expanded', 'false');
  toggler.setAttribute('aria-label', 'Toggle navigation');
  right.append(toggler);
  return el('div', 'nav-top-wrapper', logo, nav, right);
}

/** Everything that opens: the panels of the menus and of the language selector. */
function buildMorph(menus, utility, promo) {
  const panels = [...(menus?.querySelectorAll(':scope > h3') ?? [])].map((heading) => {
    const next = heading.nextElementSibling;
    return buildPanel(heading.textContent.trim(), next?.matches('.columns') ? next : null);
  });
  const languages = utility.querySelector('.dropdown-menu');
  if (languages) {
    const items = [...languages.querySelectorAll('li:not(.title)')].map((li) => li.cloneNode(true));
    const title = el('span', 'header-item', languages.querySelector('.title').textContent);
    const panel = el('div', 'dropdown language-list', title, el('ul', '', ...items));
    panel.dataset.menu = 'Language Selector';
    panels.push(panel);
  }
  return el(
    'div',
    'morph',
    triangle('main'),
    triangle('shadow'),
    el('div', 'morph-header', button('back', 'Back')),
    el('div', 'dropdown-list', ...panels),
    promo.cloneNode(true),
  );
}

/**
 * Where the source puts a desktop panel: centred in the window, or under its menu item for the
 * two narrow layouts. Returns the panel's offset and the offset of the arrow above it.
 */
function place(top, item, panel) {
  const variant = panel.firstElementChild.classList[1];
  const offset = top.getBoundingClientRect().left;
  const box = item.getBoundingClientRect();
  const centred = (window.innerWidth - panel.offsetWidth) / 2 - offset;
  const under = box.left - offset + (variant === 'two-column-simple' ? -114 : 0);
  const wide = ['three-column', 'five-column'].includes(variant)
    || (window.innerWidth < 1600 && variant !== 'two-column');
  return { x: wide ? centred : under, arrow: box.left - offset + box.width / 2 - 11 };
}

/** The panels' state: which one is open, as a desktop dropdown or as the menu's second level. */
function createPanels(top) {
  const morph = top.querySelector('.morph');
  const list = morph.querySelector('.dropdown-list');
  const triangles = [...morph.querySelectorAll('.triangle')];
  const panelOf = (item) => [...list.children].find((p) => p.dataset.menu === item.dataset.menu);
  let first = true;

  const deactivate = () => top.querySelectorAll('.has-dropdown.active').forEach((item) => {
    item.classList.remove('active');
    item.firstElementChild.setAttribute('aria-expanded', 'false');
  });
  const activate = (item, panel) => {
    deactivate();
    item.classList.add('active');
    item.firstElementChild.setAttribute('aria-expanded', 'true');
    list.querySelectorAll('.dropdown.active').forEach((p) => p.classList.remove('active'));
    panel.classList.add('active');
    morph.classList.add('active');
  };
  return {
    panelOf,
    close() {
      deactivate();
      list.classList.remove('active');
      Object.assign(list.style, { width: 'auto', height: 'auto' });
      morph.classList.remove('active');
      top.classList.remove('sub-open');
      morph.querySelectorAll('.nav-list-group.active').forEach((g) => g.classList.remove('active'));
      triangles.forEach((t) => { t.style.top = '0'; });
    },
    openDesktop(item) {
      const panel = panelOf(item);
      if (!panel) return;
      activate(item, panel);
      const { x, arrow } = place(top, item, panel);
      const grey = !item.nextElementSibling
        && panel.querySelector('.subnav-row > .col:last-child.grey');
      triangles.forEach((t) => {
        Object.assign(t.style, { left: `${arrow}px`, top: '-12px' });
        t.classList.toggle('light-grey-fill', !!grey);
      });
      // the list morphs from one panel's box to the next: only the first opening does not move
      Object.assign(list.style, {
        width: `${panel.offsetWidth}px`,
        height: `${panel.offsetHeight}px`,
        transform: `translateX(${x}px)`,
        transition: first ? 'none' : '',
      });
      first = false;
      list.classList.add('active');
    },
    openMobile(item) {
      const panel = panelOf(item);
      if (!panel) return;
      activate(item, panel);
      top.classList.add('sub-open');
      morph.scrollTop = 0;
    },
  };
}

/** The product groups of the widest panel fold below the breakpoint, one open at a time. */
function initGroups(morph) {
  morph.querySelectorAll('.five-column .header-item').forEach((header) => {
    header.addEventListener('click', (event) => {
      if (DESKTOP.matches) return;
      event.preventDefault();
      const group = header.parentElement;
      const wasOpen = group.classList.contains('active');
      morph.querySelectorAll('.nav-list-group.active').forEach((g) => g.classList.remove('active'));
      group.classList.toggle('active', !wasOpen);
      const items = group.querySelector('.nav-list');
      // the heading's own link becomes the first item of the open group, as on the source
      if (header.href && items && !items.querySelector('.duplicate-header-item')) {
        const title = el('div', 'nav-item-title', header.textContent.trim());
        const a = link(header, 'has-subtitle', title, el('span', 'nav-item-subtitle'));
        items.prepend(el('li', 'duplicate-header-item', a));
      }
    });
  });
}

/** A swipe to the right leaves the second level, as on the source. */
function initSwipe(morph, close) {
  let startX = 0;
  let startY = 0;
  morph.addEventListener('touchstart', (event) => {
    [{ clientX: startX, clientY: startY }] = event.touches;
  }, { passive: true });
  morph.addEventListener('touchend', (event) => {
    const { clientX, clientY } = event.changedTouches[0];
    if (clientX - startX > 50 && Math.abs(clientY - startY) < 50) close();
  });
}

/** Opens and closes the panels: on hover and focus on a desktop, as a second level below. */
function initMenus(top) {
  const panels = createPanels(top);
  const morph = top.querySelector('.morph');
  const list = morph.querySelector('.dropdown-list');
  const nav = top.querySelector('.main-nav');
  let timer;
  const open = (item) => {
    clearTimeout(timer);
    panels.openDesktop(item);
  };
  const later = () => { timer = setTimeout(panels.close, CLOSE_DELAY); };

  top.querySelectorAll('.has-dropdown').forEach((item) => {
    item.addEventListener('mouseenter', () => DESKTOP.matches && open(item));
    item.addEventListener('focusin', () => DESKTOP.matches && open(item));
    item.addEventListener('click', () => !DESKTOP.matches && panels.openMobile(item));
    // as on the source, the keys open a level of the mobile menu but not a desktop panel
    item.addEventListener('keydown', (event) => {
      if (DESKTOP.matches || !['Enter', ' ', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      panels.openMobile(item);
      (panels.panelOf(item)?.querySelector('a, button') ?? morph.querySelector('.back')).focus();
    });
  });
  nav.addEventListener('mouseleave', () => DESKTOP.matches && later());
  list.addEventListener('mouseenter', () => clearTimeout(timer));
  list.addEventListener('mouseleave', () => DESKTOP.matches && later());
  top.addEventListener('focusout', (event) => {
    const to = event.relatedTarget;
    if (DESKTOP.matches && !(to && (nav.contains(to) || list.contains(to)))) later();
  });
  top.addEventListener('focusin', (event) => list.contains(event.target) && clearTimeout(timer));
  morph.querySelector('.back').addEventListener('click', panels.close);
  initGroups(morph);
  initSwipe(morph, panels.close);
  return { close: panels.close };
}

/** The search layer, the mobile menu and the page lock they share. */
function initLayers(top, menus) {
  const layer = top.querySelector('.search-layer');
  const overlay = top.querySelector('.search-overlay');
  const toggler = top.querySelector('.navbar-toggler');
  const setMenu = (open) => {
    top.classList.toggle('menu-open', open);
    toggler.setAttribute('aria-expanded', String(open));
  };
  const setSearch = (open) => {
    layer?.classList.toggle('active', open);
    top.classList.toggle('search-open', open);
    // on a desktop the open search dims and locks the page, as the open menu does below
    overlay.classList.toggle('active', open && DESKTOP.matches);
    if (DESKTOP.matches) setMenu(open);
  };
  toggler.addEventListener('click', () => {
    setMenu(!top.classList.contains('menu-open'));
    setSearch(false);
    menus.close();
  });
  top.querySelectorAll('.icon-search, .search-layer .close').forEach((control) => {
    control.addEventListener('click', (event) => {
      event.stopPropagation();
      setSearch(!top.classList.contains('search-open'));
    });
  });
  document.addEventListener('click', (event) => {
    if (top.classList.contains('search-open') && !layer.contains(event.target)) setSearch(false);
  });
  document.addEventListener('keyup', (event) => {
    if (event.key !== 'Escape' || !top.classList.contains('search-open')) return;
    setSearch(false);
    top.querySelector('.icon-search').focus();
  });
  let settle;
  const reset = () => {
    menus.close();
    setSearch(false);
    setMenu(false);
  };
  DESKTOP.addEventListener('change', reset);
  window.addEventListener('resize', () => {
    top.classList.add('no-transition');
    clearTimeout(settle);
    settle = setTimeout(() => top.classList.remove('no-transition'), 250);
  });
}

/** The language list of the utility bar: a click menu with arrow keys and Escape. */
function initLanguages(block) {
  const dropdown = block.querySelector('.lang-dropdown');
  block.querySelectorAll('.dropdown-menu, .language-list').forEach((list) => {
    list.addEventListener('click', switchLanguage);
  });
  if (!dropdown) return;
  const toggle = dropdown.querySelector('.dropdown-toggle');
  const links = [...dropdown.querySelectorAll('a')];
  const set = (open) => {
    dropdown.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => set(!dropdown.classList.contains('open')));
  document.addEventListener('click', (event) => !dropdown.contains(event.target) && set(false));
  dropdown.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      set(false);
      toggle.focus();
    } else if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      set(true);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const at = links.indexOf(document.activeElement);
      links[Math.min(Math.max(at + step, 0), links.length - 1)].focus();
    }
  });
}

/** The utility bar swaps its partner link for the breadcrumb once the page is scrolled. */
function initScroll(bar) {
  const update = () => {
    const scrolled = window.scrollY >= SCROLLED_FROM;
    bar.classList.toggle('scrolled', scrolled);
    bar.querySelector('.breadcrumb')?.toggleAttribute('inert', !scrolled);
    bar.querySelector('.ansys-logo-link')?.toggleAttribute('inert', scrolled);
  };
  window.addEventListener('scroll', () => window.requestAnimationFrame(update), { passive: true });
  update();
}

/** The video of a promotion plays in a dialog, from the player link of the document. */
function initVideo(top) {
  top.querySelectorAll('.video-button').forEach((play) => {
    play.addEventListener('click', () => {
      const frame = el('iframe');
      frame.src = `${play.dataset.video}&autoplay=true`;
      frame.allow = 'autoplay; fullscreen; encrypted-media';
      frame.title = play.getAttribute('aria-label');
      const close = button('close', '\u00d7');
      close.setAttribute('aria-label', 'Close');
      const dialog = el('dialog', 'video-modal', close, el('div', 'video-frame', frame));
      dialog.addEventListener('click', (event) => event.target !== frame && dialog.close());
      dialog.addEventListener('close', () => dialog.remove());
      top.append(dialog);
      dialog.showModal();
    });
  });
}

/** The band of a landing page: only the logo, drawn as the source's stylesheet draws it. */
function buildLanding(brand) {
  const logo = el('div', 'synopsys-logo');
  logo.style.backgroundImage = `url("${window.hlx.codeBasePath}/icons/${logoName(brand)}.svg")`;
  logo.setAttribute('role', 'img');
  logo.setAttribute('aria-label', 'Synopsys');
  const home = brand.querySelector('a');
  return el('div', 'nav-landing', el('div', 'landing-row', home ? link(home, '', logo) : logo));
}

/** The navigation bar with everything that opens from it. */
async function buildTop(section, utility) {
  const names = [logoName(section('brand')), 'magnifying-glass', 'chevron-right',
    'arrow-up-right-from-square', 'play', 'bars', 'xmark', 'arrow-right'];
  await Promise.all(names.map(loadIcon));
  const promo = buildPromo(section('tools'));
  const top = el(
    'div',
    'nav-top',
    buildBar(section('brand'), section('menus'), utility, section('tools')),
    promo,
    el('div', 'search-overlay'),
    section('search') ? buildSearch(section('search')) : null,
    buildMorph(section('menus'), utility, promo),
  );
  const here = window.location.pathname.replace(/\/$/, '');
  // every slide of the source's home heroes asks for the header's light-on-dark colours
  top.classList.toggle('home', here === languageRoot());
  top.classList.add('dark');
  initLayers(top, initMenus(top));
  initVideo(top);
  return top;
}

export default async function decorate(block) {
  const section = await loadNav();
  const utility = buildUtility(section('utility') ?? document.createElement('div'));
  block.replaceChildren(utility);
  initScroll(utility);
  if (section('menus')) block.append(await buildTop(section, utility));
  else if (section('brand')) block.append(buildLanding(section('brand')));
  initLanguages(block);
}
