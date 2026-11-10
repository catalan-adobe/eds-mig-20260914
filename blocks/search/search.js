/**
 * Rows: the placeholder text, then the label of the summary switch.
 * shortcut: the form has no backend and submits nowhere, wire it up when a search service exists.
 * @param {Element} block The search block element
 */
export default function decorate(block) {
  const [placeholder, toggleLabel] = [...block.children].map((row) => row.textContent.trim());
  const form = document.createElement('form');
  form.setAttribute('role', 'search');
  form.addEventListener('submit', (e) => e.preventDefault());
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = placeholder || 'Search';
  input.setAttribute('aria-label', 'Search');
  form.append(input);
  if (toggleLabel) {
    const label = document.createElement('label');
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = true;
    toggle.setAttribute('role', 'switch');
    label.append(toggle, toggleLabel);
    form.append(label);
  }
  block.replaceChildren(form);
}
