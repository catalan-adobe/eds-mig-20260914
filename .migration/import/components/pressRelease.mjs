// The latest press releases. The source reads an RSS feed in the browser; the importer writes
// the items of the cached feed as static `teasers news` rows: the linked title, then the date.
import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import { escapeAttr, escapeHtml } from '../lib/clean.mjs';

const CACHE = join(import.meta.dirname, '..', '..', 'source', 'cache');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];

/** The items of a cached feed, or [] when the feed was never loaded. */
function feedItems(url) {
  const { hostname, pathname } = new URL(url);
  const file = globSync(`${hostname}_*${pathname}/*`, { cwd: CACHE })
    .find((f) => !f.endsWith('{meta}.json'));
  if (!file) return [];
  const $ = load(readFileSync(join(CACHE, file), 'utf8'), { xml: true });
  return $('item').toArray().map((item) => ({
    title: $(item).children('title').text().trim(),
    link: $(item).children('link').text().trim(),
    date: new Date($(item).children('pubDate').text()),
  }));
}

export default function pressRelease(el, ctx) {
  const box = ctx.$(el).find('.component-press-release').first();
  const heading = ctx.clean(box.children('.component-text').first());
  const count = Number(box.attr('data-num-releases')) || 4;
  const items = feedItems(box.attr('data-release-feed-url') ?? 'https://-/').slice(0, count);
  if (!items.length) {
    ctx.warn('press release feed is not in the cache: only the heading is migrated');
    return heading;
  }
  // the source formats the date in the visitor's time zone; the importer's zone is used
  const rows = items.map(({ title, link, date }) => [[
    `<p><a href="${escapeAttr(link)}">${escapeHtml(title)}</a></p>`,
    `<p>${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}</p>`,
  ]]);
  if (count >= 5) ctx.warn('five or more releases are three per row in the source: two here');
  return ctx.block('teasers', ['news', 'cols-2'], [[heading], ...rows]);
}
