/**
 * accordion — Block Collection `accordion` model: one row per item,
 * cell 1 = question, cell 2 = answer.
 * Schema: stardust/eds-schema/index.json sections[5] (reconstructive, 3 items).
 *
 * The question text stays in a div (EW7 — a <button> cannot host the editor); the whole title
 * row toggles, the chevron-only button carries the aria state. Same class state machine as
 * the source (.faq-item.is-open).
 */
function toggle(item, button) {
  const open = item.classList.toggle('is-open');
  button.setAttribute('aria-expanded', String(open));
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [qCell, aCell] = [...row.children];
    if (!qCell || !aCell) return;
    row.className = 'faq-item';
    const title = document.createElement('div');
    title.className = 'faq-question';
    const label = document.createElement('div');
    label.className = 'faq-label';
    label.append(...qCell.childNodes);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'faq-icon';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', `Toggle: ${label.textContent.trim()}`);
    title.append(label, button);
    title.addEventListener('click', () => toggle(row, button));
    aCell.className = 'faq-answer';
    qCell.remove();
    row.prepend(title);
  });
}
