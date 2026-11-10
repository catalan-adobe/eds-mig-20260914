let accordionCount = 0;

function buildHeader(label, id) {
  const header = document.createElement('h3');
  header.className = 'accordion-header';

  const button = document.createElement('button');
  button.type = 'button';
  button.id = `${id}-button`;
  button.className = 'accordion-button';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', `${id}-panel`);

  const title = document.createElement('span');
  title.className = 'accordion-title';
  title.textContent = label ? label.textContent.trim() : '';

  const icon = document.createElement('span');
  icon.className = 'accordion-icon';
  icon.setAttribute('aria-hidden', 'true');

  button.append(title, icon);
  header.append(button);
  return header;
}

export default function decorate(block) {
  accordionCount += 1;

  [...block.children].forEach((row, index) => {
    const [label, body] = row.children;
    const id = `accordion-${accordionCount}-item-${index + 1}`;
    const header = buildHeader(label, id);
    const button = header.firstElementChild;

    const panel = body || document.createElement('div');
    panel.id = `${id}-panel`;
    panel.className = 'accordion-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', button.id);
    panel.hidden = true;

    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });

    row.className = 'accordion-item';
    row.replaceChildren(header, panel);
  });
}
