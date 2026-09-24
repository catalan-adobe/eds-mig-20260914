/**
 * teaser-featured — the WKND "Featured Article" teaser (source .cmp-teaser--featured): a grey
 * text panel (1/3) beside a top-anchored image (2/3), stacked below 768px.
 * Schema: stardust/eds-schema/us-en-html.json § teaser-featured. Decode tier: template-slotted
 * (fixed composition; the prototype section's inner DOM as EMPTY slot containers, authored
 * nodes MOVED into them by role — EW1/EW2).
 *
 * Authoring (simple shape), one row, cells classified by content — never by index:
 *   - the cell holding a picture/img is the teaser image
 *   - the other cell is the teaser content: an optional pretitle paragraph BEFORE the heading
 *     (the source .cmp-teaser__pretitle), the heading (h1–h6), description paragraph(s), CTA
 *     paragraph(s) (`<p><a>`, EW3)
 * Wrappers carry the layout classes; the authored elements are styled through descendant
 * selectors. Re-entrant (EW9).
 */
function el(tag, className) {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

function isCta(node) {
  if (!node.matches('p')) return false;
  const link = node.querySelector('a[href]');
  return !!link && node.textContent.trim() === link.textContent.trim();
}

function buildContent(cell) {
  const content = el('div', 'teaser-content');
  const pretitle = el('div', 'teaser-pretitle');
  const description = el('div', 'teaser-description');
  const actions = el('div', 'teaser-actions');
  let seenHeading = false;
  [...cell.children].forEach((node) => {
    if (node.matches('h1, h2, h3, h4, h5, h6')) {
      seenHeading = true;
      content.append(node);
    } else if (isCta(node)) {
      actions.append(node);
    } else if (!seenHeading && node.matches('p')) {
      pretitle.append(node);
    } else {
      description.append(node);
    }
  });
  if (pretitle.childElementCount) content.prepend(pretitle);
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

export default function decorate(block) {
  if (block.querySelector(':scope > .teaser')) return;
  const cells = [...block.querySelectorAll(':scope > div > div')];
  if (!cells.length) return;
  const teaser = el('div', 'teaser');
  const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
  cells.filter((cell) => cell !== imageCell).forEach((cell) => teaser.append(buildContent(cell)));
  if (imageCell) teaser.append(buildImage(imageCell));
  block.replaceChildren(teaser);
}
