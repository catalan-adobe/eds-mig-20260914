// Authors the DA documents (index, nav, footer) for the first page from the gated prototype's
// content. Usage: node stardust/deploy/build-content.mjs <out-dir> <da-media-base> <doc-prefix>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { load } from 'cheerio';

const [outDir, mediaBase, prefix] = process.argv.slice(2);
const $ = load(readFileSync('stardust/prototypes/index-proposed.html', 'utf8'));
$.prototype.etext = function etext() { return this.text().replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
const media = (src) => `${mediaBase}/${src.split('/').pop()}`;
const img = (node) => `<picture><img src="${media($(node).attr('src'))}" alt="${$(node).attr('alt') || ''}"></picture>`;
const text = (node) => $(node).html().trim();
const block = (name, rows) => `<div class="${name}">${rows.map((cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`).join('')}</div>`;
const meta = (style) => block('section-metadata', [['style', style]]);
const doc = (sections) => `<body><header></header><main>${sections.map((s) => `<div>${s}</div>`).join('')}</main><footer></footer></body>\n`;

function postRows(scope) {
  return $(scope).find('article.post-card').map((_, a) => {
    const link = $(a).children('a');
    return [[img(link.find('img')), `<h3><a href="${link.attr('href')}">${text(link.find('h3'))}</a></h3>`]];
  }).get();
}

// ---------- index ----------
const hero = $('section.hero');
const quote = hero.find('.hero-content .quote-card');
const lead = $('article.post-card-lead');
const sections = [];
sections.push(block('hero', [
  [`<h2>${text(hero.find('.hero-eyebrow'))}</h2><h1>${text(hero.find('h1'))}</h1>`],
  [img(quote.find('img')), `<p>${text(quote.find('p'))}</p><p>${text(quote.find('cite'))}</p>`],
  [`<p>${hero.find('input').attr('placeholder')}</p><p>${text(hero.find('form button'))}</p><p>${text(hero.find('.form-tooltip-inner'))}</p>`],
]));
sections.push(block('posts featured', [
  [img(lead.find('> a img')), `<h3><a href="${lead.children('a').attr('href')}">${text(lead.find('h3'))}</a></h3><p>${text(lead.find('> a > div'))}</p>`,
    `${img(lead.find('> div img'))}<p>${text(lead.find('> div p'))}</p>`],
  ...postRows($('section.is-featured .post-col').eq(1)),
]));
const head = (sel) => `<h2>${text($(sel).find('h2').first())}</h2><p>${text($(sel).find('h2').first().next('p'))}</p>`;
sections.push(head('section.is-picks') + block('posts', postRows('section.is-picks')));
sections.push(`<p>${img($('section.wave img'))}</p>${meta('wave')}`);
sections.push(head('section.tools-intro') + meta('tools-intro'));
const kw = $('section.keyword');
sections.push(block('keyword-search', [
  [`<h2>${text(kw.find('h2'))}</h2><p>${text(kw.find('.keyword-head p'))}</p>`],
  [`<p>${kw.find('input').attr('placeholder')}</p>`],
  [`<p>by</p><p><picture><img src="${mediaBase}/semrush-logo.svg" alt="Semrush"></picture></p>`],
]));
sections.push(block('tool-cards', $('.tool-card').map((_, a) => [[img($(a).find('img')),
  `<h3><a href="${$(a).attr('href')}">${text($(a).find('h3'))}</a></h3><p>${text($(a).find('p'))}</p>`]]).get())
  + `<p><a href="${$('.tools-more a').attr('href')}">${text($('.tools-more a'))}</a></p>`);
sections.push(head('section.is-latest') + block('posts', postRows('section.is-latest')) + meta('latest'));
sections.push(`<h2>${text($('section.hubs > .container > h2'))}</h2>${block('hubs', $('section.hub').map((_, h) => {
  const tile = $(h).find('.hub-tile');
  const bg = tile.attr('style').match(/url\(([^)]+)\)/)[1];
  const items = $(h).find('.hub-resources li').map((__, li) => `<li><a href="${$(li).find('a').attr('href')}">${text($(li).find('a'))}</a></li>`).get().join('');
  return [[`<p><a href="${tile.find('a').attr('href')}">${text(tile.find('span'))}</a></p><p><picture><img src="${media(bg)}" alt=""></picture></p>`,
    `<p>${text($(h).find('.hub-summary .hub-label'))}</p><p>${text($(h).find('.hub-summary p'))}</p>`,
    `<p>${text($(h).find('.hub-resources .hub-label'))}</p><ul>${items}</ul><p><a href="${$(h).find('.hub-start').attr('href')}">${text($(h).find('.hub-start'))}</a></p>`]];
}).get())}`);
sections[sections.length - 1] += block('metadata', [
  ['Title', $("title").etext()],
  ['Description', $('meta[name=description]').attr('content')],
  ['nav', `${prefix}/nav`],
  ['footer', `${prefix}/footer`],
]);

// ---------- nav ----------
const linkItem = (li) => {
  const a = $(li).children('a');
  const note = $(li).children('span');
  return `<li><a href="${a.attr('href')}">${a.etext()}</a>${note.length ? ` ${note.etext()}` : ''}</li>`;
};
const navItems = $('.header-nav > ul > li').map((_, li) => {
  if (!$(li).hasClass('mega')) return linkItem(li);
  const cats = $(li).find('.mega-cats button').map((i, b) => {
    const list = $(li).find('.mega-lists > ul').eq(i).children('li').map((__, l) => linkItem(l)).get().join('');
    return `<li>${$(b).etext()}<ul>${list}</ul></li>`;
  }).get().join('');
  return `<li>${$(li).children('button').etext()}<ul>${cats}</ul></li>`;
}).get().join('');
const notice = $('.mega-notice').first();
const sem = $('.semrush-card');
const mob = $('.m-cta');
const nav = [
  `<p>${$('.topbar-inner p').etext()}</p><p><a href="${$('.topbar-inner a').attr('href')}">${$('.topbar-inner a').etext()}</a></p>`,
  '<p><a href="/"><span class="icon icon-backlinko-logo"></span></a></p>',
  `<ul>${navItems}</ul><p>${notice.find('p').html()}</p><p>${notice.find('button').etext()}</p>`,
  `<p>${$('.search-form input').attr('placeholder')}</p><p>${$('.header-cta > button').etext()}</p>`
    + `<h3><em>Semrush</em> ${sem.find('h3 > span').last().etext()}</h3><ul>${sem.find('ul li').map((_, l) => `<li>${$(l).etext()}</li>`).get().join('')}</ul>`
    + `<h3>${sem.find('footer h3').etext()}</h3><p>${sem.find('footer p').html()}</p>`,
  `<p><a href="${mob.find('a').attr('href')}">${mob.find('a').etext()}</a></p><p>${mob.find('button').etext()}</p><p>${mob.find('p').html()}</p>`,
];

// ---------- footer ----------
const f = $('footer.site-footer');
const col = (c) => `<h4>${$(c).find('h4').etext()}</h4><ul>${$(c).find('li').map((_, l) => `<li><a href="${$(l).find('a').attr('href')}">${$(l).etext()}</a></li>`).get().join('')}</ul>`;
const footer = [
  `<p><a href="/"><span class="icon icon-backlinko-logo"></span></a></p><p>${f.find('.footer-about p').etext()}</p>`,
  ...f.find('.footer-links-col').map((_, c) => col(c)).get(),
  `<h4>Connect</h4><ul>${f.find('.footer-social li').map((_, l) => {
    const name = $(l).find('a').attr('title');
    return `<li><a href="${$(l).find('a').attr('href')}"><span class="icon icon-${name.toLowerCase()}"></span>${name}</a></li>`;
  }).get().join('')}</ul>`,
  `<ul>${f.find('.footer-legal li').map((_, l) => `<li><a href="${$(l).find('a').attr('href')}">${$(l).etext()}</a></li>`).get().join('')}</ul><p>${f.find('.footer-copy').etext()}</p>`,
];

mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/index.html`, doc(sections));
writeFileSync(`${outDir}/nav.html`, doc(nav));
writeFileSync(`${outDir}/footer.html`, doc(footer));
console.log(`wrote ${outDir}/{index,nav,footer}.html — ${sections.length} sections`);
