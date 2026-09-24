/**
 * featured-teaser — WKND "Featured Article" teaser: grey text panel + tall image.
 *
 * Schema: stardust/eds-schema/us-en-html.json → sections[1] "featured-article"
 *   (eyebrow + heading + body + cta, 1 image).
 * Decode tier: template-slotted — fixed composition; authored nodes are MOVED
 * into empty slot wrappers by role (EW1/EW2), never rebuilt.
 *
 * Authoring (one row): cell 1 <picture>; cell 2 eyebrow <p><strong>…</strong></p>,
 * <h2> title, description <p>, CTA <p><strong><a>…</a></strong></p>.
 * The eyebrow is the link-free paragraph BEFORE the heading (#51); every other
 * link-free paragraph is description; link-bearing paragraphs are CTAs (EW3).
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

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) {
      out.push(...kids);
    } else if (cell.textContent.trim()) {
      // HARNESS-ONLY fallback (EW5): DA always delivers a <p> per text cell.
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

export default async function decorate(block) {
  if (block.querySelector(':scope > .teaser')) return; // EW9 re-entrant
  const nodes = collectNodes(block);
  if (!nodes.length) return;

  const teaser = document.createElement('div');
  teaser.className = 'teaser';
  const content = document.createElement('div');
  content.className = 'content';
  const image = document.createElement('div');
  image.className = 'image';

  const heading = nodes.find((n) => n.matches(HEADING)) || null;
  let seenHeading = false;
  let description = null;
  let actions = null;
  nodes.forEach((node) => {
    if (isMedia(node)) {
      const pic = node.matches('picture, img') ? node : node.querySelector('picture, img');
      image.append(pic);
      return;
    }
    if (node === heading) {
      seenHeading = true;
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
    if (!seenHeading && heading && node.matches('p')) {
      content.append(wrapNode(node, 'eyebrow'));
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

  teaser.append(content);
  if (image.childElementCount) teaser.append(image);
  block.replaceChildren(teaser);
}
