// An image, with its link, caption, padding and zoom.
export default function image(el, ctx) {
  const { $ } = ctx;
  const box = $(el).find('.component-image').first();
  const dialog = box.find('.zoom-instructions, .modal-template');
  ctx.drop(dialog, 'zoom dialog: built by the section style');
  const img = box.find('img').first();
  const html = ctx.image(img);
  if (!html) return undefined;
  const styles = ctx.styles(el);
  const pad = (img.attr('class') ?? '').match(/horizontal-padding-(sm|md|lg)/)?.[1];
  if (pad) styles.push(`image-pad-${pad}`);
  if (box.find('.zoom-container').length) styles.push('zoom');
  const href = ctx.link(img.closest('a').attr('href'));
  const picture = [`<p>${html}</p>`, href && `<p><a href="${href}">${href}</a></p>`];
  const caption = ctx.clean(box.find('.cmp-image__title'), { inline: true });
  if (!caption) return ctx.section(picture, { styles });
  // the caption is the next section (CONTRACT a): it takes the image's bottom spacing
  const below = styles.filter((s) => /^bottom-|^light-grey$|^white$/.test(s));
  return [
    ctx.section(picture, { styles: styles.filter((s) => !/^bottom-/.test(s)) }),
    ctx.section(`<p>${caption}</p>`, { styles: ['rich-text', ...below] }),
  ];
}
