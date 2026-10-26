/*
 * Legacy widget carrier (transition scaffolding, removed once the page is fully migrated).
 * The widget block has injected a raw HTML slice of the original page; this moves it into a
 * Shadow DOM so the original CSS and the EDS CSS cannot affect each other.
 */
const LEGACY_CSS = '/plg/legacy/legacy.css';
let sheetPromise;

function legacySheet() {
  if (!sheetPromise) {
    sheetPromise = fetch(LEGACY_CSS).then(async (resp) => {
      if (!resp.ok) throw new Error(`legacy widget: failed to load ${LEGACY_CSS} (${resp.status})`);
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(await resp.text());
      return sheet;
    });
  }
  return sheetPromise;
}

export default async function decorate(widget) {
  // the legacy block's class names, so its layout CSS and calibration.css match unchanged
  widget.classList.add('legacy');
  widget.parentElement?.classList.add('legacy-wrapper');
  widget.closest('.section')?.classList.add('legacy-container');
  if (!document.querySelector('link[data-plg-calibration]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/plg/legacy/calibration.css';
    link.dataset.plgCalibration = '';
    document.head.append(link);
  }
  const sheet = await legacySheet();
  const html = widget.innerHTML;
  widget.textContent = '';
  const root = widget.attachShadow({ mode: 'open' });
  root.adoptedStyleSheets = [sheet];
  root.innerHTML = html;
}
