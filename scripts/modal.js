// The source's modal (video and image zoom): a dark backdrop, the content in a 16:9 box that is
// 65 % wide from 730 px, a close button above its right corner. Styles: styles/lazy-styles.css.

/**
 * Opens the modal. It closes on its button, on a click outside the box and on Escape.
 * @param {Element} content What to show: an image, a picture, an iframe or a video
 * @returns {Function} Closes the modal
 */
export default function openModal(content) {
  const opener = document.activeElement;
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  const dialog = document.createElement('div');
  dialog.className = 'modal-dialog';
  dialog.tabIndex = -1;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'modal-close';
  button.setAttribute('aria-label', 'Close');
  button.textContent = '×';
  const body = document.createElement('div');
  body.className = 'modal-body';
  body.append(content);
  dialog.append(button, body);
  modal.append(dialog);

  const onKey = (e) => {
    // eslint-disable-next-line no-use-before-define
    if (e.key === 'Escape') close();
  };
  function close() {
    document.removeEventListener('keydown', onKey);
    modal.remove();
    opener?.focus?.();
  }
  button.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', onKey);
  document.body.append(modal);
  dialog.focus();
  return close;
}
