// Download links: an optional heading, then a list whose links start with the download icon.
export default function downloads(el, ctx) {
  const box = ctx.$(el).find('.component-downloads').first();
  const items = box.find('a').toArray()
    .map((a) => ctx.clean(a, { inline: true }).replace(/^(<a [^>]*>)/, '$1:download: '))
    .filter(Boolean);
  const list = items.length ? `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : '';
  return [...ctx.content(box.children(':header')), list];
}
