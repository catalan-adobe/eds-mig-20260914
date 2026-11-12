import { decorateBlock, loadBlock } from '../../scripts/aem.js';

const WIDTH = /^w-(\d+)-(\d+)$/;
const VIDEO = /players\.brightcove\.net|youtube\.com|youtu\.be/;
const FLOW = 'P, H1, H2, H3, H4, H5, H6, UL, OL, DIV, PICTURE, TABLE, PRE, BLOCKQUOTE';
const HEADING_ONLY = ':scope > :is(h1, h2, h3, h4, h5, h6):only-child';

const isImage = (el) => !el.textContent.trim()
  && !!el.querySelector('picture, img:not([data-icon-name])');

/** The link of a cell that holds a video: its only text is the URL of a player. */
function videoLink(cell) {
  const a = cell.querySelector('a[href]');
  const text = cell.textContent.trim();
  return a && VIDEO.test(a.href) && text === a.textContent.trim()
    && (text === a.href || text === a.getAttribute('href')) ? a : null;
}

/** A paragraph with only a link whose text is its own URL: the link of the image before it. */
function urlLink(p) {
  const a = p?.tagName === 'P' && p.children.length === 1 && p.querySelector(':scope > a[href]');
  if (!a) return null;
  const text = p.textContent.trim();
  return text === a.getAttribute('href') || text === a.href ? a : null;
}

/**
 * The pipeline delivers the only paragraph of a cell without its `p`, after scripts.js looked
 * for buttons. Wraps it again, as the button or call-to-action link it is.
 */
function wrapParagraph(cell) {
  const bare = cell.textContent.trim() || cell.children.length;
  if (!bare || [...cell.children].some((el) => el.matches(FLOW))) return;
  const p = document.createElement('p');
  p.append(...cell.childNodes);
  cell.append(p);
  const emphasis = p.children.length === 1 && p.querySelector(':scope > strong, :scope > em');
  const a = (emphasis || p).querySelector(':scope > a[href]');
  if (!a || p.textContent.trim() !== a.textContent.trim()) return;
  if (emphasis) {
    a.className = `button ${emphasis.tagName === 'STRONG' ? 'primary' : 'secondary'}`;
    p.replaceChildren(a);
  } else if (a.lastChild === a.querySelector('.icon-chevron-right')) {
    a.className = 'cta-link';
  } else return;
  p.className = 'button-wrapper';
}

/** A list of plain links, with an optional h5 above it: the source's pageList. */
function isLinkList(children) {
  const list = children.at(-1);
  const alone = children.length === 1 || (children.length === 2 && children[0].tagName === 'H5');
  return list.tagName === 'UL' && alone && [...list.children].every((li) => {
    const a = li.firstElementChild;
    return li.children.length === 1 && a.tagName === 'A' && !li.querySelector('.icon')
      && li.textContent.trim() === a.textContent.trim();
  });
}

/** A list of download links, with an optional heading above it: the source's downloads. */
function isDownloads(children) {
  const list = children.at(-1);
  const icon = ':scope > a > .icon-download:first-child';
  const alone = children.length === 1
    || (children.length === 2 && /^H[1-6]$/.test(children[0].tagName));
  return list.tagName === 'UL' && alone && !!list.children.length
    && [...list.children].every((li) => li.querySelector(icon));
}

/** An image paragraph followed by a paragraph with only its URL: the image becomes the link. */
function linkImages(cell) {
  [...cell.children].filter((p) => p.tagName === 'P' && isImage(p)).forEach((p) => {
    const a = urlLink(p.nextElementSibling);
    if (!a) return;
    a.parentElement.remove();
    a.replaceChildren(...p.childNodes);
    p.append(a);
  });
}

/**
 * A cell of a plain row is the default content of a section: it gets what scripts.js gives a
 * `.default-content-wrapper` (title, image, linked image, link list, social links), and that
 * class, so that the global styles of default content apply.
 */
function decorateContent(cell, section) {
  linkImages(cell);
  const children = [...cell.children];
  if (!children.length) return;
  const rich = !!section?.classList.contains('rich-text');
  // a cell may hold an image component above a text: the text starts after the images
  const text = children.find((el) => !isImage(el));
  cell.classList.add('default-content-wrapper');
  if (isDownloads(children)) {
    cell.classList.add('columns-downloads');
    return;
  }
  if (!text) cell.classList.add('image');
  else if (!rich) {
    children.slice(0, children.indexOf(text)).forEach((p) => p.classList.add('columns-image'));
    if (text.tagName === 'H2' && !section?.classList.contains('no-title')) {
      text.classList.add('title');
    }
  }
  if (isLinkList(children)) cell.classList.add('link-list');
  children.filter((p) => p.tagName === 'P' && p.children.length && !p.textContent.trim()
    && [...p.children].every((a) => a.tagName === 'A' && a.querySelector(':scope > .icon')))
    .forEach((p) => p.classList.add('social-links'));
  if (!rich && !cell.matches('.image, .link-list')) cell.classList.add('text-content');
}

/** The video of a media cell is drawn by the `video` block. */
function buildVideo(cell, modal) {
  const video = document.createElement('div');
  video.className = modal ? 'video modal' : 'video';
  video.innerHTML = '<div><div></div></div>';
  video.firstElementChild.firstElementChild.append(...cell.childNodes);
  const wrapper = document.createElement('div');
  wrapper.append(video);
  cell.append(wrapper);
  decorateBlock(video);
  return loadBlock(video);
}

/** The text cell of a `media` row: the source's imageTextCta, or its `narrow`, or its `card`. */
function decorateText(cell, row, block) {
  if (!block.matches('.narrow, .card')) {
    cell.classList.add('text-content');
    const title = cell.querySelector(':scope > h2:first-child');
    title?.classList.add('title');
    const subtitle = cell.querySelector(':scope > h2:first-child + h3, :scope > h3:first-child');
    subtitle?.classList.add('subtitle');
    // the ends of the text, for the `blank-before` and `blank-after` variants
    const body = [...cell.children].filter((el) => ![title, subtitle].includes(el)
      && !el.classList.contains('button-wrapper'));
    body[0]?.classList.add('columns-first');
    body.at(-1)?.classList.add('columns-last');
    return;
  }
  cell.classList.add('columns-text');
  if (!block.classList.contains('narrow')) return;
  const last = cell.lastElementChild;
  const link = last?.tagName === 'P' && last.children.length === 1
    && last.textContent.trim() === last.firstElementChild.textContent.trim()
    && last.querySelector(':scope > a[href]');
  if (!link) return;
  last.classList.add('columns-link');
  // the source opens the link from anywhere on the row
  row.classList.add('columns-linked');
  row.addEventListener('click', (event) => {
    if (!event.target.closest('a')) window.location.assign(link.href);
  });
}

/** The width of each cell in twelfths: the `w-N-M` variant, 4 | 8 for `narrow`, else equal. */
function spans(block, cells) {
  const width = [...block.classList].map((c) => c.match(WIDTH)).find(Boolean);
  if (cells.length === 2 && width) return [width[1], width[2]];
  if (cells.length === 2 && block.classList.contains('narrow')) {
    const media = cells.map((cell) => !!cell.querySelector('picture, img, .video'));
    // an empty cell stands for the part that is missing
    const text = media[0] === media[1] ? cells.map((cell) => !!cell.textContent.trim())
      : media.map((has) => !has);
    return text[0] === text[1] ? [6, 6] : text.map((wide) => (wide ? 8 : 4));
  }
  const count = Number(block.className.match(/\bcols-(\d)\b/)?.[1] ?? cells.length);
  return cells.map(() => Math.floor(12 / count) || 1);
}

export default async function decorate(block) {
  const section = block.closest('.section');
  const media = block.classList.contains('media');
  const videos = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    cells.forEach((cell) => {
      const video = media && videoLink(cell);
      if (video) videos.push(buildVideo(cell, block.classList.contains('video-modal')));
      if (media && (video || isImage(cell) || !cell.textContent.trim())) {
        cell.classList.add('columns-media');
        return;
      }
      wrapParagraph(cell);
      if (media) decorateText(cell, row, block);
      else decorateContent(cell, section);
    });
    if (cells.length === 1 && cells[0].querySelector(HEADING_ONLY)) {
      row.classList.add('columns-title');
    }
    row.style.setProperty('--cols', cells.length);
    spans(block, cells).forEach((span, i) => cells[i].style.setProperty('--span', span));
  });
  await Promise.all(videos);
}
