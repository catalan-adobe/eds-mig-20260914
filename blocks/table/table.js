const BLOCKS = 'p, ul, ol, h1, h2, h3, h4, h5, h6, div, picture';

/**
 * Moves the content of a block cell into a table cell. A lone paragraph loses its `p`, unless
 * the cells hold paragraphs: then bare text gets one (the pipeline delivers it without).
 */
function fill(target, cell, paragraphs) {
  const only = cell.children.length === 1 && cell.firstElementChild;
  const lone = only?.tagName === 'P' && cell.textContent.trim() === only.textContent.trim();
  const bare = cell.textContent.trim() && ![...cell.children].some((c) => c.matches(BLOCKS));
  if (paragraphs && bare) {
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    target.append(p);
  } else target.append(...(lone && !paragraphs ? only : cell).childNodes);
}

/** The authored widths of the first row's cells, from a `w-73-605` class (p: percent, 0: none). */
function widthsOf(block) {
  const variant = [...block.classList].find((c) => /^w-\d+p?(-\d+p?)*$/.test(c));
  return variant ? variant.slice(2).split('-')
    .map((w) => (w === '0' ? '' : w.replace(/p$/, '%').replace(/(\d)$/, '$1px'))) : [];
}

// a position covered by a merged cell: part of the cell on its left, or of the cell above
const COVERED = { '<': [0, -1], '^': [-1, 0] };

/** The cell that a covered position belongs to, or null when the cell is not a cover mark. */
function ownerOf(cell, owners, r, c) {
  const [dr, dc] = COVERED[cell.textContent.trim()] ?? [];
  if (dr === undefined || cell.querySelector('img')) return null;
  return owners[r + dr]?.[c + dc] ?? null;
}

/**
 * The source's script for tables with rowspans: rows after the first alternate by the colour of
 * the row before, the rows of a rowspan take the colour of its first row and get side borders.
 * The first row keeps its stripe colour (light).
 */
function stripeMerged(table) {
  const rows = [...table.rows];
  const light = new Map([[rows[0], true]]);
  const merged = new Set();
  rows.forEach((tr, k) => {
    if (k === 0 || merged.has(tr)) return;
    light.set(tr, !light.get(rows[k - 1]));
    tr.style.backgroundColor = light.get(tr) ? '#f7f7fa' : '#fff';
    [...tr.cells].filter((td) => td.rowSpan > 1).forEach((td) => {
      tr.style.border = '1px solid #e3e3e3';
      tr.style.borderTop = 'none';
      rows.slice(k + 1, k + td.rowSpan).forEach((next, p, all) => {
        light.set(next, light.get(tr));
        next.style.backgroundColor = tr.style.backgroundColor;
        next.style.border = '1px solid #e3e3e3';
        if (p === all.length - 1) next.style.borderBottom = 'none';
        next.classList.add('merged-row');
        merged.add(next);
      });
    });
  });
}

/** Builds the table rows; merged cells are read from their cover marks (`<`, `^`). */
function buildRows(rows, header, paragraphs) {
  const owners = [];
  return rows.map((row, r) => {
    const tr = document.createElement('tr');
    owners[r] = [];
    const cells = [...row.children];
    const own = cells.map((cell, c) => {
      const owner = ownerOf(cell, owners, r, c);
      if (owner) {
        if (c - owner.c >= owner.td.colSpan) owner.td.colSpan = c - owner.c + 1;
        if (r - owner.r >= owner.td.rowSpan) owner.td.rowSpan = r - owner.r + 1;
      }
      owners[r][c] = owner ?? { td: document.createElement(header && r === 0 ? 'th' : 'td'), r, c };
      return owner ? null : [cell, owners[r][c].td];
    }).filter(Boolean);
    // an empty row is a row of no-break spaces in the source: it keeps one line of height
    const blank = own.every(([cell]) => !cell.textContent.trim() && !cell.querySelector('img'));
    own.forEach(([cell, td]) => {
      if (blank) td.textContent = '\u00a0';
      else fill(td, cell, paragraphs);
      tr.append(td);
    });
    return tr;
  });
}

export default function decorate(block) {
  // a table without content draws nothing, as the source's empty table
  const filled = block.textContent.trim() || block.querySelector('img');
  const rows = filled ? [...block.children] : [];
  const header = block.classList.contains('header');
  const table = document.createElement('table');
  const body = document.createElement('tbody');
  // the header row stays in tbody, as in the source: the stripes count it
  body.append(...buildRows(rows, header, block.classList.contains('paragraphs')));
  table.append(body);
  const widths = widthsOf(block);
  [...(table.rows[0]?.cells ?? [])].forEach((cell, i) => {
    if (widths[i]) cell.style.width = widths[i];
  });
  // the source's table component sizes its table by the cell count of the first row
  block.style.setProperty('--column-count', table.rows[0]?.cells.length ?? 1);
  block.replaceChildren(...(filled ? [table] : []));
  if (block.classList.contains('striped') && table.querySelector('[rowspan]')) {
    stripeMerged(table);
  }
}
