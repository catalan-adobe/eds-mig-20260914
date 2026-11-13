/*
 * Content tile: the source's news tile. One row per tile: cell 1 the image, or a video link
 * with an optional thumbnail; cell 2 paragraphs: the date, the type, the title (a link when
 * the tile has one) and the author. The whole tile is its link. A video tile plays in the
 * modal. From 730 the date sits under the image, below 730 beside the type.
 */
import { decorateBlock, loadBlock } from '../../scripts/aem.js';

const VIDEO = /^https:\/\/(players\.brightcove\.net|(www\.)?youtube\.com|youtu\.be)\//;

function element(tag, className, ...children) {
  const el = document.createElement(tag);
  el.className = className;
  el.append(...children);
  return el;
}

/** The parts of the text cell: the title is the linked paragraph, else the last one. */
function parts(cell) {
  const paragraphs = [...(cell?.querySelectorAll(':scope > p') ?? [])];
  const linked = paragraphs.findIndex((p) => p.querySelector('a[href]'));
  const at = linked >= 0 ? linked : paragraphs.length - 1;
  const before = paragraphs.slice(0, Math.max(at, 0));
  const isDate = (p) => /\d/.test(p.textContent);
  return {
    date: before.find(isDate)?.textContent.trim() ?? '',
    type: before.find((p) => !isDate(p))?.textContent.trim() ?? '',
    title: paragraphs[at],
    author: paragraphs.slice(at + 1).map((p) => p.textContent.trim()).join(' '),
  };
}

/** A video link as the `video` block, played in the modal. Returns its box and its load. */
function videoMedia(link, poster) {
  const cell = element('div', '', ...(poster ? [element('p', '', poster)] : []));
  cell.append(element('p', '', link));
  const video = element('div', 'video modal', element('div', '', cell));
  const box = element('div', 'content-tile-media content-tile-video', video);
  decorateBlock(video);
  return [box, loadBlock(video)];
}

function decorateTile(row) {
  const [first, second] = row.children;
  const {
    date, type, title, author,
  } = parts(second);
  const link = first?.querySelector('a[href]');
  const picture = first?.querySelector('picture, img');
  const video = link && VIDEO.test(link.href) ? link : null;
  const href = title?.querySelector('a[href]')?.href;
  let media = element('div', 'content-tile-media', ...(picture ? [picture] : []));
  let loading;
  if (video) [media, loading] = videoMedia(video, picture);
  const right = element(
    'div',
    'content-tile-right',
    element(
      'div',
      'content-tile-type-row',
      element('div', 'content-tile-date-mobile', date),
      element('div', 'content-tile-type', type),
    ),
    element('div', 'content-tile-title', title?.textContent.trim() ?? ''),
  );
  if (author) right.append(element('div', 'content-tile-author', author));
  const desktopDate = element('div', 'content-tile-date', date);
  const left = element('div', 'content-tile-left', media, desktopDate);
  const container = element('div', 'content-tile-container', left, right);
  row.className = 'content-tile-item';
  if (href) {
    const inner = element('a', 'content-tile-link', container);
    inner.href = href;
    row.replaceChildren(inner);
  } else row.replaceChildren(container);
  return loading;
}

export default async function decorate(block) {
  await Promise.all([...block.children].map(decorateTile));
}
