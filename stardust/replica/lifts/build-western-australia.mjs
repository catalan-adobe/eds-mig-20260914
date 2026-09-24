// Builds stardust/prototypes/us-en-magazine-western-australia-html-proposed.html:
// chrome verbatim from the gated magazine sibling, article content verbatim from the capture.
import fs from "node:fs";
const sib = fs.readFileSync("stardust/prototypes/us-en-magazine-html-proposed.html", "utf8").split("\n");
const c = JSON.parse(fs.readFileSync("stardust/replica/lifts/us-en-magazine-western-australia-html-content.json", "utf8"));
const src = fs.readFileSync("stardust/current/pages/us-en-magazine-western-australia-html.html", "utf8");
const leadAlt = src.match(/<img[^>]*adobestock-156407519[^>]*alt="([^"]*)"/)[1];
const desc = src.match(/<meta name="description" content="([^"]*)"/)[1];
const headerStart = sib.findIndex((l) => l.startsWith("<header "));
const headerEnd = sib.findIndex((l) => l.startsWith("</header>"));
const footerStart = sib.findIndex((l) => l.startsWith("<footer "));
const header = sib.slice(headerStart, headerEnd + 1).join("\n");
const tail = sib.slice(footerStart).join("\n");
const P = (t) => `<p>${t}</p>`;
const imgs = [["adobe-waadobe-wa-b6a7083.jpeg", "hiking-and-camping-on-the-coast"], ["adobe-waadobe-wa-mg-3094.jpeg", "a-trusty-vehicle"], ["adobe-waadobe-wa-mg-3851.jpeg", "surfing-is-a-must-do"]];
const titleImg = (i) => `
        <div class="grid" data-section="${imgs[i][1]}" data-intent="chapter heading and photo" data-layout="stack">
          <div class="col title--underline" data-module="title"><div class="title"><h2 class="title__text">${c.h2s[i]}</h2></div></div>
          <div class="col" data-module="image"><div class="image"><img src="assets/media/${imgs[i][0]}" srcset="assets/media/${imgs[i][0].replace(".jpeg", "-400.jpeg")} 400w, assets/media/${imgs[i][0]} 1600w" alt=""></div></div>
        </div>`;
const html = `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<title>Western Australia</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${desc}">
<meta name="template" content="article-page-template">
<meta name="theme-color" content="#FFEA00">
<link rel="canonical" href="/us/en/magazine/western-australia.html">
<link rel="icon" href="assets/images/favicon.png">
<link rel="stylesheet" href="canon.css">
<link rel="stylesheet" href="us-en-magazine-western-australia-html.css">
</head>
<body class="page basicpage anonymous" data-template="article" data-stardust-replica="us-en-magazine-western-australia-html">
<div class="site-root">

${header}

<main class="container" data-template="article">
  <div class="container-fixed">

    <section class="col" data-section="lead-image" data-intent="visual hook" data-layout="contained" data-module="image" data-slot="lead-image">
      <div class="image"><img src="assets/media/adobestock-156407519.jpeg" srcset="assets/media/adobestock-156407519-400.jpeg 400w, assets/media/adobestock-156407519.jpeg 1600w" alt="${leadAlt}" title="The Lennard River"></div>
    </section>

    <section class="col" data-section="breadcrumb" data-intent="wayfinding" data-layout="contained" data-module="breadcrumb">
      <nav class="breadcrumb" role="navigation" aria-label="Breadcrumb">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item"><a class="breadcrumb__link" href="/us/en/magazine.html"><span data-slot="deck">Magazine</span>
          </a></li>
          <li class="breadcrumb__item breadcrumb__item--active"><span>Western Australia</span></li>
        </ol>
      </nav>
    </section>

    <article class="col col--8 article" data-section="article" data-intent="editorial story" data-layout="side-rail">
      <div class="title" data-module="title"><h1 class="title__text" data-slot="headline">Western Australia by Camper Van</h1></div>
      <div class="title" data-module="title"><h4 data-slot="byline">By Sofia Sjöberg</h4></div>

      <div class="article__body" data-section="article-body" data-intent="long-form narrative" data-layout="stack" data-module="content-fragment" data-slot="body">
        <h3 class="article__fragment-title">Western Australia by Camper Van</h3>
        ${P(c.ps[0])}
        <div class="grid" data-section="pull-quote" data-intent="editorial accent" data-layout="contained">
          <div class="col text--quote" data-module="text-quote">
            <div class="text">
              ${c.bq}
              ${P(c.ps[1])}
            </div>
          </div>
        </div>
        ${P(c.ps[2])}${titleImg(0)}
        ${P(c.ps[3])}${titleImg(1)}
        ${P(c.ps[4])}${titleImg(2)}
        ${P(c.ps[5])}
      </div>

      <div class="grid contributor" data-section="contributor" data-intent="author credit and social" data-layout="grid" data-module="byline">
        <div class="col separator-col"><div class="separator"><hr class="separator__rule"></div></div>
        <div class="col col--9 byline-col">
          <div class="byline">
            <div class="byline__image"><div class="image"><img src="assets/media/ayo-ogunseinde-237739.jpeg" alt=""></div></div>
            <h2 class="byline__name">Sofia Sjöberg</h2>
            <p class="byline__occupations">Photographer, Skiier, Youtuber</p>
          </div>
        </div>
        <div class="col col--3 button-list button-list--secondary">
          <div class="col button--icononly"><a href="#" class="button" aria-label="Facebook"><span class="button__icon button__icon--facebook icon" aria-hidden="true"></span><span class="button__text">Facebook</span></a></div>
          <div class="col button--icononly"><a href="#" class="button" aria-label="Twitter"><span class="button__icon button__icon--twitter icon" aria-hidden="true"></span><span class="button__text">Twitter</span></a></div>
          <div class="col button--icononly"><a href="#" class="button" aria-label="instagram"><span class="button__icon button__icon--instagram icon" aria-hidden="true"></span><span class="button__text">Instagram</span></a></div>
        </div>
      </div>
    </article>

    <aside class="col col--3 col--offset-1 sidebar" data-section="sidebar" data-intent="sharing and related stories" data-layout="side-rail">
      <div class="col title--black" data-module="title"><div class="title"><h5>SHARE THIS STORY</h5></div></div>
      <div class="col sharing" data-module="sharing"><div class="fb-share-button"></div> <a href="https://www.pinterest.com/pin/create/button/"></a></div>
      <div class="col separator--hidden separator--space-small"><div class="separator"><hr class="separator__rule"></div></div>
      <div class="col download" data-module="download"></div>
      <div class="col upnext" data-section="up-next" data-intent="content discovery" data-layout="stack" data-module="list-upnext" data-slot="related">
        <ul class="upnext__list">
          <li class="upnext__item"><a class="upnext__link" href="/us/en/magazine/guide-la-skateparks.html">
            <span class="upnext__title">Ultimate Guide to LA Skateparks</span>
            <span class="upnext__date">Wednesday, 30 Sep 2020</span>
          </a></li>
          <li class="upnext__item"><a class="upnext__link" href="/us/en/magazine/ski-touring.html">
            <span class="upnext__title">Ski Touring</span>
            <span class="upnext__date">Wednesday, 30 Sep 2020</span>
          </a></li>
          <li class="upnext__item"><a class="upnext__link" href="/us/en/magazine/western-australia.html">
            <span class="upnext__title">Western Australia</span>
            <span class="upnext__date">Thursday, 9 Jul 2020</span>
          </a></li>
          <li class="upnext__item"><a class="upnext__link" href="/us/en/magazine/san-diego-surf.html">
            <span class="upnext__title">San Diego Surf Spots</span>
            <span class="upnext__date">Thursday, 9 Jul 2020</span>
          </a></li>
        </ul>
      </div>
    </aside>

  </div>
</main>

${tail}
`;
fs.writeFileSync("stardust/prototypes/us-en-magazine-western-australia-html-proposed.html", html);
console.log("wrote", html.length, "chars");
