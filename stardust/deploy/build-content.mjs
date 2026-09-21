// Generates content/index.html (DA body fragment) from the replica capture — the same
// verbatim sources the prototype was built from (capture/harvest.json, section slices,
// pages/index.json). Run: node stardust/deploy/build-content.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url).pathname;
const CAP = `${ROOT}stardust/replica/capture/`;
const harvest = JSON.parse(readFileSync(`${CAP}harvest.json`, 'utf8'));
const pageLinks = JSON.parse(readFileSync(`${ROOT}stardust/current/pages/index.json`, 'utf8')).links;
const ORIGIN = 'https://www.synopsys.com';

// largest captured Dynamic Media rendition — the pipeline builds its own responsive set
const dm = (id) => {
  const key = Object.keys(harvest.img).find((k) => k.includes(`/synopsys/${id}?`));
  if (!key) throw new Error(`no captured image for ${id}`);
  const set = harvest.img[key].srcset.split(',').map((s) => s.trim().split(' ')[0]);
  return (set[set.length - 1] || key).replace(/&/g, '&amp;');
};
const abs = (u) => (u.startsWith('/') ? ORIGIN + u : u);
const link = (href) => abs(href.replace(/^\/(.*)$/, '/$1'));
const cell = (inner) => `<div>${inner}</div>`;
const row = (...cells) => `        <div>${cells.map(cell).join('')}</div>`;

// ── hero carousel: row = slide (image | content) ──
const slides = [
  { img: 'physical-ai-hero-banner-1900x700', alt: 'Synopsys Physical AI Solutions', h: 'h1', title: 'Introducing Synopsys <br>Physical AI Solutions', sub: 'Accelerate Physical AI development with trusted simulation', ctas: [['strong', '/ai/physical-ai.html', 'Learn More']] },
  { img: 'multiphysics-fusion-homepage-banner', alt: 'Synopsys Multiphysics Fusion Solutions', h: 'h2', title: 'Synopsys Multiphysics Fusion Solutions Available Now', sub: 'Market Leaders Including Cisco, MediaTek, NVIDIA, and Samsung Foundry Demonstrate Measurable Impact, Advancing the Shift from Overdesign to Co-design', ctas: [['strong', '/solutions/multiphysics-fusion.html', 'Learn More']] },
  { img: 'next-gen-hav-homepage-banner', alt: '', h: 'h2', title: 'Introducing Hardware-Assisted Verification for the AI Era', sub: 'New Hardware Platforms and Capabilities', ctas: [['strong', 'https://news.synopsys.com/2026-03-11-Synopsys-Introduces-Software-Defined-Hardware-Assisted-Verification-for-the-AI-Era', 'Press Release'], ['em', '/verification/emulation-prototyping.html', 'Learn More']] },
  { img: 'edt-homepage-banner', alt: 'eDT Homepage Banner', h: 'h2', title: 'Synopsys Electronics <br>Digital Twin Platform', sub: 'Accelerate SDV Development', ctas: [['strong', 'https://news.synopsys.com/2026-03-10-Synopsys-Launches-Electronics-Digital-Twin-Platform', 'Press Release'], ['em', '/solutions/electronics-digital-twin.html', 'Learn More']] },
  { img: null, alt: '', h: 'h2', title: 'NVIDIA and Synopsys Announce Strategic Partnership', sub: '', ctas: [['strong', 'https://news.synopsys.com/2025-12-01-NVIDIA-and-Synopsys-Announce-Strategic-Partnership', 'Read Press Release'], ['em', '/partners/nvidia.html', 'Learn More']], fg: `${ORIGIN}/_jcr_content/root/synopsyscontainer/carousel_copy_copy/item_1764625001270_c/foregroundImage.coreimg.svg/1765220752167/nvidia-and-synopsys-partnership.svg` },
];
const carousel = slides.map((s) => {
  const media = s.img ? `<img src="${dm(s.img)}" alt="${s.alt}">` : (s.fg ? `<img src="${s.fg}" alt="NVIDIA and Synopsys Partnership">` : '');
  const body = [`<${s.h}>${s.title}</${s.h}>`, s.sub ? `<p>${s.sub}</p>` : '', ...s.ctas.map(([t, href, label]) => `<p><${t}><a href="${link(href)}">${label}</a></${t}></p>`)].filter(Boolean).join('');
  return row(media, body);
}).join('\n');

// ── solution cards ──
const solutions = [
  ['/ai.html', 'ai-tech-1', '', 'Synopsys.ai', 'Award-winning, Industry Leading AI-powered Workflow Optimization'],
  ['/silicon-design.html', 'silicon-design-verification-368x434', 'Silicon Design &amp; Verification', 'EDA', '#1 in Electronic Design Automation Solutions &amp; Services'],
  ['/systems.html', 'system-design-368x434', 'Systems Design Solutions', 'Systems', 'Industry-Leading Hardware Assisted Verification &amp; Virtualization Solutions'],
  ['/designware-ip.html', 'silicon-ip-368x434', 'Silicon IP', 'Silicon IP', '#1 in Interface, Foundation, &amp; Physical IP'],
].map(([href, img, alt, title, desc]) => row(`<img src="${dm(img)}" alt="${alt}">`, `<h3>${title}</h3><p>${desc}</p><p><a href="${link(href)}">Learn More</a></p>`)).join('\n');

// ── key benefits (from the prototype template's kb: rows) ──
const tpl = readFileSync(`${ROOT}stardust/prototypes/src/index.template.html`, 'utf8');
const kbs = [...tpl.matchAll(/<!--kb:([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^>]*?)-->/g)];
if (kbs.length !== 12) throw new Error(`expected 12 key benefits, got ${kbs.length}`);
const kbCol = (title, items) => `<h3>${title}</h3>${items.map(([, href, icon, alt, t, d]) => `<p><img src="${abs(icon)}" alt="${alt}"></p><p><a href="${link(href)}">${t}</a></p><p>${d}</p>`).join('')}`;
const keyBenefits = row(kbCol('Industry', kbs.slice(0, 6)), kbCol('Technology', kbs.slice(6)));

// ── partner logos (10, live order, no clones) ──
const logoSrc = readFileSync(`${CAP}sections/08.html`, 'utf8').replace(/\s+/g, ' ');
const logos = [...logoSrc.matchAll(/<div class="slick-slide ?([a-z -]*)"[^>]*>\s*<a href="([^"]*)">\s*<img src="([^"]*)" alt="([^"]*)"/g)]
  .filter(([, cls]) => !cls.includes('cloned'))
  .map(([, , href, src, alt]) => row(`<a href="${link(href)}"><img src="${abs(src)}" alt="${alt}"></a>`)).join('\n');
if (logos.split('\n').length !== 10) throw new Error('expected 10 logos');

// ── What's New (9 cards, live order) ──
const newsSrc = readFileSync(`${CAP}sections/10.html`, 'utf8').replace(/\s+/g, ' ');
const cardRe = /<section id="[^"]*" class="component-assetcard[^"]*?(slick-cloned)?"[^>]*>\s*<div id="[^"]*" class="cmp-image">\s*<img srcset="[^"]*" src="([^"]*?)(?:…)?" alt="([^"]*)">\s*<\/div>.*?<div class="label">([^<]*)<\/div>.*?<div class="date-time">\s*([^<]*?)\s*<\/div>.*?<h4 class="heading">\s*<span>\s*([^<]*?)\s*<\/span>.*?<a href="([^"]*?)(?:…)?">/g;
const cards = [...newsSrc.matchAll(cardRe)].filter(([, clone]) => !clone);
if (cards.length !== 9) throw new Error(`expected 9 news cards, got ${cards.length}`);
const news = cards.map(([, , src, alt, label, date, title, href]) => {
  const id = src.match(/\/synopsys\/([^?]+)\?/)[1];
  const full = href.endsWith('…') ? pageLinks.find((l) => l.startsWith(href.slice(0, -1))) : href;
  if (!full) throw new Error(`no full link for ${href}`);
  return row(`<img src="${dm(id)}" alt="${alt.trim()}">`, `<p><strong>${label}</strong></p><p>${date}</p><h3>${title.trim()}</h3><p><a href="${link(full)}">Learn more</a></p>`);
}).join('\n');

const html = `<body>
  <header></header>
  <main>
    <div>
      <div class="metadata">
        <div><div>Title</div><div>Synopsys | EDA Tools, Semiconductor IP and Application Security Solutions</div></div>
        <div><div>Description</div><div>Synopsys delivers comprehensive silicon to systems design solutions, from electronic design automation to silicon IP and system verification and validation.</div></div>
      </div>
    </div>
    <div>
      <div class="carousel hero">
${carousel}
      </div>
    </div>
    <div>
      <h2>Powering the Era of Pervasive Intelligence from Silicon to Systems</h2>
      <p>Supercharge Productivity&nbsp; •&nbsp; Conquer Complexity&nbsp; •&nbsp; Accelerate Time-to-Market</p>
      <div class="section-metadata">
        <div><div>style</div><div>statement</div></div>
      </div>
    </div>
    <div>
      <div class="cards solutions">
${solutions}
      </div>
    </div>
    <div>
      <h2>Design the Future Today with Synopsys</h2>
      <div class="columns key-benefits">
${keyBenefits}
      </div>
    </div>
    <div>
      <h2>Ecosystem Partners</h2>
      <div class="cards logos">
${logos}
      </div>
      <div class="section-metadata">
        <div><div>style</div><div>light</div></div>
      </div>
    </div>
    <div>
      <h2>What's New</h2>
      <div class="cards news">
${news}
      </div>
    </div>
    <div>
      <div class="columns divider">
        <div>
          <div>
            <h2>Support &amp; Services</h2>
            <p>Explore the Synopsys Support Community! Login is required. View our service offerings as well.</p>
            <p><a href="${ORIGIN}/support.html">View Support &amp; Services</a></p>
          </div>
          <div>
            <h2>Careers</h2>
            <p>Join Synopsys and build your career with a world-class team of technology professionals.</p>
            <p><a href="https://careers.synopsys.com/">View Careers</a></p>
          </div>
        </div>
      </div>
      <div class="section-metadata">
        <div><div>style</div><div>light</div></div>
      </div>
    </div>
    <div>
      <h2>Connect with Us</h2>
      <p><strong><a href="${ORIGIN}/contact-sales.html">Contact Sales</a></strong></p>
      <div class="section-metadata">
        <div><div>style</div><div>cta-band</div></div>
      </div>
    </div>
  </main>
  <footer></footer>
</body>
`;
writeFileSync(`${ROOT}content/index.html`, html);
console.log(`content/index.html written (${html.length} chars): 5 slides, 4 solutions, 12 key benefits, 10 logos, 9 news cards`);
