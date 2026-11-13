#!/usr/bin/env node
// Run your own Playwright code in a browser session, safely:
//   node pw.mjs <session> <file.js> [timeoutSeconds]     file: async (page, { still, shot }) => value
//   node pw.mjs <session> open | close
// Every *.synopsys.com request is served from the local cache (fetched once when missing), trackers are blocked, rotations
// are held still, and a hung call is killed instead of wedging the session. Prints the value.
import { readFileSync } from 'node:fs';
import { close, open, run } from './lib/page.mjs';

const [session, what, timeout] = process.argv.slice(2);
if (!session || !what) throw new Error('usage: node pw.mjs <session> <file.js>|open|close [timeoutSeconds]');
if (what === 'open') open(session);
else if (what === 'close') close(session);
else {
  process.on('uncaughtException', (e) => { console.error(`pw.mjs: ${e.message}`); process.exit(1); });
  const value = run(session, readFileSync(what, 'utf8').trim().replace(/;$/, ''), { timeout: Number(timeout) || 180 });
  console.log(typeof value === 'string' ? value : JSON.stringify(value, null, 1));
}
