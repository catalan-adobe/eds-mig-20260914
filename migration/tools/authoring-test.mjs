#!/usr/bin/env node
// Authoring proof: apply representative edits to the DA documents, preview, verify the rendered
// page reflects them, then restore the originals and verify the restore.
//
// usage: node migration/tools/authoring-test.mjs <edits.json>
// edits.json: [{ "doc": "spm-ft-0001/index", "find": "<exact html>", "replace": "<html>",
//               "expect": "<string the rendered .plain.html must contain>" }, ...]
// Evidence (before/after/restored .plain.html + summary) goes to migration/evidence/authoring/.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = new URL('../..', import.meta.url).pathname;
const DA = join(ROOT, 'migration/tools/da.sh');
const OUT = join(ROOT, 'migration/evidence/authoring');
const PREVIEW = 'https://main--eds-mig-20260914--catalan-adobe.aem.page';
mkdirSync(OUT, { recursive: true });

const da = (...a) => execFileSync(DA, a, { encoding: 'utf8' });
const plain = (doc) => execFileSync('curl', ['-sS', '-f', '-H', 'Cache-Control: no-cache', `${PREVIEW}/${doc}.plain.html?nocache=${Date.now()}`], { encoding: 'utf8' });
const sleep = (ms) => { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); };

function putAndPreview(doc, html) {
  const f = join(OUT, `${doc.replace(/\//g, '_')}.tmp.html`);
  writeFileSync(f, html);
  da('put', `${doc}.html`, f);
  da('preview', doc);
  sleep(1500);
}

const edits = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const docs = [...new Set(edits.map((e) => e.doc))];
const originals = Object.fromEntries(docs.map((d) => [d, da('get', `${d}.html`)]));
const results = [];

try {
  for (const doc of docs) {
    writeFileSync(join(OUT, `${doc.replace(/\//g, '_')}.before.plain.html`), plain(doc));
    let html = originals[doc];
    for (const e of edits.filter((x) => x.doc === doc)) {
      if (!html.includes(e.find)) throw new Error(`edit anchor not found in ${doc}: ${e.find.slice(0, 80)}`);
      html = html.replace(e.find, e.replace);
    }
    const t0 = Date.now();
    putAndPreview(doc, html);
    const after = plain(doc);
    writeFileSync(join(OUT, `${doc.replace(/\//g, '_')}.after.plain.html`), after);
    for (const e of edits.filter((x) => x.doc === doc)) {
      results.push({ doc, expect: e.expect, applied: after.includes(e.expect), editToPreviewMs: Date.now() - t0 });
    }
  }
} finally {
  for (const doc of docs) {
    putAndPreview(doc, originals[doc]);
    const restored = plain(doc);
    writeFileSync(join(OUT, `${doc.replace(/\//g, '_')}.restored.plain.html`), restored);
    const before = readFileSync(join(OUT, `${doc.replace(/\//g, '_')}.before.plain.html`), 'utf8');
    results.push({ doc, restored: restored === before });
  }
}
writeFileSync(join(OUT, 'summary.json'), JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
