// An image or a video beside a text with title, subtitle and buttons: block `columns media`.
// The cell order is the side from 730. Without media the block has the text cell only.
const SIZE = { 'text-size-smaller': 'title-small', 'text-size-larger': 'title-large' };
const COLOUR = { '#111c24': 'title-dark', '#3c3c3c': 'title-grey', '#80539c': 'title-light' };
const PURPLE = '#5a2a82';

/**
 * The look of a title: `styles` for the section (size, dark), `variants` for the block (the
 * colours the section styles do not have). `node` carries the size class and the colour.
 * @param {object} node cheerio of the title, or of the span inside it
 * @param {object} ctx the transform context
 * @param {string} fallback the colour of a title without one
 */
export function titleLook(node, ctx, fallback = PURPLE) {
  const size = (node.attr('class') ?? '').split(/\s+/).map((c) => SIZE[c]).find(Boolean);
  const colour = ((node.attr('style') ?? '').match(/color:\s*([^;]*)/)?.[1].trim() || fallback)
    .toLowerCase();
  const look = COLOUR[colour];
  if (!look && colour !== PURPLE) ctx.warn(`title colour ${colour} is not migrated`);
  const dark = look === 'title-dark';
  return {
    styles: [size, dark && look].filter(Boolean),
    variants: look && !dark ? [look] : [],
  };
}

/**
 * Marks the links of `box` that the source opens in a new tab: their href ends with `#_blank`,
 * which the columns block turns back into the target.
 * @param {object} box cheerio of the component
 */
export function markNewTab(box) {
  box.find('a[target="_blank"][href]').each((_, a) => {
    if (!a.attribs.href.endsWith('#_blank')) a.attribs.href += '#_blank';
  });
}

/** The media cell: an image, or a video as its poster (when authored) and its link. */
function mediaCell(col, ctx) {
  const video = col.find('.cmp-video[data-video-id]').first();
  if (!video.length) return { cell: ctx.image(col.find('img').first()) };
  ctx.drop(video.find('.modal-template'), 'video dialog: built by the video block');
  const poster = ctx.image(video.find('img').first());
  const href = ctx.video(video);
  return {
    cell: `${poster ? `<p>${poster}</p>` : ''}<p><a href="${href}">${href}</a></p>`,
    modal: video.attr('data-mode') === 'modal',
  };
}

/**
 * The empty paragraphs of the source's editor at the edges of a text. They are blank lines
 * that move the text and the buttons, and the pipeline drops an empty paragraph: block
 * variants keep them, up to two after the text.
 */
function blankLines(text, ctx) {
  const { $ } = ctx;
  const parts = (text[0]?.children ?? []).filter((n) => n.type === 'tag' || n.data?.trim());
  const blank = (n) => n?.name === 'p' && !$(n).text().replace(/\u00a0/g, ' ').trim()
    && !$(n).find('img, iframe').length;
  if (parts.every(blank)) return [];
  const two = blank(parts.at(-1)) && blank(parts.at(-2));
  if (two && blank(parts.at(-3))) ctx.warn('three blank lines after the text: two');
  return [blank(parts[0]) && 'blank-before', blank(parts.at(-1)) && 'blank-after',
    two && 'blank-after-2'];
}

export default function imageTextCta(el, ctx) {
  const { $ } = ctx;
  const box = $(el).find('.component-imageTextCta').first();
  markNewTab(box);
  const text = box.find('.text-col, .component-no-media').first();
  const heading = text.children('.title').first();
  const title = ctx.clean(heading, { inline: true });
  const subheading = text.children('.subtitle').first();
  const subtitle = ctx.clean(subheading, { inline: true });
  const body = text.children().not(heading).not(subheading).toArray()
    .map((node) => ctx.clean(node))
    .join('');
  if (!subtitle && /^<h3>/.test(body)) ctx.warn('a text that starts with h3 shows as subtitle');
  const words = [title && `<h2>${title}</h2>`, subtitle && `<h3>${subtitle}</h3>`, body]
    .filter(Boolean).join('');
  const col = box.find('.img-col').first();
  const { cell: media, modal } = mediaCell(col, ctx);
  if (!media && !words) return undefined;

  const look = title ? titleLook(heading, ctx, '#111c24') : { styles: [], variants: [] };
  const buttons = text.children('.buttons').first();
  const align = (buttons.attr('class') ?? '').match(/align-(center|right)/)?.[1];
  const styles = [...ctx.styles(el), ...look.styles];
  if (align && buttons.find('a').length) styles.push(`buttons-${align}`);
  // an empty colour leaves the subtitle in the heading colour of the source
  const purple = subtitle && !/color:\s*#/.test(subheading.attr('style') ?? '');
  const variants = ['media', modal && 'video-modal', purple && 'subtitle-purple',
    ...look.variants, ...blankLines(text.children('.component-text').first(), ctx)];
  // the source pushes the image to the right: the text cell comes first
  const pushed = box.find('.row').hasClass('textmedia');
  // a media column without media still keeps the text in its half
  const cells = col.length ? [media, words] : [words];
  const block = ctx.block('columns', variants, [pushed ? cells.reverse() : cells]);
  return ctx.section(block, { styles });
}
