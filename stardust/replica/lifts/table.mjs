// compact lift table: node table.mjs <measure.json> <width> [--props a,b] [--sel regex]
import fs from 'node:fs';
const [file, width, ...rest] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(file, 'utf8'));
const pi = rest.indexOf('--props'); const props = pi >= 0 ? rest[pi + 1].split(',') : ['boxSizing','width','height','margin','padding','fontSize','lineHeight','fontWeight','color','backgroundColor','textTransform','display','position','textAlign','fontFamily'];
const si = rest.indexOf('--sel'); const selRe = si >= 0 ? new RegExp(rest[si + 1]) : null;
const url = Object.keys(d.pages)[0]; const page = d.pages[url][width];
const root = d.root[url][width]; console.log(`root ${width}: scrollW ${root.scrollWidth} scrollH ${root.scrollHeight}`);
for (const [sel, matches] of Object.entries(page)) {
  if (selRe && !selRe.test(sel)) continue;
  for (const m of matches) {
    const r = m.rect; const p = m.props || {};
    const pv = props.filter(k => p[k] !== undefined).map(k => `${k}=${String(p[k]).replace(/"/g,'').slice(0,60)}`).join(' | ');
    const img = m.img ? ` img ${m.img.naturalWidth}x${m.img.naturalHeight}` : '';
    console.log(`${sel}${matches.length>1?`[${m.index}]`:''}  ${r.x},${r.y} ${r.w}x${r.h}${m.visible?'':' HIDDEN'}${img}\n    ${pv}`);
  }
}
