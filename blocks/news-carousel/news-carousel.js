const ARROW_PREV = 'M9.613 2.62 5.107 7.124h9.137v1.75H5.107l4.506 4.506-1.238 1.238-6-6L1.756 8l.619-.62 6-6 1.238 1.24Z';
const ARROW_NEXT = 'm6.387 2.62 4.506 4.505H1.756v1.75h9.137l-4.506 4.506 1.238 1.238 6-6L14.245 8l-.618-.62-6-6-1.239 1.24Z';

function createButton(label, path) {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="${path}"></path></svg>`;
  return button;
}

export default function decorate(block) {
  const rows = [...block.children];
  const banner = rows.find((row) => !row.querySelector('h3'));
  const items = rows.filter((row) => row !== banner);
  banner?.classList.add('news-carousel-banner');
  const [wide, medium] = banner ? [...banner.children] : [];
  wide?.classList.add('news-carousel-banner-wide');
  medium?.classList.add('news-carousel-banner-medium');

  const scroller = document.createElement('ul');
  items.forEach((row) => {
    const [media, copy] = [...row.children];
    const li = document.createElement('li');
    media?.classList.add('news-carousel-media');
    copy?.classList.add('news-carousel-copy');
    if (copy) {
      const text = document.createElement('div');
      text.className = 'news-carousel-text';
      text.append(...copy.querySelectorAll('h3, p:not(.button-wrapper)'));
      copy.prepend(text);
    }
    li.append(...[media, copy].filter(Boolean));
    scroller.append(li);
  });
  scroller.setAttribute('role', 'list');

  const status = document.createElement('div');
  status.className = 'news-carousel-status';
  status.setAttribute('aria-live', 'polite');

  let active = 0;
  const show = (index) => {
    active = (index + items.length) % items.length;
    [...scroller.children].forEach((li, i) => li.classList.toggle('active', i === active));
    const title = scroller.children[active]?.querySelector('h3')?.textContent ?? '';
    status.textContent = `Élément ${active + 1} sur ${items.length} : ${title}`;
  };
  show(0);

  const prev = createButton('Diapositive précédente', ARROW_PREV);
  const next = createButton('Diapositive suivante', ARROW_NEXT);
  const step = (dir) => {
    if (window.matchMedia('(width >= 768px)').matches) {
      show(active + dir);
    } else {
      scroller.scrollBy({ left: dir * scroller.clientWidth, behavior: 'smooth' });
    }
  };
  scroller.addEventListener('scroll', () => {
    if (window.matchMedia('(width < 768px)').matches && scroller.firstElementChild) {
      const pitch = scroller.firstElementChild.getBoundingClientRect().width + 16;
      show(Math.round(scroller.scrollLeft / pitch));
    }
  });
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  const controls = document.createElement('div');
  controls.className = 'news-carousel-controls';
  controls.append(prev, next);

  block.replaceChildren(...[banner, scroller, controls, status].filter(Boolean));
}
