/**
 * hero-carousel — the WKND home hero (source .cmp-carousel wrapping one .cmp-teaser--hero
 * per slide): full-bleed 400px / 640px slides, a white title box overlapping the image's
 * bottom edge above 1165px, prev/next glyph buttons floated right, indicator dots.
 * Schema: stardust/eds-schema/us-en-html.json § hero-carousel. Decode tier: reconstructive
 * (repeat group — authors add and remove slides), each slide template-slotted.
 *
 * Authoring (container shape), one row per slide, cells classified by content — never by index:
 *   - the cell holding a picture/img is the slide image
 *   - the other cell is the slide content: heading (h1–h6; the first slide's is the page h1,
 *     sized as the live h2), description paragraph(s), CTA paragraph(s) (`<p><a>`)
 * Every authored node MOVES (EW1): heading → .teaser-content, description paragraphs →
 * .teaser-description, CTA paragraphs → .teaser-actions (EW3), the image → .image; wrappers
 * carry the layout classes (EW2). The Previous / Next labels are generated control text, not
 * authored content; each indicator dot carries the slide heading's text as a hidden text
 * node (font-size 0, the source's Core Components indicator text) — a presentational
 * duplicate, the heading itself stays in .teaser-content. Interaction as the live clientlib
 * (stardust/prototypes/canon.js § carousel): prev/next wrap, indicator click selects; the
 * source markup carries no data-cmp-autoplay, so no autoplay. Re-entrant (EW9).
 */
function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

function isCta(node) {
  if (!node.matches('p')) return false;
  const link = node.querySelector('a[href]');
  return !!link && node.textContent.trim() === link.textContent.trim();
}

function buildContent(cell) {
  const content = el('div', 'teaser-content');
  const description = el('div', 'teaser-description');
  const actions = el('div', 'teaser-actions');
  [...cell.children].forEach((node) => {
    if (node.matches('h1, h2, h3, h4, h5, h6')) {
      content.append(node);
    } else if (isCta(node)) {
      actions.append(node);
    } else {
      description.append(node);
    }
  });
  if (description.childElementCount) content.append(description);
  if (actions.childElementCount) content.append(actions);
  return content;
}

function buildImage(cell) {
  const image = el('div', 'image');
  const media = cell.querySelector('picture, img');
  const holder = media.closest('p');
  image.append(media);
  if (holder && !holder.textContent.trim()) holder.remove();
  [...cell.children].forEach((node) => image.append(node));
  const frame = el('div', 'teaser-image');
  frame.append(image);
  return frame;
}

function buildSlide(row, index, count) {
  const slide = el('div', 'slide', { role: 'tabpanel', 'aria-label': `Slide ${index + 1} of ${count}` });
  if (index === 0) slide.classList.add('slide-active');
  const teaser = el('div', 'teaser');
  const cells = [...row.children];
  const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
  cells.filter((cell) => cell !== imageCell).forEach((cell) => teaser.append(buildContent(cell)));
  if (imageCell) teaser.append(buildImage(imageCell));
  slide.append(teaser);
  return slide;
}

function buildAction(kind, label) {
  const button = el('button', `action action-${kind}`, { type: 'button', 'aria-label': label });
  const icon = el('span', 'action-icon icon');
  const text = el('span', 'action-text');
  text.textContent = label;
  button.append(icon, text);
  return button;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .content')) return;
  const rows = [...block.children];
  if (!rows.length) return;
  block.setAttribute('role', 'group');
  block.setAttribute('aria-roledescription', 'carousel');
  const content = el('div', 'content', { 'aria-live': 'polite', 'aria-atomic': 'false' });
  const slides = rows.map((row, i) => buildSlide(row, i, rows.length));
  content.append(...slides);

  const actions = el('div', 'actions');
  const prev = buildAction('previous', 'Previous');
  const next = buildAction('next', 'Next');
  actions.append(prev, ' ', next);
  content.append(actions);

  const indicators = el('ol', 'indicators', { role: 'tablist', 'aria-label': 'Choose a slide to display' });
  const dots = slides.map((slide, i) => {
    const dot = el('li', 'indicator', {
      role: 'tab', 'aria-label': `Slide ${i + 1}`, 'aria-selected': i === 0 ? 'true' : 'false',
    });
    const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) dot.append(document.createTextNode(heading.textContent));
    return dot;
  });
  dots[0].classList.add('indicator-active');
  indicators.append(...dots);
  content.append(indicators);

  const show = (index) => {
    const n = slides.length;
    const active = ((index % n) + n) % n;
    slides.forEach((slide, i) => slide.classList.toggle('slide-active', i === active));
    dots.forEach((dot, i) => {
      dot.classList.toggle('indicator-active', i === active);
      dot.setAttribute('aria-selected', i === active ? 'true' : 'false');
    });
  };
  const current = () => slides.findIndex((slide) => slide.classList.contains('slide-active'));
  prev.addEventListener('click', () => show(current() - 1));
  next.addEventListener('click', () => show(current() + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));

  block.replaceChildren(content);
}
