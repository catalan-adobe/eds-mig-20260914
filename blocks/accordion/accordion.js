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

const FOCUS_TARGET = {
  ArrowDown: (index) => index + 1,
  ArrowRight: (index) => index + 1,
  ArrowUp: (index) => index - 1,
  ArrowLeft: (index) => index - 1,
  Home: () => 0,
  End: (index, count) => count - 1,
};

function moveFocus(block, event) {
  const target = FOCUS_TARGET[event.key];
  const current = event.target.closest('.accordion-button');
  if (!target || !current) return;
  const buttons = [...block.querySelectorAll('.accordion-button')];
  event.preventDefault();
  buttons[target(buttons.indexOf(current), buttons.length)]?.focus();
}

export default function decorate(block) {
  accordionCount += 1;
  block.addEventListener('keydown', (event) => moveFocus(block, event));

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
