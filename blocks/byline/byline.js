/**
 * Byline — the WKND article contributor row (source .cmp-byline inside the contributor
 * .aem-Grid: a separator rule, the portrait + name + occupations, and three icon-only
 * secondary buttons for the author's networks).
 * Schema: stardust/eds-schema/us-en-magazine-western-australia-html.json (section 1,
 * items 16–20: heading, eyebrow, 3 CTAs, 1 img). Decode tier: template-slotted.
 *
 * Authoring: one row (simple shape), three cells:
 *   cell 1 <picture> portrait · cell 2 <h2> name, <p> occupations
 *   cell 3: one <p><a> per social link — the link text names the network (Facebook /
 *          Twitter / Instagram) and picks the glyph; the label is hidden by CSS like the
 *          source's icon-only button and the authored link title becomes the accessible
 *          name (aria-label copied from it, never from the label text).
 * Cells are classified by content, never by index; every authored node MOVES into a
 * layout wrapper (EW1/EW2/EW3); unrecognised content stays in the byline text slot.
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

function buildButtons(paragraphs) {
  const list = document.createElement('div');
  list.className = 'byline-buttons';
  paragraphs.forEach((p) => {
    const a = p.querySelector('a');
    if (a.title && !a.hasAttribute('aria-label')) a.setAttribute('aria-label', a.title);
    list.append(wrapNode(p, `byline-button byline-button-${networkOf(a)}`));
  });
  return list;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .byline-row')) return;
  const media = block.querySelector('picture, img');
  const headings = [...block.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  const paragraphs = [...block.querySelectorAll('p')];
  const linkParagraphs = paragraphs.filter((p) => p.querySelector('a'));
  const textParagraphs = paragraphs.filter((p) => !p.querySelector('a, picture, img'));

  const row = document.createElement('div');
  row.className = 'byline-row';
  const author = document.createElement('div');
  author.className = 'byline-author';
  row.append(author);

  if (media) {
    const mediaNode = media.closest('p') || media.closest('picture') || media;
    author.append(wrapNode(mediaNode, 'byline-image'));
  }
  headings.forEach((h) => author.append(wrapNode(h, 'byline-name')));
  textParagraphs.forEach((p) => author.append(wrapNode(p, 'byline-occupations')));
  if (linkParagraphs.length) row.append(buildButtons(linkParagraphs));

  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    [...cell.children].forEach((leftover) => author.append(wrapNode(leftover, 'byline-text')));
  });
  block.replaceChildren(row);
}
