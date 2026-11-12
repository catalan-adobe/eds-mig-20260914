// A rule with an optional label and link: the label is a paragraph, the rule a section style.
export default function separator(el, ctx) {
  const box = ctx.$(el).find('.cmp-separator').first();
  const parts = [box.children('.leftText'), ...box.children('a').toArray()]
    .map((node) => ctx.clean(node, { inline: true })).filter(Boolean)
    .map((html) => `<p>${html}</p>`);
  return ctx.section(parts, { styles: [...ctx.styles(el), 'rule'] });
}
