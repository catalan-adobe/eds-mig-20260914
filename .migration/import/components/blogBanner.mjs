// The header of an article (block article-hero), and the landing and featured banners of the
// listing pages: one row of `teasers featured` each.
const GRADIENT = {
  'purple-purple-gradient': 'purple',
  'purple-blue-gradient': 'purple-blue',
  'blue-blue-gradient': 'blue',
};
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const words = (node) => escape(node.text().replace(/\s+/g, ' ').trim());
const para = (html) => (html ? `<p>${html}</p>` : '');

function article(box, ctx) {
  const banner = box.find('.blog-banner').first();
  const gradient = (banner.attr('class') ?? '').split(/\s+/).find((c) => c.endsWith('-gradient'));
  if (gradient && !GRADIENT[gradient]) ctx.warn(`gradient ${gradient} is not migrated`);
  const title = ctx.clean(box.find('.title').first(), { inline: true });
  const authors = box.find('.authors').first();
  const readTime = words(box.find('.read-time').first());
  ctx.meta('publication-date', box.attr('data-blog-publish-date') ?? '');
  ctx.meta('authors', escape((box.attr('data-blog-authors') ?? '').split(',')
    .map((a) => a.trim()).filter(Boolean).join(', ')));
  ctx.meta('read-time', readTime);
  const cell = [
    title && `<h1>${title}</h1>`,
    para(ctx.clean(authors, { inline: true })),
    para(words(box.find('.date-time').first())),
  ];
  return ctx.block('article-hero', [GRADIENT[gradient]], [[cell.filter(Boolean)]]);
}

/** "Tags: <a>, <a>" of a tag holder; the source's separators differ by variant. */
function tagLine(holder, ctx) {
  const links = holder.find('a').toArray().map((a) => ctx.clean(a, { inline: true }).trim());
  if (!links.length) return '';
  const label = words(holder.clone().find('a').remove().end()).replace(/[\s,]+/g, ' ').trim();
  return para(`${label} ${links.join(', ')}`.trim());
}

function teaser(box, ctx) {
  const images = box.find('.banner-img img, picture img').toArray();
  // below 730 px the landing banner shows a smaller rendition of the same picture
  ctx.drop(images.slice(1), 'mobile rendition of the banner image');
  ctx.drop(box.find('.profile-circle, .blog-profile-circle'), 'author photos come from the index');
  const link = box.find('a.title').first();
  const title = ctx.clean(link, { inline: true });
  const text = [
    para(words(box.find('.date-time').first())),
    title && `<h4>${title}</h4>`,
    para(ctx.clean(box.find('.authors-links').first(), { inline: true })),
    tagLine(box.find('.tags, .tag-holder').first(), ctx),
  ];
  const image = images.length ? ctx.image(images[0]) : '';
  return ctx.block('teasers', ['featured'], [[image, text.filter(Boolean)]], { merge: true });
}

export default function blogBanner(el, ctx) {
  const box = ctx.$(el).find('.cmp-blogbanner, .cmp-featured-blogbanner').first();
  if (!box.length) return [];
  return box.attr('data-blog-banner-variant') === 'article' ? article(box, ctx) : teaser(box, ctx);
}
