// A list of links with an optional heading.
export default function pageList(el, ctx) {
  const box = ctx.$(el).find('.component-pageList').first();
  return [...ctx.content(box.find('h5').first()), ...ctx.content(box.find('ul').first())];
}
