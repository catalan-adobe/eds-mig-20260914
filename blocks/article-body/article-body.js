/**
 * article-body — WKND magazine article prose stream (cmp-contentfragment on the source).
 *
 * Schema: stardust/eds-schema/us-en-magazine-san-diego-surf-html.json → sections[2] "article"
 *   (hidden h3 fragment title, body paragraphs, captioned images, h2 sub-titles, quotes).
 * Decode tier: reconstructive stream — every authored element becomes one flex row
 *   (the source wraps each element in its own grid row, so sibling margins never
 *   collapse); authored nodes are MOVED into wrappers by kind (EW1/EW2), never rebuilt.
 *
 * Authoring (one row, one cell, flat siblings in reading order):
 *   <h3> fragment title (rendered hidden, as on the source), <p> body copy,
 *   <p><img alt><em>caption</em></p> images (the caption em is optional),
 *   <h2> sub-titles, <blockquote> quotes — the paragraph right after a quote is its attribution.
 * Variants (block header): `underline` — h2 sub-titles sit in a 14px gutter column with the
 *   84px accent rule; `quote` — quotes render in the grey text--quote box.
 * Leftovers (ul, ol, table, any other element) are appended as their own row.
 */

const HEADING = 'h1, h2, h3, h4, h5, h6';

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function isMedia(el) {
  return el.matches('picture, img') || !!el.querySelector('picture, img');
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

export default async function decorate(block) {
  if (block.querySelector(':scope > .elements')) return; // EW9 re-entrant
  const nodes = collectNodes(block);
  if (!nodes.length) return;

  const elements = document.createElement('div');
  elements.className = 'elements';
  let openQuote = null;

  nodes.forEach((node) => {
    if (!elements.childElementCount && node.matches('h3')) {
      elements.append(wrapNode(node, 'body-title'));
      return;
    }
    if (node.matches('blockquote')) {
      openQuote = wrapNode(node, 'text-inner');
      elements.append(wrapNode(openQuote, 'text'));
      return;
    }
    if (openQuote && node.matches('p') && !isMedia(node)) {
      openQuote.append(node);
      openQuote = null;
      return;
    }
    openQuote = null;
    if (isMedia(node)) {
      elements.append(wrapNode(node, 'image'));
      return;
    }
    if (node.matches(HEADING)) {
      elements.append(wrapNode(node, 'section-title'));
      return;
    }
    elements.append(node);
  });

  block.replaceChildren(elements);
}
