import { decorateIcons } from '../../scripts/aem.js';

const enc = encodeURIComponent;
// the share URLs and the popup are the source's (its social share script)
const NETWORKS = {
  'x-twitter': {
    label: 'X',
    url: (page, title) => `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(page)}`,
  },
  'linkedin-in': {
    label: 'LinkedIn',
    url: (page, title) => 'https://www.linkedin.com/shareArticle?mini=true'
      + `&url=${enc(page)}&title=${enc(title)}`,
  },
  facebook: {
    label: 'Facebook',
    url: (page, title) => 'https://www.facebook.com/sharer.php?s=100'
      + `&p[title]=${enc(title)}&p[url]=${enc(page)}`,
  },
};
const POPUP = '_blank, width=500, height=500, resizable=yes, scrollbars=yes';

/**
 * Share links for the page. Row 1: the networks, by icon name. Row 2 (optional): the title to
 * share when it is not the page's h1.
 * @param {Element} block
 */
export default function decorate(block) {
  const [names, shared] = [...block.children].map((row) => row.textContent.trim());
  const page = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
  const title = shared || document.querySelector('main h1')?.textContent.trim() || document.title;
  const links = (names ?? '').split(',').map((name) => name.trim().replace(/^:|:$/g, ''))
    .filter((name) => NETWORKS[name])
    .map((name) => {
      const a = document.createElement('a');
      a.href = NETWORKS[name].url(page, title);
      a.target = '_blank';
      a.rel = 'noreferrer noopener';
      a.setAttribute('aria-label', `Share on ${NETWORKS[name].label}`);
      const icon = document.createElement('span');
      icon.className = `icon icon-${name}`;
      a.append(icon);
      a.addEventListener('click', (event) => {
        event.preventDefault();
        window.open(a.href, '', POPUP);
      });
      return a;
    });
  // a space between the links, as in the source's markup: it is part of their distance
  block.replaceChildren(...links.flatMap((a, i) => (i ? [' ', a] : [a])));
  decorateIcons(block);
  block.querySelectorAll('.icon > img').forEach((img) => {
    img.parentElement.style.setProperty('--icon', `url("${img.src}")`);
  });
}
