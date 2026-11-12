// Where the site is mounted, and which language a path belongs to. Every internal URL that
// code builds (nav, footer, fragments, indexes, links) starts from these helpers.

// The content folder this migration lives in. Set to '' when the site moves to the root.
const MOUNT = '/f52-synopsys-1211-02';
const LANGUAGES = ['ja-jp', 'zh-cn', 'zh-tw', 'ko-kr'];
const here = () => window.location.pathname;

/** The path prefix of the site: the mount folder when the path is inside it, else ''. */
export function siteRoot(path = here()) {
  return path === MOUNT || path.startsWith(`${MOUNT}/`) ? MOUNT : '';
}

/** The language of a path: 'ja-jp', 'zh-cn', 'zh-tw', 'ko-kr', or 'en' for everything else. */
export function getLanguage(path = here()) {
  const [first] = path.slice(siteRoot(path).length + 1).split('/');
  return LANGUAGES.find((lang) => first === lang) ?? 'en';
}

/** The root of the path's language: siteRoot() for English, siteRoot() + '/ja-jp' for Japanese. */
export function languageRoot(path = here()) {
  const lang = getLanguage(path);
  return siteRoot(path) + (lang === 'en' ? '' : `/${lang}`);
}
