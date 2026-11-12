// A video with its play button: block `video`, `modal` when the source opens it in a dialog.
// The cell holds the authored thumbnail, when the source has one, and the link to the player.

// the source's player of each Brightcove account (its playerBrightcove.js)
const PLAYERS = {
  5748441669001: 'rka4xWwYG',
  6024607096001: 'k9ROJJb3q',
  6261315296001: 'jj9Z5xaG4z',
};

export default function video(el, ctx) {
  const player = ctx.$(el).find('.cmp-video[data-video-id]').first();
  if (!player.length) return [];
  const { attribs } = player[0];
  const href = ctx.video({
    attribs: { 'data-player-id': PLAYERS[attribs['data-video-lang']], ...attribs },
  });
  ctx.drop(player.find('.modal-template'), 'video dialog, built by the block');
  const poster = ctx.image(player.find('img.cmp-video__thumbnail-img').first());
  const cell = [poster && `<p>${poster}</p>`, `<p><a href="${href}">${href}</a></p>`];
  const variants = attribs['data-mode'] === 'modal' ? ['modal'] : [];
  return ctx.block('video', variants, [[cell.filter(Boolean).join('')]]);
}
