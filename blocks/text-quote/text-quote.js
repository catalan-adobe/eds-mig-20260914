/**
 * Text quote — the WKND pull quote (source .cmp-text--quote: a grey band holding a
 * blockquote with a yellow underline and an attribution paragraph).
 * Schema: stardust/eds-schema/us-en-magazine-western-australia-html.json (section 1,
 * body items 6–8). Decode tier: template-slotted (D11 "quote" pattern).
 *
 * Authoring: one row, one cell — the <blockquote>, then any attribution paragraphs
 * (the source keeps <u> for the body-face run). Every authored node MOVES into the
 * .text slot (EW1); the wrappers carry the layout classes (EW2).
 */
export default function decorate(block) {
  if (block.querySelector(':scope > .text')) return;
  const text = document.createElement('div');
  text.className = 'text';
  block.querySelectorAll(':scope > div > div').forEach((cell) => text.append(...cell.childNodes));
  block.replaceChildren(text);
}
