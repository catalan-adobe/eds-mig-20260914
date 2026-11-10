/* eslint-env browser */
// Runs inside the page. Its source goes to `playwright-cli eval`, so it must stay self-contained.

/** Lists each visible element with its own text and each visible img, in page coordinates. */
export const extract = () => {
  const HIDDEN_PARENTS = 'svg, script, style, noscript, template';
  const round = (value) => Math.round(value);
  const boxOf = (el) => {
    const rect = el.getBoundingClientRect();
    return {
      x: round(rect.left + window.scrollX),
      y: round(rect.top + window.scrollY),
      w: round(rect.width),
      h: round(rect.height),
    };
  };
  const ownText = (el) => Array.from(el.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  const isVisible = (el) => {
    const { w, h } = boxOf(el);
    return w > 0 && h > 0 && el.checkVisibility({ checkVisibilityCSS: true });
  };

  const items = [];
  document.body.querySelectorAll('*').forEach((el) => {
    if (el.closest(HIDDEN_PARENTS) || !isVisible(el)) return;
    if (el.tagName === 'IMG') {
      items.push({ kind: 'img', text: el.getAttribute('alt') ?? '', ...boxOf(el) });
      return;
    }
    const text = ownText(el);
    if (text) items.push({ kind: 'text', text, ...boxOf(el) });
  });
  return { height: document.documentElement.scrollHeight, items };
};
