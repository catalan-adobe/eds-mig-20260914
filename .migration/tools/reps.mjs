#!/usr/bin/env node
// The representative pages: a small set that together shows every template, every component
// and every component variant the census knows, picked greedily (most new things first).
//   node reps.mjs [--max 200] [--only <component>]     prints source paths; writes source/reps.json
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';

const SRC = join(import.meta.dirname, '..', 'source');
const GRID = /^aem-Grid/;
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(`--${k}`) ? args[args.indexOf(`--${k}`) + 1] : d);
const max = Number(opt('max', 200));
const only = opt('only');
const census = JSON.parse(readFileSync(join(SRC, 'census.json'), 'utf8'));
const langOf = (p) => p.match(/^\/(ja-jp|zh-cn|zh-tw|ko-kr)\//)?.[1] ?? 'en';

/** What a page shows: its template, language, and each component with its variant classes. */
function features(path, { template, components }) {
  const $ = load(readFileSync(join(SRC, 'pages', path === '/' ? '/index.html' : path), 'utf8'));
  const set = new Set([`template:${template}`, `lang:${langOf(path)}:${template}`]);
  components.forEach((c) => set.add(`${template}/${c}`));
  $('body .aem-GridColumn').each((_, el) => {
    const [name, ...extra] = (el.attribs.class ?? '').split(/\s+/).filter((c) => c && !GRID.test(c));
    if (name) set.add(`${name}.${extra.sort().join('.')}`);
  });
  return set;
}

const pages = Object.entries(census.pages).filter(([, p]) => !only || p.components.includes(only))
  .map(([path, p]) => ({ path, features: features(path, p) }));
const covered = new Set();
const picked = [];
while (picked.length < max) {
  let best = null;
  for (const page of pages) {
    let gain = 0;
    page.features.forEach((f) => { if (!covered.has(f)) gain += 1; });
    // prefer the page with fewer features among equals: quicker to compare, easier to read
    if (gain && (!best || gain > best.gain || (gain === best.gain && page.features.size < best.page.features.size))) {
      best = { page, gain };
    }
  }
  if (!best) break;
  best.page.features.forEach((f) => covered.add(f));
  picked.push({ path: best.page.path, template: census.pages[best.page.path].template, adds: best.gain });
}
if (!only) writeFileSync(join(SRC, 'reps.json'), JSON.stringify(picked, null, 1));
picked.forEach((p) => console.log(p.path));
console.error(`${picked.length} pages cover ${covered.size} features of ${pages.length} pages`);
