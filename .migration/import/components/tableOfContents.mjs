// Table of contents: the bar under the hero (`toc bar`), or the titled list of the article rail.
import { escapeAttr, escapeHtml } from '../lib/clean.mjs';

// The source script replaces the server's English title by language.
const TITLES = { 'ja-jp': '目次', 'zh-cn': '目录', 'zh-tw': '目錄' };

export default function tableOfContents(el, ctx) {
  const { $ } = ctx;
  const box = $(el).find('.cmp-tableofcontents').first();
  const items = box.find('li a').toArray().map((a) => {
    const label = escapeHtml($(a).text().replace(/\s+/g, ' ').trim());
    const href = $(a).attr('data-href') ?? $(a).attr('href');
    return label && (href ? `<li><a href="${escapeAttr(href)}">${label}</a></li>` : `<li>${label}</li>`);
  }).filter(Boolean);
  const list = items.length ? `<ul>${items.join('')}</ul>` : '';

  if (box.hasClass('table-of-contents-product-layout')) {
    const button = ctx.clean(box.find('.cmp-productsolutions__button-link a').first(), { inline: true });
    const rows = [[list], ...(button ? [[button]] : [])];
    return list || button ? ctx.block('toc', ['bar'], rows) : undefined;
  }

  const heading = box.find('.cmp-tableofcontents__title').first();
  let title = escapeHtml(heading.text().trim());
  if (title && TITLES[ctx.page.lang]) {
    ctx.drop(heading, 'the source script replaces this title by language');
    title = TITLES[ctx.page.lang];
  }
  if (!list) {
    ctx.drop(heading, 'table of contents without items');
    return undefined;
  }
  return ctx.block('toc', [], [[`${title ? `<p>${title}</p>` : ''}${list}`]]);
}
