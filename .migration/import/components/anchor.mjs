// Gives its id to the next section: an empty section passes its id on (CONTRACT a, rule 3).
export default function anchor(el, ctx) {
  const id = ctx.$(el).children('.component-anchor').attr('id');
  const inside = ctx.children();
  return [ctx.section([], { id }), ...inside];
}
