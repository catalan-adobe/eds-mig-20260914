function iconButton(name, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  const img = document.createElement('img');
  img.src = `${window.hlx.codeBasePath}/icons/${name}.svg`;
  img.alt = '';
  button.append(img);
  return button;
}

function buildSlide(row, index) {
  const slide = document.createElement('li');
  slide.className = 'carousel-slide';
  slide.hidden = index > 0;
  [...row.children].forEach((cell) => {
    const isImage = cell.children.length === 1 && cell.querySelector('picture');
    cell.className = isImage ? 'carousel-slide-image' : 'carousel-slide-content';
    slide.append(cell);
  });
  return slide;
}

function buildControls(block, slides) {
  let current = 0;
  const indicators = document.createElement('ol');
  indicators.className = 'carousel-indicators';
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    [...indicators.children].forEach((item, i) => {
      item.firstElementChild.setAttribute('aria-current', i === current);
    });
  };
  slides.forEach((slide, i) => {
    const item = document.createElement('li');
    const title = slide.querySelector('h1, h2, h3, h4, h5, h6')?.textContent;
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Show slide ${i + 1} of ${slides.length}${title ? `: ${title}` : ''}`);
    button.addEventListener('click', () => show(i));
    item.append(button);
    indicators.append(item);
  });
  const previous = iconButton('arrow-left', 'Previous slide');
  const next = iconButton('arrow-right', 'Next slide');
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  const buttons = document.createElement('div');
  buttons.className = 'carousel-buttons';
  buttons.append(previous, next);
  const controls = document.createElement('div');
  controls.className = 'carousel-controls';
  controls.append(indicators, buttons);
  block.append(controls);
  show(0);
}

/**
 * Rows are slides: an image, then optional content (title, text, button).
 * One slide is a plain hero with no controls. Slides never advance on their own.
 * @param {Element} block The carousel block element
 */
export default function decorate(block) {
  const slides = [...block.children].map(buildSlide);
  const list = document.createElement('ul');
  list.className = 'carousel-slides';
  list.append(...slides);
  block.replaceChildren(list);
  if (slides.length < 2) return;
  block.classList.add('carousel-multiple');
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', 'Featured');
  list.setAttribute('aria-live', 'polite');
  buildControls(block, slides);
}
