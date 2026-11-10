import { createOptimizedPicture } from '../../scripts/aem.js';

const IMAGE_WIDTH = {
  people: '330', byline: '120', locked: '720', default: '520',
};

function variant(block) {
  return Object.keys(IMAGE_WIDTH).find((name) => block.classList.contains(name)) || 'default';
}

/** Filter cards hold their categories in the last cell. It has no link and no image. */
function takeCategories(cells) {
  const last = cells[cells.length - 1];
  if (cells.length < 2 || last.querySelector('a, picture')) return '';
  cells.pop();
  return last.textContent;
}

function buildCard(row, isFilter) {
  const li = document.createElement('li');
  const cells = [...row.children];
  if (isFilter) li.dataset.categories = takeCategories(cells);
  cells.forEach((cell) => {
    const isImage = cell.children.length === 1 && cell.querySelector('picture');
    cell.className = isImage ? 'cards-card-image' : 'cards-card-body';
    li.append(cell);
  });
  return li;
}

/** The image links to the same page as the title. The title link is the one read out. */
function linkImage(li) {
  const title = li.querySelector('.cards-card-body a');
  const image = li.querySelector('.cards-card-image picture');
  if (!title || !image) return;
  const a = document.createElement('a');
  a.href = title.href;
  a.tabIndex = -1;
  a.setAttribute('aria-hidden', 'true');
  image.replaceWith(a);
  a.append(image);
}

/** A list card is one link holding the title and the date. */
function buildListItem(li) {
  const a = li.querySelector('a');
  const date = li.querySelector('p:not(:has(a))');
  if (!a) return;
  const title = document.createElement('span');
  title.className = 'cards-list-title';
  title.textContent = a.textContent;
  a.replaceChildren(title);
  if (date) {
    const time = document.createElement('span');
    time.className = 'cards-list-date';
    time.textContent = date.textContent;
    a.append(time);
  }
  li.replaceChildren(a);
}

/** Links that hold only an icon are named after the icon. */
function nameIconLinks(ul) {
  ul.querySelectorAll('a:has(.icon)').forEach((a) => {
    if (a.textContent.trim()) return;
    const icon = [...a.querySelector('.icon').classList].find((c) => c.startsWith('icon-'));
    const name = icon?.slice(5);
    if (name) a.setAttribute('aria-label', name);
  });
}

function buildFilter(block, ul) {
  const cards = [...ul.children];
  const split = (li) => li.dataset.categories.split(',').map((c) => c.trim()).filter(Boolean);
  const categories = [...new Set(cards.flatMap(split))].sort();
  if (!categories.length) return;
  const group = document.createElement('div');
  group.className = 'cards-filter';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Filter');
  ['All', ...categories].forEach((category, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = category;
    button.setAttribute('aria-pressed', i === 0);
    button.addEventListener('click', () => {
      group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === button));
      cards.forEach((li) => { li.hidden = i > 0 && !split(li).includes(category); });
    });
    group.append(button);
  });
  block.prepend(group);
}

export default function decorate(block) {
  const isFilter = block.classList.contains('filter');
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => ul.append(buildCard(row, isFilter)));
  const width = IMAGE_WIDTH[variant(block)];
  ul.querySelectorAll('picture > img').forEach((img) => {
    const picture = createOptimizedPicture(img.src, img.alt, false, [{ width }]);
    img.closest('picture').replaceWith(picture);
  });
  if (block.classList.contains('list')) ul.querySelectorAll('li').forEach(buildListItem);
  else if (!block.classList.contains('locked')) ul.querySelectorAll('li').forEach(linkImage);
  nameIconLinks(ul);
  block.replaceChildren(ul);
  if (isFilter) buildFilter(block, ul);
}
