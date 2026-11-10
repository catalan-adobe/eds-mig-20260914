function buildProperties(rows) {
  const list = document.createElement('dl');
  list.className = 'download-properties';
  rows.forEach((row) => {
    const [label, value] = row.children;
    const property = document.createElement('div');
    const term = document.createElement('dt');
    const content = document.createElement('dd');
    term.textContent = label.textContent.trim();
    content.textContent = value.textContent.trim();
    property.append(term, content);
    list.append(property);
  });
  return list;
}

function buildAction(link) {
  const action = document.createElement('a');
  action.className = 'download-action';
  action.href = link.href;
  action.setAttribute('download', '');
  const text = document.createElement('span');
  text.textContent = link.textContent.trim();
  action.append(text);
  return action;
}

export default function decorate(block) {
  const rows = [...block.children];
  const singles = rows.filter((row) => row.children.length === 1);
  const properties = rows.filter((row) => row.children.length > 1);
  const link = singles[0]?.querySelector('a[href]');
  const descriptionText = singles[link ? 1 : 0]?.textContent.trim();
  const content = [];

  if (link) {
    const title = document.createElement('h3');
    title.className = 'download-title';
    link.className = '';
    title.append(link);
    content.push(title);
  }
  if (descriptionText) {
    const description = document.createElement('p');
    description.className = 'download-description';
    description.textContent = descriptionText;
    content.push(description);
  }
  if (properties.length) content.push(buildProperties(properties));
  if (link) content.push(buildAction(link));

  block.replaceChildren(...content);
}
