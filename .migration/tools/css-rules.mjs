#!/usr/bin/env node
// Query the source site's own stylesheets (from the local cache), de-minified, so a block is
// built from the source's exact rules instead of values read off a screenshot.
//   node css-rules.mjs '<regex on the selector>' [--file <part of the file name>]
//       every rule whose selector matches, grouped by file and @media, in source order
//   node css-rules.mjs --breakpoints        histogram of the @media conditions
//   node css-rules.mjs --files              the stylesheets found
// Example: node css-rules.mjs '\.cmp-key-benefits'      node css-rules.mjs '^(h[1-6]|body|a)\b'
import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';

const CACHE = join(import.meta.dirname, '..', 'source', 'cache');
const [query, ...rest] = process.argv.slice(2);
const only = rest[0] === '--file' ? rest[1] : '';
if (!query) throw new Error('usage: node css-rules.mjs <selector regex> [--file <name part>] | --breakpoints | --files');

const files = globSync('www.synopsys.com_*/**/*.css', { cwd: CACHE })
  .filter((f) => !f.endsWith('{meta}.json') && f.includes(only));
if (!files.length) throw new Error(`no stylesheet in ${CACHE}${only ? ` matching ${only}` : ''}`);

const context = (node) => {
  const at = [];
  for (let p = node.parent; p && p.type !== 'root'; p = p.parent) at.unshift(`@${p.name} ${p.params}`);
  return at.join(' { ');
};

if (query === '--files') {
  files.forEach((f) => console.log(`${String(readFileSync(join(CACHE, f)).length).padStart(8)}  ${f}`));
} else if (query === '--breakpoints') {
  const counts = {};
  files.forEach((f) => postcss.parse(readFileSync(join(CACHE, f), 'utf8'))
    .walkAtRules('media', (r) => { counts[r.params] = (counts[r.params] ?? 0) + 1; }));
  Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 40)
    .forEach(([params, n]) => console.log(`${String(n).padStart(5)}  ${params}`));
} else {
  const re = new RegExp(query);
  let found = 0;
  files.forEach((f) => {
    let last = null;
    postcss.parse(readFileSync(join(CACHE, f), 'utf8')).walkRules((rule) => {
      if (!re.test(rule.selector) || rule.parent?.name?.endsWith('keyframes')) return;
      const at = context(rule);
      if (at !== last) { console.log(`\n/* ${f.split('/').pop()}${at ? `  ${at}` : ''} */`); last = at; }
      const body = rule.nodes.map((d) => `  ${d.toString()};`).join('\n');
      console.log(`${rule.selector.replace(/,\s*/g, ',\n')} {\n${body}\n}`);
      found += 1;
    });
  });
  console.error(`${found} rule(s) in ${files.length} file(s)`);
}
