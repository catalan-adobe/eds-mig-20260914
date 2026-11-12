// A carousel. Slides of cards, flag cards, quotes or banners become the `carousel` variant of
// the item block (CONTRACT a, rule 4); an image carousel becomes `carousel images`; any other
// slide is a row of the block `carousel`, with one cell per column of the slide.
import { childComponents, componentName } from '../lib/page.mjs';

/** The item block of a source component, and whether the block shows several per view. */
const ITEMS = {
  cards: { cols: true },
  'product-card': { cols: true },
  assetCard: { cols: true },
  quote: {},
  banner: {},
};
const ROWS = ['column', 'cardContainer'];
const TRANSPARENT = [...ROWS, 'synopsysContainer'];
const SIZES = ['xs', 'sm', 'md'];
const WIDTHS = ['4,8', '8,4', '3,9', '9,3'];
const TEXT_LOOKS = ['rich-text', 'title-small', 'title-large', 'title-dark'];
const IMAGE_LOOKS = ['image-pad-sm', 'image-pad-md', 'image-pad-lg'];
// the html of an `image`: image paragraphs, with the link of a linked image
const IMAGE = /^(<p>(<img[^>]*>|<a [^>]*>[^<]*<\/a>)<\/p>\s*)+$/;
const isBlock = (part) => typeof part !== 'string';
/** The cells of a `column` or `cardContainer`. */
const cellsOf = ($, row) => (componentName(row) === 'column'
  ? $(row).find('.component-column').first().children('div')
    .not('.snps-col-divider')
  : $(row).find('.component-card-container').first().children('.row')
    .children('.card-col'))
  .toArray();

/** The components of a slide that are not layout: what a row of cells finally holds. */
function leaves(scope) {
  return childComponents(scope).flatMap((el) => (
    TRANSPARENT.includes(componentName(el)) ? leaves(el) : [el]));
}

/** The places a slide has for its items: the cells of its rows, a cell with a row counts as it. */
function slots(scope, $) {
  return childComponents(scope).reduce((sum, el) => {
    if (componentName(el) === 'synopsysContainer') return sum + slots(el, $);
    if (!ROWS.includes(componentName(el))) return sum + 1;
    return sum + cellsOf($, el).reduce((n, cell) => n + Math.max(1, slots(cell, $)), 0);
  }, 0);
}

/** The transformed sections of `components`, read apart from the layout around them. */
function render(components, slide, ctx) {
  // the class makes components without grid classes (a quote directly in a slide) findable
  const scope = ctx.$('<div class="cmp-carousel__item"></div>').appendTo(slide);
  scope.append(components);
  return ctx.children(scope[0]);
}

/**
 * One item block with the variant `carousel` when every slide holds only items. A `text`
 * beside a quote (a footnote) follows the block as a section of its own.
 */
function itemCarousel(slides, ctx, variants, { perView = 1, inView } = {}) {
  const parts = slides.map((slide) => leaves(slide));
  const names = [...new Set(parts.flat().map(componentName))];
  const kinds = names.filter((name) => ITEMS[name]);
  if (!kinds.length || names.some((name) => !ITEMS[name] && name !== 'text')) return null;
  const isItem = (el) => !!ITEMS[componentName(el)];
  const items = parts.map((list) => list.filter(isItem));
  const notes = parts.map((list) => list.filter((el) => !isItem(el)));
  // read before the items leave their rows
  const count = inView
    || perView * Math.max(slots(slides[0], ctx.$), ...items.map((l) => l.length));
  const total = items.flat().length;
  // the space below the items of a slide stays, below the block
  const spaces = items.flat().flatMap((el) => ctx.styles(el));
  const below = SIZES.findLast((size) => spaces.includes(`bottom-${size}`));
  const sections = slides.flatMap((slide, i) => render(items[i], slide, ctx))
    .filter((s) => s.content.length);
  sections.flatMap((s) => s.content).filter(isBlock).forEach((b) => { b.merge = true; });
  const extra = [
    kinds.some((name) => ITEMS[name].cols) && `cols-${count}`,
    ...(total > count ? ['carousel', ...variants] : []),
  ].filter(Boolean);
  const merged = ctx.merge(sections, ...extra);
  const last = merged.at(-1);
  if (below && !last.styles.some((style) => style.startsWith('bottom-'))) {
    last.styles.push(`bottom-${below}`);
  }
  if (merged.length > 1) ctx.warn(`slides of ${merged.length} kinds of items: one block each`);
  const after = slides.flatMap((slide, i) => render(notes[i], slide, ctx));
  if (after.length) ctx.warn('text beside the items of a slide follows the carousel');
  return [...merged, ...after];
}

/** Sections as the html of one cell. A block in it becomes default content. */
function cellHtml(sections, ctx, used) {
  const blocks = sections.flatMap((s) => s.content).filter(isBlock).map((b) => b.name);
  if (blocks.length) ctx.warn(`${[...new Set(blocks)].join(', ')} in a slide: default content`);
  used.push(...sections);
  return ctx.flat(sections);
}

/**
 * The look of the texts and of the images in the slides as block variants: the styles that
 * most of them have. A cell cannot carry the styles of its sections.
 */
function contentLook(sections, ctx) {
  const isText = (part) => isBlock(part) || !IMAGE.test(part);
  const texts = sections.filter((section) => section.content.some(isText));
  const images = sections.filter((section) => !texts.includes(section));
  const most = (list, styles) => styles.filter((style) => {
    const count = list.filter((section) => section.styles.includes(style)).length;
    if (count && count < list.length) {
      ctx.warn(`${style} on ${count} of ${list.length} components in the slides`);
    }
    return count && count * 2 >= list.length;
  });
  return [...most(texts, TEXT_LOOKS), ...most(images, IMAGE_LOOKS)];
}

const isFilled = ($, el) => !!($(el).text().trim() || $(el).find('img, [data-video-id]').length);

/** The only filled component of a slide, looked for inside the containers around it. */
function onlyComponent(slide, $) {
  const components = childComponents(slide).filter((el) => isFilled($, el));
  if (components.length !== 1) return null;
  return componentName(components[0]) === 'synopsysContainer'
    ? onlyComponent(components[0], $) : components[0];
}

/**
 * The cells of a slide: the cells of its row when it is one row, the cells of its block when
 * it is one block with one row (an image beside a text), else the slide itself.
 */
function slideCells(slide, ctx, used) {
  const only = onlyComponent(slide, ctx.$);
  const cells = only && ROWS.includes(componentName(only)) ? cellsOf(ctx.$, only) : [];
  if (cells.length > 1) {
    const widths = cells.map((c) => (c.attribs.class ?? '').match(/col-sm-(\d+)/)?.[1] ?? 12);
    const html = cells.map((c) => cellHtml(ctx.children(c), ctx, used));
    return { widths: widths.join(), cells: html, styles: ctx.styles(only) };
  }
  const sections = ctx.children(slide);
  const styles = [...(sections[0]?.styles ?? []), ...(sections.at(-1)?.styles ?? [])];
  const parts = sections.flatMap((section) => section.content);
  const [row] = parts.length === 1 && isBlock(parts[0]) ? parts[0].rows : [];
  if (parts[0]?.rows?.length === 1 && row.length > 1) {
    used.push(...sections);
    return {
      widths: '', cells: row, styles, media: parts[0].variants.includes('media'),
    };
  }
  return { widths: '', cells: [cellHtml(sections, ctx, used)], styles };
}

/** The space above and below the content of every slide, as block variants. */
function slideSpace(rows) {
  return ['top', 'bottom'].flatMap((side) => SIZES.map((size) => `${side}-${size}`))
    .filter((style) => rows.every((row) => row.styles.includes(style)))
    .map((style) => `slide-${style}`);
}

/**
 * The sections of the slides of a carousel.
 * @param {Element[]} slides the slide elements
 * @param {object} ctx the transform context
 * @param {object} [options]
 * @param {string[]} [options.variants] variants of a block that slides: no-mobile, autoplay
 * @param {string[]} [options.look] variants of the block `carousel` only: fade
 * @param {number} [options.perView] slides in view: the items in view are that many slides
 * @param {number} [options.inView] items in view, when the source sets them itself
 */
export function slideSections(slides, ctx, { variants = [], look = [], ...view } = {}) {
  const filled = slides.filter((slide) => isFilled(ctx.$, slide));
  if (!filled.length) return [];
  const band = ctx.styles(ctx.el);
  const items = itemCarousel(filled, ctx, variants, view);
  if (items) return ctx.band(items, band);
  // one slide does not slide: its content stands as it is
  if (filled.length === 1) return ctx.band(ctx.children(filled[0]), band);
  const used = [];
  const rows = filled.map((slide) => slideCells(slide, ctx, used));
  const widths = [...new Set(rows.map((row) => row.widths))];
  const width = widths.length === 1 && WIDTHS.includes(widths[0])
    ? `w-${widths[0].replace(',', '-')}` : '';
  // an image beside a text (the source's imageTextCta) stacks in reverse below 730
  const media = rows.every((row) => row.media) && 'media';
  const names = [
    ...look, width, media, ...contentLook(used, ctx), ...slideSpace(rows), ...variants,
  ];
  const block = ctx.block('carousel', names, rows.map((row) => row.cells));
  return [ctx.section(block, { styles: band })];
}

/** `carousel images`: a row is the image, then its caption and the link to its file. */
function imageCarousel(box, ctx) {
  const { $ } = ctx;
  const stage = box.children('.position-relative').first();
  ctx.drop(box.children('.modal-template'), 'image carousel: the dialog repeats the slides');
  ctx.drop(box.children('.slider-nav'), 'image carousel: the thumbnails repeat the slides');
  ctx.drop(stage.children('.pagination'), 'image carousel: the counter is drawn by the block');
  const rows = stage.find('.image-slide').toArray().map((slide) => {
    const caption = ctx.clean($(slide).find('.cmp-image__title').first(), { inline: true });
    const href = ctx.link($(slide).find('a.image-download').attr('href'));
    return [ctx.image($(slide).find('img').first()), [
      caption && `<p>${caption}</p>`,
      href && `<p><a href="${href}">:arrow-down-to-line:</a></p>`,
    ]];
  }).filter((row) => row[0]);
  return rows.length ? ctx.block('carousel', ['images'], rows) : undefined;
}

export default function carousel(el, ctx) {
  const { $ } = ctx;
  const box = $(el).find('.cmp-carousel').first();
  const type = box.attr('carousel-type');
  if (type === 'image-carousel') return imageCarousel(box, ctx);
  const slides = box.children('.cmp-carousel__content').children('.cmp-carousel__item').toArray();
  // a card carousel shows as many cards as its first row has cells, as the source's script
  const firstRow = box.find('.column')[0] ?? box.find('.cardContainer')[0];
  const inView = type === 'card-carousel' && firstRow ? cellsOf($, firstRow).length : 0;
  return slideSections(slides, ctx, { look: ['fade'], inView });
}
