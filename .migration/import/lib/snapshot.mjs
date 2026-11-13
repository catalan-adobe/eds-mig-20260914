// What a document says: its texts and images in document order. The source snapshot is taken
// before any transform runs: a transform may change the DOM, the content check still sees the
// original.
import { decodeEmail } from './links.mjs';

const SKIP = new Set(['script', 'style', 'noscript', 'template', 'link', 'meta', 'head', 'title']);
// elements that do not end a word: "<b>W</b>ord" is one word. A link does: two buttons side
// by side are two words
const PHRASE = new Set(['b', 'strong', 'i', 'em', 'u', 'span', 'sub', 'sup', 'code', 'font',
  'small', 'big', 'abbr', 'cite', 'label', 'mark', 'q', 'ins', 'del', 's', 'kbd', 'var', 'tt',
  'nobr', 'wbr']);

export function snapshot(root) {
  const texts = [];
  const images = [];
  const ranges = new WeakMap();
  const excluded = [];
  const walk = (node) => {
    if (node.type === 'text') {
      texts.push(node.data);
      return;
    }
    if (node.type !== 'tag' || SKIP.has(node.name)) return;
    const start = [texts.length, images.length];
    const gap = PHRASE.has(node.name) ? null : ' ';
    if (gap) texts.push(gap);
    if (node.attribs['data-cfemail']) {
      texts.push(decodeEmail(node.attribs['data-cfemail']));
    } else if (node.name === 'img') {
      images.push({ el: node, alt: (node.attribs.alt ?? '').trim() });
    } else {
      node.children.forEach(walk);
    }
    if (gap) texts.push(gap);
    ranges.set(node, [...start, texts.length, images.length]);
  };
  walk(root);
  return {
    /** Takes an element out of the content check, with the reason why it is not migrated. */
    exclude(node, reason) {
      const range = ranges.get(node);
      if (!range) throw new Error('drop(): the element is not part of the source document');
      const [t0, i0, t1, i1] = range;
      const text = texts.slice(t0, t1).filter(Boolean).join('').replace(/\s+/g, ' ')
        .trim();
      const count = images.slice(i0, i1).filter(Boolean).length;
      texts.fill(' ', t0, t1);
      images.fill(null, i0, i1);
      if (text || count) excluded.push({ reason, text: text.slice(0, 80), images: count });
    },
    text: () => texts.join(''),
    images: () => images.filter(Boolean),
    excluded,
  };
}
