// Uploads changed documents into DA, previews them and checks that each answers 200.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  FOLDER, PREVIEW, preview, request, upload,
} from '../../tools/da.mjs';
import { isFresh } from './check.mjs';
import { OUT, webPathOf } from './config.mjs';
import { readJson, updateJson } from './store.mjs';

export const MANIFEST = join(OUT, 'manifest.json');
const ADMIN = 'https://admin.hlx.page';
const BULK_API = `${ADMIN}/preview/catalan-adobe/eds-mig-20260914/main/*`;
// from this many documents on, one bulk job replaces a preview call per document
const BULK_FROM = 25;
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });

/** Runs `fn` over the items, `width` at a time. */
export async function pool(items, width, fn) {
  const queue = [...items.entries()];
  const out = [];
  await Promise.all(Array.from({ length: width }, async () => {
    for (let next = queue.shift(); next; next = queue.shift()) {
      // eslint-disable-next-line no-await-in-loop
      out[next[0]] = await fn(next[1]);
    }
  }));
  return out;
}

function bearer() {
  const file = join(homedir(), '.aem', 'da-token.json');
  return { Authorization: `Bearer ${JSON.parse(readFileSync(file, 'utf8')).access_token}` };
}

/** One bulk preview job for all paths. Returns Map(web path -> error) of the failed ones. */
async function bulkPreview(webPaths) {
  const headers = { ...bearer(), 'Content-Type': 'application/json' };
  const body = JSON.stringify({ forceUpdate: true, paths: webPaths.map((p) => FOLDER + p) });
  const started = await request(BULK_API, { method: 'POST', headers, body });
  if (!started.ok) throw new Error(`bulk preview: HTTP ${started.status} ${await started.text()}`);
  const { links } = await started.json();
  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(3000);
    // eslint-disable-next-line no-await-in-loop
    const job = await (await request(`${links.self}/details`, { headers })).json();
    if (job.state === 'stopped') {
      const failed = (job.data?.resources ?? []).filter((r) => r.status >= 400);
      const reason = (r) => `preview ${r.status} ${r.error ?? ''}`;
      return new Map(failed.map((r) => [r.path.slice(FOLDER.length), reason(r)]));
    }
  }
}

/** Previews each path with its own call. Returns Map(web path -> error) of the failed ones. */
async function singlePreviews(webPaths) {
  const failed = new Map();
  await Promise.all(webPaths.map((p) => preview(p).catch((e) => failed.set(p, e.message))));
  return failed;
}

/** '' when the preview answers 200 with this document, else what is wrong. */
async function verify(doc) {
  const webPath = webPathOf(doc.daPath);
  let problem = '';
  for (let attempt = 0; attempt < 3; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const res = await request(`${PREVIEW}${webPath}.plain.html`);
    // eslint-disable-next-line no-await-in-loop
    if (res.status === 200 && isFresh(doc.html, await res.text())) return '';
    problem = res.status === 200 ? 'the preview shows an earlier upload'
      : `.plain.html answers ${res.status}`;
    // eslint-disable-next-line no-await-in-loop
    await sleep(2000);
    // the CDN sometimes keeps the copy of an earlier upload: a new preview purges it
    // eslint-disable-next-line no-await-in-loop
    if (res.status === 200) await preview(webPath).catch(() => {});
  }
  return problem;
}

/**
 * Uploads and previews the documents whose content changed since their last successful upload.
 * @param {Array} docs [{ daPath, html, hash }]
 * @returns {Map} daPath -> { status: 'previewed' | 'unchanged' | 'error', error }
 */
export async function publish(docs, { force = false } = {}) {
  const manifest = readJson(MANIFEST);
  const result = new Map(docs.map((d) => [d.daPath, { status: 'unchanged' }]));
  const changed = docs.filter((d) => force || manifest[d.daPath]?.hash !== d.hash);
  const error = (daPath, message) => result.set(daPath, { status: 'error', error: message });
  await Promise.all(changed.map((d) => upload(d.daPath, d.html)
    .catch((e) => error(d.daPath, e.message))));
  const uploaded = changed.filter((d) => result.get(d.daPath).status !== 'error');
  const paths = uploaded.map((d) => webPathOf(d.daPath));
  const failed = paths.length >= BULK_FROM ? await bulkPreview(paths) : await singlePreviews(paths);
  const done = [];
  await pool(uploaded, 6, async (d) => {
    const problem = failed.get(webPathOf(d.daPath)) ?? await verify(d);
    if (problem) error(d.daPath, problem);
    else {
      result.set(d.daPath, { status: 'previewed' });
      done.push(d);
    }
  });
  if (done.length) {
    const at = new Date().toISOString();
    updateJson(MANIFEST, (data) => done.forEach((d) => { data[d.daPath] = { hash: d.hash, at }; }));
  }
  return result;
}
