// A mosaic card of a video or an image: one `mosaic` row. Cell 1 the image, or the video's
// thumbnail and its link; cell 2 the caption, a link when the card has one.
import { escapeHtml } from '../lib/clean.mjs';

// the source's player of each Brightcove account (its playerBrightcove.js)
const PLAYERS = { 6024607096001: 'k9ROJJb3q', 6261315296001: 'jj9Z5xaG4z' };

function media(card, ctx) {
  const video = card.find('.cmp-video[data-video-id]').first();
  if (!video.length) {
    const image = ctx.image(card.find('.card-img img, .cmp-image img').first());
    return image && `<p>${image}</p>`;
  }
  ctx.drop(video.find('.modal-template'), 'video dialog: built by the block');
  const { attribs } = video[0];
  const href = ctx.video({
    attribs: { 'data-player-id': PLAYERS[attribs['data-video-lang']], ...attribs },
  });
  const poster = ctx.image(video.find('img.cmp-video__thumbnail-img').first());
  return `${poster ? `<p>${poster}</p>` : ''}<p><a href="${href}">${href}</a></p>`;
}

export default function mosaicCardVideoImage(el, ctx) {
  const card = ctx.$(el).find('.component-mosaicCardVideoImage').first();
  if (!card.length) return [];
  const caption = escapeHtml(card.children('.component-text').text().replace(/\s+/g, ' ').trim());
  const video = card.find('.cmp-video[data-video-id]').length;
  const href = !video && ctx.link(card.attr('data-link'));
  const text = href ? `<a href="${href}">${caption || escapeHtml(href)}</a>` : caption;
  return ctx.block('mosaic', [], [[media(card, ctx), text && `<p>${text}</p>`]], { merge: true });
}
