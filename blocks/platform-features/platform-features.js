export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [icon, content] = [...row.children];
    row.className = 'platform-features-item';
    if (icon) icon.className = 'platform-features-icon';
    if (content) content.className = 'platform-features-content';
  });
}
