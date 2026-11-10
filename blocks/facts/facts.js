const contentOf = (cell) => {
  const paragraph = cell.children.length === 1 && cell.firstElementChild.matches('p')
    ? cell.firstElementChild : cell;
  return paragraph.childNodes;
};

/**
 * Rows are facts: a label, then a value. They become a description list.
 * @param {Element} block The facts block element
 */
export default function decorate(block) {
  const list = document.createElement('dl');
  [...block.children].forEach((row) => {
    const [label, value] = row.children;
    const item = document.createElement('div');
    const term = document.createElement('dt');
    term.append(...contentOf(label));
    const description = document.createElement('dd');
    if (value) description.append(...contentOf(value));
    item.append(term, description);
    list.append(item);
  });
  block.replaceChildren(list);
}
