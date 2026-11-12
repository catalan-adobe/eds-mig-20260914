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

/** Source path (/a/b.html, /) to the DA path under the folder (/a/b.html, /index.html). */
export const daPathOf = (path) => (path === '/' ? '/index.html' : path);

/** DA path under the folder to the web path under the folder (/a/b, /index). */
export const webPathOf = (daPath) => daPath.replace(/\.html$/, '');
