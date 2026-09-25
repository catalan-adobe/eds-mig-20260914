/**
 * featured — one featured article: image left, eyebrow / h2 / lead / CTA right.
 * Schema: stardust/eds-schema/index.json sections[1] (template-slotted, #95).
 *
 * Authoring rows:
 *   1. <img> (editorial)
 *   2. <p><strong>eyebrow</strong></p>, <h2>, <p>lead</p>, <p><strong><a>CTA</a></strong></p>
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  const media = block.querySelector('picture, img');
  const heading = block.querySelector('h2, h3, h1');
  const paragraphs = [...block.querySelectorAll('p')].filter((p) => !p.contains(media));
  const ctas = paragraphs.filter((p) => p.querySelector('a'));
  const texts = paragraphs.filter((p) => !p.querySelector('a'));
  const eyebrow = texts.find((p) => p.querySelector('strong:only-child'));
  const lead = texts.find((p) => p !== eyebrow);

  const image = document.createElement('div');
  image.className = 'featured-image';
  if (media) image.append(media);

  const body = document.createElement('div');
  body.className = 'featured-body';
  if (eyebrow) body.append(wrapNode(eyebrow, 'eyebrow'));
  if (heading) body.append(wrapNode(heading, 'headline'));
  if (lead) body.append(wrapNode(lead, 'lead'));
  if (ctas.length) {
    const foot = document.createElement('div');
    foot.className = 'featured-footer';
    foot.append(...ctas);
    body.append(foot);
  }

  block.replaceChildren(image, body);
}
