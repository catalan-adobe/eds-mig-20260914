/** Marks the text cell and the optional image cell of each row. */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const image = !cell.textContent.trim() && cell.querySelector('picture, img');
      cell.classList.add(image ? 'promo-image' : 'promo-text');
    });
  });
  // the newsletter box draws its smaller title inside a line of the full title size
  if (block.classList.contains('outline')) {
    // the source's newsletter box opens its links in a new tab
    block.querySelectorAll('a[href]').forEach((a) => { a.target = '_blank'; });
    block.querySelectorAll('h2').forEach((h2) => {
      const span = document.createElement('span');
      span.append(...h2.childNodes);
      h2.append(span);
    });
  }
}
