const MEDIA = ['(min-width: 1200px)', '(min-width: 768px)'];

/** Rows: one image per width, widest first; the last image is the smallest-width fallback. */
export default function decorate(block) {
  const imgs = [...block.querySelectorAll('img')];
  if (!imgs.length) return;
  const picture = document.createElement('picture');
  imgs.slice(0, -1).forEach((img, i) => {
    const source = document.createElement('source');
    source.media = MEDIA[i] ?? MEDIA[MEDIA.length - 1];
    source.srcset = img.getAttribute('src');
    picture.append(source);
  });
  picture.append(imgs[imgs.length - 1]);
  block.replaceChildren(picture);
}
