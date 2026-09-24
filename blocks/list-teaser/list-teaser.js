/**
 * list-teaser — WKND "Members Only" teaser row (cmp-teaser--list inside
 * aem-GridColumn--default--4): one third-width column per teaser holding an
 * uppercase title, a muted one-line description, a grey "Read More" label and a
 * 200px cover image below the text.
 *
 * Schema: the magazine sibling of stardust/eds-schema/us-en-adventures-html.json
 *   (us-en-magazine._meta.json variants teaser--list, teaser--secure, column--third).
 * Decode tier: reconstructive — one teaser per authored row (a repeat group).
 *
 * Authoring (one row per teaser, ≤ 3 cells):
 *   cell 1: <picture> cover image
 *   cell 2: <h2> title, description <p>(s); a link-bearing <p> is a CTA (EW3)
 *   cell 3 (optional): the action label <p> when the teaser has no destination
 *           (members-only content — live renders a plain "Read More" box)
 * Variant `secure` (block class): the live anonymous-visitor treatment — lock
 * glyph, 65 % opacity, grey action box. Every authored node is MOVED (EW1/EW2).
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

function buildTeaser(row) {
  const cells = [...row.children];
  const nodes = cells.slice(0, 2).flatMap(cellNodes);
  const actionNodes = cells.slice(2).flatMap(cellNodes);
  if (!nodes.length && !actionNodes.length) return null;

  const item = document.createElement('div');
  item.className = 'item';
  const teaser = document.createElement('div');
  teaser.className = 'teaser';
  const content = document.createElement('div');
  content.className = 'content';
  const image = document.createElement('div');
  image.className = 'image';
  const actions = document.createElement('div');
  actions.className = 'actions';
  let description = null;

  nodes.forEach((node) => {
    if (isMedia(node)) {
      const pic = node.matches('picture, img') ? node : node.querySelector('picture, img');
      image.append(pic);
      return;
    }
    if (node.matches(HEADING)) {
      content.append(wrapNode(node, 'headline'));
      return;
    }
    if (node.querySelector('a')) {
      actions.append(node);
      return;
    }
    if (!description) {
      description = document.createElement('div');
      description.className = 'description';
      content.append(description);
    }
    description.append(node);
  });
  actions.append(...actionNodes);
  if (actions.childElementCount) content.append(actions);

  teaser.append(content);
  if (image.childElementCount) teaser.append(image);
  item.append(teaser);
  return item;
}

export default async function decorate(block) {
  if (block.querySelector(':scope > .item')) return; // EW9 re-entrant
  const items = [...block.children].map(buildTeaser).filter(Boolean);
  if (!items.length) return;
  block.replaceChildren(...items);
}
