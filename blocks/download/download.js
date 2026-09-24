/**
 * download — WKND article sidebar PDF download (cmp-download on the source).
 *
 * Schema: sibling us-en-magazine-guide-la-skateparks-html (module `download` in the
 *   article sidebar): title link, description, three file properties, action link.
 * Decode tier: template-slotted — fixed composition; authored nodes are MOVED into empty
 *   slot wrappers by role (EW1/EW2/EW3), never rebuilt. The PDF is served root-relative
 *   from the code origin (/media/wknd/<file>.pdf), never content.da.live.
 *
 * Authoring (one cell per row, in order):
 *   <h3><a href="/media/wknd/file.pdf">Download PDF</a></h3> — title link
 *   <p>Get the Full Story</p> — description (the first link-free paragraph)
 *   <p><strong>Filename</strong></p> <p>file.pdf</p>, <p><strong>Size</strong></p> <p>139 KB</p>,
 *     <p><strong>Format</strong></p> <p>application/pdf</p> — property label + value pairs
 *     (the source renders the labels display:none; a value without a label is allowed)
 *   <p><em><a href="/media/wknd/file.pdf">Download PDF</a></em></p> — the action button
 * The upnext-list block adopts this block's wrapper into the sidebar when both share a section.
 */

const HEADING = 'h1, h2, h3, h4, h5, h6';

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

// a property label is a paragraph holding only one <strong> (the source's hidden <dt>)
function isLabel(p) {
  return p.children.length === 1 && p.firstElementChild.matches('strong')
    && p.firstElementChild.textContent.trim() === p.textContent.trim();
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
  if (block.querySelector(':scope > .download-inner')) return; // EW9 re-entrant
  const nodes = collectNodes(block);
  if (!nodes.length) return;

  const inner = document.createElement('div');
  inner.className = 'download-inner';
  let description = null;
  let properties = null;
  let openProperty = null;
  const actions = [];

  nodes.forEach((node) => {
    if (node.matches(HEADING)) {
      inner.append(wrapNode(node, 'title'));
      return;
    }
    if (node.querySelector('a')) {
      actions.push(wrapNode(node, 'action'));
      return;
    }
    if (!description && node.matches('p')) {
      description = wrapNode(node, 'description');
      inner.append(description);
      return;
    }
    if (node.matches('p')) {
      if (!properties) {
        properties = document.createElement('div');
        properties.className = 'properties';
        inner.append(properties);
      }
      const label = isLabel(node);
      if (label || !openProperty) {
        openProperty = document.createElement('div');
        openProperty.className = 'property';
        properties.append(openProperty);
      }
      openProperty.append(wrapNode(node, label ? 'property-label' : 'property-value'));
      if (!label) openProperty = null;
      return;
    }
    inner.append(node);
  });

  inner.append(...actions);
  block.replaceChildren(inner);
}
