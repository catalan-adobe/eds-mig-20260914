/**
 * Tool cards: one row per tool — icon picture | linked heading + description.
 * The whole card is the link (heading link unwrapped after reading its href).
 */

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

export default function decorate(block) {
  const grid = el('div', 'tools-grid');
  [...block.children].forEach((row) => {
    const [iconCell, textCell] = [...row.children];
    const heading = textCell.querySelector('h2, h3, h4');
    const link = heading.querySelector('a');
    const card = el('a', 'tool-card');
    card.href = link.href;
    card.title = link.textContent;
    link.replaceWith(...link.childNodes);
    card.append(
      el('div', 'tool-icon', iconCell.querySelector('p') || iconCell.querySelector('picture')),
      el('div', 'tool-text', heading, ...textCell.querySelectorAll('p')),
    );
    grid.append(el('div', 'tool-item', card));
  });
  block.textContent = '';
  block.append(grid);
}
