#!/usr/bin/env node
// Print the section/block outline of a DA document (or section file): index, blocks, text preview.
// usage: node migration/tools/doc-outline.mjs <file.html>
import { readFileSync } from 'node:fs';

const html = readFileSync(process.argv[2], 'utf8');
const main = html.includes('<main>') ? html.split('<main>')[1].split('</main>')[0] : html;
const sections = [];
let depth = 0;
let start = 0;
for (const m of main.matchAll(/<(\/?)div\b[^>]*>/g)) {
  if (!m[1]) {
    if (depth === 0) start = m.index;
    depth += 1;
  } else {
    depth -= 1;
    if (depth === 0) sections.push(main.slice(start, m.index + 6));
  }
}
sections.forEach((s, k) => {
  const text = s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const blocks = [...s.matchAll(/<div class="([^"]+)"/g)].map((x) => x[1]).join(',');
  console.log(k, `[${blocks}]`, text.slice(0, 90));
});
