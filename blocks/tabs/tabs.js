import { toClassName } from '../../scripts/aem.js';

let count = 0;

function select(block, tab) {
  block.querySelectorAll('[role="tab"]').forEach((other) => {
    const selected = other === tab;
    other.setAttribute('aria-selected', selected);
    other.tabIndex = selected ? 0 : -1;
    block.querySelector(`#${other.getAttribute('aria-controls')}`).hidden = !selected;
  });
}

function onKeydown(e, block) {
  const tabs = [...block.querySelectorAll('[role="tab"]')];
  const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
  if (!step) return;
  const next = tabs[(tabs.indexOf(e.target) + step + tabs.length) % tabs.length];
  select(block, next);
  next.focus();
}

/**
 * Rows are tabs: a label, then the panel content.
 * @param {Element} block The tabs block element
 */
export default function decorate(block) {
  count += 1;
  const list = document.createElement('div');
  list.className = 'tabs-list';
  list.setAttribute('role', 'tablist');
  [...block.children].forEach((row, i) => {
    const [label, content] = row.children;
    const id = `${toClassName(label.textContent)}-${count}-${i}`;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-tab';
    tab.id = `tab-${id}`;
    tab.textContent = label.textContent;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `tabpanel-${id}`);
    tab.addEventListener('click', () => select(block, tab));
    list.append(tab);
    label.remove();
    row.className = 'tabs-panel';
    row.id = `tabpanel-${id}`;
    row.setAttribute('role', 'tabpanel');
    row.setAttribute('aria-labelledby', tab.id);
    content?.classList.add('rich-text');
  });
  list.addEventListener('keydown', (e) => onKeydown(e, block));
  block.prepend(list);
  if (list.firstElementChild) select(block, list.firstElementChild);
}
