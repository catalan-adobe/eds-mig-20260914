function linkCard(row, featured) {
  const [imageCell, textCell] = [...row.children];
  const heading = textCell?.querySelector('h1, h2, h3, h4, h5, h6');
  const href = heading?.querySelector('a')?.href;
  const card = document.createElement('article');
  const anchor = document.createElement(href ? 'a' : 'div');
  if (href) anchor.href = href;
  const figure = document.createElement('figure');
  const picture = imageCell?.querySelector('picture');
  if (picture) figure.append(picture);
  anchor.append(figure);
  if (heading) {
    heading.textContent = heading.textContent.trim();
    anchor.append(heading);
  }
  if (featured) {
    const description = textCell.querySelector(':scope > p:not(:has(picture))');
    if (description) {
      description.className = 'featured-posts-summary';
      anchor.append(description);
    }
  }
  card.append(anchor);
  return card;
}

function byline(row) {
  const line = row.querySelector(':scope > div:last-child > p:has(picture)');
  if (!line) return null;
  const wrap = document.createElement('div');
  wrap.className = 'featured-posts-byline';
  const figure = document.createElement('figure');
  figure.append(line.querySelector('picture'));
  const text = document.createElement('p');
  text.append(...line.childNodes);
  wrap.append(figure, text);
  return wrap;
}

export default function decorate(block) {
  const [first, ...rest] = [...block.children];
  if (!first) return;
  const lead = document.createElement('div');
  lead.className = 'featured-posts-lead';
  const author = byline(first);
  lead.append(linkCard(first, true));
  if (author) lead.firstElementChild.append(author);
  const list = document.createElement('div');
  list.className = 'featured-posts-list';
  list.append(...rest.map((row) => linkCard(row, false)));
  block.replaceChildren(lead, list);
}
