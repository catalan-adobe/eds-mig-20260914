// Runs code in a playwright-cli session with every *.synopsys.com request served from the local
// cache of the source site. A request missing from the cache is fetched from the site once,
// under a lock shared by every process, so the site sees one paced page load at a time.
import { execFileSync } from 'node:child_process';
import {
  existsSync, mkdirSync, rmdirSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const ROOT = join(import.meta.dirname, '..', '..');
export const SOURCE_ORIGIN = 'https://www.synopsys.com';
export const PREFIX = '/f52-synopsys-1211-02';
export const OFFLINE = 'http://127.0.0.1:3541';
export const ONLINE = 'http://127.0.0.1:3540';
export const STOP = join(ROOT, 'source', 'FETCH-STOP');
const LOCK = join(ROOT, 'source', '.online-lock');
const STALE_MS = 360000;
const TMP = join(tmpdir(), 'f52-synopsys');
export const PAUSE_MS = 2000;

/** Source path (/a/b.html, /) to the web path of its migrated twin. */
export const targetPath = (page) => PREFIX + page.replace(/\.html$/, '');
export const targetUrl = (base, page) => base + targetPath(page);

// Runs inside playwright-cli (no Node globals: no URL, no require). One route per session.
const SETUP = `async (page, gateway) => {
  const ctx = page.context();
  if (ctx.__f52) { ctx.__f52.gateway = gateway; return ctx.__f52; }
  const state = { gateway, blocked: [], missed: [] };
  ctx.__f52 = state;
  const TRACKERS = /smetrics\\.|\\/cdn-cgi\\/|adobedtm\\.com|cookielaw\\.org|onetrust\\.com|ahrefs\\.com|cloudflareinsights|crazyegg|demdex|omtrdc|munchkin|googletagmanager|doubleclick|adsrvr|go-mpulse|kickfire|leadspace|d41\\.co|newscred|facebook\\.(com|net)|bzr\\.|experience\\.adobe\\.net|metrics\\.brightcove/;
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const href = req.url();
    if (TRACKERS.test(href)) return route.abort();
    const m = href.match(/^(https?:\\/\\/([^/:]+))(\\/[^?#]*)?(\\?[^#]*)?/);
    if (!m || !/(^|\\.)synopsys\\.com$/.test(m[2]) || req.method() !== 'GET') return route.fallback();
    let query = m[4] || '';
    if (!/[?&]_origin=/.test(query)) query += (query ? '&' : '?') + '_origin=' + m[1];
    const gateway = state.gateway;
    const res = await route.fetch({ url: gateway + (m[3] || '/') + query }).catch(() => null);
    if (!res) return route.abort();
    if (res.status() === 504) { state.missed.push(gateway + ' ' + href); return route.abort(); }
    if (req.resourceType() === 'document' && [403, 429, 503].includes(res.status())) {
      state.blocked.push(res.status() + ' ' + href);
    }
    return route.fulfill({ response: res });
  });
  // rotations never start: a carousel or ticker shows its first item on every load, on both sites
  await ctx.addInitScript(() => {
    const { setInterval } = window;
    window.setInterval = (fn, delay, ...rest) => (Number(delay) >= 2000 ? 0 : setInterval(fn, delay, ...rest));
  });
  return state;
}`;

// The consent banner and the chat widgets are not migrated.
const HIDE_CSS = '#onetrust-consent-sdk,.onetrust-pc-dark-filter,#chat-bar,#floating-icon{display:none!important}';

const HELPERS = `{
  /** Loads url at width, held still (overlays hidden, lazy content loaded). Returns the HTTP status. */
  still: async (url, width, height = 900) => {
    await page.setViewportSize({ width, height });
    const response = await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.addStyleTag({ content: '${HIDE_CSS}' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => { setTimeout(r, 120); });
      }
      window.scrollTo(0, 0);
      await document.fonts.ready;
    });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(800);
    return response ? response.status() : 0;
  },
  /** Screenshot (full page, or the first match of selector) with the pointer out of the way. */
  shot: async (path, selector) => {
    const style = await page.addStyleTag({ content: '*{pointer-events:none!important}' });
    const opts = { path, animations: 'disabled' };
    if (selector) await page.locator(selector).first().screenshot(opts);
    else await page.screenshot({ ...opts, fullPage: true });
    await style.evaluate((el) => el.remove());
  },
}`;

const pw = (session, args, timeout) => execFileSync(
  'timeout',
  [String(timeout), 'playwright-cli', `-s=${session}`, ...args],
  { encoding: 'utf8', maxBuffer: 256e6 },
);

// Playwright's own Chromium, never the operator's Google Chrome: headless instances of the
// installed Chrome register as that app in macOS and keep the operator from starting theirs
export const open = (session) => pw(session, ['open', '--browser=chromium'], 60);
export const close = (session) => { try { pw(session, ['close'], 30); } catch { /* already closed */ } };

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function once(session, fn, gateway, timeout) {
  mkdirSync(TMP, { recursive: true });
  const file = join(TMP, `${session}-${process.pid}-${Date.now()}.js`);
  // the caller's error is returned, not thrown: a missed request must still be reported
  writeFileSync(file, `async (page) => {
    const state = await (${SETUP})(page, '${gateway}');
    const result = {};
    try {
      result.value = await (${fn})(page, ${HELPERS});
    } catch (e) {
      result.error = String(e.message || e).split('\\n').slice(0, 6).join('\\n');
    }
    // a late answer of an earlier pass through the other gateway is not a miss of this one
    const missed = state.missed.splice(0).filter((x) => x.startsWith('${gateway} ')).map((x) => x.split(' ')[1]);
    return { ...result, blocked: state.blocked.splice(0), missed };
  }`);
  let out;
  try {
    out = pw(session, ['--json', 'run-code', '--filename', file], timeout);
  } catch (e) {
    if (e.status === 124) {
      // a hung run-code wedges the session daemon: every later command would queue forever
      try { execFileSync('pkill', ['-f', `cliDaemon.js ${session}( |$)`]); } catch { /* gone */ }
      throw new Error(`timed out after ${timeout}s; session '${session}' was killed, open it again`);
    }
    throw new Error(`playwright-cli failed in session '${session}' (is it open?): ${e.stdout || e.message}`);
  }
  return JSON.parse(JSON.parse(out).result);
}

/**
 * Takes the lock that serializes every load of a source host; false while another process holds
 * it. A lock older than 6 minutes was left by a killed process and is taken over.
 */
export function tryLock(name = '') {
  const dir = LOCK + name;
  try {
    mkdirSync(dir);
    return true;
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
    try {
      if (Date.now() - statSync(dir).mtimeMs > STALE_MS) rmdirSync(dir);
    } catch { /* released meanwhile */ }
    return false;
  }
}
export const unlock = (name = '') => { try { rmdirSync(LOCK + name); } catch { /* taken over as stale */ } };

/** Runs `again` holding the source lock, then pauses. */
function serialized(again) {
  while (!tryLock()) sleep(1000);
  try {
    const result = again();
    sleep(PAUSE_MS);
    return result;
  } finally {
    unlock();
  }
}

/**
 * Runs `fn` (source of `async (page, { still, shot }) => value`) in the session and returns the
 * value. Source requests come from the cache; when some are missing, the same code runs once
 * more against the site (serialized and paced). Throws on a page error or a timeout. A sign of
 * bot protection writes source/FETCH-STOP: after it nothing loads the site again.
 */
export function run(session, fn, { timeout = 180 } = {}) {
  let result = once(session, fn, OFFLINE, timeout);
  if (result.missed.length && !existsSync(STOP)) {
    result = serialized(() => once(session, fn, ONLINE, timeout));
  }
  if (result.blocked.length) {
    writeFileSync(STOP, `${new Date().toISOString()}\n${result.blocked.join('\n')}\n`);
    throw new Error(`bot protection or throttling: ${result.blocked[0]}. Wrote ${STOP}; stop and report it.`);
  }
  if (result.error) throw new Error(result.error);
  if (result.missed.length) {
    const why = existsSync(STOP) ? `not fetched, because ${STOP} exists` : 'the fetch from the site timed out';
    console.error(`warning: ${result.missed.length} source request(s) missing (${why}): ${result.missed.slice(0, 3).join(' ')}`);
  }
  return result.value;
}
