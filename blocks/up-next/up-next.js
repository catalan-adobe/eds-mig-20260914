export default function decorate(block) {
  const list = document.createElement('ul');

  [...block.children].forEach((row) => {
    const [titleCell, dateCell] = row.children;
    const source = titleCell?.querySelector('a');
    const title = titleCell?.textContent.trim();
    if (!title) return;

    const link = document.createElement(source ? 'a' : 'div');
    link.className = 'up-next-link';
    if (source) link.href = source.href;

    const titleEl = document.createElement('span');
    titleEl.className = 'up-next-title';
    titleEl.textContent = title;
    link.append(titleEl);

    const date = dateCell?.textContent.trim();
    if (date) {
      const dateEl = document.createElement('span');
      dateEl.className = 'up-next-date';
      dateEl.textContent = date;
      link.append(dateEl);
    }

    const item = document.createElement('li');
    item.append(link);
    list.append(item);
  });

  block.replaceChildren(list);
}
