// A group of box links in two or three columns, with an optional title: one `box-links` block.
// The source fills column by column; the block's rows are in reading order, row by row, so a
// column that is shorter than the one after it leaves an empty row.
const isBlock = (part) => typeof part === 'object';

export default function boxLinkContainer(el, ctx) {
  const { $ } = ctx;
  const box = $(el).find('.component-boxLinkContainer').first();
  const sections = box.find('.boxLinkItem').toArray().map((cell) => ctx.children(cell));
  const parts = sections.flat().flatMap((s) => s.content);
  if (!parts.every((p) => isBlock(p) && p.name === 'box-links')) {
    ctx.warn('holds other content than box links: default content');
    return ctx.fallback();
  }
  const columns = sections.map((list) => list.flatMap((s) => s.content.flatMap((b) => b.rows)));
  const depth = Math.max(0, ...columns.map((c) => c.length));
  const rows = Array.from({ length: depth }, (_, r) => columns.map((c) => c[r] ?? ['']))
    .flat();
  while (rows.length && !rows.at(-1)[0]) rows.pop();
  const title = ctx.clean(box.find('h1, h2, h3, h4, h5, h6').first(), { inline: true });
  if (!rows.length && !title) return [];
  const variants = [`cols-${columns.length}`, !title && 'no-title'];
  return ctx.block('box-links', variants, [...(title ? [[`<h2>${title}</h2>`]] : []), ...rows]);
}
