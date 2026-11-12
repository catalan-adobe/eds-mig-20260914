/** Reads the placeholder and the target, then draws the source's IP search field. */
export default function decorate(block) {
  const [placeholderCell, targetCell] = block.firstElementChild?.children ?? [];
  const placeholder = placeholderCell?.textContent.trim() ?? '';
  const target = targetCell?.querySelector('a')?.href ?? targetCell?.textContent.trim() ?? '';
  const form = document.createElement('form');
  form.setAttribute('role', 'search');
  const input = document.createElement('input');
  Object.assign(input, {
    type: 'text', name: 'p', placeholder, maxLength: 50,
  });
  input.setAttribute('aria-label', placeholder || 'Search');
  form.append(input);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (target) window.location.href = `${target}${encodeURIComponent(input.value)}`;
  });
  block.replaceChildren(form);
}
