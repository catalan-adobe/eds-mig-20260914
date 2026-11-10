// Turns one source page (AEM Core Components markup) into the DA document model of CONTRACT.md.
import { load } from 'cheerio';

export const FOLDER = '/f52-1011-02';
export const SOURCE = 'https://wknd.site';

const TEMPLATES = {
  'landing-page-template': 'landing',
  'content-page-template': 'content',
  'adventure-page-template': 'adventure',
  'article-page-template': 'article',
};
const KEPT_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'a', 'br',
]);
const STYLE_ORDER = ['sidebar', 'grid-4', 'text-small'];
const SKIPPED_TAGS = new Set(['script', 'style', 'link', 'meta', 'noscript']);

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
const clean = (s) => s.replace(/\s+/g, ' ').trim();
const text = ($el) => clean($el.text());
const isEmpty = (s) => !clean(s.replace(/\u00a0/g, ' '));

/** Source href to final href: internal pages lose the host and .html, the PDF moves to media. */
export function rewriteLink(href = '') {
  const path = href.replace(/^https?:\/\/(www\.)?wknd\.site(?=\/|$)/, '');
  const pdf = path.match(/^\/content\/dam\/.*\/([^/]+?\.pdf)(\.coredownload\.pdf)?$/);
  if (pdf) return `${FOLDER}/media/${pdf[1]}`;
  const page = path.match(/^(\/[a-z]{2}\/[a-z]{2}(?:\/[^?#.]*)?)\.html([?#].*)?$/);
  if (page) return `${FOLDER}${page[1]}${page[2] || ''}`;
  return href;
}

export const block = (name, rows, ...variants) => ({ name, variants, rows });

const blockHtml = (b) => `<div class="${[b.name, ...b.variants].join(' ')}">${b.rows
  .map((row) => `<div>${row.map((cell) => `<div>${cell}</div>`).join('')}</div>`).join('')}</div>`;

export class Doc {
  constructor(path) {
    this.path = path;
    this.sections = [{ items: [], styles: [] }];
    this.images = [];
    this.files = [];
    this.metaImages = 0;
    this.metadata = null;
  }

  get section() { return this.sections.at(-1); }

  push(item) { if (item) this.section.items.push(item); }

  newSection(...styles) {
    if (this.section.items.length) this.sections.push({ items: [], styles: [] });
    styles.forEach((s) => this.addStyle(s));
  }

  addStyle(style) {
    const { styles } = this.section;
    if (!styles.includes(style)) styles.push(style);
    styles.sort((a, b) => STYLE_ORDER.indexOf(a) - STYLE_ORDER.indexOf(b));
  }

  get blocks() {
    const names = this.sections.flatMap((s) => s.items).filter((i) => i.name)
      .map((i) => [i.name, ...i.variants].join(' '));
    if (this.sections.some((s) => s.styles.length)) names.push('section-metadata');
    if (this.metadata) names.push('metadata');
    return [...new Set(names)];
  }

  html() {
    const used = this.sections.filter((s) => s.items.length);
    const sections = used.map((s) => {
      const style = s.styles.length
        ? blockHtml(block('section-metadata', [['Style', s.styles.join(', ')]])) : '';
      const metadata = s === used.at(-1) && this.metadata ? blockHtml(this.metadata) : '';
      const items = s.items.map((i) => (i.name ? blockHtml(i) : i)).join('');
      return `<div>${items}${style}${metadata}</div>`;
    });
    return `<body><header></header><main>${sections.join('')}</main><footer></footer></body>`;
  }
}

/**
 * Components whose source rendition is a crop of the DAM original (component path below the
 * locale root). Found by comparing the aspect ratio of the largest rendition of every image
 * component with its `width`/`height` attributes, which describe the original.
 */
const CROPPED = new Set([
  '/adventures/climbing-new-zealand/_jcr_content/root/container/carousel/item_1571266094599',
  '/adventures/beervana-portland/_jcr_content/root/container/container/tabs'
    + '/item_1570890135033/par2/image',
  '/adventures/cycling-tuscany/_jcr_content/root/container/carousel/item_1572023766858',
  '/adventures/downhill-skiing-wyoming/_jcr_content/root/container/carousel/item_1572032225765',
  '/adventures/downhill-skiing-wyoming/_jcr_content/root/container/container/tabs'
    + '/item_1570890140330/par1/image',
  '/adventures/ski-touring-mont-blanc/_jcr_content/root/container/carousel/item_1571168422510',
  '/magazine/arctic-surfing/_jcr_content/root/container/image',
  '/magazine/members-only/alaskan-adventure/_jcr_content/root/container/image',
  '/magazine/members-only/fly-fishing-the-amazon/_jcr_content/root/container/image',
  '/magazine/san-diego-surf/_jcr_content/root/container/image',
]);

/** The largest rendition of a cropped component, or undefined when it shows the original. */
function croppedRendition($img) {
  const $cmp = $img.closest('[data-cmp-src]');
  const [component] = ($cmp.attr('data-cmp-src') || '').split('.coreimg');
  if (!CROPPED.has(component.replace(/^\/[a-z]{2}\/[a-z]{2}/, ''))) return undefined;
  const width = $cmp.attr('data-cmp-widths').split(',').pop();
  return $cmp.attr('data-cmp-src').replace('{.width}', `.${width}`);
}

/** The DAM original is the best rendition: the component `src` is capped at 1280 px. */
function picture(doc, $img) {
  const ref = $img.closest('[data-cmp-filereference]').attr('data-cmp-filereference');
  const url = SOURCE + encodeURI(croppedRendition($img) || ref || $img.attr('src'));
  const alt = $img.attr('alt') || '';
  doc.images.push({ url, alt });
  return `<picture><img src="${esc(url)}" alt="${esc(alt)}"></picture>`;
}

/** Reduces an element to the tags an author can write; returns '' when nothing is left. */
function rich($, el, { noUnderline = false } = {}) {
  const $el = $(el).clone();
  $el.find('b').each((_, e) => { e.name = 'strong'; });
  $el.find('i').each((_, e) => { e.name = 'em'; });
  $el.find('*').each((_, e) => {
    const $e = $(e);
    const nested = $e.parents(e.name).length && ['strong', 'em', 'u'].includes(e.name);
    if (!KEPT_TAGS.has(e.name) || nested || (e.name === 'u' && noUnderline)) {
      $e.replaceWith($e.contents());
      return;
    }
    const { href, title } = e.attribs;
    e.attribs = {};
    if (e.name === 'a' && href !== undefined) e.attribs.href = rewriteLink(href);
    if (e.name === 'a' && title) e.attribs.title = title;
  });
  $el.find('p, li, h1, h2, h3, h4, h5, h6, strong, em, u').each((_, e) => {
    if (isEmpty($(e).text())) $(e).remove();
  });
  let inner = $el.html().replace(/\s+/g, ' ').trim();
  inner = inner.replace(/^(<br>\s*)+|(\s*<br>)+$/g, '');
  return isEmpty($el.text()) ? '' : inner;
}

function richElement($, el) {
  const tag = el.name;
  if (!/^(p|h[1-6]|ul|ol|blockquote)$/.test(tag)) {
    throw new Error(`Unhandled rich text element <${tag}>`);
  }
  const inner = rich($, el, { noUnderline: tag.startsWith('h') });
  return inner ? `<${tag}>${inner}</${tag}>` : '';
}

/** Paragraphs of a container that may hold bare text instead of <p> elements. */
function paragraphs($, $el) {
  if (!$el.length) return '';
  if ($el.children('p, ul, ol').length) {
    return $el.children().toArray().map((e) => richElement($, e)).join('');
  }
  const inner = rich($, $el[0]);
  return inner ? `<p>${inner}</p>` : '';
}

const linkParagraph = ($a) => ($a.length
  ? `<p><a href="${esc(rewriteLink($a.attr('href')))}">${esc(text($a))}</a></p>` : '');

function socialList($, $scope) {
  const items = $scope.find('.cmp-button--icononly a.cmp-button').toArray().map((a) => {
    const $a = $(a);
    const title = $a.attr('title') || $a.attr('aria-label');
    const titleAttr = title ? ` title="${esc(title)}"` : '';
    return `<li><a href="${esc($a.attr('href'))}"${titleAttr}>${esc(text($a))}</a></li>`;
  });
  return items.length ? `<ul>${items.join('')}</ul>` : '';
}

function separatorBlock($c) {
  const variants = [];
  if ($c.hasClass('cmp-separator--hidden')) variants.push('hidden');
  if ($c.hasClass('cmp-separator--space-small')) variants.push('small');
  if ($c.hasClass('cmp-separator--space-medium')) variants.push('medium');
  return block('separator', [['']], ...variants);
}

function teaserCells($, $c, doc) {
  const $img = $c.find('.cmp-teaser__image img');
  const pre = text($c.find('.cmp-teaser__pretitle'));
  const $title = $c.find('.cmp-teaser__title');
  const body = [
    pre ? `<p>${esc(pre)}</p>` : '',
    $title.length ? `<${$title[0].name}>${esc(text($title))}</${$title[0].name}>` : '',
    paragraphs($, $c.find('.cmp-teaser__description')),
    linkParagraph($c.find('.cmp-teaser__action-link')),
  ].join('');
  const cells = [$img.length ? picture(doc, $img) : ''];
  if (body) cells.push(body);
  return cells;
}

function secureCard($, $c, doc) {
  const $img = $c.find('.cmp-teaser__image img');
  const $action = $c.find('.cmp-teaser__action-link');
  const lines = [
    text($c.find('.cmp-teaser__title')),
    text($c.find('.cmp-teaser__description')),
    $action.length ? '' : text($c.find('.cmp-teaser__action-container')),
  ].filter(Boolean).map((line) => `<p>${esc(line)}</p>`);
  return [$img.length ? picture(doc, $img) : '', lines.join('') + linkParagraph($action)];
}

function teaser($, $c, doc) {
  if ($c.hasClass('cmp-teaser--secure')) {
    const last = doc.section.items.at(-1);
    const row = secureCard($, $c, doc);
    if (last?.name === 'cards' && last.variants.includes('secure')) last.rows.push(row);
    else doc.push(block('cards', [row], 'secure'));
  } else if ($c.hasClass('cmp-teaser--hero')) {
    const variants = $c.hasClass('cmp-teaser--imagebottom') ? ['image-bottom'] : [];
    doc.push(block('hero', [teaserCells($, $c, doc)], ...variants));
  } else if ($c.hasClass('cmp-teaser--featured')) {
    doc.push(block('teaser', [teaserCells($, $c, doc)]));
  } else {
    throw new Error(`Unknown teaser style: ${$c.attr('class')}`);
  }
}

function carousel($, $c, doc) {
  const mini = $c.hasClass('cmp-carousel--mini');
  const rows = $c.find('.cmp-carousel__item').toArray().map((item) => {
    const $teaser = $(item).find('.teaser');
    if ($teaser.length) return teaserCells($, $teaser, doc);
    return [picture(doc, $(item).find('img').first())];
  });
  doc.push(block('hero', rows, ...(mini ? ['mini'] : [])));
}

const cardRows = ($, $list, doc) => $list.find('.cmp-image-list__item').toArray().map((li) => {
  const $li = $(li);
  const $img = $li.find('img');
  const description = text($li.find('.cmp-image-list__item-description'));
  return [
    $img.length ? picture(doc, $img) : '',
    linkParagraph($li.find('.cmp-image-list__item-title-link'))
      + (description ? `<p>${esc(description)}</p>` : ''),
  ];
});

/** Runs fn against an empty section and returns what it produced as cell HTML. */
function capture(doc, fn) {
  const saved = doc.sections;
  doc.sections = [{ items: [], styles: [] }];
  fn();
  const { items } = doc.sections[0];
  const nested = doc.sections.length > 1 || items.some((i) => i.name);
  doc.sections = saved;
  if (nested) throw new Error(`${doc.path}: a block or section inside a block cell`);
  return items.join('');
}

function tabs($, $c, doc, walk) {
  const labels = $c.find('.cmp-tabs__tab').toArray().map((t) => esc(text($(t))));
  const panels = $c.find('.cmp-tabs__tabpanel').toArray();
  if ($c.find('.cmp-image-list').length) {
    const rows = panels.flatMap((p, i) => [[labels[i]], ...cardRows($, $(p), doc)]);
    doc.push(block('cards', rows, 'tabs'));
    return;
  }
  doc.push(block('tabs', panels.map((p, i) => [labels[i], capture(doc, () => walk(p))])));
}

function accordion($, $c, doc, walk) {
  const rows = $c.find('.cmp-accordion__item').toArray().map((item) => [
    esc(text($(item).find('.cmp-accordion__title'))),
    capture(doc, () => walk($(item).find('.cmp-accordion__panel')[0])),
  ]);
  doc.push(block('accordion', rows));
}

function download($, $c, doc) {
  const $link = $c.find('.cmp-download__title-link');
  if (!$link.length) return;
  doc.files.push(SOURCE + $link.attr('href').replace(/\.coredownload\.pdf$/, ''));
  const rows = [[linkParagraph($link).replace(/^<p>|<\/p>$/g, '')]];
  const description = text($c.find('.cmp-download__description'));
  if (description) rows.push([esc(description)]);
  $c.find('.cmp-download__property').each((_, p) => {
    rows.push([esc(text($(p).find('dt'))), esc(text($(p).find('dd')))]);
  });
  doc.push(block('download', rows));
}

function quote($, $c, doc) {
  const parts = $c.find('.cmp-text').children().toArray()
    .map((e) => rich($, e, { noUnderline: true }))
    .filter(Boolean);
  doc.push(block('quote', [[parts.map((p) => `<p>${p}</p>`).join('')]]));
}

function titleComponent($, $c, doc) {
  const $h = $c.find('.cmp-title__text');
  const tag = $h[0].name;
  const label = esc(text($h));
  if (!label) return;
  const fragmentLink = (i) => typeof i === 'string' && i.includes(`${FOLDER}/fragments/`);
  if (doc.section.items.some(fragmentLink)) doc.newSection();
  doc.push(`<${tag}>${$c.hasClass('cmp-title--underline') ? `<u>${label}</u>` : label}</${tag}>`);
}

function image($, $c, doc) {
  const $img = $c.find('img');
  if (!$img.length) return;
  const pic = picture(doc, $img);
  const caption = text($c.find('.cmp-image__title'));
  const narrow = /aem-GridColumn--default--([1-9]|1[01])( |$)/.test($c.attr('class'));
  const last = doc.section.items.at(-1);
  if (narrow && !caption && $c.prev().is('.image') && typeof last === 'string'
    && /^<p><picture>.*<\/picture><\/p>$/.test(last)) {
    doc.section.items[doc.section.items.length - 1] = last.replace(/<\/p>$/, `${pic}</p>`);
    return;
  }
  doc.push(`<p>${pic}</p>`);
  if (caption) doc.push(`<p><em>${esc(caption)}</em></p>`);
}

function contributor($, $c, doc, fragments) {
  const slug = $c.find('.cmp-experiencefragment').attr('class')
    .match(/cmp-experiencefragment--([\w-]+)/)[1];
  const byline = $c.find('.cmp-byline').length > 0;
  const path = `/fragments/contributors/${slug}${byline ? '-byline' : ''}`;
  if (!fragments.has(path)) {
    const frag = new Doc(path);
    const $sep = $c.find('.separator');
    if ($sep.length) frag.push(separatorBlock($sep));
    const name = text($c.find(byline ? '.cmp-byline__name' : 'h3'));
    const roles = text($c.find(byline ? '.cmp-byline__occupations' : 'h5'));
    const body = `<h3>${esc(name)}</h3>${roles ? `<p>${esc(roles)}</p>` : ''}${socialList($, $c)}`;
    const cells = [picture(frag, $c.find('img').first()), body];
    frag.push(block('contributor', [cells], ...(byline ? ['byline'] : [])));
    fragments.set(path, frag);
  }
  if (!byline) doc.addStyle('grid-4');
  doc.push(`<p><a href="${FOLDER}${path}">${FOLDER}${path}</a></p>`);
}

function contentFragment($, $c, doc, walk) {
  if ($c.hasClass('cmp-contentfragment--elements')) {
    const rows = $c.find('.cmp-contentfragment__element').toArray()
      .map((e) => [esc(text($(e).find('dt'))), esc(text($(e).find('dd')))]);
    // not a grid column on eight adventures: the foundation lays these pages out differently
    const variants = $c.hasClass('aem-GridColumn') ? [] : ['wide'];
    doc.push(block('adventure-details', rows, ...variants));
    return;
  }
  $c.find('.cmp-contentfragment__elements').first().children().contents()
    .each((_, node) => {
      if (node.type === 'text' && isEmpty(node.data)) return;
      if (node.type === 'text') throw new Error(`${doc.path}: bare text in content fragment`);
      if (node.name !== 'div') doc.push(richElement($, node));
      else if ($(node).is('.aem-Grid') || $(node).find('.aem-Grid').length) walk(node);
      else doc.push(paragraphs($, $(node)));
    });
}

function textComponent($, $c, doc) {
  if ($c.hasClass('cmp-text--quote')) {
    quote($, $c, doc);
    return;
  }
  if ($c.hasClass('cmp-text--font-small')) doc.addStyle('text-small');
  $c.find('.cmp-text').children().each((_, e) => doc.push(richElement($, e)));
}

const isSidebar = ($c) => $c.hasClass('cmp-layoutcontainer--sidebar')
  || ($c.hasClass('container') && $c.hasClass('aem-GridColumn--default--3')
    && $c.hasClass('aem-GridColumn--offset--default--1'));

function makeWalker($, doc, fragments, template) {
  const walk = (el) => $(el).contents().each((_, c) => {
    if (c.type === 'tag') component($(c));
    else if (c.type === 'text' && !isEmpty(c.data)) {
      throw new Error(`${doc.path}: unhandled text "${clean(c.data).slice(0, 60)}"`);
    }
  });
  const handlers = [
    ['experiencefragment', ($c) => contributor($, $c, doc, fragments)],
    ['title', ($c) => titleComponent($, $c, doc)],
    ['text', ($c) => textComponent($, $c, doc)],
    ['teaser', ($c) => teaser($, $c, doc)],
    ['carousel', ($c) => carousel($, $c, doc)],
    ['image-list', ($c) => doc.push(block('cards', cardRows($, $c, doc)))],
    ['tabs', ($c) => tabs($, $c, doc, walk)],
    ['accordion', ($c) => accordion($, $c, doc, walk)],
    ['separator', ($c) => doc.push(separatorBlock($c))],
    ['download', ($c) => download($, $c, doc)],
    ['contentfragment', ($c) => contentFragment($, $c, doc, walk)],
    ['image', ($c) => image($, $c, doc)],
    ['cmp-list--upnext', ($c) => doc.push(block('up-next', $c.find('.cmp-list__item-link')
      .toArray().map((a) => [
        linkParagraph($(a).clone().find('.cmp-list__item-date').remove()
          .end())
          .replace(/^<p>|<\/p>$/g, ''),
        esc(text($(a).find('.cmp-list__item-date'))),
      ])))],
    ['contentaisearch', ($c) => doc.push(block('search', [[
      esc($c.find('.cmp-contentaisearch__input').attr('placeholder') || ''),
    ]]))],
    ['button', ($c) => {
      if (!$c.hasClass('cmp-button--primary')) throw new Error('Unknown button style');
      doc.push(linkParagraph($c.find('a')).replace(/(<a.*<\/a>)/, '<strong>$1</strong>'));
    }],
  ];

  function component($c) {
    const el = $c[0];
    if (SKIPPED_TAGS.has(el.name) || $c.is('.breadcrumb, .sharing')) return;
    if (isSidebar($c)) doc.newSection('sidebar');
    const handler = handlers.find(([cls]) => $c.hasClass(cls));
    if (handler) handler[1]($c);
    else if (!$c.children().length && !isEmpty($c.text())) {
      throw new Error(`${doc.path}: unhandled content <${el.name} class="${$c.attr('class')}">`);
    } else walk(el);
    const sectionEnds = (template === 'adventure' && $c.hasClass('carousel'))
      || (template === 'article' && doc.sections.length === 1 && $c.hasClass('image'));
    if (sectionEnds) doc.newSection();
  }
  return walk;
}

function metadataBlock($, doc, template) {
  const meta = (sel) => clean($(sel).attr('content') || '');
  const rows = [['Title', esc(clean($('title').text()))]];
  if (meta('meta[name="description"]')) {
    rows.push(['Description', esc(meta('meta[name="description"]'))]);
  }
  if (meta('meta[name="keywords"]')) rows.push(['Keywords', esc(meta('meta[name="keywords"]'))]);
  rows.push(['Template', template]);
  const og = meta('meta[property="og:image"]');
  if (og) {
    const alt = meta('meta[property="og:image:alt"]');
    doc.images.push({ url: og, alt });
    doc.metaImages = 1;
    rows.push(['Image', `<picture><img src="${esc(og)}" alt="${esc(alt)}"></picture>`]);
  }
  return block('metadata', rows);
}

/** The 404 body is two source columns; the contract authors it as one `columns` block. */
function errorPage($, $main, doc, walk) {
  $main.find('.separator').remove();
  const $picture = $main.find('.image').last();
  const textCell = capture(doc, () => walk($picture.prev()[0]));
  doc.push(block('columns', [[textCell, picture(doc, $picture.find('img'))]]));
}

/**
 * Converts one source page.
 * @param {string} html source HTML
 * @param {string} sourcePath for example /us/en/faqs.html
 * @param {Map<string, Doc>} fragments shared registry, filled with contributor fragments
 * @returns {{doc: Doc, $: object, meta: object}} the document, the parsed source, head values
 */
export function convertPage(html, sourcePath, fragments) {
  const $ = load(html);
  const doc = new Doc(sourcePath.replace(/\.html$/, ''));
  const template = TEMPLATES[$('meta[name="template"]').attr('content')];
  if (!template) throw new Error(`${sourcePath}: unknown template`);
  const $main = $('body main').first();
  const walk = makeWalker($, doc, fragments, template);
  if (doc.path.endsWith('/errors/404')) errorPage($, $main, doc, walk);
  else walk($main[0]);
  doc.metadata = metadataBlock($, doc, template);
  const content = (sel) => clean($(sel).attr('content') || '');
  return {
    doc,
    $,
    meta: {
      title: clean($('title').text()),
      description: content('meta[name="description"]'),
      image: content('meta[property="og:image"]'),
      keywords: content('meta[name="keywords"]'),
    },
  };
}

function navList($, $ul) {
  const items = $ul.children('li').toArray().map((li) => {
    const $li = $(li);
    const $a = $li.children('a');
    const label = $a.length
      ? `<a href="${esc(rewriteLink($a.attr('href')))}">${esc(text($a))}</a>`
      : esc(text($li.children('span')));
    const $sub = $li.children('ul');
    return `<li>${label}${$sub.length ? navList($, $sub) : ''}</li>`;
  });
  return `<ul>${items.join('')}</ul>`;
}

/** Builds `<root>/nav` and `<root>/footer` from the header and footer of a locale root page. */
export function convertChrome($, root) {
  const home = `<p><a href="${FOLDER}${root}">WKND</a></p>`;
  const nav = new Doc(`${root}/nav`);
  const $header = $('header.cmp-experiencefragment--header');
  nav.push(home);
  nav.newSection();
  nav.push(navList($, $header.find('.cmp-navigation > ul')));
  nav.newSection();
  nav.push(linkParagraph($header.find('.wknd-sign-in-buttons__button--sign-in')));
  nav.push(navList($, $header.find('.cmp-languagenavigation > ul')));
  const search = rewriteLink($header.find('.cmp-button--header-search a').attr('href'));
  nav.push(`<p><a href="${esc(search)}">Search</a></p>`);

  const footer = new Doc(`${root}/footer`);
  const $footer = $('footer.cmp-experiencefragment--footer');
  footer.push(home);
  footer.push(navList($, $footer.find('.cmp-navigation > ul')));
  const $h = $footer.find('.cmp-title__text').first();
  footer.push(`<${$h[0].name}>${esc(text($h))}</${$h[0].name}>`);
  footer.push(socialList($, $footer));
  $footer.find('.cmp-text').children().each((_, e) => footer.push(richElement($, e)));
  return [nav, footer];
}

/** Builds the sign-in dialog fragment from the source experience fragment. */
export function convertSignIn(html) {
  const $ = load(html);
  const doc = new Doc('/fragments/sign-in');
  const heading = (tag, underline) => {
    const label = esc(text($(`${tag}.cmp-title__text`)));
    return `<${tag}>${underline ? `<u>${label}</u>` : label}</${tag}>`;
  };
  doc.push(heading('h1', true));
  doc.push(heading('h3', false));
  const fields = $('input.cmp-form-text__text').toArray()
    .map((i) => `<li>${esc($(i).attr('placeholder'))}</li>`);
  doc.push(`<ul>${fields.join('')}</ul>`);
  doc.push(linkParagraph($('.cmp-text a')));
  doc.push(`<p><strong>${esc(text($('.cmp-form-button')))}</strong></p>`);
  return doc;
}
