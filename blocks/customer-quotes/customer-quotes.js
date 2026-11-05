function buildQuote(content) {
  const [quote, author, link] = [...content.querySelectorAll('p')];
  const q = document.createElement('q');
  q.className = 'customer-quotes-quote';
  q.textContent = quote?.textContent ?? '';
  if (author) author.className = 'customer-quotes-author';
  if (link) link.className = 'customer-quotes-link';
  content.replaceChildren(...[q, author, link].filter(Boolean));
}

export default function decorate(block) {
  const slides = document.createElement('div');
  slides.className = 'customer-quotes-slides';
  const nav = document.createElement('div');
  nav.className = 'customer-quotes-nav';
  const logos = document.createElement('div');
  logos.className = 'customer-quotes-logos';

  [...block.children].forEach((row, i) => {
    const [logo, content] = [...row.children];
    const img = logo?.querySelector('img');
    const name = img?.alt || `${i + 1}`;
    const slide = document.createElement('div');
    slide.className = 'customer-quotes-slide';
    if (content) {
      buildQuote(content);
      slide.append(...content.children);
    }
    slides.append(slide);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'customer-quotes-logo';
    button.setAttribute('aria-label', `Montrer le témoignage de ${name}`);
    if (img) {
      const tint = document.createElement('span');
      tint.className = 'customer-quotes-tint';
      tint.style.setProperty('--logo', `url("${img.getAttribute('src')}")`);
      button.append(img, tint);
    }
    if (i === 0) button.classList.add('active');
    logos.append(button);
  });

  const select = (index) => {
    slides.scrollTo({ left: index * slides.clientWidth, behavior: 'smooth' });
    [...logos.children].forEach((b, i) => b.classList.toggle('active', i === index));
    nav.style.setProperty('--active', index);
  };
  [...logos.children].forEach((b, i) => b.addEventListener('click', () => select(i)));
  nav.append(logos);
  nav.style.setProperty('--count', logos.children.length);
  nav.style.setProperty('--active', 0);
  block.replaceChildren(slides, nav);
}
