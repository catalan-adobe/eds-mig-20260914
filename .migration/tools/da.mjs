#!/usr/bin/env node
// DA and preview access, limited to the folder /f52-synopsys-1211-02. Admin calls run 4 at a time.
//   node da.mjs put <local file> <path under the folder, with extension>   e.g. /nav.html
//   node da.mjs preview <web path under the folder, no extension>         e.g. /nav
//   node da.mjs rm <path under the folder, with extension>                (unpreviews, deletes)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ORG = 'catalan-adobe';
const REPO = 'eds-mig-20260914';
export const FOLDER = '/f52-synopsys-1211-02';
const DA_SOURCE = `https://admin.da.live/source/${ORG}/${REPO}${FOLDER}`;
const PREVIEW_API = `https://admin.hlx.page/preview/${ORG}/${REPO}/main${FOLDER}`;
export const PREVIEW = `https://main--${REPO}--${ORG}.aem.page${FOLDER}`;
const MAX_TRIES = 6;
const TYPES = {
  '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
};

let token;
function auth() {
  if (!token) {
    const file = path.join(os.homedir(), '.aem', 'da-token.json');
    const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!saved.access_token) throw new Error(`No access_token in ${file}`);
    const claims = JSON.parse(Buffer.from(saved.access_token.split('.')[1], 'base64url'));
    const expires = Number(claims.created_at) + Number(claims.expires_in);
    if (expires < Date.now() + 60000) throw new Error(`The DA token in ${file} has expired: ask the operator to log in again`);
    token = saved.access_token;
  }
  return { Authorization: `Bearer ${token}` };
}

function inFolder(p) {
  if (!p.startsWith('/') || p.split('/').includes('..')) throw new Error(`path must start with / and stay in ${FOLDER}: ${p}`);
  return p;
}

function limiter(max) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= max || !queue.length) return;
    active += 1;
    const { fn, resolve, reject } = queue.shift();
    fn().then(resolve, reject).finally(() => { active -= 1; next(); });
  };
  return (fn) => new Promise((resolve, reject) => { queue.push({ fn, resolve, reject }); next(); });
}
const admin = limiter(4);
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });

/** fetch that retries 429, 5xx and network errors with exponential backoff. */
export async function request(url, init = {}) {
  for (let attempt = 1; ; attempt += 1) {
    let res;
    let failure;
    try {
      res = await fetch(url, init);
    } catch (e) {
      failure = e.message;
    }
    if (res && res.status !== 429 && res.status < 500) return res;
    const reason = failure || `HTTP ${res.status}`;
    if (attempt === MAX_TRIES) throw new Error(`${init.method || 'GET'} ${url}: ${reason}`);
    const wait = Number(res?.headers.get('retry-after')) * 1000 || 1000 * 2 ** attempt;
    console.warn(`retry ${attempt} in ${wait} ms: ${url} (${reason})`);
    await sleep(wait);
  }
}

async function expectOk(res, what) {
  if (!res.ok) throw new Error(`${what}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res;
}

/** Uploads a body into the DA folder; daPath includes the extension. */
export function upload(daPath, body, type = TYPES[path.extname(daPath)]) {
  if (!type) throw new Error(`unknown content type for ${daPath}`);
  return admin(async () => {
    const form = new FormData();
    form.append('data', new Blob([body], { type }), path.basename(daPath));
    const init = { method: 'POST', headers: auth(), body: form };
    await expectOk(await request(DA_SOURCE + inFolder(daPath), init), `upload ${daPath}`);
  });
}

/** Previews a web path of the DA folder (no .html extension; a folder index is <folder>/index). */
export function preview(webPath) {
  return admin(async () => {
    const init = { method: 'POST', headers: auth() };
    await expectOk(await request(PREVIEW_API + inFolder(webPath), init), `preview ${webPath}`);
  });
}

/** Removes a document from preview and from DA; daPath includes the extension. */
export function remove(daPath) {
  return admin(async () => {
    const init = { method: 'DELETE', headers: auth() };
    const webPath = inFolder(daPath).replace(/\.html$/, '');
    const unpreviewed = await request(PREVIEW_API + webPath, init);
    if (!unpreviewed.ok && unpreviewed.status !== 404) await expectOk(unpreviewed, `unpreview ${webPath}`);
    await expectOk(await request(DA_SOURCE + daPath, init), `delete ${daPath}`);
  });
}

if (import.meta.filename === process.argv[1]) {
  const [command, a, b] = process.argv.slice(2);
  if (command === 'put' && a && b) await upload(b, fs.readFileSync(a));
  else if (command === 'preview' && a) await preview(a);
  else if (command === 'rm' && a) await remove(a);
  else throw new Error('usage: node da.mjs put <file> <da path> | preview <web path> | rm <da path>');
  console.log(`${command} ok: ${b || a}`);
}
