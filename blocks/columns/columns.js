export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const picture = cell.querySelector('picture');
      const isPictureOnly = picture && cell.textContent.trim() === '';
      cell.classList.add(isPictureOnly ? 'columns-picture' : 'columns-text');
    });
  });
}
