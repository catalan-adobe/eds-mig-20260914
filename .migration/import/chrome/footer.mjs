#!/usr/bin/env node
// Builds the footer documents from the source's footer experience fragments, copies their
// images into DA, uploads the documents and previews them.
//   node footer.mjs            every footer document
//   node footer.mjs --dry      print the documents, upload nothing
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import { FOLDER, preview, upload } from '../../tools/da.mjs';
import { OFFLINE } from '../../tools/lib/page.mjs';

const PAGES = join(import.meta.dirname, '..', '..', 'source', 'pages');
const SOURCE = 'https://www.synopsys.com';
const MEDIA = `https://content.da.live/catalan-adobe/eds-mig-20260914${FOLDER}`;
const TYPES = {
  'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/svg+xml': 'svg',
};

// One source page per footer document: DA path without extension, under the folder.
const DOCUMENTS = {
  '/footer': '/index.html',
  '/footer-blog': '/blogs/chip-design.html',
  '/footer-landing': '/cloud/startup-program.html',
  '/ja-jp/footer': '/ja-jp.html',
  '/zh-cn/footer': '/zh-cn.html',
  '/zh-cn/footer-blog': '/zh-cn/blogs/chip-design.html',
  '/zh-tw/footer': '/zh-tw.html',
  '/ko-kr/footer': '/ko-kr.html',
};

const FOOTER = '.cmp-experiencefragment--footer, .cmp-experiencefragment--landing-page-footer';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const text = (el) => el.text().replace(/\s+/g, ' ').trim();

/** A source href as the document writes it: pages move into the folder, the rest stays. */
function link(href) {
  const url = new URL(href, SOURCE);
  const language = url.pathname.match(/^\/content\/synopsys\/([a-z-]+)\.html$/);
  if (language) return `${FOLDER}/${language[1] === 'en-us' ? '' : language[1]}`;
  const page = url.origin === SOURCE && /(\.html|\/)$/.test(url.pathname);
  if (!page) return url.href;
  return FOLDER + url.pathname.replace(/\.html$/, '') + url.search + url.hash;
}

const uploaded = new Map();

/**
 * Copies an image into DA and returns its DA URL: once per asset, in the rendition the source
 * page shows at 1440. It comes from the cache the browser filled. getSource() would miss it: it
 * rewrites `$responsive$` in the query, and gets a JPEG without transparency instead.
 */
function media(img, dry) {
  const candidates = (img.attr('srcset') || '').split(',')
    .map((c) => c.trim().split(/\s+/))
    .sort((a, b) => parseInt(b[1], 10) - parseInt(a[1], 10));
  const url = new URL(candidates[0][0] || img.attr('src'), SOURCE);
  const name = url.pathname.split('/').pop().replace(/\.\w+$/, '');
  if (!uploaded.has(name)) {
    uploaded.set(name, (async () => {
      const query = `${url.search}${url.search ? '&' : '?'}_origin=${url.origin}`;
      const res = await fetch(OFFLINE + url.pathname + query);
      const extension = TYPES[res.headers.get('content-type')?.split(';')[0]];
      if (!res.ok || !extension) {
        throw new Error(`image ${url.href}: HTTP ${res.status} from the source cache. `
          + 'Load a page with this footer once with tools/pw.mjs at 1440, then run again.');
      }
      const path = `/media/footer/${name}.${extension}`;
      if (!dry) await upload(path, Buffer.from(await res.arrayBuffer()));
      return MEDIA + path;
    })());
  }
  return uploaded.get(name);
}

const section = (style, content) => `<div>
${content.filter(Boolean).join('\n')}
<div class="section-metadata"><div><div>Style</div><div>${style}</div></div></div>
</div>`;

const anchor = (a, label = esc(text(a))) => {
  const title = a.attr('title')?.trim();
  const named = title && title !== text(a) ? ` title="${esc(title)}"` : '';
  return `<a href="${esc(link(a.attr('href')))}"${named}>${label}</a>`;
};

const list = ($, links, label) => {
  const items = links.filter((_, a) => $(a).attr('href')).get()
    .map((a) => `<li>${anchor($(a), label?.($(a)))}</li>`);
  return items.length ? `<ul>\n${items.join('\n')}\n</ul>` : '';
};

async function image(img, dry) {
  if (!img.length) return '';
  return `<p><img src="${await media(img, dry)}" alt="${esc(img.attr('alt') || '')}"></p>`;
}

/** The Font Awesome name of a social link's icon, as `:name:`. */
const icon = (a) => {
  const name = a.find('i').attr('class').split(/\s+/)
    .find((c) => c.startsWith('fa-') && !/^fa-(brands|solid|regular|light)$/.test(c));
  return `:${name.slice(3)}:`;
};

/** The footer document of a source page, as DA HTML. */
async function footerDocument($, dry = false) {
  const footer = $(FOOTER).first().find('footer.site-footer');
  if (!footer.length) throw new Error('no footer in the page');
  const home = footer.find('.logo-top').attr('href');
  const logo = await image(footer.find('.logo-top img'), dry);
  const columns = footer.find('.links-wrapper nav').get().map((nav) => {
    const title = text($(nav).find('h3'));
    // the source hides a column without a title
    return title ? `<h3>${esc(title)}</h3>\n${list($, $(nav).find('li a'))}` : '';
  });
  const languages = footer.find('.global-nav-link-select option').get()
    .map((o) => `<li><a href="${link($(o).attr('data-link'))}">${esc(text($(o)))}</a></li>`);
  const legal = footer.find('.copyright');
  const sections = [
    logo && section('brand', [
      logo,
      home && `<p><a href="${link(home)}">${link(home)}</a></p>`,
    ]),
    columns.some(Boolean) && section('links', columns),
    languages.length && section('languages', [
      `<ul>\n${languages.join('\n')}\n</ul>`,
      await image(footer.find('.cn-qrcode img'), dry),
    ]),
    section('social', [list($, footer.find('.social-icons-wrapper li a'), icon)]),
    section('legal', [`<p>${esc(text(legal.find('span')))}</p>`, list($, legal.find('a'))]),
  ];
  return `<body><header></header><main>
${sections.filter(Boolean).join('\n')}
</main><footer></footer></body>
`;
}

if (import.meta.filename === process.argv[1]) {
  const dry = process.argv.includes('--dry');
  await Promise.all(Object.entries(DOCUMENTS).map(async ([path, page]) => {
    const $ = load(readFileSync(join(PAGES, page), 'utf8'));
    const html = await footerDocument($, dry);
    if (dry) {
      console.log(`<!-- ${path} from ${page} -->\n${html}`);
      return;
    }
    await upload(`${path}.html`, html);
    await preview(path);
    console.log(`previewed ${FOLDER}${path} from ${page}`);
  }));
}
