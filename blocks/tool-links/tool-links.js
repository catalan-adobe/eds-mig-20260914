export default function decorate(block) {
  [...block.children].forEach((row) => {
    const link = row.querySelector('a[href]');
    if (!link) return;
    const card = document.createElement('a');
    card.href = link.href;
    card.title = link.textContent.trim();
    const [iconCell, textCell] = row.children;
    const heading = textCell?.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.textContent = link.textContent;
    else link.replaceWith(link.textContent);
    if (iconCell) iconCell.className = 'tool-links-icon';
    if (textCell) textCell.className = 'tool-links-text';
    card.append(...row.children);
    row.replaceChildren(card);
  });
}
