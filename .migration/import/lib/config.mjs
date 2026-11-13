// Paths and names every part of the importer shares.
import { join } from 'node:path';
import { FOLDER } from '../../tools/da.mjs';

export const M = join(import.meta.dirname, '..', '..');
export const IMPORT = join(M, 'import');
export const OUT = join(M, 'out');
export const PAGES = join(M, 'source', 'pages');
export const SOURCE_ORIGIN = 'https://www.synopsys.com';
export const SITE = FOLDER;
export const MEDIA_FOLDER = '/media';
const CONTENT = 'https://content.da.live/catalan-adobe/eds-mig-20260914';
export const MEDIA_BASE = `${CONTENT}${FOLDER}${MEDIA_FOLDER}/`;
export const LANGUAGES = ['ja-jp', 'zh-cn', 'zh-tw', 'ko-kr'];

/** The language of a source path: 'ja-jp', 'zh-cn', 'zh-tw', 'ko-kr', else 'en'. */
export function languageOf(path) {
  const first = path.split('/')[1]?.replace(/\.html$/, '');
  return LANGUAGES.includes(first) ? first : 'en';
}

/** The web path of a language's root: SITE for English, SITE + '/ja-jp' for Japanese. */
export const languageRoot = (lang) => SITE + (lang === 'en' ? '' : `/${lang}`);

/**
 * A path the preview service accepts: in every segment, runs of ASCII characters other than
 * letters, digits and hyphens become one hyphen (`locations_austin`, `-(miet)-and`). 33 pages
 * need it.
 */
export function webSafe(path) {
  return path.split('/').map((segment) => {
    const [, name, extension = ''] = segment.match(/^(.*?)(\.html)?$/);
    return name.replace(/[^A-Za-z0-9\u0080-\uffff%-]+/g, '-').replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      + extension;
  }).join('/');
}

/** Source path (/a/b.html, /) to the DA path under the folder (/a/b.html, /index.html). */
export const daPathOf = (path) => (path === '/' ? '/index.html' : webSafe(path));

/** DA path under the folder to the web path under the folder (/a/b, /index). */
export const webPathOf = (daPath) => daPath.replace(/\.html$/, '');
