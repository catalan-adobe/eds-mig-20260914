import { test } from 'node:test';
import assert from 'node:assert/strict';
import { previewUrls, toWebPath } from './upload.js';

test('toWebPath maps a content file to its web path', () => {
  assert.equal(toWebPath('f52-1011-01/us/en/faqs.html'), '/f52-1011-01/us/en/faqs');
});

test('toWebPath refuses files outside the run folder', () => {
  assert.throws(() => toWebPath('us/en/faqs.html'), /outside \/f52-1011-01\//);
  assert.throws(() => toWebPath('f52-1011-01/../us/en.html'), /outside \/f52-1011-01\//);
});

test('previewUrls covers the main ref and the branch ref', () => {
  assert.deepEqual(previewUrls('/f52-1011-01/us/en'), [
    'https://admin.hlx.page/preview/catalan-adobe/eds-mig-20260914/main/f52-1011-01/us/en',
    'https://admin.hlx.page/preview/catalan-adobe/eds-mig-20260914/f52-1011-01/f52-1011-01/us/en',
  ]);
});
