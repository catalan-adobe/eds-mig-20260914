/**
 * cards — synopsys.com repeating units, one row per card. Three variants share the decode:
 *   .solutions  cells image | body (h3 title, p, CTA p)           → card-as-link (EW6)
 *   .logos      cell  <a><img></a>                                 → marquee of partner logos
 *   .news       cells image | body (p <strong>label</strong>, p date, h3, CTA p)
 * Schema: stardust/eds-schema/index.json. Reconstructive by content, never rows[N]:
 * a cell whose only child is a picture is the media; everything else is body.
 * Authored nodes are MOVED (EW1); the card link is read off the CTA then unwrapped (EW6).
 * Marquee clones are presentational (EW4: indices stripped, alt="", no href).
 */
function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  el.removeAttribute('data-prose-index');
  return el;
}

// wrap an AUTHORED element in a generated wrapper carrying the layout class (EW2)
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const isMedia = (cell) => cell.children.length === 1 && cell.querySelector('picture, img')
  && !cell.querySelector('h1, h2, h3, h4, h5, h6');

function decorateCard(row, block) {
  const li = document.createElement('li');
  const cells = [...row.children];
  const media = cells.find(isMedia);
  const body = cells.find((c) => c !== media);
  const cta = body ? [...body.querySelectorAll('a')].pop() : null;
  const href = cta ? cta.getAttribute('href') : null;

  const card = href && block.classList.contains('solutions') ? document.createElement('a') : document.createElement('div');
  if (card.tagName === 'A') card.href = href;
  card.className = 'cards-card';

  if (media) {
    media.className = 'cards-card-image';
    card.append(media);
  }
  if (body) {
    body.className = 'cards-card-body';
    if (block.classList.contains('news')) {
      const [label, date] = [...body.querySelectorAll(':scope > p')].slice(0, 2);
      if (label && label.querySelector('strong')) {
        const meta = document.createElement('div');
        meta.className = 'cards-card-meta';
        meta.append(wrapNode(label, 'cards-card-label'));
        if (date && !date.querySelector('a')) meta.append(wrapNode(date, 'cards-card-date'));
        body.prepend(meta);
      }
    }
    if (cta) {
      const p = cta.closest('p');
      if (p) {
        const w = document.createElement('div');
        w.className = 'cards-card-cta';
        p.replaceWith(w);
        w.append(p);
      }
      if (card.tagName === 'A') cta.replaceWith(...cta.childNodes);
    }
    card.append(body);
  }
  li.append(card);
  return li;
}

function decorateLogos(block) {
  const track = document.createElement('div');
  track.className = 'cards-track';
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const cell = row.firstElementChild;
    while (cell && cell.firstChild) li.append(cell.firstChild);
    ul.append(li);
  });
  track.append(ul);
  // marquee needs one presentational copy after the authored set (EW4, #100)
  const clone = stripInstrumentation(ul.cloneNode(true));
  clone.setAttribute('aria-hidden', 'true');
  clone.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
  clone.querySelectorAll('img').forEach((img) => img.setAttribute('alt', ''));
  track.append(clone);
  block.replaceChildren(track);
}

export default function decorate(block) {
  if (block.classList.contains('logos')) {
    decorateLogos(block);
    return;
  }
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => ul.append(decorateCard(row, block)));
  block.replaceChildren(ul);
}
