#!/usr/bin/env node
// A stratified sample of fetched pages that are NOT representative pages: round-robin over
// template and language, so rare templates are present. For a long-tail check after rollout.
//   node sample.mjs <n>      prints n source paths
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(import.meta.dirname, '..', 'source');
const n = Number(process.argv[2] || 100);
const reps = new Set(readFileSync(join(SRC, 'reps.txt'), 'utf8').split('\n'));
const census = JSON.parse(readFileSync(join(SRC, 'census.json'), 'utf8'));
const groups = new Map();
Object.entries(census.pages).filter(([path]) => !reps.has(path)).forEach(([path, { template }]) => {
  const key = `${template} ${path.match(/^\/(ja-jp|zh-cn|zh-tw|ko-kr)\//)?.[1] ?? 'en'}`;
  groups.set(key, [...(groups.get(key) ?? []), path]);
});
const lists = [...groups.values()];
const out = [];
// take from the middle of each list first: the start of a list is alphabetical, not typical
for (let i = 0; out.length < n && lists.some((l) => l.length > i); i += 1) {
  lists.forEach((l) => { if (l.length > i && out.length < n) out.push(l[(Math.floor(l.length / 2) + i) % l.length]); });
}
console.log(out.join('\n'));
