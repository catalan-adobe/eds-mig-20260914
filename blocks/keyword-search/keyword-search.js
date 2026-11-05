export default function decorate(block) {
  const [intro, field, credit] = [...block.children].map((row) => row.firstElementChild);
  const placeholder = field?.textContent.trim() || 'Enter keyword';

  const form = document.createElement('form');
  form.className = 'keyword-search-form';
  form.innerHTML = '<input type="text" autocomplete="off"><button type="submit" aria-label="Search"><img src="/icons/band-r8-search.svg" alt="" width="28" height="28"></button>';
  form.firstElementChild.placeholder = placeholder;
  form.firstElementChild.setAttribute('aria-label', placeholder);
  form.addEventListener('submit', (e) => e.preventDefault());

  const by = document.createElement('div');
  by.className = 'keyword-search-by';
  const cells = [...(credit?.parentElement.children || [])];
  const label = document.createElement('span');
  label.textContent = cells[0]?.textContent.trim() || '';
  by.append(label, ...cells.slice(1).flatMap((c) => [...c.querySelectorAll('picture')]));

  const head = document.createElement('div');
  head.className = 'keyword-search-intro';
  if (intro) head.append(...intro.children);

  block.replaceChildren(head, form, by);
}
