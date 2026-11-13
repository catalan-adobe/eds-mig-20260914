// Authored rich text: default content with the body type scale of the source's editor.
/** center or right when every block of the text is aligned that way. */
export function alignmentOf($, body) {
  const aligns = body.children().toArray().filter((n) => $(n).text().trim())
    .map((n) => (n.attribs.style ?? '').match(/text-align:\s*(center|right)/)?.[1]);
  return aligns.length && aligns.every((a) => a && a === aligns[0]) ? aligns[0] : undefined;
}

// `span.text-color-*` colours a heading in the source; DA keeps no span, so a section style does
const HEADING_COLOURS = new Set(['gray', 'black', 'green']);

/** `heading-gray` (black, green) when every heading of the text has that colour span. */
export function headingColourOf($, body) {
  const colours = body.find('h1, h2, h3, h4, h5, h6').toArray()
    .map((h) => $(h).find('[class*="text-color-"]').last().attr('class')
      ?.match(/text-color-([a-z-]+)/)?.[1]);
  const [first] = colours;
  return colours.length && HEADING_COLOURS.has(first) && colours.every((c) => c === first)
    ? [`heading-${first}`] : [];
}

export default function richTextEditor(el, ctx, bodySelector = '.component-rte') {
  const body = ctx.$(el).find(bodySelector).first();
  const content = ctx.content(body);
  if (!content.length) return undefined;
  const align = alignmentOf(ctx.$, body);
  const styles = [...ctx.styles(el), 'rich-text', ...(align ? [align] : []),
    ...headingColourOf(ctx.$, body)];
  return ctx.section(content, { styles });
}
