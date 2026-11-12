// The document model: a document is a list of sections, a section holds html strings and
// blocks, a block is a name, variants and rows of cells. CONTRACT.md a) gives the rules.
const SPACE_PX = { xs: 15, sm: 30, md: 60 };
const SIZES = ['xs', 'sm', 'md'];
const isSection = (x) => !!x && typeof x === 'object' && Array.isArray(x.content);
export const isBlock = (x) => !!x && typeof x === 'object' && Array.isArray(x.rows);

/** A block. `options.merge`: neighbours with the same class list join into one block. */
export function block(name, variants = [], rows = [], options = {}) {
  const cells = rows.map((row) => [].concat(row).map((cell) => [].concat(cell ?? '').join('')));
  return {
    name, variants: [...new Set(variants.filter(Boolean))], rows: cells, merge: !!options.merge,
  };
}

/** A section. Content: html strings and blocks. */
export function section(content = [], { styles = [], id } = {}) {
  return {
    content: [].concat(content ?? []).filter(Boolean), styles: [...new Set(styles)], id,
  };
}

/** What a transform returned, as a list of sections. `styles` go to a section made here. */
export function toSections(result, styles = []) {
  const list = [].concat(result ?? []).filter(Boolean);
  if (list.length && list.every(isSection)) return list;
  if (list.some(isSection)) throw new Error('a transform returns sections, or content: not both');
  return [section(list, { styles })];
}

const classList = (b) => [b.name, ...b.variants].join(' ');
const onlyBlock = (s) => (s.content.length === 1 && isBlock(s.content[0]) ? s.content[0] : null);
const without = (styles, pattern) => styles.filter((s) => !pattern.test(s));
const isEmpty = (s) => !s.content.length && !s.styles.includes('rule');

function addStyle(target, style) {
  const [, kind, size] = style.match(/^(band-top|band-bottom)-(\w+)$/) ?? [];
  const old = kind && target.styles.find((s) => s.startsWith(`${kind}-`));
  if (old) {
    // two bands on one edge: the larger one stays
    const larger = SIZES.indexOf(size) > SIZES.indexOf(old.slice(kind.length + 1)) ? style : old;
    target.styles = [...without(target.styles, new RegExp(`^${kind}-`)), larger];
  } else if (!target.styles.includes(style)) target.styles.push(style);
}
export const addStyles = (target, styles) => styles.forEach((s) => addStyle(target, s));

/**
 * Item merge: neighbouring sections that hold one mergeable block with the same class list
 * become one section. `variants` are added to every merged or mergeable block.
 */
export function mergeItems(sections, variants = []) {
  const out = [];
  sections.forEach((next) => {
    const last = out.at(-1);
    const a = last && onlyBlock(last);
    const b = onlyBlock(next);
    const other = (s) => without(s.styles, /^(top|bottom)-/).join();
    const same = a && b && a.merge && b.merge && classList(a) === classList(b) && !next.id
      && other(last) === other(next);
    if (!same) {
      out.push(next);
      return;
    }
    a.rows.push(...b.rows);
    const bottom = next.styles.filter((s) => /^bottom-/.test(s));
    last.styles = [...without(last.styles, /^bottom-/), ...bottom];
  });
  if (variants.length) {
    out.map(onlyBlock).filter((b) => b?.merge)
      .forEach((b) => { b.variants = [...new Set([...b.variants, ...variants])]; });
  }
  return out;
}

/** The band style that stands for the vertical padding of a dropped, empty component. */
function bandOf(styles) {
  const px = styles.map((s) => s.match(/^(?:band-)?(?:top|bottom)-(\w+)$/)).filter(Boolean)
    .reduce((sum, m) => sum + (SPACE_PX[m[1]] ?? 0), 0);
  if (!px) return [];
  return [`band-top-${SIZES.findLast((size) => SPACE_PX[size] <= px) ?? 'xs'}`];
}

/**
 * Drops empty sections. Their id and their spacing go to the next section. An empty section at
 * the end stays, so that the caller's parent can pass it on; `last` drops it.
 */
export function settle(sections, { last = false } = {}) {
  const out = [];
  let carry = null;
  sections.forEach((s) => {
    if (isEmpty(s)) {
      carry = { id: s.id ?? carry?.id, styles: [...(carry?.styles ?? []), ...s.styles] };
      return;
    }
    if (carry) {
      s.id ??= carry.id;
      addStyles(s, bandOf(carry.styles));
      carry = null;
    }
    out.push(s);
  });
  if (carry && !last && (carry.id || carry.styles.length)) out.push(section([], carry));
  return out;
}

/**
 * The styles of an enclosing band on its sections: background on all that have none, top
 * spacing on the first, bottom spacing on the last. `styles` are plain: light-grey, top-sm.
 */
export function applyBand(sections, styles) {
  const filled = sections.filter((s) => !isEmpty(s));
  if (!filled.length) return sections.length ? sections : [section([], { styles })];
  styles.forEach((style) => {
    if (/^top-/.test(style)) addStyle(filled[0], `band-${style}`);
    else if (/^bottom-/.test(style)) addStyle(filled.at(-1), `band-${style}`);
    else {
      filled.filter((s) => !s.styles.some((x) => ['light-grey', 'white'].includes(x)))
        .forEach((s) => addStyle(s, style));
    }
  });
  return sections;
}

/**
 * Grid rows that the span rule of the contract glues to the row before them: a row that is
 * not full, followed by a row whose first cell still fits. Returns their section indexes.
 */
export function rowConflicts(sections) {
  const number = (s, prefix) => Number(s.styles.find((x) => x.startsWith(prefix))
    ?.slice(prefix.length) ?? 0);
  const out = [];
  let used = 0;
  sections.forEach((s, i) => {
    const width = number(s, 'span-') + number(s, 'offset-');
    if (!width) used = 0;
    else if (!s.styles.includes('stack')) {
      const fits = used > 0 && used + width <= 12;
      if (s.rowStart && fits) out.push(i);
      used = fits && !s.rowStart ? used + width : width;
    }
  });
  return out;
}

/** Sections as the content of one block cell: blocks become their cells' content. */
export function flatten(sections) {
  return sections.flatMap((s) => s.content)
    .map((part) => (isBlock(part) ? part.rows.flat().join('') : part)).join('');
}

const blockHtml = (b) => `<div class="${classList(b)}">${
  b.rows.map((row) => `\n<div>${row.map((cell) => `<div>${cell}</div>`).join('')}</div>`).join('')
}\n</div>`;

function sectionHtml(s, extra = '') {
  const rows = [];
  if (s.styles.length) rows.push(['Style', s.styles.join(', ')]);
  if (s.id) rows.push(['Id', s.id]);
  const meta = rows.length ? [blockHtml(block('section-metadata', [], rows))] : [];
  const parts = [...s.content.map((p) => (isBlock(p) ? blockHtml(p) : p)), ...meta];
  return `<div>\n${parts.join('\n')}${extra ? `\n${extra}` : ''}\n</div>`;
}

/** The DA document of the sections; `metadata` rows become the metadata block. */
export function toDocument(sections, metadata = []) {
  const list = sections.length || !metadata.length ? sections : [section()];
  const meta = metadata.length ? blockHtml(block('metadata', [], metadata)) : '';
  const divs = list.map((s, i) => sectionHtml(s, i === list.length - 1 ? meta : ''));
  return `<body><header></header><main>\n${divs.join('\n')}\n</main><footer></footer></body>\n`;
}

/** Counts of the blocks in the sections, by name. */
export function countBlocks(sections) {
  const counts = {};
  sections.flatMap((s) => s.content).filter(isBlock)
    .forEach((b) => { counts[b.name] = (counts[b.name] ?? 0) + 1; });
  return counts;
}
