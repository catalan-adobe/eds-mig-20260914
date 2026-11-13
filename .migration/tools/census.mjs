#!/usr/bin/env node
// Census of the fetched server HTML: templates, and the AEM components inside the page body
// (header and footer experience fragments apart). Writes source/census.json.
//   node census.mjs            summary tables
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import { fileFor } from './fetch-pages.mjs';

const SRC = join(import.meta.dirname, '..', 'source');
const GRID = /^(aem-Grid|aem-GridColumn)/;
const CHROME = '.cmp-experiencefragment--topnav, .cmp-experiencefragment--footer, .cmp-experiencefragment--chatbot';

/** A component wrapper is an AEM grid column: its first class is the component's name. */
function componentsOf($) {
  $(CHROME).closest('.experiencefragment').remove();
  const names = [];
  $('body .aem-GridColumn, body [class*="cmp-"]').each((_, el) => {
    const classes = ($(el).attr('class') ?? '').split(/\s+/).filter(Boolean);
    if (classes.some((c) => c === 'aem-GridColumn')) {
      const name = classes.find((c) => !GRID.test(c));
      if (name) names.push({ name, variant: classes.filter((c) => !GRID.test(c) && c !== name).sort().join('.') });
    }
  });
  return names;
}

const pages = readFileSync(join(SRC, 'pages.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const census = { fetched: pages.length, status: {}, templates: {}, components: {}, pages: {} };
for (const p of pages) {
  census.status[p.status] = (census.status[p.status] ?? 0) + 1;
  if (p.status !== 200 || !existsSync(fileFor(p.url))) continue;
  const $ = load(readFileSync(fileFor(p.url), 'utf8'));
  const body = $('body');
  const template = body.attr('data-template') ?? '(none)';
  const path = new URL(p.url).pathname;
  const t = census.templates[template] ??= { pages: 0, examples: [], pageTypes: {} };
  t.pages += 1;
  if (t.examples.length < 5) t.examples.push(path);
  const pt = body.attr('data-page-type') ?? '';
  t.pageTypes[pt] = (t.pageTypes[pt] ?? 0) + 1;
  const comps = componentsOf($);
  const seen = new Set();
  for (const { name, variant } of comps) {
    const c = census.components[name] ??= { instances: 0, pages: 0, templates: {}, variants: {}, examples: [] };
    c.instances += 1;
    if (variant) c.variants[variant] = (c.variants[variant] ?? 0) + 1;
    if (seen.has(name)) continue;
    seen.add(name);
    c.pages += 1;
    c.templates[template] = (c.templates[template] ?? 0) + 1;
    if (c.examples.length < 6 && !c.examples.some((e) => e.split('/')[1] === path.split('/')[1])) c.examples.push(path);
  }
  census.pages[path] = { template, components: [...seen] };
}
writeFileSync(join(SRC, 'census.json'), JSON.stringify(census, null, 1));
const n = Object.keys(census.pages).length;
console.log(`fetched ${census.fetched}, status ${JSON.stringify(census.status)}, parsed ${n}`);
console.log('\nTEMPLATES');
Object.entries(census.templates).sort((a, b) => b[1].pages - a[1].pages)
  .forEach(([k, v]) => console.log(`${String(v.pages).padStart(5)}  ${k}  ${v.examples[0]}`));
console.log('\nCOMPONENTS (pages, instances, variants)');
Object.entries(census.components).sort((a, b) => b[1].pages - a[1].pages)
  .forEach(([k, v]) => console.log(`${String(v.pages).padStart(5)} ${String(v.instances).padStart(6)} ${String(Object.keys(v.variants).length).padStart(3)}  ${k}  ${v.examples[0]}`));
