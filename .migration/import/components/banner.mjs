// The banner family: skinny title band, call-to-action band, page banner with image, foreground
// image or background video, and the slides of the home page carousel. One `hero` row each.
import { escapeAttr, escapeHtml } from '../lib/clean.mjs';
import { pickSource } from '../lib/media.mjs';

const para = (html) => (html ? `<p>${html}</p>` : '');
const classes = (node) => (node.attr('class') ?? '').split(/\s+/).filter(Boolean);
const pick = (node, pattern) => classes(node).map((c) => c.match(pattern)?.[1]).find(Boolean);
const text = (node) => escapeHtml(node.text().replace(/\s+/g, ' ').trim());
const named = (prefix, value) => (value ? `${prefix}-${value}` : '');
const SIZE = { Medium: 'md', Large: 'lg' };
const TITLE = { smaller: 'title-small', larger: 'title-large' };

/** The tab label of a home page slide: the title of the carousel item around the banner. */
const slideLabel = (el, ctx) => ctx.$(el).closest('.cmp-carousel__item[title]').attr('title');

/** The label as a paragraph's content: the source writes it as html, with its line breaks. */
const tabLabel = (label) => label.split(/<br\s*\/?>/i)
  .map((line) => escapeHtml(line.replace(/\s+/g, ' ').trim())).join('<br>');

/**
 * The `<img>` of a banner image. The image service turns a PNG into a JPEG unless the format
 * is asked for: a transparent logo would get a white box.
 */
function picture(img, ctx) {
  const layer = img.closest('[data-cmp-data-layer]').attr('data-cmp-data-layer') ?? '';
  const url = pickSource(img[0], ctx.page.path);
  const png = /"@type":"image\/png"/.test(layer) && /\/is\/image\//.test(url);
  return png ? ctx.image(`${url}&fmt=png-alpha`, img.attr('alt') ?? '') : ctx.image(img);
}

/** The style element of a banner: which image shows below 730, a mobile background. */
const ownStyle = (el, ctx) => ctx.$(el).children('style').text();

/** False for an image the source renders with opacity 0: its gradient shows instead. */
function visible(img, style) {
  const hidden = /opacity:\s*0(?![.\d])/.test(img.attr('style') ?? '');
  // three banners draw their hidden mobile image as a background instead
  return img.length > 0 && (!hidden || /\.cropped-img\s*\{\s*background-image/.test(style));
}

/** The desktop and the mobile image of a banner, each only when the source shows it. */
function images(el, box, ctx) {
  const style = ownStyle(el, ctx);
  const desktop = box.find('.dm-desktop img').first();
  const mobile = box.find('.dm-mobile img').first();
  const swaps = !style || /\.dm-mobile\s*\{\s*display:\s*block/.test(style);
  return {
    desktop: visible(desktop, '') ? desktop : null,
    mobile: swaps && visible(mobile, style) ? mobile : null,
    unused: [desktop, mobile].filter((img) => img.length),
  };
}

/** Cell 1: the mp4 link with its poster, or the desktop image; then the mobile image. */
export function media(el, box, ctx) {
  const source = box.find('video source').first();
  const mp4 = ctx.link(source.attr('data-video-url') ?? source.attr('src'));
  const poster = box.find('video').attr('data-poster-url');
  const { desktop, mobile, unused } = images(el, box, ctx);
  unused.filter((img) => img !== desktop && img !== mobile)
    .forEach((img) => ctx.drop(img, 'banner image the source does not show'));
  return [
    mp4 && para(`<a href="${escapeAttr(mp4)}">${escapeHtml(mp4)}</a>`),
    mp4 && poster && para(ctx.image(poster, '')),
    desktop && para(picture(desktop, ctx)),
    mobile && para(picture(mobile, ctx)),
  ].filter(Boolean);
}

/** The icon of a button: its Font Awesome name, or the arrow of a `has-arrow` link. */
function iconOf(a) {
  const fa = pick(a.find('i').first(), /^fa-(?!regular$|solid$|light$)([a-z0-9-]+)$/);
  return fa ?? (a.hasClass('has-arrow') ? 'chevron-right' : '');
}

/** One button paragraph: the icon goes to the end of the label, as the contract writes it. */
function button(node, ctx) {
  const { $ } = ctx;
  const box = $(node);
  const a = box.find('a').first();
  const video = box.closest('.cmp-video');
  const href = video.length ? ctx.video(video) : ctx.link(a.attr('href'));
  const icon = iconOf(a);
  const label = [text(a), icon && `:${icon}:`].filter(Boolean).join(' ');
  if (!href || !label) return para(label);
  const outlined = box.hasClass('secondary') || /-transparent\b/.test(box.attr('class'));
  const tag = outlined ? 'em' : 'strong';
  return para(`<${tag}><a href="${escapeAttr(href)}">${label}</a></${tag}>`);
}

/**
 * The paragraphs of a title as lines, when one of them is blank: authors space the title with
 * blank paragraphs, so they stay, as a line with a no-break space.
 */
function spaced(box, ctx) {
  const lines = box.find('p').toArray().filter((p) => p.children.length)
    .map((p) => ctx.clean(p, { inline: true }));
  const plain = box.children().not('p').length > 0 || lines.every(Boolean);
  return plain || !lines.some(Boolean) ? '' : lines.map((line) => line || '&nbsp;').join('<br>');
}

/** The heading level: of the screen reader copy, else of the title element, else `h1`. */
function levelOf(title, hidden) {
  return hidden[0]?.name ?? (title.is('h1,h2,h3,h4,h5,h6') ? title[0].name : 'h1');
}

/** Cell 2: the slide label (carousel), the title at the source's heading level, the rest. */
export function copy(el, box, ctx) {
  const { $ } = ctx;
  const title = box.find('.title').first();
  const hidden = title.find('.ui-helper-hidden-accessible').first();
  const level = levelOf(title, hidden);
  const spoken = text(hidden);
  if (hidden.length) {
    ctx.drop(hidden, 'screen reader copy of the banner title');
    hidden.remove();
  }
  const sized = title.children('[class*="text-size-"]').first();
  const shown = spaced(sized.length ? sized : title, ctx)
    || ctx.clean(title, { inline: true }) || spoken;
  const label = slideLabel(el, ctx);
  ctx.drop(box.find('.modal-template'), 'video dialog: built by the block');
  const rest = box.find('.text-wrapper').first()
    .find('.sub-title, .component-button, .component-text > p').toArray();
  return [
    label && para(tabLabel(label)),
    shown && `<${level}>${shown}</${level}>`,
    ...rest.map((node) => ($(node).hasClass('component-button') ? button(node, ctx)
      : ctx.clean(node))),
  ].filter(Boolean);
}

/** The `fg-*` variants of a foreground image: width, side, padding. */
function foreground(box) {
  const wrapper = box.find('.foreground-image-wrapper').first();
  const img = wrapper.find('img').first();
  const width = pick(wrapper, /^foreground-width-(\d+)$/);
  const side = pick(img, /^h(Left|Right)$/)?.toLowerCase();
  const pad = pick(wrapper.find('[class*="svg-padding-"]').first(), /^svg-padding-(sm|md|lg)$/);
  return [width !== '40' && named('fg', width), named('fg', side), named('fg-pad', pad)];
}

/** The title size of one slide, set by a style element of the page (the home page has one). */
function slideTitle(label, ctx) {
  const rule = new RegExp(`div\\[title="${label?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\]`
    + '[^{]*\\.title\\s*\\{[^}]*font-size:\\s*38px');
  return label && ctx.$('style').toArray().some((s) => rule.test(ctx.$(s).text()))
    ? 'title-small' : '';
}

/** True when a style element of the page tightens the buttons of its banners (the home page). */
function tightButtons(ctx) {
  const rule = /\.component-banner \.component-button\s*\{[^}]*margin-bottom:\s*15px/;
  // a shared fragment must not carry the style of the page it was first found on
  return !ctx.page.fragment && ctx.$('style').toArray().some((s) => rule.test(ctx.$(s).text()));
}

/** The kind of a banner: it decides the height and the type scale. */
function kindOf(box) {
  const slide = box.hasClass('carousel-wrapper-hp');
  const skinny = box.hasClass('componentSkinnyBanner');
  const video = box.find('video source').length > 0;
  const regular = box.find('.desktop-wrapper').first().hasClass('reg-banner');
  return {
    slide, skinny, video, classic: !(slide || skinny || video || regular),
  };
}

const gradientOf = (box, name) => pick(
  box.find(name).first(),
  /^(black|light-purple|dark-purple)-gradient$/,
);

/** The gradient when no image shows, and the overlay above the image. */
function backdrop(box, shown, { video, classic }) {
  const gradient = gradientOf(box, '.bg-desktop');
  const shade = pick(box.find('.image-overlay, .video-overlay').first(), /^opacity-([1-9]\d)$/);
  return [
    !shown.desktop && !video && gradient !== 'dark-purple' && gradient,
    !classic && named('overlay', shade),
  ];
}

/** The text column: side, width, padding, the size of the title. */
function layout(box, slide) {
  const overlay = box.find('.text-overlay').first();
  const side = box.attr('data-type')?.match(/content-align-(center|right)/)?.[1];
  const left = overlay.hasClass('text-align-left') && 'left';
  return [
    slide ? side : left,
    named('width', pick(overlay.find('[class*="text-width-"]').first(), /^text-width-(\d+)$/)),
    named('pad', SIZE[pick(overlay.find('[class*="padding"]').first(), /^padding(Medium|Large)$/)]),
    box.find('.desktop-wrapper').first().hasClass('expanded-banner-content') && 'expanded',
    TITLE[pick(box.find('.title [class*="text-size-"]').first(), /^text-size-(\w+)$/)],
  ];
}

/** Below 730: a mobile image without a desktop image, the gradient behind a stacked banner. */
function narrow(box, shown, { video, skinny }) {
  const gradient = gradientOf(box, '.bg-mobile');
  return shown.mobile ? [
    !shown.desktop && !video && 'mobile-image-only',
    !skinny && gradient !== 'black' && named('mobile', gradient),
  ] : [];
}

/**
 * A blank paragraph before or after the subtitle. Authors space the text with it, and the
 * pipeline drops an empty paragraph, so it is a variant.
 */
function blankLines(box, ctx) {
  const paras = box.find('.sub-title').first().children('p').toArray();
  const blank = paras.map((p) => !ctx.$(p).text().trim() && !ctx.$(p).find('img').length);
  return blank.includes(false) ? [blank[0] && 'blank-before', blank.at(-1) && 'blank-after'] : [];
}

/** The block variants of a banner. In a carousel they are the options of its row. */
export function variants(el, box, ctx) {
  const kind = kindOf(box);
  const shown = images(el, box, ctx);
  return [
    kind.skinny && 'skinny',
    kind.video && 'video',
    box.find('.animation-element.slide-up').length > 0 && 'animated',
    kind.classic && 'classic',
    ...backdrop(box, shown, kind),
    ...layout(box, kind.slide),
    slideTitle(slideLabel(el, ctx), ctx),
    tightButtons(ctx) && 'tight-buttons',
    ...foreground(box),
    ...narrow(box, shown, kind),
    ...blankLines(box, ctx),
  ].filter(Boolean);
}

export default function banner(el, ctx) {
  const box = ctx.$(el).find('section[data-card-type="banner"]').first();
  const slide = box.hasClass('carousel-wrapper-hp');
  const options = variants(el, box, ctx);
  const fore = box.find('.foreground-image-wrapper img, .foreground img').first();
  const front = fore.length ? picture(fore, ctx) : '';
  const cells = [media(el, box, ctx), copy(el, box, ctx), front, slide ? options.join(', ') : ''];
  if (!cells.flat().some(Boolean)) return undefined;
  while (!cells.at(-1).length) cells.pop();
  return ctx.block('hero', slide ? [] : options, [cells], { merge: slide });
}
