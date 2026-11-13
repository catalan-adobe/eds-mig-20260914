import { getLanguage, languageRoot } from '../../scripts/site.js';

// The source's placeholder of the blog search box, by language.
const PLACEHOLDER = { en: 'Search Blogs', 'ja-jp': 'ブログを検索', 'zh-cn': '搜索博客' };

function element(tag, className, ...children) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.append(...children);
  return el;
}

/** The search box: Enter goes to the blog landing page with the query in `q`. */
function searchBox(home) {
  const input = element('input', 'blog-nav-input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = PLACEHOLDER[getLanguage()] ?? PLACEHOLDER.en;
  input.setAttribute('aria-label', input.placeholder);
  input.value = new URLSearchParams(window.location.search).get('q') ?? '';
  const submit = element('button', 'blog-nav-submit');
  submit.type = 'submit';
  submit.setAttribute('aria-label', input.placeholder);
  const form = element('form', 'blog-nav-search', submit, input);
  form.role = 'search';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = new URL(home || `${languageRoot()}/blogs/chip-design`, window.location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim());
    window.location.href = url.href;
  });
  return element('div', 'blog-nav-field', form);
}

export default function decorate(block) {
  const [titleRow, panelRow] = [...block.children];
  const title = titleRow?.querySelector('a');
  const bar = element('div', 'blog-nav-bar');
  if (title) {
    title.className = 'blog-nav-title';
    bar.append(title);
  } else {
    bar.append(element('span', 'blog-nav-title', titleRow?.textContent.trim() ?? ''));
  }
  bar.append(searchBox(title?.href));
  const content = panelRow?.firstElementChild;
  block.replaceChildren(bar);
  if (!content) return;

  const panel = element('div', 'blog-nav-panel', ...content.childNodes);
  panel.id = 'blog-nav-panel';
  panel.hidden = true;
  const topics = element('button', 'blog-nav-topics', 'Topics');
  topics.type = 'button';
  topics.setAttribute('aria-controls', panel.id);
  topics.setAttribute('aria-expanded', 'false');
  const close = element('button', 'blog-nav-close');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close');
  panel.append(close);
  const toggle = (open) => {
    panel.hidden = !open;
    topics.setAttribute('aria-expanded', String(open));
  };
  topics.addEventListener('click', () => toggle(panel.hidden));
  close.addEventListener('click', () => toggle(false));
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !block.contains(e.target)) toggle(false);
  });
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Escape' && !panel.hidden) toggle(false);
  });
  bar.append(topics);
  block.append(element('div', 'blog-nav-holder', panel));
}
