/**
 * Content fragment elements — the adventure facts column (source .cmp-contentfragment--elements):
 * a label / value list with a 5px rule per fact, headed by the fragment's (hidden) title and
 * followed by the "Share this Adventure" title.
 * Schema: stardust/eds-schema/us-en-adventures-riverside-camping-australia-html.json
 * § adventure-facts. Decode tier: reconstructive (one row per fact).
 *
 * Authoring (container shape): single-cell rows BEFORE the first fact = the fragment head (the
 * source's display:none content-fragment title, kept for parity); two-cell rows = one fact each
 * (label | value); single-cell rows AFTER the facts = the aside (share title). Every authored
 * node MOVES (EW1): labels into <dt>, values into <dd>, head/aside nodes into their wrappers.
 * Variants: `col-3` (the 25% grid column beside `tabs.col-9`), `program-grid` (AEM-grid flavour:
 * padded facts, share title beside the facts below 1025px).
 */
function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function moveCell(cell, target) {
  target.append(...cell.childNodes);
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const body = el('div', 'facts-body');
  const facts = el('article', 'facts');
  const head = el('div', 'cf-title');
  const list = el('dl', 'facts-list');
  const aside = el('div', 'title-share');
  facts.append(head, list);
  body.append(facts, aside);

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const item = el('div', 'facts-item');
      const dt = el('dt', 'facts-label');
      const dd = el('dd', 'facts-value');
      moveCell(cells[0], dt);
      cells.slice(1).forEach((cell) => moveCell(cell, dd));
      item.append(dt, dd);
      list.append(item);
    } else if (cells.length === 1) {
      moveCell(cells[0], list.children.length ? aside : head);
    }
  });

  if (!head.childNodes.length) head.remove();
  if (!aside.childNodes.length) aside.remove();
  block.replaceChildren(body);
}
