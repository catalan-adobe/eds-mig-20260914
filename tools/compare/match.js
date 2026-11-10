// Pairs the elements of the original page with those of the migrated page.

const key = (item) => `${item.kind}\n${item.text}`;

function indexByText(items) {
  const index = new Map();
  items.forEach((item) => {
    const list = index.get(key(item)) ?? [];
    list.push(item);
    index.set(key(item), list);
  });
  return index;
}

/** One row per original item, in the original order. `migrated` is null without a pair. */
export function match(source, migrated) {
  const pool = indexByText(migrated);
  return source.map((from) => {
    const to = pool.get(key(from))?.shift() ?? null;
    return {
      kind: from.kind,
      text: from.text,
      source: from,
      migrated: to,
      dx: to ? to.x - from.x : null,
      dy: to ? to.y - from.y : null,
      dw: to ? to.w - from.w : null,
      dh: to ? to.h - from.h : null,
    };
  });
}
