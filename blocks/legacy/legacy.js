/*
 * Legacy block (transition scaffolding, removed once the page is fully migrated).
 * Renders a raw HTML slice of the original page inside a Shadow DOM so the original CSS
 * and the EDS CSS cannot affect each other.
 */
const LEGACY_CSS = '/plg/legacy/legacy.css';
let sheetPromise;

function legacySheet() {
  if (!sheetPromise) {
    sheetPromise = fetch(LEGACY_CSS).then(async (resp) => {
      if (!resp.ok) throw new Error(`legacy: failed to load ${LEGACY_CSS} (${resp.status})`);
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(await resp.text());
      return sheet;
    });
  }
  return sheetPromise;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? new URL(link.href).pathname : block.textContent.trim();
  const [resp, sheet] = await Promise.all([fetch(path), legacySheet()]);
  if (!resp.ok) throw new Error(`legacy: failed to load slice ${path} (${resp.status})`);
  const html = await resp.text();
  block.textContent = '';
  const root = block.attachShadow({ mode: 'open' });
  root.adoptedStyleSheets = [sheet];
  root.innerHTML = `<div class="legacy-body">${html}</div>`;
}
