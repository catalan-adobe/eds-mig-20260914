import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  isFresh, outputText, recall, selfCheck, words,
} from '../lib/check.mjs';
import { MEDIA_BASE } from '../lib/config.mjs';

const blocks = new Set(['cards', 'metadata', 'section-metadata']);
const doc = (main) => `<body><header></header><main>${main}</main><footer></footer></body>`;
const check = (main, alts) => selfCheck(doc(main), { blocks, alts });
const img = (alt) => `<img src="${MEDIA_BASE}a-123.png" alt="${alt}">`;

test('a sound document has no failures', () => {
  const main = `<div><h1>T</h1><p>${img('A')}</p><p><a href="/f52-synopsys-1211-02/a/b">b</a></p>
    <p><a href="https://www.synopsys.com/content/dam/x.pdf">pdf</a> <a href="#top">top</a>
    <a href="https://news.synopsys.com/a.html">news</a></p>
    <div class="cards"><div><div>x</div></div></div>
    <div class="section-metadata"><div><div>Style</div><div>top-sm</div></div></div></div>`;
  assert.deepEqual(check(main, ['A']), []);
});

const failing = [
  ['a block the contract does not have', '<div><div class="teaser-wall"><div><div>x</div></div></div></div>', /block not in the contract: teaser-wall/],
  ['an internal link on synopsys.com', '<div><p><a href="https://www.synopsys.com/ai/x.html">x</a></p></div>', /still on synopsys\.com/],
  ['an internal link without extension on synopsys.com', '<div><p><a href="https://www.synopsys.com/ai">x</a></p></div>', /still on synopsys\.com/],
  ['an internal link ending in .html', '<div><p><a href="/f52-synopsys-1211-02/ai/x.html#a">x</a></p></div>', /ends in \.html/],
  ['an internal link outside the folder', '<div><p><a href="/ai/x">x</a></p></div>', /outside the site folder/],
  ['an empty main', '<div><div class="metadata"><div><div>title</div><div>T</div></div></div></div>', /empty main/],
  ['a script element', '<div><p>x</p><script>alert(1)</script></div>', /script element/],
  ['a style element', '<div><p>x</p><style>p{}</style></div>', /style element/],
  ['a style attribute', '<div><p style="color:red">x</p></div>', /style attribute/],
  ['an image on the source', '<div><p><img src="https://www.synopsys.com/content/dam/a.png" alt=""></p></div>', /image not on content\.da\.live/],
  ['a horizontal rule', '<div><p>x</p><hr></div>', /hr element/],
];
failing.forEach(([name, main, expected]) => {
  test(`self-check fails on ${name}`, () => assert.match(check(main).join('\n'), expected));
});

test('self-check fails on an alt text the source had and the output lacks', () => {
  assert.deepEqual(check(`<div><p>${img('Chip')}</p></div>`, ['Chip', 'Wafer', '']), ['alt text missing: Wafer']);
});

test('words: lower case, a CJK character is one word', () => {
  assert.deepEqual(words('PrimeSim 的设计 2x Über'), ['primesim', '的', '设', '计', '2x', 'über']);
});

test('recall counts every occurrence and lists the missing words', () => {
  const result = recall('Silicon to systems. Silicon again.', 'silicon to SYSTEMS');
  assert.equal(result.words, 5);
  assert.deepEqual(result.missing, ['silicon', 'again']);
  assert.equal(result.recall, 0.6);
  assert.equal(recall('', 'x').recall, 1);
});

test('a preview is fresh when it has the words of the document', () => {
  const ours = doc(`<div><h1>Title</h1><p><a href="/f52-synopsys-1211-02/x">Go :chevron-right:</a></p>
    <div class="metadata"><div><div>title</div><div>Meta</div></div></div></div>`);
  const fresh = '<div><h1 id="title">Title</h1><p><a href="/x">Go<span class="icon icon-chevron-right"></span></a></p></div>';
  assert.equal(isFresh(ours, fresh), true);
  assert.equal(isFresh(ours, '<div><h1>Title</h1><p>An older text of this page</p></div>'), false);
});

test('the output text leaves out the metadata blocks and joins inline elements', () => {
  const text = outputText(doc(`<div><p><strong>W</strong>ord</p><p>next</p>
    <div class="section-metadata"><div><div>Style</div><div>top-sm</div></div></div>
    <div class="metadata"><div><div>title</div><div>Hidden</div></div></div></div>`));
  assert.deepEqual(words(text), ['word', 'next']);
});
