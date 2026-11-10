function decorateContent(cell) {
  cell.className = 'hero-content';
  cell.querySelectorAll(':scope > p').forEach((p) => {
    const link = p.querySelector(':scope > a:only-child');
    const isAction = link && p.textContent.trim() === link.textContent.trim();
    p.className = isAction ? 'hero-action' : 'hero-description';
  });
}

function decorateSlide(slide, index, total) {
  slide.className = 'hero-slide';
  [...slide.children].forEach((cell) => {
    if (cell.querySelector('picture')) {
      cell.className = 'hero-image';
    } else if (cell.textContent.trim()) {
      decorateContent(cell);
    } else {
      cell.remove();
    }
  });
  slide.querySelectorAll('.hero-image img').forEach((img) => {
    img.loading = index === 0 ? 'eager' : 'lazy';
  });
  if (total > 1) {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `Slide ${index + 1} of ${total}`);
  }
}

function createButton(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  return button;
}

function addControls(block, slides) {
  const actions = document.createElement('div');
  actions.className = 'hero-actions';
  const previous = createButton('hero-previous', 'Previous');
  const next = createButton('hero-next', 'Next');
  actions.append(previous, next);

  const dots = document.createElement('div');
  dots.className = 'hero-dots';
  const dotButtons = slides.map((_, index) => createButton('hero-dot', `Slide ${index + 1}`));
  dots.append(...dotButtons);

  let current = 0;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    dotButtons.forEach((dot, i) => dot.setAttribute('aria-current', i === current));
  };

  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  dotButtons.forEach((dot, index) => dot.addEventListener('click', () => show(index)));

  block.append(actions, dots);
  show(0);
}

export default function decorate(block) {
  const slides = [...block.children];
  slides.forEach((slide, index) => decorateSlide(slide, index, slides.length));
  if (slides.length > 1 || block.classList.contains('mini')) {
    addControls(block, slides);
  } else if (slides.length) {
    slides[0].classList.add('active');
  }
}
