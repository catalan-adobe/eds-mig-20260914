#!/usr/bin/env node
// One file of the source site (a page, an image, a script), from the local cache. When it is
// not cached yet it is fetched ONCE: one request at a time per host for all processes, with a
// pause (1 s on the site, 0.25 s on its image CDN). This is the only allowed way to download
// from *.synopsys.com outside a browser.
//   node source.mjs <url> [output file]        prints the status; without a file, the body
//   import { getSource } from './source.mjs'   => { status, type, body: Buffer }
import { existsSync, writeFileSync } from 'node:fs';
import {
  OFFLINE, ONLINE, PAUSE_MS, STOP, tryLock, unlock,
} from './lib/page.mjs';

const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });

function viaGateway(gateway, url) {
  const u = new URL(url);
  if (!/(^|\.)synopsys\.com$/.test(u.hostname)) throw new Error(`not a source URL: ${url}`);
  u.searchParams.set('_origin', u.origin);
  return fetch(`${gateway}${u.pathname}${u.search}`, { redirect: 'manual' });
}

/** Returns { status, type, location, body }. Throws when the source shows bot protection. */
export async function getSource(url) {
  let res = await viaGateway(OFFLINE, url);
  if (res.status === 504) {
    if (existsSync(STOP)) throw new Error(`${STOP} exists: the source answered with a bot check; nothing is fetched`);
    // the image CDN has its own queue, so a long image download does not hold up page loads
    const cdn = new URL(url).hostname === 'images.synopsys.com';
    const lock = cdn ? '-images' : '';
    while (!tryLock(lock)) await sleep(cdn ? 100 : 500);
    try {
      res = await viaGateway(ONLINE, url);
      await sleep(cdn ? 250 : PAUSE_MS / 2);
    } finally {
      unlock(lock);
    }
    if ([403, 429, 503].includes(res.status)) {
      writeFileSync(STOP, `${new Date().toISOString()}\n${res.status} ${url}\n`);
      throw new Error(`bot protection or throttling: ${res.status} ${url}. Wrote ${STOP}; stop and report it.`);
    }
  }
  return {
    status: res.status,
    type: res.headers.get('content-type'),
    location: res.headers.get('location'),
    body: Buffer.from(await res.arrayBuffer()),
  };
}

if (import.meta.filename === process.argv[1]) {
  const [url, file] = process.argv.slice(2);
  if (!url) throw new Error('usage: node source.mjs <url> [output file]');
  const { status, type, body } = await getSource(url);
  if (file) { writeFileSync(file, body); console.log(`${status} ${type} ${body.length} bytes -> ${file}`); } else process.stdout.write(body);
}
