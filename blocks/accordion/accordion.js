/**
 * Accordion (FAQ): rows of [question, answer]. The question cell becomes the
 * toggle (role=button) so authored text never sits inside a <button>.
 * @param {Element} block The accordion block element
 */
export default function decorate(block) {
  [...block.children].forEach((row, i) => {
    const [question, answer] = row.children;
    row.className = 'accordion-item';
    question.className = 'accordion-question';
    answer.className = 'accordion-answer';
    answer.id = `${block.id || 'accordion'}-${i}`;
    question.setAttribute('role', 'button');
    question.tabIndex = 0;
    question.setAttribute('aria-expanded', 'false');
    question.setAttribute('aria-controls', answer.id);
    const icon = document.createElement('span');
    icon.className = 'accordion-icon';
    icon.setAttribute('aria-hidden', 'true');
    question.append(icon);
    const toggle = () => {
      question.setAttribute('aria-expanded', String(row.classList.toggle('is-open')));
    };
    question.addEventListener('click', toggle);
    question.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      toggle();
    });
  });
}
