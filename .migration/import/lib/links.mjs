// Link rewriting: internal pages move under the site folder, everything else keeps its target.
import { SITE, SOURCE_ORIGIN, webSafe } from './config.mjs';

const INTERNAL = new Set(['www.synopsys.com', 'synopsys.com']);
const AEM_CONTENT = /^\/content\/synopsys\/([a-z]{2}-[a-z]{2})(?=[/.]|$)/;
const KEEP = /^(mailto:|tel:|sms:|#)/i;
const EMAIL_PROTECTION = /\/cdn-cgi\/l\/email-protection#([0-9a-f]+)$/i;
// the Coveo result page is not migrated (CONTRACT e, "Site search")
export const SEARCH_PAGE = /^(\/[a-z]{2}-[a-z]{2})?\/search\.html$/i;

// the Brightcove player of each account, as the source's player script chooses it
const PLAYERS = {
  5748441669001: 'rka4xWwYG', 6024607096001: 'k9ROJJb3q', 6261315296001: 'jj9Z5xaG4z',
};

/**
 * The link of a source video, from the attributes of its [data-video-id] element
 * (CONTRACT a): the Brightcove player page of the account, or the YouTube watch page.
 */
export function videoLink({
  'data-video-id': id, 'data-provider': provider, 'data-video-lang': account,
  'data-player-id': player = PLAYERS[account] ?? PLAYERS[5748441669001],
} = {}) {
  if (!id) return '';
  if (/youtube/i.test(provider ?? '')) return `https://www.youtube.com/watch?v=${id}`;
  return `https://players.brightcove.net/${account}/${player}_default/index.html?videoId=${id}`;
}

/** Decodes Cloudflare's email obfuscation (data-cfemail, or the hash of its link). */
export function decodeEmail(hex) {
  const bytes = hex.match(/../g).map((b) => parseInt(b, 16));
  // eslint-disable-next-line no-bitwise
  return bytes.slice(1).map((b) => String.fromCharCode(b ^ bytes[0])).join('');
}

/** /content/synopsys/ja-jp/a.html to /ja-jp/a.html; English has no language folder. */
function publicPath(pathname) {
  const path = pathname.replace(AEM_CONTENT, (_, lang) => (lang === 'en-us' ? '' : `/${lang}`));
  return path || '/';
}

/** True when the last path segment names a file that is not a page (.pdf, .zip, .php). */
const isFile = (pathname) => /\.[a-z0-9]{1,5}$/i.test(pathname) && !/\.html?$/i.test(pathname);

/**
 * Rewrites one href of the source page `pagePath`.
 * Internal page: SITE + path without .html. File on the source: absolute source URL.
 * External link, anchor, mailto: unchanged. Returns '' for a link that goes nowhere.
 */
export function rewriteLink(href, pagePath = '/') {
  const raw = (href ?? '').trim();
  if (!raw || /^javascript:/i.test(raw)) return '';
  const email = raw.match(EMAIL_PROTECTION);
  if (email) return `mailto:${decodeEmail(email[1])}`;
  if (KEEP.test(raw)) return raw;
  let url;
  try {
    url = new URL(raw, SOURCE_ORIGIN + pagePath);
  } catch {
    return raw;
  }
  if (!/^https?:$/.test(url.protocol) || !INTERNAL.has(url.hostname)) return raw;
  const pathname = publicPath(url.pathname);
  if (pathname.startsWith('/content/dam/') || isFile(pathname) || SEARCH_PAGE.test(pathname)) {
    return SOURCE_ORIGIN + pathname + url.search + url.hash;
  }
  // the source has links to /a.html.html: AEM serves the page for them
  let path = pathname.replace(/(\.html?)+$/i, '').replace(/\/index$/, '/');
  let { search } = url;
  const category = path.match(/^(.*\/category)\.([^/.]+)$/);
  if (category) {
    [, path] = category;
    search = `?tag=${category[2]}${search ? `&${search.slice(1)}` : ''}`;
  }
  if (path.length > 1) path = path.replace(/\/$/, '');
  path = webSafe(path);
  // the home page is the folder itself, with its slash
  return SITE + (path || '/') + search + url.hash;
}
