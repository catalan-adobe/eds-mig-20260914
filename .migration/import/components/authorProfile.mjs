// The card of an author page: photo, name, biography and "Follow on:" profile links.
export default function authorProfile(el, ctx) {
  const box = ctx.$(el).find('.component-author-profile').first();
  const name = ctx.clean(box.find('.title').first(), { inline: true });
  const follow = box.find('.follow').first();
  const links = follow.find('a').toArray().map((a) => ctx.clean(a, { inline: true }).trim())
    .filter(Boolean);
  const text = [
    name && `<h2>${name}</h2>`,
    ...box.children('.component-text').toArray().slice(1).map((node) => ctx.clean(node)),
    ...(links.length ? [ctx.clean(follow.children('p')), `<p>${links.join(' ')}</p>`] : []),
  ];
  const image = box.find('.image-wrapper img').first();
  return ctx.block('author-profile', [], [[
    image.length ? ctx.image(image) : '',
    text.filter(Boolean),
  ]]);
}
