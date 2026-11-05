export default function decorate(block) {
  const row = block.firstElementChild;
  const [media, copy] = row ? [...row.children] : [];
  if (!media || !copy) return;
  media.classList.add('book-feature-cover');
  copy.classList.add('book-feature-content');

  const title = copy.querySelector('h4');
  const [author, description, note] = copy.querySelectorAll(':scope > p');
  const links = copy.querySelector('ul');

  const heading = document.createElement('div');
  heading.className = 'book-feature-heading';
  heading.append(...[title, author].filter(Boolean));

  const more = document.createElement('div');
  more.className = 'book-feature-more';
  more.append(...[note, links].filter(Boolean));

  const text = document.createElement('div');
  text.className = 'book-feature-text';
  text.append(...[heading, description, more].filter(Boolean));
  copy.replaceChildren(text);
}
