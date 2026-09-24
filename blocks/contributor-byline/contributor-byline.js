/**
 * contributor-byline — WKND article contributor (cmp-separator + cmp-byline + social buttons).
 *
 * Schema: stardust/eds-schema/us-en-magazine-san-diego-surf-html.json → sections[2] "article",
 *   tail: heading "Justin Barr", eyebrow occupations, 3 icon CTAs.
 * Decode tier: template-slotted — fixed composition; authored nodes are MOVED into empty
 *   slot wrappers by role (EW1/EW2), never rebuilt. The separator above is CSS (never <hr>).
 *
 * Authoring (one row, two cells):
 *   cell 1: <p><img alt></p> portrait, <h2> name, <p> occupations;
 *   cell 2: <ul> of social links, each <li><a href><span class="icon icon-<name>"></span>Label</a>.
 * Every other authored element falls through to the byline column in order.
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
  if (block.querySelector(':scope > .grid')) return; // EW9 re-entrant
  const nodes = collectNodes(block);
  if (!nodes.length) return;

  const separator = document.createElement('div');
  separator.className = 'separator';
  const grid = document.createElement('div');
  grid.className = 'grid';
  const bylineColumn = document.createElement('div');
  bylineColumn.className = 'byline-column';
  const byline = document.createElement('div');
  byline.className = 'byline';
  bylineColumn.append(byline);
  const buttonsColumn = document.createElement('div');
  buttonsColumn.className = 'buttons-column';
  const btnList = document.createElement('div');
  btnList.className = 'btn-list';
  buttonsColumn.append(btnList);

  let seenHeading = false;
  nodes.forEach((node) => {
    if (node.matches('ul, ol')) {
      btnList.append(node);
      return;
    }
    if (isMedia(node)) {
      byline.append(wrapNode(node, 'byline-image'));
      return;
    }
    if (node.matches(HEADING) && !seenHeading) {
      seenHeading = true;
      byline.append(wrapNode(node, 'name'));
      return;
    }
    if (node.matches('p') && seenHeading && !node.querySelector('a')) {
      byline.append(wrapNode(node, 'occupations'));
      return;
    }
    if (node.querySelector('a')) {
      btnList.append(node);
      return;
    }
    byline.append(node);
  });

  grid.append(bylineColumn);
  if (btnList.childElementCount) grid.append(buttonsColumn);
  block.replaceChildren(separator, grid);
}
