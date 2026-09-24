/**
 * Content fragment — the WKND magazine article shell (source .cmp-contentfragment inside the
 * .cmp-layoutcontainer two-column page: article default--8 | sidebar default--3 offset--1).
 * Schema: stardust/eds-schema/us-en-magazine-western-australia-html.json § content-fragment
 * (+ the article-head / article-body default-content sections it hosts).
 * Decode tier: template-slotted, at section level — the block becomes the two-column layout
 * and the section's other wrappers are MOVED whole into its fixed columns (EW1/EW8); the
 * article body itself stays default content.
 *
 * Authoring: one row, one cell, the fragment title (an <h3>) — present in the source DOM,
 * never rendered (display: none, kept for parity). The block sits between the article head
 * (h1 + author h4) and the body prose. Everything from the first sidebar block onwards
 * (sharing / download / list-upnext, plus a heading-only default-content wrapper right before
 * it — "Share this story") becomes the aside; everything else, in authored order with the
 * hidden title in place, the article column. Without a section (round-trip harness) only the
 * title is decorated.
 */
const SIDEBAR_BLOCKS = '.sharing-wrapper, .download-wrapper, .list-upnext-wrapper';

function isHeadingOnlyWrapper(el) {
  return el?.classList.contains('default-content-wrapper')
    && el.children.length > 0
    && [...el.children].every((c) => /^H[2-6]$/.test(c.tagName));
}

function composeColumns(block, title) {
  const section = block.closest('.section');
  const host = block.parentElement;
  if (!section || host.parentElement !== section) return false;
  const children = [...section.children];
  const wrappers = children.filter((c) => c !== host && !c.classList.contains('section-metadata'));
  const hostIndex = children.indexOf(host);
  const firstSidebar = wrappers.find((w) => w.matches(SIDEBAR_BLOCKS));
  let split = firstSidebar ? wrappers.indexOf(firstSidebar) : wrappers.length;
  if (firstSidebar && isHeadingOnlyWrapper(wrappers[split - 1])) split -= 1;
  const columnWrappers = wrappers.slice(0, split);
  const before = columnWrappers.filter((w) => children.indexOf(w) < hostIndex);
  const after = columnWrappers.filter((w) => children.indexOf(w) > hostIndex);

  const layout = document.createElement('div');
  layout.className = 'article-layout';
  const column = document.createElement('article');
  column.className = 'article-column';
  column.append(...before, title, ...after);
  layout.append(column);
  if (firstSidebar) {
    const aside = document.createElement('aside');
    aside.className = 'article-sidebar';
    aside.append(...wrappers.slice(split));
    layout.append(aside);
  }
  block.replaceChildren(layout);
  return true;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .article-layout, :scope > .cf-title')) return;
  const title = document.createElement('div');
  title.className = 'cf-title';
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    title.append(...cell.childNodes);
  });
  if (!composeColumns(block, title)) block.replaceChildren(title);
}
