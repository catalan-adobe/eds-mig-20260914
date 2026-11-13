#!/usr/bin/env node
// Look at the source's AEM components in the fetched server HTML (no network).
//   node component.mjs html <name> [--n 3] [--max 3000] [--page /path.html]
//       the HTML of n instances, taken from different site sections, scripts and styles removed
//   node component.mjs children <name>   what sits directly inside it, as a histogram of signatures
//   node component.mjs variants <name>   its extra classes, and the classes used inside it
//   node component.mjs pages <name> [--n 30]   pages that use it (representative pages first,
//       marked *: their source assets are cached, so a browser loads them without waiting)
//   node component.mjs tree /path.html   the component tree of one page, with grid widths
// <name> is a component from `node census.mjs` (the first class of an AEM grid column).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';

const SRC = join(import.meta.dirname, '..', 'source');
const GRID = /^aem-Grid/;
const CHROME = '.cmp-experiencefragment--topnav, .cmp-experiencefragment--footer, .cmp-experiencefragment--chatbot';
const [mode, name, ...rest] = process.argv.slice(2);
const opt = (key, fallback) => (rest.includes(`--${key}`) ? rest[rest.indexOf(`--${key}`) + 1] : fallback);
if (!mode || !name) throw new Error('usage: see the comment at the top of component.mjs');

const census = JSON.parse(readFileSync(join(SRC, 'census.json'), 'utf8'));
const read = (path) => {
  const $ = load(readFileSync(join(SRC, 'pages', path === '/' ? '/index.html' : path), 'utf8'));
  $(CHROME).closest('.experiencefragment').remove();
  return $;
};
const classes = (el) => (el.attribs?.class ?? '').split(/\s+/).filter(Boolean);
const isColumn = (el) => classes(el).includes('aem-GridColumn');
const nameOf = (el) => classes(el).find((c) => !GRID.test(c));
const instances = ($) => $('body .aem-GridColumn').filter((_, el) => nameOf(el) === name);
/** The nearest component wrappers below el. */
function childComponents($, el) {
  const out = [];
  const walk = (node) => $(node).children().each((_, c) => (isColumn(c) ? out.push(c) : walk(c)));
  walk(el);
  return out;
}
// representative pages first: their source assets are in the cache, so a browser loads them at once
const reps = new Set(existsSync(join(SRC, 'reps.txt')) ? readFileSync(join(SRC, 'reps.txt'), 'utf8').split('\n') : []);
const pagesWith = () => Object.entries(census.pages).filter(([, p]) => p.components.includes(name)).map(([p]) => p)
  .sort((a, b) => reps.has(b) - reps.has(a));
/** One page per site section first, so samples differ. */
function spread(pages) {
  const bySection = new Map();
  pages.forEach((p) => bySection.set(p.split('/')[1], [...(bySection.get(p.split('/')[1]) ?? []), p]));
  const lists = [...bySection.values()];
  const out = [];
  for (let i = 0; out.length < pages.length; i += 1) lists.forEach((l) => l[i] && out.push(l[i]));
  return [...out.filter((p) => reps.has(p)), ...out.filter((p) => !reps.has(p))];
}
const histogram = (counts, top = 40) => Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, top)
  .forEach(([k, n]) => console.log(`${String(n).padStart(6)}  ${k}`));

if (mode === 'tree') {
  const $ = read(name);
  const widths = (el) => classes(el).filter((c) => /^aem-GridColumn--/.test(c)).map((c) => c.replace('aem-GridColumn--', ''));
  const walk = (el, depth) => childComponents($, el).forEach((c) => {
    const text = $(c).clone().find('.aem-GridColumn, script, style').remove().end().text().replace(/\s+/g, ' ').trim();
    const extra = classes(c).filter((x) => !GRID.test(x)).join('.');
    console.log(`${'  '.repeat(depth)}${extra} [${widths(c)}] ${JSON.stringify(text.slice(0, 60))}`);
    walk(c, depth + 1);
  });
  console.log(`template ${$('body').attr('data-template')}  page-type ${$('body').attr('data-page-type')}`);
  walk($('body')[0], 0);
} else if (mode === 'pages') {
  const pages = pagesWith();
  console.log(`${pages.length} pages`);
  spread(pages).slice(0, Number(opt('n', 30)))
    .forEach((p) => console.log(`${reps.has(p) ? '*' : ' '} ${census.pages[p].template}  ${p}`));
} else if (mode === 'html') {
  const pages = opt('page') ? [opt('page')] : spread(pagesWith()).slice(0, Number(opt('n', 3)));
  pages.forEach((p) => {
    const $ = read(p);
    const el = instances($).first();
    el.find('script, style, noscript').remove();
    const html = $.html(el).replace(/\n\s*\n+/g, '\n').replace(/^[ \t]+/gm, (s) => s.slice(0, 8));
    console.log(`\n===== ${p}  (${instances($).length} on this page)\n${html.slice(0, Number(opt('max', 3000)))}`);
  });
} else if (mode === 'children' || mode === 'variants') {
  const counts = {};
  const inner = {};
  pagesWith().forEach((p) => {
    const $ = read(p);
    instances($).each((_, el) => {
      if (mode === 'children') {
        const kids = childComponents($, el).map(nameOf);
        const runs = kids.reduce((acc, k) => {
          const last = acc.at(-1);
          if (last?.k === k) last.n += 1; else acc.push({ k, n: 1 });
          return acc;
        }, []).map((r) => (r.n > 1 ? `${r.k}×n` : r.k));
        const key = runs.join(', ') || '(no component inside)';
        counts[key] = (counts[key] ?? 0) + 1;
        return;
      }
      const key = classes(el).filter((c) => !GRID.test(c)).join('.');
      counts[key] = (counts[key] ?? 0) + 1;
      const own = $(el).clone();
      own.find('.aem-GridColumn').remove();
      const seen = new Set();
      own.find('[class]').each((__, c) => classes(c).forEach((x) => seen.add(x)));
      seen.forEach((x) => { inner[x] = (inner[x] ?? 0) + 1; });
    });
  });
  histogram(counts);
  if (mode === 'variants') { console.log('\nclasses inside (instances that have them):'); histogram(inner, 60); }
} else {
  throw new Error(`unknown mode ${mode}`);
}
