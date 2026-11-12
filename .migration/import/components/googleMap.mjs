// A Google map: block `embed map` (the 20 px around the source's map) with the source's iframe
// URL, and its size when the source sets one. A missing side is the browser's default for an
// iframe (300 x 150).
export default function googleMap(el, ctx) {
  const frame = ctx.$(el).find('iframe[src]').first();
  if (!frame.length) return [];
  const src = frame.attr('src').replace(/&/g, '&amp;');
  const rows = [[`<a href="${src}">${src}</a>`]];
  const width = frame.attr('width');
  const height = frame.attr('height');
  if (width || height) rows.push([`${width || 300} x ${height || 150}`]);
  return ctx.block('embed', ['map'], rows);
}
