// The media helper: every source image is read once, uploaded into DA once under /media with
// a name made of its file name and content hash, and referenced by its content.da.live URL.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { upload } from '../../tools/da.mjs';
import { getSource } from '../../tools/source.mjs';
import {
  M, MEDIA_BASE, MEDIA_FOLDER, SOURCE_ORIGIN,
} from './config.mjs';
import { readJson, updateJson } from './store.mjs';

export const MANIFEST = join(M, 'source', 'media-manifest.json');
const SVG_LIMIT = 40000;
const RASTER_WIDTH = 2000;
const EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};
const sha1 = (data) => createHash('sha1').update(data).digest('hex');

/** The content type of image bytes, from their first bytes; '' when they are no image. */
export function sniff(body) {
  const head = body.subarray(0, 12).toString('latin1');
  if (head.startsWith('\x89PNG')) return 'image/png';
  if (head.startsWith('\xff\xd8')) return 'image/jpeg';
  if (head.startsWith('GIF8')) return 'image/gif';
  if (head.startsWith('RIFF') && head.slice(8) === 'WEBP') return 'image/webp';
  return /<svg[\s>]/.test(body.subarray(0, 2000).toString('utf8')) ? 'image/svg+xml' : '';
}

/** The largest candidate of a srcset with width descriptors, else undefined. */
function largest(srcset = '') {
  // a candidate is a URL, a space and its width; the URL itself may hold commas
  return [...srcset.matchAll(/(\S+)\s+(\d+)w\s*(?:,|$)/g)]
    .sort((a, b) => Number(b[2]) - Number(a[2]))[0]?.[1];
}

/** The absolute URL of the rendition to copy for an <img> node or a URL; '' when none. */
export function pickSource(source, pagePath = '/') {
  let src = source;
  if (typeof source !== 'string') {
    const a = source.attribs;
    src = largest(a.srcset) ?? a.src ?? a['data-src'] ?? a['data-lazy'] ?? '';
  }
  if (!src || src.startsWith('data:')) return '';
  try {
    return new URL(src.trim(), SOURCE_ORIGIN + pagePath).href;
  } catch {
    return '';
  }
}

/** The asset behind a rendition URL: equal for every rendition of one image. */
export function assetKey(url) {
  const { hostname, pathname } = new URL(url);
  return hostname + pathname.replace(/\.img[ow](\.\d+)*\.\w+$/, '');
}

/** A file name stem from the URL: the asset's own name, lower case. */
function stemOf(url) {
  const last = decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() ?? '');
  const stem = last.replace(/\.img[ow](\.\d+)*\.\w+$/, '').replace(/\.\w{2,5}$/, '');
  const name = stem.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // no hyphen at the cut: with the hash's it would be two, which the web path folds into one
  return name.slice(0, 60).replace(/-$/, '') || 'image';
}

async function download(url) {
  let target = url;
  for (let hop = 0; hop < 4; hop += 1) {
    const source = /(^|\.)synopsys\.com$/.test(new URL(target).hostname);
    // eslint-disable-next-line no-await-in-loop
    const res = source ? await getSource(target) : await fetch(target).then(async (r) => ({
      status: r.status, body: Buffer.from(await r.arrayBuffer()),
    }));
    if (![301, 302, 307, 308].includes(res.status) || !res.location) return res;
    target = new URL(res.location, target).href;
  }
  return { status: 310, body: Buffer.alloc(0) };
}

/** An SVG over the 40 KB limit of the preview service, as a PNG. */
function rasterize(svg) {
  const width = svg.subarray(0, 2000).toString('utf8').match(/<svg[^>]*\swidth="(\d+)(px)?"/)?.[1];
  return execFileSync('rsvg-convert', ['-w', width ?? String(RASTER_WIDTH), '-f', 'png'], {
    input: svg, maxBuffer: 64 * 1024 * 1024,
  });
}

/**
 * @param {object} options { dry: no download and no upload, known images only;
 *   noUpload: download and name, do not upload }
 */
export function createMedia({ dry = false, noUpload = false } = {}) {
  const manifest = readJson(MANIFEST);
  const fresh = {};
  const running = new Map();
  const seen = new Map();
  const uploaded = new Set(Object.values(manifest).filter((e) => e.uploaded).map((e) => e.name));

  function save() {
    if (!Object.keys(fresh).length) return;
    updateJson(MANIFEST, (data) => Object.assign(data, fresh));
    Object.keys(fresh).forEach((k) => delete fresh[k]);
  }

  async function copy(url) {
    const { status, body } = await download(url);
    let type = status === 200 ? sniff(body) : '';
    if (!type) return { error: `${status}, ${body.length} bytes, no image` };
    let bytes = body;
    const entry = {};
    if (type === 'image/svg+xml' && body.length > SVG_LIMIT) {
      bytes = rasterize(body);
      type = 'image/png';
      entry.note = `SVG of ${body.length} bytes, over ${SVG_LIMIT}: rasterized`;
    }
    entry.name = `${stemOf(url)}-${sha1(bytes).slice(0, 10)}.${EXT[type]}`;
    entry.bytes = bytes.length;
    if (!noUpload && !uploaded.has(entry.name)) {
      await upload(`${MEDIA_FOLDER}/${entry.name}`, bytes, type);
      uploaded.add(entry.name);
    }
    entry.uploaded = uploaded.has(entry.name);
    return entry;
  }

  /**
   * The DA image of a source URL: { url, note } or { error }. `pending` marks an image that a
   * dry run does not know yet.
   */
  async function resolve(url) {
    let entry = manifest[url];
    if (!seen.has(url)) seen.set(url, entry ? 'present' : 'copied');
    if (!entry || (!entry.error && !entry.uploaded && !dry && !noUpload)) {
      if (dry) return { url: `${MEDIA_BASE}unfetched-${sha1(url).slice(0, 12)}`, pending: true };
      if (!running.has(url)) running.set(url, copy(url));
      try {
        entry = await running.get(url);
      } catch (e) {
        // not the image's fault (network, DA, a missing tool): nothing is recorded
        if (/bot|FETCH-STOP/i.test(e.message)) {
          seen.delete(url);
          throw e;
        }
        seen.set(url, 'failed');
        return { error: e.message };
      }
      manifest[url] = entry;
      fresh[url] = entry;
      if (Object.keys(fresh).length >= 25) save();
    }
    if (entry.error) {
      seen.set(url, 'failed');
      return { error: entry.error };
    }
    return { url: MEDIA_BASE + entry.name, note: entry.note };
  }

  /** How many distinct images this run asked for: { copied, present, failed }. */
  function totals() {
    const counts = { copied: 0, present: 0, failed: 0 };
    seen.forEach((state) => { counts[state] += 1; });
    return counts;
  }

  return { resolve, save, totals };
}
