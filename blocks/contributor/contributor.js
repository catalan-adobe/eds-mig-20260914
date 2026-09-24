/**
 * contributor — grid of contributor / guide cards (WKND experience fragment
 * `.cmp-experience-fragment--contributor`, four per row on desktop, two on
 * tablet, one on phone).
 *
 * Decode tier: reconstructive (repeat group). Schema:
 * stardust/eds-schema/us-en-about-us-html.json (section 1, repeats
 * SECTION.col — heading h3 name, heading h5 role, 3 CTAs, 1 img per unit).
 *
 * Authoring rows — one row per contributor (container shape):
 *   cell 1: <picture> portrait
 *   cell 2: <h3> name, <h5> role, one <p><a> per social link (the link text
 *           names the network — Facebook / Twitter / Instagram — and picks the
 *           icon glyph; the visible label is hidden by CSS like the source's
 *           icon-only button, the authored link title becomes the accessible
 *           name — aria-label is copied from it, never from the label text).
 *
 * Every authored element is MOVED into a layout wrapper (EW1/EW2); a cell
 * whose content is not recognised is kept in the card body as-is.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function networkOf(link) {
  const key = `${link.textContent} ${link.getAttribute('href') || ''}`.toLowerCase();
  if (key.includes('facebook')) return 'facebook';
  if (key.includes('twitter')) return 'twitter';
  if (key.includes('insta')) return 'instagram';
  return 'other';
}

function buildLinks(paragraphs) {
  const links = document.createElement('div');
  links.className = 'contributor-links';
  const grid = document.createElement('div');
  grid.className = 'contributor-links-grid';
  paragraphs.forEach((p) => {
    const a = p.querySelector('a');
    if (a.title && !a.hasAttribute('aria-label')) a.setAttribute('aria-label', a.title);
    grid.append(wrapNode(p, `contributor-link contributor-link-${networkOf(a)}`));
  });
  links.append(grid);
  return links;
}

function buildCard(row) {
  const card = document.createElement('div');
  card.className = 'contributor-card';
  const body = document.createElement('div');
  body.className = 'contributor-body';
  card.append(body);

  const media = row.querySelector('picture, img');
  const headings = [...row.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  const paragraphs = [...row.querySelectorAll('p')];
  const linkParagraphs = paragraphs.filter((p) => p.querySelector('a'));
  const otherParagraphs = paragraphs.filter((p) => !p.querySelector('a, picture, img'));

  if (media) {
    const mediaNode = media.closest('p') || media.closest('picture') || media;
    body.append(wrapNode(mediaNode, 'contributor-image'));
  }
  if (headings[0]) body.append(wrapNode(headings[0], 'contributor-name'));
  headings.slice(1).forEach((h) => body.append(wrapNode(h, 'contributor-role')));
  otherParagraphs.forEach((p) => body.append(wrapNode(p, 'contributor-text')));
  if (linkParagraphs.length) body.append(buildLinks(linkParagraphs));

  [...row.querySelectorAll(':scope > div')].forEach((cell) => {
    [...cell.children].forEach((leftover) => body.append(wrapNode(leftover, 'contributor-text')));
  });
  return card;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .contributor-card')) return;
  const rows = [...block.children];
  if (!rows.length) return;
  const cards = rows.map(buildCard);
  block.replaceChildren(...cards);
}
