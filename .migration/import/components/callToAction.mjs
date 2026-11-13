// Buttons, sometimes with a title and a text. Without a text the buttons' alignment is the
// section's.
export default function callToAction(el, ctx) {
  const box = ctx.$(el).find('.component-calltoaction').first();
  const content = ctx.content(box);
  const align = (box.find('.buttons').attr('class') ?? '').match(/align-(center|right)/)?.[1];
  const lone = content.every((part) => /^<p><(strong|em)><a /.test(part));
  const look = box.find('.wrapper').first().hasClass('fullWidth') ? 'cta-full' : 'cta';
  const styles = [...ctx.styles(el), look, ...(align ? [lone ? align : `buttons-${align}`] : [])];
  return ctx.section(content, { styles });
}
