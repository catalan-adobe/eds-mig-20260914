import { createOptimizedPicture } from '../../scripts/aem.js';

const AUTOPLAY_MS = 7000;

/**
 * Replaces an authored <picture><img></picture> with an optimized picture.
 * @param {Element} picture The authored picture element
 * @param {boolean} eager Whether the image is the LCP candidate
 * @returns {Element} The optimized picture element
 */
function optimize(picture, eager) {
  const img = picture.querySelector('img');
  if (!img) return picture;
  const optimized = createOptimizedPicture(img.src, img.alt, eager);
  picture.replaceWith(optimized);
  return optimized;
}

/**
 * Builds one slide's DOM from an authored row.
 * Row cells: [images (1-2 pictures: desktop?, mobile)] [foreground image, optional]
 * [content: h2 + p + button paragraphs] [tab label text].
 * @param {Element} row The authored block row
 * @param {number} index The slide index
 * @returns {{slide: Element, label: string}} The built slide and its tab label
 */
function buildSlide(row, index) {
  const [imagesCell, foregroundCell, contentCell, labelCell] = row.children;
  const pictures = imagesCell ? [...imagesCell.querySelectorAll('picture')] : [];
  const hasDesktop = pictures.length > 1;
  const desktopPicture = hasDesktop ? pictures[0] : null;
  const mobilePicture = hasDesktop ? pictures[1] : pictures[0];
  const foregroundPicture = foregroundCell ? foregroundCell.querySelector('picture') : null;

  const slide = document.createElement('li');
  slide.className = 'hero-carousel-slide';
  slide.setAttribute('role', 'tabpanel');
  slide.id = `hero-carousel-slide-${index}`;
  slide.setAttribute('aria-labelledby', `hero-carousel-tab-${index}`);

  const media = document.createElement('div');
  media.className = 'hero-carousel-media';
  const desktopBox = document.createElement('div');
  desktopBox.className = 'hero-carousel-bg-desktop';
  if (desktopPicture) desktopBox.append(optimize(desktopPicture, index === 0));
  const mobileBox = document.createElement('div');
  mobileBox.className = 'hero-carousel-bg-mobile';
  if (mobilePicture) mobileBox.append(optimize(mobilePicture, index === 0));
  const overlay = document.createElement('div');
  overlay.className = 'hero-carousel-overlay';
  media.append(desktopBox, mobileBox, overlay);

  const content = document.createElement('div');
  content.className = 'hero-carousel-content';
  if (contentCell) content.append(...contentCell.childNodes);
  const ctas = [...content.querySelectorAll('p.button-wrapper')];
  if (ctas.length) {
    const ctaWrapper = document.createElement('div');
    ctaWrapper.className = 'hero-carousel-ctas';
    ctaWrapper.append(...ctas);
    content.append(ctaWrapper);
  }

  const inner = document.createElement('div');
  inner.className = 'hero-carousel-inner';
  inner.append(content);
  if (foregroundPicture) {
    const fgBox = document.createElement('div');
    fgBox.className = 'hero-carousel-foreground';
    fgBox.append(optimize(foregroundPicture, false));
    inner.append(fgBox);
  }

  slide.append(media, inner);
  const label = labelCell ? labelCell.textContent.trim() : content.querySelector('h2')?.textContent.trim();
  return { slide, label };
}

/**
 * Builds the tab bar (label + progress track) for one slide.
 * @param {string} label The slide's accessible/tab label
 * @param {number} index The slide index
 * @returns {Element} The tab list item
 */
function buildTab(label, index) {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.id = `hero-carousel-tab-${index}`;
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-controls', `hero-carousel-slide-${index}`);
  button.tabIndex = index === 0 ? 0 : -1;
  button.textContent = label || '';
  const track = document.createElement('span');
  track.className = 'hero-carousel-progress';
  const bar = document.createElement('span');
  bar.className = 'hero-carousel-progress-bar';
  track.append(bar);
  button.append(track);
  li.append(button);
  return li;
}

/**
 * Wires up autoplay, fade transitions, tabs and pause/play for the carousel.
 * @param {Element} block The decorated hero-carousel block
 * @param {Element[]} slides The slide <li> elements
 * @param {Element[]} tabs The tab <button> elements
 * @param {Element} pauseBtn The pause/play control
 */
function initCarousel(block, slides, tabs, pauseBtn) {
  let active = 0;
  let paused = false;
  let elapsed = 0;
  let segmentStart = 0;
  let timer;

  const currentBar = () => tabs[active].querySelector('.hero-carousel-progress-bar');

  const setActive = (index) => {
    slides[active].classList.remove('is-active');
    slides[active].querySelectorAll('a').forEach((a) => { a.tabIndex = -1; });
    tabs[active].setAttribute('aria-selected', 'false');
    tabs[active].tabIndex = -1;
    active = index;
    slides[active].classList.add('is-active');
    slides[active].querySelectorAll('a').forEach((a) => { a.removeAttribute('tabindex'); });
    tabs[active].setAttribute('aria-selected', 'true');
    tabs[active].tabIndex = 0;
  };

  const playSegment = (remainingMs) => {
    const bar = currentBar();
    bar.style.transition = `width ${remainingMs}ms linear`;
    bar.style.width = '100%';
    segmentStart = Date.now();
    clearTimeout(timer);
    timer = setTimeout(() => {
      setActive((active + 1) % slides.length);
      elapsed = 0;
      const bar2 = currentBar();
      bar2.style.transition = 'none';
      bar2.style.width = '0';
      bar2.getBoundingClientRect();
      playSegment(AUTOPLAY_MS);
    }, remainingMs);
  };

  const goTo = (index) => {
    if (index === active) return;
    clearTimeout(timer);
    currentBar().style.transition = 'none';
    currentBar().style.width = '0';
    setActive(index);
    elapsed = 0;
    paused = false;
    pauseBtn.setAttribute('aria-label', 'Pause');
    pauseBtn.dataset.state = 'playing';
    const bar = currentBar();
    bar.style.transition = 'none';
    bar.style.width = '0';
    bar.getBoundingClientRect();
    playSegment(AUTOPLAY_MS);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => goTo(index));
  });

  block.querySelector('.hero-carousel-tabs').addEventListener('keydown', (event) => {
    const dir = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (dir) {
      event.preventDefault();
      goTo((active + dir + slides.length) % slides.length);
      tabs[active].focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      goTo(0);
      tabs[0].focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      goTo(slides.length - 1);
      tabs[active].focus();
    }
  });

  pauseBtn.addEventListener('click', () => {
    if (paused) {
      paused = false;
      pauseBtn.setAttribute('aria-label', 'Pause');
      pauseBtn.dataset.state = 'playing';
      playSegment(AUTOPLAY_MS - elapsed);
    } else {
      paused = true;
      clearTimeout(timer);
      elapsed = Math.min(elapsed + (Date.now() - segmentStart), AUTOPLAY_MS);
      const fraction = (elapsed / AUTOPLAY_MS) * 100;
      const bar = currentBar();
      bar.style.transition = 'none';
      bar.style.width = `${fraction}%`;
      pauseBtn.setAttribute('aria-label', 'Play');
      pauseBtn.dataset.state = 'paused';
    }
  });

  setActive(0);
  playSegment(AUTOPLAY_MS);
}

export default function decorate(block) {
  const rows = [...block.children];
  const slides = [];
  const labels = [];
  rows.forEach((row, index) => {
    const { slide, label } = buildSlide(row, index);
    slides.push(slide);
    labels.push(label);
  });

  const list = document.createElement('ul');
  list.className = 'hero-carousel-slides';
  list.append(...slides);
  slides[0].classList.add('is-active');

  const tabs = document.createElement('ul');
  tabs.className = 'hero-carousel-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Carousel slides');
  const tabItems = labels.map((label, index) => buildTab(label, index));
  tabs.append(...tabItems);

  const pauseBtn = document.createElement('button');
  pauseBtn.type = 'button';
  pauseBtn.className = 'hero-carousel-pause';
  pauseBtn.dataset.state = 'playing';
  pauseBtn.setAttribute('aria-label', 'Pause');
  pauseBtn.innerHTML = '<svg class="icon-pause" viewBox="0 0 320 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg><svg class="icon-play" viewBox="0 0 320 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M320 256 0 448V64z"/></svg>';

  block.innerHTML = '';
  block.append(list, tabs, pauseBtn);

  const tabButtons = [...tabs.querySelectorAll('button')];
  initCarousel(block, slides, tabButtons, pauseBtn);
}
