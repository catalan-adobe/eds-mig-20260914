const SIZES = ['wide', 'full'];

function buildPicture(images) {
  const [desktop, tablet, mobile] = images;
  const picture = document.createElement('picture');
  [[desktop, '(min-width: 940px)'], [tablet, '(min-width: 640px)']].forEach(([img, media]) => {
    if (!img) return;
    const source = document.createElement('source');
    source.media = media;
    source.srcset = img.getAttribute('src');
    picture.append(source);
  });
  const fallback = mobile || tablet || desktop;
  const img = document.createElement('img');
  img.src = fallback.getAttribute('src');
  img.alt = fallback.alt;
  img.loading = 'lazy';
  img.width = 358;
  img.height = 525;
  picture.append(img);
  return picture;
}

export default function decorate(block) {
  const cards = [...block.children].map((row) => {
    const [textCell, imageCell, sizeCell] = [...row.children];
    const images = [...(imageCell?.querySelectorAll('img') || [])];
    const card = document.createElement('div');
    card.className = 'product-bento-card';
    const size = sizeCell?.textContent.trim().toLowerCase();
    if (SIZES.includes(size)) card.classList.add(`product-bento-card-${size}`);

    const heading = textCell?.querySelector('h1, h2, h3, h4, h5, h6');
    if (images.length) {
      const media = document.createElement('div');
      media.className = 'product-bento-media';
      media.append(buildPicture(images));
      card.append(media);
    }
    if (heading) {
      const text = document.createElement('div');
      text.className = 'product-bento-text';
      text.append(heading);
      card.append(text);
    }
    const expand = document.createElement('span');
    expand.className = 'product-bento-expand';
    expand.setAttribute('aria-hidden', 'true');
    card.append(expand);
    return card;
  });
  block.replaceChildren(...cards);
}
