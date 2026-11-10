// Network access: source downloads, DA uploads, preview. Admin calls run 4 at a time.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FOLDER } from './convert.mjs';

const ORG = 'catalan-adobe';
const REPO = 'eds-mig-20260914';
const DA_SOURCE = `https://admin.da.live/source/${ORG}/${REPO}${FOLDER}`;
const PREVIEW_API = `https://admin.hlx.page/preview/${ORG}/${REPO}/main${FOLDER}`;
export const CONTENT = `https://content.da.live/${ORG}/${REPO}${FOLDER}`;
export const PREVIEW = `https://main--${REPO}--${ORG}.aem.page${FOLDER}`;
const MAX_TRIES = 6;

let token;
function auth() {
  if (!token) {
    const file = path.join(os.homedir(), '.aem', 'da-token.json');
    token = JSON.parse(fs.readFileSync(file, 'utf8')).access_token;
    if (!token) throw new Error(`No access_token in ${file}`);
  }
  return { Authorization: `Bearer ${token}` };
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

/** Uploads a file into the DA folder; daPath includes the extension. */
export function upload(daPath, body, type) {
  return admin(async () => {
    const form = new FormData();
    form.append('data', new Blob([body], { type }), path.basename(daPath));
    const init = { method: 'POST', headers: auth(), body: form };
    await expectOk(await request(DA_SOURCE + daPath, init), `upload ${daPath}`);
  });
}

/** Previews a web path of the DA folder (no .html extension). */
export function preview(webPath) {
  return admin(async () => {
    const init = { method: 'POST', headers: auth() };
    await expectOk(await request(PREVIEW_API + webPath, init), `preview ${webPath}`);
  });
}
