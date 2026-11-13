#!/usr/bin/env node
// Turns fetched source pages into DA documents, uploads the changed ones and previews them.
//   node import.mjs --page /a/b.html [--page /c.html]   one or more source paths ("/" is home)
//   node import.mjs --pages <file>                      one source path per line
//   node import.mjs --all                               every fetched page with status 200
//   --dry      build and check only: nothing is read from the source, nothing is written to DA
//   --media    only make sure the images of the selected pages are in DA
//   --force    upload and preview also when the document did not change
//   --fragments   rebuild fragments.json from all fetched pages (run before a first import)
// Output: ../out/<path>, ../out/report.json, ../out/manifest.json. See README.md.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { load } from 'cheerio';
import {
  M, OUT, SITE, daPathOf, languageOf, webSafe,
} from './lib/config.mjs';
import {
  MIN_RECALL, outputText, recall, selfCheck,
} from './lib/check.mjs';
import { escapeAttr } from './lib/clean.mjs';
import { buildDocument } from './lib/document.mjs';
import {
  RAIL, REGISTRY, assign, keyOf, loadRegistry, signature,
} from './lib/fragments.mjs';
import { assetKey, createMedia, pickSource } from './lib/media.mjs';
import { fragmentName, loadPage } from './lib/page.mjs';
import { MANIFEST, pool, publish } from './lib/publish.mjs';
import { toDocument } from './lib/sections.mjs';
import { loadTransforms } from './lib/transforms.mjs';
import { readJson, updateJson } from './lib/store.mjs';

const REPORT = join(OUT, 'report.json');
const BATCH = 100;
const FLAGS = ['all', 'dry', 'media', 'force', 'fragments'];
const NOT_MIGRATED = /^\/([a-z]{2}-[a-z]{2}\/)?refs\/global-navigation[/.]/;
const SKIPPED_FRAGMENTS = ['chatbot', 'ask-synopsys'];
// an image that is not in DA would make every preview load it from the source
const UNSAFE = /^image not on content\.da\.live/;

const lines = (file) => readFileSync(file, 'utf8').split('\n').map((l) => l.trim())
  .filter(Boolean);

function parseArgs(argv) {
  const args = { pages: [], flags: new Set() };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i].replace(/^--/, '');
    if (argv[i] === '--page') args.pages.push(argv[i += 1]);
    else if (argv[i] === '--pages') args.pages.push(...lines(argv[i += 1]));
    else if (argv[i].startsWith('--') && FLAGS.includes(flag)) args.flags.add(flag);
    else throw new Error(`unknown argument ${argv[i]}`);
  }
  return args;
}

/** Source paths of the fetched pages: those that answered 200, or all of them. */
function fetchedPages({ all = false } = {}) {
  return lines(join(M, 'source', 'pages.jsonl')).map((line) => JSON.parse(line))
    .filter((p) => all || p.status === 200)
    .map((p) => new URL(p.url).pathname);
}

/** Counts every shared fragment and inherited rail of the site; writes fragments.json. */
function scanFragments() {
  const uses = {};
  const pages = fetchedPages().filter((p) => !NOT_MIGRATED.test(p));
  pages.forEach((path, i) => {
    const { $, root } = loadPage(path);
    const lang = languageOf(path);
    const seen = new Set();
    const note = (name, el) => {
      const { empty, hash } = signature($, el);
      const key = keyOf(lang, name, hash);
      if (empty || seen.has(key)) return;
      seen.add(key);
      uses[key] ??= { pages: 0, from: path };
      uses[key].pages += 1;
    };
    $(root).find('.experiencefragment').each((_, el) => {
      const name = fragmentName(el, $);
      if (name && !SKIPPED_FRAGMENTS.includes(name)) note(name, el);
    });
    $(root).find('.iparys_inherited').each((_, el) => note(RAIL, el));
    if (i % 500 === 0) console.log(`${i} / ${pages.length}`);
  });
  const byKey = Object.entries(assign(readJson(REGISTRY), uses))
    .sort(([a], [b]) => a.localeCompare(b));
  writeFileSync(REGISTRY, `${JSON.stringify(Object.fromEntries(byKey), null, 1)}\n`);
  const once = Object.values(uses).filter((u) => u.pages < 2).length;
  console.log(`${byKey.length} shared fragments, ${once} contents on one page (inlined)`);
}

/** Replaces every source image of the document by its DA copy: { html, assets }. */
async function withMedia(html, media, report) {
  const tags = [...new Set(html.match(/<img\b[^>]*>/g) ?? [])];
  const assets = new Set();
  let out = html;
  await pool(tags, 8, async (tag) => {
    const { src = '', alt = '' } = load(tag, null, false)('img').attr();
    const url = pickSource(src);
    const copy = url ? await media.resolve(url) : { error: 'no source' };
    if (copy.error) report.warnings.push(`image dropped (${copy.error}): ${src}`);
    else assets.add(assetKey(url));
    if (copy.note) report.warnings.push(`${copy.note}: ${src}`);
    if (copy.pending) report.mediaPending = (report.mediaPending ?? 0) + 1;
    const img = copy.error ? '' : `<img src="${copy.url}" alt="${escapeAttr(alt)}">`;
    out = out.replaceAll(tag, img);
  });
  return { html: out.replace(/<p>\s*<\/p>\n?/g, ''), assets };
}

/** Internal links of a document that lead to no page of the source's sitemap. */
function unknownLinks(html, known) {
  const hrefs = html.match(new RegExp(`href="${SITE}(/[^"]*)?"`, 'g')) ?? [];
  const paths = hrefs.map((h) => h.slice(6 + SITE.length, -1).replace(/[?#].*$/, '') || '/');
  return [...new Set(paths)].filter((p) => !known.has(p) && !p.startsWith('/fragments/'));
}

/** The failures of a built document: self-check, word recall, missing images. */
function check(doc, built, env) {
  const { report } = doc;
  const images = doc.source.images().map((i) => ({ ...i, url: pickSource(i.el, doc.page) }))
    .filter((i) => i.url);
  // an image the source does not deliver takes its alt text with it
  const gone = new Set(report.warnings.filter((w) => w.startsWith('image dropped'))
    .map((w) => w.slice(w.lastIndexOf(': ') + 2)));
  const alts = images.filter((i) => !gone.has(i.url)).map((i) => i.alt);
  let failures = selfCheck(built.html, { blocks: env.blocks, alts });
  const content = recall(doc.source.text(), outputText(built.html));
  if (!content.words && !images.length && failures.join() === 'empty main') {
    report.warnings.push('the source has no content: the document is empty too');
    failures = [];
  }
  if (content.recall < MIN_RECALL) {
    failures.push(`recall ${content.recall.toFixed(4)} is under ${MIN_RECALL}`);
  }
  const wanted = new Set(images.map((i) => assetKey(i.url)));
  const lost = [...wanted].filter((key) => !built.assets.has(key));
  const dropped = report.warnings.filter((w) => w.startsWith('image dropped')).length;
  if (lost.length > dropped) failures.push(`images missing: ${lost.join(', ')}`);
  Object.assign(report, {
    status: failures.length ? 'failed' : 'built',
    recall: Number(content.recall.toFixed(4)),
    words: content.words,
    missing: content.missing.slice(0, 40),
    images: { source: wanted.size, output: built.assets.size },
    unknownLinks: unknownLinks(built.html, env.known).slice(0, 20),
    failures,
  });
}

/** Finishes one built document: media, checks, report entry, file in out/. */
async function finish(doc, env) {
  const built = await withMedia(toDocument(doc.sections, doc.metadata), env.media, doc.report);
  check(doc, built, env);
  const daPath = doc.kind === 'page' ? daPathOf(doc.path) : `${doc.path}.html`;
  const file = join(OUT, daPath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, built.html);
  return {
    daPath,
    html: built.html,
    hash: createHash('sha1').update(built.html).digest('hex'),
    report: doc.report,
    kind: doc.kind,
    key: doc.path,
  };
}

/** Builds the documents of one page: the page and the shared fragments first seen on it. */
function build(path, env) {
  const doc = buildDocument(loadPage(path), env);
  return [doc, ...doc.fragments].map((d) => ({ ...d, page: path }));
}

async function upload(finished, flags) {
  const safe = finished.filter((d) => !d.report.failures.some((f) => UNSAFE.test(f)));
  const published = await publish(safe, { force: flags.has('force') });
  safe.forEach((d) => {
    const { status, error } = published.get(d.daPath);
    d.report.preview = status;
    if (error) d.report.failures.push(error);
    if (status === 'error') d.report.status = 'error';
    else if (d.report.status === 'built') d.report.status = status;
  });
}

/** Builds, checks and publishes a batch of pages. Returns [[path, report entry]]. */
async function runBatch(paths, env, flags) {
  const docs = [];
  const errors = {};
  paths.forEach((path) => {
    try {
      docs.push(...build(path, env));
    } catch (e) {
      errors[path] = { status: 'error', failures: [e.stack.split('\n').slice(0, 3).join(' | ')] };
    }
  });
  const finished = await pool(docs, 4, (doc) => finish(doc, env));
  env.media.save();
  if (!flags.has('dry') && !flags.has('media')) await upload(finished, flags);
  else {
    // nothing is uploaded: a document that equals its last upload is still up to date
    const uploaded = readJson(MANIFEST);
    finished.filter((d) => d.report.status === 'built' && uploaded[d.daPath]?.hash === d.hash)
      .forEach((d) => { d.report.status = 'unchanged'; });
  }
  updateJson(REPORT, (data) => {
    data.pages ??= {};
    data.fragments ??= {};
    finished.forEach((d) => {
      data[d.kind === 'page' ? 'pages' : 'fragments'][d.key] = d.report;
    });
    Object.assign(data.pages, errors);
    data.generated = new Date().toISOString();
  });
  return [...finished.map((d) => [d.key, d.report]), ...Object.entries(errors)];
}

async function createEnv(flags) {
  const owners = JSON.parse(readFileSync(join(M, 'owners.json'), 'utf8')).groups;
  const blocks = Object.values(owners).flatMap((g) => g.blocks);
  return {
    transforms: await loadTransforms(),
    registry: loadRegistry(),
    built: new Set(),
    known: new Set(fetchedPages({ all: true }).map((p) => webSafe(p.replace(/\.html$/, '')))),
    media: createMedia({ dry: flags.has('dry') }),
    blocks: new Set(['metadata', 'section-metadata', ...blocks]),
  };
}

function print([key, r]) {
  const detail = r.recall === undefined ? '' : `recall ${r.recall}  ${r.warnings.length} warnings`;
  console.log(`${r.status.padEnd(9)} ${key}  ${detail}`);
  (r.failures ?? []).forEach((f) => console.log(`    FAIL ${f.slice(0, 300)}`));
}

async function main() {
  const { pages, flags } = parseArgs(process.argv.slice(2));
  if (flags.has('fragments')) {
    scanFragments();
    return;
  }
  const wanted = flags.has('all') ? fetchedPages() : pages;
  if (!wanted.length) throw new Error('nothing to import: give --page, --pages or --all');
  wanted.filter((p) => NOT_MIGRATED.test(p))
    .forEach((p) => console.log(`skipped   ${p}  (content of the header: CONTRACT h17)`));
  const paths = wanted.filter((p) => !NOT_MIGRATED.test(p));
  const env = await createEnv(flags);
  const counts = {};
  let stopped = '';
  for (let i = 0; i < paths.length && !stopped; i += BATCH) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const results = await runBatch(paths.slice(i, i + BATCH), env, flags);
      results.forEach((result) => {
        counts[result[1].status] = (counts[result[1].status] ?? 0) + 1;
        print(result);
      });
    } catch (e) {
      if (!/bot protection|FETCH-STOP/.test(e.message)) throw e;
      env.media.save();
      stopped = `FETCH-STOP: ${e.message.split('\n')[0]}. Stopped in the batch of page ${i + 1}`;
    }
  }
  console.log(Object.entries(counts).map(([s, n]) => `${n} ${s}`).join(', '), `-> ${REPORT}`);
  if (!flags.has('dry')) {
    const { copied, present, failed } = env.media.totals();
    console.log(`images: ${copied} copied, ${present} already present, ${failed} failed`);
  }
  if (stopped) console.log(stopped);
  if (counts.failed || counts.error || stopped) process.exitCode = 1;
}

await main();
