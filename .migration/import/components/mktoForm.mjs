// A Marketo form: the `form` block of CONTRACT c). Everything a form needs sits in its hidden
// inputs and in the inline script the source writes per instance; nothing of it is visible.

const ESCAPES = /\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})|\\(.)/g;
const unescapeJs = (text) => text
  .replace(ESCAPES, (all, u, x, c) => (u || x ? String.fromCharCode(parseInt(u || x, 16)) : c));
const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const list = (value) => (value ?? '').split(',').map((item) => item.trim()).filter(Boolean);

/** The key rows of a `form` block for one `section.snps-aem-mktoForm`. */
export function formRows(section, ctx) {
  const script = section.find('script').text();
  const value = (pattern) => unescapeJs(script.match(pattern)?.[1] ?? '').trim();
  const text = (pattern) => escapeHtml(value(pattern));
  const data = (id, name) => section.find(`#${id}`).attr(`data-${name}`);
  const blocking = data('domain-selection', 'domain-selection') === 'selectBlockingList';
  const thanks = value(/onSuccess\(function \(vals, thankYouURL\) \{[^]*?url = "([^"]*)"/);
  const success = ctx.link(thanks);
  const domains = [...list(data('domain-list', 'domain-list')),
    ...list(data('create-domain-list', 'domain-list'))];
  const rows = [
    ['title', ctx.clean(section.find('.row h2.title').first(), { inline: true }).trim()],
    ['form', text(/MktoForms2\.loadForm\("[^"]*", "[^"]*", "?(\d+)"?, function \(form\)/)],
    ['known-visitor-form', value(/var enableFormPrefill = "([^"]*)"/) === 'true'
      && text(/MktoForms2\.loadForm\("[^"]*", "[^"]*", "?(\d+)"?, function \(form2\)/)],
    ['asset-type', text(/var assetType = "([^"]*)"/)],
    ['campaign', text(/"campaign_asset": "([^"]*)"/)],
    ['content-url', text(/"contentURL": "([^"]*)"/)],
    ['success', success && `<a href="${success}">${success}</a>`],
    ['blocked-domains', blocking && escapeHtml(domains.join(', '))],
    ['domain-error', blocking
      && escapeHtml((data('domain-error-msg', 'error-msg') ?? '').replace(/\s+/g, ' ').trim())],
  ];
  if (!rows[1][1]) ctx.warn('no Marketo form id found in the script');
  return rows.filter(([, cell]) => cell);
}

/** `two-column` when the source lays the fields out in two columns. */
export const formVariants = (section) => (
  section.find('form.two-column').length ? ['two-column'] : []);

// One page (/ai/ai-chip-development.html) hides its form with a style element beside it.
const HIDDEN = /div\.mktoForm\s*\{[^}]*display\s*:\s*none/;

export default function mktoForm(el, ctx) {
  if (HIDDEN.test(ctx.$('.html-text-only-component style').text())) {
    ctx.drop(el, 'the page hides this form with a style element');
    return [];
  }
  const section = ctx.$(el).find('.snps-aem-mktoForm').first();
  return ctx.block('form', formVariants(section), formRows(section, ctx));
}
