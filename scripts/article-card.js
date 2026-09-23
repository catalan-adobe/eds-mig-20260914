/**
 * Turns an authored card cell (image, tag paragraph, linked h3, summary) into
 * the source site's card-as-link. Authored nodes are moved, never rebuilt.
 * @param {Element} cell block cell holding one card
 * @returns {HTMLAnchorElement} the card
 */
// eslint-disable-next-line import/prefer-default-export
export function buildArticleCard(cell) {
  const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  const link = heading.querySelector('a');
  const card = document.createElement('a');
  card.className = 'article-card';
  card.href = link.href;
  heading.append(...link.childNodes);
  link.remove();

  const media = document.createElement('div');
  media.className = 'article-card-image';
  const picture = cell.querySelector('picture, img');
  if (picture) media.append(picture.parentElement.matches('p') ? picture.parentElement : picture);

  const body = document.createElement('div');
  body.className = 'article-card-body';
  const tag = heading.previousElementSibling;
  if (tag?.matches('p:has(> strong:only-child)')) {
    const meta = document.createElement('div');
    meta.className = 'article-card-meta';
    meta.append(tag);
    body.append(meta);
  }
  body.append(...cell.children);
  card.append(media, body);
  cell.append(card);
  return card;
}
