export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [icon, text] = [...row.children];
    icon?.classList.add('expert-services-icon');
    text?.classList.add('expert-services-text');
  });
}
