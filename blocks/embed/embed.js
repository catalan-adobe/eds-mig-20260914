/**
 * An iframe of another site (Google Maps, YouTube, Podbean, Spotify), loaded lazily.
 * Row 1: the link to embed. Row 2, optional: `width x height`, in pixels or per cent
 * (`350 x 350`, `100% x 352`). Without it the iframe has the browser's size, as the source.
 * Variant `map`: the padding of the source's Google map component (CSS only).
 * @param {Element} block
 */
export default function decorate(block) {
  const link = block.querySelector('a[href^="http"]');
  if (!link) {
    block.replaceChildren();
    return;
  }
  const url = new URL(link.href);
  const video = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
  if (/(^|\.)youtu(be\.com|\.be)$/.test(url.hostname) && video) {
    url.href = `https://www.youtube.com/embed/${video}`;
  }
  const frame = document.createElement('iframe');
  frame.loading = 'lazy';
  frame.title = link.textContent.trim() === link.href ? url.hostname : link.textContent.trim();
  frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
  const size = block.children[1]?.textContent.match(/([\d.]+%?)\s*[x×]\s*([\d.]+%?)/i);
  if (size) [, frame.width, frame.height] = size;
  frame.src = url.href;
  block.replaceChildren(frame);
}
