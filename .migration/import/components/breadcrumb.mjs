// The page's breadcrumb trail: links, then the current page as text.
export default function breadcrumb(el, ctx) {
  const { $ } = ctx;
  const items = $(el).find('.component-breadcrumb li').toArray()
    .map((li) => $(li).children('a, span:not(.component-breadcrumb__sep)').first())
    .map((item) => ctx.clean(item, { inline: true }))
    .filter(Boolean)
    .map((html) => `<li>${html}</li>`);
  return items.length ? ctx.block('breadcrumb', [], [[`<ul>${items.join('')}</ul>`]]) : undefined;
}
