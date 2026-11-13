// JSON files that several importer processes update at the same time (manifests, report).
import {
  existsSync, mkdirSync, readFileSync, renameSync, rmdirSync, statSync, writeFileSync,
} from 'node:fs';
import { dirname } from 'node:path';

const STALE_MS = 30000;
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

export function readJson(file, fallback = {}) {
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback;
}

function lock(dir) {
  for (;;) {
    try {
      mkdirSync(dir);
      return;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      // a process that died while it held the lock must not block the others for ever
      try {
        if (Date.now() - statSync(dir).mtimeMs > STALE_MS) rmdirSync(dir);
      } catch { /* another process removed it first */ }
      sleep(50);
    }
  }
}

/** Reads the file, lets `change(data)` edit it, writes it back. Safe across processes. */
export function updateJson(file, change) {
  mkdirSync(dirname(file), { recursive: true });
  const dir = `${file}.lock`;
  lock(dir);
  try {
    const data = readJson(file);
    change(data);
    const tmp = `${file}.${process.pid}.tmp`;
    writeFileSync(tmp, `${JSON.stringify(data, null, 1)}\n`);
    renameSync(tmp, file);
    return data;
  } finally {
    rmdirSync(dir);
  }
}
