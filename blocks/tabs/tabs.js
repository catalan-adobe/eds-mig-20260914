let instances = 0;

function selectTab(tabs, panels, index, focus) {
  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', selected);
    tab.tabIndex = selected ? 0 : -1;
    panels[i].hidden = !selected;
  });
  if (focus) tabs[index].focus();
}

function onKeydown(event, tabs, panels) {
  const current = tabs.indexOf(event.target);
  const targets = {
    ArrowRight: (current + 1) % tabs.length,
    ArrowLeft: (current - 1 + tabs.length) % tabs.length,
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

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-tab';
    tab.id = `${prefix}-tab-${i}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${prefix}-panel-${i}`);
    tab.textContent = label;

    const panel = contentCell || document.createElement('div');
    panel.className = 'tabs-panel rich-text';
    panel.id = `${prefix}-panel-${i}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;

    tabs.push(tab);
    panels.push(panel);
  });

  tabs.forEach((tab, i) => tab.addEventListener('click', () => selectTab(tabs, panels, i)));
  tablist.addEventListener('keydown', (event) => onKeydown(event, tabs, panels));
  tablist.append(...tabs);
  block.replaceChildren(...(tabs.length ? [tablist, ...panels] : []));
  if (tabs.length) selectTab(tabs, panels, 0);
}
