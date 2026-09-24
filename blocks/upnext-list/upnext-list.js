/**
 * upnext-list — WKND article sidebar: "Share this story" title + Up Next article list
 * (cmp-layoutcontainer--sidebar, cmp-list--upnext on the source).
 *
 * Schema: stardust/eds-schema/us-en-magazine-san-diego-surf-html.json → sections[3] "sidebar"
 *   (heading "SHARE THIS STORY", 5 article ctas each with a date run).
 * Decode tier: template-slotted — the authored <h5> and <ul> are MOVED into the sidebar's
 *   slot wrappers (EW1/EW2); the list is one editable unit, its items are styled through
 *   descendant selectors (li / a / em); each item's date run moves into its link (EW6).
 *
 * Authoring (one row, one cell): <h5> sidebar title, then <ul> with one
 *   <li><a href="/path">Article title</a> <em>Weekday, D Mon YYYY</em></li> per article.
 * Variant `spacer` (block header): the source's hidden separator (36px) under the title.
 * A `download` block authored in the same section is adopted between the title and the
 *   list (the source's sidebar order: title, sharing, separator, download, up next).
 * The source's empty sharing widgets render zero pixels and are not authored (A-RO-4).
 */

const HEADING = 'h1, h2, h3, h4, h5, h6';

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) {
      out.push(...kids);
    } else if (cell.textContent.trim()) {
      // HARNESS-ONLY fallback (EW5): DA always delivers a <p> per text cell.
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

// The source's .upnext__link wraps title AND date in one anchor (EW6): the date run and the
// whitespace before it MOVE into the authored link, the title text into a presentational span —
// the <li> keeps its exact textContent, the <ul> stays the editable unit.
function linkWholeItem(li) {
  const link = li.querySelector('a');
  if (!link || link.querySelector('.title')) return;
  const title = document.createElement('span');
  title.className = 'title';
  title.append(...link.childNodes);
  link.append(title);
  let next = link.nextSibling;
  while (next) {
    const after = next.nextSibling;
    link.append(next);
    next = after;
  }
}

export default async function decorate(block) {
  if (block.querySelector(':scope > .sidebar')) return; // EW9 re-entrant
  const nodes = collectNodes(block);
  if (!nodes.length) return;

  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';
  const upnext = document.createElement('div');
  upnext.className = 'upnext';

  let seenHeading = false;
  nodes.forEach((node) => {
    if (node.matches(HEADING) && !seenHeading) {
      seenHeading = true;
      sidebar.append(wrapNode(node, 'sidebar-title'));
      return;
    }
    upnext.append(node);
  });
  upnext.querySelectorAll('li').forEach(linkWholeItem);

  const section = block.closest('.section');
  const download = section ? section.querySelector(':scope > .download-wrapper') : null;
  if (download) sidebar.append(download);
  if (upnext.childElementCount) sidebar.append(upnext);
  block.replaceChildren(sidebar);
}
