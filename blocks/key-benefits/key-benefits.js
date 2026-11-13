function element(tag, className, ...children) {
  const el = document.createElement(tag);
  el.className = className;
  el.append(...children);
  return el;
}

/** Icon and title side by side, the description below; a linked title links the whole item. */
function keyBenefit(row) {
  const media = row.querySelector('picture, img');
  const text = [...row.children].findLast((cell) => cell.textContent.trim());
  const [title, ...rest] = [...(text?.children ?? [])].filter((el) => !el.contains(media));
  const link = title?.querySelector('a[href]');
  const item = element(link ? 'a' : 'div', 'key-benefit');
  if (link) {
    item.href = link.href.replace(/#_blank$/, '');
    if (link.hash === '#_blank') {
      item.target = '_blank';
      item.rel = 'noreferer noopener';
    }
    link.replaceWith(...link.childNodes);
  }
  const head = element('div', 'key-benefit-head');
  if (media) head.append(media);
  if (title) {
    title.className = 'key-benefit-title';
    head.append(title);
  } else if (text) {
    head.append(element('p', 'key-benefit-title', ...text.childNodes));
  }
  // the description is one box of text, so that it can be cut after two lines as the source's
  const description = element('div', 'key-benefit-description');
  rest.forEach((p, i) => {
    if (i) description.append(document.createElement('br'));
    description.append(...p.childNodes);
  });
  item.append(head, description);
  return item;
}

export default function decorate(block) {
  const count = Number([...block.classList].find((c) => /^cols-\d$/.test(c))?.slice(5)) || 1;
  const columns = Array.from({ length: count }, () => element('div', 'key-benefits-column'));
  // the rows are in reading order; an empty row leaves its place in the column empty
  [...block.children].forEach((row, i) => {
    if (row.textContent.trim() || row.querySelector('img')) {
      columns[i % count].append(keyBenefit(row));
    }
  });
  block.replaceChildren(...columns);
}
