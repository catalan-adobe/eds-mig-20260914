// Share links of an article. The block builds the URLs; the title is written only when the
// source shares another title than the page's h1 (406 of 1,026 pages: "MSC1 | 5G vs. 4G").
const ICON = /fa-(?!brands$)([a-z0-9-]+)/;
const text = (value) => (value ?? '').replace(/\s+/g, ' ').trim();
const escape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default function socialShare(el, ctx) {
  const { $ } = ctx;
  const box = $(el).find('.cmp-socialshare').first();
  const icons = box.find('.cmp-socialshare__link i').toArray()
    .map((i) => (i.attribs.class ?? '').split(/\s+/).map((c) => c.match(ICON)?.[1]).find(Boolean))
    .filter(Boolean);
  if (!icons.length) return [];
  const title = text(box.attr('data-blog-title'));
  const rows = [[icons.join(', ')]];
  if (title && title !== text($('.blogBanner h1').first().text())) rows.push([escape(title)]);
  return ctx.block('social-share', [], rows);
}
