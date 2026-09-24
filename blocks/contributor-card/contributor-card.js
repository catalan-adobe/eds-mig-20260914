/**
 * contributor-card — WKND contributor / guide profile cards (about-us): a round 164px
 * portrait, the name (h3), the role line (h5) and a centred row of icon-only social buttons.
 * Replaces the source's cmp-experience-fragment--contributor columns (25% / 50% / 100%).
 *
 * Schema: stardust/eds-schema/us-en-about-us-html.json → sections[2..5] "column"
 *   (Our Contributors × 4) and sections[7..9] "column" (WKND Guides × 3): per unit
 *   heading (name) + heading (role) + 3 × cta (Facebook / Twitter / Instagram), imgCount 1.
 * Decode tier: template-slotted — ONE block per contributor (the source's one experience
 * fragment per person), several blocks in one section; the section is the 1164px grid and
 * each block wrapper the floated 25% / 50% / 100% column (CSS). Defensive decode: a block
 * authored with several rows renders one stacked card per row; a DA-flattened single row
 * is segmented on the portrait boundary, else on the name-heading boundary (#52/#62).
 *
 * Authoring (one block table per contributor, one row):
 *   cell 1  <picture> portrait
 *   cell 2  <h3>Name</h3>, <h5>Role | Role</h5>, then a <ul> of social links, each carrying a
 *           :facebook: / :twitter: / :instagram: icon (decorateIcons turns the icon span into
 *           <img data-icon-name>; the link text stays as the accessible name, hidden by CSS).
 * Every authored node is MOVED into a layout wrapper (EW1/EW2); nothing is rebuilt.
 */

function isMedia(el) {
  return el.matches('picture, img') || !!el.querySelector('picture, img');
}

function isHeading(el) {
  return el.matches('h1, h2, h3, h4, h5, h6');
}

function isList(el) {
  return el.matches('ul, ol');
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

/** DA-flattened shape: every card in one row — a new card opens on each portrait, or (no
 *  portraits) on each heading of the first heading's tag (the name, h3). */
function segmentFlat(nodes) {
  const byMedia = nodes.some(isMedia);
  const first = nodes.find(isHeading);
  const nameTag = first ? first.tagName : 'H3';
  const cards = [];
  let open = null;
  nodes.forEach((node) => {
    const boundary = byMedia ? isMedia(node) : node.tagName === nameTag;
    if (!open || boundary) {
      open = [];
      cards.push(open);
    }
    open.push(node);
  });
  return cards;
}

function collectCards(block) {
  const rows = [...block.children];
  if (rows.length >= 2) return rows.map(rowNodes).filter((n) => n.length);
  return segmentFlat(rows.flatMap(rowNodes));
}

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function buildCard(nodes) {
  const card = document.createElement('div');
  card.className = 'contributor';
  const inner = document.createElement('div');
  inner.className = 'contributor-inner';
  card.append(inner);

  let name = null;
  let role = null;
  let text = null;
  nodes.forEach((node) => {
    if (isMedia(node)) {
      const pic = node.matches('picture, img') ? node : node.querySelector('picture, img');
      inner.append(wrapNode(pic, 'contributor-image'));
      return;
    }
    if (isHeading(node) && !name) {
      name = wrapNode(node, 'contributor-name');
      inner.append(name);
      return;
    }
    if (isHeading(node)) {
      if (!role) {
        role = document.createElement('div');
        role.className = 'contributor-role';
        inner.append(role);
      }
      role.append(node);
      return;
    }
    if (isList(node) && node.querySelector('a')) {
      inner.append(wrapNode(node, 'contributor-buttons'));
      return;
    }
    // leftovers pass: any other authored element stays visible with default styling
    if (!text) {
      text = document.createElement('div');
      text.className = 'contributor-text';
      inner.append(text);
    }
    text.append(node);
  });
  return card;
}

export default async function decorate(block) {
  if (block.querySelector(':scope > .contributor')) return; // EW9 re-entrant
  const cards = collectCards(block);
  if (!cards.length) return;
  block.replaceChildren(...cards.map(buildCard));
}
