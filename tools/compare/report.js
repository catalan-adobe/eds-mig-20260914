// Writes docs/pixel-parity-report.md from baseline.json and .compare/report.json.
// Usage: node tools/compare/report.js
import { readFile, writeFile } from 'node:fs/promises';
import { CACHE } from './capture.js';
import { GROUPS, groupOf } from './groups.js';

const ROOT = new URL('../../', import.meta.url);
const OUTPUT = new URL('docs/pixel-parity-report.md', ROOT);
const OPEN_DIFFERENCES = new URL('tools/compare/open-differences.md', ROOT);
const BASELINE = new URL('tools/compare/baseline.json', ROOT);

const gapOf = (r) => r.heightMigrated - r.heightSource;
const signed = (n) => `${n > 0 ? '+' : ''}${n}`;

function median(numbers) {
  if (!numbers.length) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stats(results) {
  return {
    total: results.length,
    pass: results.filter((r) => r.pass).length,
    gap: median(results.map((r) => Math.abs(gapOf(r)))),
  };
}

const cell = (s) => (s.total ? `${s.pass}/${s.total}, gap ${s.gap}` : '-');

function groupTable(width, baseline, current) {
  const lines = [
    `### ${width} px`,
    '',
    '| Group | Baseline (pass, median height gap) | Now (pass, median height gap) |',
    '|---|---|---|',
  ];
  const pick = (data, group) => Object.entries(data ?? {})
    .filter(([path]) => groupOf(path) === group)
    .map(([, r]) => r);
  GROUPS.forEach((group) => {
    lines.push(`| ${group} | ${cell(stats(pick(baseline, group)))} | ${cell(stats(pick(current, group)))} |`);
  });
  const all = (data) => cell(stats(Object.values(data ?? {})));
  lines.push(`| **all** | ${all(baseline)} | ${all(current)} |`, '');
  return lines;
}

function pageTable(widths, baseline, current) {
  const paths = [...new Set(widths.flatMap((w) => Object.keys(current[w] ?? {})))].sort();
  const fmt = (r) => (r ? `${signed(gapOf(r))} px, ${r.diffPercent.toFixed(2)}%${r.pass ? ' PASS' : ''}` : '-');
  const lines = [
    '## Pages',
    '',
    `| Page | ${widths.map((w) => `${w} baseline | ${w} now`).join(' | ')} |`,
    `|---|${widths.map(() => '---|---|').join('')}`,
  ];
  paths.forEach((path) => {
    const cells = widths.flatMap((w) => [fmt(baseline[w]?.[path]), fmt(current[w]?.[path])]);
    lines.push(`| ${path} | ${cells.join(' | ')} |`);
  });
  return lines;
}

async function readJson(file, hint) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (e) {
    throw new Error(`cannot read ${file.pathname ?? file}: ${e.message}. ${hint}`);
  }
}

async function main() {
  const baseline = await readJson(BASELINE, 'Run run.js with --save-baseline first.');
  const current = await readJson(`${CACHE}report.json`, 'Run run.js first.');
  const open = (await readFile(OPEN_DIFFERENCES, 'utf8')).replace(/^#.*\n/, '').trim();
  const widths = Object.keys(current).sort((a, b) => b - a);
  const lines = [
    '# Pixel parity report',
    '',
    'The bar: same page height, and at most 0.5% of pixels differ at `-fuzz 6%`.',
    'Gap is the migrated height minus the original height, in pixels.',
    '',
    '## Groups',
    '',
    ...widths.flatMap((w) => groupTable(w, baseline[w], current[w])),
    ...pageTable(widths, baseline, current),
    '',
    '## Open differences',
    '',
    open,
    '',
  ];
  await writeFile(OUTPUT, lines.join('\n'));
  console.log(`wrote ${OUTPUT.pathname}`);
}

main().catch((e) => {
  console.error(`compare: ${e.message}`);
  process.exitCode = 2;
});
