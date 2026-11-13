// Shared content: experience fragments and inherited rails that two or more pages use become
// fragment documents. The registry maps (language, name, content) to a path, and never
// renumbers: see CONTRACT.md d).
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { IMPORT } from './config.mjs';
import { readJson } from './store.mjs';
import { snapshot } from './snapshot.mjs';

export const REGISTRY = join(IMPORT, 'fragments.json');
export const RAIL = 'rail';

/** { text, hash } of a fragment's source content: its words, links and images. */
export function signature($, el) {
  // without any white space: the hash must not depend on how words are told apart
  const text = snapshot(el).text().replace(/\s+/g, '');
  const links = $(el).find('a[href]').toArray().map((a) => a.attribs.href);
  const images = $(el).find('img').toArray()
    .map((img) => (img.attribs.src ?? '').split('?')[0]);
  const extra = $(el).find('iframe, form, [data-form-id], video').length;
  const hash = createHash('sha1').update([text, ...links, ...images].join('\n')).digest('hex');
  return { empty: !text && !images.length && !extra, hash: hash.slice(0, 12) };
}

export const keyOf = (lang, name, hash) => `${lang}|${name}|${hash}`;

/** The document path of a fragment, without the site folder. */
function pathOf(lang, name, n) {
  const base = name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  const numbered = name === RAIL || n > 1 ? `${base}-${n}` : base;
  return `/fragments/${lang === 'en' ? '' : `${lang}/`}${numbered}`;
}

/**
 * Adds the fragments of `uses` (key -> { pages, from }) that two or more pages use to the
 * registry. For one name and language the most used content gets the lowest free number.
 */
export function assign(registry, uses) {
  const taken = new Set(Object.values(registry).map((e) => e.path));
  Object.entries(uses)
    .filter(([key, use]) => use.pages >= 2 && !registry[key])
    .sort(([a, x], [b, y]) => y.pages - x.pages || a.localeCompare(b))
    .forEach(([key, use]) => {
      const [lang, name] = key.split('|');
      let n = 1;
      while (taken.has(pathOf(lang, name, n))) n += 1;
      taken.add(pathOf(lang, name, n));
      registry[key] = { path: pathOf(lang, name, n), pages: use.pages, from: use.from };
    });
  Object.entries(uses).forEach(([key, use]) => {
    if (registry[key]) Object.assign(registry[key], { pages: use.pages });
  });
  return registry;
}

export function loadRegistry() {
  const registry = readJson(REGISTRY);
  return {
    /** The registered fragment for this content, or undefined when it is inlined. */
    lookup(lang, name, $, el) {
      const { empty, hash } = signature($, el);
      return empty ? undefined : registry[keyOf(lang, name, hash)];
    },
  };
}
