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
} from './aem.js';
import { getLanguage, languageRoot } from './site.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

const ROW_STYLE = /^(band-(top|bottom)-(xs|sm|md)|divider|light-grey|white)$/;
const ZOOM_LABEL = 'Click to see the detail';
const TAG_LINK = /\/category\?tag=/;

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/** Lets CSS draw an icon in the text colour: `--icon` is the file, used as a mask. */
function decorateIconMasks(main) {
  main.querySelectorAll('span.icon > img').forEach((img) => {
    img.parentElement.style.setProperty('--icon', `url("${img.src}")`);
  });
}

/**
 * Buttons and call-to-action links, as the contract writes them: a link alone in its paragraph
 * is a primary button in `strong`, a secondary one in `em`, a call-to-action link when it ends
 * with the chevron icon. Neighbouring button paragraphs become one row.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    const p = a.closest('p');
    if (a.querySelector('img:not([data-icon-name])')) return;
    if (p.textContent.trim() !== a.textContent.trim()) return;
    const emphasis = a.closest('strong, em');
    if (emphasis && p.contains(emphasis)) {
      a.className = `button ${emphasis.tagName === 'STRONG' ? 'primary' : 'secondary'}`;
      p.replaceChildren(a);
    } else if (a.lastChild === a.querySelector('.icon-chevron-right')) {
      a.className = 'cta-link';
    } else return;
    p.className = 'button-wrapper';
  });
  main.querySelectorAll('p.button-wrapper + p.button-wrapper').forEach((p) => {
    p.previousElementSibling.append(...p.children);
    p.remove();
  });
}

const isImageOnly = (p) => p.tagName === 'P' && !p.textContent.trim()
  && !!p.querySelector('picture, img:not([data-icon-name])');

/** A paragraph with only a link whose text is its own URL: the link of the image before it. */
function urlLink(p) {
  const a = p?.tagName === 'P' && p.children.length === 1 && p.querySelector(':scope > a[href]');
  if (!a) return null;
  const text = p.textContent.trim();
  return text === a.getAttribute('href') || text === a.href ? a : null;
}

/** The "Click to see the detail" button of the source: the image opens in the modal. */
function decorateZoom(wrapper) {
  const image = wrapper.querySelector('picture, img');
  const zoom = document.createElement('p');
  zoom.className = 'zoom-instructions';
  const button = document.createElement('button');
  button.type = 'button';
  const icon = document.createElement('span');
  icon.className = 'icon icon-magnifying-glass-plus';
  button.append(icon, ZOOM_LABEL);
  zoom.append(button);
  wrapper.append(zoom);
  decorateIcons(zoom);
  decorateIconMasks(zoom);
  const open = async () => {
    const { default: openModal } = await import('./modal.js');
    openModal(image.cloneNode(true));
  };
  image.addEventListener('click', open);
  button.addEventListener('click', open);
}

/**
 * Default content, as the source renders its components: the title of a `text`, an `image`
 * with its link and its zoom, a `pageList`, the `socialLinks`.
 * @param {HTMLElement} main The main container element
 */
function decorateDefaultContent(main) {
  main.querySelectorAll('.default-content-wrapper').forEach((wrapper) => {
    const section = wrapper.parentElement;
    [...wrapper.children].filter(isImageOnly).forEach((p) => {
      const a = urlLink(p.nextElementSibling);
      if (!a) return;
      a.parentElement.remove();
      a.replaceChildren(...p.childNodes);
      p.append(a);
    });
    const children = [...wrapper.children];
    const first = children[0];
    const list = children.at(-1);
    if (children.every(isImageOnly)) {
      wrapper.classList.add('image');
      if (section.classList.contains('zoom')) decorateZoom(wrapper);
    } else if (list.querySelector(':scope > li > a > .icon-download:first-child')) {
      wrapper.classList.add('downloads');
    } else if (first.tagName === 'H2' && !section.matches('.rich-text, .no-title')) {
      first.classList.add('title');
    }
    const heading = children.length === 2 && first.tagName === 'H5';
    if (list.tagName === 'UL' && (children.length === 1 || heading)
      && [...list.children].every((li) => li.children.length === 1
        && li.firstElementChild.tagName === 'A' && !li.querySelector('.icon')
        && li.textContent.trim() === li.firstElementChild.textContent.trim())) {
      // the tags of a post link to the category page: the source draws them as pills
      const tags = [...list.querySelectorAll('a')].every((a) => TAG_LINK.test(a.href));
      wrapper.classList.add(tags ? 'tag-list' : 'link-list');
    }
    children.filter((p) => p.tagName === 'P' && p.children.length && !p.textContent.trim()
      && [...p.children].every((a) => a.tagName === 'A' && a.querySelector(':scope > .icon')))
      .forEach((p) => p.classList.add('social-links'));
  });
}

/**
 * The section grid of the contract: neighbouring sections with a `span-N` style become one
 * `div.section-row` of `div.section-col` columns. A `stack` section stays in the column of the
 * section before it. A row ends when its spans pass 12, or at a section with the style `row`.
 * The row takes the background, the `band-*` spacing and the `divider` of its first section,
 * a column the style `pinned` of its first section.
 * @param {HTMLElement} main The main container element
 */
function buildSectionRows(main) {
  let row = null;
  let col = null;
  let width = 0;
  [...main.children].forEach((section) => {
    const styles = [...section.classList];
    const span = styles.find((c) => /^span-\d+$/.test(c));
    if (!span) {
      row = null;
      return;
    }
    if (!row || !styles.includes('stack')) {
      const offset = styles.find((c) => /^offset-\d+$/.test(c));
      const size = Number(span.slice(5)) + Number(offset?.slice(7) ?? 0);
      if (!row || width + size > 12 || styles.includes('row')) {
        row = document.createElement('div');
        row.className = 'section-row';
        section.before(row);
        width = 0;
        styles.filter((c) => ROW_STYLE.test(c)).forEach((c) => {
          row.classList.add(c);
          section.classList.remove(c);
        });
      }
      width += size;
      col = document.createElement('div');
      col.className = ['section-col', span, offset].filter(Boolean).join(' ');
      // the source's sticky left cell
      if (section.classList.contains('pinned')) {
        section.classList.remove('pinned');
        col.classList.add('pinned');
      }
      row.append(col);
      row.style.setProperty('--cols', row.children.length);
    }
    col.append(section);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  decorateIconMasks(main);
  decorateSections(main);
  // the anchor of the source, as written: the pipeline would rewrite an `Id` as a class name
  main.querySelectorAll(':scope > .section[data-anchor]').forEach((section) => {
    section.id = section.dataset.anchor;
  });
  buildSectionRows(main);
  decorateBlocks(main);
  decorateButtons(main);
  decorateDefaultContent(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = getLanguage();
  decorateTemplateAndTheme();
  // the source's `data-page-type="home-page"`: the five language home pages
  if (window.location.pathname.replace(/\/$/, '') === languageRoot()) {
    doc.body.classList.add('home-page');
  }
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
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
