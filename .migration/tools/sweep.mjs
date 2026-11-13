#!/usr/bin/env node
// Compares a list of pages at three widths (one process per width) and says who owns what
// differs. Takes 15 to 30 minutes for the representative pages: start it with bin/detach.
//   node sweep.mjs --name r1 [--pages source/reps.txt] [--base http://localhost:3520]
// Writes shots/sweep-<name>/summary.json and prints the totals:
//   stats    per width: pages, failed, median, p90 and max diff %, pages over 1 %
//   pages    per page and width: diff %, height difference
//   owners   per owner group: its bands over 1 %, with the side-by-side image. `first` marks the
//            top-most such band of a page: a band below it may only be shifted by it.
// A band belongs to the groups of the EDS blocks in it (owners.json), to the group of a source
// component whose block is missing there, and to `global` when it shows default content.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ROOT } from './lib/page.mjs';

const args = {};
process.argv.slice(2).forEach((a, i, all) => { if (a.startsWith('--')) args[a.slice(2)] = all[i + 1]; });
if (!args.name) throw new Error('usage: node sweep.mjs --name <name> [--pages <file>] [--base <origin>]');
const pages = resolve(args.pages || join(ROOT, 'source', 'reps.txt'));
const base = args.base || 'http://localhost:3520';
const widths = [1440, 768, 375];
const out = join(ROOT, 'shots', `sweep-${args.name}`);
const ACTIONABLE = 1;

const sweepWidth = (w) => new Promise((done) => {
  const child = spawn('node', [
    join(import.meta.dirname, 'compare.mjs'), '--pages', pages, '--base', base, '--width', String(w),
    '--out', join(out, String(w)), '--json', join(out, `${w}.json`), '--session', `sweep-${args.name}-${w}`,
  ], { stdio: ['ignore', 'inherit', 'inherit'] });
  child.on('exit', done);
});

/** { groups: { id: { blocks: [], components: [] } } } to lookups by block and by component. */
function ownership() {
  const file = join(ROOT, 'owners.json');
  const groups = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).groups : {};
  const byBlock = {};
  const byComponent = {};
  Object.entries(groups).forEach(([id, g]) => {
    (g.blocks ?? []).forEach((b) => { byBlock[b] = id; });
    (g.components ?? []).forEach((c) => { byComponent[c] = id; });
  });
  return { byBlock, byComponent };
}

function ownersOf(band, { byBlock, byComponent }) {
  const owners = new Set(band.target.map((b) => byBlock[b]).filter(Boolean));
  band.source.map((c) => byComponent[c]).filter(Boolean).forEach((id) => owners.add(id));
  if (!owners.size || band.target.includes('default-content')) owners.add('global');
  return [...owners];
}

const quantile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] ?? null;

function summarise() {
  const lookup = ownership();
  const summary = { name: args.name, base, stats: {}, pages: {}, owners: {} };
  widths.forEach((w) => {
    const rows = JSON.parse(readFileSync(join(out, `${w}.json`), 'utf8'));
    const ok = rows.filter((r) => !r.error);
    const diffs = ok.map((r) => r.diffPct).sort((a, b) => a - b);
    summary.stats[w] = {
      pages: rows.length,
      failed: rows.filter((r) => r.error).map((r) => `${r.page}: ${r.error}`),
      median: quantile(diffs, 0.5),
      p90: quantile(diffs, 0.9),
      max: diffs.at(-1) ?? null,
      over1: ok.filter((r) => r.diffPct > ACTIONABLE).length,
    };
    ok.forEach((r) => {
      (summary.pages[r.page] ??= {})[w] = { diffPct: r.diffPct, dh: r.tgtHeight - r.srcHeight };
      const actionable = r.bands.filter((b) => b.pct > ACTIONABLE).sort((a, b) => a.y - b.y);
      actionable.forEach((band, i) => ownersOf(band, lookup).forEach((owner) => {
        (summary.owners[owner] ??= []).push({
          page: r.page, width: w, y: band.y, pct: band.pct, first: i === 0, image: band.image,
          source: band.source, target: band.target,
        });
      }));
    });
  });
  writeFileSync(join(out, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log(`SWEEP DONE ${join(out, 'summary.json')}`);
  console.log(JSON.stringify({
    stats: Object.fromEntries(widths.map((w) => [w, { ...summary.stats[w], failed: summary.stats[w].failed.length }])),
    bandsPerOwner: Object.fromEntries(Object.entries(summary.owners).map(([o, b]) => [o, b.length])),
  }, null, 1));
}

mkdirSync(out, { recursive: true });
await Promise.all(widths.map(sweepWidth));
summarise();
