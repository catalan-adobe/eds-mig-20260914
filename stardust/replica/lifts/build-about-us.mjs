// Assembles stardust/prototypes/us-en-about-us-html-proposed.html from the gated
// canon chrome (header/footer/mobile nav lifted from the magazine prototype with
// "About Us" as the active nav item) plus the about-us main authored from the
// captured page JSON/HTML verbatim.
import { readFileSync, writeFileSync } from 'node:fs';

const header = readFileSync('/tmp/about-header.html', 'utf8');
const footer = readFileSync('/tmp/about-footer.html', 'utf8');

const people = [
  { name: 'Stacey Roswells', role: 'Artist | Photographer | Traveler', img: 'stacey-roswells.jpeg', roleBlack: true,
    links: [['facebook', '#facebook-staceyroswell', 'Facebook Social Media'], ['twitter', '#twitter-staceyroswells', 'Twitter Social Media'], ['instagram', '#insta-staceyroswells', 'Instagram Social Media']] },
  { name: 'Jake Hammer', role: 'Influencer | Writer', img: 'alex-iby-343837.jpeg',
    links: [['facebook', '#facebook-jakehammer', 'Facebook jakehammer'], ['twitter', '#twitter-jakehammer', 'Twitter'], ['instagram', '#instagram-jakehammer', 'instagram jakehammer']] },
  { name: 'Ian Provo', role: 'Photographer', img: 'ian-provo.jpeg',
    links: [['facebook', '#facebook-ianprovo', 'Facebook Ian provo'], ['twitter', '#twitter-ianprovo', 'Twitter Ian provo'], ['instagram', '#instagram-ianprovo', 'instagram Ian provo']] },
  { name: 'Jacob Wester', role: 'Skater | Writer', img: 'jacob-wester.jpeg',
    links: [['facebook', '#jacob-wester', 'Facebook'], ['twitter', '#jacob-wester', 'Twitter'], ['instagram', '#jacob-wester', 'instagram']] },
];
const guides = [
  { name: 'Sofia Sjöberg', role: 'Photographer | Youtuber', img: 'ayo-ogunseinde-237739.jpeg',
    links: [['facebook', '#', 'Facebook'], ['twitter', '#', 'Twitter'], ['instagram', '#', 'instagram']] },
  { name: 'Justin Barr', role: 'Artist | Rock Climber', img: 'justin-barr.jpeg',
    links: [['facebook', '#', 'Facebook'], ['twitter', '#', 'Twitter'], ['instagram', '#', 'instagram']] },
  { name: 'Kumar Selveraj', role: 'Photographer | Surfer', img: 'kumar-selvaraj.jpeg',
    links: [['facebook', '#selveraj', 'Facebook'], ['instagram', '#selveraj', 'instagram'], ['twitter', '#selveraj', 'Twitter']] },
];

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').trim().replace(/ /g, '-');
const card = (p) => `
    <section class="col col--3 contributor" data-section="contributor-${slug(p.name)}" data-intent="team member profile" data-layout="card" data-module="contributor">
      <div class="contributor__inner">
        <div class="container-fixed contributor__body">
          <div class="image contributor__image"><img src="assets/media/${p.img}" alt="" width="1200" height="799" loading="lazy"></div>
          <div class="title contributor__name"><h3 class="title__text">${p.name}</h3></div>
          <div class="title${p.roleBlack ? ' title--black' : ''} contributor__role"><h5 class="title__text">${p.role}</h5></div>
          <div class="button-list contributor__links">
            <div class="button-list__grid">${p.links.map(([icon, href, label]) => `
              <div class="col button--secondary button--icononly"><a href="${href}" class="button" aria-label="${label}"><span class="button__icon button__icon--${icon} icon" aria-hidden="true"></span><span class="button__text">${icon[0].toUpperCase()}${icon.slice(1)}</span></a></div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>`;

const main = `
<main class="container" data-template="content-page">
  <div class="container-fixed">

    <section class="col" data-section="page-title" data-intent="page heading" data-layout="contained" data-module="title">
      <div class="title"><h1 class="title__text">About Us</h1></div>
    </section>

    <section class="col title--underline" data-section="contributors-title" data-intent="section heading" data-layout="contained" data-module="title">
      <div class="title"><h2 class="title__text">Our Contributors</h2></div>
    </section>

    <section class="col text--font-small" data-section="contributors-intro" data-intent="section lead" data-layout="contained" data-module="text">
      <div class="text"><p><i>Meet the outstanding individuals responsible for bringing you the most compelling stories across the globe.</i></p></div>
    </section>
${people.map(card).join('\n')}

    <section class="col title--underline" data-section="guides-title" data-intent="section heading" data-layout="contained" data-module="title">
      <div class="title"><h2 class="title__text">WKND Guides</h2></div>
    </section>

    <section class="col text--font-small" data-section="guides-intro" data-intent="section lead" data-layout="contained" data-module="text">
      <div class="text"><p><i>Meet our extraordinary travel guides. When you travel with a certified WKND guide you gain access to attractions and perspectives not found on the pages of a guide book.</i></p></div>
    </section>
${guides.map(card).join('\n')}

  </div>
</main>
`;

const html = `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<title>About Us</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="WKND is a collective of outdoors, music, crafts, adventure sports, and travel enthusiasts that want to share our experiences, connections, and expertise with the world. ">
<meta name="template" content="content-page-template">
<link rel="canonical" href="/us/en/about-us.html">
<link rel="icon" href="assets/images/favicon.png">
<link rel="stylesheet" href="canon.css">
<link rel="stylesheet" href="us-en-about-us-html.css">
</head>
<body class="basicpage anonymous" data-template="content-page" data-stardust-replica="us-en-about-us-html">
<div class="site-root">

${header}
${main}
${footer}`;

writeFileSync('stardust/prototypes/us-en-about-us-html-proposed.html', html);
console.log('wrote stardust/prototypes/us-en-about-us-html-proposed.html', html.length, 'chars');
