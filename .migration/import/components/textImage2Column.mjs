// An image beside a short text (title, text, link): block `columns media narrow`, image 4 and
// text 8 wide unless the source says otherwise. The cell order is the side from 730.
import { markNewTab, titleLook } from './imageTextCta.mjs';

const WIDTH = { 6: 'w-6-6', 8: 'w-8-4' };

export default function textImage2Column(el, ctx) {
  const { $ } = ctx;
  const box = $(el).find('.component-text-image-2-column').first();
  markNewTab(box);
  const col = box.find('.img-col').first();
  const img = col.find('img').first();
  const image = ctx.image(img);
  const [heading, body, link] = col.siblings().first().children('.component-text').toArray();
  const text = [heading, body, link].map((node) => (node ? ctx.clean(node) : '')).join('');
  if (!image && !text) return undefined;

  // the size of an empty title still moves the text
  const look = titleLook($(heading).find('h4 > span').first(), ctx);
  if (!$(heading).text().trim()) look.variants = [];
  const width = Number((col.attr('class') ?? '').match(/col-sm-(\d+)/)?.[1] ?? 4);
  const pad = (img.attr('class') ?? '').match(/svg-padding-(sm|md|lg)/)?.[1];
  const pushed = /col-sm-push-/.test(col.attr('class') ?? '');
  const variants = ['media', 'narrow', WIDTH[width], pad && `svg-pad-${pad}`, ...look.variants];
  // an 8 | 4 row with the image on the right is 4 | 8 in cell order
  if (width === 8 && pushed) variants[2] = 'w-4-8';
  const cells = pushed ? [text, image] : [image, text];
  return ctx.section(ctx.block('columns', variants, [cells]), {
    styles: [...ctx.styles(el), ...look.styles],
  });
}
