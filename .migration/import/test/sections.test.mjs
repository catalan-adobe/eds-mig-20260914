import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildDocument } from '../lib/document.mjs';
import { loadPage } from '../lib/page.mjs';
import {
  applyBand, block, flatten, mergeItems, section, settle, toDocument, toSections,
} from '../lib/sections.mjs';
import { loadTransforms } from '../lib/transforms.mjs';

const grid = (name, inner, cls = '') => `<div class="${name} aem-GridColumn ${cls}">${inner}</div>`;
const text = (title, body, wrap = '') => grid('text', `<div class="background-component ${wrap}">
  <section class="component-textcomp text-align-left">
    <h2 class="title text-size-smaller" style="color: #111C24;">${title}</h2>
    <div class="component-text">${body}</div></section></div>`);
const anchor = (id) => grid('anchor', `<div id="${id}" class="component-anchor"></div>`);
const column = (cells, wrap = '') => grid('column', `<div class="background-component ${wrap}">
  <section class="component-column row">${cells.map(([cls, inner]) => `<div class="col-xs-12 ${cls}">
  <div class="aem-Grid">${inner}</div></div>`).join('')}</section></div>`);
const topnav = '<div class="experiencefragment"><div class="cmp-experiencefragment cmp-experiencefragment--topnav"></div></div>';
const page = (inner) => `<html><head><title>T</title></head><body data-template="Content Page_Template">
  ${topnav}<div class="site-wrapper"><div class="root synopsysContainer"><div class="aem-Grid">${inner}</div></div></div></body></html>`;

async function build(inner, registry = { lookup: () => undefined }) {
  const env = { transforms: await loadTransforms(), registry, built: new Set() };
  return buildDocument(loadPage('/a/b.html', page(inner)), env);
}
const styles = (doc) => doc.sections.map((s) => s.styles.join(' '));

test('a transform result becomes one section with the component styles', () => {
  const [made] = toSections(['<p>a</p>', block('cards', [], [['x']])], ['top-sm']);
  assert.deepEqual(made.styles, ['top-sm']);
  assert.equal(made.content.length, 2);
  const own = section('<p>b</p>', { styles: ['center'] });
  assert.deepEqual(toSections(own, ['top-sm']), [own]);
});

test('an empty section passes its id and spacing to the next section', () => {
  const out = settle([
    section([], { id: 'overview', styles: ['top-sm', 'bottom-sm'] }),
    section('<p>a</p>', { styles: ['top-xs'] }),
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].id, 'overview');
  assert.deepEqual(out[0].styles, ['top-xs', 'band-top-md']);
});

test('an empty section at the end stays for the parent, and goes at the top level', () => {
  const list = [section('<p>a</p>'), section([], { id: 'late' })];
  assert.equal(settle(list).length, 2);
  assert.equal(settle(list, { last: true }).length, 1);
});

test('dropped spacing: top above the next section, bottom below the one before', () => {
  const run = (dropped, last = []) => settle([section('<p>a</p>'),
    ...dropped.map((list) => section([], { styles: list })), section('<p>b</p>', { styles: last })])
    .map((s) => s.styles.join(' '));
  assert.deepEqual(run([['top-sm', 'bottom-sm']]), ['band-bottom-sm', 'band-top-sm']);
  assert.deepEqual(run([['bottom-md'], ['bottom-md']]), ['band-bottom-md', 'band-top-md']);
  assert.deepEqual(run([['top-md'], ['top-md']]), ['band-bottom-md', 'band-top-md']);
  assert.deepEqual(run([['top-xs']]), ['', 'band-top-xs']);
  // the space goes where the background is the dropped component's own
  assert.deepEqual(run([['top-sm', 'bottom-sm']], ['light-grey']), ['band-bottom-md', 'light-grey']);
  const grey = run([['light-grey', 'top-sm', 'bottom-sm']], ['light-grey']);
  assert.deepEqual(grey, ['', 'light-grey band-top-md']);
});

test('dropped spacing after a grid row goes below the row, on its first section', async () => {
  const doc = await build(column([['col-sm-6', text('', '<p>a</p>')],
    ['col-sm-6', text('', '<p>b</p>', 'vert-pad-top-sm')]])
    + text('', '', 'vert-pad-bottom-md') + text('', '<p>c</p>', 'light-grey-bg'));
  assert.deepEqual(styles(doc), ['span-6 band-bottom-md', 'span-6 top-sm', 'light-grey']);
});

test('a section with only a rule is kept', () => {
  assert.equal(settle([section([], { styles: ['rule'] })], { last: true }).length, 1);
});

test('item merge joins neighbours with the same class list', () => {
  const item = (label, variants = []) => section(block('box-links', variants, [[label]], { merge: true }));
  const merged = mergeItems([item('a'), item('b'), item('c', ['dark']), section('<p>x</p>'), item('d')]);
  assert.deepEqual(merged.map((s) => s.content[0].rows?.length ?? 0), [2, 1, 0, 1]);
  const withVariant = mergeItems([item('a'), item('b')], ['carousel']);
  assert.deepEqual(withVariant[0].content[0].variants, ['carousel']);
});

test('item merge keeps a new grid column and band spacing apart', () => {
  const item = (list) => section(block('cards', [], [['x']], { merge: true }), { styles: list });
  assert.equal(mergeItems([item(['span-4']), item(['span-4'])]).length, 2);
  assert.equal(mergeItems([item(['band-top-md']), item(['band-top-md'])]).length, 2);
  assert.equal(mergeItems([item(['top-sm']), item(['top-sm'])]).length, 1);
});

test('item merge leaves blocks alone that are not items', () => {
  const hero = () => section(block('hero', [], [['x']]));
  assert.equal(mergeItems([hero(), hero()]).length, 2);
});

test('a band gives background to all, top to the first, bottom to the last section', () => {
  const list = [section('<p>a</p>'), section('<p>b</p>', { styles: ['white'] }), section('<p>c</p>')];
  applyBand(list, ['light-grey', 'top-sm', 'bottom-md']);
  assert.deepEqual(list.map((s) => s.styles.join(' ')), [
    'light-grey band-top-sm', 'white', 'light-grey band-bottom-md']);
});

test('sections flatten to the content of one cell', () => {
  const list = [section('<p>a</p>'), section(block('cards', [], [['<p>b</p>', '<p>c</p>']]))];
  assert.equal(flatten(list), '<p>a</p><p>b</p><p>c</p>');
});

test('the document has one div per section, section metadata and the metadata block', () => {
  const html = toDocument(
    [section('<h1>T</h1>'), section(block('cards', ['cols-3'], [['a', 'b']]), { styles: ['top-sm'], id: 'x' })],
    [['title', 'T']],
  );
  assert.match(html, /^<body><header><\/header><main>\n<div>\n<h1>T<\/h1>\n<\/div>\n<div>/);
  assert.match(html, /<div class="cards cols-3">\n<div><div>a<\/div><div>b<\/div><\/div>\n<\/div>/);
  assert.match(html, /<div><div>Style<\/div><div>top-sm<\/div><\/div>\n<div><div>Anchor<\/div><div>x<\/div><\/div>/);
  assert.match(html, /<div class="metadata">\n<div><div>title<\/div><div>T<\/div><\/div>\n<\/div>\n<\/div>\n<\/main>/);
});

test('page: every component is one section, an anchor names the next one', async () => {
  const doc = await build(anchor('overview') + text('Title', '<p>Body</p>', 'light-grey-bg vert-pad-top-md')
    + text('', '<p>Second</p>'));
  assert.equal(doc.sections.length, 2);
  assert.equal(doc.sections[0].id, 'overview');
  assert.deepEqual(doc.sections[0].content, ['<h2>Title</h2>', '<p>Body</p>']);
  assert.deepEqual(styles(doc), ['light-grey top-md title-small title-dark', '']);
  assert.deepEqual(doc.metadata, [['title', 'T'], ['template', 'content-page-template']]);
});

test('page: a column with one cell is transparent and gives its band', async () => {
  const doc = await build(column([['', text('A', '') + text('B', '')]], 'light-grey-bg vert-pad-bottom-md'));
  assert.deepEqual(styles(doc), [
    'title-small title-dark light-grey', 'title-small title-dark light-grey band-bottom-md']);
});

test('page: cells of plain default content with equal styles are a columns block', async () => {
  const doc = await build(column([['col-sm-4', text('', '<p>a</p>')], ['col-sm-8', text('', '<p>b</p>')]]));
  const [only] = doc.sections;
  assert.equal(doc.sections.length, 1);
  assert.deepEqual([only.content[0].name, ...only.content[0].variants], ['columns', 'w-4-8']);
  assert.deepEqual(only.content[0].rows, [['<p>a</p>', '<p>b</p>']]);
});

test('page: cells that differ use the section grid with span, stack and offset', async () => {
  const doc = await build(column([
    ['col-sm-9', text('', '<p>a</p>') + text('', '<p>b</p>', 'vert-pad-top-sm')],
    ['col-sm-3', text('T', '<p>rail</p>')],
  ], 'vert-pad-top-md') + column([['col-sm-3', ''], ['col-sm-6', text('', '<p>c</p>')]]));
  assert.deepEqual(styles(doc), [
    'span-9 band-top-md', 'span-9 stack top-sm', 'span-3 title-small title-dark', 'span-6 offset-3']);
});

test('page: a row after a row that is not full starts with the style row', async () => {
  const half = () => column([['col-sm-6', text('', '<p>a</p>') + text('', '<p>b</p>', 'vert-pad-top-sm')],
    ['col-sm-6', '']]);
  const doc = await build(half() + half());
  assert.deepEqual(styles(doc), ['span-6', 'span-6 stack top-sm', 'span-6 row', 'span-6 stack top-sm']);
});

test('page: cells that hold cols-M blocks merge into cols-(M x cells), in reading order', async () => {
  const benefit = (name) => grid('keyBenefits', `<section class="cmp-key-benefits">
    <div class="cmp-key-benefits__title">${name}</div></section>`);
  const pair = (a, b) => column([['col-sm-6', benefit(a)], ['col-sm-6', benefit(b)]]);
  const doc = await build(column([['col-sm-6', pair('a', 'b') + pair('e', 'f')],
    ['col-sm-6', pair('c', 'd') + pair('g', 'h')]]));
  const [only] = doc.sections[0].content;
  assert.deepEqual([only.name, ...only.variants], ['key-benefits', 'cols-4']);
  assert.equal(only.rows.map((row) => row.join('').replace(/<[^>]+>/g, '')).join(''), 'abcdefgh');
});

test('page: a component without a transform is default content, with a warning', async () => {
  const doc = await build(grid('brandNew', '<div><h3>Title</h3><a href="/x.html">Link</a>'
    + '<img src="/content/dam/a.png" alt="A"></div>'));
  assert.deepEqual(doc.sections[0].content, [
    '<h3>Title</h3>',
    '<p><a href="/f52-synopsys-1211-02/x">Link</a><img src="https://www.synopsys.com/content/dam/a.png" alt="A"></p>',
  ]);
  assert.deepEqual(doc.report.warnings, ['brandNew: no transform, 1 as default content']);
});

test('page: a shared fragment becomes a fragment block and a document of its own', async () => {
  const fragment = grid('experiencefragment', `<div class="cmp-experiencefragment cmp-experiencefragment--contact-us---general">
    <div class="aem-Grid">${text('Contact', '<p>us</p>')}</div></div>`);
  const registry = { lookup: () => ({ path: '/fragments/contact-us-general' }) };
  const doc = await build(text('', '<p>own</p>') + fragment, registry);
  assert.equal(doc.sections[1].content[0].name, 'fragment');
  assert.match(doc.sections[1].content[0].rows[0][0], /href="\/f52-synopsys-1211-02\/fragments\/contact-us-general"/);
  assert.equal(doc.fragments.length, 1);
  assert.equal(doc.fragments[0].path, '/fragments/contact-us-general');
  assert.match(doc.source.text(), /own/);
  assert.doesNotMatch(doc.source.text(), /Contact/);
  assert.match(doc.fragments[0].source.text(), /Contact/);
});

test('nested bands on one edge add up, each size at most once', () => {
  const s = section(['<p>x</p>']);
  applyBand([s], ['bottom-md']);
  applyBand([s], ['bottom-sm']);
  assert.deepEqual(s.styles, ['band-bottom-md', 'band-bottom-sm']);
  applyBand([s], ['bottom-xs']);
  applyBand([s], ['top-sm']);
  applyBand([s], ['top-sm']);
  assert.deepEqual(s.styles, ['band-bottom-md', 'band-bottom-sm', 'band-bottom-xs', 'band-top-md']);
});
