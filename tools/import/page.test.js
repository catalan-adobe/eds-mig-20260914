import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { block, rewriteLink } from './html.js';
import { walk } from './components.js';
import { convertPage, convertNav, convertFooter } from './page.js';

const PREFIX = '/f52-1011-01';
const fixture = (name) => readFileSync(new URL(`./fixtures/${name}.html`, import.meta.url), 'utf8');
const convert = (name, path) => parseHTML(convertPage(fixture(name), path, PREFIX)).document;
const rows = (doc, selector) => [...doc.querySelectorAll(`${selector} > div`)];
const cells = (row) => [...row.children];
const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
const meta = (doc, key) => {
  const row = rows(doc, '.metadata').find((r) => text(cells(r)[0]) === key);
  return row && text(cells(row)[1]);
};
const sectionStyle = (el) => {
  const style = el.closest('main > div').querySelector('.section-metadata');
  return style && text(style.querySelector(':scope > div > div:last-child'));
};

test('rewriteLink prefixes internal page links and drops .html', () => {
  assert.equal(rewriteLink('/us/en/faqs.html', PREFIX), '/f52-1011-01/us/en/faqs');
  assert.equal(rewriteLink('/us/en.html', PREFIX), '/f52-1011-01/us/en');
  assert.equal(rewriteLink('https://wknd.site/ca/en/magazine.html', PREFIX), '/f52-1011-01/ca/en/magazine');
});

test('rewriteLink keeps anchors, mail, phone and external links', () => {
  ['#sign-in', 'mailto:info@wknd.com', 'tel:1-800-800-0000', 'https://stock.adobe.com/x'].forEach((href) => {
    assert.equal(rewriteLink(href, PREFIX), href);
  });
});

test('rewriteLink points assets at the source site', () => {
  assert.equal(
    rewriteLink('/content/dam/wknd-shared/en/a.pdf', PREFIX),
    'https://wknd.site/content/dam/wknd-shared/en/a.pdf',
  );
});

test('block renders rows and cells as nested divs', () => {
  assert.equal(
    block('cards filter', [['a', 'b'], ['c']]),
    '<div class="cards filter"><div><div>a</div><div>b</div></div><div><div>c</div></div></div>',
  );
});

test('home: carousel has one row per slide with image, heading and button', () => {
  const doc = convert('home', '/us/en');
  const slides = rows(doc, '.carousel:not(.image-bottom)');
  assert.equal(slides.length, 3);
  const [image, content] = cells(slides[0]);
  assert.ok(image.querySelector('picture img[alt]'));
  assert.equal(text(content.querySelector('h2')), 'WKND Adventures');
  assert.equal(content.querySelector('p > strong > a').getAttribute('href'), '/f52-1011-01/us/en/adventures');
});

test('home: single hero teaser becomes a one-slide static carousel', () => {
  const doc = convert('home', '/us/en');
  assert.ok(doc.querySelector('.carousel.image-bottom.static'));
  const slides = rows(doc, '.carousel.image-bottom');
  assert.equal(slides.length, 1);
  assert.equal(text(slides[0].querySelector('h2')), 'Climbing New Zealand');
});

test('home: featured teaser becomes columns featured with pretitle', () => {
  const doc = convert('home', '/us/en');
  const [image, content] = cells(rows(doc, '.columns.featured')[0]);
  assert.ok(image.querySelector('picture img'));
  assert.equal(text(content.querySelector('p')), 'Featured Article');
  assert.equal(text(content.querySelector('h2')), 'Camping in Western Australia');
  assert.equal(text(content.querySelector('strong > a')), 'Full Article');
});

test('home: image lists become cards with linked title and description', () => {
  const doc = convert('home', '/us/en');
  assert.equal(doc.querySelectorAll('.cards').length, 2);
  const [image, body] = cells(rows(doc, '.cards')[0]);
  assert.ok(image.querySelector('picture img'));
  const link = body.querySelector('p > a');
  assert.equal(body.querySelector('strong'), null);
  assert.equal(text(link), 'Ultimate Guide to LA Skateparks');
  assert.equal(link.getAttribute('href'), '/f52-1011-01/us/en/magazine/guide-la-skateparks');
  assert.match(text(body.querySelectorAll('p')[1]), /^Breaking down the top skate/);
});

test('home: separators end a section with the divider style', () => {
  const doc = convert('home', '/us/en');
  const styles = [...doc.querySelectorAll('.section-metadata > div')].map((r) => cells(r).map(text));
  assert.deepEqual(styles, [['Style', 'divider'], ['Style', 'divider']]);
});

test('magazine: a medium separator ends its section with the divider-medium style', () => {
  const doc = convert('magazine', '/us/en/magazine');
  const styles = [...doc.querySelectorAll('.section-metadata > div')].map((r) => text(cells(r)[1]));
  assert.ok(styles.includes('divider-medium'));
  assert.ok(!styles.includes('divider'));
});

test('home: titles and primary buttons are default content', () => {
  const doc = convert('home', '/us/en');
  assert.deepEqual([...doc.querySelectorAll('main > div > h2')].map(text), ['Recent Articles', 'Next Adventures']);
  assert.equal(text(doc.querySelector('main > div > h3')), 'Where do you want to go?');
  assert.equal(text(doc.querySelector('main > div > p > strong > a')), 'All Articles');
});

test('home: metadata carries title, description and image, no template', () => {
  const doc = convert('home', '/us/en');
  assert.equal(meta(doc, 'Title'), 'WKND Adventures and Travel');
  assert.match(meta(doc, 'Description'), /^WKND is a collective/);
  assert.ok(rows(doc, '.metadata').find((r) => text(cells(r)[0]) === 'Image').querySelector('img'));
  assert.equal(meta(doc, 'Template'), undefined);
});

test('every image src is absolute', () => {
  ['home', 'bali', 'arctic-surfing', 'about-us'].forEach((name) => {
    const srcs = [...convert(name, `/us/en/${name}`).querySelectorAll('img')].map((i) => i.getAttribute('src'));
    assert.ok(srcs.length > 0);
    srcs.forEach((src) => assert.match(src, /^https:\/\/wknd\.site\//));
  });
});

test('adventures: tabs of image lists become one filterable cards block', () => {
  const doc = convert('adventures', '/us/en/adventures');
  const cards = rows(doc, '.cards.filter');
  assert.equal(cards.length, 16);
  const bali = cards.find((r) => text(r.querySelector('a')) === 'Bali Surf Camp');
  assert.equal(text(cells(bali)[2]), 'Surfing');
  assert.equal(doc.querySelectorAll('.tabs').length, 0);
});

test('adventures: a title in a container without a grid is its own no-gutter section', () => {
  const doc = convert('adventures', '/us/en/adventures');
  const title = doc.querySelector('h1');
  assert.equal(sectionStyle(title), 'no-gutter');
  assert.equal(title.parentElement.querySelectorAll('.carousel').length, 0);
  assert.equal(sectionStyle(doc.querySelector('h2')), 'divider');
});

test('bali: facts block sits in a left aside section', () => {
  const doc = convert('bali', '/us/en/adventures/bali-surf-camp');
  const facts = rows(doc, '.facts');
  assert.equal(facts.length, 6);
  assert.deepEqual(cells(facts[5]).map(text), ['Price', '5000.0']);
  assert.equal(sectionStyle(doc.querySelector('.facts')), 'aside-left');
  assert.equal(meta(doc, 'Template'), 'adventure');
});

test('a page without an outer grid marks every section flat, a page with one does not', () => {
  const flat = convert('downhill', '/us/en/adventures/downhill-skiing-wyoming');
  const sections = [...flat.querySelectorAll('main > div')];
  assert.match(sectionStyle(flat.querySelector('.facts')), /aside-left, flat/);
  assert.match(sectionStyle(flat.querySelector('.carousel')), /flat/);
  assert.ok(sections.length > 2);
  const grid = convert('bali', '/us/en/adventures/bali-surf-camp');
  assert.equal(sectionStyle(grid.querySelector('.facts')), 'aside-left');
});

test('bali: a carousel with one slide is not static', () => {
  const doc = convert('bali', '/us/en/adventures/bali-surf-camp');
  assert.equal(doc.querySelectorAll('.carousel').length, 1);
  assert.equal(doc.querySelector('.carousel.static'), null);
});

test('bali: tabs keep labels and panel content, image carousel has no text cell', () => {
  const doc = convert('bali', '/us/en/adventures/bali-surf-camp');
  const tabs = rows(doc, '.tabs');
  assert.deepEqual(tabs.map((r) => text(cells(r)[0])), ['Overview', 'Itinerary', 'What to Bring']);
  assert.ok(cells(tabs[0])[1].querySelector('picture img'));
  assert.equal(cells(tabs[2])[1].querySelectorAll('li').length, 2);
  const slide = rows(doc, '.carousel')[0];
  assert.equal(cells(slide).length, 1);
  assert.equal(doc.querySelector('.breadcrumb, nav'), null);
});

test('article: body, quote, headings and template', () => {
  const doc = convert('arctic-surfing', '/us/en/magazine/arctic-surfing');
  assert.equal(text(doc.querySelector('h1')), 'Aloha Spirits in Northern Norway');
  assert.equal(doc.querySelectorAll('blockquote').length, 1);
  assert.deepEqual(
    [...doc.querySelectorAll('h2')].map(text),
    ['The front', 'Clear skies', 'Mythical northern lights'],
  );
  assert.equal(text(doc.querySelector('h4')), 'By Jacob Wester');
  assert.equal(meta(doc, 'Template'), 'article');
  assert.equal(meta(doc, 'Title'), 'Arctic Surfing');
});

test('article: headings written in the body text are plain, title components are not', () => {
  const plain = convert('san-diego-surf', '/us/en/magazine/san-diego-surf');
  assert.equal(text(plain.querySelectorAll('h2')[0]), "Swami's");
  assert.match(sectionStyle(plain.querySelector('h2')), /plain-headings/);
  const titled = convert('arctic-surfing', '/us/en/magazine/arctic-surfing');
  assert.doesNotMatch(sectionStyle(titled.querySelector('h2')) ?? '', /plain-headings/);
});

test('article: related list sits in an aside section after the body', () => {
  const doc = convert('arctic-surfing', '/us/en/magazine/arctic-surfing');
  const list = rows(doc, '.cards.list');
  assert.equal(list.length, 4);
  assert.equal(list[0].querySelector('a').getAttribute('href'), '/f52-1011-01/us/en/magazine/western-australia');
  assert.equal(text(cells(list[0])[0].querySelectorAll('p')[1]), 'Thursday, 9 Jul 2020');
  assert.equal(sectionStyle(doc.querySelector('.cards.list')), 'aside');
  const sections = [...doc.querySelectorAll('main > div')];
  const aside = doc.querySelector('.cards.list').closest('main > div');
  assert.ok(sections[sections.indexOf(aside) - 1].querySelector('h1'));
});

test('article: author byline shares the body section', () => {
  const doc = convert('arctic-surfing', '/us/en/magazine/arctic-surfing');
  const [image, body] = cells(rows(doc, '.cards.byline')[0]);
  assert.ok(image.querySelector('img'));
  assert.equal(text(body.querySelector('h3')), 'Jacob Wester');
  assert.equal(text(body.querySelectorAll('p')[0]), 'Skater, Writer');
  assert.equal(text(body.querySelectorAll('p')[1]), ':facebook: :twitter: :instagram:');
  assert.ok(doc.querySelector('.cards.byline').closest('main > div').querySelector('h1'));
});

test('article: download becomes a heading, description and button to the source file', () => {
  const doc = convert('la-skateparks', '/us/en/magazine/guide-la-skateparks');
  const link = doc.querySelector('p > em > a');
  assert.equal(text(link), ':download: Download PDF');
  assert.match(link.getAttribute('href'), /^https:\/\/wknd\.site\/.+\.pdf$/);
  assert.equal(text(doc.querySelectorAll('h5')[1]), 'Download PDF');
  const properties = [...link.closest('p').previousElementSibling.querySelectorAll('li')].map(text);
  assert.deepEqual(properties, ['ultimateguidetolaskateparks.pdf', '139 KB', 'application/pdf']);
});

test('article: a hidden separator in the side column adds the spaced style', () => {
  const doc = convert('la-skateparks', '/us/en/magazine/guide-la-skateparks');
  const aside = [...doc.querySelectorAll('h5')].find((h) => text(h) === 'SHARE THIS STORY');
  assert.equal(sectionStyle(aside), 'spaced, aside');
  assert.doesNotMatch(sectionStyle(doc.querySelector('h1')) ?? '', /spaced/);
});

test('faqs: accordion rows, underlined title, right aside', () => {
  const doc = convert('faqs', '/us/en/faqs');
  const items = rows(doc, '.accordion');
  assert.equal(items.length, 7);
  assert.equal(text(cells(items[0])[0]), "Who is WKND's intended audience?");
  assert.match(text(cells(items[0])[1]), /^We believe the best adventures/);
  assert.equal(sectionStyle(doc.querySelector('h1')), 'underline, inset-image');
  const help = [...doc.querySelectorAll('h3')].find((h) => text(h) === 'Need more help?');
  assert.equal(sectionStyle(help), 'spaced, small-text, aside, no-gutter');
});

test('about us: contributors merge into people cards with icon links', () => {
  const doc = convert('about-us', '/us/en/about-us');
  const groups = [...doc.querySelectorAll('.cards.people')];
  assert.deepEqual(groups.map((g) => g.children.length), [4, 3]);
  const [image, body] = cells(groups[0].children[0]);
  assert.ok(image.querySelector('picture img'));
  assert.equal(text(body.querySelector('h3')), 'Stacey Roswells');
  assert.equal(text(body.querySelectorAll('p')[0]), 'Artist | Photographer | Traveler');
  const icons = [...body.querySelectorAll('p')[1].querySelectorAll('a')];
  assert.deepEqual(icons.map(text), [':facebook:', ':twitter:', ':instagram:']);
  assert.equal(icons[0].getAttribute('href'), '#facebook-staceyroswell');
  assert.equal(sectionStyle(groups[0]), 'small-text');
});

test('magazine: locked teasers merge into one cards locked block', () => {
  const doc = convert('magazine', '/us/en/magazine');
  const locked = rows(doc, '.cards.locked');
  assert.equal(locked.length, 2);
  assert.equal(text(locked[0].querySelector('h2')), 'Alaskan Adventure');
  assert.equal(locked[0].querySelector('a'), null);
  const [first, second] = locked.map((row) => cells(row)[1]);
  assert.equal(first.querySelectorAll('p').length, 2);
  assert.equal(second.querySelectorAll('p').length, 2);
  assert.equal(first.querySelectorAll('em').length, 0);
  assert.equal(text(second.querySelector('p > em')), 'Experience the Amazon like never before');
});

test('a page without a grid has no-gutter sections; a page with a grid has none', () => {
  const members = convert('members-only', '/ca/en/magazine/members-only');
  assert.match(sectionStyle(members.querySelector('h1')), /no-gutter/);
  const faqs = convert('faqs', '/us/en/faqs');
  assert.doesNotMatch(sectionStyle(faqs.querySelector('h1')), /no-gutter/);
});

test('an image in a two-thirds phone column makes its section inset-image', () => {
  const faqs = convert('faqs', '/us/en/faqs');
  assert.match(sectionStyle(faqs.querySelector('picture')), /inset-image/);
  const about = convert('about-us', '/us/en/about-us');
  assert.doesNotMatch(sectionStyle(about.querySelector('picture')) ?? '', /inset-image/);
});

test('an aside without a grid keeps its gutter on a flat page', () => {
  const flat = convert('downhill', '/us/en/adventures/downhill-skiing-wyoming');
  assert.equal(sectionStyle(flat.querySelector('.facts')), 'aside-left, flat');
});

test('search page becomes a search block with the placeholder and the toggle label', () => {
  const doc = convert('search', '/us/en/ai-powered-search');
  const [placeholder, toggle] = rows(doc, '.search').map(text);
  assert.match(placeholder, /^Search WKND adventures/);
  assert.equal(toggle, 'Show AI-generated summary');
});

test('language stub: static hero without button', () => {
  const doc = convert('fr', '/fr/fr');
  assert.ok(doc.querySelector('.carousel.static'));
  const slide = rows(doc, '.carousel')[0];
  assert.equal(text(slide.querySelector('h2')), 'WKND Adventures and Travel - Coming Soon!');
  assert.equal(slide.querySelector('a'), null);
});

test('unknown components fail loudly with class and path', () => {
  const html = fixture('fr').replace('class="separator"', 'class="mystery"');
  assert.throws(() => convertPage(html, '/fr/fr', PREFIX), /Unknown component "mystery".*\/fr\/fr/);
});

test('nav: brand, links and tools sections', () => {
  const { document: doc } = parseHTML(convertNav(fixture('home'), PREFIX));
  const [brand, links, tools] = [...doc.querySelectorAll('main > div')];
  assert.equal(brand.querySelector('a').getAttribute('href'), '/f52-1011-01/us/en');
  assert.equal(text(brand), ':wknd-logo-dk:');
  assert.deepEqual(
    [...links.querySelectorAll('a')].map((a) => `${text(a)}=${a.getAttribute('href')}`),
    ['Home=/f52-1011-01/us/en', 'Magazine=/f52-1011-01/us/en/magazine', 'Adventures=/f52-1011-01/us/en/adventures',
      'FAQs=/f52-1011-01/us/en/faqs', 'About Us=/f52-1011-01/us/en/about-us'],
  );
  assert.equal(text(tools.querySelector('p a')), 'Sign In');
  assert.equal(tools.querySelectorAll('ul > li > ul > li > a').length, 11);
  assert.equal(tools.querySelector('a[href="/f52-1011-01/us/en/ai-powered-search"]').textContent, ':search:');
});

test('footer: brand, links, social and legal text', () => {
  const { document: doc } = parseHTML(convertFooter(fixture('home'), PREFIX));
  const [top, legal] = [...doc.querySelectorAll('main > div')];
  assert.equal(text(top.querySelector('p a')), ':wknd-logo-light:');
  assert.equal(top.querySelectorAll('ul a').length, 4);
  assert.match(text(top), /Follow Us/);
  assert.deepEqual(
    [...top.querySelectorAll('a[href^="#"]')].map((a) => `${text(a)}=${a.getAttribute('href')}`),
    [':facebook:=#facebookwknd', ':twitter:=#twitterWKND', ':instagram:=#instagramwknd'],
  );
  assert.match(text(legal), /WKND is a fictitious adventure and travel website/);
  assert.equal(legal.querySelectorAll('a').length, 5);
  assert.doesNotMatch(convertFooter(fixture('home'), PREFIX), /&#160;|&nbsp;|\u00a0/);
});

test('an empty download component maps to nothing', () => {
  const html = fixture('fr').replace('<div class="separator">', '<div class="download"> </div><div class="separator">');
  assert.doesNotThrow(() => convertPage(html, '/fr/fr', PREFIX));
});

test('pull quotes become a quote block, plain blockquotes stay default content', () => {
  const doc = convert('la-skateparks', '/us/en/magazine/guide-la-skateparks');
  const [quotation, attribution] = rows(doc, '.quote');
  assert.equal(text(quotation), '"There is no better place to shred then Los Angeles"');
  assert.equal(text(attribution), 'Jacob Wester - Pro Skater');
  assert.equal(doc.querySelector('.quote blockquote, .quote u'), null);
  const plain = convert('arctic-surfing', '/us/en/magazine/arctic-surfing');
  assert.equal(plain.querySelectorAll('.quote').length, 0);
  assert.equal(plain.querySelectorAll('main > div > blockquote').length, 1);
});

test('an image title becomes a caption in the same paragraph as the image', () => {
  const { document } = parseHTML(`<div class="image"><div class="cmp-image" data-cmp-widths="100,1600"
    data-cmp-src="/a{.width}.jpeg"><img class="cmp-image__image" src="/a.jpeg" alt="A">
    <span class="cmp-image__title">Hello</span></div></div>`);
  assert.deepEqual(walk(document.querySelector('.image'), { path: '/x', prefix: PREFIX }), [
    '<p><picture><img src="https://wknd.site/a.1600.jpeg" alt="A"></picture><em>Hello</em></p>',
  ]);
});

test('footer: every text component is kept, in order', () => {
  const { document: doc } = parseHTML(convertFooter(fixture('members-only'), PREFIX));
  const legal = [...doc.querySelectorAll('main > div')][1];
  const paragraphs = [...legal.querySelectorAll('p')].map(text);
  assert.match(paragraphs[0], /^Canadian specific footer/);
  assert.match(paragraphs[1], /2019, WKND Site/);
  assert.match(paragraphs[paragraphs.length - 1], /Adobe Stock/);
});
