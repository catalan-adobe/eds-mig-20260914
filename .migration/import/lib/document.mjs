// Builds one document: walks the components of a root element, hands each to its transform and
// assembles the sections. The context it gives a transform is described in ../README.md.
import {
  SITE, languageRoot,
} from './config.mjs';
import { createCleaner, escapeAttr, escapeHtml } from './clean.mjs';
import { rewriteLink, videoLink } from './links.mjs';
import { pickSource } from './media.mjs';
import {
  childComponents, classesOf, componentName, isComponent, ownerOf,
} from './page.mjs';
import {
  applyBand, block, countBlocks, flatten, mergeItems, rowConflicts, section, settle, toSections,
} from './sections.mjs';
import { snapshot } from './snapshot.mjs';

const STYLE_OF = { 'light-grey-bg': 'light-grey', 'white-bg': 'white' };
const BLOG_FOOTER = {
  en: /^chip-design-(article|author|landing)-page$/,
  'zh-cn': /^chip-design-/,
};

const nodeOf = (el) => (el?.cheerio ? el[0] : el);

/** Section styles of a component's own background wrapper: light-grey, top-sm, bottom-md. */
function stylesOf($, el) {
  const wrapper = $(el).find('.background-component').toArray()
    .find((w) => (isComponent(el) ? ownerOf(w) === el : true));
  return classesOf(wrapper ?? {}).map((c) => STYLE_OF[c]
    ?? c.match(/^vert-pad-(top|bottom)-(xs|sm|md)$/)?.slice(1).join('-')).filter(Boolean);
}

/** Rows of the metadata block from the page head; `extra` holds what the transforms set. */
function metadataRows(page, extra) {
  const { $ } = page;
  const meta = (name) => ($(`meta[name="${name}"], meta[property="${name}"]`).attr('content') ?? '')
    .trim();
  const image = (url) => {
    const src = url && pickSource(url, page.path);
    return src ? `<img src="${escapeAttr(src)}" alt="">` : '';
  };
  const text = (value) => escapeHtml(value);
  const rows = [
    ['title', text($('head title').text().trim())],
    ['description', text(meta('description'))],
    ['image', image(meta('og:image'))],
    ['template', text(page.template)],
    ['nav', page.chrome.includes('landing-page-topnav') ? `${SITE}/nav-landing` : ''],
    ['footer', page.chrome.includes('landing-page-footer') ? `${SITE}/footer-landing`
      : BLOG_FOOTER[page.lang]?.test(page.template) && `${languageRoot(page.lang)}/footer-blog`],
    ['content-type', text(meta('searchContentType'))],
    ['business-area', text(meta('searchBusinessArea'))],
    ['product-category', text(meta('searchProductCategory'))],
    ['solution-type', text(meta('searchSolutionType'))],
    ['marketing-stage', text(meta('searchMarketingStageType'))],
    ['thumbnail', image(meta('searchImage'))],
    ['robots', text(meta('robots'))],
  ];
  extra.forEach((value, key) => {
    const row = rows.find((r) => r[0] === key);
    if (row) row[1] = value;
    else rows.push([key, value]);
  });
  return rows.filter(([, value]) => value);
}

/** The link, image and markup helpers of one document. */
function helpers(page, warn) {
  const { $ } = page;
  const link = (href) => rewriteLink(href, page.path);
  const image = (src, alt) => {
    const node = nodeOf(src);
    const url = node && pickSource(node, page.path);
    if (!url) return '';
    const text = alt ?? (typeof node === 'string' ? '' : node.attribs.alt ?? '');
    return `<img src="${escapeAttr(url)}" alt="${escapeAttr(text.trim())}">`;
  };
  const cleaner = createCleaner({
    $, link, image, warn,
  });
  const table = (node) => {
    const header = $(node).find('thead, th').length ? ['header'] : [];
    return block('table', header, cleaner.rows(node));
  };
  return {
    link, image, cleaner, table,
  };
}

/** What every transform of a document gets; `render` adds the parts bound to a component. */
function baseContext(doc, {
  link, image, cleaner, table,
}) {
  const { page, env, source } = doc;
  const { $ } = page;
  return {
    $,
    page: {
      path: page.path, lang: page.lang, template: page.template, fragment: doc.fragment,
    },
    block,
    section,
    link,
    image,
    video: (el) => videoLink(nodeOf(el)?.attribs),
    clean: (el, { inline = false } = {}) => $(el).toArray()
      .map((node) => (inline ? cleaner.inline(node) : cleaner.parts(node).join(''))).join(''),
    content: (el) => $(el).toArray().flatMap((node) => cleaner.parts(node, { table })),
    styles: (el) => stylesOf($, nodeOf(el)),
    merge: (sections, ...variants) => mergeItems(sections, variants),
    band: (sections, styles) => applyBand(sections, styles),
    flat: (sections) => flatten(sections),
    drop: (el, reason) => $(el).toArray().forEach((node) => source.exclude(node, reason)),
    meta: (key, value) => doc.metas.set(key, value),
    fragment(el, name) {
      const node = nodeOf(el);
      const entry = env.registry.lookup(page.lang, name, $, node);
      if (!entry) return null;
      if (!env.built.has(entry.path)) {
        env.built.add(entry.path);
        // eslint-disable-next-line no-use-before-define
        doc.fragments.push(buildDocument(page, env, { root: node, fragment: entry.path }));
      }
      source.exclude(node, `fragment ${entry.path}`);
      const href = SITE + entry.path;
      return block('fragment', [], [[`<a href="${href}">${href}</a>`]]);
    },
  };
}

/**
 * Builds the document of `root` (default: the page). Returns { path, kind, sections,
 * metadata, report, source, fragments }: `source` is the snapshot for the content check,
 * `fragments` the documents of the shared fragments found on the way.
 * @param {object} page from loadPage()
 * @param {object} env { transforms: Map, registry, built: Set of fragment paths }
 */
export function buildDocument(page, env, { root = page.root, fragment } = {}) {
  const { $ } = page;
  const report = { components: {}, fallbacks: {}, warnings: [] };
  const doc = {
    page, env, fragment, source: snapshot(root), metas: new Map(), fragments: [],
  };
  const warn = (message) => report.warnings.push(message);
  const count = (bag, name) => { bag[name] = (bag[name] ?? 0) + 1; };
  const tools = helpers(page, warn);
  const base = baseContext(doc, tools);
  let render;
  const children = (scope) => settle(mergeItems(childComponents(nodeOf(scope)).flatMap(render)));

  /** Default content of a component; nested components keep their own transforms. */
  function fallback(el) {
    const stop = (node) => (node !== el && isComponent(node) ? { component: node } : null);
    const out = [];
    let open = null;
    tools.cleaner.parts(el, { stop, table: tools.table }).forEach((part) => {
      if (part.component) {
        out.push(...render(part.component));
        open = null;
      } else {
        if (!open) {
          open = section([], { styles: out.length ? [] : stylesOf($, el) });
          out.push(open);
        }
        open.content.push(part);
      }
    });
    return out.length ? out : [section([], { styles: stylesOf($, el) })];
  }

  render = (el) => {
    const name = componentName(el);
    const transform = env.transforms.get(name);
    count(report.components, name);
    if (!transform) {
      count(report.fallbacks, name);
      return fallback(el);
    }
    const ctx = Object.assign(Object.create(base), {
      el,
      name,
      warn: (message) => warn(`${name}: ${message}`),
      children: (scope = el) => children(scope),
      fallback: (node = el) => fallback(nodeOf(node)),
    });
    try {
      return toSections(transform(el, ctx), stylesOf($, el));
    } catch (e) {
      e.message = `components/${name}.mjs: ${e.message}`;
      throw e;
    }
  };

  const sections = settle(children(root), { last: true });
  Object.entries(report.fallbacks)
    .forEach(([name, n]) => warn(`${name}: no transform, ${n} as default content`));
  const glued = rowConflicts(sections).length;
  if (glued) warn(`section grid: ${glued} rows follow a row that is not full and would join it`);
  Object.assign(report, {
    blocks: countBlocks(sections), sections: sections.length, excluded: doc.source.excluded,
  });
  return {
    path: fragment ?? page.path,
    kind: fragment ? 'fragment' : 'page',
    sections,
    metadata: fragment ? [] : metadataRows(page, doc.metas),
    report,
    source: doc.source,
    fragments: doc.fragments.flatMap((f) => [f, ...f.fragments]),
  };
}
