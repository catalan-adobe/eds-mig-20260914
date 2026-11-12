// An image above a text: block `columns media` with one cell per row. Empty ones are dropped.
export default function featuredImageTextLinks(el, ctx) {
  const box = ctx.$(el).find('.component-featuredImageTextLinks').first();
  const image = ctx.image(box.find('.image img').first());
  const text = ctx.clean(box.children('.component-text').first());
  const rows = [image, text].filter(Boolean).map((cell) => [cell]);
  return rows.length ? ctx.block('columns', ['media'], rows) : undefined;
}
