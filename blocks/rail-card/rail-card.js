function element(tag, className, ...children) {
  const el = document.createElement(tag);
  el.className = className;
  el.append(...children);
  return el;
}

/** The flag: the label (a link, or plain text) with the triangle at its right end. */
function flag(cell) {
  const link = cell.querySelector('a[href]');
  const label = link ?? element('span', '', cell.textContent.trim());
  label.className = 'rail-card-label';
  return element('div', 'rail-card-flag', element('div', '', label), element('div', 'rail-card-triangle'));
}

/** The importer marks a link the source opens in a new tab with the hash `#_blank`. */
function newTabs(block) {
  block.querySelectorAll('a[href$="#_blank"]').forEach((a) => {
    a.href = a.getAttribute('href').replace(/#_blank$/, '');
    a.target = '_blank';
  });
}

/** Purple flag, then a list of links. Either part may be missing. */
export default function decorate(block) {
  newTabs(block);
  const cells = [...block.children].map((row) => row.firstElementChild).filter(Boolean);
  const listCell = cells.find((cell) => cell.querySelector('ul, ol'));
  const flagCell = cells.find((cell) => cell !== listCell && cell.textContent.trim());
  const parts = [];
  if (flagCell) parts.push(flag(flagCell));
  if (listCell) {
    const list = element('ul', 'rail-card-links', ...listCell.querySelectorAll('li'));
    parts.push(list);
  }
  block.replaceChildren(...parts);
}
