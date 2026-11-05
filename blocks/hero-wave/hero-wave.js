function el(tag, className, children = []) {
  const node = document.createElement(tag);
  node.className = className;
  node.append(...children);
  return node;
}

function wrapCopy(heading) {
  const copy = [...heading.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE
    && node.textContent.trim());
  if (!copy.length) return;
  const span = el('span', 'hero-wave-title-copy');
  copy[0].before(span);
  span.append(...copy);
}

function buildTitle(heading) {
  wrapCopy(heading);
  const foreground = heading.cloneNode(true);
  foreground.classList.add('hero-wave-title-foreground');
  foreground.setAttribute('aria-hidden', 'true');
  return el('div', 'hero-wave-title', [heading, foreground]);
}

const BREAKPOINTS = { desktop: '(min-width: 1264px)', tablet: '(min-width: 640px)' };

function buildBackdrop(cell) {
  const images = [...cell.querySelectorAll('img')];
  if (!images.length) return null;
  const picture = document.createElement('picture');
  Object.entries(BREAKPOINTS).forEach(([size, media]) => {
    const match = images.find((img) => img.src.includes(`-${size}.`));
    if (!match) return;
    const source = document.createElement('source');
    source.media = media;
    source.srcset = match.src;
    picture.append(source);
  });
  const fallback = images.find((img) => img.src.includes('-mobile.')) || images.at(-1);
  picture.append(fallback);
  return el('div', 'hero-wave-backdrop', [picture]);
}

export default function decorate(block) {
  const [backdropRow, contentRow] = [...block.children];
  const backdrop = backdropRow ? buildBackdrop(backdropRow) : null;
  const content = contentRow?.firstElementChild;
  block.textContent = '';

  if (backdrop) block.append(backdrop);
  if (!content) return;

  const heading = content.querySelector('h1, h2');
  const buttons = [...content.querySelectorAll('.button-wrapper')];
  const eyebrow = [...content.querySelectorAll(':scope > p')].find((p) => !p.matches('.button-wrapper'));
  const grid = el('div', 'hero-wave-grid');
  if (eyebrow) {
    eyebrow.classList.add('hero-wave-eyebrow');
    const value = eyebrow.querySelector('em');
    if (value) {
      const incoming = value.cloneNode(true);
      incoming.setAttribute('aria-hidden', 'true');
      incoming.classList.add('hero-wave-eyebrow-next');
      value.after(incoming);
    }
    grid.append(eyebrow);
  }
  if (heading) grid.append(buildTitle(heading));
  if (buttons.length) grid.append(el('div', 'hero-wave-actions', buttons));
  block.append(el('div', 'hero-wave-layout', [grid]));
}
