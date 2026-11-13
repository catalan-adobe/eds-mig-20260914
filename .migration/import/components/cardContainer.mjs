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
const onlyBlock = (s) => (s.content.length === 1 && !isHtml(s.content[0]) ? s.content[0] : null);
const same = (lists) => lists.every((l) => l.join() === lists[0].join());
const SPACING = /^(top|bottom)-/;

/**
 * One block of all cards when every filled cell holds the same number of like item blocks.
 * Rows are in cell order; `stack-N` keeps N cards in one cell, as the source stacks them.
 */
function likeItems(filled, variants, nested) {
  const depth = filled[0].length;
  const sections = filled.flat();
  const blocks = sections.map(onlyBlock);
  const [first] = blocks;
  const alike = filled.every((cell) => cell.length === depth)
    && blocks.every((b) => b?.merge && b.name === first.name
      && b.variants.join() === first.variants.join() && b.rows.length === first.rows.length)
    && (depth === 1 || (first.rows.length === 1 && sections.every((s) => !s.styles.length)));
  // below 730 the source shows cell after cell: cards of several rows keep their cells
  if (!alike || (first.name === 'cards' && first.rows.length > 1 && !nested)) return null;
  first.rows = depth > 1 ? blocks.flatMap((b) => b.rows)
    : first.rows.flatMap((_, r) => blocks.map((b) => b.rows[r]));
  const stack = depth > 1 ? [`stack-${depth}`] : [];
  first.variants = [...new Set([...first.variants, ...variants, ...stack])];
  return filled[0][0];
}

/** The cells as the section grid: every section of a cell gets the cell's span. */
function grid(cells, span) {
  let offset = 0;
  const sections = cells.flatMap((cell) => {
    if (!cell.length) offset += span;
    cell.forEach((s, i) => {
      const place = [`span-${span}`, i ? 'stack' : offset && `offset-${offset}`];
      s.styles = [...place.filter(Boolean), ...s.styles];
      if (!i) offset = 0;
    });
    return cell;
  });
  sections[0].rowStart = true;
  return sections;
}

/**
 * The section styles of a `columns` block of these cells: the top of the first sections and
 * the bottom of the last ones when equal, and the other styles that every text section has.
 */
function sharedStyles(filled) {
  const edge = (pick, re) => {
    const lists = filled.map((cell) => pick(cell).styles.filter((x) => re.test(x)));
    return same(lists) ? lists[0] : [];
  };
  const sections = filled.flat();
  const texts = sections.filter((s) => !s.content.join('').includes('<img'));
  const others = (texts.length ? texts : sections)
    .map((s) => s.styles.filter((x) => !SPACING.test(x)));
  const common = others[0].filter((x) => others.every((l) => l.includes(x)));
  return [...edge((c) => c[0], /^top-/), ...common, ...edge((c) => c.at(-1), /^bottom-/)];
}

function layout(cells, variants, el, ctx) {
  const filled = cells.filter((cell) => cell.length);
  if (cells.length === 1) return ctx.merge(cells[0], ...variants);
  const nested = ctx.$(el).parents('.component-column, .carousel-slide').toArray()
    .some((outer) => ctx.$(outer).children('div').not('.snps-col-divider').length > 1);
  const merged = likeItems(filled, variants, nested || 12 % cells.length > 0);
  if (merged) return [merged];
  const sections = filled.flat();
  const plain = sections.every((s) => s.content.every(isHtml) && !s.id);
  const single = filled.every((cell) => cell.length === 1)
    && same(sections.map((s) => s.styles));
  const gridded = !nested && !(12 % cells.length);
  if (plain && (single || !gridded)) {
    const styles = sharedStyles(filled);
    if (sections.some((s) => s.styles.some((x) => !styles.includes(x)))) {
      ctx.warn('a row inside a cell: its cells lose their own section styles');
    }
    const row = cells.map((cell) => cell.flatMap((s) => s.content).join(''));
    return [ctx.section(ctx.block('columns', [], [row]), { styles })];
  }
  if (!gridded) {
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
  const band = ctx.styles(el);
  const head = sections.find((s) => s.rowStart);
  if (!head) return ctx.band(sections, band);
  // the section grid takes its band spacing from the first section of its row
  ctx.band(sections, band.filter((s) => !/^bottom-/.test(s)));
  head.styles.push(...band.filter((s) => /^bottom-/.test(s)).map((s) => `band-${s}`));
  return sections;
}
