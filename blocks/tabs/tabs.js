import { toClassName } from '../../scripts/aem.js';

let instances = 0;

function selectTab(tabs, panels, index, byUser) {
  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', selected);
    tab.tabIndex = selected ? 0 : -1;
    panels[i].hidden = !selected;
  });
  if (!byUser) return;
  tabs[index].focus();
  window.history.replaceState(null, '', `#${tabs[index].id}`);
}

function selectFromHash(tabs, panels) {
  const index = tabs.findIndex((tab) => tab.id === window.location.hash.slice(1));
  if (index >= 0) selectTab(tabs, panels, index);
  return index >= 0;
}

function onKeydown(event, tabs, panels) {
  const current = tabs.indexOf(event.target);
  const targets = {
    ArrowRight: Math.min(current + 1, tabs.length - 1),
    ArrowLeft: Math.max(current - 1, 0),
    Home: 0,
    End: tabs.length - 1,
  };
  const next = targets[event.key];
  if (current < 0 || next === undefined) return;
  event.preventDefault();
  selectTab(tabs, panels, next, true);
}

export default function decorate(block) {
  instances += 1;
  const prefix = `tabs-${instances}`;
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');
  const tabs = [];
  const panels = [];

  [...block.children].forEach((row, i) => {
    const [labelCell, contentCell] = row.children;
    const label = labelCell ? labelCell.textContent.trim() : '';
    if (!label) return;
    const id = `${prefix}-${toClassName(label) || i}`;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-tab';
    tab.id = `${id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${id}-panel`);
    tab.textContent = label;

    const panel = contentCell || document.createElement('div');
    panel.className = 'tabs-panel rich-text';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;

    tabs.push(tab);
    panels.push(panel);
  });

  tabs.forEach((tab, i) => tab.addEventListener('click', () => selectTab(tabs, panels, i, true)));
  tablist.addEventListener('keydown', (event) => onKeydown(event, tabs, panels));
  tablist.append(...tabs);
  block.replaceChildren(...(tabs.length ? [tablist, ...panels] : []));
  if (!tabs.length) return;
  if (!selectFromHash(tabs, panels)) selectTab(tabs, panels, 0);
  window.addEventListener('hashchange', () => selectFromHash(tabs, panels));
}
