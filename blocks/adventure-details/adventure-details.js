// aem.js wraps bare cell text in a <p>, which would bring the body paragraph size and margin.
function content(cell) {
  return (cell.querySelector(':scope > p:only-child') || cell).childNodes;
}

export default function decorate(block) {
  const list = document.createElement('dl');
  [...block.children].forEach((row) => {
    const [label, value] = row.children;
    if (!label) return;
    const item = document.createElement('div');
    const term = document.createElement('dt');
    term.append(...content(label));
    const description = document.createElement('dd');
    if (value) description.append(...content(value));
    item.append(term, description);
    list.append(item);
  });
  block.replaceChildren(list);
}
