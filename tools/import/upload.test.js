import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toWebPath } from './upload.js';

test('toWebPath maps a content file to its web path', () => {
  assert.equal(toWebPath('f52-1011-01/us/en/faqs.html'), '/f52-1011-01/us/en/faqs');
});

test('toWebPath refuses files outside the run folder', () => {
  assert.throws(() => toWebPath('us/en/faqs.html'), /outside \/f52-1011-01\//);
  assert.throws(() => toWebPath('f52-1011-01/../us/en.html'), /outside \/f52-1011-01\//);
});
