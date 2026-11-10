#!/usr/bin/env node
// Imports wknd.site into DA under /f52-1011-02, following ../CONTRACT.md.
//
//   node import.mjs                         build, check, upload and preview everything
//   node import.mjs --only /us/en/faqs.html one document (a page, /us/en/nav,
//                                           /fragments/sign-in or /search-index.json)
//   node import.mjs --dry                   build and self-check only, writes ../out/docs
//
// Every run rebuilds all documents from the source cache, so the self-check always covers
// the whole site; --only limits what is uploaded. Results go to report.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import {
  FOLDER, SOURCE, convertChrome, convertPage, convertSignIn, esc,
} from './lib/convert.mjs';
import {
  CONTENT, PREVIEW, preview, request, upload,
} from './lib/da.mjs';
import { selfCheck, verifyPlain } from './lib/check.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE = path.join(HERE, '..', 'source');
const OUT = path.join(HERE, '..', 'out');
const REPORT = path.join(HERE, 'report.json');
const ERROR_PAGE = '/us/en/errors/404.html';
const SIGN_IN = '/content/experience-fragments/wknd/language-masters/en/site/sign-in/'
  + 'master.content.html';
const INDEX = '/search-index.json';
const INDEX_SKIP = /\/(errors\/404|ai-powered-search)$/;

const argv = process.argv.slice(2);
const dry = argv.includes('--dry');
const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1] : null;
if (argv.includes('--only') && !only) throw new Error('--only needs a path');

function write(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}

/** Source HTML from the read-only cache, or fetched once into out/cache when not cached. */
async function sourceHtml(sourcePath) {
  const name = sourcePath.slice(1).replaceAll('/', '__');
  const cached = [path.join(CACHE, 'pages', name), path.join(OUT, 'cache', name)]
    .find((f) => fs.existsSync(f));
  if (cached) return fs.readFileSync(cached, 'utf8');
  const res = await request(SOURCE + sourcePath);
  if (!res.ok) throw new Error(`${sourcePath}: HTTP ${res.status} from the source`);
  const html = await res.text();
  write(path.join(OUT, 'cache', name), html);
  return html;
}

async function buildDocs() {
  const inventory = JSON.parse(fs.readFileSync(path.join(CACHE, 'inventory.json'), 'utf8'));
  const sourcePaths = [...Object.keys(inventory), ERROR_PAGE].sort();
  const fragments = new Map();
  const pages = [];
  const chrome = [];
  for (const sourcePath of sourcePaths) {
    const page = convertPage(await sourceHtml(sourcePath), sourcePath, fragments);
    pages.push(page);
    if (/^\/[a-z]{2}\/[a-z]{2}$/.test(page.doc.path)) {
      chrome.push(...convertChrome(page.$, page.doc.path));
    }
  }
  const signIn = convertSignIn(await sourceHtml(SIGN_IN));
  return { pages, docs: [...pages.map((p) => p.doc), ...chrome, ...fragments.values(), signIn] };
}

/** Gives every distinct image one file name in /media (contract section j). */
function nameMedia(docs) {
  const names = new Map();
  const taken = new Set();
  docs.forEach((doc) => doc.images.forEach(({ url }) => {
    if (names.has(url)) return;
    let name = decodeURI(path.basename(new URL(url).pathname)).replace(/[^\w.-]/g, '-');
    // A cropped rendition must not take the name its DAM original already has in DA.
    if (/\.coreimg\.\d+\.\d+\./.test(url)) name = `crop-${name}`;
    if (taken.has(name)) name = `${path.basename(doc.path)}-${name}`;
    if (taken.has(name)) throw new Error(`Media name clash: ${name} (${url})`);
    taken.add(name);
    names.set(url, name);
  }));
  return names;
}

function render(doc, mediaUrl) {
  return doc.images.reduce((html, image) => html
    .replaceAll(`src="${esc(image.url)}"`, `src="${mediaUrl.get(image.url)}"`), doc.html());
}

function searchIndex(pages, htmlByPath) {
  const data = pages.filter(({ doc }) => doc.path.startsWith('/us/en')
    && !INDEX_SKIP.test(doc.path)).map(({ doc, meta }) => {
    const $ = load(htmlByPath.get(doc.path).replace(/</g, ' <'));
    $(`.metadata, .section-metadata, a[href^="${FOLDER}/fragments/"]`).remove();
    const text = $('main').text().replace(/\s+/g, ' ').trim()
      .slice(0, 5000);
    return { path: FOLDER + doc.path, ...meta, text };
  });
  return JSON.stringify({
    ':type': 'sheet', total: data.length, offset: 0, limit: data.length, data,
  });
}

/** Downloads (once) and uploads (once) a binary; the manifest remembers what DA has. */
async function pushMedia(name, url, manifest) {
  if (manifest[name]?.url === url) return;
  const file = path.join(OUT, 'media', name);
  let type = manifest[name]?.type;
  if (!fs.existsSync(file) || !type) {
    const res = await request(url);
    if (!res.ok) throw new Error(`download ${url}: HTTP ${res.status}`);
    [type] = res.headers.get('content-type').split(';');
    write(file, Buffer.from(await res.arrayBuffer()));
  }
  await upload(`/media/${name}`, fs.readFileSync(file), type);
  manifest[name] = { url, type };
}

async function pushDoc(doc, html) {
  const entry = {
    page: doc.path, status: 0, blocks: doc.blocks, errors: [],
  };
  try {
    await upload(`${doc.path}.html`, html, 'text/html');
    await preview(doc.path);
    const res = await request(`${PREVIEW}${doc.path}.plain.html`, { cache: 'no-store' });
    entry.status = res.status;
    if (res.ok) entry.errors = verifyPlain(doc, await res.text());
    else entry.errors.push(`.plain.html answered ${res.status}`);
  } catch (e) {
    entry.errors.push(e.message);
  }
  console.log(`${entry.errors.length ? 'FAIL' : 'ok  '} ${entry.status} ${doc.path}`);
  entry.errors.forEach((e) => console.log(`       ${e}`));
  return entry;
}

async function pushIndex(json) {
  const entry = {
    page: INDEX, status: 0, blocks: [], errors: [],
  };
  try {
    await upload(INDEX, json, 'application/json');
    await preview(INDEX);
    const res = await request(PREVIEW + INDEX, { cache: 'no-store' });
    entry.status = res.status;
    const rows = res.ok ? (await res.json()).data?.length : 0;
    if (rows !== JSON.parse(json).data.length) entry.errors.push(`index has ${rows} rows`);
  } catch (e) {
    entry.errors.push(e.message);
  }
  console.log(`${entry.errors.length ? 'FAIL' : 'ok  '} ${entry.status} ${INDEX}`);
  return entry;
}

async function pushFiles(docs, names, manifestFile) {
  const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile)) : {};
  const media = new Map();
  docs.forEach((doc) => {
    doc.images.forEach(({ url }) => media.set(names.get(url), url));
    doc.files.forEach((url) => media.set(path.basename(url), url));
  });
  try {
    await Promise.all([...media].map(([name, url]) => pushMedia(name, url, manifest)));
    const pdfs = [...media.keys()].filter((name) => name.endsWith('.pdf'));
    await Promise.all(pdfs.map((name) => preview(`/media/${name}`)));
  } finally {
    write(manifestFile, JSON.stringify(manifest, null, 1));
  }
  console.log(`media: ${media.size} files in DA`);
}

function writeReport(entries) {
  const previous = only && fs.existsSync(REPORT) ? JSON.parse(fs.readFileSync(REPORT)) : [];
  const fresh = new Set(entries.map((e) => e.page));
  const all = [...previous.filter((e) => !fresh.has(e.page)), ...entries]
    .sort((a, b) => a.page.localeCompare(b.page));
  write(REPORT, `${JSON.stringify(all, null, 1)}\n`);
  return all;
}

const { pages, docs } = await buildDocs();
const names = nameMedia(docs);
const mediaUrl = new Map([...names].map(([url, name]) => [url, `${CONTENT}/media/${name}`]));
const htmlByPath = new Map(docs.map((doc) => [doc.path, render(doc, mediaUrl)]));
const problems = docs.flatMap((doc) => selfCheck(doc, htmlByPath.get(doc.path), mediaUrl)
  .map((e) => `${doc.path}: ${e}`));
docs.forEach((doc) => write(path.join(OUT, 'docs', `${doc.path}.html`), htmlByPath.get(doc.path)));
const index = searchIndex(pages, htmlByPath);
write(path.join(OUT, 'docs', INDEX), index);
if (problems.length) {
  console.error(`SELF-CHECK FAILED (${problems.length}):\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`built ${docs.length} documents, self-check clean`);

const wanted = only?.replace(/\.html$/, '');
const selected = docs.filter((doc) => !only || doc.path === wanted);
const withIndex = !only || only === INDEX;
if (only && !selected.length && !withIndex) throw new Error(`--only ${only}: no such document`);
if (!dry) {
  await pushFiles(selected, names, path.join(OUT, 'media-manifest.json'));
  const entries = await Promise.all(selected.map((doc) => pushDoc(doc, htmlByPath.get(doc.path))));
  if (withIndex) entries.push(await pushIndex(index));
  const failed = writeReport(entries).filter((e) => e.errors.length || e.status !== 200);
  console.log(`${entries.length} pushed; report has ${failed.length} failing entries`);
  if (entries.some((e) => e.errors.length)) process.exit(1);
}
