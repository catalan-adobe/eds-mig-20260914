/**
 * Hero: row 1 background image, row 2 content (tag, h1, lead, buttons or byline).
 * A picture paragraph after the heading starts the byline: avatar, name, meta.
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  const [mediaRow, contentRow] = block.children;
  mediaRow.className = 'hero-bg';
  contentRow.className = 'hero-content';
  const inner = contentRow.firstElementChild;
  inner.className = 'hero-inner';

  const avatarP = [...inner.children].find((el) => el.matches('p') && el.querySelector('picture, img'));
  if (!avatarP) return;
  const byline = document.createElement('div');
  byline.className = 'article-byline';
  avatarP.before(byline);
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  const who = document.createElement('div');
  who.className = 'article-byline-text';
  let next = avatarP.nextElementSibling;
  while (next?.matches('p')) {
    const after = next.nextElementSibling;
    who.append(next);
    next = after;
  }
  avatar.append(avatarP);
  byline.append(avatar, who);
}
