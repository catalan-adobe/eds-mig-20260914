// A customer quote: one row of the block `quote`. Cells: text, attribution (name, then role),
// logo or portrait, and a link when the whole quote is one. The slides of a carousel merge
// into one `quote carousel` (CONTRACT a, rule 4); quotes that follow each other on a page
// stay apart, each with its own spacing. The source has two carousels of quotes: `carousel`
// gives every quote one height and fades, `contentCarousel` keeps each quote's height and
// slides: the variant `fit`.
export default function quote(el, ctx) {
  const { $ } = ctx;
  const box = $(el).find('.component-quote').first();
  const text = box.find('.quote-text').first();
  const lines = box.find('.quote-attribution').toArray()
    .map((p) => ctx.clean(p, { inline: true }))
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`);
  const media = box.find('.quote-img').first();
  const href = ctx.link(box.closest('a.quote-link').attr('href'));
  const row = [ctx.clean(text, { inline: true }), lines, ctx.image(media.find('img').first())];
  if (!row.flat().some(Boolean)) return [];
  if (href) row.push(`<a href="${href}">${href}</a>`);
  ctx.drop(box.find('.separator'), 'the line between name and role is drawn by the block');
  const variants = [
    /quote-(japanese|chinese)/.test(text.attr('class') ?? '') && 'cjk',
    media.hasClass('headshot-img') && 'headshot',
    $(el).closest('.component-content-carousel').length > 0 && 'fit',
  ];
  const merge = $(el).closest('.carousel-holder').length > 0;
  return ctx.block('quote', variants, [row], { merge });
}
