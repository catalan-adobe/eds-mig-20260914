/**
 * Hero: eyebrow + headline row, testimonial row (picture | quote, attribution),
 * newsletter form row (placeholder, button label, validation message).
 * @ew-exempt form-controls: the email placeholder and the submit label are form-control text.
 */

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

export default function decorate(block) {
  const [headRow, quoteRow, formRow] = [...block.children];
  const [eyebrow] = headRow.querySelectorAll('h2, p');
  const headline = headRow.querySelector('h1');

  const picture = quoteRow.querySelector('picture');
  const [quote, attribution] = [...quoteRow.querySelectorAll('p')].filter((p) => !p.querySelector('picture'));
  const card = el(
    'div',
    'quote-card',
    el('blockquote', '', el('figure', '', picture), el('div', 'quote-text', quote), el('div', 'quote-cite', attribution)),
  );

  const [placeholderP, labelP, messageP] = formRow.querySelectorAll('p');
  const input = document.createElement('input');
  input.type = 'email';
  input.name = 'email';
  input.placeholder = placeholderP.textContent;
  input.setAttribute('aria-label', placeholderP.textContent);
  const button = el('button', '', labelP.textContent);
  button.type = 'submit';
  const tooltip = el('div', 'form-tooltip', el('div', 'form-tooltip-arrow'), el('div', 'form-tooltip-inner', messageP));
  tooltip.setAttribute('role', 'tooltip');
  tooltip.setAttribute('aria-hidden', 'true');
  const form = el('form', '', el('div', 'form-field', input, tooltip), button);
  // interim tier: the AWeber newsletter endpoint is an owner decision (dynamic-features.md)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    tooltip.classList.toggle('show', !input.value || !input.checkValidity());
  });

  block.textContent = '';
  block.append(el(
    'div',
    'hero-content',
    el('div', 'hero-eyebrow', eyebrow),
    el('div', 'hero-title', headline),
    card,
    el('div', 'hero-form', form),
  ));
}
