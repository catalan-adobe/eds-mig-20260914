// A row of equal cells that hold cards. Like items merge into one block with `cols-N`, and a
// `teasers` block also gets the height of the source's card size (`size-*`) and the
// container's title as its first row. Cells of default content become a `columns` block,
// everything else the section grid.
import { escapeHtml } from '../lib/clean.mjs';

const SIZES = {
  'extra-extra-small': 'xxs',
  'extra-small': 'xs',
  small: 'sm',
  medium: 'md',
  large: 'lg',
  'extra-extra-large': 'xxl',
};
const isHtml = (part) => typeof part === 'string';
const onlyBlock = (cell) => (cell.length === 1 && cell[0].content.length === 1
  && !isHtml(cell[0].content[0]) ? cell[0].content[0] : null);

/** One block of all cards when every filled cell holds one item block of the same kind. */
function likeItems(filled, variants) {
  const blocks = filled.map(onlyBlock);
  const [first] = blocks;
  const alike = blocks.every((b) => b?.merge && b.name === first.name
    && b.variants.join() === first.variants.join() && b.rows.length === first.rows.length);
  if (!alike) return null;
  first.rows = first.rows.flatMap((_, r) => blocks.map((b) => b.rows[r]));
  first.variants = [...new Set([...first.variants, ...variants])];
  return filled[0][0];
}

/** The cells as the section grid: every section of a cell gets the cell's span. */
function grid(cells, span) {
  let offset = 0;
  const sections = cells.flatMap((cell) => {
    if (!cell.length) offset += span;
    cell.forEach((s, i) => {
      const place = i ? ['stack'] : [`span-${span}`, offset && `offset-${offset}`];
      s.styles = [...place.filter(Boolean), ...s.styles];
      if (!i) offset = 0;
    });
    return cell;
  });
  sections[0].rowStart = true;
  return sections;
}

function layout(cells, variants, el, ctx) {
  const filled = cells.filter((cell) => cell.length);
  if (cells.length === 1) return ctx.merge(cells[0], ...variants);
  const merged = likeItems(filled, variants);
  if (merged) return [merged];
  const sections = filled.flat();
  if (sections.every((s) => s.content.every(isHtml) && !s.id)) {
    if (sections.some((s) => s.styles.length)) ctx.warn('cells lose their own section styles');
    const row = cells.map((cell) => cell.flatMap((s) => s.content).join(''));
    return [ctx.section(ctx.block('columns', [], [row]))];
  }
  const nested = ctx.$(el).parents('.component-column, .carousel-slide').toArray()
    .some((outer) => ctx.$(outer).children('div').not('.snps-col-divider').length > 1);
  if (nested || 12 % cells.length) {
    ctx.warn(`${cells.length} cells with blocks inside a cell: they are stacked`);
    return sections;
  }
  return grid(cells, 12 / cells.length);
}

export default function cardContainer(el, ctx) {
  const { $ } = ctx;
  const box = $(el).find('.component-card-container').first();
  const cells = box.children('.row').children('.card-col').toArray()
    .map((cell) => ctx.children(cell).filter((s) => s.content.length));
  if (!cells.some((cell) => cell.length)) return [];
  const classes = (box.attr('class') ?? '').split(/\s+/);
  const size = SIZES[classes.find((c) => c.startsWith('card-size-'))?.slice(10)];
  const sections = layout(cells, [`cols-${cells.length}`], el, ctx);
  const teasers = sections.flatMap((s) => s.content).filter((b) => b.name === 'teasers');
  teasers.forEach((b) => {
    if (size) b.variants = [...new Set([...b.variants, `size-${size}`])];
    // a container stays one block: joined with the next one, the spacing between the two and
    // the padding of its empty cells would be lost
    b.merge = false;
  });
  const words = box.find('.container-title').first().text().replace(/\s+/g, ' ')
    .trim();
  const title = words && `<h2>${escapeHtml(words)}</h2>`;
  if (title && teasers.length && sections.length === 1) teasers[0].rows.unshift([title]);
  else if (title) sections.unshift(ctx.section(title, { styles: ['center', 'title-large'] }));
  return ctx.band(sections, ctx.styles(el));
}
