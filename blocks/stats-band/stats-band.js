export default function decorate(block) {
  const stats = [...block.children].map((row) => {
    const [value, description] = [...row.children];
    const stat = document.createElement('div');
    stat.className = 'stats-band-stat';
    if (value?.querySelector('strong')) stat.classList.add('active');
    const number = document.createElement('p');
    number.className = 'stats-band-value';
    number.textContent = value?.textContent.trim() ?? '';
    const label = document.createElement('p');
    label.className = 'stats-band-label';
    label.innerHTML = description?.innerHTML ?? '';
    const lead = label.firstChild;
    if (lead?.nodeType === Node.TEXT_NODE && lead.textContent.trim() === 'de' && label.querySelector('a')) {
      const small = document.createElement('span');
      small.className = 'stats-band-lead';
      small.textContent = lead.textContent;
      lead.replaceWith(small);
    }
    stat.append(number, label);
    return stat;
  });
  block.replaceChildren(...stats);
}
