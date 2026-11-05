const HIDDEN = {
  listname: 'backlinkoreport',
  redirect: 'https://backlinko.com/almost-done/free-updates',
  meta_redirect_onlist: 'https://backlinko.com/already-subscribed',
  meta_tags: 'sitewide-main-list-optin',
  meta_required: 'email',
};

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const [placeholder, label] = [...(rows[0]?.children ?? [])].map((c) => c.textContent.trim());
  const action = rows[1]?.querySelector('a')?.href;

  const form = document.createElement('form');
  form.method = 'post';
  if (action) form.action = action;

  const input = document.createElement('input');
  Object.assign(input, { type: 'email', name: 'email', placeholder: placeholder || 'Email Address' });
  input.setAttribute('aria-label', input.placeholder);
  input.required = true;

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = label || 'Subscribe';

  form.append(input, button);
  Object.entries(HIDDEN).forEach(([name, value]) => {
    const hidden = document.createElement('input');
    Object.assign(hidden, { type: 'hidden', name, value });
    form.append(hidden);
  });
  block.replaceChildren(form);
}
