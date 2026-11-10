import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GROUPS, groupOf, pagesIn } from './groups.js';

const COUNTS = {
  stub: 9,
  search: 1,
  about: 2,
  faqs: 2,
  members: 1,
  home: 2,
  adventures: 2,
  magazine: 2,
  adventure: 32,
  article: 12,
};

test('groupOf names the group of a path', () => {
  assert.equal(groupOf('/fr/fr'), 'stub');
  assert.equal(groupOf('/us/en'), 'home');
  assert.equal(groupOf('/ca/en/magazine/members-only'), 'members');
  assert.equal(groupOf('/ca/en/magazine/members-only/alaskan-adventure'), 'article');
  assert.equal(groupOf('/us/en/magazine'), 'magazine');
  assert.equal(groupOf('/us/en/adventures'), 'adventures');
  assert.equal(groupOf('/us/en/adventures/bali-surf-camp'), 'adventure');
});

test('pagesIn of every group holds the 65 pages', () => {
  assert.equal(pagesIn(GROUPS).length, 65);
  GROUPS.forEach((group) => assert.equal(pagesIn([group]).length, COUNTS[group], group));
});

test('pagesIn rejects an unknown group', () => {
  assert.throws(() => pagesIn(['nope']), /unknown group "nope"/);
});
