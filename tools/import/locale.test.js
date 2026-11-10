import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLocaleRoot, getBreadcrumb } from '../../scripts/locale.js';

test('getLocaleRoot finds the locale folder with or without a prefix', () => {
  assert.equal(getLocaleRoot('/f52-1011-01/us/en/faqs'), '/f52-1011-01/us/en');
  assert.equal(getLocaleRoot('/us/en'), '/us/en');
  assert.equal(getLocaleRoot('/ca/en/magazine/members-only/alaskan-adventure'), '/ca/en');
});

test('getLocaleRoot returns null outside any locale folder', () => {
  assert.equal(getLocaleRoot('/'), null);
  assert.equal(getLocaleRoot('/f52-1011-01/'), null);
  assert.equal(getLocaleRoot('/f52-1011-01/spike'), null);
});

test('getBreadcrumb lists the parent folders below the locale root', () => {
  assert.deepEqual(getBreadcrumb('/f52-1011-01/ca/en/magazine/members-only/alaskan-adventure'), [
    { href: '/f52-1011-01/ca/en/magazine', label: 'Magazine' },
    { href: '/f52-1011-01/ca/en/magazine/members-only', label: 'Members Only' },
  ]);
  assert.deepEqual(getBreadcrumb('/us/en'), []);
  assert.deepEqual(getBreadcrumb('/'), []);
});
