// A card with a title above an image and a text with links: block `columns media card`. The
// first row is the title.
import { titleLook } from './imageTextCta.mjs';

export default function imageAndLinks(el, ctx) {
  const { $ } = ctx;
  const box = $(el).find('.component-imageAndLinks').first();
  const heading = box.children('.title').first();
  const title = ctx.clean(heading);
  const image = ctx.image(box.find('.image img').first());
  const text = ctx.clean(box.find('.text-col').first());
  if (!title && !image && !text) return undefined;
  const look = title ? titleLook(heading.children('span').first(), ctx)
    : { styles: [], variants: [] };
  const rows = [title && [title], (image || text) && [image, text]].filter(Boolean);
  return ctx.section(ctx.block('columns', ['media', 'card', ...look.variants], rows), {
    styles: [...ctx.styles(el), ...look.styles],
  });
}
