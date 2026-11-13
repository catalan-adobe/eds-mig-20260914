// Social profile links: one paragraph of icon links.
export default function socialLinks(el, ctx) {
  const list = ctx.$(el).find('.social-icons').first();
  const links = list.find('a').toArray().map((a) => ctx.clean(a, { inline: true })).filter(Boolean);
  const align = (list.attr('class') ?? '').match(/align-(center|right)/)?.[1];
  return ctx.section(links.length ? `<p>${links.join(' ')}</p>` : [], {
    styles: [...ctx.styles(el), ...(align ? [align] : [])],
  });
}
