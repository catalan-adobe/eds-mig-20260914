/**
 * hero — full-bleed image hero with scrim, eyebrow pill, h1, lead and CTAs.
 * Schema: stardust/eds-schema/index.json sections[0] (template-slotted, #95).
 *
 * Authoring rows:
 *   1. <img> background image (editorial)
 *   2. <p><strong>eyebrow</strong></p>, <h1>, <p>lead</p>, CTA paragraphs
 *      (<em><strong><a>> accent, <em><a>> ghost)
 * Variant: `full` (min-height 65vh instead of 55vh).
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  const media = block.querySelector('picture, img');
  const heading = block.querySelector('h1, h2, h3');
  const paragraphs = [...block.querySelectorAll('p')].filter((p) => !p.contains(media));
  const ctas = paragraphs.filter((p) => p.querySelector('a'));
  const texts = paragraphs.filter((p) => !p.querySelector('a'));
  const eyebrow = texts.find((p) => p.querySelector('strong:only-child'));
  const lead = texts.find((p) => p !== eyebrow);

  const bg = document.createElement('div');
  bg.className = 'hero-bg';
  if (media) {
    const img = media.matches('img') ? media : media.querySelector('img');
    if (img) {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
    }
    bg.append(media);
  }
  const overlay = document.createElement('div');
  overlay.className = 'hero-overlay';
  bg.append(overlay);

  const inner = document.createElement('div');
  inner.className = 'hero-content-inner';
  if (eyebrow) inner.append(wrapNode(eyebrow, 'eyebrow'));
  if (heading) inner.append(wrapNode(heading, 'headline'));
  if (lead) inner.append(wrapNode(lead, 'lead'));
  if (ctas.length) {
    const group = document.createElement('div');
    group.className = 'button-group';
    group.append(...ctas);
    inner.append(group);
  }
  const content = document.createElement('div');
  content.className = 'hero-content';
  content.append(inner);

  block.replaceChildren(bg, content);
}
