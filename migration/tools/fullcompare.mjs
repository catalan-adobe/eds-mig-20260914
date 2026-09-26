#!/usr/bin/env node
// Capture the EDS page (desktop + mobile), diff whole page and each section against the reference slots.
// usage: node migration/tools/fullcompare.mjs <url> <label>   (sessions eds-d / eds-m must be open)
// writes migration/evidence/eds/<label>-{desktop,mobile}-*.png and diff images in evidence/diff/<label>/
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../..', import.meta.url).pathname;
const T = join(ROOT, 'migration/tools');
const EV = join(ROOT, 'migration/evidence');
const [url, label = 'run'] = process.argv.slice(2);
const SLOTS = {
  desktop: { hero: [53, 753], intro: [753, 964], cards: [964, 1548], features: [1548, 2696], partners: [2696, 3011],
    whatsnew: [3011, 3737], support: [3737, 4017], connect: [4017, 4302], footer: [4302, 4877] },
  mobile: { hero: [0, 560], intro: [560, 840], cards: [840, 2812], features: [2812, 5018], partners: [5018, 5236],
    whatsnew: [5236, 5971], support: [5971, 6357], connect: [6357, 6642], footer: [6642, 7318] },
};
const NAMES = ['hero', 'intro', 'cards', 'features', 'partners', 'whatsnew', 'support', 'connect'];
const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', cwd: ROOT }).trim();
const diffDir = join(EV, 'diff', label);
mkdirSync(diffDir, { recursive: true });
const rows = [];
for (const [vp, session, w, h] of [['desktop', 'eds-d', '1440', '900'], ['mobile', 'eds-m', '0', '0']]) {
  const out = join(EV, 'eds', `${label}-${vp}`);
  const boxes = JSON.parse(run(join(T, 'capture.sh'), [session, url, out, w, h, join(T, 'site/eds.css'), join(T, 'site/eds.prep.js'), join(T, 'site/eds-full.css'), join(T, 'site/eds-slots.json')]));
  writeFileSync(join(diffDir, `${vp}-boxes.json`), JSON.stringify(boxes));
  const width = vp === 'desktop' ? 1440 : 390;
  const ref = join(EV, 'ref', `${vp}-full.png`);
  const whole = run(join(T, 'compare.sh'), [ref, `${out}-full.png`, join(diffDir, `${vp}-page`)]);
  rows.push({ vp, part: 'PAGE', result: whole });
  const top = run(join(T, 'compare.sh'), [join(EV, 'ref', `${vp}-top.png`), `${out}-top.png`, join(diffDir, `${vp}-top`)]);
  rows.push({ vp, part: 'TOP (viewport)', result: top });
  NAMES.forEach((name, i) => {
    const [y0, y1] = SLOTS[vp][name];
    const b = boxes.slots[name];
    if (!b) { rows.push({ vp, part: name, result: 'MISSING' }); return; }
    const res = run(join(T, 'compare.sh'), [ref, `${out}-full.png`, join(diffDir, `${vp}-${name}`),
      `${width}x${y1 - y0}+0+${y0}`, `${width}x${b[3]}+0+${b[1]}`]);
    rows.push({ vp, part: name, result: `${res} edsY=${b[1]} refY=${y0}` });
  });
  if (boxes.slots.footer) {
    boxes.footer = boxes.slots.footer;
    const [y0, y1] = SLOTS[vp].footer;
    const res = run(join(T, 'compare.sh'), [ref, `${out}-full.png`, join(diffDir, `${vp}-footer`),
      `${width}x${y1 - y0}+0+${y0}`, `${width}x${boxes.footer[3]}+0+${boxes.footer[1]}`]);
    rows.push({ vp, part: 'footer', result: `${res} edsY=${boxes.footer[1]} refY=${y0}` });
  }
}
const table = ['| viewport | part | mismatch | detail |', '|---|---|---|---|',
  ...rows.map((r) => `| ${r.vp} | ${r.part} | ${r.result.split(' ')[0]} | ${r.result.split(' ').slice(1).join(' ')} |`)].join('\n');
writeFileSync(join(diffDir, 'table.md'), `${table}\n`);
console.log(table);
