#!/usr/bin/env node
// Screenshot a source page and its migrated twin, then report where they differ.
//
//   node compare.mjs --page /ai.html --base http://localhost:3520 [--width 1440]
//   node compare.mjs --src <url> --tgt <url> [--src-sel <css> --tgt-sel <css>]   (one region)
//   node compare.mjs --pages <file> --base <origin> [--width 1440] [--json <file>]
//       (file: one source path per line; prints a table, one page at a time; with --warm it
//       only takes and keeps the source shots)
//
// Options: --out <dir> (default .migration/shots/<name>-<width>), --session <name> (yours),
//          --fuzz <pct> (default 6), --band <px> (default 800), --fresh (retake the source shot;
//          a full-page source shot is otherwise taken once and kept in .migration/shots/source)
// Prints JSON: heights, overall diff %, diff % per horizontal band. For each band above 0.5 %
// it writes band-<y>.png (source left, target right) and names what sits in the band: `source`
// = AEM components, `target` = EDS blocks. Open an image with the read tool in the turn AFTER
// this command. Source against source gives about 0 %, so a diff is real.
import { execFileSync } from 'node:child_process';
import {
  copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import {
  close, open, ROOT, run, SOURCE_ORIGIN, targetUrl,
} from './lib/page.mjs';

const args = {};
process.argv.slice(2).forEach((a, i, all) => {
  if (!a.startsWith('--')) return;
  const next = all[i + 1];
  args[a.slice(2)] = next && !next.startsWith('--') ? next : true;
});
const width = Number(args.width || 1440);
const fuzz = `${args.fuzz || 6}%`;
const bandHeight = Number(args.band || 800);
const session = args.session || `cmp-${process.pid}`;

const magick = (...a) => execFileSync('magick', a, { encoding: 'utf8' });
const size = (file) => magick('identify', '-format', '%w %h', file).split(' ').map(Number);

// What sits where on the page: source AEM components, or EDS blocks and sections.
const OWNERS = `() => {
  const box = (el, name) => {
    const r = el.getBoundingClientRect();
    const visible = el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    return { name, visible, top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY) };
  };
  const eds = [...document.querySelectorAll('header .block, footer .block, main .block, main .default-content-wrapper')]
    .map((el) => box(el, el.dataset.blockName || 'default-content'));
  const leaf = (el) => !el.querySelector('.aem-GridColumn');
  const aem = [...document.querySelectorAll('.aem-GridColumn')].filter(leaf)
    .map((el) => box(el, el.className.split(/\\s+/).find((c) => !c.startsWith('aem-Grid'))));
  const shown = (b) => b.name && b.bottom > b.top && b.visible;
  return [...eds, ...aem].filter(shown);
}`;

function shoot(url, selector, file) {
  const sel = selector ? JSON.stringify(selector) : 'undefined';
  return run(session, `async (page, { still, shot }) => {
    await still(${JSON.stringify(url)}, ${width});
    await shot(${JSON.stringify(file)}, ${sel});
    return page.evaluate(${OWNERS});
  }`);
}

const within = (boxes, y, h) => [...new Set(boxes.filter((b) => b.top < y + h && b.bottom > y).map((b) => b.name))];

// compare exits 1 when the images differ and prints the differing pixel count on stderr
function diffPixels(a, b, out) {
  try {
    execFileSync('magick', ['compare', '-metric', 'AE', '-fuzz', fuzz, a, b, out], { stdio: 'pipe' });
    return 0;
  } catch (e) {
    const n = parseFloat(String(e.stderr).trim());
    if (Number.isNaN(n)) throw new Error(`magick compare failed: ${e.stderr}`);
    return n;
  }
}

/** The source does not change: its full-page shot is taken once per page and width. */
function shootSource(url, file) {
  if (args['src-sel'] || !url.startsWith(SOURCE_ORIGIN)) return shoot(url, args['src-sel'], file);
  const kept = join(ROOT, 'shots', 'source', `${slug(url.slice(SOURCE_ORIGIN.length))}-${width}`);
  if (!existsSync(`${kept}.json`) || args.fresh) {
    mkdirSync(join(ROOT, 'shots', 'source'), { recursive: true });
    writeFileSync(`${kept}.json`, JSON.stringify(shoot(url, undefined, `${kept}.png`)));
  }
  copyFileSync(`${kept}.png`, file);
  return JSON.parse(readFileSync(`${kept}.json`, 'utf8'));
}

function compare(srcUrl, tgtUrl, outDir) {
  mkdirSync(outDir, { recursive: true });
  const src = join(outDir, 'src.png');
  const tgt = join(outDir, 'tgt.png');
  const srcBoxes = shootSource(srcUrl, src);
  const tgtBoxes = shoot(tgtUrl, args['tgt-sel'], tgt);
  const [sw, sh] = size(src);
  const [tw, th] = size(tgt);
  const w = Math.max(sw, tw);
  const h = Math.max(sh, th);
  // pad both to one canvas so a height mismatch shows up as a diff instead of an error
  [src, tgt].forEach((f) => magick(f, '-background', 'white', '-gravity', 'NorthWest', '-extent', `${w}x${h}`, f));
  const total = diffPixels(src, tgt, join(outDir, 'diff.png'));
  const bands = [];
  for (let y = 0; y < h; y += bandHeight) {
    const bh = Math.min(bandHeight, h - y);
    const crop = `[${w}x${bh}+0+${y}]`;
    const pct = +((100 * diffPixels(src + crop, tgt + crop, 'null:')) / (w * bh)).toFixed(2);
    const band = { y, pct };
    if (pct > 0.5) {
      band.source = within(srcBoxes, y, bh);
      band.target = within(tgtBoxes, y, bh);
      band.image = join(outDir, `band-${String(y).padStart(5, '0')}.png`);
      magick(src + crop, tgt + crop, '-bordercolor', 'red', '-border', '2', '+append', band.image);
    }
    bands.push(band);
  }
  return {
    srcUrl, tgtUrl, width, srcHeight: sh, tgtHeight: th, diffPct: +((100 * total) / (w * h)).toFixed(2), outDir, bands,
  };
}

function slug(page) {
  return page.replace(/^\//, '').replace(/\.html$/, '').replace(/\//g, '__') || 'index';
}
const outFor = (name) => resolve(args.out || join(ROOT, 'shots', `${name}-${width}`));
const pair = (page, dir) => compare(SOURCE_ORIGIN + page, targetUrl(args.base, page), dir);

function sweep() {
  const pages = readFileSync(args.pages, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
  const rows = pages.map((page) => {
    const dir = join(outFor('sweep'), slug(page));
    try {
      if (args.warm) {
        mkdirSync(dir, { recursive: true });
        shootSource(SOURCE_ORIGIN + page, join(dir, 'src.png'));
        console.log(`warmed ${width} ${page}`);
        return { page, width };
      }
      let r = pair(page, dir);
      // two captures of one page can disagree (a late image, a font swap): take the better of two
      if (r.diffPct > 3) { const again = pair(page, dir); if (again.diffPct < r.diffPct) r = again; }
      console.log(`${String(r.diffPct).padStart(6)}%  h ${r.srcHeight}/${r.tgtHeight}  ${page}`);
      const bands = r.bands.filter((b) => b.image);
      return { page, width, diffPct: r.diffPct, srcHeight: r.srcHeight, tgtHeight: r.tgtHeight, bands };
    } catch (e) {
      console.log(`  FAIL  ${page}  ${e.message.split('\n')[0]}`);
      return { page, width, error: e.message.split('\n')[0] };
    }
  });
  if (args.json) writeFileSync(args.json, JSON.stringify(rows, null, 1));
}

open(session);
try {
  if (args.pages) sweep();
  else if (args.page) console.log(JSON.stringify(pair(args.page, outFor(slug(args.page))), null, 1));
  else if (args.src && args.tgt) console.log(JSON.stringify(compare(args.src, args.tgt, outFor('custom')), null, 1));
  else throw new Error('usage: see the comment at the top of compare.mjs');
} finally {
  close(session);
}
