/**
 * Finds the folder of the current locale, such as `/us/en`, with any prefix before it.
 * @param {string} pathname URL path
 * @returns {string|null} The locale root, or null when the path is outside any locale
 */
export function getLocaleRoot(pathname) {
  const match = pathname.match(/^(.*?\/[a-z]{2}\/[a-z]{2})(\/|$)/);
  return match ? match[1] : null;
}

/**
 * Lists the parent folders between the locale root and the page.
 * @param {string} pathname URL path
 * @returns {{href: string, label: string}[]} One entry per parent folder
 */
export function getBreadcrumb(pathname) {
  const root = getLocaleRoot(pathname);
  if (!root) return [];
  const parents = pathname.slice(root.length).split('/').filter(Boolean).slice(0, -1);
  return parents.map((segment, i) => ({
    href: `${root}/${parents.slice(0, i + 1).join('/')}`,
    label: segment.replace(/(^|-)([a-z])/g, (m, dash, c) => `${dash && ' '}${c.toUpperCase()}`),
  }));
}
