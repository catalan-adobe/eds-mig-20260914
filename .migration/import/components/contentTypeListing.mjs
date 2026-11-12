// A list that a servlet of the source fills in the browser: only its heading is migrated.
export default function contentTypeListing(el, ctx) {
  const box = ctx.$(el).find('.component-contentType').first();
  ctx.drop(box.find('.contentContainer, .no-results, .templates'), 'list drawn from a servlet');
  return ctx.clean(box.find('.title').first());
}
