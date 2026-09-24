/**
 * mini-carousel — WKND adventure gallery (cmp-carousel--mini): full-width
 * 400px image slides, previous/next arrows floated right, indicator dots.
 *
 * Schema: stardust/eds-schema/us-en-adventures-climbing-new-zealand-html.json
 *   → sections[1] "gallery" (repeat unit DIV.carousel__item × 3, image only).
 * Decode tier: reconstructive — one slide per authored row; a single row that
 * carries several images (DA-flattened shape) yields one slide per image.
 *
 * Authoring rows (one per slide): cell 1: <picture> slide image (alt = caption).
 *
 * Generated controls carry no words (#100): previous/next buttons and the
 * indicator dots use aria-label + icon-font glyphs only. The authored
 * <picture> is MOVED into its slide (EW1).
 */

function mediaNodes(block) {
  return [...block.querySelectorAll('picture, img')]
    .filter((el) => !el.closest('picture') || el.matches('picture'));
}

function buildSlide(media, index, count) {
  const item = document.createElement('div');
  item.className = 'mini-carousel-item';
  item.setAttribute('role', 'tabpanel');
  item.setAttribute('aria-label', `Slide ${index + 1} of ${count}`);
  if (index === 0) item.classList.add('active');
  const img = media.matches('img') ? media : media.querySelector('img');
  if (img && index === 0) img.setAttribute('loading', 'eager');
  item.append(media);
  return item;
}

function buildAction(direction) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `mini-carousel-action mini-carousel-action-${direction}`;
  btn.setAttribute('aria-label', direction === 'previous' ? 'Previous' : 'Next');
  const glyph = document.createElement('span');
  glyph.className = `mini-carousel-arrow mini-carousel-arrow-${direction}`;
  glyph.setAttribute('aria-hidden', 'true');
  btn.append(glyph);
  return btn;
}

function buildIndicators(count) {
  const ol = document.createElement('ol');
  ol.className = 'mini-carousel-indicators';
  ol.setAttribute('role', 'tablist');
  ol.setAttribute('aria-label', 'Choose a slide to display');
  for (let i = 0; i < count; i += 1) {
    const li = document.createElement('li');
    li.className = 'mini-carousel-indicator';
    li.setAttribute('role', 'tab');
    li.setAttribute('aria-label', `Slide ${i + 1}`);
    li.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    if (i === 0) li.classList.add('active');
    ol.append(li);
  }
  return ol;
}

export default async function decorate(block) {
  if (block.querySelector(':scope > .mini-carousel-content')) return; // EW9 re-entrant
  const media = mediaNodes(block);
  if (!media.length) return;

  const content = document.createElement('div');
  content.className = 'mini-carousel-content';
  content.setAttribute('role', 'group');
  const items = media.map((m, i) => buildSlide(m, i, media.length));
  content.append(...items);

  const actions = document.createElement('div');
  actions.className = 'mini-carousel-actions';
  const prev = buildAction('previous');
  const next = buildAction('next');
  // the inline-block buttons are separated by a space on live (a 4px gap)
  actions.append(prev, document.createTextNode(' '), next);
  const indicators = buildIndicators(items.length);
  const dots = [...indicators.children];

  const show = (i) => {
    const n = (i + items.length) % items.length;
    items.forEach((el, k) => el.classList.toggle('active', k === n));
    dots.forEach((el, k) => {
      el.classList.toggle('active', k === n);
      el.setAttribute('aria-selected', k === n ? 'true' : 'false');
    });
  };
  const current = () => Math.max(0, items.findIndex((el) => el.classList.contains('active')));
  prev.addEventListener('click', () => show(current() - 1));
  next.addEventListener('click', () => show(current() + 1));
  dots.forEach((dot, k) => dot.addEventListener('click', () => show(k)));

  block.replaceChildren(content, actions, indicators);
}
