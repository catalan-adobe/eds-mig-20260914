// The source's Coveo search: the blog sub navigation (first row of `blog-nav`, the tag panel of
// blogsDev joins it) or a result page (`listing faceted`, rendered from the index sheets).
const SHEETS = {
  'blog-container': 'blogs',
  'articles-container': 'articles',
  'event-container': 'events',
  'press-release-container': 'news',
  'resource-container': 'resources',
  'success-story-container': 'success-stories',
  'webinar-container': 'webinars',
};
// Coveo field of a facet to the index column that holds its values
const COLUMNS = [
  [/blogcategory/, 'series'],
  [/productcategory/, 'product'],
  [/solutioncategory/, 'solution'],
  [/regiontags/, 'region'],
  [/year$/, 'year'],
  [/eventtype|webinartype/, 'availability'],
  [/contenttype/, 'type'],
];
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function nav(box, ctx) {
  const link = box.find('.blog-title-cta-link').first();
  ctx.drop(box.find('.blog-topics-btn'), 'blog-nav draws the Topics button');
  const title = link.length ? ctx.clean(link, { inline: true }).replace(/\s+/g, ' ') : '';
  return ctx.block('blog-nav', [], [[title]], { merge: true });
}

function results(box, ctx) {
  const holder = box.children('div').first();
  const kind = Object.keys(SHEETS).find((c) => holder.hasClass(c));
  if (!kind) {
    ctx.warn(`search result page without a known container: ${holder.attr('class')}`);
    return [];
  }
  const facets = box.find('atomic-facet, atomic-category-facet').toArray().map((f) => {
    const column = COLUMNS.find(([field]) => field.test(f.attribs.field ?? ''))?.[1];
    if (!column) ctx.warn(`facet ${f.attribs.field} has no index column`);
    return column && `${escape(f.attribs.label ?? column)}=${column}`;
  }).filter(Boolean);
  const rows = [
    ['sheet', SHEETS[kind]],
    holder.attr('data-search-box-title') && ['title', escape(holder.attr('data-search-box-title'))],
    ['facets', facets.join(', ')],
    ['sort', /^relevanc/.test(box.find('atomic-sort-expression').attr('expression') ?? '')
      ? 'relevance' : 'date desc'],
    ['page-size', '10'],
  ].filter(Boolean);
  return ctx.block('listing', ['faceted'], rows);
}

export default function search(el, ctx) {
  const box = ctx.$(el).find('.component-search-result').first();
  if (!box.length) return [];
  return box.find('.blog-sub-nav-container').length ? nav(box, ctx) : results(box, ctx);
}
