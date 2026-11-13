import { createSlider } from '../../scripts/slider.js';
import openModal from '../../scripts/modal.js';
import { languageRoot, siteRoot } from '../../scripts/site.js';

const HEADING = 'h1, h2, h3, h4, h5, h6';
const KINDS = ['post', 'featured', 'logos', 'news'];
const BRIGHTCOVE = /^https:\/\/players\.brightcove\.net\/(\d+)\/(\w+)\/index\.html\?videoId=(\w+)/;

function element(tag, className, ...children) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.append(...children.filter(Boolean));
  return el;
}

const isEmpty = (cell) => !cell?.textContent.trim() && !cell?.querySelector('img');
const isLinkOnly = (p) => p?.matches('p') && p.children.length === 1
  && p.firstElementChild.matches('a[href]')
  && p.textContent.trim() === p.firstElementChild.textContent.trim();
const pathOf = (link) => new URL(link.href, window.location.href).pathname;

// the author page shows this placeholder when an author has no photo; a post shows the initials
const PLACEHOLDER = /\/generic-headshot\b/;

/** The author photos of the language's index, by author page path; empty when there is none. */
let authorPhotos;
function loadAuthorPhotos() {
  authorPhotos ??= fetch(`${languageRoot()}/data/index.json?sheet=authors&limit=1000`)
    .then((response) => (response.ok ? response.json() : { data: [] }))
    .then(({ data = [] }) => new Map(data.filter((row) => row.image && !PLACEHOLDER.test(row.image))
      .map((row) => [siteRoot() + row.path, siteRoot() + row.image])))
    .catch(() => new Map());
  return authorPhotos;
}

/** A click anywhere on the card follows its link, as the source's cards do. */
function linkItem(item, link) {
  if (!link) return;
  item.classList.add('linked');
  item.addEventListener('click', (e) => {
    if (!e.target.closest('a, button')) link.click();
  });
}

const policyKeys = {};
/** The poster of a Brightcove video, read as its player does. */
async function brightcovePoster(account, player, id) {
  const base = `https://players.brightcove.net/${account}/${player}`;
  policyKeys[base] ??= fetch(`${base}/config.json`).then((response) => response.json())
    .then((config) => config.video_cloud.policy_key);
  const response = await fetch(
    `https://edge.api.brightcove.com/playback/v1/accounts/${account}/videos/${id}`,
    { headers: { Accept: `application/json;pk=${await policyKeys[base]}` } },
  );
  if (!response.ok) throw new Error(`Brightcove video ${id}: ${response.status}`);
  return (await response.json()).poster;
}

/** The player page of a video link: Brightcove with autoplay, YouTube as its embed. */
function playerUrl(href) {
  const url = new URL(href);
  const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
  if (/youtu/.test(url.hostname) && id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
  url.searchParams.set('autoplay', 'true');
  return url.href;
}

/** An image, or a video thumbnail with a play button that opens the player in the modal. */
function media(cell) {
  const picture = cell?.querySelector('picture, img');
  const video = cell?.querySelector('a[href]');
  if (!picture && !video) return null;
  const box = element('div', 'teasers-media', picture);
  if (!video) return box;
  const play = element('button', 'teasers-play');
  play.type = 'button';
  play.setAttribute('aria-label', 'Play video');
  play.addEventListener('click', () => {
    const frame = element('iframe');
    frame.src = playerUrl(video.href);
    frame.allow = 'autoplay; encrypted-media; fullscreen';
    frame.title = 'Video player';
    openModal(frame);
  });
  box.classList.add('video');
  box.append(play);
  const [, account, player, id] = video.href.match(BRIGHTCOVE) ?? [];
  if (picture || !id) return box;
  // without an authored thumbnail the source shows the poster of the Brightcove player
  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    brightcovePoster(account, player, id).then((src) => {
      const img = element('img');
      img.alt = '';
      img.src = src;
      box.prepend(img);
      // eslint-disable-next-line no-console
    }).catch((e) => console.warn(`teasers: no poster. ${e.message}`));
  }, { rootMargin: '300px' }).observe(box);
  return box;
}

/** A flag card: flag, image or video, then title, text and link. */
function flagCard(cells) {
  const text = cells.at(-1);
  const flag = cells.length > 1 && !isEmpty(cells[0]) ? cells[0] : null;
  const item = element('div', 'teasers-card', media(cells.length > 2 ? cells[1] : null));
  if (flag) {
    flag.className = 'teasers-flag';
    item.prepend(flag);
  }
  if (text) {
    text.className = 'teasers-text';
    const action = [...text.children].at(-1);
    if (isLinkOnly(action)) action.className = 'teasers-cta';
    // h4 is the source's smaller title: smaller letters on the lines of the normal size
    const small = text.querySelector('h4');
    if (small) small.replaceChildren(element('span', '', ...small.childNodes));
    item.append(text);
    linkItem(item, [...text.querySelectorAll('a[href]')].at(-1));
  }
  return item;
}

/** The authors of a line ("By A, B"): their names, each with its link when it has one. */
function authorsOf(line) {
  const links = [...line.querySelectorAll('a[href]')];
  const copy = line.cloneNode(true);
  copy.querySelectorAll('a[href]').forEach((a, i) => a.replaceWith(`\uE000${i}`));
  // the first word of the line is its label: "By", "Featuring"
  const names = copy.textContent.trim().replace(/^[^\s\uE000]+\s*/, '').split(',');
  return names.map((part) => part.trim()).filter(Boolean).slice(0, 3).map((part) => {
    const link = links[part.match(/\uE000(\d+)/)?.[1]];
    return { name: link ? link.textContent.trim() : part, link };
  });
}

/** The circle of author photos; an author with a page and no photo shows the initials. */
function avatars(line) {
  const authors = authorsOf(line);
  if (!authors.length) return null;
  const circle = element('div', `teasers-avatars ${['one', 'two', 'three'][authors.length - 1]}`);
  authors.forEach(({ name, link }) => {
    const words = name.split(/\s+/);
    const initials = link ? `${words[0][0]}${words.length > 1 ? words.at(-1)[0] : ''}` : '';
    const slot = element('div', '', element('span', '', initials.toUpperCase()));
    circle.append(slot);
    if (!link) return;
    loadAuthorPhotos().then((photos) => {
      const src = photos.get(pathOf(link));
      if (!src) return;
      const img = element('img');
      img.src = src;
      img.alt = name;
      img.loading = 'lazy';
      slot.replaceChildren(img);
    });
  });
  return circle;
}

/** A post: linked image, then label and date, the linked title, authors, tags and the link. */
function post(cells) {
  const text = cells.at(-1);
  const item = element('div', 'teasers-card');
  if (!text) return item;
  const heading = text.querySelector(HEADING);
  const link = heading?.querySelector('a[href]');
  const parts = [...text.children];
  const before = heading ? parts.slice(0, parts.indexOf(heading)) : [];
  const after = heading ? parts.slice(parts.indexOf(heading) + 1) : parts;
  const label = before.find((p) => p.querySelector('strong'));
  const date = before.find((p) => p !== label);
  const action = isLinkOnly(after.at(-1)) ? after.pop() : null;
  const tags = after.find((p) => p.querySelector('a[href*="tag="]')) ?? after[1];
  const authors = after.find((p) => p !== tags);

  const picture = cells.length > 1 ? cells[0].querySelector('picture, img') : null;
  if (picture) {
    const frame = link ? element('a', '', picture) : picture;
    if (link) frame.href = link.href;
    item.append(element('div', 'teasers-media', frame));
  } else item.classList.add('no-image');

  if (label) label.className = 'teasers-label';
  if (date) date.className = 'teasers-date';
  if (heading) heading.className = 'teasers-heading';
  if (authors) authors.className = 'teasers-authors-names';
  if (tags) {
    tags.className = 'teasers-tags';
    const [first] = tags.childNodes;
    if (first?.nodeType === Node.TEXT_NODE) first.replaceWith(element('strong', '', first.data));
  }
  if (action) action.className = 'teasers-cta';
  text.className = 'teasers-text';
  text.replaceChildren(...[
    element('div', 'teasers-meta', label, date),
    heading,
    element('div', 'teasers-authors', authors && avatars(authors), authors),
    tags,
    action,
  ].filter(Boolean));
  item.append(text);
  linkItem(item, link);
  return item;
}

/** A logo: the image in a frame, then its link and text; the whole item is the link. */
function logo(cells) {
  const text = cells.at(-1);
  const picture = cells.length > 1 ? cells[0].querySelector('picture, img') : null;
  const frame = picture && element('div', 'teasers-media', picture);
  const item = element('div', 'teasers-card', frame);
  if (!text) return item;
  text.className = 'teasers-text';
  const link = text.querySelector('a[href]');
  // the name is the first paragraph; a bare link gets one
  if (link?.parentElement === text) {
    const name = element('p');
    link.replaceWith(name);
    name.append(link);
  }
  text.firstElementChild?.classList.add('teasers-name');
  item.append(text);
  linkItem(item, link);
  return item;
}

/** A press release: the linked title, then its date. */
function news(cells) {
  const text = cells[0];
  text.className = 'teasers-text';
  const item = element('div', 'teasers-card', text);
  linkItem(item, text.querySelector('a[href]'));
  return item;
}

const BUILD = {
  post, featured: post, logos: logo, news,
};

/**
 * The spacing of the source's featured posts: the large one sets the "/" of its date apart,
 * the others have a space before each comma of their tags.
 */
function spaceFeatured(item) {
  if (item.matches('.large')) {
    const date = item.querySelector('.teasers-date');
    const [day, time] = date?.textContent.split(' / ') ?? [];
    if (time) date.replaceChildren(`${day} `, element('span', 'teasers-slash', '/'), ` ${time}`);
    return;
  }
  item.querySelectorAll('.teasers-tags').forEach((tags) => [...tags.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE && node.data.trim() === ',')
    .forEach((comma) => { comma.data = ' , '; }));
}

/** `limit-N`: never the post of the current page; then at most N posts. */
function applyLimit(block, items) {
  const limit = Number([...block.classList].find((c) => /^limit-\d+$/.test(c))?.slice(6));
  if (!limit) return items;
  const own = (item) => [...item.querySelectorAll(`${HEADING} a[href]`)]
    .some((a) => pathOf(a) === window.location.pathname);
  return items.filter((item) => !own(item)).slice(0, limit);
}

/** As slick: a drag never starts a native image or link drag, and never ends in a click. */
function dragOnly(viewport) {
  let startX = 0;
  viewport.addEventListener('dragstart', (e) => e.preventDefault());
  viewport.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  viewport.addEventListener('click', (e) => {
    if (!e.detail || Math.abs(e.clientX - startX) < 10) return;
    e.preventDefault();
    e.stopPropagation();
  }, true);
}

/** The importer marks a link the source opens in a new tab with the hash `#_blank`. */
function openNewTabs(block) {
  block.querySelectorAll('a[href$="#_blank"]').forEach((a) => {
    a.href = a.getAttribute('href').replace(/#_blank$/, '');
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
}

export default function decorate(block) {
  openNewTabs(block);
  const kind = KINDS.find((k) => block.classList.contains(k));
  const columns = Number([...block.classList].find((c) => /^cols-\d$/.test(c))?.slice(5)) || 0;
  const rows = [...block.children].map((row) => [...row.children]);
  // a row that holds only a heading is the title of the list
  const isTitle = (cells) => cells.length === 1 && cells[0].children.length === 1
    && cells[0].firstElementChild.matches(HEADING);
  const title = rows.find(isTitle)?.[0].firstElementChild;
  const cards = applyLimit(block, rows.filter((cells) => cells.length && !isTitle(cells))
    .map((cells) => (BUILD[kind] ?? flagCard)(cells)));
  const list = element('ul', 'teasers-list', ...cards.map((c) => element('li', 'teasers-item', c)));
  // without a column count the first featured post is the large banner
  if (kind === 'featured' && !columns) list.firstElementChild?.classList.add('large');
  if (kind === 'featured') [...list.children].forEach(spaceFeatured);
  if (title) title.className = 'teasers-title';
  block.replaceChildren(...[title, list].filter(Boolean));
  if (!block.classList.contains('carousel') || cards.length < 2) return;
  if (kind === 'post') {
    // the source's carousel is endless: below 730 px the card before the first one and the
    // card after the last one show at the edges
    const ghost = (card) => {
      const copy = card.cloneNode(true);
      copy.classList.add('ghost');
      copy.inert = true;
      copy.setAttribute('aria-hidden', 'true');
      return copy;
    };
    list.firstElementChild.append(ghost(cards.at(-1)));
    list.lastElementChild.append(ghost(cards[0]));
  }
  createSlider(list, { perView: { 0: 1, 730: columns || 1 } });
  dragOnly(list.parentElement);
}
