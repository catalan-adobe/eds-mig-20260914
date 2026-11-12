// A right rail card: purple flag (a link or a plain label), then a list of links.
// The source's `span.label-new` ("NEW ") becomes <strong>NEW</strong> before the link text.
// Rows: flag, then the links (absent on 37 flag-only cards). An empty card is dropped.
// Variant `video`: the card holds the source's empty `.video-wrapper` (17), which widens the
// gap below the flag from 730 px.
export default function rightRailItem(el, ctx) {
  const { $ } = ctx;
  const card = $(el).find('.component-railCard').first();
  card.find('.label-new').each((_, label) => {
    $(label).replaceWith(`<strong>${$(label).text().trim()}</strong> `);
  });
  const flag = ctx.clean(card.find('.flag .text').first(), { inline: true });
  const items = card.find('.component-text p').toArray()
    .map((p) => ctx.clean($(p), { inline: true }))
    .filter(Boolean);
  const rows = [];
  if (flag) rows.push([flag]);
  if (items.length) rows.push([`<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`]);
  if (!rows.length) return [];
  const variants = card.children('.video-wrapper').length ? ['video'] : [];
  return ctx.block('rail-card', variants, rows);
}
