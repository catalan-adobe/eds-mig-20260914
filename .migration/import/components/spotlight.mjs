// A framed box with its title on the border. Text inside becomes the second row (`rich-text`
// when it is a richTextEditor). Blocks inside (one page: a content tile) follow the box in its
// section, and the box frames them.
export default function spotlight(el, ctx) {
  const box = ctx.$(el).find('.component-spotlight').first();
  const title = ctx.clean(box.find('.spotlight-title').first(), { inline: true });
  const sections = ctx.children(el).filter((s) => s.content.length);
  const variants = [
    box.hasClass('spotlight-header-left') && 'left',
    sections.some((s) => s.styles.includes('rich-text')) && 'rich-text',
  ];
  const inside = sections.flatMap((s) => s.content);
  if (inside.every((part) => typeof part === 'string')) {
    if (!title && !inside.length) return [];
    const content = inside.length ? [[inside.join('')]] : [];
    return ctx.block('spotlight', variants, [[title], ...content]);
  }
  return [ctx.block('spotlight', variants, [[title]]), ...inside];
}
