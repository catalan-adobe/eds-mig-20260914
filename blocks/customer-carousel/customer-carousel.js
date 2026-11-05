const ARROW_LEFT = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9.613 2.62 5.107 7.124h9.137v1.75H5.107l4.506 4.506-1.238 1.238-6-6L1.756 8l.619-.62 6-6 1.238 1.24Z"/></svg>';
const ARROW_RIGHT = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="m6.387 2.62 4.506 4.505H1.756v1.75h9.137l-4.506 4.506 1.238 1.238 6-6L14.245 8l-.618-.62-6-6-1.239 1.24Z"/></svg>';

function buildCard(row) {
  const [media, body] = [...row.children];
  const li = document.createElement('li');
  const mediaEl = document.createElement('div');
  mediaEl.className = 'customer-carousel-media';
  const images = media ? [...media.querySelectorAll('picture')] : [];
  images.forEach((pic, i) => {
    pic.classList.add(i === 0 ? 'customer-carousel-photo' : 'customer-carousel-logo');
    mediaEl.append(pic);
  });
  const bodyEl = document.createElement('div');
  bodyEl.className = 'customer-carousel-body';
  if (body) bodyEl.append(...body.children);
  li.append(mediaEl, bodyEl);
  return li;
}

function buildNav(list) {
  const nav = document.createElement('div');
  nav.className = 'customer-carousel-nav';
  const prev = document.createElement('button');
  const next = document.createElement('button');
  [[prev, 'Témoignage client précédent', ARROW_LEFT, -1],
    [next, 'Témoignage client suivant', ARROW_RIGHT, 1]].forEach(([btn, label, icon, dir]) => {
    btn.type = 'button';
    btn.setAttribute('aria-label', label);
    btn.innerHTML = icon;
    btn.addEventListener('click', () => {
      const step = list.firstElementChild.getBoundingClientRect().width + 16;
      list.scrollBy({ left: dir * step, behavior: 'smooth' });
    });
    nav.append(btn);
  });
  const update = () => {
    prev.disabled = list.scrollLeft <= 1;
    next.disabled = list.scrollLeft >= list.scrollWidth - list.clientWidth - 1;
  };
  list.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(list);
  update();
  return nav;
}

export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => list.append(buildCard(row)));
  const viewport = document.createElement('div');
  viewport.className = 'customer-carousel-viewport';
  viewport.append(list);
  block.replaceChildren(buildNav(list), viewport);
}
