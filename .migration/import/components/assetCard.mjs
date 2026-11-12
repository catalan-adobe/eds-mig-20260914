// A flag card (component-card-b): one `teasers` row. Cell 1 is the flag, cell 2 the image or
// the video, cell 3 the title, the text and the link. `h4` is the source's smaller title size
// (text-size-smaller), `h3` its normal size.
const para = (html) => (html ? `<p>${html}</p>` : '');
// the source's player script picks the Brightcove player by account; the importer's video link
// names the English one for every account
const PLAYERS = { 6024607096001: 'k9ROJJb3q', 6261315296001: 'jj9Z5xaG4z' };

/** Cell 2: the image, or the video thumbnail and the video link. */
function media(card, ctx) {
  const video = card.children('.cmp-video').first();
  if (!video.length) return ctx.image(card.find('.image-wrapper img').first());
  ctx.drop(video.find('.modal-template'), 'video dialog: built by the block');
  const href = ctx.video(video).replace(
    /(brightcove\.net\/(\d+)\/)rka4xWwYG(?=_default)/,
    (all, base, account) => base + (PLAYERS[account] ?? 'rka4xWwYG'),
  );
  return [para(ctx.image(video.find('img').first())), para(`<a href="${href}">${href}</a>`)];
}

export default function assetCard(el, ctx) {
  const card = ctx.$(el).children('.component-card-b').first();
  if (!card.length) return [];
  const body = card.children('.card-text').first();
  const heading = body.children('.heading').first();
  const level = heading.find('.text-size-smaller').length ? 'h4' : 'h3';
  const action = ctx.clean(body.children('a'), { inline: true }).trim();
  const href = ctx.link(card.attr('data-link'));
  let title = ctx.clean(heading, { inline: true });
  // a card without a visible link is still a link as a whole: the title carries it
  if (title && href && !/<a /.test(action)) title = `<a href="${href}">${title}</a>`;
  const text = [
    title && `<${level}>${title}</${level}>`,
    ...body.children('p').toArray().map((p) => para(ctx.clean(p, { inline: true }))),
    para(action),
  ];
  const flag = ctx.clean(card.find('.flag .text').first(), { inline: true });
  return ctx.block('teasers', [], [[flag, media(card, ctx), text.filter(Boolean)]], {
    merge: true,
  });
}
