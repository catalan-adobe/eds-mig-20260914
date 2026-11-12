// A product card (component-card-a): a `cards quick` row. Cell 1 is its image, cell 2 the
// title, then the heading and the text. In a card container it is `tight` (cells with 10 px of
// padding) and has the height of the container's card size (`size-*`).
const SIZES = {
  'extra-extra-small': 'xxs',
  'extra-small': 'xs',
  small: 'sm',
  medium: 'md',
  large: 'lg',
  'extra-extra-large': 'xxl',
};

export default function productCard(el, ctx) {
  const card = ctx.$(el).find('.component-card-a').first();
  const box = card.closest('.component-card-container');
  const size = SIZES[(box.attr('class') ?? '').match(/card-size-([a-z-]+)/)?.[1]];
  const heading = (node) => {
    const html = ctx.clean(node, { inline: true });
    return html ? `<h4>${html}</h4>` : '';
  };
  const subtitle = ctx.clean(card.find('.subtitle'), { inline: true });
  const rest = card.find('.component-text').children().not('.title, .subtitle, .heading')
    .toArray()
    .map((node) => ctx.clean(node));
  const body = [
    heading(card.find('.title')), subtitle && `<h5>${subtitle}</h5>`,
    heading(card.find('.heading')), ...rest,
  ];
  if (!body.some(Boolean)) return undefined;
  const variants = ['quick', box.length && 'tight', size && `size-${size}`];
  return ctx.block('cards', variants, [[ctx.image(card.find('img').first()), body]], {
    merge: true,
  });
}
