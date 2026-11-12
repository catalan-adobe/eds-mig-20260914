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

export default function decorate(block) {
  // a table without content draws nothing, as the source's empty table
  const filled = block.textContent.trim() || block.querySelector('img');
  const rows = filled ? [...block.children] : [];
  const header = block.classList.contains('header');
  const paragraphs = block.classList.contains('paragraphs');
  const table = document.createElement('table');
  const body = document.createElement('tbody');
  rows.forEach((row, index) => {
    const tr = document.createElement('tr');
    // an empty row is a row of no-break spaces in the source: it keeps one line of height
    const blank = !row.textContent.trim() && !row.querySelector('img');
    [...row.children].forEach((cell) => {
      const td = document.createElement(header && index === 0 ? 'th' : 'td');
      if (blank) td.textContent = '\u00a0';
      else fill(td, cell, paragraphs);
      tr.append(td);
    });
    // the header row stays in tbody, as in the source: the stripes count it
    body.append(tr);
  });
  table.append(body);
  const widths = widthsOf(block);
  [...(table.rows[0]?.cells ?? [])].forEach((cell, i) => {
    if (widths[i]) cell.style.width = widths[i];
  });
  // the source's table component sizes its table by the column count of the first row
  block.style.setProperty('--column-count', rows[0]?.children.length ?? 1);
  block.replaceChildren(...(filled ? [table] : []));
}
