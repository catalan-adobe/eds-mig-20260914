import { createOptimizedPicture } from '../../scripts/aem.js';

const GLYPHS = ['facebook', 'twitter', 'instagram'];

function buildImage(cell, size) {
  const img = cell?.querySelector('img');
  if (!img) return null;
  const image = document.createElement('div');
  image.className = 'contributor-image';
  image.append(createOptimizedPicture(img.src, img.alt, false, [{ width: `${size * 2}` }]));
  return image;
}

function buildSocial(list) {
  const social = document.createElement('ul');
  social.className = 'contributor-social';
  list.querySelectorAll('li a').forEach((link) => {
    const text = link.textContent.trim();
    const glyph = GLYPHS.find((name) => text.toLowerCase().includes(name));
    link.setAttribute('aria-label', link.title || text);
    link.removeAttribute('title');
    link.className = glyph ? `contributor-social-${glyph}` : '';
    link.textContent = '';
    const item = document.createElement('li');
    item.append(link);
    social.append(item);
  });
  return social;
}

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
  const textCell = cells.find((cell) => cell !== imageCell);
  const name = textCell?.querySelector('h1, h2, h3, h4, h5, h6');
  const roles = textCell?.querySelector('p');
  const list = textCell?.querySelector('ul');

  const info = document.createElement('div');
  info.className = 'contributor-info';
  const image = buildImage(imageCell, block.classList.contains('byline') ? 60 : 164);
  if (image) info.append(image);
  if (name) {
    name.className = 'contributor-name';
    info.append(name);
  }
  if (roles) {
    roles.className = 'contributor-roles';
    info.append(roles);
  }

  block.replaceChildren(info);
  if (list) block.append(buildSocial(list));
}
