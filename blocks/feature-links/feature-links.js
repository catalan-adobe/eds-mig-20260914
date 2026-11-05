export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('feature-links-card');
    const [icon, body] = [...row.children];
    if (icon && body) {
      icon.classList.add('feature-links-icon');
      body.classList.add('feature-links-body');
    } else if (icon) {
      icon.classList.add('feature-links-body');
    }
  });
  block.querySelectorAll('p.button-wrapper, p > a:only-child').forEach((el) => {
    const link = el.tagName === 'A' ? el : el.querySelector('a');
    link?.closest('p')?.classList.add('feature-links-link');
  });
}
