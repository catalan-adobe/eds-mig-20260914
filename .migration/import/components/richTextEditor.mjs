// Authored rich text: default content with the body type scale of the source's editor.
/** center or right when every block of the text is aligned that way. */
export function alignmentOf($, body) {
  const aligns = body.children().toArray().filter((n) => $(n).text().trim())
    .map((n) => (n.attribs.style ?? '').match(/text-align:\s*(center|right)/)?.[1]);
  return aligns.length && aligns.every((a) => a && a === aligns[0]) ? aligns[0] : undefined;
}

export default function richTextEditor(el, ctx, bodySelector = '.component-rte') {
  const body = ctx.$(el).find(bodySelector).first();
  const content = ctx.content(body);
  if (!content.length) return undefined;
  const align = alignmentOf(ctx.$, body);
  const styles = [...ctx.styles(el), 'rich-text', ...(align ? [align] : [])];
  return ctx.section(content, { styles });
}
