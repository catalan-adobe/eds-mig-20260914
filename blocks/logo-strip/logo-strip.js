export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    const item = document.createElement('li');
    const logo = row.querySelector('a, picture, img');
    if (!logo) return;
    item.append(logo.closest('a') || logo.closest('picture') || logo);
    list.append(item);
  });
  block.textContent = '';
  block.append(list);
}
