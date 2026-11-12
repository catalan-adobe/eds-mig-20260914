/*
 * Mosaic: the source's mosaic cards. One row per card: cell 1 the background colour (and the
 * heading colour of a `rich` card, and the card's link), or the media: an image, or a video
 * link with an optional thumbnail; cell 2 the text. The whole card is its link.
 */
import { decorateBlock, loadBlock } from '../../scripts/aem.js';

const VIDEO = /^https:\/\/(players\.brightcove\.net|(www\.)?youtube\.com|youtu\.be)\//;
const COLOUR = /#[0-9a-f]{3}(?:[0-9a-f]{3})?\b/gi;

function element(tag, className, ...children) {
  const el = document.createElement(tag);
  el.className = className;
  el.append(...children);
  return el;
}

/** Is a colour light enough that the source writes grey text on it? */
function isLight(colour) {
  const hex = colour.length === 4 ? colour.replace(/\w/g, '$&$&') : colour;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 200;
}

/** A video link as the `video` block, played in the modal. Returns its box and its load. */
function videoMedia(link, poster) {
  const cell = element('div', '', ...(poster ? [element('p', '', poster)] : []));
  cell.append(element('p', '', link));
  const video = element('div', 'video modal', element('div', '', cell));
  const box = element('div', 'mosaic-media mosaic-video', video);
  decorateBlock(video);
  return [box, loadBlock(video)];
}

/** Text links inside a linked card would nest anchors: they become their text. */
function unwrapLinks(body) {
  body.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
}

function colourCard(card, body) {
  const paragraphs = [...body.querySelectorAll(':scope > p')];
  const footer = paragraphs.length > 1 ? paragraphs.at(-1) : null;
  footer?.classList.add('mosaic-footer');
  paragraphs[0]?.classList.add('mosaic-headline');
  card.classList.add('mosaic-colour');
}

function decorateCard(row, block) {
  const [first, second] = row.children;
  const body = element('div', 'mosaic-body', ...(second?.childNodes ?? []));
  const link = first?.querySelector('a[href]');
  const picture = first?.querySelector('picture, img');
  const colours = first?.textContent.match(COLOUR) ?? [];
  const video = !colours.length && link && VIDEO.test(link.href) ? link : null;
  const href = (!video && link?.href) || body.querySelector('a[href]')?.href;
  const card = element(href ? 'a' : 'div', 'mosaic-card');
  if (href) {
    card.href = href;
    unwrapLinks(body);
  }
  const [background, heading] = colours;
  if (background) {
    card.style.backgroundColor = background;
    card.classList.add(isLight(background) ? 'on-light' : 'on-dark');
  }
  if (heading) card.style.setProperty('--mosaic-heading', heading);
  let loading;
  if (video) {
    const [box, load] = videoMedia(video, picture);
    card.append(box);
    loading = load;
  } else if (picture) card.append(element('div', 'mosaic-media', picture));
  if (video || picture) card.classList.add('mosaic-media-card');
  else if (!block.classList.contains('rich')) colourCard(card, body);
  card.append(body);
  row.replaceChildren(card);
  row.className = 'mosaic-item';
  return loading;
}

export default async function decorate(block) {
  await Promise.all([...block.children].map((row) => decorateCard(row, block)));
}
