// A landing header: intro (title, text, optional image) on the left, a Marketo form on the
// right, on a purple, white or dark background. Block `form landing`.
import { formRows, formVariants } from './mktoForm.mjs';

const BACKGROUNDS = {
  purpleGradientBackground: 'purple',
  whiteBackground: 'white',
  darkGreyGradientBackground: 'dark',
};

const BLANK = '\u200b';
const isBlank = (text) => !text.replace(/[\s\u00a0]/g, '');

/** The text nodes and line breaks of an element, in reading order. */
function leaves(node) {
  if (node.type === 'text' || node.name === 'br' || !node.children?.length) return [node];
  return node.children.flatMap(leaves);
}

/**
 * Authors space the intro with empty paragraphs and with line breaks at the start or doubled
 * at the end of a paragraph (219 of 747 intros). The pipeline drops them all, so each blank
 * line is kept as a zero-width space: it has a height and nothing to see.
 */
function keepBlankLines($, root) {
  const filler = (node) => node.name === 'br' || (node.type === 'text' && isBlank(node.data));
  root.find('p, li').each((i, el) => {
    const all = leaves(el);
    if (all.every(filler)) {
      if (el.name === 'p' && !$(el).find('img').length) $(el).text(BLANK);
      return;
    }
    const start = all.slice(0, all.findIndex((node) => !filler(node)));
    const end = all.slice(all.findLastIndex((node) => !filler(node)) + 1);
    const breaks = (nodes) => nodes.filter((node) => node.name === 'br');
    [...breaks(start), ...breaks(end).slice(1)].forEach((br) => $(br).before(BLANK));
  });
}

/** "Date: May 06, 2026 | 10:00 AM PST" and the UTC offset the block needs to hide it later. */
function dateRow(box, ctx) {
  const date = box.find('.webinar-date-timezone').first();
  if (!date.length) return [];
  const line = ctx.clean(date.find('p').first(), { inline: true }).replace(/\s+/g, ' ').trim();
  return [['date', line, date.attr('data-utc-offset') ?? '']];
}

/**
 * The `<img>` of the intro. The image service turns a PNG into a JPEG unless the format is
 * asked for, and the markup does not say which assets are PNGs: a transparent picture would
 * get a white box on the gradient.
 */
function picture(img, ctx) {
  const [, url] = ctx.image(img).match(/src="([^"]*\/is\/image\/[^"]*)"/) ?? [];
  return url ? ctx.image(`${url.replace(/&amp;/g, '&')}&fmt=png-alpha`, img.attr('alt') ?? '')
    : ctx.image(img);
}

export default function marketoFormsContainer(el, ctx) {
  const box = ctx.$(el).find('.component-marketo-form-container').first();
  const text = box.find('.text-col').first();
  const title = ctx.clean(text.find('.title').first(), { inline: true })
    .replace(/(\s|<br>)+$/, '').trim();
  const image = text.find('.component-image img').first();
  keepBlankLines(ctx.$, text.find('.description.component-text'));
  const intro = [
    title && `<h1>${title}</h1>`,
    ctx.clean(text.find('.description.component-text')),
    image.length && `<p>${picture(image, ctx)}</p>`,
  ].filter(Boolean);
  const background = Object.entries(BACKGROUNDS).find(([name]) => box.hasClass(name))?.[1];
  if (!background) ctx.warn(`unknown background: ${box.attr('class')}`);
  const form = box.find('.snps-aem-mktoForm').first();
  const padding = image.attr('class')?.match(/svg-padding-(sm|md|lg)/)?.[1];
  const variants = ['landing', background, ...formVariants(form)];
  if (padding) variants.push(`image-pad-${padding}`);
  const rows = [[intro], ...dateRow(text, ctx), ...formRows(form, ctx)];
  return [ctx.section([ctx.block('form', variants, rows)]), ...ctx.children(el)];
}
