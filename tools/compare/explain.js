// Explains one page at one width: the first elements whose box differs.
// Usage: node tools/compare/explain.js <path> --width <px> [--base <url>]
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { CACHE, capturePair, closeSessions } from './capture.js';
import { match } from './match.js';
import { score } from './score.js';

const ROWS = 15;
const TEXT_WIDTH = 36;
const OUTPUT = `${CACHE}explain.png`;

const box = (item) => (item ? `${item.x},${item.y} ${item.w}x${item.h}` : '-');
const differs = (row) => !row.migrated || row.dx || row.dy || row.dw || row.dh;

function formatRow(row) {
  const text = row.text.length > TEXT_WIDTH ? `${row.text.slice(0, TEXT_WIDTH - 1)}…` : row.text;
  const gap = row.migrated ? `dx ${row.dx} dy ${row.dy} dw ${row.dw} dh ${row.dh}` : 'MISSING';
  return `${row.kind} "${text}" | ${box(row.source)} -> ${box(row.migrated)} | ${gap}`;
}

async function main() {
  const { values, positionals } = parseArgs({
    options: { width: { type: 'string' }, base: { type: 'string', default: 'http://localhost:3000' } },
    allowPositionals: true,
  });
  const [path] = positionals;
  if (!path || !/^\d+$/.test(values.width ?? '')) {
    throw new Error('usage: explain.js <path> --width <px> [--base <url>]');
  }
  const width = Number(values.width);
  const { source, migrated } = await capturePair(path, width, {
    base: values.base.replace(/\/$/, ''),
    session: 'explain',
  });
  const result = score(source.png, migrated.png, width);
  console.log(`${path} ${width}: height ${result.heightSource} -> ${result.heightMigrated}, `
    + `${result.diffPercent.toFixed(2)}% differ, ${result.pass ? 'PASS' : 'FAIL'}`);
  const rows = match(source.items, migrated.items).filter(differs);
  rows.slice(0, ROWS).forEach((row) => console.log(formatRow(row)));
  if (rows.length > ROWS) console.log(`... ${rows.length - ROWS} more differing rows`);
  execFileSync('magick', [source.png, migrated.png, '-background', 'magenta', '+append', OUTPUT]);
  console.log(`wrote ${OUTPUT}`);
}

try {
  await main();
} catch (e) {
  console.error(`compare: ${e.message}`);
  process.exitCode = 2;
} finally {
  await closeSessions();
}
