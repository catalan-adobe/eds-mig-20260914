/**
 * Download — the WKND sidebar PDF card (source .cmp-download / .download--pdf: a linked
 * title, a description line, the file properties — filename, size, format — and a
 * download button).
 * Sibling variant of the article template (guide-la-skateparks); measured by
 * sibling-variance.mjs, lifted in stardust/prototypes/us-en-magazine-western-australia-html.css
 * § download--pdf. Decode tier: template-slotted.
 *
 * Authoring rows (simple shape, one property per row, classified by content, any order):
 *   <h3><a href="…pdf">Download PDF</a></h3>   — title (the link is the file)
 *   <p>Get the Full Story</p>                  — description
 *   <ul><li><strong>Filename</strong> file.pdf</li><li><strong>Size</strong> 139 KB</li>…</ul>
 *     — properties: the bold run is the property label (the source's hidden <dt>), the
 *       rest of the item its value
 *   <p><a href="…pdf">Download PDF</a></p>     — action button (the CTA moves as its <p>, EW3)
 * Every authored node MOVES into a layout wrapper (EW1/EW2); anything else stays as text.
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function roleOf(el) {
  if (/^H[1-6]$/.test(el.tagName)) return 'download-title';
  if (el.tagName === 'UL' || el.tagName === 'OL') return 'download-properties';
  const link = el.tagName === 'P' ? el.querySelector('a') : null;
  if (link && el.textContent.trim() === link.textContent.trim()) return 'download-action';
  if (el.tagName === 'P') return 'download-description';
  return 'download-text';
}

export default function decorate(block) {
  if (block.querySelector(':scope > .download-inner')) return;
  const inner = document.createElement('div');
  inner.className = 'download-inner';
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    [...cell.children].forEach((el) => inner.append(wrapNode(el, roleOf(el))));
  });
  block.replaceChildren(inner);
}
