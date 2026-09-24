/**
 * accordion — WKND FAQ accordion (`.cmp-accordion`): a stack of items whose
 * question row toggles its answer panel; items expand independently.
 *
 * Decode tier: reconstructive (repeat group). Schema:
 * stardust/eds-schema/us-en-faqs-html.json (section faq-main, repeats
 * eyebrow question + body answer per item).
 *
 * Authoring rows (block-collection `accordion` model, one row per item):
 *   cell 1: the question (an <h3> on WKND — the source's accordion__header)
 *   cell 2: the answer (any default content: <p>, headings, lists, images)
 * A single-cell row is a head cell and is kept above the items.
 *
 * EW7: the question moves into `div.accordion-title`, never into the
 * toggle <button>; the whole header row takes the click, the button is a
 * glyph-only toggle carrying the aria state. Every authored node is MOVED
 * (EW1), wrappers carry the classes (EW2), re-entrant (EW9).
 */

function moveChildren(from, to) {
  while (from.firstChild) to.append(from.firstChild);
  return to;
}

function setExpanded(item, expanded) {
  const button = item.querySelector('.accordion-toggle');
  const panel = item.querySelector('.accordion-panel');
  item.classList.toggle('accordion-item-expanded', expanded);
  button.setAttribute('aria-expanded', String(expanded));
  panel.hidden = !expanded;
}

function buildItem(row, id) {
  const [question, ...answers] = [...row.children];
  const item = document.createElement('div');
  item.className = 'accordion-item';

  const header = document.createElement('div');
  header.className = 'accordion-header';
  const title = document.createElement('div');
  title.className = 'accordion-title';
  title.id = `${id}-title`;
  moveChildren(question, title);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'accordion-toggle';
  button.setAttribute('aria-controls', `${id}-panel`);
  button.setAttribute('aria-labelledby', `${id}-title`);
  header.append(title, button);

  const panel = document.createElement('div');
  panel.className = 'accordion-panel';
  panel.id = `${id}-panel`;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', `${id}-title`);
  answers.forEach((cell) => moveChildren(cell, panel));

  item.append(header, panel);
  header.addEventListener('click', () => {
    setExpanded(item, !item.classList.contains('accordion-item-expanded'));
  });
  setExpanded(item, false);
  return item;
}

export default function decorate(block) {
  const index = [...document.querySelectorAll('.accordion.block')].indexOf(block);
  const prefix = `accordion-${index < 0 ? 0 : index}`;
  const rows = [...block.children];
  const head = document.createElement('div');
  head.className = 'accordion-head';
  const items = document.createDocumentFragment();
  let count = 0;

  rows.forEach((row) => {
    if (row.children.length < 2) {
      [...row.children].forEach((cell) => moveChildren(cell, head));
      return;
    }
    count += 1;
    items.append(buildItem(row, `${prefix}-${count}`));
  });

  block.replaceChildren();
  if (head.hasChildNodes()) block.append(head);
  block.append(items);
}
