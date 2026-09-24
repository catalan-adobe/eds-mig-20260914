// Generates stardust/prototypes/us-en-adventures-html-proposed.html from the capture.
// Text nodes, hrefs, alt/title, srcset/width/height are copied verbatim; markup is clean and semantic.
import { readFileSync, writeFileSync } from 'node:fs';

const cap = readFileSync('stardust/current/pages/us-en-adventures-html.html', 'utf8');
const home = readFileSync('stardust/prototypes/us-en-html-proposed.html', 'utf8');
const abs = (s) => s.replace(/(src|srcset)="\/us\//g, '$1="https://wknd.site/us/').replace(/,\s*\/us\//g, ', https://wknd.site/us/');

const imgTag = (html) => {
  const m = html.match(/<img [^>]*>/);
  if (!m) throw new Error('no img');
  let t = m[0].replace(/ class="[^"]*"/, '').replace(/ data-cmp-[a-z-]+="[^"]*"/g, '').replace(/ data-asset[^=]*="[^"]*"/g, '').replace(/ data-cmp-lazy[^ ]*/g, '');
  return abs(t);
};

const hdr = home.slice(home.indexOf('<header '), home.indexOf('</header>') + 9)
  .replace('<li><a href="/us/en/adventures.html">Adventures</a></li>', '<li class="is-active"><a href="/us/en/adventures.html">Adventures</a></li>');
const ftr = home.slice(home.indexOf('<footer '), home.indexOf('</footer>') + 9)
  .replace('<li><a href="/us/en/adventures.html">Adventures</a></li>', '<li class="is-active"><a href="/us/en/adventures.html">Adventures</a></li>');
const tail = home.slice(home.indexOf('<div class="nav-toggle">'), home.indexOf('<script src="canon.js">'));

const h1 = cap.match(/<h1 class="cmp-title__text">([^<]*)<\/h1>/)[1].trim();
const tStart = cap.indexOf('class="cmp-teaser"');
const teaserHtml = cap.slice(tStart, cap.indexOf('cmp-title--underline', tStart));
const teaserTitle = teaserHtml.match(/<h2 class="cmp-teaser__title">([\s\S]*?)<\/h2>/)[1].trim();
const teaserDesc = teaserHtml.match(/<div class="cmp-teaser__description">([\s\S]*?)<\/div>/)[1].trim();
const teaserImg = imgTag(teaserHtml);
const h2 = cap.match(/<h2 class="cmp-title__text">([^<]*)<\/h2>/)[1];

const tabs = [...cap.matchAll(/<li role="tab" id="([^"]+)" class="cmp-tabs__tab( cmp-tabs__tab--active)?"[^>]*>([^<]*)<\/li>/g)]
  .map((m) => ({ id: m[1], active: !!m[2], label: m[3] }));
const panels = [...cap.matchAll(/<div id="([^"]+-tabpanel)"[^>]*class="cmp-tabs__tabpanel( cmp-tabs__tabpanel--active)?"[^>]*>([\s\S]*?)<\/ul>/g)]
  .map((m) => ({ id: m[1], active: !!m[2], body: m[3] }));
if (tabs.length !== 6 || panels.length !== 6) throw new Error(`tabs ${tabs.length} panels ${panels.length}`);

const card = (li) => {
  const href = li.match(/href="([^"]+)"/)[1];
  const title = li.match(/<span class="cmp-image-list__item-title">([\s\S]*?)<\/span>/)[1].trim();
  const desc = li.match(/<span class="cmp-image-list__item-description">([\s\S]*?)<\/span>/)[1].trim();
  return `        <li class="card-list__item"><article><a href="${href}"><div class="image">${imgTag(li)}</div></a> <a class="card-list__title-link" href="${href}"><span class="card-list__title">${title}</span></a> <span class="card-list__description">${desc}</span></article></li>`;
};
const panelHtml = panels.map((p, i) => {
  const items = [...p.body.matchAll(/<li class="cmp-image-list__item"[^>]*>([\s\S]*?)<\/li>/g)].map((m) => card(m[1]));
  const tab = tabs[i];
  return `      <div class="tabs__panel${p.active ? ' tabs__panel--active' : ''}" id="${p.id}" role="tabpanel" aria-labelledby="${tab.id}" tabindex="0"${p.active ? '' : ' aria-hidden="true"'} data-slot="card-grid" data-tab="${tab.label}">
        <ul class="card-list">
${items.join('\n')}
        </ul>
      </div>`;
}).join('\n');
const tabHtml = tabs.map((t) => `        <li class="tabs__tab${t.active ? ' tabs__tab--active' : ''}" role="tab" id="${t.id}" aria-controls="${t.id.replace(/-tab$/, '-tabpanel')}" tabindex="${t.active ? 0 : -1}" aria-selected="${t.active}">${t.label}</li>`).join('\n');
const count = panelHtml.match(/card-list__item/g).length;
console.error(`cards: ${count}`);

const page = `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Adventures</title>
<meta name="description" content="Join us on one of our next adventures.  Browse our list of curated experiences and sign up for one when you're ready to explore with us.">
<meta name="stardust-prototype" content="us-en-adventures-html">
<link rel="icon" href="../current/assets/favicon.png">
<link rel="stylesheet" href="canon.css">
<link rel="stylesheet" href="us-en-adventures-html.css">
</head>
<body class="anonymous page--adventures" data-template="listing">
<div class="page-root">
${hdr}
<main class="page-main" data-template="listing">
  <div class="container container--fixed" data-section="index-headline" data-intent="explain mechanic" data-layout="contained">
    <h1 class="page-title" data-slot="index-headline">${h1}</h1>
  </div>
  <section class="column column--flush teaser--hero" data-section="hero" data-intent="emotional hook" data-layout="full-bleed" data-module="hero-teaser" data-slot="intro">
    <div class="teaser">
      <div class="teaser__content">
        <h2 class="teaser__title">${teaserTitle}</h2>
        <div class="teaser__description">${teaserDesc}</div>
      </div>
      <div class="teaser__image"><div class="image">${teaserImg}</div></div>
    </div>
  </section>
  <div class="container container--fixed">
    <section class="column section-title section-title--underline" data-section="current-adventures-title" data-intent="explain mechanic" data-layout="contained">
      <h2 class="section-title__text">${h2}</h2>
    </section>
    <section class="column tabs" data-section="current-adventures" data-intent="drive action" data-layout="grid" data-module="tabs" data-slot="filter-controls">
      <ol class="tabs__list" role="tablist">
${tabHtml}
      </ol>
${panelHtml}
    </section>
    <div class="column separator"><hr></div>
  </div>
</main>
${ftr}
</div>
${tail}<script src="canon.js"></script>
<script>
// Observed (stardust/replica/motion/us-en-adventures-html.json): tab click moves --active on the tab
// and its panel (class swap, no transition); aria-selected/tabindex/aria-hidden follow the core tabs component.
(function () {
  document.querySelectorAll('.tabs').forEach(function (tabs) {
    var items = Array.prototype.slice.call(tabs.querySelectorAll('.tabs__tab'));
    var panels = Array.prototype.slice.call(tabs.querySelectorAll('.tabs__panel'));
    items.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        items.forEach(function (t, k) {
          var on = k === i;
          t.classList.toggle('tabs__tab--active', on);
          t.setAttribute('aria-selected', on);
          t.setAttribute('tabindex', on ? '0' : '-1');
        });
        panels.forEach(function (p, k) {
          var on = k === i;
          p.classList.toggle('tabs__panel--active', on);
          if (on) p.removeAttribute('aria-hidden'); else p.setAttribute('aria-hidden', 'true');
        });
      });
    });
  });
})();
</script>
</body>
</html>
`;
writeFileSync('stardust/prototypes/us-en-adventures-html-proposed.html', page);
console.error(`wrote ${page.length} chars`);
