// Scores pages of the migrated site against the original.
// Usage: node tools/compare/run.js [--base <url>] [--width <px>] [--group <a,b>] [--only <prefix>]
//        [--refresh-source] [--save-baseline] [--all]
// Exit codes: 0 every page passes, 1 a page fails the bar, 2 a tool error.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { CACHE, capturePair, closeSessions } from './capture.js';
import { GROUPS, pagesIn } from './groups.js';
import { score } from './score.js';

const WIDTHS = [1440, 390];
const SESSIONS = 4;
const WORST_ROWS = 15;
const REPORT = `${CACHE}report.json`;
const BASELINE = new URL('./baseline.json', import.meta.url).pathname;

const OPTIONS = {
  base: { type: 'string', default: 'http://localhost:3000' },
  width: { type: 'string' },
  group: { type: 'string' },
  only: { type: 'string' },
  'refresh-source': { type: 'boolean', default: false },
  'save-baseline': { type: 'boolean', default: false },
  all: { type: 'boolean', default: false },
};

function selectPages({ group, only }) {
  const pages = pagesIn(group ? group.split(',') : GROUPS)
    .filter((path) => !only || path.startsWith(only));
  if (!pages.length) throw new Error(`no page matches --group ${group ?? 'all'} --only ${only ?? ''}`);
  return pages;
}

function selectWidths({ width }) {
  if (!width) return WIDTHS;
  if (!/^\d+$/.test(width)) throw new Error(`--width needs a number, got "${width}"`);
  return [Number(width)];
}

async function measure(path, width, session, opts) {
  const { source, migrated } = await capturePair(path, width, {
    base: opts.base.replace(/\/$/, ''),
    session,
    refreshSource: opts['refresh-source'],
  });
  return { path, width, ...score(source.png, migrated.png, width) };
}

async function scoreAll(jobs, opts) {
  const results = [];
  let next = 0;
  let failure = null;
  const worker = async (session) => {
    while (!failure && next < jobs.length) {
      const [path, width] = jobs[next];
      next += 1;
      try {
        results.push(await measure(path, width, session, opts));
      } catch (e) {
        failure ??= e;
      }
    }
  };
  await Promise.all(Array.from({ length: SESSIONS }, (_, i) => worker(`compare${i}`)));
  if (failure) throw failure;
  return results;
}

const gapOf = (r) => r.heightMigrated - r.heightSource;

function formatRows(rows) {
  const pad = Math.max(...rows.map((r) => r.path.length));
  return rows.map((r) => [
    r.path.padEnd(pad),
    String(r.width).padStart(4),
    String(r.heightSource).padStart(6),
    `${gapOf(r) > 0 ? '+' : ''}${gapOf(r)}`.padStart(6),
    `${r.diffPercent.toFixed(2)}%`.padStart(7),
    r.pass ? 'PASS' : 'FAIL',
  ].join(' '));
}

function summarize(results, all) {
  const lines = [];
  const worst = [...results].sort((a, b) => (a.pass - b.pass) || (b.diffPercent - a.diffPercent));
  const shown = all ? worst : worst.slice(0, WORST_ROWS);
  lines.push(...formatRows(shown));
  if (shown.length < worst.length) lines.push(`... ${worst.length - shown.length} more rows (--all)`);
  lines.push(`${results.filter((r) => r.pass).length}/${results.length} pass`);
  return lines;
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return {};
    throw e;
  }
}

async function mergeInto(file, results) {
  const stored = await readJson(file);
  results.forEach(({ path, width, ...rest }) => {
    stored[width] = { ...stored[width], [path]: rest };
  });
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(stored, null, 2)}\n`);
}

async function main() {
  const { values: opts } = parseArgs({ options: OPTIONS });
  const pages = selectPages(opts);
  const widths = selectWidths(opts);
  const jobs = widths.flatMap((width) => pages.map((path) => [path, width]));
  const results = await scoreAll(jobs, opts);
  await mergeInto(REPORT, results);
  if (opts['save-baseline']) await mergeInto(BASELINE, results);
  widths.forEach((width) => {
    if (widths.length > 1) console.log(`== ${width} ==`);
    summarize(results.filter((r) => r.width === width), opts.all).forEach((l) => console.log(l));
  });
  return results.every((r) => r.pass) ? 0 : 1;
}

try {
  process.exitCode = await main();
} catch (e) {
  console.error(`compare: ${e.message}`);
  process.exitCode = 2;
} finally {
  await closeSessions();
}
