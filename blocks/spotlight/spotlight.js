/**
 * A framed box with its title on the border. Row 1: title, row 2: content. With a title only,
 * the box frames what follows it in its section (other blocks).
 * @param {Element} block
 */
export default function decorate(block) {
  const [first, ...rest] = [...block.children];
  if (!first) return;
  const title = document.createElement('h2');
  title.className = 'spotlight-title';
  const label = document.createElement('span');
  const cell = first.firstElementChild ?? first;
  label.append(...(cell.querySelector(':scope > p:only-child') ?? cell).childNodes);
  title.append(label);
  first.replaceWith(title);
  const rich = block.classList.contains('rich-text');
  rest.forEach((row) => {
    row.classList.add('spotlight-content');
    if (!rich) row.firstElementChild?.classList.add('text-content');
  });
  if (rest.length) return;
  const wrapper = block.parentElement;
  while (wrapper?.nextElementSibling) block.append(wrapper.nextElementSibling);
}
