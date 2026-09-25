/**
 * ticker — full-bleed marquee strip of activity words separated by amber dots.
 * Schema: stardust/eds-schema/index.json sections[3] (reconstructive: one <ul>, one word per <li>).
 *
 * Authoring: one row, one cell, a <ul> of words. The source loops the list twice for a seamless
 * 50% translate animation; the second copy is a presentational clone (EW4, stripped of indices,
 * aria-hidden).
 */
function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  el.removeAttribute('data-prose-index');
  return el;
}

export default function decorate(block) {
  const list = block.querySelector('ul, ol');
  if (!list) return;
  const track = document.createElement('div');
  track.className = 'ticker-track';
  const clone = stripInstrumentation(list.cloneNode(true));
  clone.setAttribute('aria-hidden', 'true');
  track.append(list, clone);
  block.replaceChildren(track);
}
