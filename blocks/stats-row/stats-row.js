export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [value, label, color] = [...row.children].map((cell) => cell.textContent.trim());
    const item = document.createElement('div');
    item.className = `stats-row-item ${color || 'orange'}`;
    const heading = document.createElement('h4');
    heading.textContent = value;
    const text = document.createElement('p');
    text.textContent = label;
    item.append(heading, text);
    row.replaceWith(item);
  });
}
