// Builds stardust/prototypes/index-proposed.html from index.template.html + the capture:
//   <!--svg:key-->      inline SVG harvested verbatim from the live DOM (capture/harvest.json)
//   <img data-dm="id">  src + srcset copied from the captured Dynamic Media <img> (same file)
//   <!--kb:href|icon|alt|title|desc-->  one key-benefit row
//   <!--logos--> / <!--news-->          repeat groups read from the captured section slices
// Run: node stardust/prototypes/src/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../../../', import.meta.url).pathname;
const CAP = `${ROOT}stardust/replica/capture/`;
const harvest = JSON.parse(readFileSync(`${CAP}harvest.json`, 'utf8'));
const pageLinks = JSON.parse(readFileSync(`${ROOT}stardust/current/pages/index.json`, 'utf8')).links;
let html = readFileSync(`${ROOT}stardust/prototypes/src/index.template.html`, 'utf8');
const ORIGIN = 'https://www.synopsys.com';

const dm = (id) => {
  const key = Object.keys(harvest.img).find((k) => k.includes(`/synopsys/${id}?`));
  if (!key) throw new Error(`no captured image for ${id}`);
  return { src: key, srcset: harvest.img[key].srcset };
};
const abs = (u) => (u.startsWith('/') ? ORIGIN + u : u);

// inline SVGs
html = html.replace(/<!--svg:(\w+)-->/g, (_, k) => {
  const svg = harvest.svg[k];
  if (!svg) throw new Error(`no harvested svg ${k}`);
  return svg;
});

// Dynamic Media images
html = html.replace(/<img([^>]*?) data-dm="([^"]+)"([^>]*)>/g, (_, a, id, b) => {
  const { src, srcset } = dm(id);
  return `<img${a} src="${src}"${srcset ? ` srcset="${srcset}"` : ''}${b}>`;  // function replacer: srcsets carry `$&`
});

// key benefits
html = html.replace(/<!--kb:([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^>]*?)-->/g, (_, href, icon, alt, title, desc) => `
                    <div class="keyBenefits"><section class="cmp-key-benefits"><a class="cmp-key-benefits__link" href="${href}"><div class="cmp-key-benefits__wrapper">
                      <div class="cmp-key-benefits__img-text"><div class="cmp-key-benefits__img-wrapper"><div class="component-image"><img src="${abs(icon)}" alt="${alt}" class="img-responsive"></div></div><div class="cmp-key-benefits__title">${title}</div></div>
                      <div class="cmp-key-benefits__description">${desc}</div>
                    </div></a></section></div>`);

// logo marquee: the live slick track (5 leading clones + 10 slides + 10 trailing clones); clones are presentational
const logoSrc = readFileSync(`${CAP}sections/08.html`, 'utf8').replace(/\s+/g, ' ');
const logoRe = /<div class="slick-slide ?([a-z -]*)"[^>]*>\s*<a href="([^"]*)">\s*<img src="([^"]*)" alt="([^"]*)"/g;
const logos = [...logoSrc.matchAll(logoRe)].map(([, cls, href, src, alt]) => ({ clone: cls.includes('cloned'), href, src, alt }));
if (logos.length !== 25) throw new Error(`expected 25 logo slides, got ${logos.length}`);
html = html.replace('<!--logos-->', () => logos.map((l) => l.clone
  ? `<div class="slick-slide slick-cloned" aria-hidden="true"><a><img src="${abs(l.src)}" alt="" class="partner-logo"></a></div>`
  : `<div class="slick-slide"><a href="${l.href}"><img src="${abs(l.src)}" alt="${l.alt}" class="partner-logo"></a></div>`).join('\n                          '));

// What's New cards: 3 leading clones + 9 cards + 9 trailing clones, as on live (track 21 × 380px)
const newsSrc = readFileSync(`${CAP}sections/10.html`, 'utf8').replace(/\s+/g, ' ');
const cardRe = /<section id="[^"]*" class="component-assetcard[^"]*?(slick-cloned)?"[^>]*>\s*<div id="[^"]*" class="cmp-image">\s*<img srcset="[^"]*" src="([^"]*?)(?:…)?" alt="([^"]*)">\s*<\/div>.*?<div class="label">([^<]*)<\/div>.*?<div class="date-time">\s*([^<]*?)\s*<\/div>.*?<h4 class="heading">\s*<span>\s*([^<]*?)\s*<\/span>.*?<a href="([^"]*?)(?:…)?">/g;
const cards = [...newsSrc.matchAll(cardRe)].map(([, clone, src, alt, label, date, title, href]) => ({ clone: !!clone, src, alt, label, date, title, href }));
if (cards.length !== 21) throw new Error(`expected 21 card slides, got ${cards.length}`);
const cardHtml = (c, i) => {
  const id = c.src.match(/\/synopsys\/([^?]+)\?/)[1];
  const { src, srcset } = dm(id);
  const active = !c.clone && i >= 3 && i <= 5 ? ' slick-active' : '';
  const chevron = harvest.svg.chevronAsset;
  const fullHref = c.href.endsWith('…')
    ? pageLinks.find((l) => l.startsWith(c.href.slice(0, -1))) || (() => { throw new Error(`no full link for ${c.href}`); })()
    : c.href;
  // clones mirror the live slick clones (h4 + href kept) — role parity for the content-diff probe
  const cloneAttrs = c.clone ? ' slick-cloned" aria-hidden="true' : `${active}`;
  return `<section class="component-assetcard no-link cmp-carousel__item list slick-slide${cloneAttrs}"><div class="cmp-image"><img src="${src}" srcset="${srcset}" alt="${c.alt}"></div><div class="card-text"><div class="label-date-wrapper"><div class="label-wrapper"><div class="label">${c.label}</div></div><div class="date-time">${c.date}</div></div><div class="heading-desc-wrapper"><h4 class="heading"><span>${c.title}</span></h4><p></p></div><a href="${fullHref}">Learn more ${chevron}</a></div></section>`;
};
html = html.replace('<!--news-->', () => cards.map(cardHtml).join('\n                '));

const out = `${ROOT}stardust/prototypes/index-proposed.html`;
writeFileSync(out, html);
const left = html.match(/<!--(svg|kb|logos|news)[^>]*-->/g);
if (left) throw new Error(`unresolved placeholders: ${left.slice(0, 3).join(' ')}`);
console.log(`built ${out} (${html.length} chars, ${logos.length} logo slides, ${cards.length} card slides)`);
