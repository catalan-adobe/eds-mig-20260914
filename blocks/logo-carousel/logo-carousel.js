/**
 * Logo carousel: a continuous, seamless marquee of partner logos.
 * Authored content: one row per logo, each row a single cell with a link wrapping an image.
 * The CSS animation (`.logo-carousel-track`) relies on the item count being fixed at build
 * time (flex-basis is 100 / (2 * count) %), so it is written as a custom property here.
 */
export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const li = document.createElement('li');
    li.className = 'logo-carousel-item';
    const cell = row.firstElementChild;
    while (cell && cell.firstElementChild) li.append(cell.firstElementChild);
    return li;
  });

  const viewport = document.createElement('div');
  viewport.className = 'logo-carousel-viewport';

  const track = document.createElement('ul');
  track.className = 'logo-carousel-track';
  track.style.setProperty('--logo-count', items.length);

  const clones = items.map((li) => {
    const clone = li.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a').forEach((a) => { a.tabIndex = -1; });
    return clone;
  });
  track.append(...items, ...clones);

  viewport.append(track);
  block.replaceChildren(viewport);
}
