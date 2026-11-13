// The blog subscription form of the article rail: a title, a Marketo form and the message
// that replaces the form after a submit. Block `form subscribe`.
export default function subscriptionForm(el, ctx) {
  const box = ctx.$(el).find('.subscription-form-container').first();
  const cell = (selector) => ctx.clean(box.find(selector).first(), { inline: true }).trim();
  const script = box.closest('.cmp-subscription-form').find('script').text();
  const rows = [
    ['title', cell('.form-title')],
    ['form', (box.find('form').attr('id') ?? '').replace(/\D/g, '')],
    ['submit', script.match(/button\.mktoButton'\)\.text\('([^']*)'\)/)?.[1] ?? ''],
    ['success', cell('.mkto-thankyou-message')],
  ];
  return ctx.block('form', ['subscribe'], rows.filter(([, value]) => value));
}
