// A strip of logos that runs without end: `carousel logos`. A row is the logo, then its link.
import { escapeHtml } from '../lib/clean.mjs';

export default function logoCarousel(el, ctx) {
  const { $ } = ctx;
  const strip = $(el).find('.logo-carousel').first();
  const rows = strip.children().toArray().map((slide) => {
    const img = $(slide).find('img').first();
    const href = ctx.link($(slide).find('a').attr('href'));
    const label = escapeHtml((img.attr('alt') ?? '').trim()) || href;
    return [ctx.image(img), href ? `<a href="${href}">${label}</a>` : ''];
  }).filter((row) => row[0]);
  if (!rows.length) return undefined;
  return ctx.block('carousel', ['logos', strip.attr('dir') === 'rtl' && 'reverse'], rows);
}
