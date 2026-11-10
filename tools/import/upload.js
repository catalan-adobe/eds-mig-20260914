// Uploads generated pages to DA and triggers preview.
// Usage: node tools/import/upload.js [web-path-prefix]
import { readFile, readdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RUN = 'f52-1011-01';
const SITE = 'catalan-adobe/eds-mig-20260914';
// Generated content lives outside the URL space so the local dev server never shadows preview.
export const OUT = fileURLToPath(new URL('../../.import/', import.meta.url));

export function toWebPath(file) {
  const path = `/${normalize(file).replace(/\.html$/, '')}`;
  if (!path.startsWith(`/${RUN}/`)) throw new Error(`${file} is outside /${RUN}/, refusing to upload`);
  return path;
}

async function call(method, url, token, body) {
  const resp = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body });
  return resp.status;
}

async function publish(file, token) {
  const path = toWebPath(file);
  const form = new FormData();
  form.set('data', new Blob([await readFile(join(OUT, file))], { type: 'text/html' }));
  const da = await call('PUT', `https://admin.da.live/source/${SITE}${path}.html`, token, form);
  const preview = da < 300
    ? await call('POST', `https://admin.hlx.page/preview/${SITE}/main${path}`, token)
    : 'skipped';
  console.log(`${path} da=${da} preview=${preview}`);
  return da < 300 && preview < 300;
}

async function main() {
  const prefix = process.argv[2] || `/${RUN}/`;
  const { access_token: token } = JSON.parse(await readFile(join(homedir(), '.aem/da-token.json'), 'utf8'));
  const files = (await readdir(join(OUT, RUN), { recursive: true }))
    .filter((f) => f.endsWith('.html'))
    .map((f) => relative(OUT, join(OUT, RUN, f)))
    .filter((f) => toWebPath(f).startsWith(prefix))
    .sort();
  let failed = 0;
  for (let i = 0; i < files.length; i += 5) {
    const results = await Promise.all(files.slice(i, i + 5).map((f) => publish(f, token)));
    failed += results.filter((ok) => !ok).length;
  }
  console.log(`${files.length - failed}/${files.length} uploaded and previewed`);
  if (failed || !files.length) process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
