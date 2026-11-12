// blogsDev: the tag panel of the blog sub navigation (second row of `blog-nav`), the post list
// of an author page (`listing author`), the category page (`listing category`), and the tags
// of a post (page metadata `tags` and a list of links).
const SHEETS = { BLOG: 'blogs', ARTICLE: 'articles' };
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function browseByTags(box, ctx) {
  ctx.drop(box.find('.close-button'), 'blog-nav draws the close button');
  const cell = box
    .children('h2, p, ul')
    .toArray()
    .map((node) => ctx.clean(node))
    .join('');
  return ctx.block('blog-nav', [], [[cell]], { merge: true });
}

function authorPosts(box, ctx) {
  ctx.drop(
    box.find('.cmp-blogsdev__mra-container'),
    'listing author renders the posts from the index',
  );
  return ctx.block('listing', ['author'], [['sheet', 'posts']]);
}

function category(box, ctx) {
  const list = box.find('[data-blogsdev-type="mostRecentArticles"]').first();
  const sheet = SHEETS[list.attr('data-content-type')] ?? 'blogs';
  ctx.drop(
    box.find('.cmp-blogsdev__catpg-container'),
    'listing category draws its counts and writers',
  );
  return ctx.block('listing', ['category'], [['sheet', sheet]]);
}

function pageTags(box, ctx) {
  const links = box.find('.cmp-blogsdev__pagetags-container a');
  if (!links.length) return [];
  ctx.meta(
    'tags',
    escape(
      links
        .toArray()
        .map((a) => ctx.$(a).text().trim())
        .join(', '),
    ),
  );
  const items = links.toArray().map((a) => `<li>${ctx.clean(a, { inline: true })}</li>`);
  return `<ul>${items.join('')}</ul>`;
}

export default function blogsDev(el, ctx) {
  const box = ctx.$(el).find('section.cmp-blogsdev').first();
  if (!box.length) return [];
  switch (box.attr('data-blogsdev-type')) {
    case 'browseByTags':
      return browseByTags(box, ctx);
    case 'mostRecentArticles':
      return authorPosts(box, ctx);
    case 'categoryPage':
      return category(box, ctx);
    default:
      return pageTags(box, ctx);
  }
}
