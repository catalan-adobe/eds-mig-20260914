const HEADING = 'h1, h2, h3, h4, h5, h6';

function element(tag, className, ...children) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.append(...children);
  return el;
}

/** A date, a title and a place: the whole box is the link of the title. */
function eventItem(cell) {
  const link = cell.querySelector('a[href]');
  const lines = [...cell.children];
  const title = lines.find((p) => p.contains(link)) ?? lines[1];
  const box = element(link ? 'a' : 'div', 'box-link-event');
  if (link) {
    box.href = link.href;
    link.replaceWith(...link.childNodes);
  }
  const at = lines.indexOf(title);
  lines.forEach((p, i) => {
    let part = 'title';
    if (i < at) part = 'date';
    else if (i > at) part = 'place';
    p.className = `box-link-${part}`;
  });
  box.append(...lines);
  return element('li', 'box-link event', box);
}

/** A label, a link or not, with a list of links that opens below it. */
function dropdownItem(cell, menu) {
  const item = element('li', 'box-link dropdown');
  const link = [...cell.querySelectorAll('a[href]')].find((a) => !menu.contains(a));
  const label = link ?? element('span');
  menu.remove();
  if (!link) label.append(...(cell.querySelector('p') ?? cell).childNodes);
  label.className = 'box-link-label';
  const toggle = element('button', 'box-link-icon');
  toggle.type = 'button';
  toggle.setAttribute('aria-label', label.textContent.trim());
  toggle.setAttribute('aria-expanded', 'false');
  item.append(
    element('div', 'box-link-row', label, toggle),
    element('div', 'box-link-menu', menu),
  );
  // as the source: a click anywhere on the item but on a link opens and closes the list
  item.addEventListener('click', (e) => {
    if (e.target.closest('a, .box-link-menu')) return;
    toggle.setAttribute('aria-expanded', String(item.classList.toggle('open')));
  });
  return item;
}

function linkItem(cell) {
  const link = cell.querySelector('a[href]');
  const label = element('span', 'box-link-label');
  label.append(...(link ?? cell.querySelector('p') ?? cell).childNodes);
  const icon = element('span', 'box-link-icon');
  const row = element(link ? 'a' : 'div', 'box-link-row', label, icon);
  if (link) row.href = link.href;
  return element('li', 'box-link', row);
}

function boxLink(cell) {
  const menu = cell.querySelector('ul, ol');
  if (menu) return dropdownItem(cell, menu);
  return cell.querySelectorAll(':scope > p').length > 1 ? eventItem(cell) : linkItem(cell);
}

export default function decorate(block) {
  const count = Number([...block.classList].find((c) => /^cols-\d$/.test(c))?.slice(5)) || 1;
  const lists = Array.from({ length: count }, () => element('ul'));
  const out = [];
  let index = 0;
  [...block.children].forEach((row) => {
    const cell = row.firstElementChild ?? row;
    const title = cell.querySelector(HEADING);
    if (title) {
      title.classList.add('box-links-title');
      out.push(title);
      return;
    }
    // the rows are in reading order; an empty row leaves its place in the column empty
    if (cell.textContent.trim()) lists[index % count].append(boxLink(cell));
    index += 1;
  });
  out.push(element('div', 'box-links-columns', ...lists));
  block.replaceChildren(...out);
}
