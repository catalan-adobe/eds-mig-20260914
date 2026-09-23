import { buildArticleCard } from '../../scripts/article-card.js';

let uid = 0;

function select(tabs, tab) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
}

/**
 * Team pane: picture, name (strong-only p), optional role (em-only p), bio paragraphs.
 * @param {Element} cell authored cell
 */
function buildProfile(cell) {
  const spacer = document.createElement('div');
  spacer.className = 'team-profile-spacer';
  const col = document.createElement('div');
  col.className = 'team-profile-col';
  const circle = document.createElement('div');
  circle.className = 'profile-circle';
  const picture = cell.querySelector('picture, img');
  circle.append(picture.parentElement.matches('p') ? picture.parentElement : picture);
  const who = document.createElement('div');
  const name = cell.querySelector(':scope > p:has(> strong:only-child)');
  const role = cell.querySelector(':scope > p:has(> em:only-child)');
  who.append(...[name, role].filter(Boolean));
  col.append(circle, who);
  const bio = document.createElement('div');
  bio.className = 'team-profile-bio';
  bio.append(...cell.children);
  cell.className = 'team-profile-row';
  cell.append(spacer, col, bio);
}

/**
 * Tabs: each row is one tab — first cell the label, the rest the pane
 * (article cards, or a team profile with the `team` variant).
 * @param {Element} block The tabs block element
 */
export default function decorate(block) {
  uid += 1;
  const team = block.classList.contains('team');
  const menu = document.createElement('div');
  menu.className = 'tab-menu';
  menu.setAttribute('role', 'tablist');
  const tabs = [...block.children].map((row, i) => {
    const [labelCell, ...cells] = row.children;
    const tab = document.createElement('div');
    tab.className = 'tab-link';
    tab.setAttribute('role', 'tab');
    tab.id = `tab-${uid}-${i}`;
    tab.setAttribute('aria-controls', `tabpanel-${uid}-${i}`);
    tab.append(...labelCell.childNodes);
    labelCell.remove();
    row.className = 'tab-pane';
    row.id = `tabpanel-${uid}-${i}`;
    row.setAttribute('role', 'tabpanel');
    row.setAttribute('aria-labelledby', tab.id);
    if (team) cells.forEach(buildProfile);
    else cells.forEach(buildArticleCard);
    menu.append(tab);
    return tab;
  });
  const panels = document.createElement('div');
  panels.className = 'tab-panels';
  panels.append(...block.children);
  block.append(menu, panels);

  menu.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab-link');
    if (tab) select(tabs, tab);
  });
  menu.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(e.target);
    if (i < 0) return;
    let next;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (e.key === 'Enter' || e.key === ' ') next = tabs[i];
    if (!next) return;
    e.preventDefault();
    select(tabs, next);
    next.focus();
  });
  select(tabs, tabs[0]);
}
