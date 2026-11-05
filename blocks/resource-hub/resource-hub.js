const LABELS = { learn: "What you'll learn", resources: 'Featured resources' };

function addLabel(cell, text) {
  const label = document.createElement('span');
  label.className = 'resource-hub-label';
  label.textContent = text;
  cell.prepend(label);
}

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const card = cells.find((c) => c.querySelector('picture, img'));
  const resources = cells.find((c) => c.querySelector('ul, ol'));
  const learn = cells.find((c) => c !== card && c !== resources);

  const row = document.createElement('div');
  row.className = 'resource-hub-row';
  [[card, 'card'], [learn, 'learn'], [resources, 'resources']].forEach(([cell, name]) => {
    if (!cell) return;
    cell.className = `resource-hub-${name}`;
    if (name !== 'card') addLabel(cell, LABELS[name]);
    row.append(cell);
  });
  block.replaceChildren(row);
}
