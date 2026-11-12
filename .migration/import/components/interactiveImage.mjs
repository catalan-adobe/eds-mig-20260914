// The image of an interactive image. Its hover tooltips are drawn by script: not migrated.
export default function interactiveImage(el, ctx) {
  const box = ctx.$(el).find('[data-cmp-src]').first();
  const widths = (box.attr('data-cmp-widths') ?? '1200').split(',').map(Number);
  const src = (box.attr('data-cmp-src') ?? '')
    .replace(/\{\.width\}|%7B\.width%7D/i, Math.max(...widths));
  if (!src) return ctx.fallback();
  ctx.warn('hover tooltips are not migrated');
  return `<p>${ctx.image(src, box.attr('data-title') ?? '')}</p>`;
}
