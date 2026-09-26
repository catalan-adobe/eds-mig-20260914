/**
 * Unwraps every <a> inside cell, returning the first href found.
 * @param {Element} cell cell to unwrap
 * @returns {string|null} href or null
 */
function unwrapLinks(cell) {
  let href = null;
  cell.querySelectorAll('a[href]').forEach((a) => {
    href = href || a.getAttribute('href');
    a.replaceWith(...a.childNodes);
  });
  return href;
}

/**
 * "Industry"/"Technology" style benefit lists. Row 0 = the two column
 * headings, following rows = one icon+title+description item per column
 * cell. Flattens into a single per-column list (heading + items) so mobile
 * gets natural "Industry list, then Technology list" order for free, while
 * desktop lays the same flat list out as a column-major grid (heading+6
 * items per track) to stay row-aligned. Each item becomes a single link
 * (matches .cmp-key-benefits__link fidelity).
 * @param {Element} block the columns block
 */
function decorateKeyBenefits(block) {
  const [headingRow, ...itemRows] = [...block.children];
  if (!headingRow) return;
  const headingCells = [...headingRow.children];
  const rowCells = itemRows.map((row) => [...row.children]);
  const flat = document.createElement('div');
  flat.className = 'columns-key-benefits-flat';
  headingCells.forEach((headingCell, colIndex) => {
    headingCell.classList.add('columns-key-benefits-heading');
    flat.append(headingCell);
    rowCells.forEach((cells) => {
      const cell = cells[colIndex];
      if (!cell) return;
      cell.classList.add('columns-key-benefits-item');
      cell.querySelector('picture, img')?.closest('p')?.classList.add('columns-key-benefits-icon');
      const paragraphs = [...cell.querySelectorAll('p')];
      if (paragraphs.length > 1) paragraphs[paragraphs.length - 1].classList.add('columns-key-benefits-desc');
      const href = unwrapLinks(cell);
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.className = 'columns-key-benefits-link';
        a.append(...cell.childNodes);
        cell.append(a);
      }
      flat.append(cell);
    });
  });
  block.replaceChildren(flat);
}

/**
 * Two text columns separated by a vertical divider on desktop, stacked on
 * mobile; CTA links (link alone in a paragraph) get a trailing chevron.
 * @param {Element} block the columns block
 */
function decorateDivider(block) {
  const row = block.firstElementChild;
  const cols = row ? [...row.children] : [];
  cols.forEach((col, i) => {
    col.querySelectorAll('p').forEach((p) => {
      const a = p.querySelector('a[href]');
      if (a && p.textContent.trim() === a.textContent.trim()) {
        a.classList.add('columns-cta-link');
      }
    });
    if (i < cols.length - 1) {
      const divider = document.createElement('div');
      divider.className = 'columns-divider';
      col.after(divider);
    }
  });
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  if (block.classList.contains('key-benefits')) decorateKeyBenefits(block);
  if (block.classList.contains('divider')) decorateDivider(block);
}
