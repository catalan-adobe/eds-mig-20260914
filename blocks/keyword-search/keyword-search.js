/**
 * Keyword search (Semrush widget): heading + intro row, input placeholder row, attribution row
 * ("by" + partner logo picture).
 * @ew-exempt form-controls: the input placeholder is form-control text.
 */

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

export default function decorate(block) {
  const [headRow, inputRow, byRow] = [...block.children];
  const head = el('div', 'keyword-head', ...headRow.querySelectorAll('h2, h3, p'));

  const placeholderP = inputRow.querySelector('p');
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholderP.textContent;
  input.setAttribute('aria-label', placeholderP.textContent);
  const icon = document.createElement('img');
  icon.src = `${window.hlx?.codeBasePath || ''}/icons/search-white.svg`;
  icon.alt = '';
  icon.width = 28;
  icon.height = 28;
  const button = el('button', '', icon);
  button.type = 'submit';
  button.setAttribute('aria-label', 'Search');
  // interim tier: the Semrush keyword-overview widget endpoint is an owner decision
  const form = el('form', 'keyword-search-field', input, button);
  form.addEventListener('submit', (e) => e.preventDefault());

  const by = el('div', 'keyword-by', ...byRow.querySelectorAll('p'));
  block.textContent = '';
  block.append(el('div', 'keyword-box', head, form, by));
}
