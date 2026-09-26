import { createOptimizedPicture } from '../../scripts/aem.js';

const BREAKPOINTS = [
  { minWidth: 728, visible: 3 },
  { minWidth: 600, visible: 2 },
  { minWidth: 0, visible: 1 },
];

function getVisibleCount() {
  const w = window.innerWidth;
  return BREAKPOINTS.find((bp) => w >= bp.minWidth).visible;
}

/** External (off-site) links open in a new tab, matching the reference newsroom links. */
function decorateExternal(a) {
  try {
    if (new URL(a.href, window.location.href).hostname !== 'www.synopsys.com') {
      a.target = '_blank';
      a.rel = 'noopener';
    }
  } catch {
    // relative/invalid href: leave as same-tab
  }
}

function buildSlide(row) {
  const [imageCell, contentCell] = row.children;
  const li = document.createElement('li');
  li.className = 'news-carousel-slide';

  // the DA/edge pipeline already delivers <picture> for authored images; only fall back
  // to building one ourselves if a plain <img> ever slips through.
  let media = imageCell?.querySelector('picture');
  if (!media) {
    const img = imageCell?.querySelector('img');
    if (img) media = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
  }
  if (media) {
    const imageWrap = document.createElement('div');
    imageWrap.className = 'news-carousel-image';
    imageWrap.append(media);
    li.append(imageWrap);
  }

  const body = document.createElement('div');
  body.className = 'news-carousel-body';

  let tagText;
  let dateText;
  let titleLink;
  let moreLink;
  [...(contentCell?.children || [])].forEach((p) => {
    const link = p.querySelector('a');
    if (link) {
      if (!titleLink) titleLink = link;
      else if (!moreLink) moreLink = link;
    } else if (!tagText) tagText = p.textContent.trim();
    else if (!dateText) dateText = p.textContent.trim();
  });

  if (tagText || dateText) {
    const meta = document.createElement('div');
    meta.className = 'news-carousel-meta';
    if (tagText) {
      const tag = document.createElement('span');
      tag.className = 'news-carousel-tag';
      tag.textContent = tagText;
      meta.append(tag);
    }
    if (dateText) {
      const date = document.createElement('span');
      date.className = 'news-carousel-date';
      date.textContent = dateText;
      meta.append(date);
    }
    body.append(meta);
  }

  if (titleLink) {
    const h3 = document.createElement('h3');
    h3.className = 'news-carousel-title';
    titleLink.className = 'news-carousel-title-link';
    decorateExternal(titleLink);
    h3.append(titleLink);
    body.append(h3);
  }

  if (moreLink) {
    moreLink.className = 'news-carousel-more link-arrow';
    decorateExternal(moreLink);
    const p = document.createElement('p');
    p.className = 'news-carousel-more-wrapper';
    p.append(moreLink);
    body.append(p);
  }

  li.append(body);
  return li;
}

function setupNav(block, viewport, track, slides) {
  const nav = document.createElement('div');
  nav.className = 'news-carousel-nav';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'news-carousel-arrow prev';
  prev.setAttribute('aria-label', 'Previous');

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'news-carousel-arrow next';
  next.setAttribute('aria-label', 'Next');

  const dots = document.createElement('ul');
  dots.className = 'news-carousel-dots';

  nav.append(prev, dots, next);

  // desktop arrows sit beside the card viewport, not the dots row
  const viewportPrev = prev.cloneNode(true);
  const viewportNext = next.cloneNode(true);
  viewportPrev.classList.add('news-carousel-arrow-overlay');
  viewportNext.classList.add('news-carousel-arrow-overlay');
  block.append(viewportPrev, viewportNext);

  let page = 0;

  function pageCount(visible) {
    return Math.max(1, Math.ceil(slides.length / visible));
  }

  function render() {
    const visible = getVisibleCount();
    const pages = pageCount(visible);
    page = Math.min(page, pages - 1);
    const cardWidth = viewport.clientWidth / visible;
    slides.forEach((slide) => { slide.style.flex = `0 0 ${cardWidth}px`; });
    const maxIndex = Math.max(0, slides.length - visible);
    const index = Math.min(page * visible, maxIndex);
    track.style.transform = `translateX(${-index * cardWidth}px)`;

    dots.innerHTML = '';
    for (let i = 0; i < pages; i += 1) {
      const dot = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `Slide ${i + 1} of ${pages}`);
      if (i === page) dot.classList.add('active');
      btn.dataset.page = i;
      dot.append(btn);
      dots.append(dot);
    }
  }

  dots.addEventListener('click', (event) => {
    const btn = event.target.closest('button');
    if (!btn) return;
    page = Number(btn.dataset.page);
    render();
  });

  function go(delta) {
    const pages = pageCount(getVisibleCount());
    page = (page + delta + pages) % pages;
    render();
  }

  [prev, viewportPrev].forEach((btn) => btn.addEventListener('click', () => go(-1)));
  [next, viewportNext].forEach((btn) => btn.addEventListener('click', () => go(1)));

  // a plain resize listener misses the moment the section flips from
  // `display:none` to visible (no resize event fires), so watch the viewport
  // element itself instead — it also covers real window resizes for free.
  let resizeTimer;
  const ro = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 100);
  });
  ro.observe(viewport);

  render();
  block.append(nav);
}

export default function decorate(block) {
  const rows = [...block.children];
  const slides = rows.map(buildSlide);

  const viewport = document.createElement('div');
  viewport.className = 'news-carousel-viewport';

  const track = document.createElement('ul');
  track.className = 'news-carousel-track';
  track.append(...slides);

  viewport.append(track);
  block.replaceChildren(viewport);

  setupNav(block, viewport, track, slides);
}
