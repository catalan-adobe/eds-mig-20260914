import { loadScript } from '../../scripts/aem.js';
import { siteRoot } from '../../scripts/site.js';

// As the source: Marketo Forms 2 of the instance behind online.synopsys.com.
const MARKETO = 'https://online.synopsys.com';
const MUNCHKIN = '367-MRV-360';
const LEAD_API = 'https://api.synopsys.com/api/v1/lead';
const KEYS = ['title', 'form', 'known-visitor-form', 'asset-type', 'campaign', 'content-url',
  'success', 'blocked-domains', 'domain-error', 'date', 'submit'];
// Texts the source script holds, in English on every language.
const LOADING_ERROR = 'Error while loading form!';
const WORK_EMAIL = 'Please register with a valid work email.';
const SUBMITTED = 'Your Form Has Been Submitted!';
const REDIRECT_DELAY = 1500;
const MAX_REDIRECT_DELAY = 10000;
const mobile = window.matchMedia('(width <= 730px)');

function element(tag, className, ...children) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.append(...children);
  return el;
}

function cookie(name) {
  const found = document.cookie.split('; ').find((entry) => entry.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : '';
}

/** The content of a cell as a phrase: the pipeline wraps the text of a cell in one paragraph. */
function phrase(cell) {
  const only = cell.children.length === 1 && cell.firstElementChild.matches('p');
  return [...(only ? cell.firstElementChild : cell).childNodes];
}

const pageUrl = () => window.location.href.replace(/^https?:\/\//, '');
const emailDomain = (email) => (email ?? '').trim().toLowerCase().split('@').pop();

/** The key rows of the block. The first row is the intro when its first cell is not a key. */
function readConfig(block) {
  const config = {};
  [...block.children].forEach((row, index) => {
    const [first, second, third] = row.children;
    const key = first?.textContent.trim().toLowerCase();
    if (second && KEYS.includes(key)) {
      config[key] = { cell: second, text: second.textContent.trim(), extra: third };
    } else if (index === 0 && first) {
      config.intro = first;
    }
  });
  return config;
}

let marketo;
/** Marketo's form library, loaded once. */
function loadMarketo() {
  marketo ??= loadScript(`${MARKETO}/js/forms2/js/forms2.min.js`).then(() => window.MktoForms2);
  return marketo;
}

let lists;
/** The domain lists of the sheet `form-domains`: id to domains. */
function domainLists() {
  lists ??= fetch(`${siteRoot()}/data/form-domains.json`).then((response) => {
    if (!response.ok) throw new Error(`form-domains.json: ${response.status}`);
    return response.json();
  }).then(({ data }) => Object.fromEntries(data.map(({ id, values }) => [
    // an empty entry stays, as in the source: it matches an e-mail field left empty
    id, values.split(',').map((domain) => domain.trim().toLowerCase()),
  ])));
  return lists;
}

/** Runs `load` once, when `target` comes near the viewport. */
function onView(target, load) {
  new IntersectionObserver((entries, observer) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    load();
  }, { rootMargin: '300px' }).observe(target);
}

/**
 * Marketo focuses the e-mail field when a form is ready, which scrolls the page to it. As the
 * source: the field takes a scripted focus only after the visitor touched the page.
 */
function preventAutoFocus(formEl) {
  const email = formEl.querySelector('input[name="Email"], input[type="email"]');
  if (!email) return;
  let touched = false;
  const events = ['pointerdown', 'touchstart', 'keydown'];
  const touch = () => {
    touched = true;
    events.forEach((type) => document.removeEventListener(type, touch, true));
  };
  events.forEach((type) => document.addEventListener(type, touch, true));
  const { focus } = email;
  email.focus = (...args) => (touched ? focus.apply(email, args) : email.blur());
}

/**
 * Two-column layout, as the source script: of each run of single fields between full-width
 * rows (checkboxes, texts) an odd last one takes the whole width.
 */
function spanOddFields(formEl) {
  const hidden = '.mktoPlaceholder, input[type="hidden"], script';
  const rows = [...formEl.querySelectorAll(':scope > .mktoFormRow')]
    .filter((row) => !row.querySelector(hidden) && row.innerText.trim() !== '');
  const wide = rows
    .map((row) => !!row.querySelector('input[type="checkbox"], .mktoHtmlText.mktoHasWidth'));
  let run = 0;
  rows.forEach((row, index) => {
    row.classList.remove('full-width');
    run = wide[index] ? 0 : run + 1;
    const endsRun = index === rows.length - 1 || wide[index + 1];
    if (endsRun && run % 2 === 1) {
      row.classList.add('full-width');
      run = 0;
    }
  });
}

function redirect(url) {
  const delay = Number(window.marketoSubmissionDelay);
  const wait = Number.isNaN(delay) ? REDIRECT_DELAY
    : Math.max(0, Math.min(delay, MAX_REDIRECT_DELAY));
  setTimeout(() => { window.location.href = url; }, wait);
}

/** After a submit: go to the authored page, or show the authored message in place of the form. */
function onSuccess(form, success, block) {
  form.onSuccess(() => {
    const link = success?.cell.querySelector('a');
    if (link) {
      redirect(link.href);
    } else if (success) {
      form.getFormElem().hide();
      block.querySelector('.form-success')?.classList.add('visible');
    } else {
      return true;
    }
    return false;
  });
}

/** The entries of the row `blocked-domains`: ids of lists in the sheet, and domains. */
const blockedEntries = (config) => (config['blocked-domains']?.text ?? '').split(',')
  .map((entry) => entry.trim()).filter(Boolean);

/** The error under the e-mail field for a personal address; it stays until the address changes. */
function workEmailError(email, show) {
  let error = email.parentElement.querySelector('.form-field-error');
  if (!error && show) {
    error = element('div', 'form-field-error', WORK_EMAIL);
    error.setAttribute('role', 'alert');
    email.after(error);
  }
  if (error) error.hidden = !show;
  email.classList.toggle('mktoInvalid', show);
  if (show) email.setAttribute('aria-invalid', 'true');
  else email.removeAttribute('aria-invalid');
}

/** The three e-mail domain checks of the source, on the lists of the sheet `form-domains`. */
function domainChecks(form, config, all) {
  const formEl = form.getFormElem()[0];
  const email = formEl.querySelector('input[name="Email"]');
  if (!email) return;
  // an entry is a domain itself, or the id of a list in the sheet
  const blocked = new Set(blockedEntries(config)
    .flatMap((id) => all[id] ?? (id.includes('.') ? [id.toLowerCase()] : [])));
  const personal = all['personal-email'] ?? [];
  const dropped = new Set(all['block-list'] ?? []);
  const domain = () => emailDomain(form.vals().Email);
  const isPersonal = () => {
    const current = domain();
    return personal.some((entry) => current === entry || current.endsWith(`.${entry}`));
  };

  const checkPersonal = () => {
    if (!form.vals().Email?.includes('@')) return;
    const show = isPersonal();
    workEmailError(email, show);
    form.submittable(!show);
    formEl.querySelectorAll('.mktoButton').forEach((button) => { button.disabled = show; });
  };
  ['input', 'blur'].forEach((type) => email.addEventListener(type, checkPersonal));

  form.onValidate(() => {
    form.submittable(true);
    checkPersonal();
    if (blocked.has(domain())) {
      const top = email.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'smooth' });
      email.classList.remove('mktoValid');
      email.classList.add('mktoInvalid');
      email.setAttribute('aria-invalid', 'true');
      form.showErrorMessage(config['domain-error']?.text ?? '', form.getFormElem().find('#Email'));
      form.submittable(false);
    }
    // as the source: these addresses see a success message, and nothing is sent
    if (!formEl.querySelector('.mktoInvalid') && dropped.has(domain())) {
      form.submittable(false);
      if (!formEl.querySelector('.form-submitted')) {
        const message = element('div', 'mktoFormRow', element('div', 'form-submitted', SUBMITTED));
        formEl.querySelector('.mktoButtonRow').before(message);
      }
    }
  });
  formEl.addEventListener('change', () => formEl.querySelector('.form-submitted')?.remove());
}

/** The source's message when the domain lists cannot be read. */
function loadingError(form) {
  const formEl = form.getFormElem()[0];
  form.submittable(false);
  const message = element('div', 'mktoError', element('div', 'mktoErrorMsg', LOADING_ERROR));
  const row = element('div', 'mktoFormRow form-loading-error', message);
  formEl.querySelector('.mktoFormRow')?.before(row);
  formEl.querySelectorAll('.mktoButton').forEach((button) => { button.disabled = true; });
}

const hiddenFields = (config) => ({
  campaign_asset: config.campaign?.text ?? '',
  contentURL: config['content-url']?.text ?? '',
  assetType: config['asset-type']?.text ?? '',
});

/** The full form of a landing or inline block. */
function setupForm(form, config, block) {
  const formEl = form.getFormElem()[0];
  preventAutoFocus(formEl);
  form.addHiddenFields({
    ...hiddenFields(config),
    dataSourceURL: pageUrl(),
    referringURL: cookie('referrer_url') || document.referrer,
    wfi: '',
  });
  form.onSubmit(() => form.addHiddenFields({ mktoTrackingID: cookie('_mkto_trk') }));
  onSuccess(form, config.success, block);
  domainLists().then((all) => domainChecks(form, config, all), () => {
    // as the source: a form that blocks domains stays closed when their lists cannot be read
    if (config['blocked-domains']) loadingError(form);
  });
  if (block.classList.contains('two-column')) {
    spanOddFields(formEl);
    formEl.addEventListener('change', (event) => {
      if (event.target.matches('select')) spanOddFields(formEl);
    });
  }
}

/** The visitor id of Adobe's Experience Cloud, when its cookie is there. */
function experienceCloudId() {
  const own = cookie('s_ecid');
  if (own.includes('|')) return own.slice(own.indexOf('|') + 1);
  const [, id] = cookie('AMCV_96E61CFE53295EF20A490D45%40AdobeOrg').match(/MCMID\|([^|]+)/) ?? [];
  return id ?? '';
}

/** Asks the source's lead service whether this visitor filled a form before. */
async function isKnownVisitor(config) {
  const ecid = experienceCloudId();
  if (!ecid) return false;
  try {
    const ids = blockedEntries(config);
    const all = await domainLists();
    const body = new URLSearchParams({
      ecid,
      domainListValues: ids.flatMap((id) => all[id] ?? []),
      customDomains: ids.filter((id) => !all[id] && id.includes('.')),
      domainRule: 'excludeDomain',
    });
    const response = await fetch(LEAD_API, { method: 'POST', body });
    return Number((await response.json()).kc) === 1;
  } catch {
    // as the source: when the service does not answer, the visitor gets the full form
    return false;
  }
}

/** A known visitor gets one button instead of the fields; it submits the short form. */
function setupShortForm(form, config, block, body) {
  const type = config['asset-type']?.text ?? '';
  const isEvent = type === 'Event';
  const button = element('button', 'form-ready-button', `View ${type}`);
  button.type = 'button';
  const title = isEvent ? 'Thanks for Registering' : 'Your Asset is Ready!';
  const ready = element('div', 'form-ready', element('h2', 'form-ready-title', title));
  if (!isEvent) {
    const text = `Welcome back! The ${type} is now ready for your viewing.`;
    ready.append(element('div', 'form-ready-text', text));
  }
  ready.append(element('div', 'form-ready-action', button));
  body.append(ready);
  block.classList.add('known-visitor');

  const code = new URLSearchParams(window.location.search).get('cmp') || cookie('s_campaign');
  form.vals({ tracking_code: code, lastTrackingCode: code, dataSourceURL: pageUrl() });
  form.addHiddenFields(hiddenFields(config));
  onSuccess(form, config.success, block);
  button.addEventListener('click', () => {
    form.submit();
    button.textContent = 'Please wait';
    button.classList.add('waiting');
  });
}

/** Landing and inline forms: the short form for a known visitor, else the full form. */
async function loadGated(block, config, parts) {
  const MktoForms2 = await loadMarketo();
  const shortId = Number(config['known-visitor-form']?.text);
  const known = shortId && await isKnownVisitor(config);
  const setup = known ? setupShortForm : setupForm;
  const id = known ? shortId : Number(config.form?.text);
  MktoForms2.loadForm(MARKETO, MUNCHKIN, id, (form) => setup(form, config, block, parts.body));
}

/**
 * A subscription form in the rail of an article, as the source's script: below 731 px the form
 * moves to the page's end, and the rail's contents list, the page's menu there, gets a link
 * to it with the label of the form's button.
 */
function moveBelowContent(block, label) {
  const wrapper = block.parentElement;
  const contents = wrapper.closest('.section-col')?.querySelector('.toc ul');
  const main = wrapper.closest('main');
  if (!contents || !main) return;
  const home = element('div', 'form-home');
  const moved = element('div', 'section form-moved');
  moved.id = 'subscribe';
  wrapper.before(home);
  if (label) {
    const link = element('a', 'form-toc-link', label);
    link.href = `#${moved.id}`;
    contents.append(element('li', 'form-toc-item', link));
  }
  const place = () => {
    if (mobile.matches) {
      main.append(moved);
      moved.append(wrapper);
    } else {
      home.after(wrapper);
      moved.remove();
    }
  };
  mobile.addEventListener('change', place);
  place();
}

/** The blog subscription form: title, form, and the message that replaces it after a submit. */
async function loadSubscribe(block, config) {
  const MktoForms2 = await loadMarketo();
  MktoForms2.loadForm(MARKETO, MUNCHKIN, Number(config.form?.text), (form) => {
    const formEl = form.getFormElem()[0];
    block.classList.add('ready');
    const tags = [...document.head.querySelectorAll('meta[property="article:tag"]')]
      .map((meta) => meta.content);
    form.addHiddenFields({
      dataSourceURL: pageUrl(),
      referringURL: cookie('referrer_url') || document.referrer,
      wfi: '',
      blogProductTags: tags.join(),
    });
    const button = formEl.querySelector('.mktoButtonRow button.mktoButton');
    if (button && config.submit) button.textContent = config.submit.text;
    onSuccess(form, config.success, block);
    preventAutoFocus(formEl);
    moveBelowContent(block, button?.textContent);
  });
}

/**
 * The date line of a webinar. As the source, it is hidden once the day is over in the
 * webinar's time zone (third cell: its UTC offset in hours).
 */
function webinarDate({ cell, extra }) {
  const line = element('p', '', ...phrase(cell));
  const wrap = element('div', 'form-text form-date', line);
  const [day] = line.textContent.replace(/^[^:：]*[:：]/, '').split('|');
  const date = new Date(day.trim());
  const offset = Number(extra?.textContent.trim());
  if (!Number.isNaN(date.getTime()) && !Number.isNaN(offset)) {
    const end = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    wrap.hidden = Date.now() + offset * 3600000 > end;
  }
  return wrap;
}

/** The left side of a landing block: title, optional date, text, optional image. */
function buildIntro(config) {
  const intro = element('div', 'form-intro');
  const cells = [...(config.intro?.children ?? [])];
  const title = cells.find((el) => el.matches('h1'));
  const images = cells.filter((el) => el.matches('p') && el.querySelector('picture, img')
    && !el.textContent.trim());
  const rest = cells.filter((el) => el !== title && !images.includes(el));
  const text = element('div', 'form-text', ...rest);
  if (title) intro.append(title);
  if (config.date) intro.append(webinarDate(config.date));
  if (text.children.length) intro.append(text);
  if (images.length) intro.append(element('div', 'form-image', ...images));
  return intro;
}

/** An empty form for Marketo to fill: it finds the element by this id. */
function marketoForm(id) {
  const form = element('form');
  form.id = `mktoForm_${id ?? ''}`;
  return form;
}

/** Title, form and, for a subscription, the message that follows a submit. */
function buildPanel(config, block) {
  const form = marketoForm(config.form?.text);
  const body = element('div', 'form-body');
  if (config.title) {
    body.append(element('h2', 'form-title', element('span', '', ...phrase(config.title.cell))));
  }
  if (block.classList.contains('subscribe')) {
    body.append(form);
    if (config.success && !config.success.cell.querySelector('a')) {
      body.append(element('div', 'form-success', ...phrase(config.success.cell)));
    }
    return { body, panel: body };
  }
  // its own box, as in the source: the margin of a form's first field stays below the title
  const fields = element('div', 'form-fields', form);
  if (config['known-visitor-form']) fields.append(marketoForm(config['known-visitor-form'].text));
  body.append(fields);
  return { body, panel: element('div', 'form-panel', body) };
}

export default function decorate(block) {
  const config = readConfig(block);
  const parts = buildPanel(config, block);
  if (block.classList.contains('landing')) {
    const side = element('div', 'form-side', parts.panel);
    block.replaceChildren(element('div', 'form-row', buildIntro(config), side));
  } else {
    block.replaceChildren(parts.panel);
  }
  if (!config.form) return;
  const load = block.classList.contains('subscribe') ? loadSubscribe : loadGated;
  // a failed library leaves the block as the source leaves it: without a form
  onView(block, () => load(block, config, parts)
    // eslint-disable-next-line no-console
    .catch((e) => console.warn(`form ${config.form.text}: no Marketo. ${e?.message ?? ''}`)));
}
