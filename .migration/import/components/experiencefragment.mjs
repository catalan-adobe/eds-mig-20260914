// Shared content. On two or more pages: a fragment document. On one page: inlined.
const NOT_MIGRATED = ['chatbot', 'ask-synopsys'];

export default function experiencefragment(el, ctx) {
  const holder = ctx.$(el).children('.cmp-experiencefragment');
  const name = (holder.attr('class') ?? '').match(/cmp-experiencefragment--(\S+)/)?.[1] ?? '';
  if (NOT_MIGRATED.includes(name)) {
    ctx.drop(el, `${name} is not migrated`);
    return [];
  }
  return ctx.fragment(el, name) ?? ctx.children();
}
