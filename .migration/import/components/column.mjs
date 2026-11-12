// A layout row. In the order of CONTRACT.md b): one cell is transparent; like items merge into
// one block; cells of plain default content become a `columns` block; everything else is the
// section grid (span-N, offset-N, stack).
const WIDTHS = {
  '3,9': 'w-3-9', '9,3': 'w-9-3', '4,8': 'w-4-8', '8,4': 'w-8-4',
};
const SPANS = [3, 4, 6, 8, 9];
const OFFSETS = [3, 4, 6];
const LAYOUT = /^(span|offset)-\d+$|^stack$|^divider$/;
const CELL_ONLY = /^(zoom|rule|image-pad-\w+)$/;
const TITLE = /^title-/;
const isReal = (s) => s.content.length > 0 || s.styles.includes('rule');
const isHtml = (part) => typeof part === 'string';
const same = (lists) => lists.every((l) => l.join() === lists[0].join());

/** The sections of one cell: its components, then the rail it inherits from a parent page. */
function cellSections(cell, ctx) {
  const { $ } = ctx;
  const rail = $(cell).children('.iparys_inherited')[0];
  const shared = rail && $(rail).children().length ? ctx.fragment(rail, 'rail') : null;
  // a shared rail is a document of its own: its components are not this page's
  if (shared) $(rail).remove();
  return [...ctx.children(cell), ...(shared ? [ctx.section(shared)] : [])];
}

/** One merged block when every filled cell holds one block of the same kind and size. */
function likeItems(cells, filled, ctx) {
  const blocks = filled.map((c) => (c.real.length === 1 && c.real[0].content.length === 1
    ? c.real[0].content[0] : null));
  const [first] = blocks;
  const alike = blocks.every((b) => b?.merge && b.name === first.name
    && b.variants.join() === first.variants.join() && b.rows.length === first.rows.length);
  if (!alike || !same(cells.map((c) => [c.width]))) return null;
  const rows = first.rows.flatMap((_, r) => blocks.map((b) => b.rows[r]));
  const variants = [...first.variants, `cols-${cells.length}`];
  const merged = ctx.block(first.name, variants, rows, { merge: true });
  return ctx.section(merged, { styles: filled[0].real[0].styles, id: filled[0].real[0].id });
}

/**
 * A `columns` block when every filled cell is one section of default content with the same
 * styles. `forced` (a row inside a cell): cells may hold several sections, styles are lost.
 */
function columnsBlock(cells, filled, ctx, { divider, forced }) {
  const sections = filled.flatMap((c) => c.real);
  const plain = sections.every((s) => s.content.every(isHtml))
    && sections.slice(1).every((s) => !s.id)
    && (forced || filled.every((c) => c.real.length === 1));
  const width = same(cells.map((c) => [c.width])) ? '' : WIDTHS[cells.map((c) => c.width).join()];
  if (!plain || width === undefined || cells.length > 4) return null;
  const titled = sections.filter((s) => /^<h2>/.test(s.content[0] ?? ''));
  const equal = same(sections.map((s) => s.styles.filter((x) => !TITLE.test(x))))
    && same(titled.map((s) => s.styles.filter((x) => TITLE.test(x))))
    && !sections.some((s) => s.styles.some((x) => CELL_ONLY.test(x)));
  if (!equal && !forced) return null;
  if (!equal) ctx.warn('row inside a cell: its sections lose their own styles');
  const styles = equal ? [...new Set(sections.flatMap((s) => s.styles))] : [];
  const row = cells.map((c) => c.real.flatMap((s) => s.content).join(''));
  const block = ctx.block('columns', [width, divider && 'divider'], [row]);
  return ctx.section(block, { styles, id: sections[0].id });
}

/** The section grid: every section of a cell gets the cell's span. */
function grid(cells, ctx, { divider }) {
  const out = [];
  let offset = 0;
  cells.forEach((cell) => {
    if (!cell.real.length) {
      offset += cell.width;
      return;
    }
    if (!SPANS.includes(cell.width)) ctx.warn(`span-${cell.width} is not a span of the contract`);
    if (offset && !OFFSETS.includes(offset)) {
      ctx.warn(`offset-${offset} is not an offset of the contract`);
    }
    let first = true;
    cell.sections.forEach((s) => {
      if (isReal(s)) {
        const layout = [`span-${cell.width}`, first ? offset && `offset-${offset}` : 'stack'];
        s.styles = [...layout.filter(Boolean), ...s.styles.filter((x) => !LAYOUT.test(x))];
        first = false;
      }
      out.push(s);
    });
    offset = 0;
  });
  const head = out.find(isReal);
  head.rowStart = true;
  if (divider) head.styles.push('divider');
  return { sections: out, head };
}

export default function column(el, ctx) {
  const { $ } = ctx;
  const row = $(el).find('.component-column').first();
  const band = ctx.styles(el);
  const cells = row.children('div').not('.snps-col-divider').toArray().map((cell) => {
    const sections = cellSections(cell, ctx);
    const width = Number((cell.attribs.class ?? '').match(/col-sm-(\d+)/)?.[1] ?? 12);
    return { width, sections, real: sections.filter(isReal) };
  });
  const filled = cells.filter((c) => c.real.length);
  if (cells.length <= 1 || !filled.length) return ctx.band(cells.flatMap((c) => c.sections), band);
  // a grid cannot sit inside the cell of another row: sections do not nest
  const nested = $(el).parents('.component-column').toArray()
    .some((outer) => $(outer).children('div').not('.snps-col-divider').length > 1);
  const divider = row.hasClass('divider-row');
  const one = likeItems(cells, filled, ctx)
    ?? (filled.length > 1 || nested
      ? columnsBlock(cells, filled, ctx, { divider, forced: nested }) : null);
  if (one) return ctx.band([one], band);
  if (nested) {
    const shape = cells.map((c) => (c.real.length ? c.width : `(${c.width})`)).join(' | ');
    ctx.warn(`row ${shape} inside a cell holds blocks: its cells are stacked`);
    return ctx.band(cells.flatMap((c) => c.sections), band);
  }
  const { sections, head } = grid(cells, ctx, { divider });
  // the row takes its background and band spacing from its first section
  ctx.band([head], band.filter((s) => !/^(top|bottom)-/.test(s)));
  head.styles.push(...band.filter((s) => /^(top|bottom)-/.test(s)).map((s) => `band-${s}`));
  return sections;
}
