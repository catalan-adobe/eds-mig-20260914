/**
 * accordion — FAQ accordion (Core Components cmp-accordion, multi-expansion: every item
 * toggles on its own; panels are collapsed at rest and fade in on open).
 *
 * Schema: stardust/eds-schema/us-en-faqs-html.json (section "faq", repeat unit
 * DIV.accordion__item × 7 — eyebrow-styled question + body answer per unit).
 * Decode tier: reconstructive (authors add and remove items).
 *
 * Authoring rows — ONE row per item, two cells:
 *   1. question — a <p> (the source paints it as an uppercase 16px span inside
 *      h3.accordion__header; the wrapper carries role="heading" aria-level="3" so the
 *      outline survives without an authored heading tag; an authored <h3> decodes the same)
 *   2. answer   — one or more <p> (bold runs as <strong>)
 * Defensive decode: a single-cell row is segmented on its headings (each heading opens an
 * item, the elements that follow it fill the panel); a row with more than two cells folds
 * the extra cells into the panel; a row without a heading becomes a panel-only item.
 *
 * EW7: the question moves into div.accordion-title (an inline heading, never a <button>);
 * the whole header row takes the click, the <button> is a chevron-only toggle labelled by
 * the question (aria-labelledby, no words added — #100). EW9: no module-level state.
 */

const HEADING = 'h1, h2, h3, h4, h5, h6';

function segmentFlat(cell, items) {
  let current = null;
  [...cell.children].forEach((el) => {
    if (el.matches(HEADING)) {
      current = { title: [el], panel: [] };
      items.push(current);
    } else if (current) {
      current.panel.push(el);
    } else {
      current = { title: [], panel: [el] };
      items.push(current);
    }
  });
}

function collectItems(block) {
  const items = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 1) {
      segmentFlat(cells[0], items);
      return;
    }
    if (!cells.length) return;
    const [titleCell, ...panelCells] = cells;
    items.push({
      title: [...titleCell.childNodes],
      panel: panelCells.flatMap((cell) => [...cell.childNodes]),
    });
  });
  return items;
}

function setExpanded(item, toggle, panel, expanded) {
  item.classList.toggle('expanded', expanded);
  toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  panel.hidden = !expanded;
}

function buildItem({ title, panel }, id) {
  const item = document.createElement('div');
  item.className = 'accordion-item';

  const header = document.createElement('div');
  header.className = 'accordion-header';
  const titleBox = document.createElement('div');
  titleBox.className = 'accordion-title';
  titleBox.id = `${id}-title`;
  titleBox.setAttribute('role', 'heading');
  titleBox.setAttribute('aria-level', '3');
  titleBox.append(...title);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'accordion-toggle';
  toggle.setAttribute('aria-controls', `${id}-panel`);
  toggle.setAttribute('aria-labelledby', titleBox.id);
  const icon = document.createElement('span');
  icon.className = 'accordion-icon';
  icon.setAttribute('aria-hidden', 'true');
  toggle.append(icon);
  header.append(titleBox, toggle);

  const body = document.createElement('div');
  body.className = 'accordion-panel';
  body.id = `${id}-panel`;
  body.setAttribute('role', 'region');
  body.setAttribute('aria-labelledby', titleBox.id);
  body.append(...panel);

  setExpanded(item, toggle, body, false);
  header.addEventListener('click', () => {
    setExpanded(item, toggle, body, body.hidden);
  });
  item.append(header, body);
  return item;
}

export default async function decorate(block) {
  const items = collectItems(block);
  if (!items.length) return;
  const base = document.querySelectorAll('.accordion-panel').length;
  const built = items.map((item, i) => buildItem(item, `accordion-${base + i + 1}`));
  block.replaceChildren(...built);
}
