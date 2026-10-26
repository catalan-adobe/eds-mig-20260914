// Re-authors the captured backlinko header as clean markup (content + glyphs verbatim,
// structure and classes ours). Usage: node build-header.mjs <captured page.html> > header.html
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';

const $ = load(readFileSync(process.argv[2], 'utf8'));
const hdr = $('header.headroom-wrapper').first();
const svg = (el) => $.html($(el).find('svg').first());
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const txt = (el) => esc($(el).text());

function listItems(ul, indent) {
  return $(ul).children('li').map((_, li) => {
    const a = $(li).children('a').first();
    const href = a.attr('href');
    const inner = a.children('span').length ? `<span>${txt(a.children('span'))}</span>` : txt(a);
    const note = $(li).children('span').first();
    const noteHtml = note.length ? `<span>${txt(note)}</span>` : '';
    return `${indent}<li><a href="${href}">${inner}</a>${noteHtml}</li>`;
  }).get().join('\n');
}

function megaPanel(li) {
  const label = txt($(li).children('button'));
  const inner = $(li).find('> div > div > div').first();
  const [cats, lists] = inner.children('div').toArray();
  const catItems = $(cats).find('li > button').map((i, b) =>
    `            <li><button type="button"${i === 0 ? ' class="active"' : ''}>${txt(b)}${svg(b)}</button></li>`).get().join('\n');
  const uls = $(lists).children('ul').map((i, ul) =>
    `          <ul${i === 0 ? ' class="active"' : ''}>\n${listItems(ul, '            ')}\n          </ul>`).get().join('\n');
  const notice = $(lists).find('.notice');
  const noticeHtml = notice.length ? `
          <div class="mega-notice" role="region" aria-label="Notification"><p><strong>${txt(notice.find('strong'))}</strong>${esc(notice.find('strong').parent().contents().filter((_, n) => n.type === 'text').text())}</p><button type="button">${txt(notice.find('button'))}</button></div>` : '';
  return `            <li class="mega"><button type="button">${label}</button>
      <div class="mega-panel"><div class="mega-scroll"><div class="mega-inner">
        <div class="mega-cats"><span>${label}</span>
          <ul>
${catItems}
          </ul>
        </div>
        <div class="mega-lists">
          <button class="mega-close" type="button">${svg($(lists).children('button'))}</button>
${uls}${noticeHtml}
        </div>
      </div></div></div>
            </li>`;
}

const navLis = hdr.find('nav').first().children('ul').children('li');
const nav = navLis.map((_, li) => ($(li).hasClass('mega') ? megaPanel(li)
  : `            <li><a href="${$(li).children('a').attr('href')}">${txt($(li).children('a'))}</a></li>`)).get().join('\n');

const search = hdr.find('.header-popup').first();
const searchBtn = search.parent().children('button').first();
const semrush = hdr.find('.header-popup').eq(1);
const semInner = semrush.find('> div > div').first();
const semLis = semInner.find('ul li').map((_, li) => `              <li>${svg(li)}<span>${txt($(li).find('span'))}</span></li>`).get().join('\n');
const semFooter = semInner.find('footer');
const semP = semFooter.find('p');
const semA = semP.find('a');

const mob = hdr.find('#header-m-drop');
const mobLis = mob.find('nav').first().children('ul').children('li').map((_, li) => {
  if (!$(li).hasClass('has-children')) {
    const a = $(li).children('a');
    return `          <li><a href="${a.attr('href')}">${txt(a)}${svg(a)}</a></li>`;
  }
  const b = $(li).children('button');
  const sub = $(li).find('.sub');
  const head = sub.find('.sub-scroll > div > div').first();
  const back = head.find('button');
  const items = sub.find('.sub-scroll > div > ul > li').map((__, l) => {
    const bb = $(l).find('button');
    return `                <li class="m-acc"><div><button type="button">${txt(bb)}${svg(bb)}</button><div class="m-acc-body"></div></div></li>`;
  }).get().join('\n');
  return `          <li class="has-children"><button type="button">${txt(b)}${svg(b)}</button>
            <div class="m-sub"><div class="m-panel"><div class="m-scroll"><div class="container">
              <div class="m-sub-head"><span>${txt(head.find('span'))}</span><button type="button">${svg(back)}${esc(back.text())}</button></div>
              <ul>
${items}
              </ul>
            </div></div></div></div>
          </li>`;
}).get().join('\n');
const mobCta = mob.find('nav').first().next();

process.stdout.write(`<header class="site-header">
  <div class="headroom">
    <div class="header-bar">
      <div class="header-row">
        <a class="header-logo" href="/" title="Backlinko">${svg(hdr.find('a[href="/"]').first())}</a>
        <div class="header-tools">
          <nav class="header-nav">
            <ul>
${nav}
            </ul>
          </nav>
          <div class="header-search"><button type="button" aria-label="Search">${svg(searchBtn)}</button>
            <div class="header-popup search-popup">
              <div class="search-form"><form><input type="text" required minlength="3" placeholder="${search.find('input').attr('placeholder')}"><button type="submit"><span class="sr-only">Search</span>${svg(search.find('form button'))}</button></form></div>
              <button class="popup-close" type="button">${svg(search.children('button'))}<span class="sr-only">Close</span></button>
            </div>
          </div>
          <div class="header-cta"><button type="button">${txt(semrush.parent().children('button'))}</button>
            <div class="header-popup semrush-popup"><div class="semrush-card"><div>${$.html(semInner.children('svg').first())}
              <header><h3>${svg(semInner.find('h3'))}<span class="sr-only">Semrush</span> <span>${txt(semInner.find('h3 > span').last())}</span></h3><button type="button">${svg(semInner.find('header button'))}<span class="sr-only">Close</span></button></header>
              <ul>
${semLis}
              </ul>
              <footer><h3>${txt(semFooter.find('h3'))}</h3><p>${esc(semP.contents().first().text())}<br><a href="${semA.attr('href')}">${txt(semA)}</a> ${esc(semP.contents().last().text().trim())}</p></footer>
            </div></div></div>
          </div>
          <button class="header-toggle" type="button" title="Menu"><i aria-hidden="true"></i><span class="sr-only">Menu</span></button>
        </div>
      </div>
    </div>
  </div>
  <div class="header-mobile" id="header-m-drop"><div class="m-panel"><div class="m-scroll"><div class="container m-main">
    <nav class="m-nav">
      <ul>
${mobLis}
      </ul>
    </nav>
    <div class="m-cta"><a class="purple" href="${mobCta.find('a').attr('href')}">${txt(mobCta.find('a'))}</a>
      <button type="button">${txt(mobCta.find('button'))}</button>
      <p>${esc(mobCta.find('p').contents().first().text())}<br>${esc(mobCta.find('p').contents().last().text())}</p>
    </div>
  </div></div></div></div>
</header>
`);
