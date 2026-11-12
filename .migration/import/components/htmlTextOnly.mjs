// Hand-written HTML, CSS and scripts. Classified in the order of CONTRACT.md b) "htmlTextOnly":
// JSON-LD goes to the page metadata; the chat widget, the scroll widgets, styles and scripts are
// not migrated; the purple promo box, the IP search box, the newsletter box, Brightcove
// playlists, Marketo forms and iframes become blocks; other visible HTML is default content.

// widgets drawn by the source's scripts: the chat bar, scroll-to-top, the scroll progress ring
const WIDGETS = '#chat-bar, .chat-bar, #floating-icon, .scroll-to-top, .pb, .pc';
// Eloqua forms post to a service that is not migrated (CONTRACT.md e)
const ELOQUA = 'form.elq-form, form[action*="eloqua.com"]';
const SILENT = 'script, style, link, noscript, meta';

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

/** The page metadata `json-ld`: the minified JSON of the box's ld+json scripts. */
function jsonLd(box, ctx) {
  const items = box.find('script[type="application/ld+json"]').toArray().map((s) => {
    const text = ctx.$(s).text();
    try {
      return JSON.stringify(JSON.parse(text));
    } catch {
      ctx.warn('JSON-LD that does not parse: kept with its spaces collapsed');
      return text.replace(/\s+/g, ' ').trim();
    }
  });
  if (items.length) ctx.meta('json-ld', escapeHtml(items.length > 1 ? `[${items}]` : items[0]));
}

/** `promo`: the purple box (`.pa`). Its image column is empty and hidden on every page. */
function promo(box, ctx) {
  const pa = box.find('.pa').first();
  ctx.drop(pa.find('.img-col'), 'empty image column the source hides');
  const button = pa.find('.component-button a').first();
  const href = ctx.link(button.attr('href'));
  const label = ctx.clean(button, { inline: true }).replace(/<a [^>]*>|<\/a>/g, '');
  const cell = [
    `<h2>${ctx.clean(pa.find('.pa-title'), { inline: true })}</h2>`,
    ctx.clean(pa.find('.pa-description')),
    href && label ? `<p><strong><a href="${href}">${label}</a></strong></p>` : '',
  ];
  return ctx.block('promo', [], [[cell.join('')]]);
}

/** `search-box`: placeholder, then the target the query is appended to. */
function searchBox(box, ctx) {
  const input = box.find('form[name=ipForm] input[type=text]').first();
  const target = box.find('script').text().match(/location\s*=\s*"([^"]+)"/)?.[1];
  const href = ctx.link(target ?? 'https://www.synopsys.com/dw/ipsearch.php?p=');
  if (!target) ctx.warn('IP search box without its script: the default target is written');
  const placeholder = escapeHtml(input.attr('placeholder') ?? '');
  return ctx.block('search-box', [], [[placeholder, `<a href="${href}">${href}</a>`]]);
}

/** `video playlist`: the Brightcove player of the playlist. */
function playlist(video, ctx) {
  const { 'data-account': account, 'data-player': player = 'default' } = video.attribs;
  const id = video.attribs['data-playlist-id'];
  const href = `https://players.brightcove.net/${account}/${player}_default/index.html?playlistId=${id}`;
  return ctx.block('video', ['playlist'], [[`<p><a href="${href}">${href}</a></p>`]]);
}

/** `embed`: each iframe, with its size when the source sets one. */
function embeds(frames, ctx) {
  return frames.map((frame) => {
    const src = escapeHtml(frame.attribs.src ?? '');
    const { width, height } = frame.attribs;
    const rows = [[`<a href="${src}">${src}</a>`]];
    if (width || height) rows.push([`${width || 300} x ${height || 150}`]);
    return ctx.block('embed', [], rows);
  });
}

/**
 * A card that is one link around an image and a text (logo walls, success stories): the image,
 * the title as the link, the description. A linked image would not survive in a block cell.
 */
function linkedCard(card, ctx) {
  const href = ctx.link(card.attr('href'));
  const img = card.find('img').first();
  const title = ctx.clean(card.find('.component-text .title').first(), { inline: true });
  const text = card.find('.component-text').children().not('.title');
  return [
    img.length && `<p>${ctx.image(img)}</p>`,
    title && (href ? `<p><a href="${href}">${title}</a></p>` : `<p>${title}</p>`),
    ctx.clean(text),
  ].filter(Boolean);
}

/** The block of a known shape, or null. */
function known(box, visible, ctx) {
  if (box.find('.pa').length) return promo(box, ctx);
  const card = visible.children('a').first();
  if (visible.children().length === 1 && card.children('.component-image').length) {
    return linkedCard(box.children('a').first(), ctx);
  }
  if (box.find('form[name=ipForm]').length) return searchBox(box, ctx);
  if (box.find('#extraInfo').length) {
    return ctx.block('promo', ['outline'], [[ctx.clean(box.find('#extraInfo'))]]);
  }
  const video = box.find('video[data-playlist-id]').get(0);
  if (video) return playlist(video, ctx);
  const form = box.find('form[id^="mktoForm_"]').attr('id');
  if (form) return ctx.block('form', [], [['form', form.slice('mktoForm_'.length)]]);
  const frames = visible.find('iframe[src]').toArray();
  const words = visible.clone().find('iframe').remove().end()
    .text()
    .trim();
  if (frames.length && !words) return embeds(frames, ctx);
  return null;
}

export default function htmlTextOnly(el, ctx) {
  const { $ } = ctx;
  const box = $(el).find('.html-text-only-component').first();
  jsonLd(box, ctx);
  const widgets = box.find(WIDGETS).filter((_, w) => !$(w).parents(WIDGETS).length);
  ctx.drop(widgets, 'chat or scroll widget of the source, not migrated');
  widgets.remove();
  ctx.drop(box.find(ELOQUA), 'Eloqua form, not migrated');
  box.find(ELOQUA).remove();
  const visible = box.clone();
  visible.find(SILENT).remove();
  const block = known(box, visible, ctx);
  if (block) return block;
  if (!visible.text().trim() && !visible.find('img, svg, iframe, video, table').length) return [];
  ctx.warn('one-off HTML written as default content');
  return ctx.fallback();
}
