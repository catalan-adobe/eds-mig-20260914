// A row of mosaic cards: one `mosaic` block, one row per card. The widths of the cells give the
// variant: `cols-3` (4 | 4 | 4), `w-8-4`, `w-4-8`. A row of other components (cards, html)
// merges like items with `cols-N`, else it is the section grid.
import { escapeHtml } from '../lib/clean.mjs';

const width = (cell) => Number(cell.attribs.class.match(/col-sm-(\d+)/)?.[1] ?? 12);
const onlyBlock = (cell) => (cell.length === 1 && cell[0].content.length === 1
  && typeof cell[0].content[0] !== 'string' ? cell[0].content[0] : null);

/** The variant of the cell widths. */
function layout(widths) {
  if (widths.every((w) => w === widths[0])) return `cols-${Math.round(12 / widths[0])}`;
  return `w-${widths.join('-')}`;
}

/** One block of every card when each filled cell holds one item block of one name. */
function merged(cells, variant, ctx) {
  const filled = cells.filter((cell) => cell.length);
  const blocks = filled.map(onlyBlock);
  if (!blocks.every((b) => b?.merge && b.name === blocks[0].name)) return null;
  const variants = [...new Set(blocks.flatMap((b) => b.variants)), variant];
  const rows = blocks.flatMap((b) => b.rows);
  return ctx.section(ctx.block(blocks[0].name, variants, rows));
}

/** The cells as the section grid. */
function grid(cells, widths) {
  let offset = 0;
  return cells.flatMap((cell, i) => {
    if (!cell.length) offset += widths[i];
    cell.forEach((s, n) => {
      const place = n ? ['stack'] : [`span-${widths[i]}`, offset && `offset-${offset}`];
      s.styles = [...place.filter(Boolean), ...s.styles];
      if (!n) offset = 0;
    });
    return cell;
  });
}

export default function mosaicCardContainer(el, ctx) {
  const { $ } = ctx;
  const box = $(el).find('section[class*="component-mosaicContainer"]').first();
  const columns = box.children('.row').children('.card-col').toArray();
  const cells = columns.map((cell) => ctx.children(cell).filter((s) => s.content.length));
  if (!cells.some((cell) => cell.length)) return [];
  const widths = columns.map(width);
  const sections = [merged(cells, layout(widths), ctx) ?? grid(cells, widths)].flat();
  const words = box.find('.container-title').first().text().replace(/\s+/g, ' ')
    .trim();
  if (words) {
    sections.unshift(ctx.section(`<h2>${escapeHtml(words)}</h2>`, {
      styles: ['center', 'title-large'],
    }));
  }
  return ctx.band(sections, ctx.styles(el));
}
