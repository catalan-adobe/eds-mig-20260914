/**
 * cards — WKND card list (image, uppercase title link, one-line ellipsed description).
 * Replaces the stock boilerplate cards block (locked name, conversion log § Locked block names).
 *
 * Schema: stardust/eds-schema/us-en-html.json → sections[3] "recent-articles" and
 *   sections[8] "destinations" (repeat unit LI.card-list__item × 4: image + cta + body).
 * Decode tier: reconstructive — one card per authored row; a DA-flattened single
 * row is segmented on the link-bearing paragraph boundary (#52/#62).
 *
 * Authoring (one row per card): cell 1 <picture>; cell 2 <p><a href>Title</a></p>
 * (a bare link — the foundation buttonises formatted links only) + description <p>.
 * The image is wrapped in a generated text-less anchor carrying the title href.
 */

function isMedia(el) {
  return el.matches('picture, img') || !!el.querySelector('picture, img');
}

function isTitleLink(el) {
  const a = el.matches('a') ? el : el.querySelector('a');
  return !!a && !isMedia(el) && el.textContent.trim() === a.textContent.trim();
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

/** DA-flattened shape: every card in one row — a new card opens on each media node. */
function segmentFlat(nodes) {
  const cards = [];
  let open = null;
  nodes.forEach((node) => {
    if (isMedia(node) || !open) {
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

function buildCard(nodes) {
  const li = document.createElement('li');
  li.className = 'card';
  const article = document.createElement('article');
  const title = nodes.find(isTitleLink) || null;
  const href = title ? title.querySelector('a').getAttribute('href') : null;

  let body = null;
  nodes.forEach((node) => {
    if (isMedia(node)) {
      const pic = node.matches('picture, img') ? node : node.querySelector('picture, img');
      const link = document.createElement(href ? 'a' : 'div');
      link.className = 'card-image';
      if (href) link.href = href;
      link.append(pic);
      article.append(link);
      return;
    }
    if (node === title) {
      const w = document.createElement('div');
      w.className = 'card-title';
      w.append(node);
      article.append(w);
      return;
    }
    if (!body) {
      body = document.createElement('div');
      body.className = 'card-description';
    }
    body.append(node);
  });
  if (body) article.append(body);
  li.append(article);
  return li;
}

export default async function decorate(block) {
  if (block.querySelector(':scope > ul.card-list')) return; // EW9 re-entrant
  const cards = collectCards(block);
  if (!cards.length) return;
  const ul = document.createElement('ul');
  ul.className = 'card-list';
  ul.append(...cards.map(buildCard));
  block.replaceChildren(ul);
}
