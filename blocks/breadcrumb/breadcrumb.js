/**
 * Breadcrumb — the WKND page trail (source .cmp-breadcrumb--fixed): a centred rail holding one
 * authored list whose last item is the current page.
 * Schema: stardust/eds-schema/us-en-adventures-riverside-camping-australia-html.json § breadcrumb.
 * Decode tier: template-slotted.
 *
 * Authoring: one row, one cell, one <ol> (or <ul>) — one item per trail step, every step but
 * the last a link. The list MOVES whole into the nav (EW1; a list is one editable unit, EW5).
 * Variant `program-grid`: the AEM-grid column flavour (border-box rail) of 16 program pages.
 */
function unwrapListParagraphs(list) {
  list.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
}

export default function decorate(block) {
  const nav = document.createElement('nav');
  nav.className = 'trail';
  nav.setAttribute('aria-label', 'Breadcrumb');
  const list = block.querySelector('ol, ul');
  if (list) {
    unwrapListParagraphs(list);
    const last = list.querySelector('li:last-child');
    if (last && !last.querySelector('a')) last.setAttribute('aria-current', 'page');
    nav.append(list);
  } else {
    // harness-only fallback: no authored list — keep whatever the cells hold visible
    block.querySelectorAll(':scope > div > div').forEach((cell) => nav.append(...cell.childNodes));
  }
  block.replaceChildren(nav);
}
