/**
 * teaser-list — the WKND list teaser row (source .cmp-teaser--list inside 4-column grid cells:
 * title, uppercase description, action label, image below), one teaser per authored row.
 * Schema: stardust/eds-schema/us-en-magazine-html.json § alaskan-adventure,
 * § fly-fishing-the-amazon.
 * Decode tier: reconstructive (repeat group; authors add and remove teasers).
 *
 * Authoring (container shape), one row per teaser, cells classified by content — never by index:
 *   - the cell holding a picture/img is the teaser image
 *   - the cell holding a heading (h1–h6) is the teaser content: the heading, then the
 *     description paragraph(s); a link-only paragraph in it is an action (EW3)
 *   - any other cell holds the action(s): `<p><a>` (linked) or a plain `<p>` label (the
 *     source's signed-out "Read More" text)
 * Variant `secure` — the source .cmp-teaser--secure in its anonymous state (the replica has no
 * sign-in): lock badge, 65 % opacity, grey action label.
 * Every authored node MOVES (EW1) into generated wrappers that carry the layout classes (EW2).
 * Re-entrant (EW9).
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

function buildContent(cell, actions) {
  const content = el('div', 'teaser-content');
  const description = el('div', 'teaser-description');
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

function buildTeaser(row) {
  const cells = [...row.children];
  const item = el('div', 'teaser-item');
  const teaser = el('div', 'teaser');
  const actions = el('div', 'teaser-actions');
  const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
  const contentCell = cells.find((cell) => cell !== imageCell
    && cell.querySelector('h1, h2, h3, h4, h5, h6'));
  const content = contentCell ? buildContent(contentCell, actions) : el('div', 'teaser-content');
  cells.filter((cell) => cell !== imageCell && cell !== contentCell)
    .forEach((cell) => actions.append(...cell.children));
  if (actions.childElementCount) content.append(actions);
  teaser.append(content);
  if (imageCell) teaser.append(buildImage(imageCell));
  item.append(teaser);
  return item;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .teaser-item')) return;
  const rows = [...block.children].filter((row) => row.children.length);
  if (!rows.length) return;
  block.replaceChildren(...rows.map(buildTeaser));
}
