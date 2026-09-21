/**
 * carousel (variant `hero`) — synopsys.com home hero: 5 fading slides, each a full-bleed
 * photo on a purple gradient with a left-aligned title, sub-title and 1–2 CTAs, a dot
 * rail listing every slide title, and a pause control. Autoplay is off (replica freeze:
 * the gated prototype shows slide 1 at rest); the rail + arrows switch slides.
 *
 * Schema: stardust/eds-schema/index.json §cmp-carousel. Authoring rows (one per slide):
 *   cell 1: <img> (desktop photo; empty for a gradient-only slide, or a foreground SVG)
 *   cell 2: heading (slide 1 = the page <h1>), <p> sub-title, CTA <p>s
 *           (<strong><a> primary, <em><a> secondary)
 * Template-slotted (#95): authored nodes are MOVED into the slide template (EW1/EW3).
 * The dot rail shows each slide title through `content: attr(data-title)` on the tab
 * button, so no authored word is duplicated in the DOM (#100).
 */
function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  el.removeAttribute('data-prose-index');
  return el;
}

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function show(block, index) {
  block.querySelectorAll('.carousel-slide').forEach((s, i) => {
    s.classList.toggle('active', i === index);
    s.setAttribute('aria-hidden', i === index ? 'false' : 'true');
  });
  block.querySelectorAll('.carousel-rail li').forEach((li, i) => {
    li.classList.toggle('active', i === index);
    li.querySelector('button').setAttribute('aria-selected', i === index ? 'true' : 'false');
  });
  block.dataset.active = index;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const track = document.createElement('div');
  track.className = 'carousel-track';
  const rail = document.createElement('ul');
  rail.className = 'carousel-rail';
  rail.setAttribute('role', 'tablist');

  rows.forEach((row, i) => {
    const [mediaCell, bodyCell] = [...row.children];
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');

    const img = mediaCell ? mediaCell.querySelector('picture, img') : null;
    const isSvg = img && /\.svg(\?|$)/.test((img.querySelector?.('img') || img).src || '');
    if (img && !isSvg) {
      if (i === 0) {
        const el = img.tagName === 'IMG' ? img : img.querySelector('img');
        if (el) {
          el.loading = 'eager';
          el.fetchPriority = 'high';
        }
      }
      slide.append(wrapNode(img, 'carousel-media'));
    }

    const text = document.createElement('div');
    text.className = 'carousel-text';
    const heading = bodyCell ? bodyCell.querySelector('h1, h2, h3') : null;
    const ps = bodyCell ? [...bodyCell.querySelectorAll('p')] : [];
    const ctas = ps.filter((p) => p.querySelector('a'));
    const lede = ps.filter((p) => !p.querySelector('a') && p.textContent.trim());
    if (heading) {
      const label = document.createElement('li');
      label.setAttribute('role', 'presentation');
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-label', `${i + 1} of ${rows.length}`);
      // label rendered via CSS content: attr(data-title) — no duplicated words in the DOM (#100)
      button.dataset.title = stripInstrumentation(heading.cloneNode(true)).textContent.replace(/\s+/g, ' ').trim();
      button.addEventListener('click', () => show(block, i));
      label.append(button);
      rail.append(label);
      text.append(wrapNode(heading, 'carousel-title'));
    }
    if (lede.length) {
      const sub = document.createElement('div');
      sub.className = 'carousel-subtitle';
      sub.append(...lede);
      text.append(sub);
    }
    if (ctas.length) {
      const actions = document.createElement('div');
      actions.className = 'carousel-actions';
      actions.append(...ctas);
      text.append(actions);
    }
    const stage = document.createElement('div');
    stage.className = 'carousel-stage';
    stage.append(text);
    if (img && isSvg) stage.append(wrapNode(img, 'carousel-foreground'));
    slide.append(stage);
    track.append(slide);
  });

  const nav = document.createElement('div');
  nav.className = 'carousel-nav';
  ['previous', 'next'].forEach((dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `carousel-${dir}`;
    b.setAttribute('aria-label', dir);
    b.addEventListener('click', () => {
      const cur = Number(block.dataset.active || 0);
      show(block, (cur + (dir === 'next' ? 1 : rows.length - 1)) % rows.length);
    });
    nav.append(b);
  });

  block.replaceChildren(track, rail, nav);
  show(block, 0);
}
