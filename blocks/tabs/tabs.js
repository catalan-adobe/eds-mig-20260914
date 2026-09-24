/**
 * tabs — WKND trip details (cmp-tabs): a row of uppercase tab titles above one
 * visible panel; the active tab is inverted (dark ground, white text).
 *
 * Schema: stardust/eds-schema/us-en-adventures-climbing-new-zealand-html.json
 *   → sections[4] "trip-details" (repeat unit DIV.tabs__panel × 3).
 * Decode tier: reconstructive — one tab per authored row.
 *
 * Authoring rows (one per tab):
 *   cell 1: tab title (a <p>; DA delivers every cell text as a paragraph)
 *   cell 2: panel content — prose (h2, p, ul), images (<picture>) in authored
 *           order. Leave it EMPTY to fill the panel from sibling SECTIONS
 *           instead: every following section whose section-metadata carries
 *           `tab | <title>` (delivered as data-tab) is adopted whole — its
 *           decorated wrappers move into the panel, its blocks are loaded here
 *           (D2: a panel that needs a block, e.g. a card list, is authored as
 *           its own section, never as a nested table).
 * Variant `cards` (block class) marks panels that hold a card list.
 * Variant `fragment` (block class): each panel is an AEM content fragment whose
 * leading <h3> is the fragment title — rendered display:none on live
 * (.cmp-contentfragment__title), so it moves into a hidden .tabs-panel-title.
 * @ew-exempt h3 fragment title (variant fragment) — hidden on live, never displayed
 *
 * Generated controls carry no words (#100): the tab list is built from the
 * authored title paragraphs (moved, EW1/EW7 — an <li role="tab"> hosts the
 * editor, a <button> would not). Ids derive from the title text for
 * aria-controls / aria-labelledby.
 */

function slug(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function cellNodes(cell) {
  const kids = [...cell.children];
  if (kids.length) return kids;
  // HARNESS-ONLY fallback (EW5): bare text in a cell — DA always delivers a <p>.
  if (cell.textContent.trim()) {
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

function adoptSections(panel, title) {
  const main = panel.closest('main') || document.querySelector('main');
  if (!main) return [];
  const key = slug(title);
  const sections = [...main.querySelectorAll(':scope > .section[data-tab]')]
    .filter((s) => slug(s.dataset.tab) === key);
  const blocks = [];
  sections.forEach((section) => {
    [...section.children].forEach((wrapper) => {
      blocks.push(...wrapper.querySelectorAll('.block'));
      panel.append(wrapper);
    });
    section.remove();
  });
  return blocks;
}

function hideFragmentTitle(panel) {
  const first = panel.firstElementChild;
  if (!first || !first.matches('h3')) return;
  const title = document.createElement('div');
  title.className = 'tabs-panel-title';
  title.append(first);
  panel.prepend(title);
}

function buildTab(row, index, ids, fragment) {
  const cells = [...row.children];
  const titleNodes = cellNodes(cells[0]);
  const title = titleNodes.map((n) => n.textContent).join(' ');
  const id = `${ids}-${slug(title) || index}`;

  const tab = document.createElement('li');
  tab.className = 'tabs-tab';
  tab.id = `${id}-tab`;
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', `${id}-panel`);
  tab.append(...titleNodes);

  const panel = document.createElement('div');
  panel.className = 'tabs-panel';
  panel.id = `${id}-panel`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tab.id);
  const content = cells.slice(1).flatMap(cellNodes);
  panel.append(...content);
  if (fragment) hideFragmentTitle(panel);
  const adopted = content.length ? [] : adoptSections(panel, title);
  return { tab, panel, adopted };
}

function wireTabs(tabs, panels) {
  const activate = (n, focus = false) => {
    tabs.forEach((tab, k) => {
      const on = k === n;
      tab.classList.toggle('active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      panels[k].classList.toggle('active', on);
      panels[k].hidden = !on;
    });
    if (focus) tabs[n].focus();
  };
  tabs.forEach((tab, k) => {
    tab.addEventListener('click', () => activate(k));
    tab.addEventListener('keydown', (e) => {
      const last = tabs.length - 1;
      const moves = {
        ArrowRight: k === last ? 0 : k + 1,
        ArrowLeft: k === 0 ? last : k - 1,
        Home: 0,
        End: last,
        Enter: k,
        ' ': k,
      };
      if (moves[e.key] === undefined) return;
      e.preventDefault();
      activate(moves[e.key], true);
    });
  });
  activate(0);
}

export default async function decorate(block) {
  if (block.querySelector(':scope > .tabs-list')) return; // EW9 re-entrant
  const rows = [...block.children].filter((row) => row.children.length);
  if (!rows.length) return;

  const ids = block.id || `tabs-${[...document.querySelectorAll('.tabs')].indexOf(block) + 1}`;
  const list = document.createElement('ol');
  list.className = 'tabs-list';
  list.setAttribute('role', 'tablist');
  const fragment = block.classList.contains('fragment');
  const built = rows.map((row, i) => buildTab(row, i, ids, fragment));
  const tabs = built.map((b) => b.tab);
  const panels = built.map((b) => b.panel);
  list.append(...tabs);
  block.replaceChildren(list, ...panels);
  wireTabs(tabs, panels);

  const adopted = built.flatMap((b) => b.adopted);
  if (adopted.length) {
    // adopted sections were still undecorated: load their blocks here
    const { loadBlock } = await import('../../scripts/aem.js');
    await Promise.all(adopted.map((b) => loadBlock(b)));
  }
}
