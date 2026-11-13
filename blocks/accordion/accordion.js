let count = 0;

const CLOSED = { height: 0, marginTop: 0, paddingBottom: 0 };

/** Opens or closes an answer with the source's 0.4 s slide. */
function slide(detail, open) {
  detail.getAnimations().forEach((animation) => animation.cancel());
  detail.hidden = false;
  const { height, marginTop, paddingBottom } = getComputedStyle(detail);
  const frames = [CLOSED, { height, marginTop, paddingBottom }]
    .map((frame) => ({ ...frame, overflow: 'hidden' }));
  const animation = detail.animate(open ? frames : frames.reverse(), {
    duration: 400, easing: 'ease-in-out',
  });
  animation.onfinish = () => { detail.hidden = !open; };
}

function toggle(item, open) {
  item.classList.toggle('open', open);
  item.querySelector('.accordion-title').setAttribute('aria-expanded', open);
  slide(item.querySelector('.accordion-detail'), open);
}

/**
 * FAQ list. A row is one item: question | answer. All items are closed at load; opening one
 * closes the open one.
 * @param {Element} block
 */
export default function decorate(block) {
  count += 1;
  [...block.children].forEach((row, i) => {
    const [question, answer = document.createElement('div')] = row.children;
    if (!question) {
      row.remove();
      return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accordion-title';
    button.setAttribute('aria-expanded', 'false');
    button.append(...(question.querySelector(':scope > p:only-child') ?? question).childNodes);
    const heading = document.createElement('h4');
    heading.className = 'accordion-heading';
    heading.append(button);
    answer.className = 'accordion-detail';
    answer.id = `accordion-${count}-${i + 1}`;
    answer.hidden = true;
    button.setAttribute('aria-controls', answer.id);
    row.className = 'accordion-item';
    row.replaceChildren(heading, answer);
    button.addEventListener('click', () => {
      const open = !row.classList.contains('open');
      block.querySelectorAll(':scope > .open').forEach((other) => toggle(other, false));
      if (open) toggle(row, true);
    });
  });
}
