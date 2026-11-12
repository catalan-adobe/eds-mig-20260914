#!/usr/bin/env node
// Fetches the server HTML of every page in source/scan.json: one plain GET at a time, paced.
// Resumable (source/pages.jsonl). Stops at the first sign of bot protection (source/FETCH-STOP).
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const SRC = join(import.meta.dirname, '..', 'source');
const PAUSE_MS = Number(process.env.PAUSE_MS ?? 1200);
const UA = 'Mozilla/5.0 (compatible; eds-migration-fetch/1.0; one request at a time)';
const STOP = join(SRC, 'FETCH-STOP');
const INDEX = join(SRC, 'pages.jsonl');

export const fileFor = (url) => {
  const { pathname } = new URL(url);
  return join(SRC, 'pages', pathname.endsWith('/') ? `${pathname}index.html` : pathname);
};

const groupOf = (url) => new URL(url).pathname.split('/').slice(1, 3).join('/').replace(/[^/]+\.html$/, '*');

/** Round-robin over URL groups: any prefix of the list is a stratified sample of the site. */
function stratify(urls) {
  const groups = new Map();
  for (const u of urls) groups.set(groupOf(u), [...(groups.get(groupOf(u)) ?? []), u]);
  const lists = [...groups.values()].sort((a, b) => b.length - a.length);
  const out = [];
  for (let i = 0; out.length < urls.length; i += 1) for (const l of lists) if (l[i]) out.push(l[i]);
  return out;
}

const blocked = (status, body) => [403, 429, 503].includes(status)
  || /Just a moment\.\.\.|cf-chl-|Attention Required|Access Denied/i.test(body.slice(0, 4000));

async function main() {
  if (existsSync(STOP)) throw new Error(`${STOP} exists: a bot check stopped the last run. Read it before retrying.`);
  const scan = JSON.parse(readFileSync(join(SRC, 'scan.json'), 'utf8'));
  const done = new Set(existsSync(INDEX)
    ? readFileSync(INDEX, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l).url) : []);
  const todo = stratify(scan.urls.map((u) => u.url).filter((u) => !/\.pdf$/i.test(u))).filter((u) => !done.has(u));
  console.log(`${done.size} done, ${todo.length} to fetch, pause ${PAUSE_MS} ms`);
  for (const url of todo) {
    const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' }, redirect: 'manual' });
    const body = await res.text();
    if (blocked(res.status, body)) {
      writeFileSync(STOP, `${new Date().toISOString()} ${url} status ${res.status}\n${body.slice(0, 500)}\n`);
      throw new Error(`bot protection or throttling at ${url} (status ${res.status}); stopped`);
    }
    const rec = { url, status: res.status, bytes: body.length, location: res.headers.get('location') ?? undefined };
    if (res.status === 200) {
      rec.template = body.match(/<body[^>]*data-template="([^"]*)"/)?.[1];
      mkdirSync(dirname(fileFor(url)), { recursive: true });
      writeFileSync(fileFor(url), body);
    }
    appendFileSync(INDEX, `${JSON.stringify(rec)}\n`);
    await new Promise((r) => { setTimeout(r, PAUSE_MS + Math.random() * 400); });
  }
  console.log('FETCH DONE');
}

if (import.meta.filename === process.argv[1]) await main();
