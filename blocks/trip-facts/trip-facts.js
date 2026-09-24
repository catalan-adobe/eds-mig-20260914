/**
 * trip-facts — WKND adventure fact sheet (cmp-contentfragment--elements): a
 * stack of label / value items with a light left rule, then the sidebar's
 * "Share this Adventure" title.
 *
 * Schema: stardust/eds-schema/us-en-adventures-climbing-new-zealand-html.json
 *   → sections[3] "trip-facts" (repeat unit DIV.facts__item × 6: label + value).
 * Decode tier: reconstructive — one item per two-cell authored row.
 *
 * Authoring rows:
 *   <h3>Climbing New Zealand</h3>   leading single-cell row(s): the content
 *                          fragment title — display:none on live
 *                          (.cmp-contentfragment__title), kept in a hidden
 *                          .trip-facts-title wrapper
 *   label | value          one row per fact (Activity | Rock Climbing …)
 *   <h5>Share this Adventure</h5>   optional single-cell row(s) — any row with
 *                          one cell is sidebar prose rendered after the facts
 *                          (the live share widgets render 0 px and are omitted,
 *                          conversion log A-RO-4)
 *
 * Every authored node is MOVED into its wrapper (EW1); wrappers carry the
 * layout classes and style the paragraphs by descendant selector (EW2).
 * @ew-exempt h3 fragment title (leading row) — hidden on live, never displayed
 */

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

function wrapNodes(nodes, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(...nodes);
  return w;
}

export default async function decorate(block) {
  if (block.querySelector(':scope > .trip-facts-list')) return; // EW9 re-entrant
  const rows = [...block.children].filter((row) => row.children.length);
  if (!rows.length) return;

  const title = document.createElement('div');
  title.className = 'trip-facts-title';
  const list = document.createElement('div');
  list.className = 'trip-facts-list';
  const aside = document.createElement('div');
  aside.className = 'trip-facts-aside';

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const item = document.createElement('div');
      item.className = 'trip-facts-item';
      item.append(
        wrapNodes(cellNodes(cells[0]), 'trip-facts-label'),
        wrapNodes(cells.slice(1).flatMap(cellNodes), 'trip-facts-value'),
      );
      list.append(item);
      return;
    }
    (list.children.length ? aside : title).append(...cellNodes(cells[0]));
  });

  block.replaceChildren(list);
  if (title.children.length) block.prepend(title);
  if (aside.children.length) block.append(aside);
}
