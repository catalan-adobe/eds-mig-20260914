#!/usr/bin/env node
// Assemble the homepage DA document from per-section files and (optionally) push + preview it.
//
// usage: node migration/tools/assemble.mjs [--media] [--push]
//   --media  copy external images into DA (spm-ft-0001/media/) and rewrite <img src> to content.da.live
//   --push   PUT spm-ft-0001/index.html to DA and trigger preview
// Output: migration/sections/index.html (the full document as stored in DA).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const ROOT = new URL('../..', import.meta.url).pathname;
const SECTIONS = join(ROOT, 'migration/sections');
const DA = join(ROOT, 'migration/tools/da.sh');
const ORG_SITE = 'catalan-adobe/eds-mig-20260914';
const MEDIA_DIR = 'spm-ft-0001/media';

/** Read a section file and return the parts split at `<!-- name -->` markers. */
function parts(file) {
  const path = join(SECTIONS, file);
  if (!existsSync(path)) throw new Error(`missing section file ${path} (block agent output)`);
  const html = readFileSync(path, 'utf8');
  const out = { main: '' };
  let current = 'main';
  for (const chunk of html.split(/(<!--\s*[\w-]+\s*-->)/)) {
    const marker = chunk.match(/^<!--\s*([\w-]+)\s*-->$/);
    if (marker) current = marker[1];
    else out[current] = (out[current] || '') + chunk;
  }
  return out;
}

const metadata = `<div><div class="metadata">
  <div><div>Title</div><div>Synopsys | EDA Tools, Semiconductor IP &amp; Systems Verification</div></div>
  <div><div>Description</div><div>Synopsys delivers comprehensive silicon-to-systems solutions that help innovators accelerate development, reduce risk, and drive breakthroughs.</div></div>
  <div><div>Image</div><div><img src="https://images.synopsys.com/is/image/synopsys/synopsys-purple-bkgd-logo-social-1200x675" alt="Synopsys"></div></div>
  <div><div>nav</div><div>/spm-ft-0001/nav</div></div>
  <div><div>footer</div><div>/spm-ft-0001/footer</div></div>
</div></div>`;

function assemble() {
  const hero = parts('hero.html');
  const introConnect = parts('intro-connect.html');
  const cardsColumns = parts('cards-columns.html');
  const logosNews = parts('logos-news.html');
  const order = [
    hero.main,
    introConnect.main,
    cardsColumns.main,
    logosNews.main,
    cardsColumns.support,
    introConnect.connect,
    metadata,
  ];
  order.forEach((p, i) => { if (!p || !p.trim()) throw new Error(`empty page part #${i}`); });
  return `<body><header></header><main>${order.map((p) => p.trim()).join('\n')}</main><footer></footer></body>\n`;
}

/** Copy each external image into DA once (name = readable basename + short hash) and rewrite src. */
function copyMedia(html) {
  const urls = [...new Set([...html.matchAll(/<img[^>]+src="(https?:\/\/[^"]+)"/g)].map((m) => m[1]))]
    .filter((u) => !u.startsWith('https://content.da.live/'));
  let out = html;
  for (const url of urls) {
    const clean = url.replace(/&amp;/g, '&');
    const res = execFileSync('curl', ['-sS', '-f', '-L', '-D', '-', '-o', '/tmp/da-media.bin', clean], { encoding: 'utf8' });
    const type = (res.match(/content-type:\s*([^\s;]+)/i) || [])[1] || '';
    const ext = { 'image/svg+xml': 'svg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }[type] || 'jpg';
    const base = new URL(clean).pathname.split('/').pop().replace(/\.(svg|png|jpe?g|webp|gif)(\..*)?$/i, '')
      .replace(/[^a-z0-9-]+/gi, '-').toLowerCase().slice(0, 60);
    const name = `${base}-${createHash('sha1').update(clean).digest('hex').slice(0, 6)}.${ext}`;
    execFileSync(DA, ['upload', `${MEDIA_DIR}/${name}`, '/tmp/da-media.bin'], { stdio: 'inherit' });
    out = out.split(url).join(`https://content.da.live/${ORG_SITE}/${MEDIA_DIR}/${name}`);
  }
  return out;
}

const args = process.argv.slice(2);
let doc = assemble();
if (args.includes('--media')) doc = copyMedia(doc);
const outFile = join(SECTIONS, 'index.html');
writeFileSync(outFile, doc);
console.log(`wrote ${outFile} (${doc.length} bytes)`);
if (args.includes('--push')) {
  execFileSync(DA, ['put', 'spm-ft-0001/index.html', outFile], { stdio: 'inherit' });
  execFileSync(DA, ['preview', 'spm-ft-0001/index'], { stdio: 'inherit' });
}
