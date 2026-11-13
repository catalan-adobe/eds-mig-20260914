// The cards family (component-assetcard): one `cards` row per card. The kind of card is the
// block variant; a video card is a row whose first cell holds a video link. A quick-task list
// is a `cards quick` row too: the source has only its title.
import { escapeHtml } from '../lib/clean.mjs';

const LINE = ['purple', 'orange', 'green', 'blue', 'teal', 'dark-turquoise', 'gray',
  'burnt-orange', 'black'];
const para = (html) => (html ? `<p>${html}</p>` : '');
/** `tight`: the card sits in a card container, whose cells have 10 px of padding, not 15. */
const tight = (card) => (card.closest('.component-card-container .card-col').length
  ? ['tight'] : []);
// the source writes its icons as characters of the icon font: they are not text
const text = (node) => escapeHtml(node.text().replace(/[\uE000-\uF8FF]/g, '')
  .replace(/\s+/g, ' ').trim());

/**
 * The link paragraph of a card: its call to action, or the bare card link. A card the source
 * opens in a new tab (`data-new-tab`) has a link whose href ends with `#_blank`.
 */
function action(card, anchor, ctx) {
  const blank = card.attr('data-new-tab') === 'true' ? '#_blank' : '';
  const cta = anchor.length ? ctx.clean(anchor, { inline: true }) : '';
  if (/<a /.test(cta)) return para(cta.replace(/(<a [^>]*href="[^"]*)/, `$1${blank}`));
  const href = ctx.link(card.attr('data-link'));
  return para(href ? `<a href="${href}${blank}">${href}</a>` : cta);
}

/**
 * Cell 1 of an asset card: its image, or the video thumbnail and the video link. A video the
 * source plays in the card, not in its dialog (`data-mode="inline"`), has a link ending with
 * `#inline`.
 */
function media(card, ctx) {
  const video = card.find('.cmp-video').first();
  if (!video.length) return ctx.image(card.find('.cmp-image img').first());
  ctx.drop(video.find('.modal-template'), 'video dialog: built by the block');
  const href = `${ctx.video(video)}${video.attr('data-mode') === 'inline' ? '#inline' : ''}`;
  return [para(ctx.image(video.find('img').first())), para(`<a href="${href}">${href}</a>`)];
}

function asset(card, ctx) {
  const body = card.find('.card-text').first();
  const label = body.find('.label-wrapper').not('.invisible').find('.label');
  return ctx.block('cards', tight(card), [[media(card, ctx), [
    para(text(label)),
    para(text(body.find('.date-time'))),
    `<h4>${ctx.clean(body.find('.heading'), { inline: true })}</h4>`,
    para(ctx.clean(body.find('.heading-desc-wrapper > p'), { inline: true })),
    // 2 cards have a label without a link: it stays as text
    action(card, body.children('a'), ctx)
      || para(text(body.contents().filter((_, node) => node.type === 'text'))),
  ]]], { merge: true });
}

function solution(card, ctx) {
  const hover = card.find('.text-hover').first();
  const title = ctx.clean(hover.children('span'), { inline: true });
  const href = ctx.link(card.children('a').attr('href'));
  const label = text(hover.children('.button'));
  const button = label && `${label} :chevron-right:`;
  const variants = ['solution', ...tight(card)];
  return ctx.block('cards', variants, [[ctx.image(card.find('.cmp-image img').first()), [
    title && `<h4>${title}</h4>`,
    para(ctx.clean(hover.children('p'), { inline: true })),
    para(href && button ? `<a href="${href}">${button}</a>` : button),
  ]]], { merge: true });
}

function event(card, ctx) {
  const body = card.find('.event-text-container').first();
  const variants = ['event', ...tight(card)];
  return ctx.block('cards', variants, [[ctx.image(card.find('.cmp-image img').first()), [
    `<h4>${ctx.clean(body.find('.event-header'), { inline: true })}</h4>`,
    ...body.find('.type-loc-date-wrapper').children().toArray().map((n) => para(text(ctx.$(n)))),
    action(card, body.children('a.event-cta'), ctx),
  ]]], { merge: true });
}

function agenda(card, ctx) {
  const { $ } = ctx;
  const find = (name) => card.find(`.cmp-agendacard__${name}`);
  ctx.drop(find('readMoreShow, .cmp-agendacard__readMoreHide'), 'toggle: built by the block');
  ctx.drop(find('datetime').find('i.fa'), 'icon: drawn by the block');
  const colour = LINE.find((c) => find('agendaCardLine').hasClass(c)) ?? '';
  const time = find('time').children().toArray().map((n) => para(text($(n))));
  const speakers = find('speakerList').children('li').toArray()
    .map((li) => text($(li)).replace(/\s+,/g, ',').replace(/,$/, ''))
    .filter(Boolean);
  const description = find('description').children().not('a').toArray();
  return ctx.block('cards', ['agenda', ...tight(card)], [[time, [
    para(text(find('agendatype'))),
    `<h4>${ctx.clean(find('agendatitle'), { inline: true })}</h4>`,
    speakers.length ? `<ul>${speakers.map((s) => `<li>${s}</li>`).join('')}</ul>` : '',
    ...description.map((n) => ctx.clean(n)),
  ], colour]], { merge: true });
}

/** A quick-task list. The source has only its title: a `cards quick` row with a heading. */
function quickTask(card, ctx) {
  if (card.find('.topTasksItem').length) ctx.warn('quick-task tiles are not migrated');
  const title = ctx.clean(card.find('.title').first(), { inline: true });
  if (!title) return undefined;
  return ctx.block('cards', ['quick', ...tight(card)], [['', `<h2>${title}</h2>`]], {
    merge: true,
  });
}

export default function cards(el, ctx) {
  const card = ctx.$(el).find('section').first();
  if (card.hasClass('component-assetcard')) return asset(card, ctx);
  if (card.hasClass('component-solutioncard')) return solution(card, ctx);
  if (card.hasClass('cmp-agendacard')) return agenda(card, ctx);
  if (card.hasClass('component-eventcard')) return event(card, ctx);
  if (card.hasClass('component-quicktask')) return quickTask(card, ctx);
  return card.length ? ctx.fallback() : undefined;
}
