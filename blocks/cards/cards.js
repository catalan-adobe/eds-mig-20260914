import { createOptimizedPicture } from '../../scripts/aem.js';

let tabsCount = 0;

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function optimizedPicture(row) {
  const img = row.querySelector('picture > img');
  return img ? createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]) : null;
}

function textCell(row) {
  return [...row.children].find((cell) => !cell.querySelector('picture'));
}

function buildCard(row) {
  const li = el('li', 'cards-card');
  const picture = optimizedPicture(row);
  const [first, ...rest] = [...(textCell(row)?.children || [])];
  const link = first?.querySelector('a');

  if (picture) {
    const image = el('div', 'cards-card-image', picture);
    if (link) {
      const imageLink = el('a', 'cards-card-image-link', image);
      imageLink.href = link.href;
      if (!picture.querySelector('img').alt) imageLink.setAttribute('aria-label', link.textContent.trim());
      li.append(imageLink);
    } else {
      li.append(image);
    }
  }
  if (first) {
    const title = el('span', 'cards-card-title', ...(link || first).childNodes);
    if (link) {
      link.className = 'cards-card-title-link';
      link.replaceChildren(title);
      li.append(link);
    } else {
      li.append(title);
    }
  }
  if (rest.length) {
    li.append(el('span', 'cards-card-description', rest.map((p) => p.textContent.trim()).join(' ')));
  }
  return li;
}

function buildSecureCard(row) {
  const picture = optimizedPicture(row);
  const [title, ...rest] = [...(textCell(row)?.children || [])];
  const action = rest.length > 1 ? rest.pop() : null;
  const body = el('div', 'cards-card-body');

  if (title) body.append(el('h3', 'cards-card-title', ...title.childNodes));
  if (rest.length) body.append(el('div', 'cards-card-description', ...rest));
  if (action) body.append(el('div', 'cards-card-action', ...action.childNodes));

  const content = el('div', 'cards-card-content', body);
  if (picture) content.append(el('div', 'cards-card-image', picture));
  return el('li', 'cards-card', content);
}

function selectTab(tabs, panels, index, focus) {
  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', selected);
    tab.tabIndex = selected ? 0 : -1;
    panels[i].hidden = !selected;
  });
  if (focus) tabs[index].focus();
}

function buildTabs(block, rows) {
  tabsCount += 1;
  const id = `cards-tabs-${tabsCount}`;
  const tablist = el('div', 'cards-tablist');
  tablist.setAttribute('role', 'tablist');
  const tabs = [];
  const panels = [];
  let list;

  rows.forEach((row) => {
    const isLabel = row.children.length === 1 && !row.querySelector('picture');
    if (isLabel || !list) {
      const index = tabs.length;
      const tab = el('button', 'cards-tab', isLabel ? row.textContent.trim() : '');
      tab.type = 'button';
      tab.id = `${id}-tab-${index}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `${id}-panel-${index}`);
      tab.addEventListener('click', () => selectTab(tabs, panels, index));

      list = el('ul', 'cards-list');
      const panel = el('div', 'cards-tabpanel', list);
      panel.id = `${id}-panel-${index}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;

      tabs.push(tab);
      panels.push(panel);
      tablist.append(tab);
    }
    if (!isLabel) list.append(buildCard(row));
  });

  tablist.addEventListener('keydown', (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    const current = tabs.indexOf(event.target);
    if (!step || current < 0) return;
    event.preventDefault();
    selectTab(tabs, panels, (current + step + tabs.length) % tabs.length, true);
  });

  if (tabs.length) selectTab(tabs, panels, 0);
  block.replaceChildren(tablist, ...panels);
}

export default function decorate(block) {
  const rows = [...block.children];
  if (block.classList.contains('tabs')) {
    buildTabs(block, rows);
    return;
  }
  const build = block.classList.contains('secure') ? buildSecureCard : buildCard;
  block.replaceChildren(el('ul', 'cards-list', ...rows.map(build)));
}
