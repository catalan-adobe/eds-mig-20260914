import assert from 'node:assert/strict';
import { test } from 'node:test';
import { match } from './match.js';

const item = (text, y, kind = 'text') => ({
  kind, text, x: 10, y, w: 100, h: 20,
});
const list = () => [item('Title', 0), item('Body', 50), item('Photo', 100, 'img')];

test('match of a list with itself has no gaps', () => {
  const rows = match(list(), list());
  assert.equal(rows.length, 3);
  rows.forEach((row) => {
    assert.deepEqual([row.dx, row.dy, row.dw, row.dh], [0, 0, 0, 0]);
  });
});

test('match reports the move of one item', () => {
  const moved = list();
  moved[1] = item('Body', 55);
  const rows = match(list(), moved);
  assert.equal(rows[1].dy, 5);
  assert.equal(rows[0].dy, 0);
});

test('match reports a size change', () => {
  const grown = list();
  grown[0] = { ...grown[0], w: 90, h: 30 };
  const [row] = match(list(), grown);
  assert.deepEqual([row.dw, row.dh], [-10, 10]);
});

test('match gives null when the migrated page lacks an item', () => {
  const rows = match(list(), [item('Title', 0), item('Photo', 100, 'img')]);
  assert.equal(rows[1].text, 'Body');
  assert.equal(rows[1].migrated, null);
  assert.equal(rows[2].migrated.text, 'Photo');
});

test('match pairs the same text in order', () => {
  const source = [item('Read more', 10), item('Read more', 200)];
  const migrated = [item('Read more', 12), item('Read more', 260)];
  const rows = match(source, migrated);
  assert.deepEqual(rows.map((row) => row.dy), [2, 60]);
});

test('match does not pair a text with an image of the same text', () => {
  const rows = match([item('Same', 0, 'img')], [item('Same', 0)]);
  assert.equal(rows[0].migrated, null);
});

test('match ignores items that exist only in the migrated page', () => {
  assert.equal(match([item('Title', 0)], [item('Extra', 0), item('Title', 0)]).length, 1);
});
