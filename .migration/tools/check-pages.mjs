#!/usr/bin/env node
// Loads every representative page on the dev server and reports what is broken: console
// errors, failed requests, exceptions of a block, broken images, blocks and sections that stay
// undecorated, a header or footer that did not load.
//   node check-pages.mjs [width] [source path ...]   default: 1440, every page of source/reps.txt
// Prints the findings per page and writes all that was collected to <tmp>/f52-synopsys/.
// The source is not loaded: its requests come from the cache or are aborted.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  close, open, ROOT as M, run, targetPath,
} from './lib/page.mjs';

const BASE = 'http://localhost:3520';
const SESSION = 'check-pages';
const OUT = join(tmpdir(), 'f52-synopsys');
const NOT_MIGRATED = /^\/([a-z]{2}-[a-z]{2}\/)?refs\/global-navigation[/.]/;
const [width = '1440', ...only] = process.argv.slice(2);
const pages = (only.length ? only : readFileSync(join(M, 'source/reps.txt'), 'utf8').split('\n'))
  .map((l) => l.trim()).filter((p) => p && !NOT_MIGRATED.test(p));

const CODE = (urls) => `async (page, { still }) => {
  const out = [];
  for (const url of ${JSON.stringify(urls)}) {
    const log = { url, console: [], failed: [], bad: [] };
    const onConsole = (m) => {
      const text = m.text();
      if (m.type() === 'error' || /failed to load/i.test(text)) log.console.push(text.slice(0, 300));
    };
    const onError = (e) => log.console.push('pageerror: ' + String(e.message).slice(0, 300) + ' @ ' + String(e.stack || '').split('\\n').slice(1, 3).join(' | ').slice(0, 300));
    const onFailed = (r) => log.failed.push(r.url().slice(0, 200) + ' ' + (r.failure() ? r.failure().errorText : ''));
    const onResponse = (r) => { if (r.status() >= 400) log.bad.push(r.status() + ' ' + r.url().slice(0, 200)); };
    page.on('console', onConsole); page.on('pageerror', onError);
    page.on('requestfailed', onFailed); page.on('response', onResponse);
    try {
      log.status = await still(url, ${Number(width)});
      Object.assign(log, await page.evaluate(() => ({
        undecorated: [...document.querySelectorAll('.block')]
          .filter((b) => b.dataset.blockStatus !== 'loaded').map((b) => b.className),
        sections: [...document.querySelectorAll('main .section')]
          .filter((s) => s.dataset.sectionStatus && s.dataset.sectionStatus !== 'loaded').length,
        images: [...document.images].filter((i) => (i.getAttribute('src') || '').startsWith('about:error')
          || (i.complete && i.naturalWidth === 0)).map((i) => (i.getAttribute('src') || i.outerHTML).slice(0, 160)),
        pending: [...document.images].filter((i) => !i.complete).length,
        blocks: [...new Set([...document.querySelectorAll('main .block')].map((b) => b.dataset.blockName))],
        height: document.documentElement.scrollHeight,
        header: !!document.querySelector('header .header[data-block-status="loaded"]'),
        footer: !!document.querySelector('footer .footer[data-block-status="loaded"]'),
      })));
    } catch (e) {
      log.error = String(e.message).slice(0, 300);
    }
    page.off('console', onConsole); page.off('pageerror', onError);
    page.off('requestfailed', onFailed); page.off('response', onResponse);
    out.push(log);
  }
  return out;
}`;

open(SESSION);
const results = [];
try {
  for (let i = 0; i < pages.length; i += 6) {
    const urls = pages.slice(i, i + 6).map((p) => BASE + targetPath(p));
    try {
      results.push(...run(SESSION, CODE(urls), { timeout: 600 }));
    } catch (e) {
      results.push(...urls.map((url) => ({ url, error: e.message.slice(0, 300) })));
      open(SESSION);
    }
    process.stderr.write(`${Math.min(i + 6, pages.length)} / ${pages.length}\n`);
  }
} finally {
  close(SESSION);
}
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, `check-pages-${width}.json`), JSON.stringify(results, null, 1));
// not a finding: a request the page cancelled (a picture swapped while loading), a tracker,
// and the source's APIs, which a test never calls (tools/lib/page.mjs aborts them)
const IGNORE = new RegExp(['net::ERR_ABORTED', 'net::ERR_BLOCKED_BY_CLIENT', 'metrics\\.brightcove',
  'doubleclick', 'demdex', 'munchkin', 'smetrics', 'api\\.synopsys\\.com/api/', '/dw/api/'].join('|'));
// the console repeats every failed request without its URL: they are listed under `failed`
const GENERIC = /^Failed to load resource: net::ERR_FAILED$/;
let dirty = 0;
results.forEach((r) => {
  const issues = [
    ...(r.error ? [`ERROR ${r.error}`] : []),
    ...(r.status && r.status !== 200 ? [`HTTP ${r.status}`] : []),
    ...(r.console ?? []).filter((c) => !GENERIC.test(c)).map((c) => `console: ${c}`),
    ...(r.failed ?? []).filter((f) => !IGNORE.test(f)).map((f) => `failed: ${f}`),
    ...(r.bad ?? []).map((b) => `http: ${b}`),
    ...(r.undecorated ?? []).map((b) => `undecorated: ${b}`),
    ...(r.images ?? []).map((s) => `image: ${s}`),
    ...(r.sections ? [`${r.sections} sections not loaded`] : []),
    ...(r.header === false ? ['header not loaded'] : []),
    ...(r.footer === false ? ['footer not loaded'] : []),
  ];
  if (!issues.length) return;
  dirty += 1;
  console.log(r.url.replace(BASE, ''));
  [...new Set(issues)].forEach((x) => console.log(`   ${x}`));
});
console.log(`${results.length} pages, ${dirty} with findings -> ${OUT}/check-pages-${width}.json`);
if (dirty) process.exitCode = 1;
