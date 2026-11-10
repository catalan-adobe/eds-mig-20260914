// Compares every migrated page with its source page.
// Usage: node tools/import/check.js <base-url>   (base-url serves /f52-1011-01/...)
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';
import { SOURCE, imageSrc } from './html.js';
import { OUT, RUN } from './upload.js';

const PREFIX = `/${RUN}`;
const base = (process.argv[2] || '').replace(/\/$/, '');
if (!base) throw new Error('Usage: node tools/import/check.js <base-url>');

// Source headings that are not headings after migration, each for a stated reason.
const NOT_HEADINGS = [
  '.cmp-contentfragment__title', // hidden by the source CSS
  '.cmp-accordion__header', // accordion questions are <summary> elements
  '.cmp-download__title', // a small label, migrated as h5
].join(', ');

const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
const linkStatus = new Map();

async function get(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`${url} returned ${resp.status}`);
  return resp.text();
}

function sourceFacts(html) {
  const { document } = parseHTML(html);
  document.querySelectorAll('header.experiencefragment, footer.experiencefragment').forEach((el) => el.remove());
  const headings = [...document.querySelectorAll('body h1, body h2, body h3')]
    .filter((h) => !h.matches(NOT_HEADINGS) && text(h)).map(text);
  const images = new Set([...document.querySelectorAll('body img')].map(imageSrc));
  return { headings, images };
}

function importedImages(html) {
  const { document } = parseHTML(html);
  document.querySelector('.metadata')?.remove();
  const all = [...document.querySelectorAll('img')].map((img) => img.getAttribute('src'));
  return { unique: new Set(all), count: all.length };
}

async function checkLink(href) {
  if (!linkStatus.has(href)) {
    linkStatus.set(href, fetch(`${base}${href}`, { method: 'HEAD' }).then((r) => r.status));
  }
  return linkStatus.get(href);
}

async function checkLinks(document) {
  const hrefs = [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))]
    .filter((href) => href.startsWith('/'));
  const problems = [];
  await Promise.all(hrefs.map(async (href) => {
    const path = href.split('#')[0];
    if (!path.startsWith(`${PREFIX}/`)) problems.push(`link leaves the prefix: ${href}`);
    else if (await checkLink(path) !== 200) problems.push(`link is not 200: ${href}`);
  }));
  return problems;
}

async function checkPage(path) {
  const problems = [];
  const source = sourceFacts(await get(`${SOURCE}${path}.html`));
  const imported = importedImages(await readFile(join(OUT, `${PREFIX}${path}.html`), 'utf8'));
  const { document } = parseHTML(await get(`${base}${PREFIX}${path}`));
  const main = document.querySelector('main');
  const headings = [...main.querySelectorAll('h1, h2, h3')].map(text);
  if (headings.join('|') !== source.headings.join('|')) {
    problems.push(`headings differ:\n    source:   ${source.headings.join(' | ')}\n    migrated: ${headings.join(' | ')}`);
  }
  const missing = [...source.images].filter((src) => !imported.unique.has(src));
  if (missing.length) problems.push(`images not imported: ${missing.join(', ')}`);
  const previewed = main.querySelectorAll('img').length;
  if (previewed !== imported.count) problems.push(`preview has ${previewed} images, import has ${imported.count}`);
  problems.push(...await checkLinks(document));
  return {
    path, problems, headings: headings.length, images: previewed,
  };
}

async function checkFragment(path) {
  const { document } = parseHTML(await get(`${base}${PREFIX}${path}`));
  return {
    path, problems: await checkLinks(document), headings: 0, images: 0,
  };
}

const list = await readFile(new URL('./pages.txt', import.meta.url), 'utf8');
const pages = list.split('\n').filter(Boolean);
const roots = pages.filter((path) => /^\/[a-z]{2}\/[a-z]{2}$/.test(path));
const jobs = [
  ...pages.map((path) => () => checkPage(path)),
  ...roots.flatMap((root) => ['nav', 'footer'].map((name) => () => checkFragment(`${root}/${name}`))),
];
const results = [];
for (let i = 0; i < jobs.length; i += 6) {
  const batch = jobs.slice(i, i + 6).map((job) => job().catch((e) => ({ path: '?', problems: [e.message] })));
  results.push(...await Promise.all(batch));
}
results.forEach(({
  path, problems, headings, images,
}) => {
  console.log(`${problems.length ? 'DIFF' : 'ok  '} ${path} (${headings} headings, ${images} images)`);
  problems.forEach((problem) => console.log(`  - ${problem}`));
});
const failed = results.filter((r) => r.problems.length).length;
console.log(`${results.length - failed}/${results.length} clean, ${linkStatus.size} internal links checked`);
if (failed) process.exit(1);
