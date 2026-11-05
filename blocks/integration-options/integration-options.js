export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [image, content] = row.children;
    row.className = 'integration-option';
    image?.classList.add('integration-option-image');
    content?.classList.add('integration-option-content');
  });
}
