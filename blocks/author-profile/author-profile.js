// the tooltips of the source's profile links
const TITLES = { 'linkedin-in': 'Linkedin', 'x-twitter': 'X' };

/**
 * Author card: photo, then name, biography, and "Follow on:" with icon links.
 * @param {Element} block
 */
export default function decorate(block) {
  const [image, text] = block.querySelectorAll(':scope > div > div');
  image?.classList.add('author-profile-image');
  if (!text) return;
  text.classList.add('author-profile-text');
  const links = [...text.querySelectorAll(':scope > p')]
    .find((p) => p.querySelector('a .icon') && !p.textContent.trim());
  if (!links) return;
  links.classList.add('author-profile-links');
  const label = links.previousElementSibling;
  if (label?.matches('p') && !label.querySelector('a')) {
    label.classList.add('author-profile-follow');
  }
  const anchors = [...links.querySelectorAll('a')];
  // the pipeline drops the space between icon links; in the source it is part of their distance
  links.replaceChildren(...anchors.flatMap((a, i) => (i ? [' ', a] : [a])));
  anchors.forEach((a) => {
    const name = [...(a.querySelector('.icon')?.classList ?? [])]
      .find((c) => c.startsWith('icon-'))?.slice(5);
    if (name) {
      a.title = TITLES[name] ?? name;
      a.setAttribute('aria-label', a.title);
    }
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
}
