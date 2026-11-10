// Drives playwright-cli to screenshot one page and list its elements.
import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import { extract } from './extract.js';

const run = promisify(execFile);
const VIEWPORT_HEIGHT = 900;
const STEP = 450;
const STEP_DELAY_MS = 100;
const SETTLE_MS = 800;
const COMMAND_TIMEOUT_MS = 120_000;

export const SOURCE = 'https://wknd.site';
export const CACHE = new URL('../../.compare/', import.meta.url).pathname;
const opened = new Set();

const FONTS_READY = 'async () => { await document.fonts.ready; return true; }';
const SCROLL = `async () => {
  const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
  const height = () => document.documentElement.scrollHeight;
  for (let y = 0; y < height(); y += ${STEP}) {
    window.scrollTo(0, y);
    await sleep(${STEP_DELAY_MS});
  }
  window.scrollTo(0, 0);
  await sleep(${SETTLE_MS});
  return true;
}`;

async function cli(session, ...args) {
  try {
    const { stdout } = await run('playwright-cli', [`-s=${session}`, ...args], {
      timeout: COMMAND_TIMEOUT_MS,
      maxBuffer: 64 * 1024 * 1024,
    });
    return stdout;
  } catch (e) {
    const detail = `${e.stdout ?? ''}${e.stderr ?? ''}`.trim().split('\n').slice(0, 6).join(' | ');
    throw new Error(`playwright-cli ${args[0]} failed in session ${session}: ${detail || e.message}`);
  }
}

async function evaluate(session, source) {
  const out = await cli(session, 'eval', source);
  const match = out.match(/### Result\n([\s\S]*?)\n### Ran Playwright code/);
  if (!match) throw new Error(`playwright-cli eval gave no result in session ${session}`);
  return JSON.parse(match[1]);
}

async function assertReachable(url) {
  let status;
  try {
    status = (await fetch(url, { redirect: 'manual' })).status;
  } catch (e) {
    throw new Error(`cannot reach ${url}: ${e.cause?.code ?? e.message}. Is the server running?`);
  }
  if (status !== 200) throw new Error(`${url} answered ${status}, expected 200`);
}

/** Screenshots `url` at `width` into `pngPath`. Returns the page height and its elements. */
export async function capture(url, width, pngPath, session) {
  await assertReachable(url);
  if (!opened.has(session)) {
    await cli(session, 'open', 'about:blank');
    opened.add(session);
  }
  await cli(session, 'resize', String(width), String(VIEWPORT_HEIGHT));
  await cli(session, 'goto', url);
  await evaluate(session, FONTS_READY);
  await evaluate(session, SCROLL);
  await evaluate(session, FONTS_READY);
  const page = await evaluate(session, extract.toString());
  await mkdir(dirname(pngPath), { recursive: true });
  await cli(session, 'screenshot', `--filename=${pngPath}`, '--full-page');
  return page;
}

export async function closeSessions() {
  await Promise.all([...opened].map((session) => cli(session, 'close').catch(() => {})));
  opened.clear();
}

export const slug = (path) => path.slice(1).replaceAll('/', '_');

async function readCached(json) {
  try {
    return JSON.parse(await readFile(json, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

async function captureInto(side, url, width, path, session) {
  const base = join(CACHE, side, String(width), slug(path));
  const png = `${base}.png`;
  const page = await capture(url, width, png, session);
  await writeFile(`${base}.json`, JSON.stringify(page));
  return { png, ...page };
}

/** Captures the original (from cache when it exists) and the migrated page. */
export async function capturePair(path, width, { base, session, refreshSource = false }) {
  const sourceBase = join(CACHE, 'source', String(width), slug(path));
  const hit = refreshSource ? null : await readCached(`${sourceBase}.json`);
  const source = hit
    ? { png: `${sourceBase}.png`, ...hit }
    : await captureInto('source', `${SOURCE}${path}.html`, width, path, session);
  const migrated = await captureInto('migrated', `${base}/f52-1011-01${path}`, width, path, session);
  return { source, migrated };
}
