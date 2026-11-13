// One key benefit: icon, title (a link when the item is linked) and an optional description.
// A link that opens in a new tab ends with `#_blank`.
// A row of the block `key-benefits`; the items of one `column` row merge (CONTRACT a, rule 4).
export default function keyBenefits(el, ctx) {
  const box = ctx.$(el).find('.cmp-key-benefits').first();
  const title = ctx.clean(box.find('.cmp-key-benefits__title'), { inline: true });
  const anchor = box.find('.cmp-key-benefits__link');
  const link = ctx.link(anchor.attr('href'));
  const href = link && anchor.attr('target') === '_blank' ? `${link}#_blank` : link;
  const text = [
    title && `<p>${href ? `<a href="${href}">${title}</a>` : title}</p>`,
    ctx.clean(box.find('.cmp-key-benefits__description')),
  ];
  const row = [ctx.image(box.find('img').first()), text.filter(Boolean)];
  if (!row.flat().some(Boolean)) return [];
  return ctx.block('key-benefits', [], [row], { merge: true });
}
