/**
 * Ticker: one cell holding a list; items scroll as a marquee with "·" separators.
 * @param {Element} block The ticker block element
 */
export default function decorate(block) {
  const list = block.querySelector('ul');
  const track = document.createElement('div');
  track.className = 'ticker-track';
  [...list.children].forEach((li) => {
    const item = document.createElement('span');
    item.append(...li.childNodes);
    const sep = document.createElement('span');
    sep.className = 'ticker-sep';
    sep.setAttribute('aria-hidden', 'true');
    sep.textContent = '·';
    track.append(item, sep);
  });
  block.textContent = '';
  block.append(track);
}
