#!/usr/bin/env node
// Authoring proof: apply representative edits to DA documents, preview, verify the rendered output,
// then restore the originals and verify the restore.
//
// usage: node migration/tools/authoring-test.mjs apply <edits.json>    (backs up originals first)
//        node migration/tools/authoring-test.mjs restore <edits.json>
// edits.json: [{ "doc": "spm-ft-0001/index", "find": "<exact html>", "replace": "<html>",
//               "expect": "<string the previewed .plain.html must contain after the edit>" }, ...]
// Evidence (.plain.html snapshots, summary json) goes to migration/evidence/authoring/.

import {
  readFileSync, writeFileSync, mkdirSync, existsSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = new URL('../..', import.meta.url).pathname;
const DA = join(ROOT, 'migration/tools/da.sh');
const OUT = join(ROOT, 'migration/evidence/authoring');
const PREVIEW = 'https://main--eds-mig-20260914--catalan-adobe.aem.page';
mkdirSync(join(OUT, 'backup'), { recursive: true });

const da = (...a) => execFileSync(DA, a, { encoding: 'utf8' });
const key = (doc) => doc.replace(/\//g, '_');
const plain = (doc) => execFileSync('curl', ['-sS', '-f', '-H', 'Cache-Control: no-cache',
  `${PREVIEW}/${doc}.plain.html?nocache=${Date.now()}`], { encoding: 'utf8' });

function putAndPreview(doc, html) {
  const f = join(OUT, `${key(doc)}.upload.html`);
  writeFileSync(f, html);
  const t0 = Date.now();
  da('put', `${doc}.html`, f);
  da('preview', doc);
  return Date.now() - t0;
}

const [mode, file] = process.argv.slice(2);
if (!['apply', 'restore'].includes(mode) || !file) {
  console.error('usage: authoring-test.mjs apply|restore <edits.json>');
  process.exit(2);
}
const edits = JSON.parse(readFileSync(file, 'utf8'));
const docs = [...new Set(edits.map((e) => e.doc))];
const results = [];

for (const doc of docs) {
  const backup = join(OUT, 'backup', `${key(doc)}.html`);
  if (mode === 'apply') {
    if (existsSync(backup)) throw new Error(`backup exists for ${doc}; restore first (${backup})`);
    const original = da('get', `${doc}.html`);
    writeFileSync(backup, original);
    writeFileSync(join(OUT, `${key(doc)}.before.plain.html`), plain(doc));
    let html = original;
    for (const e of edits.filter((x) => x.doc === doc)) {
      if (!html.includes(e.find)) throw new Error(`edit anchor not found in ${doc}: ${e.find.slice(0, 80)}`);
      html = html.replace(e.find, e.replace);
    }
    const ms = putAndPreview(doc, html);
    const after = plain(doc);
    writeFileSync(join(OUT, `${key(doc)}.after.plain.html`), after);
    edits.filter((x) => x.doc === doc).forEach((e) => {
      results.push({ doc, expect: e.expect, applied: after.includes(e.expect), putPlusPreviewMs: ms });
    });
  } else {
    if (!existsSync(backup)) throw new Error(`no backup for ${doc}`);
    const ms = putAndPreview(doc, readFileSync(backup, 'utf8'));
    const restored = plain(doc);
    writeFileSync(join(OUT, `${key(doc)}.restored.plain.html`), restored);
    const before = readFileSync(join(OUT, `${key(doc)}.before.plain.html`), 'utf8');
    const sourceNow = da('get', `${doc}.html`);
    results.push({
      doc,
      restoredPlainEqualsBefore: restored === before,
      restoredSourceEqualsBackup: sourceNow === readFileSync(backup, 'utf8'),
      editsGone: edits.filter((x) => x.doc === doc).every((e) => !restored.includes(e.expect)),
      putPlusPreviewMs: ms,
    });
    writeFileSync(`${backup}.restored`, readFileSync(backup));
    execFileSync('trash', [backup]);
  }
}
writeFileSync(join(OUT, `summary-${mode}.json`), JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
