// Source markup to the markup DA documents hold: p, h1-h6, ul, ol, a, img, strong, em, u, sub,
// sup, br, code. No class, no style, no span. Buttons, icons and linked images are written as
// CONTRACT.md a) defines them.
import { decodeEmail } from './links.mjs';

const SKIP = new Set(['script', 'style', 'link', 'meta', 'noscript', 'template', 'head', 'title',
  'input', 'select', 'textarea', 'canvas', 'map', 'object']);
const MARK = {
  b: 'strong',
  strong: 'strong',
  i: 'em',
  em: 'em',
  u: 'u',
  sub: 'sub',
  sup: 'sup',
  code: 'code',
  s: 'del',
  strike: 'del',
  del: 'del',
};
const PHRASE = new Set([...Object.keys(MARK), 'a', 'span', 'font', 'small', 'big', 'abbr', 'cite',
  'label', 'mark', 'q', 'ins', 'kbd', 'var', 'tt', 'nobr', 'wbr', 'button', 'time', 'img', 'br']);
const EMBED = new Set(['iframe', 'video', 'audio', 'embed']);
const BLOCKS = 'p,div,ul,ol,table,h1,h2,h3,h4,h5,h6,section,article,blockquote,pre,hr,iframe';
// Font Awesome classes that style an icon; any other fa-<name> is the icon's name
const FA_STYLE = new RegExp(`^fa-(${['regular', 'solid', 'light', 'thin', 'duotone', 'brands',
  'sharp', 'kit', 'fw', 'lg', 'xs', 'sm', 'xl', '2xs', '2xl', '\\d+x', 'spin', 'pulse', 'border',
  'inverse', 'li', 'ul', 'pull-.*', 'rotate-.*', 'flip-.*', 'stack.*'].join('|')})$`);
// paragraph break inside inline output, and the mark of a real button
const PARA = '\u0001';
const BUTTON = '\u0002';

const classesOf = (node) => (node.attribs?.class ?? '').split(/\s+/).filter(Boolean);
export const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/\u00a0/g, '&nbsp;');
export const escapeAttr = (text) => escapeHtml(text).replace(/"/g, '&quot;');
const collapse = (text) => text.replace(/[ \t\r\n\f]+/g, ' ');
const EDGE = /^(?:\s|&nbsp;|<br>)+|(?:\s|&nbsp;|<br>)+$/g;
const trimEdges = (html) => html.replace(EDGE, '');
// html as [all, spaces and breaks before, body, spaces and breaks after]
const EDGES = /^((?:\s|&nbsp;|<br>)*)([\s\S]*?)((?:\s|&nbsp;|<br>)*)$/;
const hasContent = (html) => /<img\b/.test(html)
  || html.replace(/<[^>]+>/g, '').replace(/&nbsp;|\s/g, '') !== '';

/** `:name:` for a Font Awesome icon element (<i class="fa-regular fa-chevron-right">). */
function iconOf(node) {
  if (!['i', 'span'].includes(node.name) || node.children.some((c) => c.type === 'tag')) return '';
  const fa = classesOf(node).find((c) => c.startsWith('fa-') && !FA_STYLE.test(c));
  return fa ? `:${fa.slice(3)}:` : '';
}

/** Wraps inline html in a tag, keeping paragraph breaks and outer spaces outside of it. */
function wrap(tag, html) {
  return html.split(PARA).map((piece) => {
    if (!hasContent(piece) || piece.startsWith(BUTTON)) return piece;
    const [, before, body, after] = piece.match(EDGES);
    return `${before}<${tag}>${body}</${tag}>${after}`;
  }).join(PARA);
}

// the pipeline adds a space to a no-break space beside an inline element: a plain one stays one
const INLINE = '(?:strong|em|u|a|sub|sup|code|del)';
const NBSP_BEFORE = new RegExp(`&nbsp;(?=<${INLINE}\\b)`, 'g');
const NBSP_AFTER = new RegExp(`(</${INLINE}>)&nbsp;`, 'g');

/**
 * A bold or italic link alone in a paragraph would become a button: it is body text. The
 * emphasis goes, around the link (<b><a>) and inside it (<a><b>, which DA turns around).
 */
function plainLoneLink(piece) {
  const around = piece.match(/^<(strong|em)>(<a [^>]*>[\s\S]*<\/a>)<\/\1>$/);
  if (around) return /<\/a>[\s\S]*<a /.test(around[2]) ? piece : around[2];
  const inside = piece.match(/^(<a [^>]*>)<(strong|em)>([\s\S]*)<\/\2><\/a>$/);
  const single = inside && !inside[3].includes(`</${inside[2]}>`) && !inside[3].includes('</a>');
  return single ? `${inside[1]}${inside[3]}</a>` : piece;
}

/** Splits inline html at its paragraph breaks; drops what is empty. */
function paragraphs(html) {
  return html.split(PARA).map(trimEdges).filter(hasContent).map((piece) => {
    if (piece.startsWith(BUTTON)) return piece.slice(1);
    return plainLoneLink(piece).replace(NBSP_BEFORE, ' ').replace(NBSP_AFTER, '$1 ');
  });
}

/** The inline side of the cleaner: { inner, inline, list }. */
function phrases(env) {
  let inline;
  const inner = (node) => node.children.map((c) => inline(c)).join('');

  function anchor(node) {
    const own = node.attribs['data-cfemail'];
    const html = own ? escapeHtml(decodeEmail(own)) : inner(node);
    const email = own ?? env.$(node).find('[data-cfemail]').attr('data-cfemail');
    const href = email ? `mailto:${decodeEmail(email)}` : env.link(node.attribs.href);
    if (!href) return html;
    const images = html.match(/<img\b[^>]*>/g) ?? [];
    let text = trimEdges(collapse(html.replace(/<img\b[^>]*>/g, '').replaceAll(PARA, ' ')
      .replaceAll(BUTTON, '').replace(/<br>/g, ' ')));
    text = text.replace(/(\S)(:[a-z0-9-]+:)$/, '$1 $2');
    const cls = classesOf(node);
    if (cls.includes('has-arrow') && !/:[a-z0-9-]+:$/.test(text)) text += ' :chevron-right:';
    // spaces at the edges of the link text separate words: they move outside of the link
    const [before, after] = [/^(\s|&nbsp;)/.test(html) ? ' ' : '',
      /(\s|&nbsp;)$/.test(html) ? ' ' : ''];
    const a = `${before}<a href="${escapeAttr(href)}">${text || escapeHtml(href)}</a>${after}`;
    if (images.length) return `${PARA}${images.join('')}${PARA}${a}${PARA}`;
    if (!text) return before || after;
    if (cls.some((c) => ['component-button', 'btn'].includes(c))) {
      const tag = cls.some((c) => ['secondary', 'btn-secondary'].includes(c)) ? 'em' : 'strong';
      return `${PARA}${BUTTON}<${tag}>${a}</${tag}>${PARA}`;
    }
    return cls.includes('cta-link') ? `${PARA}${BUTTON}${a}${PARA}` : a;
  }

  /** A Cloudflare-protected address: its text, and a mailto link when it has no link. */
  function emailOf(node) {
    const address = escapeHtml(decodeEmail(node.attribs['data-cfemail']));
    return env.$(node).closest('a').length ? address : `<a href="mailto:${address}">${address}</a>`;
  }

  inline = (node) => {
    if (node.type === 'text') return escapeHtml(collapse(node.data));
    if (node.type !== 'tag' || SKIP.has(node.name) || node.name === 'svg') return '';
    if (node.name === 'br') return '<br>';
    if (node.name === 'img') return env.image(node);
    if (node.name === 'a') return anchor(node);
    if (node.attribs['data-cfemail']) return emailOf(node);
    const icon = iconOf(node);
    if (icon) return icon;
    if (MARK[node.name]) return wrap(MARK[node.name], inner(node));
    return PHRASE.has(node.name) ? inner(node) : `${PARA}${inner(node)}${PARA}`;
  };

  let list;
  /** The html of one list item: inline content, nested lists kept. */
  function item(li) {
    const html = li.children.map((c) => (['ul', 'ol'].includes(c.name) ? list(c) : inline(c)))
      .join('');
    return paragraphs(html).join('<br>').replace(/<br>(?=<[uo]l>)|(?<=<\/[uo]l>)<br>/g, '');
  }
  list = (node) => {
    const items = [];
    const collect = (parent) => parent.children.forEach((c) => {
      if (c.name === 'li') items.push(item(c));
      // a list directly inside a list belongs to the item before it
      else if (['ul', 'ol'].includes(c.name)) items.push(`${items.pop() ?? ''}${list(c)}`);
      else if (c.type === 'tag' && env.$(c).find('li').length) collect(c);
      else {
        // loose content between the items joins the item before it
        const loose = paragraphs(inline(c)).join('<br>');
        if (loose) items.push([items.pop(), loose].filter(Boolean).join('<br>'));
      }
    });
    collect(node);
    const filled = items.filter(Boolean);
    return filled.length
      ? `<${node.name}>${filled.map((i) => `<li>${i}</li>`).join('')}</${node.name}>` : '';
  };
  return { inner, inline, list };
}

/** A heading whose whole content is one element with a font size of body text: a paragraph. */
function isSmallPrint(node) {
  const filled = node.children.filter((c) => c.type === 'tag' || c.data?.trim());
  const size = filled.length === 1 && filled[0].type === 'tag'
    && (filled[0].attribs.style ?? '').match(/font-size:\s*(\d+)px/)?.[1];
  return !!size && Number(size) <= 18;
}

/** A line of text the author wrote as a bare <div>: the source draws it without a margin. */
const isLine = (node, $) => node?.name === 'div' && !Object.keys(node.attribs).length
  && !$(node).find(`${BLOCKS},img`).length;

function previousElement(node) {
  let { prev } = node;
  while (prev && prev.type !== 'tag') {
    if (prev.type === 'text' && prev.data.trim()) return null;
    prev = prev.prev;
  }
  return prev;
}

/**
 * The parts of an element: html strings, and for each element that `options.stop(node)`
 * or `options.table(node)` claims, what that function returns.
 */
function blockParts(root, options, env, { inner, inline, list }) {
  const out = [];
  let buffer = '';
  const flush = () => {
    paragraphs(buffer).forEach((p) => out.push(`<p>${p}</p>`));
    buffer = '';
  };
  const push = (part) => {
    flush();
    if (part) out.push(part);
  };
  const heading = (node) => {
    if (isSmallPrint(node)) {
      flush();
      buffer = inner(node);
      flush();
      return;
    }
    const html = inner(node).replaceAll(PARA, ' ').replaceAll(BUTTON, '');
    const text = trimEdges(html.replace(/<img\b[^>]*>/g, ''));
    push(hasContent(text) ? `<${node.name}>${text}</${node.name}>` : '');
    (html.match(/<img\b[^>]*>/g) ?? []).forEach((img) => push(`<p>${img}</p>`));
  };
  const svg = (node) => {
    const labels = env.$(node).find('text').toArray().map((t) => env.$(t).text().trim());
    if (labels.some(Boolean)) env.warn('inline SVG: only its text is kept');
    labels.filter(Boolean).forEach((label) => push(`<p>${escapeHtml(label)}</p>`));
  };
  const embed = (node) => {
    const src = node.attribs.src ?? env.$(node).find('source').attr('src');
    env.warn(`${node.name} element is not migrated: ${src ?? 'no src'}`);
    const href = src && env.link(src);
    push(href ? `<p><a href="${escapeAttr(href)}">${escapeHtml(href)}</a></p>` : '');
  };
  const handlers = {
    ul: (node) => push(list(node)),
    ol: (node) => push(list(node)),
    pre: (node) => push(`<pre>${escapeHtml(env.$(node).text())}</pre>`),
    svg,
    ...(options.table ? { table: (node) => push(options.table(node)) } : {}),
  };
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((h) => { handlers[h] = heading; });
  EMBED.forEach((name) => { handlers[name] = embed; });
  const isPhrase = (node) => PHRASE.has(node.name)
    && (node.name === 'a' || !env.$(node).find(BLOCKS).length);
  // the last bare <div> line and the index of its paragraph: the next line joins it with <br>
  let line = null;
  const lineOf = (node) => {
    flush();
    const joins = line && line.node === previousElement(node) && line.index === out.length - 1;
    const start = out.length;
    buffer = inner(node);
    flush();
    if (out.length !== start + 1 || !out[start].startsWith('<p>')) line = null;
    else if (joins) {
      out[start - 1] = `${out[start - 1].slice(0, -4)}<br>${out.pop().slice(3)}`;
      line = { node, index: start - 1 };
    } else line = { node, index: start };
  };
  const visit = (node) => {
    if (node.type === 'text') buffer += escapeHtml(collapse(node.data));
    if (node.type !== 'tag' || SKIP.has(node.name)) return;
    const claimed = options.stop?.(node);
    if (claimed) push(claimed);
    else if (handlers[node.name]) handlers[node.name](node);
    else if (isPhrase(node)) buffer += inline(node);
    else if (isLine(node, env.$)) lineOf(node);
    else {
      // a block starts and ends a paragraph; a phrase element around blocks does not
      const paragraph = !PHRASE.has(node.name);
      if (paragraph) flush();
      if (node.name === 'table') env.warn('table flattened to paragraphs');
      node.children.forEach(visit);
      if (paragraph) flush();
    }
  };
  visit(root);
  flush();
  return out;
}

/**
 * Creates the cleaner of one document.
 * @param {object} env { $, link(href) => href, image(imgNode) => '<img …>', warn(message) }
 */
export function createCleaner(env) {
  const phrase = phrases(env);
  const parts = (root, options = {}) => blockParts(root, options, env, phrase);
  return {
    parts,
    /** A phrase element (a, strong) or the content of a block, inline: breaks become <br>. */
    inline: (node) => paragraphs(PHRASE.has(node.name) ? phrase.inline(node) : phrase.inner(node))
      .join('<br>'),
    /** The rows of a table as lists of cell html. */
    rows: (table) => env.$(table).find('tr').toArray()
      .map((tr) => tr.children.filter((c) => ['td', 'th'].includes(c.name))
        .map((cell) => parts(cell).join('')))
      .filter((cells) => cells.some(Boolean)),
  };
}
