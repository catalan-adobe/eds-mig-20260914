// One box link, a row of the block `box-links`. Three kinds: a link, a label with a list of
// links behind it (dropdown), and an event box (date, linked title, place).
const paragraph = (html) => (html ? `<p>${html}</p>` : '');

function eventCell(box, ctx) {
  const part = (name) => ctx.clean(box.find(`.cmp-boxlink__${name}`), { inline: true });
  const colour = (box.attr('class') ?? '').split(/\s+/).find((c) => c !== 'cmp-boxlink');
  if (colour && colour !== 'purple') ctx.warn(`event box colour ${colour} is not migrated`);
  const href = ctx.link(box.find('a.topLink').attr('href'));
  const title = part('eventTitle');
  return [part('date'), href ? `<a href="${href}">${title}</a>` : title, part('eventLocation')]
    .map(paragraph).join('');
}

export default function boxLink(el, ctx) {
  const { $ } = ctx;
  const event = $(el).find('.cmp-boxlink').first();
  const label = $(el).find('.topLabel').first();
  const menu = $(el).find('ul.dropdown-link').first();
  let cell;
  if (event.length) cell = eventCell(event, ctx);
  else if (menu.length) {
    cell = paragraph(ctx.clean(label, { inline: true })) + ctx.clean(menu);
  } else {
    // the label and the icon are two links to one target: the icon's link is not written
    const text = ctx.clean(label, { inline: true });
    const href = ctx.link($(el).find('a.topLink').attr('href'));
    cell = /<a /.test(text) || !href || !text ? text : `<a href="${href}">${text}</a>`;
  }
  return cell ? ctx.block('box-links', [], [[cell]], { merge: true }) : [];
}
