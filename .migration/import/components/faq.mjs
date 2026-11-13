// FAQ list: block `accordion`, one row per item. Cell 1 is the question, cell 2 the answer.
// The source's answers have no space between paragraphs: authors add a paragraph with a
// non-breaking space as a blank line (a paragraph with nothing in it has no height). A document
// cannot hold such a paragraph, so the blank line is written as line breaks in the paragraph
// next to it.
const BLANK = '\u0000';

function answer(detail, ctx) {
  const { $ } = ctx;
  const blank = (child) => child.name === 'p' && $(child).text().includes('\u00a0');
  const parts = detail.children().toArray()
    .map((child) => ctx.clean(child) || (blank(child) ? BLANK : ''));
  return parts.join('')
    .replaceAll(`</p>${BLANK}<p>`, '<br><br>')
    .replaceAll(`${BLANK}<p>`, '<p><br>')
    .replaceAll(`</p>${BLANK}`, '<br><br></p>')
    .replaceAll(BLANK, '');
}

export default function faq(el, ctx) {
  const { $ } = ctx;
  const items = $(el).find('.accordion-list .item').toArray();
  const rows = items.map((item) => {
    const title = $(item).find('.title').first();
    const heading = title.find('h1, h2, h3, h4, h5, h6').first();
    return [
      ctx.clean(heading.length ? heading : title, { inline: true }),
      answer($(item).find('.detail').first(), ctx),
    ];
  });
  const filled = rows.filter((row) => row.some(Boolean));
  return filled.length ? ctx.block('accordion', [], filled) : [];
}
