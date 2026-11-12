// The source's table component (`.cmp-table`): one `table striped` block per <table>. `striped` is
// the component's own look (shadow, striped rows, a fixed width per column). `auto-width` when
// the author kept the table's own width (useauthoredwidth), `header` when the first row is th,
// `sticky` when the first column stays in view on horizontal scroll. `center` when every cell is
// centred, `center-first-row` when only the first row is. `w-73-605` gives the authored widths of
// the first row's cells (px, `p` for percent, 0 for none): they set the columns.
// `paragraphs` when most cells hold paragraphs: they take the body size and paragraph spacing.

const CENTER = /text-align:\s*center/;

/** Rows of a table as cell html; empty rows and cells stay, as the source draws them. */
function cellRows(node, ctx) {
  return ctx.$(node).find('tr').toArray()
    .map((tr) => tr.children.filter((c) => ['td', 'th'].includes(c.name))
      .map((cell) => ctx.clean(cell)))
    .filter((cells) => cells.length);
}

/** Is a cell centred, by its own style or by the style of all its paragraphs? */
function centred(cell, ctx) {
  const c = ctx.$(cell);
  const ps = c.children('p').toArray();
  return CENTER.test(c.attr('style') ?? '') || c.attr('align') === 'center'
    || (ps.length > 0 && ps.every((p) => CENTER.test(p.attribs.style ?? '')));
}

/** The alignment variant of one table. */
function alignment(node, ctx) {
  const rows = ctx.$(node).find('tr').toArray().map((tr) => ctx.$(tr).children('td, th').toArray());
  const all = (cells) => cells.length > 0 && cells.every((cell) => centred(cell, ctx));
  if (!all(rows[0] ?? [])) return [];
  return all(rows.slice(1).flat()) ? ['center'] : ['center-first-row'];
}

/** The `w-…` variant of a table whose first-row cells have authored widths. */
function widths(node, ctx) {
  const cells = ctx.$(node).find('tr').first().children('td, th')
    .toArray();
  const tokens = cells.map((cell) => {
    const [, value, percent] = (cell.attribs.width ?? '').match(/^\s*([\d.]+)\s*(%?)/) ?? [];
    return value ? `${Math.round(Number(value))}${percent ? 'p' : ''}` : '0';
  });
  return tokens.some((t) => t !== '0') ? [`w-${tokens.join('-')}`] : [];
}

/** `paragraphs` when at least half of the filled cells hold <p> elements. */
function paragraphs(node, ctx) {
  const cells = ctx.$(node).find('td, th').toArray().filter((c) => ctx.$(c).text().trim());
  const withP = cells.filter((c) => ctx.$(c).children('p').length).length;
  return cells.length && withP * 2 >= cells.length ? ['paragraphs'] : [];
}

export default function table(el, ctx) {
  const box = ctx.$(el).find('.cmp-table').first();
  const tables = box.find('table').toArray();
  if (!tables.length) return box.length ? ctx.fallback() : [];
  ctx.drop(box.children().not('table'), 'empty paragraph beside the table');
  const variants = [
    'striped',
    box.attr('useauthoredwidth') && 'auto-width',
    box.hasClass('sticky') && 'sticky',
  ];
  if (box.find('[colspan], [rowspan]').length) ctx.warn('merged cells are written unmerged');
  return tables.map((t) => {
    const header = ctx.$(t).find('tr').first().children('th').length ? ['header'] : [];
    const all = [...variants, ...header, ...alignment(t, ctx), ...widths(t, ctx),
      ...paragraphs(t, ctx)];
    return ctx.block('table', all, cellRows(t, ctx));
  });
}
