import { createSlider } from '../../scripts/slider.js';

const KINDS = ['solution', 'agenda', 'event', 'quick'];
// a carousel of rows (the source's content carousel), and the options only it has
const ROWS = ['rows', 'no-mobile'];
const HEADING = 'h1, h2, h3, h4, h5, h6';
const BRIGHTCOVE = /^https:\/\/players\.brightcove\.net\/(\d+)\/([^/]+)\/.*[?&]videoId=(\w+)/;
const AGENDA = '.cards.agenda .cards-agenda';
// the source's clamp: title and text share five lines
const COPY_LINES = 5;

function element(tag, className, ...children) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.append(...children.filter(Boolean));
  return el;
}

function icon(name) {
  return element('span', `icon cards-icon-${name}`);
}

/** The link of a paragraph that holds nothing else. */
function soleLink(p) {
  const links = p?.tagName === 'P' ? p.querySelectorAll('a[href]') : [];
  return links.length === 1 && links[0].textContent.trim() === p.textContent.trim()
    ? links[0] : null;
}

/** A cell by position: the heading, what stands before and after it, and the closing link. */
function read(cell) {
  const parts = cell ? [...cell.children] : [];
  const at = parts.findIndex((part) => part.matches(HEADING));
  const after = parts.slice(at + 1);
  const link = soleLink(after.at(-1));
  return {
    heading: parts[at],
    before: at < 0 ? [] : parts.slice(0, at),
    action: link ? after.pop() : null,
    after,
    link,
  };
}

/** Runs `fn` when the block gets a width, when its width changes and when the fonts are in. */
function onLayout(block, fn) {
  let width = 0;
  new ResizeObserver(() => {
    if (block.offsetWidth === width) return;
    width = block.offsetWidth;
    fn();
  }).observe(block);
  document.fonts.ready.then(() => block.offsetWidth && fn());
}

/** The importer marks a link the source opens in a new tab with the hash `#_blank`. */
function openNewTabs(block) {
  block.querySelectorAll('a[href$="#_blank"]').forEach((a) => {
    a.href = a.getAttribute('href').replace(/#_blank$/, '');
    a.target = '_blank';
    a.rel = 'noopener';
  });
}

/** A click anywhere on the card follows its link, as the source's cards do. */
function linkCard(card, link) {
  if (link.hostname !== window.location.hostname) {
    link.target = '_blank';
    link.rel = 'noopener';
  }
  card.classList.add('cards-linked');
  card.addEventListener('click', (e) => {
    if (!e.target.closest('a, button')) link.click();
  });
}

const policyKeys = {};
/** The poster of a Brightcove video, read as its player does. */
async function brightcovePoster(account, name, id) {
  const base = `https://players.brightcove.net/${account}/${name}`;
  policyKeys[base] ??= fetch(`${base}/config.json`).then((response) => response.json())
    .then((config) => config.video_cloud.policy_key);
  const response = await fetch(
    `https://edge.api.brightcove.com/playback/v1/accounts/${account}/videos/${id}`,
    { headers: { Accept: `application/json;pk=${await policyKeys[base]}` } },
  );
  if (!response.ok) throw new Error(`Brightcove video ${id}: ${response.status}`);
  return (await response.json()).poster;
}

/** The thumbnail of a video card: a button that opens the player in the modal. */
function player(href, picture) {
  const button = element('button', 'cards-play', picture, icon('play'));
  button.type = 'button';
  button.setAttribute('aria-label', 'Play video');
  button.addEventListener('click', async () => {
    const { default: openModal } = await import('../../scripts/modal.js');
    const frame = element('iframe');
    frame.src = `${href}${href.includes('?') ? '&' : '?'}autoplay=true`;
    frame.allow = 'autoplay; fullscreen; encrypted-media';
    frame.title = 'Video player';
    openModal(frame);
  });
  const [, account, name, id] = href.match(BRIGHTCOVE) ?? [];
  if (picture || !id) return button;
  brightcovePoster(account, name, id).then((src) => {
    const img = element('img');
    img.alt = '';
    img.src = src;
    button.prepend(img);
    // eslint-disable-next-line no-console
  }).catch((e) => console.warn(`cards: no poster. ${e.message}`));
  return button;
}

/** Cell 1: an image, or a video thumbnail when the cell holds a link. */
function media(cell) {
  const picture = cell?.querySelector('picture, img');
  const video = cell?.querySelector('a[href]');
  if (!picture && !video) return null;
  return element('div', 'cards-media', video ? player(video.href, picture) : picture);
}

function assetCard([first, second]) {
  const body = second ?? first;
  const {
    heading, before, after, action, link,
  } = read(body);
  const visual = second && media(first);
  const [label, date] = before;
  label?.classList.add('cards-label');
  date?.classList.add('cards-date');
  heading?.classList.add('cards-title');
  after.forEach((p) => p.classList.add('cards-text'));
  action?.classList.add('cards-action');
  const card = element(
    'div',
    'cards-card',
    visual,
    element(
      'div',
      'cards-body',
      element('div', 'cards-meta', ...before),
      element('div', 'cards-copy', heading, ...after),
      action,
    ),
  );
  if (!link) return card;
  // a link without a label: the title carries it
  if ([link.href, link.getAttribute('href')].includes(link.textContent.trim()) && heading) {
    link.replaceChildren(...heading.childNodes);
    heading.append(link);
    action.remove();
  }
  if (!visual?.querySelector('.cards-play')) linkCard(card, link);
  return card;
}

function solutionCard([first, second]) {
  const { heading, after, link } = read(second ?? first);
  // without a link the label is a paragraph that ends with the arrow
  const label = link ?? (after.at(-1)?.lastElementChild?.matches('.icon') ? after.pop() : null);
  const title = heading ?? element('h4');
  title.classList.add('cards-title');
  after.forEach((p) => p.classList.add('cards-text'));
  const button = label && element('span', 'cards-button', ...label.childNodes);
  const cover = link ?? element('div');
  cover.className = 'cards-cover';
  cover.replaceChildren(
    element('div', 'cards-hover', title, ...after, button),
    element('div', 'cards-shade'),
    element('div', 'cards-image', second && first.querySelector('picture, img')),
  );
  if (link && link.hostname !== window.location.hostname) {
    link.target = '_blank';
    link.rel = 'noopener';
  }
  return element('div', 'cards-card', cover);
}

function eventCard([first, second]) {
  const {
    heading, after, action, link,
  } = read(second ?? first);
  heading?.classList.add('cards-title');
  action?.classList.add('cards-action');
  const card = element(
    'div',
    'cards-card',
    second && media(first),
    element('div', 'cards-body', heading, element('div', 'cards-details', ...after), action),
  );
  if (link) linkCard(card, link);
  return card;
}

function quickCard([first, second]) {
  const parts = [...(second ?? first).children];
  // a title alone is the heading of the source's quick-task list: no card around it
  if (parts.length === 1 && parts[0].tagName === 'H2') {
    return element('div', 'cards-caption', parts[0]);
  }
  const [title, heading] = parts.filter((part) => part.matches(HEADING) && part.tagName !== 'H5');
  title?.classList.add('cards-title');
  heading?.classList.add('cards-heading');
  const body = element('div', 'cards-body', ...parts);
  return element('div', 'cards-card', second && media(first), body);
}

function toggle(label, direction) {
  const button = element('button', 'cards-toggle', `${label} `, icon(`chevron-${direction}`));
  button.type = 'button';
  return button;
}

/** One height for the agenda cards of neighbouring sections, as the source's container has. */
function levelAgenda(block) {
  const top = block.closest('main > *') ?? block;
  const run = [top];
  const holds = (node) => node?.querySelector(AGENDA);
  for (let n = top.previousElementSibling; holds(n); n = n.previousElementSibling) run.unshift(n);
  for (let n = top.nextElementSibling; holds(n); n = n.nextElementSibling) run.push(n);
  const cards = run.flatMap((node) => [...node.querySelectorAll(AGENDA)]);
  const closed = cards.filter((card) => !card.closest('.cards-open'));
  const items = cards.map((card) => card.closest('.cards-item'));
  items.forEach((item) => item.style.removeProperty('--agenda-height'));
  closed.forEach((card) => {
    const title = card.querySelector('.cards-title');
    const more = card.querySelector('.cards-more');
    const extra = more.querySelector('.cards-description').children.length > 1
      || card.querySelectorAll('.cards-speakers li').length > 1;
    more.firstElementChild.hidden = !extra && title?.scrollHeight <= title?.clientHeight;
  });
  const height = Math.max(...closed.map((card) => card.getBoundingClientRect().height));
  items.forEach((item) => item.style.setProperty('--agenda-height', `${height}px`));
}

function agendaCard([time, details, colour]) {
  const { heading, before, after } = read(details);
  const filled = time?.textContent.trim() ? time : null;
  const [date, hours] = filled?.children.length ? [...filled.children] : [filled];
  if (hours) date.prepend(icon('clock'));
  date?.classList.add(hours ? 'cards-date' : 'cards-undated');
  hours?.classList.add('cards-hours');
  heading?.classList.add('cards-title');
  const speakers = after[0]?.matches('ul, ol') ? after.shift() : null;
  speakers?.querySelectorAll('li').forEach((li) => {
    const [name, ...rest] = li.textContent.split(',');
    const company = rest.length && element('span', '', rest.join(','));
    li.replaceChildren(element('span', 'cards-speaker', rest.length ? `${name},` : name, company));
  });
  const more = toggle('Read More', 'down');
  const less = toggle('Read Less', 'up');
  const description = element('div', 'cards-description', ...after, less);
  description.hidden = true;
  const line = element('div', 'cards-line');
  const name = colour?.textContent.trim().toLowerCase().replace(/[^a-z]+/g, '-');
  if (name) line.classList.add(`cards-line-${name}`);
  before[0]?.classList.add('cards-type');
  const card = element(
    'div',
    'cards-card',
    before[0],
    line,
    element(
      'div',
      'cards-agenda',
      element('div', 'cards-time', date, hours),
      element(
        'div',
        'cards-details',
        heading,
        element('div', 'cards-speakers', speakers),
        element('div', 'cards-more', more, description),
      ),
    ),
  );
  const open = (state) => {
    card.classList.toggle('cards-open', state);
    more.hidden = state;
    description.hidden = !state;
    (state ? less : more).focus();
  };
  more.addEventListener('click', () => open(true));
  less.addEventListener('click', () => open(false));
  return card;
}

/** Title and text share five lines: the text gets what the title leaves. */
function clampCopy(block) {
  block.querySelectorAll('.cards-copy').forEach((copy) => {
    const title = copy.querySelector('.cards-title');
    const text = copy.querySelector('.cards-text');
    if (!title || !text) return;
    const lines = Math.floor(title.scrollHeight / parseFloat(getComputedStyle(title).lineHeight));
    text.hidden = lines >= COPY_LINES;
    text.style.setProperty('--lines', COPY_LINES - lines);
  });
}

const BUILD = {
  asset: assetCard, solution: solutionCard, agenda: agendaCard, event: eventCard, quick: quickCard,
};

/** The slides of a content carousel: one row of cards each, laid out as a block without it. */
function rowSlides(block, list, perRow, autoplay) {
  const items = [...list.children];
  const track = element('div', 'cards-slides');
  for (let i = 0; i < items.length; i += perRow) {
    track.append(element('ul', 'cards-list', ...items.slice(i, i + perRow)));
  }
  list.replaceWith(track);
  const wide = window.matchMedia('(width >= 730px)');
  let slider = null;
  const update = () => {
    if (wide.matches || !block.classList.contains('no-mobile')) {
      slider ??= createSlider(track, { autoplay });
    } else {
      slider?.destroy();
      slider = null;
    }
  };
  wide.addEventListener('change', update);
  update();
}

function slide(block, list, cols) {
  // the block `carousel` styles `.carousel …`: its rules must not reach this variant
  block.classList.replace('carousel', 'cards-sliding');
  const seconds = block.className.match(/\bautoplay(?:-(\d+))?\b/);
  if (seconds || ROWS.some((name) => block.classList.contains(name))) {
    block.classList.add('cards-rows');
    rowSlides(block, list, cols || 3, seconds ? Number(seconds[1] ?? 6) * 1000 : 0);
    return;
  }
  // the source's slick: all columns from 728 px, two from 600 px, one below
  createSlider(list, { perView: { 0: 1, 600: Math.min(cols || 3, 2), 728: cols || 3 } });
  // the source's slick is not draggable: a mouse drag must not reach the slider's swipe
  block.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') e.stopPropagation();
  }, true);
  block.classList.toggle('cards-many', list.children.length > 9);
}

export default function decorate(block) {
  const kind = KINDS.find((name) => block.classList.contains(name)) ?? 'asset';
  const sliding = block.classList.contains('carousel');
  const cols = Number(block.className.match(/\bcols-([1-4])\b/)?.[1] ?? 0);
  const list = element('ul', 'cards-list');
  openNewTabs(block);
  [...block.children].filter((row) => row.textContent.trim() || row.querySelector('img'))
    .forEach((row) => {
      list.append(element('li', 'cards-item', BUILD[kind]([...row.children])));
    });
  block.replaceChildren(list);
  // a cell of the source's row that has no card
  list.style.setProperty('--empty-cells', Math.max(0, cols - list.children.length));
  block.classList.toggle('cards-captions', !list.querySelector('.cards-card'));
  if (sliding) slide(block, list, cols);
  if (kind === 'asset') onLayout(block, () => clampCopy(block));
  if (kind === 'agenda') {
    // a card in a column of 3, 4 or 6 twelfths stacks its time over its details
    const width = Number(block.closest('.section-col')?.className.match(/\bspan-([346])\b/)?.[1]
      ?? 12 / (cols || 1));
    block.classList.toggle('cards-stacked', width < 12);
    block.classList.toggle('cards-halves', width === 6);
    onLayout(block, () => levelAgenda(block));
  }
}
