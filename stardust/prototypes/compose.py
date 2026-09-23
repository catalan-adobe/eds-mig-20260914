"""Compose partials/<slug>-main.html from a captured page: canon class vocabulary, verbatim content.

Walks the captured <main>, re-emits every element with the canon classes (CLASS_MAP), drops
presentation-only wrappers, rebuilds tabs with ARIA state, and absolutizes media URLs.
Unknown source classes are reported so the canon grows deliberately, never silently.
"""
import pathlib
import re
import sys

from bs4 import BeautifulSoup, Comment, NavigableString, Tag

HERE = pathlib.Path(__file__).parent
ORIGIN = 'https://wknd-adventures.com/'

CLASS_MAP = {
    'hero-section': 'hero', 'hero-section--full': 'hero--full', 'hero-bg': 'hero-bg',
    'hero-content': 'hero-content', 'hero-content-inner': 'hero-inner', 'hero-lead': 'hero-lead',
    'section': 'section', 'secondary-section': 'section--secondary',
    'inverse-section': 'section--inverse', 'accent-section': 'section--accent',
    'blog-article-section': 'article', 'utility-padding-top-0': '',
    'container': 'container', 'container--narrow': 'container--narrow',
    'blog-article-container': 'article-container', 'utility-text-align-center': 'center',
    'section-heading': 'section-heading', 'text-button': 'text-button',
    'button-group': 'button-group', 'button-group--centered': 'button-group--centered',
    'button': 'button', 'accent-button': 'button button--accent', 'button--ghost': 'button button--ghost',
    'tag': 'tag', 'paragraph-xl': 'p-xl', 'paragraph-lg': 'p-lg', 'paragraph-sm': 'p-sm',
    'utility-text-secondary': 'muted',
    'utility-margin-bottom-sm': 'mb-sm', 'utility-margin-bottom-md': 'mb-md',
    'utility-margin-bottom-lg': 'mb-lg', 'utility-margin-bottom-xl': 'mb-xl',
    'utility-margin-top-lg': 'mt-lg',
    'grid-layout': 'grid', 'desktop-3-column': 'grid--3', 'desktop-4-column': 'grid--4',
    'grid-layout--2col': '', 'grid-gap-md': 'gap-md', 'grid-gap-lg': 'gap-lg', 'grid-gap-xl': '',
    'tablet-1-column': '', 'grid-images': '', 'grid-align-center': 'align-center', 'span-2': 'span-2',
    'article-card': 'article-card', 'article-card-image': 'article-card-image',
    'article-card-body': 'article-card-body', 'article-card-meta': 'article-card-meta',
    'article-card-byline': 'article-card-byline', 'article-card-location': 'article-card-location',
    'featured-article': 'featured', 'featured-article-image': 'featured-image',
    'featured-article-footer': 'featured-footer',
    'article-byline': 'article-byline', 'article-byline-name': 'article-byline-name',
    'article-byline-meta': 'article-byline-meta', 'avatar': 'avatar',
    'card': 'card', 'card-body': 'card-body', 'cover-image': 'cover-image',
    'editorial-index': 'editorial-index', 'editorial-index-item': 'editorial-item',
    'editorial-index-number': 'editorial-number',
    'faq-list': 'faq', 'faq-item': 'faq-item', 'faq-question': 'faq-question',
    'faq-answer': 'faq-answer', 'faq-icon': 'faq-icon',
    'ticker-strip': 'ticker', 'ticker-track': 'ticker-track', 'ticker-sep': 'ticker-sep',
    'gallery-img': 'gallery-img', 'gallery-img--wide': 'gallery-img gallery-img--wide',
    'blog-content': 'article-body', 'blog-content-body': '', 'blog-gear-list': 'gear-list',
    'pull-quote': 'pull-quote', 'pull-quote-body': 'pull-quote-body',
    'pull-quote-attribution': 'pull-quote-attribution',
    'team-profile-grid': 'team-profile-grid', 'team-profile-row': 'team-profile-row',
    'team-profile-spacer': 'team-profile-spacer', 'team-profile-col': 'team-profile-col',
    'team-profile-bio': 'team-profile-bio', 'profile-circle': 'profile-circle',
    'profile-name': 'profile-name', 'tab-pane--padded': 'tab-pane--padded',
    'tab-container--wide': '', 'tab-container': '', 'tab-pane': '', 'tab-menu': '', 'tab-menu-link': '', 'is-active': '',
}
HEADING = re.compile(r'^h([1-6])-heading$')
KEEP_ATTRS = ('href', 'src', 'alt', 'id', 'loading', 'fetchpriority', 'width', 'height', 'role')
VOID = {'img', 'br', 'hr'}
unknown = set()


def absolute(url):
    if url.startswith(('http', '#', 'mailto:')):
        return url
    return ORIGIN + re.sub(r'^(\.\./|\./|/)+', '', url)


def classes(el):
    out = []
    for c in el.get('class', []):
        m = HEADING.match(c)
        if m:
            if el.name != f'h{m.group(1)}':
                out.append(f'h{m.group(1)}')
        elif c in CLASS_MAP:
            out.extend(filter(None, CLASS_MAP[c].split()))
        else:
            unknown.add(c)
    return list(dict.fromkeys(out))


def attrs(el, cls):
    parts = [f'class="{" ".join(cls)}"'] if cls else []
    for a in KEEP_ATTRS:
        if el.has_attr(a):
            v = absolute(el[a]) if a == 'src' else el[a]
            parts.append(f'{a}="{v}"')
    return (' ' + ' '.join(parts)) if parts else ''


def emit(node):
    if isinstance(node, Comment):
        return ''
    if isinstance(node, NavigableString):
        return str(node).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    el: Tag = node
    cls = el.get('class', [])
    if 'overlay' in cls:
        return ''
    if 'button-label' in cls and el.name == 'span':
        return ''.join(emit(c) for c in el.children)
    if el.name == 'span' and not cls and el.parent and 'text-button' in el.parent.get('class', []):
        return ''.join(emit(c) for c in el.children)
    out_cls = classes(el)
    extra = ''
    if 'faq-question' in cls:
        extra = ' aria-expanded="false"'
    if el.has_attr('data-tabs'):
        out_cls.append('tabs')
    if 'tab-menu' in cls:
        out_cls, extra = ['tab-menu'], ' role="tablist"'
    if 'tab-menu-link' in cls:
        selected = 'is-active' in cls
        out_cls = ['tab-link']
        extra = f' role="tab" aria-selected="{str(selected).lower()}" aria-controls="{el["data-tab"]}"'
    if 'tab-pane' in cls:
        out_cls = ['tab-pane', *out_cls]
        extra = ' role="tabpanel"' + ('' if 'is-active' in cls else ' hidden')
    parent_cls = el.parent.get('class', []) if el.parent else []
    if el.name == 'div' and not cls and 'tab-container' in parent_cls and el is el.parent.find_all('div', recursive=False)[-1]:
        out_cls = ['tab-panels']
    inner = '' if el.name in VOID else ''.join(emit(c) for c in el.children)
    close = '' if el.name in VOID else f'</{el.name}>'
    return f'<{el.name}{attrs(el, out_cls)}{extra}>{inner}{close}'


def main(slug):
    soup = BeautifulSoup((HERE.parent / 'current/pages' / f'{slug}.html').read_text(), 'html.parser')
    root = soup.find('main')
    body = ''.join(emit(c) for c in root.children)
    (HERE / f'partials/{slug}-main.html').write_text(f'<main id="main-content">{body}</main>\n')
    print(f'partials/{slug}-main.html', len(body), 'unknown classes:', sorted(unknown) or 'none')


if __name__ == '__main__':
    main(sys.argv[1])
