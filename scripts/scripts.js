import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser()
          .parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser()
          .parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) {
      sessionStorage.setItem('fonts-loaded', 'true');
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Returns the locale root of the current page, for example `/f52-1011-02/us/en`.
 * Unknown paths (the 404 page) fall back to `/us/en`, as on the source site.
 * @returns {string} The locale root path
 */
export function getLocaleRoot() {
  const [root] = window.location.pathname.match(/^\/f52-1011-02\/[a-z]{2}\/[a-z]{2}/)
    || ['/f52-1011-02/us/en'];
  return root;
}

/**
 * Turns a paragraph that only holds a link to a fragment into a fragment block.
 * @param {Element} main The container element
 */
function buildFragmentBlocks(main) {
  main.querySelectorAll('p > a[href^="/f52-1011-02/fragments/"]:only-child').forEach((a) => {
    const p = a.parentElement;
    if (p.textContent.trim() !== a.textContent.trim() || p.closest('.fragment')) return;
    p.replaceWith(buildBlock('fragment', [[a]]));
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildFragmentBlocks(main);
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Turns a bold link that is alone in its paragraph into a primary button.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p > strong:only-child > a[href]:only-child').forEach((a) => {
    const strong = a.parentElement;
    const p = strong.parentElement;
    if (p.textContent.trim() !== a.textContent.trim()) return;
    p.className = 'button-wrapper';
    a.className = 'button primary';
    strong.replaceWith(a);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Builds the breadcrumb of adventure and article pages from the path.
 * @param {Element} main The main element
 */
function buildBreadcrumb(main) {
  const { classList } = document.body;
  const section = main.querySelector('.section');
  if (!section || !(classList.contains('adventure') || classList.contains('article'))) return;

  const root = getLocaleRoot();
  const segments = window.location.pathname.slice(root.length).split('/').filter(Boolean);
  const ol = document.createElement('ol');
  segments.slice(0, -1).forEach((segment, i) => {
    const a = document.createElement('a');
    a.href = `${root}/${segments.slice(0, i + 1).join('/')}`;
    a.textContent = segment.replaceAll('-', ' ');
    const li = document.createElement('li');
    // white space as in the source markup: it sets the gaps between items and after the icon
    li.append(' ', a);
    ol.append(li, ' ');
  });
  const current = document.createElement('li');
  current.setAttribute('aria-current', 'page');
  current.textContent = ` ${document.title}`;
  ol.append(current);

  const nav = document.createElement('nav');
  nav.className = 'breadcrumb';
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.append(ol);
  const wrapper = document.createElement('div');
  wrapper.className = 'breadcrumb-wrapper';
  wrapper.append(nav);
  if (classList.contains('adventure')) section.prepend(wrapper);
  else section.append(wrapper);
}

/**
 * Shows the migrated 404 page of the source site in place of the static fallback.
 * @param {Element} main The main element
 * @returns {Promise<boolean>} true when the content was loaded
 */
async function loadErrorPage(main) {
  // eslint-disable-next-line import/no-cycle
  const { loadFragment } = await import('../blocks/fragment/fragment.js');
  const page = await loadFragment('/f52-1011-02/us/en/errors/404');
  if (!page) return false;
  main.replaceChildren(...page.children);
  return true;
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  const [, country, language] = getLocaleRoot().split('/').slice(1);
  document.documentElement.lang = `${language}-${country.toUpperCase()}`;
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    if (!window.isErrorPage || !await loadErrorPage(main)) {
      decorateMain(main);
      buildBreadcrumb(main);
    }
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('body > header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('body > footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  import('./consent-check.js');
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
