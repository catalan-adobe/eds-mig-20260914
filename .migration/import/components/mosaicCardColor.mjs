// A mosaic colour card: one `mosaic` row. Cell 1 the background colour, cell 2 the headline
// and the footer text; the footer is the card's link, ending with `#_blank` when the card opens
// in a new tab.
import { escapeHtml } from '../lib/clean.mjs';

const text = (node) => escapeHtml(node.text().replace(/\s+/g, ' ').trim());

export default function mosaicCardColor(el, ctx) {
  const { $ } = ctx;
  const card = $(el).find('.component-mosaicCardColor').first();
  if (!card.length) return [];
  const colour = (card.attr('style') ?? '').match(/background-color:\s*(#[0-9a-f]{3,6})/i)?.[1];
  const box = card.find('.component-text').first();
  // the footer's lines, as the source breaks them
  const lines = (box.find('.footerText').html() ?? '').split(/<br\s*\/?>/i)
    .map((line) => text($(`<p>${line}</p>`))).filter(Boolean);
  const href = ctx.link(card.attr('data-link'));
  const footer = lines.join('<br>') || (href && escapeHtml(href));
  const target = card.attr('data-new-tab') === 'true' ? `${href}#_blank` : href;
  const headline = text(box.children('p').first());
  const cell = [
    headline && `<p>${headline}</p>`,
    footer && `<p>${href ? `<a href="${target}">${footer}</a>` : footer}</p>`,
  ];
  return ctx.block('mosaic', [], [[colour?.toLowerCase() ?? '', cell.filter(Boolean).join('')]], {
    merge: true,
  });
}
