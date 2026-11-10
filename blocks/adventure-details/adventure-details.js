export default function decorate(block) {
  const list = document.createElement('dl');
  [...block.children].forEach((row) => {
    const [label, value] = row.children;
    if (!label) return;
    const item = document.createElement('div');
    const term = document.createElement('dt');
    term.append(...label.childNodes);
    const description = document.createElement('dd');
    if (value) description.append(...value.childNodes);
    item.append(term, description);
    list.append(item);
  });
  block.replaceChildren(list);
}
