#!/usr/bin/env node
// Builds the nav documents from the source's utility bar and top navigation fragment, copies
// their images into DA, uploads the documents and previews them.
//   node header.mjs            every nav document
//   node header.mjs --dry      print the documents, upload nothing
// The importer core takes two page metadata values from here: `nav` from navPath() and
// `breadcrumb` from breadcrumb().
import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import { FOLDER, preview, upload } from '../../tools/da.mjs';
import { OFFLINE } from '../../tools/lib/page.mjs';
import { getSource } from '../../tools/source.mjs';

const PAGES = join(import.meta.dirname, '..', '..', 'source', 'pages');
const ICONS = join(import.meta.dirname, '..', '..', '..', 'icons');
const SOURCE = 'https://www.synopsys.com';
const MEDIA = `https://content.da.live/catalan-adobe/eds-mig-20260914${FOLDER}`;
const TYPES = {
  'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/svg+xml': 'svg',
};
const MAX_SVG = 40000;

// One source page per nav document: DA path without extension, under the folder.
const DOCUMENTS = {
  '/nav': '/index.html',
  '/nav-landing': '/cloud/openlink.html',
  '/nav-utility': '/cloud/startup-program.html',
  '/ja-jp/nav': '/ja-jp.html',
  '/zh-cn/nav': '/zh-cn.html',
  '/zh-cn/nav-landing':
    '/zh-cn/designware-ip/interface-ip/secure-interfaces/secure-interfaces-portfolio.html',
  '/zh-tw/nav': '/zh-tw.html',
  '/ko-kr/nav': '/ko-kr.html',
};

// The source sets these two texts by script, from the page language (pagelibs, search module).
const SEARCH_TEXTS = {
  en: ['Search', 'Cancel'],
  'ja-jp': ['検索', 'キャンセル'],
  'zh-cn': ['搜索', '取消'],
  'zh-tw': ['搜尋', '取消'],
  'ko-kr': ['찾다', '취소'],
};

// The navigation of a page: the full one, or the logo band of the 3 landing pages. One page has
// neither, only the utility bar.
const TOPNAV = '.cmp-experiencefragment--topnav';
const LANDING = '.cmp-experiencefragment--landing-page-topnav';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const text = (el) => el.text().replace(/[\s\u200b]+/g, ' ').trim();
const root = (language) => `${FOLDER}${language === 'en' ? '/' : `/${language}`}`;

/**
 * The nav document a source page uses, as a web path, or null for its language's default.
 * @param {import('cheerio').CheerioAPI} $ the source page
 * @param {string} language 'en', 'ja-jp', 'zh-cn', 'zh-tw' or 'ko-kr'
 */
export function navPath($, language) {
  if ($(TOPNAV).length) return null;
  const name = $(LANDING).length ? 'nav-landing' : 'nav-utility';
  return `${FOLDER}${language === 'en' ? '' : `/${language}`}/${name}`;
}

/** A source href as the document writes it: pages move into the folder, the rest stays. */
function link(href) {
  const url = new URL(href, SOURCE);
  if (url.origin !== SOURCE) return href;
  if (!/(\.html|^\/?)$/.test(url.pathname)) return url.href;
  return FOLDER + url.pathname.replace(/\.html$/, '') + url.search + url.hash;
}

/**
 * The page metadata `breadcrumb`: the trail the source shows in the utility bar once the page
 * is scrolled, as `Label=/path; Label=/path; Current label`. Empty when the page has none.
 * @param {import('cheerio').CheerioAPI} $ the source page
 */
export function breadcrumb($) {
  return $('#utility-nav-bar nav.cmp-breadcrumb .cmp-breadcrumb__item').get().map((item) => {
    const href = $(item).find('a').attr('href');
    const label = text($(item)).replace(/[;=]/g, ' ');
    return href ? `${label}=${link(href)}` : label;
  }).join('; ');
}

const uploaded = new Map();

async function store(name, type, body, dry) {
  const extension = TYPES[type?.split(';')[0]];
  if (!extension) throw new Error(`image ${name}: unknown type ${type}`);
  if (extension === 'svg' && body.length > MAX_SVG) {
    throw new Error(`image ${name}: an SVG of ${body.length} bytes fails the preview`);
  }
  const path = `/media/nav/${name}.${extension}`;
  if (!dry) await upload(path, body);
  return MEDIA + path;
}

/**
 * Copies an image into DA and returns its DA URL, once per asset. A rendition of the image
 * server comes from the cache the browser filled, in the size the source page shows at 1440:
 * getSource() rewrites `$responsive$` in its query and gets another file.
 */
function media(img, dry) {
  const candidates = (img.attr('srcset') || '').split(',')
    .map((c) => c.trim().split(/\s+/))
    .sort((a, b) => parseInt(b[1], 10) - parseInt(a[1], 10));
  const url = new URL(candidates[0][0] || img.attr('src'), SOURCE);
  const name = url.pathname.split('/').pop().replace(/\.\w+$/, '');
  if (!uploaded.has(name)) {
    uploaded.set(name, (async () => {
      if (!url.search) {
        const { status, type, body } = await getSource(url.href);
        if (status !== 200) throw new Error(`image ${url.href}: HTTP ${status}`);
        return store(name, type, body, dry);
      }
      const res = await fetch(`${OFFLINE}${url.pathname}${url.search}&_origin=${url.origin}`);
      if (!res.ok) {
        throw new Error(`image ${url.href}: HTTP ${res.status} from the source cache. `
          + 'Load a page with this header once with tools/pw.mjs at 1440, then run again.');
      }
      const body = Buffer.from(await res.arrayBuffer());
      return store(name, res.headers.get('content-type'), body, dry);
    })());
  }
  return uploaded.get(name);
}

const BRIGHTCOVE = 'https://players.brightcove.net';

/** A source video as the contract writes it: its poster, then the link to the player. */
async function video(el, dry) {
  const account = el.attr('data-video-lang');
  const id = el.attr('data-video-id');
  const player = `${BRIGHTCOVE}/${account}/rka4xWwYG_default`;
  const name = `video-${id}`;
  if (!uploaded.has(name)) {
    uploaded.set(name, (async () => {
      const config = await (await fetch(`${player}/config.json`)).json();
      const api = `https://edge.api.brightcove.com/playback/v1/accounts/${account}/videos/${id}`;
      const accept = `application/json;pk=${config.video_cloud.policy_key}`;
      const info = await (await fetch(api, { headers: { Accept: accept } })).json();
      if (!info.poster) throw new Error(`video ${id}: no poster in the playback API answer`);
      const res = await fetch(info.poster);
      const body = Buffer.from(await res.arrayBuffer());
      return [await store(name, res.headers.get('content-type'), body, dry), info.name];
    })());
  }
  const [poster, title] = await uploaded.get(name);
  const href = `${player}/index.html?videoId=${id}`;
  const picture = `<p><img src="${poster}" alt="${esc(title || '')}"></p>`;
  return `${picture}\n<p><a href="${href}">${href}</a></p>`;
}

const section = (style, content) => `<div>
${content.filter(Boolean).join('\n')}
<div class="section-metadata"><div><div>Style</div><div>${style}</div></div></div>
</div>`;

const anchor = (a, label = esc(text(a))) => `<a href="${esc(link(a.attr('href')))}">${label}</a>`;

async function inlineImage(img, dry) {
  if (!img.length) return '';
  return `<img src="${await media(img, dry)}" alt="${esc(img.attr('alt') || '')}"> `;
}

/** One `navList`: its heading (text or link, with icon and subtitle) and its list of links. */
async function navList($, el, dry) {
  const header = el.children('.header-item');
  const subtitle = text(header.find('.nav-list-header-subtitle'));
  header.find('.nav-list-header-subtitle').remove();
  const label = esc(text(header));
  const out = [];
  if (label) {
    const icon = await inlineImage(header.find('img'), dry);
    out.push(`<h4>${icon}${header.is('a[href]') ? anchor(header, label) : label}</h4>`);
  }
  if (subtitle) out.push(`<p>${esc(subtitle)}</p>`);
  const items = await Promise.all(el.find('ul.nav-list > li').get().map(async (li) => {
    const a = $(li).children('a[href]');
    const title = esc(text($(li).find('.nav-item-title')));
    const note = esc(text($(li).find('.nav-item-subtitle')));
    const icon = await inlineImage($(li).find('img'), dry);
    return `<li>${icon}${a.length ? anchor(a, title) : title}${note ? ` ${note}` : ''}</li>`;
  }));
  if (items.length) out.push(`<ul>\n${items.join('\n')}\n</ul>`);
  return out.join('\n');
}

/** One `topNavAd`: image or video, then its linked title, text and call to action. */
async function navAd($, el, dry) {
  const a = el.children('a[href]');
  const player = el.find('.cmp-video[data-video-id]');
  const picture = el.find('.component-image img');
  return [
    player.length ? await video(player, dry) : '',
    picture.length ? `<p>${(await inlineImage(picture, dry)).trim()}</p>` : '',
    `<h4>${anchor(a, esc(text(a.find('.title'))))}</h4>`,
    ...a.find('.description p').get().map((p) => `<p>${esc(text($(p)))}</p>`),
    `<p>${anchor(a, esc(text(a.find('.cta'))))}</p>`,
  ].filter(Boolean).join('\n');
}

/** One column of a menu panel: its components in source order. */
async function column($, col, dry) {
  const parts = col.find('.component-nav-list, .component-topNavAd, a.cta-link, a.sub-nav-footer');
  const html = await Promise.all(parts.get().map((part) => {
    const el = $(part);
    if (el.is('.component-nav-list')) return navList($, el, dry);
    if (el.is('.component-topNavAd')) return navAd($, el, dry);
    return `<p>${anchor(el)}</p>`;
  }));
  return `<div>\n${html.join('\n')}\n</div>`;
}

/** The menus section: one `h3` per menu, then its panel as a `columns` block. */
async function menus($, nav, dry) {
  const items = nav.find('.main-nav > ul').first().children('li.has-dropdown').get();
  const html = await Promise.all(items.map(async (li) => {
    const panel = nav.find('#morph-dropdown-wrapper .dropdown').filter((_, d) => (
      $(d).attr('data-menu') === $(li).attr('data-menu')));
    const subnav = panel.find('.component-subnav');
    const cells = await Promise.all(subnav.find('.col').get().map((c) => column($, $(c), dry)));
    const variant = subnav.attr('data-total-columns');
    return `<h3>${esc(text($(li)))}</h3>
<div class="columns ${variant}">
<div>
${cells.join('\n')}
</div>
</div>`;
  }));
  return html;
}

/** The utility bar: the two brand links, the languages and the "Ask" button. */
function utility($, language) {
  const bar = $('#utility-nav-bar');
  const links = bar.find('.utility-logo-row > a').get().map((a) => `<p>${anchor($(a))}</p>`);
  const languages = bar.find('.dropdown-menu a[data-link]').get().map((a) => {
    const code = $(a).attr('data-link').match(/\/([a-z-]+)\.html$/)[1];
    return `<li><a href="${root(code === 'en-us' ? 'en' : code)}">${esc(text($(a)))}</a></li>`;
  });
  // the source's CSS hides the button on every language but English
  const ask = language === 'en' ? `<p>${esc(text(bar.find('#askSynopsys')))}</p>` : '';
  return section('utility', [
    ...links,
    `<h3>${esc(text(bar.find('.dropdown-menu .title')))}</h3>`,
    `<ul>\n${languages.join('\n')}\n</ul>`,
    ask,
  ]);
}

/** The tools: the call to action, and the promotion card of the mobile menu. */
async function tools($, nav, dry) {
  const cta = nav.find('.nav-items-right a.cta');
  const promo = nav.find('.utility-nav__promo-card-link').first();
  const words = promo.find('.utility-nav__promo-text p').html()?.replace(/\s+/g, ' ').trim()
    .replace(/<(\/?)b>/g, '<$1strong>');
  const content = [cta.length && `<p><strong>${anchor(cta)}</strong></p>`];
  if (promo.length) {
    content.push(
      `<p>${(await inlineImage(promo.find('img'), dry)).trim()}</p>`,
      `<p>${anchor(promo, esc(text(promo.find('.utility-nav__promo-link-text'))))}</p>`,
      `<p>${words}</p>`,
    );
  }
  return content.some(Boolean) ? section('tools', content) : '';
}

/** The search layer: its title, the field's texts, and the "popular content" tiles. */
async function search($, nav, language, dry) {
  const layer = nav.find('#coveo-search-wrapper');
  const rows = await Promise.all(layer.find('.component-mediaLinkTile').get().map(async (t) => {
    const a = $(t).children('a[href]');
    const picture = (await inlineImage(a.find('img'), dry)).trim();
    // a line break in the text is authored: it sets the width of the tile's text
    const lines = a.find('.subtitle').html().split(/<br\s*\/?>/)
      .map((line) => esc(text(load(line).root())));
    return `<div>
<div>${picture}</div>
<div><p>${anchor(a, esc(text(a.find('.title'))))}</p><p>${lines.join('<br>')}</p></div>
</div>`;
  }));
  return section('search', [
    `<h3>${esc(text(layer.find('.search-header h5')))}</h3>`,
    ...SEARCH_TEXTS[language].map((t) => `<p>${t}</p>`),
    rows.length && `<h3>${esc(text(layer.find('.popular-content-header')))}</h3>`,
    rows.length && `<div class="cards">\n${rows.join('\n')}\n</div>`,
  ]);
}

/**
 * The source draws its logo as inline SVG (zh-cn has its own). The document names the icon
 * file that holds the same drawing: the header block inlines it again.
 */
function logoIcon(svg) {
  const drawing = svg.find('path').last().attr('d');
  const file = globSync('synopsys-logo*.svg', { cwd: ICONS })
    .find((name) => readFileSync(join(ICONS, name), 'utf8').includes(drawing));
  if (!file) throw new Error('this logo is not in icons/: add it as synopsys-logo-<name>.svg');
  return `:${file.replace('.svg', '')}:`;
}

/** The nav document of a source page, as DA HTML. */
export async function navDocument($, language, dry = false) {
  const nav = $(`${TOPNAV} #topNav`).first();
  const landing = $(`${LANDING} .synopsys-logo`).first();
  const sections = [utility($, language)];
  if (landing.length) {
    // the source's stylesheet draws this logo: it is the icon of the same name
    const home = landing.closest('a[href]');
    const logo = ':synopsys-logo-landing:';
    sections.push(section('brand', [`<p>${home.length ? anchor(home, logo) : logo}</p>`]));
  }
  if (nav.length) {
    const home = link(nav.find('a.logo').attr('href'));
    sections.push(
      section('brand', [`<p><a href="${home}">${logoIcon(nav.find('a.logo svg'))}</a></p>`]),
      section('menus', await menus($, nav, dry)),
      await tools($, nav, dry),
      await search($, nav, language, dry),
    );
  }
  return `<body><header></header><main>
${sections.filter(Boolean).join('\n')}
</main><footer></footer></body>
`;
}

if (import.meta.filename === process.argv[1]) {
  const dry = process.argv.includes('--dry');
  const languages = Object.keys(SEARCH_TEXTS);
  const languageOf = (path) => languages.find((l) => path.startsWith(`/${l}`)) ?? 'en';
  await Promise.all(Object.entries(DOCUMENTS).map(async ([path, page]) => {
    const $ = load(readFileSync(join(PAGES, page), 'utf8'));
    const language = languageOf(page);
    const expected = path.endsWith('/nav') ? null : FOLDER + path;
    if (navPath($, language) !== expected) throw new Error(`${page} does not use the nav ${path}`);
    const html = await navDocument($, language, dry);
    if (dry) {
      console.log(`<!-- ${path} from ${page} -->\n${html}`);
      return;
    }
    await upload(`${path}.html`, html);
    await preview(path);
    console.log(`previewed ${FOLDER}${path} from ${page}`);
  }));
}
