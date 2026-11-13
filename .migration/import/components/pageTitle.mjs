export default function pageTitle(el, ctx) {
  const title = ctx.clean(ctx.$(el).find('h1').first(), { inline: true });
  return title && `<h1>${title}</h1>`;
}
