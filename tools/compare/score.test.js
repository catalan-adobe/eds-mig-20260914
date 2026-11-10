import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { score } from './score.js';

const W = 200;
const BANDS = [0, 3, 6, 9, 12].map((i) => `rectangle 0,${i * 10} ${W},${i * 10 + 4}`).join(' ');
let dir;
const file = (name) => join(dir, name);
const magick = (...args) => execFileSync('magick', args);

before(() => {
  dir = mkdtempSync(join(tmpdir(), 'compare-score-'));
  magick('-size', `${W}x150`, 'xc:white', '-fill', 'black', '-draw', BANDS, file('a.png'));
  magick(file('a.png'), '-roll', '+0+1', file('shifted.png'));
  magick(file('a.png'), '-background', 'white', '-extent', `${W}x151`, file('taller.png'));
  magick(file('a.png'), '-fill', 'black', '-draw', 'point 5,5', file('dot.png'));
});

after(() => {
  execFileSync('trash', [dir]);
});

test('score of an image with itself passes with no difference', () => {
  const result = score(file('a.png'), file('a.png'), W);
  assert.equal(result.diffPercent, 0);
  assert.equal(result.pass, true);
  assert.equal(result.heightSource, 150);
  assert.equal(result.heightMigrated, 150);
});

test('score of a copy shifted down by 1 px fails', () => {
  const result = score(file('a.png'), file('shifted.png'), W);
  assert.equal(result.pass, false);
  assert.ok(result.diffPercent > 0.5);
});

test('score of a copy that is 1 px taller fails on height alone', () => {
  const result = score(file('a.png'), file('taller.png'), W);
  assert.equal(result.heightMigrated, 151);
  assert.equal(result.pass, false);
});

test('score of a taller copy compares the common height', () => {
  assert.equal(score(file('a.png'), file('taller.png'), W).diffPercent, 0);
});

test('score tolerates a handful of different pixels', () => {
  const result = score(file('a.png'), file('dot.png'), W);
  assert.ok(result.diffPercent > 0 && result.diffPercent < 0.5);
  assert.equal(result.pass, true);
});

test('score names a file that is missing', () => {
  assert.throws(() => score(file('a.png'), file('none.png'), W), /none\.png/);
});
