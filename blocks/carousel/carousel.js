import { createSlider } from '../../scripts/slider.js';
import openModal from '../../scripts/modal.js';

const AUTOPLAY = /^autoplay(?:-(\d+))?$/;
const PLAYER = /^https:\/\/players\.brightcove\.net\/(\d+)\/[^/]+\/index\.html\?/;
const VISIBLE_LOGOS = 5;
// the thumbnails in view by width, as the source's
const THUMBS = {
  0: 3, 420: 4, 640: 5, 1024: 6,
};
const thumbsInView = () => Object.entries(THUMBS)
  .reduce((count, [min, n]) => (window.innerWidth >= min ? n : count), 3);
const desktop = window.matchMedia('(width >= 730px)');
// the source's slider follows the height of its slide only between these widths
const adaptive = window.matchMedia('(width > 480px) and (width < 730px)');

function element(tag, className, ...children) {
  const el = document.createElement(tag);
  el.className = className;
  el.append(...children);
  return el;
}

function button(className, label) {
  const el = element('button', className);
  el.type = 'button';
  el.setAttribute('aria-label', label);
  return el;
}

/** Calls `fn` with the index of the slide in view each time the slider of `track` moves. */
function onChange(track, fn) {
  const current = () => [...track.children]
    .findIndex((slide) => slide.getAttribute('aria-hidden') !== 'true');
  new MutationObserver(() => fn(current()))
    .observe(track, { attributes: true, subtree: true, attributeFilter: ['aria-hidden'] });
}

/**
 * From 481 to 729 px the source's slider is as high as the slide in view. The height follows
 * the slide, so it is right again when images load or a hidden tab panel opens.
 */
function adaptHeight(track) {
  const viewport = track.parentElement;
  const adapt = () => {
    const slide = [...track.children].find((s) => s.getAttribute('aria-hidden') !== 'true');
    const height = adaptive.matches ? slide?.offsetHeight : 0;
    viewport.style.height = height ? `${height}px` : '';
  };
  const sizes = new ResizeObserver(adapt);
  [...track.children].forEach((slide) => sizes.observe(slide));
  onChange(track, adapt);
  adaptive.addEventListener('change', adapt);
}

const policyKeys = {};
/** The poster of a Brightcove video, read as its player does. */
async function loadPoster(href, img) {
  const [page, account] = href.match(PLAYER);
  const config = page.replace(/index\.html\?$/, 'config.json');
  policyKeys[config] ??= fetch(config).then((response) => response.json())
    .then((json) => json.video_cloud.policy_key);
  const id = new URL(href).searchParams.get('videoId');
  const response = await fetch(
    `https://edge.api.brightcove.com/playback/v1/accounts/${account}/videos/${id}`,
    { headers: { Accept: `application/json;pk=${await policyKeys[config]}` } },
  );
  if (!response.ok) throw new Error(`Brightcove video ${id}: ${response.status}`);
  img.src = (await response.json()).poster;
}

function player(href) {
  const frame = element('iframe', 'carousel-player');
  frame.src = `${href}&autoplay=true`;
  frame.title = 'Video player';
  frame.allow = 'autoplay; encrypted-media; fullscreen';
  return frame;
}

/**
 * A paragraph that holds only the link to a video player becomes the video: the image before
 * it as the poster, else the video's own, a play button, and the player in the modal.
 */
function decorateVideos(block) {
  block.querySelectorAll('.carousel-cell p > a:only-child').forEach((link) => {
    const { href } = link;
    const text = link.parentElement;
    if (!PLAYER.test(href) || text.textContent.trim() !== href) return;
    const before = text.previousElementSibling;
    let poster = before?.children.length === 1 && before.querySelector(':scope > picture');
    if (poster) before.remove();
    else {
      poster = element('img', '');
      poster.alt = '';
      // eslint-disable-next-line no-console
      loadPoster(href, poster).catch((e) => console.warn(`carousel: no poster. ${e.message}`));
    }
    const play = button('carousel-play', 'Play video');
    play.addEventListener('click', () => openModal(player(href)));
    text.replaceWith(element('div', 'carousel-video', poster, play));
  });
}

/**
 * The look of the source's components in a cell: an image fills the cell and is the link that
 * follows it, a text has its title. With `rich` the text keeps the type scale of rich text.
 */
function decorateCell(cell, rich) {
  cell.querySelectorAll(':scope > p > a:only-child').forEach((link) => {
    const text = link.parentElement;
    const before = text.previousElementSibling;
    const picture = before?.querySelector(':scope > picture:only-child');
    if (!picture || text.textContent.trim() !== link.getAttribute('href')) return;
    link.replaceChildren(picture);
    before.remove();
  });
  const isImage = (el) => el.matches('picture')
    || (!el.textContent.trim() && el.querySelector('picture'));
  const isMedia = (el) => isImage(el) || el.matches('.carousel-video');
  const parts = [...cell.children];
  if (parts.length && parts.every(isImage)) cell.classList.add('carousel-image');
  else if (!rich && (cell.textContent.trim() || !parts.every(isMedia))) {
    cell.classList.add('text-content');
    cell.querySelector(':scope > h2:first-child')?.classList.add('title');
  }
}

/** Content slides: one row per slide, one cell per column of the slide. */
function decorateSlides(block) {
  const track = element('div', 'carousel-track');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('img')) {
      row.remove();
      return;
    }
    row.className = 'carousel-slide';
    [...row.children].forEach((cell) => cell.classList.add('carousel-cell'));
    track.append(row);
  });
  block.append(track);
  decorateVideos(block);
  const rich = block.classList.contains('rich-text');
  track.querySelectorAll('.carousel-cell').forEach((cell) => decorateCell(cell, rich));
  if (track.children.length < 2) return;
  const seconds = [...block.classList].map((name) => name.match(AUTOPLAY)).find(Boolean);
  const autoplay = seconds ? Number(seconds[1] ?? 6) * 1000 : 0;
  const fade = block.classList.contains('fade');
  if (!block.classList.contains('no-mobile')) {
    createSlider(track, { autoplay });
    if (!fade) adaptHeight(track);
    return;
  }
  // `no-mobile`: the slides follow each other below 730 px
  let slider = null;
  const toggle = () => {
    if (desktop.matches && !slider) slider = createSlider(track, { autoplay });
    else if (!desktop.matches && slider) {
      slider.destroy();
      slider = null;
    }
  };
  desktop.addEventListener('change', toggle);
  toggle();
}

/** The image of a row with its caption and the link to its file. */
function readImage(row) {
  const [media, text] = row.children;
  const link = text?.querySelector('a[href]');
  const caption = [...(text?.querySelectorAll('p') ?? [])].find((p) => !p.contains(link))
    ?? (link ? null : text);
  return {
    picture: media?.querySelector('picture, img'),
    caption: caption?.textContent.trim() ?? '',
    href: link?.href,
  };
}

/**
 * The stage of an image carousel with its thumbnails: one image in view, a counter, arrows
 * and `corner`, the control in its upper right corner.
 * @param {object[]} images { picture, caption, href } of each slide
 * @param {Element} corner The button that opens the dialog, or the download link
 * @param {Function} onShow Called with the index of the image in view
 * @param {boolean} paged True when the thumbnails are a strip that follows the image in view
 * @returns {{nodes: Element[], go: Function}} what to place, and a way to show an image
 */
function gallery(images, corner, onShow, paged) {
  const track = element('div', 'carousel-track', ...images.map(({ picture, caption }) => {
    const figure = element('figure', 'carousel-slide', picture.cloneNode(true));
    if (caption) figure.append(element('figcaption', 'carousel-caption', caption));
    return figure;
  }));
  const count = element('p', 'carousel-count');
  const stage = element('div', 'carousel-stage', track, count, corner);
  const slider = createSlider(track, { dots: false });
  const thumbs = element('ul', 'carousel-thumbs', ...images.map(({ picture, caption }, i) => {
    const thumb = button('carousel-thumb', caption || `Image ${i + 1}`);
    thumb.append(picture.cloneNode(true));
    thumb.addEventListener('click', () => slider.go(i));
    return element('li', '', thumb);
  }));
  const strip = paged && createSlider(thumbs, {
    perView: THUMBS, dots: false, arrows: false, loop: false,
  });
  const show = (index) => {
    count.textContent = `${index + 1}/${images.length}`;
    [...thumbs.children].forEach((li, i) => li.classList.toggle('active', i === index));
    // the strip turns by whole pages, as the source's
    if (strip) strip.go(index - (index % thumbsInView()));
    onShow(index);
  };
  onChange(track, show);
  show(0);
  return { nodes: [stage, thumbs.closest('.slider') ?? thumbs], go: slider.go };
}

/** The dialog of an image carousel: the gallery over the page, with the download links. */
function openZoom(block, images, index) {
  const dialog = element('dialog', 'carousel-zoom');
  const close = button('carousel-close', 'Close');
  const download = element('a', 'carousel-download');
  download.setAttribute('aria-label', 'Download');
  const { nodes, go } = gallery(images, download, (i) => {
    download.hidden = !images[i].href;
    if (images[i].href) download.href = images[i].href;
  }, false);
  dialog.append(element('div', 'carousel-zoom-body', close, ...nodes));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => dialog.remove());
  block.append(dialog);
  dialog.showModal();
  go(index);
}

/** `images`: a row is the image, then its caption and the link to its file. */
function decorateImages(block) {
  const images = [...block.children].map(readImage).filter((image) => image.picture);
  if (!images.length) return;
  let index = 0;
  const expand = button('carousel-expand', 'Enlarge');
  expand.addEventListener('click', () => openZoom(block, images, index));
  block.replaceChildren(...gallery(images, expand, (i) => { index = i; }, true).nodes);
}

/** `logos`: a row is the logo, then its link. The strip runs without end. */
function decorateLogos(block) {
  const logos = [...block.children].map((row) => {
    const [media, more] = row.children;
    const picture = media?.querySelector('picture, img');
    const link = more?.querySelector('a[href]');
    if (!picture) return null;
    if (link) {
      link.setAttribute('aria-label', link.textContent.trim());
      link.replaceChildren(picture);
    }
    return element('li', 'carousel-logo', link ?? picture);
  }).filter(Boolean);
  const track = element('ul', 'carousel-track', ...logos);
  // copies fill the strip while the first logos leave it
  while (logos.length && track.children.length < logos.length + VISIBLE_LOGOS) {
    logos.forEach((logo) => {
      const copy = logo.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.inert = true;
      track.append(copy);
    });
  }
  track.style.setProperty('--logos', logos.length);
  block.replaceChildren(track);
}

export default function decorate(block) {
  if (block.classList.contains('logos')) decorateLogos(block);
  else if (block.classList.contains('images')) decorateImages(block);
  else decorateSlides(block);
}
