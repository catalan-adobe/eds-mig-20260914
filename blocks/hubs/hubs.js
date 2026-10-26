/**
 * Resource hubs: one row per hub — linked topic name + illustration | "what you'll learn"
 * label + summary | "featured resources" label + list + "start now" link.
 */

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function buildTile(cell) {
  const link = cell.querySelector('a');
  link.append(el('span', '', ...link.childNodes));
  const picture = cell.querySelector('picture');
  const pictureP = picture.closest('p');
  const tile = el('div', 'hub-tile', picture, link.closest('p') || link);
  if (pictureP && !pictureP.textContent.trim()) pictureP.remove();
  return el('div', 'hub-col hub-tile-col', tile);
}

function buildSummary(cell) {
  const [label, ...text] = cell.querySelectorAll('p');
  return el('div', 'hub-col hub-summary', el('div', 'hub-label', label), el('div', 'hub-text', ...text));
}

function buildResources(cell) {
  const [label] = cell.querySelectorAll('p');
  const list = cell.querySelector('ul');
  const start = [...cell.querySelectorAll('p')].find((p) => p.querySelector('a'));
  return el('div', 'hub-col hub-resources', el('div', 'hub-label', label), list, el('div', 'hub-start', start));
}

export default function decorate(block) {
  const hubs = [...block.children].map((row) => {
    const [tileCell, summaryCell, resourcesCell] = [...row.children];
    const topicLink = tileCell.querySelector('a');
    const topic = topicLink ? new URL(topicLink.href).pathname.split('/').filter(Boolean).pop() : '';
    const hub = el(
      'section',
      'hub',
      el('div', 'hub-card', el('div', 'hub-outer', el(
        'div',
        'hub-row',
        buildTile(tileCell),
        buildSummary(summaryCell),
        buildResources(resourcesCell),
      ))),
    );
    if (topic) hub.dataset.topic = topic;
    return hub;
  });
  block.textContent = '';
  block.append(...hubs);
}
