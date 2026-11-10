// Scores two full-page screenshots: height gap and share of pixels that differ.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

export const MAX_DIFF_PERCENT = 0.5;
const FUZZ = '6%';

function magick(args) {
  const run = spawnSync('magick', args, { encoding: 'utf8' });
  if (run.error) throw new Error(`magick failed to start: ${run.error.message}`);
  return run;
}

function sizeOf(png) {
  if (!existsSync(png)) throw new Error(`score: image not found: ${png}`);
  const run = magick(['identify', '-format', '%w %h', png]);
  if (run.status !== 0) throw new Error(`score: cannot read ${png}: ${run.stderr.trim()}`);
  const [w, h] = run.stdout.trim().split(' ').map(Number);
  return { w, h };
}

function countDifferent(a, b, w, h) {
  const crop = `[${w}x${h}+0+0]`;
  const run = magick(['compare', '-metric', 'AE', '-fuzz', FUZZ, `${a}${crop}`, `${b}${crop}`, 'null:']);
  const count = Number.parseFloat(run.stderr);
  if (Number.isNaN(count)) throw new Error(`score: magick compare failed: ${run.stderr.trim()}`);
  return count;
}

export function score(sourcePng, migratedPng, width) {
  const source = sizeOf(sourcePng);
  const migrated = sizeOf(migratedPng);
  const w = Math.min(width, source.w, migrated.w);
  const h = Math.min(source.h, migrated.h);
  const diffPercent = (countDifferent(sourcePng, migratedPng, w, h) / (w * h)) * 100;
  const pass = source.h === migrated.h && diffPercent <= MAX_DIFF_PERCENT;
  return {
    heightSource: source.h, heightMigrated: migrated.h, diffPercent, pass,
  };
}
