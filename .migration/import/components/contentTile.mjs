// A news tile: one `content-tile` row. Cell 1 the image, or the video's thumbnail and link;
// cell 2 the date, the type, the title (a link when the tile has one) and the author.
import { escapeHtml } from '../lib/clean.mjs';

// the source's player of each Brightcove account (its playerBrightcove.js)
const PLAYERS = { 6024607096001: 'k9ROJJb3q', 6261315296001: 'jj9Z5xaG4z' };
const para = (html) => (html ? `<p>${html}</p>` : '');

function media(tile, ctx) {
  const video = tile.find('.cmp-video[data-video-id]').first();
  if (!video.length) return para(ctx.image(tile.find('.content-tile-img img').first()));
  ctx.drop(video.find('.modal-template'), 'video dialog: built by the block');
  const { attribs } = video[0];
  const href = ctx.video({
    attribs: { 'data-player-id': PLAYERS[attribs['data-video-lang']], ...attribs },
  });
  const poster = ctx.image(video.find('img.cmp-video__thumbnail-img').first());
  return para(poster) + para(`<a href="${href}">${href}</a>`);
}

export default function contentTile(el, ctx) {
  const tile = ctx.$(el).find('section.component-content-tile').first();
  if (!tile.length) return [];
  const text = (name) => escapeHtml(tile.find(`.content-tile-${name}`).first().text()
    .replace(/\s+/g, ' ')
    .trim());
  // the date is written twice, for the desktop and the mobile layout
  ctx.drop(tile.find('.content-tile-date-mobile'), 'second copy of the date');
  const href = ctx.link(tile.children('a').attr('href'));
  const title = text('title');
  const cell = [
    para(text('date-desktop')),
    para(text('type')),
    para(href ? `<a href="${href}">${title || escapeHtml(href)}</a>` : title),
    para(text('author')),
  ].join('');
  const variants = tile.hasClass('less-padding-10') ? ['tight'] : [];
  return ctx.block('content-tile', variants, [[media(tile, ctx), cell]], { merge: true });
}
