// Reads a fetched source page and finds its AEM components.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import { PAGES, languageOf } from './config.mjs';

const CHROME = ['topnav', 'footer', 'landing-page-topnav', 'landing-page-footer'];
// Components without the AEM grid classes sit in an inherited rail, in a carousel slide, or
// directly in the cell of a column. These classes are structure there, not components.
const STRUCTURE = /^(aem-Grid.*|par|newpar|vl|container|row)$|^cmp-/;

export const classesOf = (el) => (el.attribs?.class ?? '').split(/\s+/).filter(Boolean);
const hasClass = (el, name) => classesOf(el).includes(name);
const holdsBare = (el) => hasClass(el, 'iparys_inherited') || hasClass(el, 'cmp-carousel__item')
  || (!!el.parent?.attribs && hasClass(el.parent, 'component-column'));

/** True for the wrapper element of an AEM component. */
export function isComponent(el) {
  if (el.type !== 'tag') return false;
  if (hasClass(el, 'aem-GridColumn')) return true;
  const [first] = classesOf(el);
  return el.name === 'div' && !!first && !STRUCTURE.test(first)
    && !!el.parent?.attribs && holdsBare(el.parent);
}

/** The component name: the first class that is not a grid class. */
export const componentName = (el) => classesOf(el).find((c) => !/^aem-Grid/.test(c));

/** The nearest component wrappers below `scope`, in document order. */
export function childComponents(scope) {
  const out = [];
  const walk = (node) => (node.children ?? []).forEach((c) => {
    if (c.type !== 'tag') return;
    if (isComponent(c)) out.push(c);
    else walk(c);
  });
  walk(scope);
  return out;
}

/** The component that owns `el`: its nearest component ancestor, or null. */
export function ownerOf(el) {
  let node = el.parent;
  while (node && !isComponent(node)) node = node.parent;
  return node ?? null;
}

/** The name of an experience fragment, from cmp-experiencefragment--<name>. */
export function fragmentName(el, $) {
  const holder = $(el).children('.cmp-experiencefragment')[0];
  const cls = holder && classesOf(holder).find((c) => c.startsWith('cmp-experiencefragment--'));
  return cls ? cls.slice('cmp-experiencefragment--'.length) : '';
}

/** lower case, runs of other characters as one hyphen */
export const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Loads a source page. Returns { $, root, path, lang, template, chrome } with the header and
 * footer fragments removed; `chrome` lists the names of the removed ones.
 */
export function loadPage(path, html) {
  const file = join(PAGES, path === '/' ? 'index.html' : path);
  if (html === undefined && !existsSync(file)) throw new Error(`no fetched page: ${file}`);
  const $ = load(html ?? readFileSync(file, 'utf8'));
  const chrome = [];
  $('.experiencefragment').each((_, el) => {
    const name = fragmentName(el, $);
    if (!CHROME.includes(name)) return;
    chrome.push(name);
    $(el).remove();
  });
  const root = $('.site-wrapper > .root')[0] ?? $('body')[0];
  const template = slug($('body').attr('data-template') ?? '');
  return {
    $, root, path, lang: languageOf(path), template, chrome,
  };
}
