// Empty in the source: not migrated. Content, should it ever have some, is not lost.
export default (el, ctx) => (ctx.$(el).text().trim() || ctx.$(el).find('img').length
  ? ctx.fallback() : undefined);
