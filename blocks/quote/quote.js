import { createSlider } from '../../scripts/slider.js';

const AUTOPLAY = /^autoplay(?:-(\d+))?$/;
// the source's sliding carousel is as high as the quote in view only between these widths
const adaptive = window.matchMedia('(width > 480px) and (width < 730px)');

function element(tag, className, ...children) {
  const el = document.createElement(tag);
  el.className = className;
  el.append(...children);
  return el;
}

/** One quote. Cells: text | name and role | logo or portrait | link of the whole quote. */
function decorateQuote(row) {
  const [text, who, media, more] = row.children;
  const link = more?.querySelector('a[href]');
  const card = element(link ? 'a' : 'div', 'quote-card');
  if (link) card.href = link.href;
  const words = (text?.querySelector(':scope > p:only-child') ?? text)?.childNodes ?? [];
  const lines = [...(who?.querySelectorAll(':scope > p') ?? [])];
  // the source draws the line after the name also when the name or the role is missing
  if (!lines.length) lines.push(element('p', '', ...(who?.childNodes ?? [])));
  const image = media?.querySelector('picture, img');
  card.append(
    // the source has a space between the opening mark and the first word
    element('blockquote', 'quote-text', ' ', ...words),
    element('div', 'quote-attribution', ...lines),
    element('div', 'quote-media', ...(image ? [image] : [])),
  );
  row.className = 'quote-item';
  row.replaceChildren(card);
}

/** Keeps the slider as high as the quote in view where the source does. */
function followHeight(list) {
  const adapt = () => {
    const quote = list.querySelector(':scope > :not([aria-hidden="true"])');
    const { height } = quote?.getBoundingClientRect() ?? {};
    list.parentElement.style.height = adaptive.matches && height ? `${height}px` : '';
  };
  new MutationObserver(adapt)
    .observe(list, { attributes: true, subtree: true, attributeFilter: ['aria-hidden'] });
  new ResizeObserver(adapt).observe(list);
}

/**
 * Customer quotes, one per row. `carousel` shows one quote at a time: all quotes are one
 * height and fade, or with `fit` each keeps its height and slides. `autoplay` moves on every
 * 6 s, `autoplay-4` every 4 s. `cjk` draws the corner bracket as the opening mark, `headshot`
 * a round portrait.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    if (row.textContent.trim() || row.querySelector('img')) decorateQuote(row);
    else row.remove();
  });
  if (!block.classList.contains('carousel')) return;
  const list = element('div', 'quote-list', ...block.children);
  block.append(list);
  const seconds = [...block.classList].map((name) => name.match(AUTOPLAY)).find(Boolean);
  createSlider(list, { autoplay: seconds ? Number(seconds[1] ?? 6) * 1000 : 0 });
  if (block.classList.contains('fit')) followHeight(list);
}
