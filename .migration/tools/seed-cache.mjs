#!/usr/bin/env node
// Copies the fetched server HTML (source/pages) into the gateway's cache, so a browser load of
// a page does not fetch its HTML from the site a second time. Idempotent; run it any time.
import {
  cpSync, existsSync, mkdirSync, readFileSync, writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileFor } from './fetch-pages.mjs';

const SRC = join(import.meta.dirname, '..', 'source');
const CACHE = join(SRC, 'cache', 'www.synopsys.com_15600fa6');
const META = JSON.stringify({ headers: { 'content-type': 'text/html;charset=utf-8' }, status: 200 });

let seeded = 0;
for (const line of readFileSync(join(SRC, 'pages.jsonl'), 'utf8').split('\n').filter(Boolean)) {
  const { url, status } = JSON.parse(line);
  const { pathname } = new URL(url);
  const target = join(CACHE, pathname === '/' ? '{index}.html' : pathname);
  if (status === 200 && !existsSync(target)) {
    mkdirSync(dirname(target), { recursive: true });
    cpSync(fileFor(url), target);
    writeFileSync(`${target}{meta}.json`, META);
    seeded += 1;
  }
}
console.log(`seeded ${seeded} pages into the cache`);
