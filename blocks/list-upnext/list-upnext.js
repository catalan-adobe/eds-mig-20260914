/**
 * List up next — the WKND sidebar "up next" article list (source .cmp-list--upnext: one
 * card-as-link per article, title + publication date).
 * Schema: stardust/eds-schema/us-en-magazine-western-australia-html.json (section 1,
 * items 22–25: one CTA per card). Decode tier: reconstructive (repeat group).
 *
 * Authoring rows — one row per article (container shape), one cell:
 *   <p><a href="/us/en/magazine/…">Article title</a></p>
 *   <p>Wednesday, 30 Sep 2020</p>
 * The card becomes the link (EW6): its href is read from the authored anchor, which is then
 * unwrapped so the title stays one editable paragraph; the paragraphs MOVE into the title /
 * date wrappers (EW1/EW2) — the paragraph holding the link is the title, any other the date.
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function buildItem(row) {
  const item = document.createElement('li');
  item.className = 'upnext-item';
  const link = document.createElement('a');
  link.className = 'upnext-link';
  item.append(link);

  const paragraphs = [...row.querySelectorAll('p')];
  const titleParagraph = paragraphs.find((p) => p.querySelector('a')) || paragraphs[0];
  const anchor = titleParagraph?.querySelector('a');
  if (anchor) {
    link.href = anchor.getAttribute('href');
    if (anchor.title) link.title = anchor.title;
    anchor.replaceWith(...anchor.childNodes);
  }
  if (titleParagraph) link.append(' ', wrapNode(titleParagraph, 'upnext-title'), ' ');
  paragraphs.filter((p) => p !== titleParagraph).forEach((p) => {
    link.append(wrapNode(p, 'upnext-date'), ' ');
  });
  [...row.querySelectorAll(':scope > div')].forEach((cell) => {
    [...cell.children].forEach((leftover) => link.append(wrapNode(leftover, 'upnext-text')));
  });
  return item;
}

export default function decorate(block) {
  if (block.querySelector(':scope > ul')) return;
  const list = document.createElement('ul');
  list.className = 'upnext-list';
  [...block.children].forEach((row) => list.append(buildItem(row)));
  block.replaceChildren(list);
}
