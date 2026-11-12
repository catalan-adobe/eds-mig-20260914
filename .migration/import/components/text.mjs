// Title, body, buttons and separator of a text: default content, the rest is section style.
const DARK = /^(#111c24)?$/i;
const SIZE = { 'text-size-smaller': 'title-small', 'text-size-larger': 'title-large' };
const alignment = (node, prefix) => (node.attr('class') ?? '')
  .match(new RegExp(`${prefix}-(center|right)`))?.[1];

export default function text(el, ctx) {
  const { $ } = ctx;
  const box = $(el).find('.component-textcomp').first();
  const heading = box.children('.title').first();
  const title = ctx.clean(heading, { inline: true });
  const styles = ctx.styles(el);
  const align = alignment(box, 'text-align');
  if (align) styles.push(align);
  if (title) {
    const cls = (heading.attr('class') ?? '').split(/\s+/);
    styles.push(...cls.map((c) => SIZE[c]).filter(Boolean));
    const colour = (heading.attr('style') ?? '').match(/color:\s*([^;]*)/)?.[1].trim() ?? '';
    if (DARK.test(colour)) styles.push('title-dark');
    else if (!/^#5a2a82$/i.test(colour)) ctx.warn(`title colour ${colour} is not migrated`);
    if (cls.includes('no-margin')) styles.push('title-flush');
  }
  const buttons = box.children('.buttons');
  const buttonAlign = alignment(buttons.first(), 'align');
  if (buttons.length && (buttonAlign ?? 'left') !== (align ?? 'left')) {
    styles.push(`buttons-${buttonAlign ?? 'left'}`);
  }
  if (box.children('hr.separator').length) styles.push('rule');
  const rest = box.children().not(heading).toArray().flatMap((node) => ctx.content(node));
  return ctx.section([title && `<h2>${title}</h2>`, ...rest], { styles });
}
