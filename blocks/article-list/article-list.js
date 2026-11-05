export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const [media, text] = row.children;
    const link = text?.querySelector('a');
    if (!link) return null;
    const article = document.createElement('article');
    const a = document.createElement('a');
    a.href = link.href;
    const figure = document.createElement('figure');
    const picture = media?.querySelector('picture');
    if (picture) figure.append(picture);
    const h3 = document.createElement('h3');
    h3.textContent = link.textContent;
    a.append(figure, h3);
    article.append(a);
    const li = document.createElement('li');
    li.append(article);
    return li;
  }).filter(Boolean);
  const ul = document.createElement('ul');
  ul.append(...items);
  block.replaceChildren(ul);
}
