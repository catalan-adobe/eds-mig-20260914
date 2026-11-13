// A list of posts that the source renders on the server: static `teasers post` rows.
// Cell 1 is the image. Cell 2: label (bold) and date, the linked title, authors, tags, link.
import { escapeHtml } from '../lib/clean.mjs';

const para = (html) => (html ? `<p>${html}</p>` : '');
const words = (node) => escapeHtml(node.text().replace(/\s+/g, ' ').trim());

/** "Tags: <a>, <a>" of a tag holder, or "By <a> , <a>" of the authors, spaced as the source. */
function line(holder, ctx) {
  return ctx.clean(holder, { inline: true }).replace(/\s+/g, ' ').trim();
}

/**
 * Date and link text of a webinar card. The source swaps them in the browser once the webinar
 * is over; the rows are static, so the state at import time is written.
 */
function webinar(card, list, ctx) {
  const date = card.find('.date-time[data-webinar-time-zone]').first();
  const day = new Date(`${date.text().trim()} 23:59:59Z`);
  if (!date.length || Number.isNaN(day.getTime())) return {};
  const offset = Number(date.attr('data-webinar-utc-offset')) || 0;
  const over = Date.now() + offset * 36e5 > day.getTime();
  const label = list.attr(`data-webinar-cta-text-${over ? 'ondemand' : 'upcoming'}`);
  if (label) ctx.drop(card.find('.cta a span'), 'webinar link text: set by the date');
  if (over) ctx.drop(date, 'webinar date: over, shown as On Demand');
  return { date: over ? 'On Demand' : '', label };
}

function post(card, list, ctx) {
  const body = card.children('.card-text').first();
  ctx.drop(body.find('.profile-circle'), 'author photos come from the index');
  const state = webinar(card, list, ctx);
  const title = ctx.clean(body.find('.heading a').first(), { inline: true });
  const action = body.find('.cta a').first();
  if (state.label) action.find('span').text(state.label);
  const text = [
    para(words(body.find('.label')) && `<strong>${words(body.find('.label'))}</strong>`),
    para(state.date || words(body.find('.date-time'))),
    title && `<h4>${title}</h4>`,
    para(line(body.find('.authors-links'), ctx)),
    para(line(body.find('.tag-holder'), ctx)),
    para(ctx.clean(action, { inline: true }).trim()),
  ];
  return [ctx.image(card.find('.image-wrapper img').first()), text.filter(Boolean)];
}

export default function dynamicCards(el, ctx) {
  const { $ } = ctx;
  const list = $(el).find('.cmp-dynamiccards').first();
  const cards = list.find('.component-card-b').toArray().map((c) => $(c));
  if (!cards.length) return [];
  const limit = Math.round(Number(list.attr('data-dynamic-card-limit'))) || cards.length;
  // inside shared content the source lists one post more than its limit: in the browser it
  // removes the post of the current page, or else the last one. The block does the same.
  const shared = $(el).closest('.cmp-experiencefragment').length > 0 && cards.length > limit;
  const shown = shared ? limit : cards.length;
  const columns = Number(list.attr('class').match(/\bcol-(\d)\b/)?.[1]) || 3;
  const variants = ['post', `cols-${columns}`];
  // the source slides only when it shows more posts than fit in one view
  if (list.find('.slick-carousel').length && shown > columns) variants.push('carousel');
  if (shared) variants.push(`limit-${limit}`);
  return ctx.block('teasers', variants, cards.map((card) => post(card, list, ctx)));
}
