const CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" aria-hidden="true"><path d="M12.156 12.594 7 7.398l-5.195 5.196c-.235.234-.625.234-.899 0-.234-.274-.234-.664 0-.899L6.102 6.5.906 1.344C.672 1.109.672.719.906.445c.274-.234.664-.234.899 0L7 5.641 12.156.445c.235-.234.625-.234.899 0 .234.274.234.664 0 .899L7.859 6.5l5.196 5.195c.234.235.234.625 0 .899-.274.234-.664.234-.899 0"/></svg>';

/**
 * Decorates the promo bar: message, call-to-action button and a close button.
 * @param {Element} block The promo block element
 */
export default function decorate(block) {
  const content = document.createElement('div');
  content.className = 'promo-content';
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    content.append(...cell.children);
  });

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'promo-close';
  close.setAttribute('aria-label', 'Close');
  close.innerHTML = CLOSE_ICON;
  close.addEventListener('click', () => {
    (block.closest('.section') || block).hidden = true;
  });

  block.replaceChildren(content, close);
}
