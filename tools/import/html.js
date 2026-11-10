// Builders for the HTML that DA stores: sections, blocks, links and images.
export const SOURCE = 'https://wknd.site';

const PAGE_PATH = /^\/[a-z]{2}\/[a-z]{2}(\/[^.]*)?(\.html)?$/;

export function block(name, rows) {
  const cells = (row) => row.map((cell) => `<div>${cell}</div>`).join('');
  return `<div class="${name}">${rows.map((row) => `<div>${cells(row)}</div>`).join('')}</div>`;
}

export function section(parts, style) {
  const meta = style ? block('section-metadata', [['Style', style]]) : '';
  return `<div>${parts.join('')}${meta}</div>`;
}

export function pageHtml(sections) {
  return `<body><header></header><main>${sections.join('')}</main><footer></footer></body>\n`;
}

export function absUrl(src) {
  return new URL(src, SOURCE).href;
}

export function rewriteLink(href, prefix) {
  if (/^(#|mailto:|tel:)/.test(href)) return href;
  const url = new URL(href, SOURCE);
  if (url.origin !== SOURCE) return href;
  if (!PAGE_PATH.test(url.pathname)) return url.href;
  return `${prefix}${url.pathname.replace(/\.html$/, '')}${url.hash}`;
}

/** Largest rendition the source offers, so crops made in AEM are kept. */
export function imageSrc(img) {
  const holder = img.closest('[data-cmp-src]');
  const widths = (holder?.getAttribute('data-cmp-widths') || '').split(',').map(Number);
  const largest = Math.max(0, ...widths);
  const src = largest
    ? holder.getAttribute('data-cmp-src').replace('{.width}', `.${largest}`)
    : img.getAttribute('src');
  return absUrl(src);
}

export function picture(img) {
  if (!img) return '';
  const alt = (img.getAttribute('alt') || '').replace(/"/g, '&quot;');
  return `<picture><img src="${imageSrc(img)}" alt="${alt}"></picture>`;
}
