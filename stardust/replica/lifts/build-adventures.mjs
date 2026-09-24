// Compose stardust/prototypes/us-en-adventures-html-proposed.html:
// chrome (header/footer/mobile nav) verbatim from the gated foundation prototype,
// main content verbatim from the captured page (us-en-adventures-html-items.json).
import { readFileSync, writeFileSync } from 'node:fs';

const root = 'stardust';
const foundation = readFileSync(`${root}/prototypes/us-en-html-proposed.html`, 'utf8');
const items = JSON.parse(readFileSync(`${root}/replica/lifts/us-en-adventures-html-items.json`, 'utf8'));
const media = JSON.parse(readFileSync(`${root}/replica/lifts/us-en-adventures-html-media-map.json`, 'utf8'));
const page = JSON.parse(readFileSync(`${root}/current/pages/us-en-adventures-html.json`, 'utf8'));

const between = (s, a, b) => s.slice(s.indexOf(a), s.indexOf(b, s.indexOf(a)) + b.length);
const activate = (s) => s.replace(/<li class="nav__item nav__item--child"><a href="\/us\/en\/adventures.html" class="nav__link">/g,
  '<li class="nav__item nav__item--child nav__item--active"><a href="/us/en/adventures.html" class="nav__link">');
const header = activate(between(foundation, '<header class="site-header"', '</header>'));
const footerAndNav = activate(foundation.slice(foundation.indexOf('<footer class="site-footer"')));

const esc = (s) => s.replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;');

const card = (it) => `        <li class="image-list__item">
          <article class="image-list__content">
            <a href="${it.href}" class="image-list__image-link">
              <div class="image-list__image"><div class="image"><img src="${media[it.src]}" alt="${esc(it.alt)}" width="1600" height="900"></div></div>
            </a>
            <a href="${it.href}" class="image-list__title-link"><span class="image-list__title">${esc(it.title)}</span></a>
            <span class="image-list__description">${esc(it.description)}</span>
          </article>
        </li>`;

const tabs = items.tabs.map((t, i) => `        <li role="tab" id="${t.id}" class="tabs__tab${i === 0 ? ' tabs__tab--active' : ''}" aria-controls="${items.panels[i].id}" tabindex="${i === 0 ? 0 : -1}" aria-selected="${i === 0}">${t.label}</li>`).join('\n');
const panels = items.panels.map((p, i) => `      <div class="tabs__tabpanel${i === 0 ? ' tabs__tabpanel--active' : ''}" id="${p.id}" role="tabpanel" aria-labelledby="${items.tabs[i].id}"${i === 0 ? '' : ' aria-hidden="true"'} data-section="adventures-${items.tabs[i].label.toLowerCase()}" data-intent="content discovery" data-layout="grid" data-module="image-list">
        <ul class="image-list">
${p.items.map(card).join('\n')}
        </ul>
      </div>`).join('\n');

const main = `<main class="container" data-template="listing">

  <div class="container-fixed">
    <section data-section="page-title" data-intent="page heading" data-layout="contained" data-module="title">
      <div class="title"><h1 class="title__text">Adventures</h1></div>
    </section>
  </div>

  <section class="col teaser--hero" data-section="hero-teaser" data-intent="emotional hook" data-layout="full-bleed" data-module="teaser-hero">
    <div class="teaser">
      <div class="teaser__content">
        <h2 class="teaser__title"> Experience the world with us</h2>
        <div class="teaser__description">
          <p>With WKND Adventures, you don't just see the world -- you experience its cultures, flavors and wonders.</p>
        </div>
      </div>
      <div class="teaser__image">
        <div class="image"><img src="${media[items.hero.src]}" alt="${esc(items.hero.alt)}" title="Woman chillaxing with river views in Australian bushland" width="1600" height="900"></div>
      </div>
    </div>
  </section>

  <div class="container-fixed">
    <section class="col title--underline" data-section="current-adventures-title" data-intent="section heading" data-layout="contained" data-module="title">
      <div class="title"><h2 class="title__text">Current Adventures</h2></div>
    </section>

    <section class="col" data-section="current-adventures" data-intent="content discovery" data-layout="tabs" data-module="tabs">
      <div class="tabs">
        <ol role="tablist" class="tabs__tablist" aria-multiselectable="false">
${tabs}
        </ol>
${panels}
      </div>
    </section>

    <div class="col separator-col" data-section="separator" data-intent="visual rhythm" data-layout="contained">
      <div class="separator"><hr class="separator__rule"></div>
    </div>
  </div>

</main>

`;

const html = `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<title>${page.title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(page.description)}">
<meta name="keywords" content="Attract,Surfing,Engage">
<meta name="theme-color" content="#FFEA00">
<link rel="icon" href="assets/images/favicon.png">
<link rel="stylesheet" href="canon.css">
<link rel="stylesheet" href="us-en-adventures-html.css">
</head>
<body class="basicpage anonymous" data-template="listing" data-stardust-replica="us-en-adventures-html">
<div class="site-root">

${header}

${main}${footerAndNav.replace('<script src="canon.js"></script>', '<script src="canon.js"></script>\n<script src="us-en-adventures-html.js"></script>')}`;

writeFileSync(`${root}/prototypes/us-en-adventures-html-proposed.html`, html);
console.log('wrote', html.length, 'chars;', items.panels.reduce((n, p) => n + p.items.length, 0), 'cards');
