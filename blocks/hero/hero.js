import { createSlider } from '../../scripts/slider.js';

const PLAYER = /players\.brightcove\.net|youtube\.com|youtu\.be/;
const AUTOPLAY = 7000;
const RENDITIONS = [375, 480, 730, 992, 1200, 1900];
const wide = window.matchMedia('(width >= 730px)');

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children.filter(Boolean));
  return node;
}

/** The player page of a video link, as an iframe for the modal. */
function player(href) {
  const url = new URL(href);
  if (/youtu/.test(url.hostname)) {
    const id = url.searchParams.get('v') ?? url.pathname.split('/').pop();
    url.href = `https://www.youtube.com/embed/${id}`;
  }
  url.searchParams.set('autoplay', url.hostname.includes('youtube') ? '1' : 'true');
  const frame = el('iframe');
  frame.src = url.href;
  frame.title = 'Video';
  frame.allow = 'autoplay; encrypted-media; fullscreen';
  frame.allowFullscreen = true;
  return frame;
}

/** Plays a background video. Where the browser refuses, the image stays. */
const play = (video, slide) => video.play()?.catch(() => slide.classList.add('no-autoplay'));

/**
 * The background video: muted, looping. An interactive banner and a carousel slide show the
 * image below 730, and load no video there. In a carousel it plays while its slide shows.
 */
function buildVideo(href, poster, slide, carousel) {
  const wideOnly = carousel || slide.matches('.interactive');
  const video = el('video', 'hero-video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = !carousel;
  if (poster) video.poster = poster.src.replace(/width=\d+/, 'width=2000');
  const load = () => {
    if (video.src || (wideOnly && !wide.matches)) return;
    video.src = href;
    if (!carousel || slide.getAttribute('aria-hidden') === 'false') play(video, slide);
  };
  load();
  wide.addEventListener('change', load);
  return video;
}

/**
 * The source's renditions of a banner image. It gives no `sizes`, so the viewport width picks
 * one, and the image is as soft as the source's where the banner is taller than the rendition.
 */
function renditions(img) {
  const { pathname } = new URL(img.src, window.location.href);
  if (!pathname.includes('/media_') || pathname.endsWith('.svg')) return;
  img.closest('picture')?.querySelectorAll('source').forEach((source) => source.remove());
  img.srcset = RENDITIONS
    .map((w) => `${pathname}?width=${w}&format=webply&optimize=medium ${w}w`).join(', ');
}

/** Cell 1: desktop image, mobile image; or the mp4 link, its poster, the mobile image. */
function buildMedia(cell, slide, carousel) {
  const link = cell?.querySelector('a[href]');
  const images = [...(cell?.querySelectorAll('img') ?? [])];
  const only = slide.classList.contains('mobile-image-only');
  const [first, second] = images.map((img) => img.closest('picture') ?? img);
  const desktop = link || only ? null : first;
  const mobile = link || !only ? second : first;
  // a background is part of the banner: it loads with the block, not when it scrolls into view
  images.forEach((img) => img.setAttribute('loading', 'eager'));
  images.slice(link ? 1 : 0).forEach(renditions);
  desktop?.classList.add('hero-image');
  mobile?.classList.add('hero-image-mobile');
  slide.classList.toggle('has-mobile-image', !!mobile);
  // the source lays the text under the mobile image, except in these three kinds
  slide.classList.toggle('stacked', !!mobile && !slide.matches('.skinny, .classic, .video'));
  return el(
    'div',
    'hero-media',
    link && buildVideo(link.href, images[0], slide, carousel),
    desktop,
    mobile,
    el('div', 'hero-shade'),
  );
}

/** A button of the source: icon before the label for video and download, the video in a modal. */
function buildButton(a) {
  const icon = a.querySelector('.icon');
  if (icon && !icon.classList.contains('icon-chevron-right')) {
    // beside a leading icon the label is a box of its own: its lines start at the left
    const label = el('span', 'hero-label', ...[...a.childNodes].filter((n) => n !== icon));
    a.replaceChildren(icon, label);
  }
  if (PLAYER.test(a.href)) {
    a.classList.add('video-link');
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      const { default: openModal } = await import('../../scripts/modal.js');
      openModal(player(a.href));
    });
  } else if (a.hostname !== window.location.hostname) {
    // as the source: its buttons to other sites (news, events, careers) open in a new tab
    a.target = '_blank';
    a.rel = 'noopener';
  }
  return a;
}

/**
 * Cell 2: the title, then the subtitle and the buttons. In a carousel the paragraph before
 * the title is the label of the slide's tab.
 */
function buildCopy(cell, slide, carousel) {
  const children = [...(cell?.children ?? [])];
  const title = children.find((c) => /^H[1-6]$/.test(c.tagName));
  const label = carousel && title ? children.slice(0, children.indexOf(title)) : [];
  const rest = children.filter((c) => c !== title && !label.includes(c));
  if (carousel) slide.append(el('span', 'hero-tab', ...label.flatMap((p) => [...p.childNodes])));
  title?.classList.add('hero-title');
  // a blank last line of the title: the pipeline keeps its line break and drops its space
  if (title?.lastChild?.nodeName === 'BR') title.append('\u00a0');
  const buttons = rest.filter((c) => c.matches('.button-wrapper'))
    .flatMap((p) => [...p.querySelectorAll('a')]).map(buildButton);
  // the source always has the subtitle box: empty, it still takes its margin
  const subtitle = el('div', 'hero-subtitle', ...rest.filter((c) => !c.matches('.button-wrapper')));
  // a blank paragraph of the source: the pipeline drops an empty one, so it is a variant
  if (slide.matches('.blank-before')) subtitle.prepend(el('p', '', '\u00a0'));
  if (slide.matches('.blank-after')) subtitle.append(el('p', '', '\u00a0'));
  slide.classList.toggle('has-video-link', buttons.some((a) => a.matches('.video-link')));
  const body = el('div', 'hero-body', subtitle, el('div', 'hero-buttons', ...buttons));
  return el('div', 'hero-text', el('div', 'hero-middle', el('div', 'hero-copy', title, body)));
}

function buildSlide(row, variants, carousel) {
  const [mediaCell, textCell, frontCell, optionCell] = row.children;
  const options = (optionCell?.textContent ?? '').split(',')
    .map((o) => o.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean);
  const slide = el('div', ['hero-slide', ...variants, ...options].join(' '));
  const front = frontCell?.querySelector('picture, img');
  front?.querySelector('img')?.setAttribute('loading', 'eager');
  if (front) slide.classList.add('has-foreground');
  slide.append(
    buildMedia(mediaCell, slide, carousel),
    el(
      'div',
      'hero-content',
      buildCopy(textCell, slide, carousel),
      front && el('div', 'hero-foreground', el('div', 'hero-foreground-inner', front)),
    ),
  );
  return slide;
}

/** The home page carousel: fade, a tab per slide with its progress bar, a pause button. */
function buildCarousel(block, slides) {
  const track = el('div', 'hero-slides', ...slides);
  block.append(track);
  const slider = createSlider(track, { arrows: false });
  // as the source: a swipe changes the slide, a drag with the mouse does not
  block.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') e.stopPropagation();
  }, true);
  const dots = [...block.querySelectorAll('.slider-dot')];
  dots.forEach((dot, i) => dot.append(slides[i].querySelector(':scope > .hero-tab')));
  const pause = el('button', 'hero-pause');
  pause.type = 'button';
  pause.setAttribute('aria-label', 'Pause');
  block.querySelector('.slider').append(pause);

  // the rotation is an interval, so that a test can hold it still; a pause keeps the time left
  let timer = 0;
  let started = 0;
  let left = AUTOPLAY;
  const stop = () => clearInterval(timer);
  const run = (delay) => {
    stop();
    started = Date.now();
    left = delay;
    timer = setInterval(() => slider.next(), delay);
  };
  // as the source: the video of a slide plays while its slide shows, then starts again
  const cue = () => slides.forEach((slide) => {
    const video = slide.querySelector('video[src]');
    if (!video) return;
    if (slide.getAttribute('aria-hidden') === 'false') play(video, slide);
    else {
      video.pause();
      video.currentTime = 0;
    }
  });
  cue();
  // a slide that leaves is inert and drops the focus: after an arrow key its tab takes it
  let byKey = false;
  block.addEventListener('keydown', (e) => { byKey = e.key.startsWith('Arrow'); }, true);
  new MutationObserver(() => {
    if (!block.classList.contains('paused')) run(AUTOPLAY);
    cue();
    if (byKey) dots.find((dot) => dot.hasAttribute('aria-current'))?.focus();
    byKey = false;
  }).observe(dots[0].parentElement, { attributeFilter: ['aria-current'], subtree: true });
  pause.addEventListener('click', () => {
    const paused = block.classList.toggle('paused');
    pause.setAttribute('aria-label', paused ? 'Play' : 'Pause');
    if (paused) {
      stop();
      left -= Date.now() - started;
    } else run(Math.max(left, 0));
  });
  run(AUTOPLAY);
}

export default function decorate(block) {
  const variants = [...block.classList].filter((c) => !['hero', 'block', 'carousel'].includes(c));
  const rows = [...block.children];
  const carousel = rows.length > 1;
  block.classList.toggle('carousel', carousel);
  const slides = rows.map((row) => buildSlide(row, variants, carousel));
  block.replaceChildren();
  if (carousel) buildCarousel(block, slides);
  else block.append(...slides);
}
