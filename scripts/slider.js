// One slider for hero, cards, teasers, quote and carousel. It adds the structure and the
// behaviour; a block draws the arrows and dots of its source component in its own CSS.
// Structure: div.slider > div.slider-viewport > track.slider-track, button.slider-prev,
// button.slider-next, div.slider-dots > button. Styles: styles/styles.css. A block sets the gap
// between slides with `--slider-gap` on `.slider`.

const SWIPE = 40;

const perViewAt = (perView, width) => (typeof perView === 'number' ? perView : Object.keys(perView)
  .map(Number).sort((a, b) => a - b).reduce((n, min) => (width >= min ? perView[min] : n), 1));

function control(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  return button;
}

/**
 * Turns the children of `track` into slides.
 * @param {Element} track The element whose children are the slides
 * @param {object} [options]
 * @param {number|object} [options.perView] Slides in view, or by minimum width: { 0: 1, 730: 3 }.
 *   The slider moves by that many slides, and has one dot per step.
 * @param {number} [options.autoplay] Milliseconds between steps; pauses on hover and focus
 * @param {boolean} [options.dots] Default true
 * @param {boolean} [options.arrows] Default true
 * @param {boolean} [options.loop] Default true: the ends wrap around
 * @returns {{go: Function, next: Function, prev: Function, destroy: Function}}
 */
// eslint-disable-next-line import/prefer-default-export
export function createSlider(track, {
  perView = 1, autoplay = 0, dots = true, arrows = true, loop = true,
} = {}) {
  const slider = document.createElement('div');
  slider.className = 'slider';
  const viewport = document.createElement('div');
  viewport.className = 'slider-viewport';
  track.before(slider);
  viewport.append(track);
  slider.append(viewport);
  track.classList.add('slider-track');
  const prevButton = control('slider-prev', 'Previous');
  const nextButton = control('slider-next', 'Next');
  const dotList = document.createElement('div');
  dotList.className = 'slider-dots';
  if (arrows) slider.append(prevButton, nextButton);
  if (dots) slider.append(dotList);

  let index = 0;
  let timer = 0;
  const slides = () => [...track.children];
  const size = () => perViewAt(perView, window.innerWidth);
  const last = () => Math.max(0, slides().length - size());

  function go(to) {
    const span = last();
    if (loop && to > span) index = index === span ? 0 : span;
    else if (loop && to < 0) index = index === 0 ? span : 0;
    else index = Math.min(Math.max(to, 0), span);
    track.style.setProperty('--slide-index', index);
    track.style.setProperty('--per-view', size());
    slides().forEach((slide, i) => {
      const hidden = i < index || i >= index + size();
      slide.setAttribute('aria-hidden', hidden);
      slide.inert = hidden;
    });
    const steps = Math.ceil(span / size()) + 1;
    if (dotList.children.length !== steps) {
      dotList.replaceChildren(...Array.from({ length: steps }, (_, i) => {
        const dot = control('slider-dot', `Slide ${i + 1}`);
        dot.addEventListener('click', () => go(i * size()));
        return dot;
      }));
    }
    [...dotList.children].forEach((dot, i) => {
      if (i === Math.ceil(index / size())) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    [prevButton, nextButton, dotList].forEach((el) => { el.hidden = span === 0; });
    prevButton.disabled = !loop && index === 0;
    nextButton.disabled = !loop && index === span;
  }
  const next = () => go(index + size());
  const prev = () => go(index - size());
  const stop = () => clearInterval(timer);
  const play = () => {
    stop();
    if (autoplay) timer = setInterval(next, autoplay);
  };

  let startX = null;
  const onDown = (e) => { startX = e.clientX; };
  const onUp = (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) < SWIPE) return;
    if (dx < 0) next(); else prev();
  };
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };
  const onResize = () => go(index);
  const listeners = [
    [prevButton, 'click', prev], [nextButton, 'click', next],
    [viewport, 'pointerdown', onDown], [viewport, 'pointerup', onUp],
    [viewport, 'pointercancel', () => { startX = null; }],
    [slider, 'keydown', onKey], [slider, 'mouseenter', stop], [slider, 'mouseleave', play],
    [slider, 'focusin', stop], [slider, 'focusout', play], [window, 'resize', onResize],
  ];
  listeners.forEach(([el, type, fn]) => el.addEventListener(type, fn));
  go(0);
  play();

  function destroy() {
    stop();
    listeners.forEach(([el, type, fn]) => el.removeEventListener(type, fn));
    slides().forEach((slide) => {
      slide.removeAttribute('aria-hidden');
      slide.inert = false;
    });
    track.classList.remove('slider-track');
    track.style.removeProperty('--slide-index');
    track.style.removeProperty('--per-view');
    slider.replaceWith(track);
  }

  return {
    go, next, prev, destroy,
  };
}
