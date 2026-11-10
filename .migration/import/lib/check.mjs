// Self-check of a generated document and verification of its preview.
import { load } from 'cheerio';
import { FOLDER } from './convert.mjs';
import { CONTENT } from './da.mjs';

export const BLOCKS = new Set([
  'hero', 'teaser', 'cards', 'tabs', 'accordion', 'quote', 'adventure-details', 'contributor',
  'download', 'up-next', 'search', 'columns', 'separator', 'section-metadata', 'metadata',
]);

const count = (list) => list.reduce((map, key) => map.set(key, (map.get(key) || 0) + 1), new Map());

function linkError(href) {
  if (/^(#|mailto:|tel:)/.test(href)) return '';
  if (/^https?:\/\//.test(href)) {
    return /\/\/([^/]*\.)?wknd\.site/.test(href) ? 'points at wknd.site' : '';
  }
  if (!href.startsWith(`${FOLDER}/`)) return `is not under ${FOLDER}`;
  return /\.html([?#]|$)/.test(href) ? 'ends in .html' : '';
}

/**
 * Checks generated DA HTML against the contract rules.
 * @param {object} doc the Doc the HTML was made from
 * @param {string} html final HTML, image URLs already pointing at DA
 * @param {Map<string, string>} mediaUrl source image URL to DA URL
 * @returns {string[]} problems, empty when the document is fine
 */
export function selfCheck(doc, html, mediaUrl) {
  const $ = load(html);
  const errors = [];
  const $sections = $('main > div');
  if (!$sections.length || !$sections.children().length) errors.push('empty main');
  if ($('hr').length) errors.push('<hr> would become a section break');
  $sections.children('div').each((_, e) => {
    const name = ($(e).attr('class') || '').split(' ')[0];
    if (!BLOCKS.has(name)) errors.push(`unknown block "${name}"`);
  });
  $('a').each((_, a) => {
    const href = $(a).attr('href') || '';
    const problem = linkError(href);
    if (problem) errors.push(`link "${href}" ${problem}`);
  });
  const actual = count($('img').toArray().map((i) => `${$(i).attr('src')} | ${$(i).attr('alt')}`));
  $('img').each((_, i) => {
    const src = $(i).attr('src');
    if (!src.startsWith(`${CONTENT}/media/`)) errors.push(`image not hosted in DA: ${src}`);
  });
  count(doc.images.map((i) => `${mediaUrl.get(i.url)} | ${i.alt}`)).forEach((n, key) => {
    if (actual.get(key) !== n) errors.push(`image or alt text lost: ${key}`);
  });
  return errors;
}

/**
 * Compares the previewed .plain.html with the generated document.
 * @param {object} doc the Doc that was uploaded
 * @param {string} plain body of <path>.plain.html
 * @returns {string[]} problems, empty when the preview matches
 */
export function verifyPlain(doc, plain) {
  const $ = load(plain);
  const errors = [];
  const names = (list) => [...new Set(list)]
    .filter((n) => !['metadata', 'section-metadata'].includes(n)).sort().join(', ');
  const $sections = $('body > div');
  const previewed = names($sections.children('div[class]').toArray()
    .map((e) => $(e).attr('class')));
  if (previewed !== names(doc.blocks)) {
    errors.push(`blocks differ: preview [${previewed}] generated [${names(doc.blocks)}]`);
  }
  const sections = doc.sections.filter((s) => s.items.length);
  if ($sections.length !== sections.length) {
    errors.push(`${$sections.length} sections, expected ${sections.length}`);
  }
  sections.forEach((s, i) => s.styles.forEach((style) => {
    if (!$sections.eq(i).hasClass(style)) errors.push(`section ${i + 1} lacks style ${style}`);
  }));
  const notIngested = $('img').toArray().map((i) => $(i).attr('src'))
    .filter((src) => !/^\.\/media_/.test(src));
  if (notIngested.length) errors.push(`images not ingested: ${notIngested.join(' ')}`);
  const expected = doc.images.length - doc.metaImages;
  if ($('img').length !== expected) errors.push(`${$('img').length} images, expected ${expected}`);
  $('a').each((_, a) => {
    const problem = linkError($(a).attr('href') || '');
    if (problem) errors.push(`link "${$(a).attr('href')}" ${problem}`);
  });
  return errors;
}
