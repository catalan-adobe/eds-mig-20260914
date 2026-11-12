// A mosaic card of rich text: one `mosaic rich` row. Cell 1 the background colour, the colour
// of its headings when the source sets one, and the card's link; cell 2 the text.
import { escapeHtml } from '../lib/clean.mjs';

const COLOURS = {
  orange: '#fcaf1a',
  green: '#9c3',
  blue: '#4c9ec9',
  purple: '#80539c',
  'synopsys-purple': '#5a2a82',
  teal: '#00b2a9',
  'dark-turquoise': '#12788a',
  gray: '#646e81',
  'burnt-orange': '#e07c05',
  black: '#3c3c3c',
};

/**
 * The text, with its blank lines: the source spaces the card with empty lines, and a preview
 * drops an empty paragraph, so a blank line is a paragraph of one zero-width space.
 */
function text(box, ctx) {
  return box.children().toArray().map((node) => {
    const words = ctx.$(node).text().replace(/[\s\u00a0]+/g, '');
    const blank = !words && !ctx.$(node).find('img').length;
    return blank ? '<p>\u200b</p>' : ctx.clean(node);
  }).join('');
}

export default function mosaicCardRTE(el, ctx) {
  const { $ } = ctx;
  const card = $(el).find('.component-mosaicCardRTEComponent').first();
  if (!card.length) return [];
  const background = (card.attr('style') ?? '')
    .match(/background-color:\s*(#[0-9a-f]{3,6})/i)?.[1]?.toLowerCase();
  const heading = card.find('h1, h2, h3, h4, h5, h6').first().find('[class*="text-color-"]')
    .first()
    .attr('class')
    ?.match(/text-color-([a-z-]+)/)?.[1];
  const colours = [background ?? (COLOURS[heading] && '#ffffff'), COLOURS[heading]];
  const href = ctx.link(card.attr('data-link'));
  const body = text(card.find('.component-mosaicCardRTE').first(), ctx);
  // the card's link, unless its text already holds it
  const own = href && !body.includes(`href="${href}"`);
  const cell = [
    colours.some(Boolean) && `<p>${colours.filter(Boolean).join(' ')}</p>`,
    own && `<p><a href="${href}">${escapeHtml(href)}</a></p>`,
  ];
  return ctx.block('mosaic', ['rich'], [[cell.filter(Boolean).join(''), body]], { merge: true });
}
