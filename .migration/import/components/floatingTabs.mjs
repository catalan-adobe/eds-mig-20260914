// Floating tabs: block `tabs`. A row is one band of a panel: label, its cells side by side,
// then its styles. The first row of a panel has the label; the rows after it have none.
// A block inside a panel keeps its rows: the style cell names it, as `cards (cols-3)`.
import { escapeAttr, escapeHtml } from '../lib/clean.mjs';

const SIZES = ['xs', 'sm', 'md'];
const KEPT = new RegExp(`^(${['title-(dark|large)', 'center', 'right', 'rule', 'rich-text',
  'image-pad-(sm|md|lg)', 'light-grey', 'white'].join('|')})$`);
// a title in a panel is small unless the row says otherwise; a block still needs the word
const IGNORED = /^(title-small|title-flush|buttons-left|no-title|row|stack|divider)$/;
const titleSize = (styles) => styles.filter((style) => style === 'title-small');
const EDGE = /^(?:band-)?(top|bottom)-(xs|sm|md)$/;
const WIDTHS = ['3,9', '9,3', '4,8', '8,4'];
// the blocks blocks/tabs/tabs.js loads inside a panel
const NESTED = ['accordion', 'cards', 'carousel', 'columns', 'content-tile', 'embed',
  'key-benefits', 'mosaic', 'promo', 'quote', 'table', 'teasers', 'video'];
const LINK = /^(?:<p>)?(<a [^>]*>(?:(?!<\/a>)[\s\S])*<\/a>)(?:<\/p>)?$/;
// a box link that opens a list of links: its label, then the list
const MENU = /^<p>((?:(?!<\/p>)[\s\S])*)<\/p>(<ul>[\s\S]*<\/ul>)$/;
const LINK_LIST = /^<ul>(<li><a [^>]*>(?:(?!<\/a>)[\s\S])*<\/a><\/li>)+<\/ul>$/;
const slug = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
const isBlock = (part) => typeof part !== 'string';
const isBoxLinks = (part) => isBlock(part) && part.name === 'box-links';
const isReal = (s) => s.content.length > 0 || s.styles.includes('rule');
const token = (b, more = []) => (b.variants.length + more.length
  ? `${b.name} (${[...b.variants, ...more].join(', ')})` : b.name);
const isNarrow = (part) => isBlock(part) && part.name === 'columns'
  && part.variants.includes('narrow');
const IMAGE = /^<p><img [^>]*><\/p>$/;
// rows of an image and its text: the tabs block draws them in their cell (`cell columns`)
const isImageText = (part) => isNarrow(part) || (isBlock(part) && part.name === 'columns'
  && part.rows.every((row) => row.length === 2 && IMAGE.test(row[0]) && !/<img/.test(row[1])));
// a text alone: its content is all it shows
const isText = (part) => isBlock(part) && part.name === 'columns' && part.rows.length === 1
  && part.rows[0].length === 1 && !/<img/.test(part.rows[0][0]);
const number = (styles, prefix) => Number(styles.find((s) => s.startsWith(prefix))
  ?.slice(prefix.length) ?? 0);

/** The larger of the spacings of one edge (`top` or `bottom`) in the styles, as a row style. */
function edge(styles, side) {
  const sizes = styles.map((s) => s.match(EDGE)).filter((m) => m?.[1] === side)
    .map((m) => SIZES.indexOf(m[2]));
  return sizes.length ? [`${side}-${SIZES[Math.max(...sizes)]}`] : [];
}

/** Section styles as row styles; what a row cannot show is reported. */
function rowStyles(styles, ctx) {
  const lost = styles.filter((s) => !KEPT.test(s) && !EDGE.test(s) && !IGNORED.test(s)
    && !/^(span|offset)-\d+$/.test(s));
  if (lost.length) ctx.warn(`styles lost in a panel: ${lost.join(', ')}`);
  return styles.filter((s) => KEPT.test(s));
}

/**
 * The links of a `box-links` block as lists: one list, or one per column from three on.
 * `byColumn`: the links of two columns in the source's order, the first column first.
 */
function boxLinks(block, byColumn = false) {
  const rows = block.rows.slice();
  // the item merge pads the shorter column of links with an empty item
  while (rows.length && rows.at(-1).every((cell) => !cell.trim())) rows.pop();
  const titles = rows.filter((row) => /<h\d/.test(row[0])).map((row) => row[0]);
  const links = rows.filter((row) => !/<h\d/.test(row[0]))
    .map((row) => (row.length === 1
      ? row[0].match(LINK)?.[1] ?? row[0].match(MENU)?.slice(1).join('') : null));
  if (!links.length || links.some((link) => !link)) return null;
  const cols = number(block.variants, 'cols-');
  const lists = Array.from({ length: cols > 2 ? cols : 1 }, () => []);
  const order = byColumn && cols === 2
    ? [...links.filter((_, i) => i % 2 === 0), ...links.filter((_, i) => i % 2)] : links;
  order.forEach((link, i) => lists[i % lists.length].push(`<li>${link}</li>`));
  return { titles, cells: lists.map((items) => `<ul>${items.join('')}</ul>`) };
}

/** A block inside a cell as html: a cell cannot hold a block. */
function flatBlock(block, ctx, drawn = isNarrow, byColumn = false) {
  const links = isBoxLinks(block) && boxLinks(block, byColumn);
  if (links) return links.titles.join('') + links.cells.join('');
  // a row of equal cells of one image each: images of one paragraph sit side by side
  const [row] = block.rows;
  if (block.name === 'columns' && !block.variants.length && block.rows.length === 1
    && row.length > 1 && row.every((cell) => IMAGE.test(cell))) {
    return `<p>${row.map((cell) => cell.slice('<p>'.length, -'</p>'.length)).join('')}</p>`;
  }
  if (!drawn(block)) ctx.warn(`${block.name} inside a panel becomes default content`);
  return block.rows.flat().filter(Boolean)
    .map((cell) => (/^<(p|h\d|ul|ol|pre)\b/.test(cell) ? cell : `<p>${cell}</p>`)).join('');
}

/** The rows of a section that is not part of a grid row. */
function sectionRows(section, ctx) {
  const styles = rowStyles(section.styles, ctx);
  const rows = [];
  let html = '';
  const push = (list, more = []) => {
    if (html) rows.push({ cells: [html], styles: [...styles] });
    html = '';
    list.forEach((cells) => rows.push({ cells, styles: [...styles, ...more] }));
  };
  section.content.forEach((part) => {
    const links = isBoxLinks(part) && boxLinks(part);
    const plain = part.name === 'columns' && !part.variants.includes('media');
    const nested = NESTED.includes(part.name);
    if (!isBlock(part)) html += part;
    else if (plain) push(part.rows, part.variants.filter((v) => /^w-\d-\d$|^divider$/.test(v)));
    else if (links) {
      html += links.titles.join('');
      push([links.cells], ['box-links']);
    } else if (nested) push(part.rows, [...titleSize(section.styles), token(part)]);
    else html += flatBlock(part, ctx);
  });
  push([]);
  // a separator alone: a row with nothing but its rule
  if (!rows.length && styles.includes('rule')) rows.push({ cells: [''], styles });
  if (rows.length) {
    rows[0].styles.push(...edge(section.styles, 'top'));
    rows.at(-1).styles.push(...edge(section.styles, 'bottom'));
  }
  return rows;
}

// an image-and-text row in a cell (`cell columns`) draws its own 30 px top and 15 px bottom
const DRAWN = ['top-sm', 'bottom-xs'];
const own = (s, side) => edge(s.styles.filter((style) => !style.startsWith('band-')
  && !(s.content.some(isNarrow) && DRAWN.includes(style))), side);

/**
 * The spacing of one edge of the cells of a row: a row style when every filled cell has the
 * same, else a style of each cell that has one (`c2-top-sm`).
 */
function cellEdge(cells, side) {
  const at = side === 'top' ? 0 : -1;
  const outer = cells.map((cell) => cell.sections.length
    && own(cell.sections.at(at), side)[0]);
  const filled = outer.filter((style, i) => cells[i].sections.length);
  if (filled.length && filled.every((style) => style && style === filled[0])) return [filled[0]];
  return outer.map((style, i) => style && `c${i + 1}-${style}`).filter(Boolean);
}

const TITLE = /^<h[1-6][ >]/;
const textOf = (s) => s.content.map((part) => (isBlock(part) ? JSON.stringify(part.rows) : part))
  .join('');

/**
 * The spacing between the sections of a cell, as `gap-top-sm` or `gap-bottom-sm`: one spacing
 * before every title of the row's cells but their first child, each at the start of a section.
 */
function cellGaps(cells, ctx) {
  const gaps = new Set();
  let lost = false;
  let other = false;
  cells.forEach(({ sections }) => {
    const titles = sections.map((s) => textOf(s).match(/<h[1-6][ >]/g)?.length ?? 0);
    sections.slice(1).forEach((s, i) => {
      const sides = [['bottom', sections[i]], ['top', s]]
        .flatMap(([side, at]) => own(at, side).map((style) => `gap-${style}`));
      const title = TITLE.test(textOf(s));
      if (title && sides.length === 1) gaps.add(sides[0]);
      else if (sides.length) lost = true;
      other ||= titles[i + 1] > (title && sides.length === 1 ? 1 : 0);
    });
    other ||= titles[0] > (TITLE.test(textOf(sections[0])) ? 1 : 0);
  });
  if (lost || gaps.size > 1 || (gaps.size && other)) {
    ctx.warn('spacing between the sections of a cell is lost');
    return [];
  }
  return [...gaps];
}

/** The kinds of the lists of a cell, in order: `box`, `links` (only links) or `text`. */
function listKinds(sections) {
  return sections.flatMap((s) => s.content).flatMap((part) => {
    if (isBoxLinks(part)) return boxLinks(part) ? ['box'] : [];
    if (isBlock(part)) return [];
    return (part.match(/<ul>(?:(?!<\/ul>)[\s\S])*<\/ul>/g) ?? [])
      .map((list) => (LINK_LIST.test(list) ? 'links' : 'text'));
  });
}

/**
 * `box-links` when the lists of links of a row are box links, and all of them are;
 * `box-links (first)` when each is the first list of its cell; `cols-2`: in two columns.
 */
function linkStyle(cells, ctx) {
  const parts = cells.flatMap((cell) => cell.sections.flatMap((s) => s.content));
  if (!parts.some(isBoxLinks)) return [];
  if (!parts.some((part) => !isBlock(part) && LINK_LIST.test(part))) return ['box-links'];
  const kinds = cells.map((cell) => listKinds(cell.sections));
  const first = kinds.every((list) => !list.slice(1).includes('box'));
  const cols = parts.filter(isBoxLinks).map((b) => number(b.variants, 'cols-'));
  if (first && cols.every((n) => n <= 2 && n === cols[0])) {
    return [`box-links (${['first', cols.includes(2) && 'cols-2'].filter(Boolean).join(', ')})`];
  }
  ctx.warn('box links beside a list of links in one row are drawn as a list');
  return [];
}

/**
 * `cell columns (media, narrow, …)` when the images of a row are those of image-and-text rows
 * (textImage2Column) of one look: the tabs block draws them inside their cell.
 */
function cellBlock(sections, ctx) {
  const holders = sections.filter((s) => s.content.some(isImageText));
  const blocks = holders.flatMap((s) => s.content.filter(isImageText));
  const others = sections.flatMap((s) => s.content.filter((part) => !isImageText(part)));
  const alike = blocks.every((b) => token(b) === token(blocks[0]));
  if (!blocks.length) return [];
  if (!alike || others.some((part) => /<img/.test(JSON.stringify(part)))) {
    ctx.warn('image-and-text rows in a cell become default content');
    return [];
  }
  const small = holders.every((s) => s.styles.includes('title-small'));
  return [`cell ${token(blocks[0])}`, small && 'title-small'];
}

/** `cell video (…)` when the videos of a row are of one kind: the tabs block draws them. */
function cellVideo(sections) {
  const videos = sections.flatMap((s) => s.content
    .filter((part) => isBlock(part) && part.name === 'video'));
  const alike = videos.every((b) => token(b) === token(videos[0]));
  return videos.length && alike ? [`cell ${token(videos[0])}`] : [];
}

/** One row of cells of the source as one row: a cell is { width, sections }. */
function gridRow(cells, head, ctx) {
  const filled = cells.filter((cell) => cell.sections.length);
  const all = filled.flatMap((cell) => cell.sections);
  const titled = all.filter((s) => /^<h2>/.test(s.content[0] ?? ''));
  const every = (list, style) => list.length > 0 && list.every((s) => s.styles.includes(style));
  const widths = cells.map((cell) => cell.width).join();
  const equal = cells.every((cell) => cell.width === cells[0].width);
  if (!equal && !WIDTHS.includes(widths)) ctx.warn(`row ${widths} has no width style`);
  // the band's spacing is outside the cells, theirs inside: both count
  const spacing = (side) => {
    const band = edge(head.styles.filter((style) => style.startsWith(`band-${side}-`)), side);
    const cell = cellEdge(cells, side);
    const [shared] = cell.filter((style) => !style.startsWith('c'));
    if (!shared) return [...band, ...cell];
    // cells stacked below 730 keep their own spacing each
    if (!band.length && filled.length < 2) return [shared];
    return [...band, ...cells.map((c, i) => c.sections.length && `c${i + 1}-${shared}`)];
  };
  const inCell = [...cellBlock(all, ctx), ...cellVideo(all)];
  const links = linkStyle(filled, ctx);
  const byColumn = links.some((style) => style.includes('cols-2'));
  const drawn = (b) => isNarrow(b) || isText(b) || inCell.includes(`cell ${token(b)}`);
  const styles = [
    every(titled, 'title-dark') && 'title-dark',
    ...['rich-text', 'center', 'light-grey', 'white'].filter((style) => every(all, style)),
    ...links,
    ...inCell,
    !equal && WIDTHS.includes(widths) && `w-${widths.replaceAll(',', '-')}`,
    head.styles.includes('divider') && 'divider',
    ...spacing('top'), ...spacing('bottom'), ...cellGaps(filled, ctx),
  ].filter(Boolean);
  const html = (s) => s.content
    .map((part) => (isBlock(part) ? flatBlock(part, ctx, drawn, byColumn) : part))
    .join('');
  return { cells: cells.map((cell) => cell.sections.map(html).join('')), styles };
}

/**
 * The rows of one row of cells of the source. A row with one filled cell gives a row for each
 * section of that cell, so that every section keeps its own spacing.
 */
function gridRows(cells, head, ctx) {
  const used = cells.reduce((sum, cell) => sum + cell.width, 0);
  if (used < 12) cells.push({ width: 12 - used, sections: [] });
  const filled = cells.filter((cell) => cell.sections.length);
  if (filled.length !== 1 || filled[0].sections.length < 2) return [gridRow(cells, head, ctx)];
  const { sections } = filled[0];
  return sections.map((s, i) => {
    const edges = [i === 0 && 'band-top-', i === sections.length - 1 && 'band-bottom-'];
    const styles = head.styles.filter((style) => !style.startsWith('band-')
      || edges.some((side) => side && style.startsWith(side)));
    const one = cells.map((cell) => (cell === filled[0] ? { ...cell, sections: [s] } : cell));
    return gridRow(one, { styles }, ctx);
  });
}

/** The rows of sections; the sections of a section grid (`span-N`) become rows of cells. */
function rowsOf(sections, ctx) {
  const rows = [];
  let open = null;
  const close = () => {
    if (open) rows.push(...gridRows(open.cells, open.head, ctx));
    open = null;
  };
  sections.forEach((s) => {
    const span = number(s.styles, 'span-');
    if (!span) {
      close();
      rows.push(...sectionRows(s, ctx));
      return;
    }
    if (!s.styles.includes('stack') || !open) {
      const offset = number(s.styles, 'offset-');
      const used = open?.cells.reduce((sum, cell) => sum + cell.width, 0) ?? 0;
      if (s.rowStart || used + offset + span > 12) close();
      open ??= { cells: [], head: s };
      if (offset) open.cells.push({ width: offset, sections: [] });
      open.cells.push({ width: span, sections: [] });
    }
    open.cells.at(-1).sections.push(s);
  });
  close();
  return rows;
}

/** One block with `cols-N` when every cell holds one block of the same kind and size. */
function likeItems(cells) {
  const blocks = cells.map((cell) => (cell.sections.length === 1
    && cell.sections[0].content.length === 1 ? cell.sections[0].content[0] : null));
  const [first] = blocks;
  const alike = blocks.every((b) => b && isBlock(b) && NESTED.includes(b.name) && b.merge
    && token(b) === token(first) && b.rows.length === first.rows.length)
    && cells.every((cell) => cell.width === cells[0].width);
  if (!alike) return null;
  const rows = first.rows.flatMap((_, r) => blocks.map((b) => b.rows[r]));
  return { rows, name: token(first, [`cols-${cells.length}`]) };
}

/**
 * A row of two or more cells directly in a panel, read cell by cell: the importer's section
 * grid has no cells, and its item merge joins like blocks of neighbouring cells.
 */
function columnRows(el, cells, ctx) {
  const band = ctx.styles(el);
  const read = cells.map((cell) => ({
    width: Number((cell.attribs.class ?? '').match(/col-sm-(\d+)/)?.[1] ?? 12),
    sections: ctx.children(cell).filter(isReal),
  }));
  const styles = band.filter((style) => !EDGE.test(style));
  const like = likeItems(read);
  if (like) {
    const look = read[0].sections[0].styles.filter((s) => KEPT.test(s) || s === 'title-small');
    const rows = like.rows
      .map((row) => ({ cells: row, styles: [...styles, ...look, like.name] }));
    rows[0].styles.push(...edge(band, 'top'));
    rows.at(-1).styles.push(...edge(band, 'bottom'));
    return rows;
  }
  const divider = ctx.$(el).find('.component-column').first().hasClass('divider-row');
  const head = [...band.map((s) => (EDGE.test(s) ? `band-${s}` : s)), divider && 'divider'];
  const rows = read.some((cell) => cell.sections.length)
    ? gridRows(read, { styles: head.filter(Boolean) }, ctx) : [];
  rows.forEach((row) => row.styles.unshift(...styles.filter((s) => !row.styles.includes(s))));
  return rows;
}

/** The cells of a component that is a row of two or more cells, else nothing. */
function cellsOf(el, ctx) {
  if (!(el.attribs.class ?? '').split(/\s+/).includes('column')) return null;
  const cells = ctx.$(el).find('.component-column').first().children('div')
    .not('.snps-col-divider')
    .toArray();
  return cells.length > 1 ? cells : null;
}

/** The rows of a panel: its components in order. */
function panelRows(body, ctx) {
  const { $ } = ctx;
  const rows = [];
  let run = [];
  const flush = () => {
    if (!run.length) return;
    // a scope of its own for the components between two rows of cells
    const scope = $('<div></div>').insertBefore(run[0]).append(run);
    rows.push(...rowsOf(ctx.children(scope[0]), ctx));
    run = [];
  };
  const components = $(body).children('.aem-Grid').children().toArray();
  components.forEach((el) => {
    const cells = cellsOf(el, ctx);
    if (!cells) {
      run.push(el);
      return;
    }
    flush();
    rows.push(...columnRows(el, cells, ctx));
  });
  flush();
  return rows;
}

export default function floatingTabs(el, ctx) {
  const { $ } = ctx;
  const box = $(el).find('.component-floating-tabs').first();
  const tabs = box.children('.tabs-nav').find('.tab-nav-item-anchor').toArray();
  const panels = box.children('.tabs-content').children('.floating-tab').toArray();
  const rows = panels.flatMap((panel, i) => {
    const anchor = tabs[i] ?? $(panel).find('.tab-header-title')[0];
    const text = $(anchor).text().replace(/\s+/g, ' ').trim();
    const id = ($(anchor).attr('href') ?? '').replace(/^#/, '');
    const label = id && id !== slug(text)
      ? `<a href="#${escapeAttr(id)}">${escapeHtml(text)}</a>` : escapeHtml(text);
    ctx.drop($(panel).children('.tab-header'), 'tabs: the label of the panel below 730');
    const body = panelRows($(panel).children('.tab-body')[0], ctx);
    if (!body.length) body.push({ cells: [''], styles: [] });
    return body.map((row, r) => [r ? '' : label, ...row.cells, [...new Set(row.styles)].join(', ')]
      .filter((cell, c, all) => cell || c < all.length - 1));
  });
  if (!rows.length) return undefined;
  return ctx.block('tabs', [box.hasClass('vertical-tabs') && 'vertical'], rows);
}
