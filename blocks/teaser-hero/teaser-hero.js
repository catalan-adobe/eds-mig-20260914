/**
 * teaser-hero — the WKND "Coming Soon!" hero teaser (.cmp-teaser--hero): one
 * full-width image with a white title box overlapping its bottom edge above
 * 1165px, image stacked over the title below.
 *
 * Decode tier: template-slotted (fixed composition; schema
 * stardust/eds-schema/us-es-html.json § coming-soon-hero). Authored nodes are
 * MOVED into empty slot containers by role, never rebuilt (EW1/EW2).
 *
 * Authoring rows (simple shape, one property per row, order-agnostic):
 *   - heading (h1–h6) — the teaser title; authored as the page h1 (delivery-lint P0),
 *     sized as the live h2 (--heading-xl) so the lift holds
 *   - picture / img   — the teaser image
 *   - paragraph(s)    — the teaser description (.cmp-teaser__description, listing
 *     template), moved under the heading in .teaser-description
 *   - CTA paragraph(s) (`<p><a>`, landing template) — moved into .teaser-actions (EW3)
 * Variant `imagebottom` (landing template, .cmp-teaser--imagebottom): image anchored bottom.
 */

function isCta(node) {
  const link = node.querySelector('a[href]');
  return !!link && node.textContent.trim() === link.textContent.trim();
}

function slot(className, ...nodes) {
  const wrapper = document.createElement('div');
  wrapper.className = className;
  wrapper.append(...nodes);
  return wrapper;
}

export default function decorate(block) {
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const media = block.querySelector('picture, img');
  const texts = [...block.querySelectorAll('p')]
    .filter((p) => !p.querySelector('picture, img') && p.textContent.trim());
  const ctas = texts.filter(isCta);
  const paragraphs = texts.filter((p) => !ctas.includes(p));
  if (!heading && !media && !texts.length) return;

  const teaser = document.createElement('div');
  teaser.className = 'teaser';
  if (heading || texts.length) {
    const content = document.createElement('div');
    content.className = 'teaser-content';
    if (heading) content.append(heading);
    if (paragraphs.length) content.append(slot('teaser-description', ...paragraphs));
    if (ctas.length) content.append(slot('teaser-actions', ...ctas));
    teaser.append(content);
  }
  if (media) teaser.append(slot('teaser-image', slot('image', media)));

  block.replaceChildren(teaser);
}
