/**
 * hero-carousel — WKND landing hero: a rotating set of full-width hero teasers.
 *
 * Schema: stardust/eds-schema/us-en-html.json → sections[0] "hero"
 *   (repeat unit DIV.carousel__item × 3: heading + body + cta + image).
 * Decode tier: reconstructive — one slide per authored row; when a single row
 * carries every slide (DA-flattened shape) the slides are segmented on the
 * heading boundary instead (#69).
 *
 * Authoring rows (one per slide):
 *   cell 1: <picture> slide image
 *   cell 2: heading (<h1> on the first slide, <h2> on the others — #57),
 *           description <p>, CTA <p><strong><a>…</a></strong></p>
 *
 * Generated controls carry no words (#100): previous/next buttons and the
 * indicator dots use aria-label + icon-font glyphs only.
 */

const HEADING = 'h1, h2, h3, h4, h5, h6';

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function isMedia(el) {
  return el.matches('picture, img') || !!el.querySelector('picture, img');
}

function cellNodes(cell) {
  const kids = [...cell.children];
  if (kids.length) return kids;
  // HARNESS-ONLY fallback (EW5): bare text in a cell — DA always delivers a <p>.
  if (cell.textContent.trim()) {
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

function rowNodes(row) {
  return [...row.children].flatMap(cellNodes);
}

/** Segment a flat node list into slides on the heading boundary (#69). */
function segmentByHeading(nodes) {
  const slides = [];
  let open = null;
  nodes.forEach((node) => {
    if (node.matches(HEADING) || (!open && isMedia(node))) {
      if (!open || open.heading || !node.matches(HEADING)) {
        open = { heading: null, nodes: [] };
        slides.push(open);
      }
      if (node.matches(HEADING)) open.heading = node;
    }
    if (!open) {
      open = { heading: null, nodes: [] };
      slides.push(open);
    }
    open.nodes.push(node);
  });
  return slides.filter((s) => s.heading || s.nodes.some(isMedia));
}

function collectSlides(block) {
  const rows = [...block.children];
  const withHeading = rows.filter((r) => r.querySelector(HEADING));
  if (withHeading.length >= 2 || rows.length >= 2) {
    return rows.map((row) => {
      const nodes = rowNodes(row);
      return { heading: nodes.find((n) => n.matches(HEADING)) || null, nodes };
    }).filter((s) => s.nodes.length);
  }
  return segmentByHeading(rows.flatMap(rowNodes));
}

function buildSlide(slide, index) {
  const item = document.createElement('div');
  item.className = 'hero-carousel-item';
  item.setAttribute('role', 'tabpanel');
  if (index === 0) item.classList.add('active');

  const teaser = document.createElement('div');
  teaser.className = 'teaser';
  const content = document.createElement('div');
  content.className = 'content';
  const image = document.createElement('div');
  image.className = 'image';

  let description = null;
  let actions = null;
  slide.nodes.forEach((node) => {
    if (isMedia(node)) {
      const pic = node.matches('picture, img') ? node : node.querySelector('picture, img');
      const img = pic.matches('img') ? pic : pic.querySelector('img');
      if (img && index === 0) img.setAttribute('loading', 'eager');
      image.append(pic);
      return;
    }
    if (node === slide.heading) {
      content.append(wrapNode(node, 'headline'));
      return;
    }
    if (node.querySelector('a')) {
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'actions';
      }
      actions.append(node);
      return;
    }
    if (!description) {
      description = document.createElement('div');
      description.className = 'description';
    }
    description.append(node);
  });
  if (description) content.append(description);
  if (actions) content.append(actions);
  teaser.append(content, image);
  item.append(teaser);
  return item;
}

function buildAction(direction) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `hero-carousel-action hero-carousel-action-${direction}`;
  btn.setAttribute('aria-label', direction === 'previous' ? 'Previous' : 'Next');
  const glyph = document.createElement('span');
  glyph.className = `hero-carousel-arrow hero-carousel-arrow-${direction}`;
  glyph.setAttribute('aria-hidden', 'true');
  btn.append(glyph);
  return btn;
}

function buildIndicators(count) {
  const ol = document.createElement('ol');
  ol.className = 'hero-carousel-indicators';
  ol.setAttribute('role', 'tablist');
  ol.setAttribute('aria-label', 'Choose a slide to display');
  for (let i = 0; i < count; i += 1) {
    const li = document.createElement('li');
    li.className = 'hero-carousel-indicator';
    li.setAttribute('role', 'tab');
    li.setAttribute('aria-label', `Slide ${i + 1}`);
    li.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    if (i === 0) li.classList.add('active');
    ol.append(li);
  }
  return ol;
}

export default async function decorate(block) {
  if (block.querySelector(':scope > .hero-carousel-content')) return; // EW9 re-entrant
  const slides = collectSlides(block);
  if (!slides.length) return;

  const carousel = document.createElement('div');
  carousel.className = 'hero-carousel-content';
  carousel.setAttribute('role', 'group');
  const items = slides.map(buildSlide);
  carousel.append(...items);

  const actions = document.createElement('div');
  actions.className = 'hero-carousel-actions';
  const prev = buildAction('previous');
  const next = buildAction('next');
  actions.append(prev, next);
  const indicators = buildIndicators(items.length);
  const dots = [...indicators.children];

  items.forEach((item, i) => {
    item.setAttribute('aria-label', `Slide ${i + 1} of ${items.length}`);
  });

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

  block.replaceChildren(carousel, actions, indicators);
}
