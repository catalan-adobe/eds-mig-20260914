// Fetches every source page and writes the DA documents. Usage: node tools/import/run.js
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { SOURCE } from './html.js';
import { convertFooter, convertNav, convertPage } from './page.js';
import { OUT, RUN } from './upload.js';

const PREFIX = `/${RUN}`;
const LOCALE_ROOT = /^\/[a-z]{2}\/[a-z]{2}$/;

async function save(path, html) {
  const file = join(OUT, `${PREFIX}${path}.html`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

async function importPage(path) {
  const resp = await fetch(`${SOURCE}${path}.html`);
  if (!resp.ok) throw new Error(`${path}: source returned ${resp.status}`);
  const html = await resp.text();
  await save(path, convertPage(html, path, PREFIX));
  if (LOCALE_ROOT.test(path)) {
    await save(`${path}/nav`, convertNav(html, PREFIX));
    await save(`${path}/footer`, convertFooter(html, PREFIX));
  }
}

const list = await readFile(new URL('./pages.txt', import.meta.url), 'utf8');
const paths = list.split('\n').filter(Boolean);
const errors = [];
for (let i = 0; i < paths.length; i += 8) {
  await Promise.all(paths.slice(i, i + 8).map((path) => importPage(path).catch((e) => errors.push(`${path}: ${e.stack}`))));
}
errors.forEach((message) => console.error(message));
console.log(`${paths.length - errors.length}/${paths.length} pages imported`);
if (errors.length) process.exit(1);
