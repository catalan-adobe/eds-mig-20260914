#!/usr/bin/env node
// Writes the index sheets of CONTRACT e): one JSON workbook per language, read by `listing` and
// `teasers`. Rows come from the fetched source pages: search metas, blogBanner, page tags, and
// the post lists the server renders on the author pages (they hold the webinar speakers).
//   node index.mjs [--dry | --cached]
//     --dry: write M/out/data/ only, nothing is uploaded or previewed
//     --cached: use only the thumbnails that are in DA already, fetch none from the source
// Thumbnails are copied into DA by the media helper and previewed, so that the site serves them
// at /media/<name>. The `image` column holds that path, without the site folder.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import { preview, upload } from '../tools/da.mjs';
import { getSource } from '../tools/source.mjs';
import {
  M, MEDIA_FOLDER, OUT, PAGES, languageOf,
} from './lib/config.mjs';
import { MANIFEST as MEDIA_MANIFEST, createMedia, pickSource } from './lib/media.mjs';
import { pool } from './lib/publish.mjs';
import { readJson, updateJson } from './lib/store.mjs';

const DRY = process.argv.includes('--dry');
const CACHED = process.argv.includes('--cached');
const PREVIEWED = join(OUT, 'index-media.json');
const SKIP = /^\/([a-z]{2}-[a-z]{2}\/)?refs\/global-navigation[/.]/;
const SHEETS = {
  blogs: ['Blog'],
  articles: ['Article', 'Technical Paper'],
  webinars: ['Webinar'],
  events: ['Event'],
  'success-stories': ['Success Story'],
  resources: ['White Paper', 'eBook', 'Video', 'Datasheet', 'Demo', 'Report'],
  news: ['Press Release', 'News', 'News Release'],
};
const MONTHS = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');
const squash = (text) => (text ?? '').replace(/\s+/g, ' ').trim();
const pathOf = (href) => (href ?? '')
  .replace(/^https?:\/\/www\.synopsys\.com/, '')
  .replace(/\.html(?=$|[?#])/, '');
const pad = (n) => String(n).padStart(2, '0');

/** "Aug 16, 2023", "2023-02-06", "2025-6-25 11:59:59 PM" to "2023-08-16"; '' when unknown. */
export function isoDate(text) {
  const value = squash(text);
  let m = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = value.match(/^([A-Za-z]{3})[a-z]*\.? (\d{1,2}),? (\d{4})/);
  const month = m && MONTHS.indexOf(m[1].toLowerCase()) + 1;
  return month ? `${m[3]}-${pad(month)}-${pad(m[2])}` : '';
}

/** `Name=/authors/slug;…` of the author links in `scope`. */
const authorList = ($, scope) => $(scope)
  .find('a[href*="/authors/"]')
  .toArray()
  .map((a) => `${squash($(a).text())}=${pathOf(a.attribs.href)}`)
  .join(';');

/** The tags of a page or list item: { tags: 'slug=Label;…', filters, category }. */
function tagsOf($, scope) {
  const tags = [];
  const filters = [];
  let category = '';
  $(scope)
    .find('a[href*="/category."]')
    .each((_, a) => {
      const [, base, slug] = pathOf(a.attribs.href).match(/^(.*\/category)\.([^/]+)$/) ?? [];
      if (!slug) return;
      category ||= base;
      tags.push(`${slug}=${squash($(a).text())}`);
    });
  $(scope)
    .find('[data-page-tag^="synopsys:"], [data-tag^="synopsys:"]')
    .each((_, el) => {
      const id = (el.attribs['data-page-tag'] ?? el.attribs['data-tag']).slice(9);
      const label = el.attribs['data-tag'] ? '' : squash($(el).text());
      filters.push(label ? `${id}=${label}` : id);
    });
  return { tags: [...new Set(tags)].join(';'), filters: [...new Set(filters)].join(';'), category };
}

/** The posts the server lists on an author page, by path. */
function authorItems($) {
  const items = new Map();
  $('.cmp-blogsdev__mra-item-container').each((_, item) => {
    const box = $(item);
    const link = box.find('.cmp-blogsdev__mra-title a').first();
    const when = box.find('.cmp-blogsdev__mra-date-time').first();
    const author = box.find('.cmp-blogsdev__mra-author').first();
    items.set(pathOf(link.attr('href')), {
      title: squash(link.text()),
      label: squash(box.find('.cmp-blogsdev__mra-right .label').first().text()),
      image: box.find('img').first().attr('src') ?? '',
      date: isoDate(when.attr('data-published-date')),
      readTime: squash(when.text()).match(/(\d+)\s*min/)?.[1] ?? '',
      byline: squash(author.clone().children().remove().end()
        .text()).replace(/[\s,]+$/, ''),
      authors: authorList($, author),
      ...tagsOf($, box),
    });
  });
  return items;
}

/** Labels of the filter tags under `prefix`, `;` between: the blog series, the regions. */
const labelsOf = (filters, prefix) => filters
  .split(';')
  .filter((f) => f.startsWith(prefix))
  .map((f) => f.split('=')[1])
  .filter(Boolean)
  .join(';');

/** One row of the content sheets from a page; `item` is its entry in an author list. */
function rowOf($, path, item = {}) {
  const meta = (name) => squash($(`meta[name="${name}"]`).attr('content'));
  const banner = $('.cmp-blogbanner[data-blog-banner-variant="article"]').first();
  const own = tagsOf(
    $,
    $('.cmp-blogsdev:not([data-blogsdev-type]) .cmp-blogsdev__pagetags-container').first(),
  );
  const title = item.title
    || squash(banner.attr('data-blog-title'))
    || squash($('h1').first().text())
    || squash($('head title').text()).replace(/\s+\|.*$/, '');
  const filters = item.filters || own.filters;
  return {
    path: pathOf(path),
    title,
    description: meta('description'),
    image: item.image || meta('searchImage'),
    type: meta('searchContentType'),
    label: item.label ?? '',
    date:
      isoDate(banner.attr('data-blog-publish-date')) || item.date || isoDate(meta('last-modified')),
    readTime: squash(banner.find('.read-time').text()).match(/\d+/)?.[0] ?? item.readTime ?? '',
    byline: item.byline || 'By',
    authors: item.authors || authorList($, banner.find('.authors')),
    tags: item.tags || own.tags,
    filters,
    series: labelsOf(filters, 'content-type/blog/'),
    region: labelsOf(filters, 'regions/'),
    category: item.category || own.category,
    product: meta('searchProductCategory'),
    solution: meta('searchSolutionType'),
    businessArea: meta('searchBusinessArea'),
    stage: meta('searchMarketingStageType'),
  };
}

function authorRow($, path, posts = []) {
  const profile = $('.component-author-profile').first();
  const img = profile.find('img').get(0);
  return {
    path: pathOf(path),
    name:
      squash(profile.find('h2').first().text())
      || squash($('head title').text()).replace(/\s+\|.*$/, ''),
    image: img ? pickSource(img, path) : '',
    posts: posts.join(';'),
  };
}

const fetched = () => readFileSync(join(M, 'source', 'pages.jsonl'), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l))
  .filter((p) => p.status === 200)
  .map((p) => new URL(p.url).pathname)
  .filter((p) => !SKIP.test(p));

const readPage = (path) => readFileSync(join(PAGES, path === '/' ? '/index.html' : path), 'utf8');
const isAuthor = (html) => html.includes('data-template="chip-design-author-page"');
// the lists themselves are not results
const LIST = new RegExp('data-template="(chip-design-landing-page|article-landing-page'
  + '|[a-z-]*category-page)"|atomicSearchInterface');

/** The workbooks: Map(lang -> { sheet name -> rows }). Two passes keep one page in memory. */
function workbooks() {
  const paths = fetched();
  const items = new Map();
  const lists = new Map();
  paths.forEach((path) => {
    const html = readPage(path);
    if (!isAuthor(html)) return;
    const own = authorItems(load(html));
    own.forEach((item, key) => items.set(key, item));
    lists.set(path, [...own.keys()]);
  });
  const books = new Map();
  const add = (lang, sheet, row) => {
    if (!books.has(lang)) books.set(lang, {});
    (books.get(lang)[sheet] ??= []).push(row);
  };
  const built = new Map();
  paths.forEach((path) => {
    const html = readPage(path);
    const types = html.match(/name="searchContentType" content="([^"]+)"/)?.[1].split(';') ?? [];
    const sheets = Object.keys(SHEETS).filter((s) => SHEETS[s].some((t) => types.includes(t)));
    if (LIST.test(html) || (!sheets.length && !isAuthor(html))) return;
    const $ = load(html);
    if (isAuthor(html)) add(languageOf(path), 'authors', authorRow($, path, lists.get(path)));
    if (!sheets.length) return;
    const row = rowOf($, path, items.get(pathOf(path)));
    built.set(row.path, row);
    sheets.forEach((sheet) => add(languageOf(path), sheet, row));
  });
  // the posts of the author pages, also those of no other sheet (glossary entries)
  const empty = load('');
  const posts = new Set(
    [...lists].flatMap(([path, list]) => list.map((p) => `${languageOf(path)} ${p}`)),
  );
  posts.forEach((key) => {
    const [lang, path] = key.split(' ');
    add(lang, 'posts', built.get(path) ?? rowOf(empty, path, items.get(path)));
  });
  books.forEach((book) => Object.values(book).forEach((rows) => rows.sort(
    (a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.path.localeCompare(b.path),
  )));
  return books;
}

/**
 * Makes the DA copy of a thumbnail servable: previews it at /media/<name>. The web path collapses
 * runs of hyphens, so a name with "--" is uploaded again under the collapsed name.
 */
async function serve(name, url, previewed) {
  const web = name.replace(/-{2,}/g, '-');
  const path = `${MEDIA_FOLDER}/${web}`;
  if (previewed.has(web)) return path;
  try {
    if (web !== name) await upload(path, (await getSource(url)).body);
    await preview(path);
    previewed.add(web);
    return path;
  } catch (e) {
    console.warn(`thumbnail ${url}: ${e.message}`);
    return '';
  }
}

/** Copies every thumbnail into DA, previews it, and writes `/media/<name>` into the rows. */
async function media(books) {
  // a row object can sit in several sheets: copy its image once
  const rows = [
    ...new Set([...books.values()].flatMap((book) => Object.values(book).flat())),
  ].filter((r) => r.image);
  if (DRY) {
    rows.forEach((r) => {
      r.image = '';
    });
    return;
  }
  const helper = createMedia();
  const known = readJson(MEDIA_MANIFEST);
  const previewed = new Set(Object.keys(readJson(PREVIEWED)));
  const before = previewed.size;
  const served = new Map();
  let missing = 0;
  await pool(rows, 8, async (row) => {
    const url = new URL(row.image, 'https://www.synopsys.com').href;
    // after a bot check of the source (FETCH-STOP) only cached images can be copied
    const copy = CACHED && !known[url]?.uploaded
      ? {}
      : await helper.resolve(url).catch((e) => ({ error: e.message }));
    if (copy.error) missing += 1;
    const name = copy.url?.split('/').pop();
    if (name && !served.has(name)) {
      served.set(name, serve(name, url, previewed));
      if (served.size % 100 === 0) console.log(`${served.size} thumbnails`);
    }
    row.image = name ? await served.get(name) : '';
  });
  helper.save();
  const all = Object.fromEntries([...previewed].map((n) => [n, 1]));
  updateJson(PREVIEWED, (data) => Object.assign(data, all));
  console.log(
    `${previewed.size - before} thumbnails previewed, ${previewed.size} in all, `
      + `${missing} not copied`,
  );
}

function workbook(book) {
  const names = Object.keys(book).sort();
  const out = { ':names': names, ':version': 3, ':type': 'multi-sheet' };
  names.forEach((name) => {
    const data = book[name];
    out[name] = {
      total: data.length,
      offset: 0,
      limit: data.length,
      data,
    };
  });
  return out;
}

async function main() {
  const books = workbooks();
  await media(books);
  await Promise.all(
    [...books].map(async ([lang, book]) => {
      const where = `${lang === 'en' ? '' : `/${lang}`}/data/index.json`;
      const file = join(OUT, 'data', lang, 'index.json');
      mkdirSync(join(OUT, 'data', lang), { recursive: true });
      writeFileSync(file, JSON.stringify(workbook(book)));
      const counts = Object.entries(book)
        .map(([s, r]) => `${s} ${r.length}`)
        .join(', ');
      console.log(`${lang}: ${counts}`);
      if (DRY) return;
      await upload(where, readFileSync(file), 'application/json');
      await preview(where);
    }),
  );
}

if (process.argv[1] === import.meta.filename) await main();
