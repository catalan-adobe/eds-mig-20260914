#!/usr/bin/env node
// Screenshot a source page and its migrated twin, then report where they differ.
//
//   node compare.mjs --page /us/en.html --base http://localhost:3101 [--width 1440]
//   node compare.mjs --src <url> --tgt <url> [--src-sel <css> --tgt-sel <css>]
//   node compare.mjs --all --base <origin> [--width 1440]      (every page, summary table)
//
// Options: --out <dir> (default .migration/shots/<name>-<width>), --session <name>,
//          --fuzz <pct> (default 6), --band <px> (default 800)
// Prints JSON: heights, overall diff %, diff % per horizontal band. For each band above
// 0.5% it writes band-<y>.png (source left, target right) so you can view that part alone.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE_ORIGIN = 'https://wknd.site';
const PREFIX = '/f52-1011-02';

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

const pw = (...a) => execFileSync('playwright-cli', [`-s=${session}`, ...a], { encoding: 'utf8' });
const magick = (...a) => execFileSync('magick', a, { encoding: 'utf8' });

function shoot(url, selector, file) {
  const code = `async (page) => {
    await page.setViewportSize({ width: ${width}, height: 900 });
    await page.goto(${JSON.stringify(url)}, { waitUntil: 'load', timeout: 60000 });
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => { setTimeout(r, 100); });
      }
      window.scrollTo(0, 0);
      await document.fonts.ready;
    });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(800);
    const opts = { path: ${JSON.stringify(file)}, animations: 'disabled' };
    ${selector
    ? `await page.locator(${JSON.stringify(selector)}).first().screenshot(opts);`
    : 'await page.screenshot({ ...opts, fullPage: true });'}
  }`;
  const codeFile = `${file}.js`;
  writeFileSync(codeFile, code);
  const out = pw('run-code', '--filename', codeFile);
  if (/Error/.test(out) && !/### Result/.test(out)) throw new Error(`screenshot failed for ${url}: ${out}`);
}

const size = (file) => magick('identify', '-format', '%w %h', file).split(' ').map(Number);

// compare exits 1 when images differ and prints the differing pixel count on stderr
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

function compare(srcUrl, tgtUrl, outDir) {
  mkdirSync(outDir, { recursive: true });
  const src = join(outDir, 'src.png');
  const tgt = join(outDir, 'tgt.png');
  shoot(srcUrl, args['src-sel'], src);
  shoot(tgtUrl, args['tgt-sel'], tgt);
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
    const px = diffPixels(src + crop, tgt + crop, 'null:');
    const pct = +((100 * px) / (w * bh)).toFixed(2);
    const band = { y, pct };
    if (pct > 0.5) {
      band.image = join(outDir, `band-${String(y).padStart(5, '0')}.png`);
      magick(src + crop, tgt + crop, '-bordercolor', 'red', '-border', '2', '+append', band.image);
    }
    bands.push(band);
  }
  return {
    srcUrl, tgtUrl, width, srcHeight: sh, tgtHeight: th, diffPct: +((100 * total) / (w * h)).toFixed(2), outDir, bands,
  };
}

const targetUrl = (page) => `${args.base}${PREFIX}${page.replace(/\.html$/, '')}`;
const slug = (page) => page.replace(/^\//, '').replace(/\.html$/, '').replace(/\//g, '__');
const outFor = (name) => resolve(args.out || join(HERE, '..', 'shots', `${name}-${width}`));

pw('open');
try {
  if (args.all) {
    const inventory = JSON.parse(readFileSync(join(HERE, '..', 'source', 'inventory.json'), 'utf8'));
    Object.keys(inventory).forEach((page) => {
      try {
        const r = compare(SOURCE_ORIGIN + page, targetUrl(page), join(outFor('all'), slug(page)));
        console.log(`${String(r.diffPct).padStart(6)}%  h ${r.srcHeight}/${r.tgtHeight}  ${page}`);
      } catch (e) {
        console.log(`  FAIL  ${page}  ${e.message.split('\n')[0]}`);
      }
    });
  } else if (args.page) {
    console.log(JSON.stringify(compare(SOURCE_ORIGIN + args.page, targetUrl(args.page), outFor(slug(args.page))), null, 1));
  } else {
    console.log(JSON.stringify(compare(args.src, args.tgt, outFor('custom')), null, 1));
  }
} finally {
  pw('close');
}
