/**
 * Mini carousel — the adventure gallery (source .cmp-carousel--mini): full-bleed 400px slides,
 * prev/next glyph buttons floated right, indicator dots. No autoplay on the mini variant.
 * Schema: stardust/eds-schema/us-en-adventures-riverside-camping-australia-html.json
 * § adventure-gallery. Decode tier: template-slotted chrome, one slide per authored row.
 *
 * Authoring: one row per slide, one cell — the image paragraph (`<p><picture>`), optionally
 * followed by a caption paragraph (`<p><em>caption</em></p>`). Every authored node of the cell
 * MOVES into its slide (EW1); the first slide is active. The Previous / Next labels are
 * generated control text, not authored content.
 * Interaction lifted from the live clientlib (stardust/prototypes/canon.js § carousel).
 */
function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

function buildAction(kind, label) {
  const button = el('button', `action action-${kind}`, { type: 'button', 'aria-label': label });
  const icon = el('span', 'action-icon icon');
  const text = el('span', 'action-text');
  text.textContent = label;
  button.append(icon, text);
  return button;
}

function buildSlide(row, index, count) {
  const slide = el('div', 'slide', { role: 'tabpanel', 'aria-label': `Slide ${index + 1} of ${count}` });
  if (index === 0) slide.classList.add('slide-active');
  const image = el('div', 'image');
  [...row.querySelectorAll(':scope > div')].forEach((cell) => {
    [...cell.childNodes].forEach((node) => {
      const isCaption = node.nodeType === 1 && node.matches('p:has(> em:only-child)');
      if (isCaption) {
        const title = el('div', 'image-title');
        title.append(node);
        image.append(title);
      } else {
        image.append(node);
      }
    });
  });
  slide.append(image);
  return slide;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  block.setAttribute('role', 'group');
  const content = el('div', 'content');
  const slides = rows.map((row, i) => buildSlide(row, i, rows.length));
  content.append(...slides);

  const actions = el('div', 'actions');
  const prev = buildAction('previous', 'Previous');
  const next = buildAction('next', 'Next');
  actions.append(prev, next);
  content.append(actions);

  const indicators = el('ol', 'indicators', { role: 'tablist', 'aria-label': 'Choose a slide to display' });
  const dots = slides.map((slide, i) => el('li', 'indicator', {
    role: 'tab', 'aria-label': `Slide ${i + 1}`, 'aria-selected': i === 0 ? 'true' : 'false',
  }));
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
