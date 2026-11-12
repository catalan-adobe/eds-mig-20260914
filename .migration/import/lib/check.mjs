// The self-check of a built document, and the content check against its source.
import { load } from 'cheerio';
import { MEDIA_BASE, SITE } from './config.mjs';
import { snapshot } from './snapshot.mjs';

export const MIN_RECALL = 0.98;
const CJK = '\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}\\p{Script=Hangul}';
const WORD = new RegExp(`[${CJK}]|(?:(?![${CJK}])[\\p{L}\\p{N}])+`, 'gu');
const ON_SOURCE = /^(https?:)?\/\/(www\.)?synopsys\.com(\/|$)/i;

/** Words of a text: lower case; a CJK character is a word of its own. */
export const words = (text) => text.normalize('NFKC').toLowerCase().match(WORD) ?? [];

/** How much of the source's words the output has: { recall, missing: [words] }. */
export function recall(sourceText, text) {
  const have = new Map();
  words(text).forEach((w) => have.set(w, (have.get(w) ?? 0) + 1));
  const wanted = words(sourceText);
  const missing = wanted.filter((w) => {
    const n = have.get(w) ?? 0;
    if (n) have.set(w, n - 1);
    return !n;
  });
  return {
    recall: wanted.length ? (wanted.length - missing.length) / wanted.length : 1,
    words: wanted.length,
    missing,
  };
}

const isFile = (path) => path.startsWith('/content/dam/')
  || (/\.[a-z0-9]{1,5}$/i.test(path) && !/\.html?$/i.test(path));

function linkProblem(href) {
  if (ON_SOURCE.test(href)) {
    const path = href.replace(ON_SOURCE, '/').replace(/[?#].*$/, '');
    return isFile(path) ? '' : 'internal link still on synopsys.com';
  }
  if (!href.startsWith('/') || href.startsWith('//')) return '';
  if (/^[^?#]*\.html?([?#]|$)/i.test(href)) return 'internal link ends in .html';
  const inside = href === SITE || href.startsWith(`${SITE}/`);
  return inside ? '' : 'internal link outside the site folder';
}

/**
 * Checks a DA document. Returns the list of failures, empty when the document is sound.
 * @param {string} html the document
 * @param {object} options { blocks: Set of block names of the contract, alts: alt texts the
 *   source has }
 */
export function selfCheck(html, { blocks, alts = [] }) {
  const $ = load(html);
  const failures = [];
  const fail = (what, detail) => failures.push(detail ? `${what}: ${detail}` : what);
  const main = $('main');
  const content = main.children('div').children().not('.metadata, .section-metadata');
  if (!content.length) fail('empty main');
  main.children('div').children('div[class]').each((_, el) => {
    const name = el.attribs.class.split(/\s+/)[0];
    if (!blocks.has(name)) fail('block not in the contract', name);
  });
  if (main.find('script').length) fail('script element');
  if (main.find('style').length) fail('style element');
  if (main.find('[style]').length) fail('style attribute');
  if (main.find('hr').length) fail('hr element: DA reads it as a section break');
  main.find('a[href]').each((_, a) => {
    const problem = linkProblem(a.attribs.href.trim());
    if (problem) fail(problem, a.attribs.href);
  });
  const outputAlts = new Set();
  main.find('img').each((_, img) => {
    const src = img.attribs.src ?? '';
    if (!src.startsWith(MEDIA_BASE)) fail('image not on content.da.live', src || 'no src');
    outputAlts.add((img.attribs.alt ?? '').trim());
  });
  [...new Set(alts)].filter((alt) => alt && !outputAlts.has(alt))
    .forEach((alt) => fail('alt text missing', alt));
  return failures;
}

/**
 * True when a previewed .plain.html shows this document, not an earlier upload that the CDN
 * still holds: both have the same words (icons are elements in the preview, not text).
 */
export function isFresh(html, plainHtml) {
  // eslint-disable-next-line no-use-before-define
  const ours = outputText(html).replace(/:[a-z0-9-]+:/g, ' ');
  const theirs = snapshot(load(`<main>${plainHtml}</main>`)('main')[0]).text();
  return recall(ours, theirs).recall >= 0.99 && recall(theirs, ours).recall >= 0.99;
}

/** The text of a DA document that the content check compares: no metadata blocks. */
export function outputText(html) {
  const $ = load(html);
  $('main .metadata, main .section-metadata').remove();
  return snapshot($('main')[0]).text();
}
