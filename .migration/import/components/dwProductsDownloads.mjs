// DesignWare products and downloads: the block reads the source's API at run time.
// Rows: an optional title (`<h2>`, 5 instances), then one row per product: name, id.
// A component without products renders nothing in the source: it is dropped.
const escape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function products(box, ctx) {
  try {
    const list = JSON.parse(box.find('[data-componentjson]').attr('data-componentjson') || '[]');
    return Array.isArray(list) ? list : [];
  } catch (e) {
    ctx.warn(`dwProductsDownloads: unreadable data-componentjson (${e.message})`);
    return [];
  }
}

export default function dwProductsDownloads(el, ctx) {
  const box = ctx.$(el);
  const items = products(box, ctx)
    .map((item) => [String(item.component ?? '').trim(), String(item.id ?? '').trim()])
    .filter(([name, id]) => name || id);
  const title = box.find('.title').first();
  if (!items.length) {
    ctx.drop(title, 'dwProductsDownloads: no products, the source renders nothing');
    return [];
  }
  const rows = items.map(([name, id]) => [escape(name), escape(id)]);
  const heading = ctx.clean(title, { inline: true });
  if (heading) rows.unshift([`<h2>${heading}</h2>`]);
  return ctx.block('dw-products', [], rows);
}
