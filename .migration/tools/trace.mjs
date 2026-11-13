#!/usr/bin/env node
// Finds WHERE a migrated page drifts from its source: pairs the visible texts of both pages by
// their text and prints a line each time the vertical offset, the height or the left edge
// changes, with font size, line height and margins on both sides. The first line where dy
// changes names the element that causes everything below it to shift.
//   node trace.mjs <source path> <width> [base=http://localhost:3520] [session]
import {
  close, open, run, SOURCE_ORIGIN, targetUrl,
} from './lib/page.mjs';

const [page, width = '1440', base = 'http://localhost:3520', session = `trace-${process.pid}`] = process.argv.slice(2);
if (!page) throw new Error('usage: node trace.mjs <source path> <width> [base] [session]');

const collect = (url) => run(session, `async (page, { still }) => {
  await still(${JSON.stringify(url)}, ${Number(width)});
  return page.evaluate(() => {
    const round = (n) => Math.round(n * 100) / 100;
    const rows = [];
    document.querySelectorAll('body *').forEach((el) => {
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ')
        .replace(/\\s+/g, ' ').trim();
      if (!own) return;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (!r.width || !r.height || cs.visibility === 'hidden') return;
      rows.push({
        key: own.toLowerCase().slice(0, 60), tag: el.tagName, top: round(r.top + scrollY), left: round(r.left),
        h: round(r.height), fs: cs.fontSize, lh: cs.lineHeight, fw: cs.fontWeight, mt: cs.marginTop, mb: cs.marginBottom,
      });
    });
    return { rows, height: document.documentElement.scrollHeight };
  });
}`);

const show = (r) => `${r.tag} top ${r.top} h ${r.h} fs ${r.fs} lh ${r.lh} fw ${r.fw} m ${r.mt}/${r.mb}`;
open(session);
try {
  const src = collect(SOURCE_ORIGIN + page);
  const tgt = collect(targetUrl(base, page));
  console.log(`height src ${src.height} tgt ${tgt.height}; texts src ${src.rows.length} tgt ${tgt.rows.length}`);
  const used = new Set();
  const onlySource = [];
  let last = null;
  src.rows.forEach((s) => {
    const i = tgt.rows.findIndex((t, n) => !used.has(n) && t.key === s.key);
    if (i < 0) { onlySource.push(s); return; }
    used.add(i);
    const t = tgt.rows[i];
    const [dy, dh, dx] = [t.top - s.top, t.h - s.h, t.left - s.left].map((n) => Math.round(n * 100) / 100);
    if (last === null || Math.abs(dy - last) >= 0.5 || Math.abs(dh) >= 0.5 || Math.abs(dx) >= 0.5) {
      console.log(`dy ${String(dy).padStart(7)} dh ${String(dh).padStart(6)} dx ${String(dx).padStart(6)}`
        + ` | src ${show(s)} | tgt ${show(t)} | "${s.key.slice(0, 38)}"`);
    }
    last = dy;
  });
  const onlyTarget = tgt.rows.filter((t, n) => !used.has(n));
  console.log(`unmatched: source ${onlySource.length}, target ${onlyTarget.length}`);
  onlySource.slice(0, 15).forEach((s) => console.log(`  only in source: ${s.tag} "${s.key}" top ${s.top}`));
  onlyTarget.slice(0, 15).forEach((t) => console.log(`  only in target: ${t.tag} "${t.key}" top ${t.top}`));
} finally {
  close(session);
}
