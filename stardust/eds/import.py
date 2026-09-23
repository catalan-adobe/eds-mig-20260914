"""Import captured WKND pages into DA documents (content/<path>.html).

Text is verbatim from stardust/current/pages/<slug>.html; only structure is mapped:
source <section> → EDS section (+ section-metadata style), source module → block table.
Usage: python3 stardust/eds/import.py [<slug> …]   (no slug = every page in state.json)
"""
import html
import json
import pathlib
import re
import sys
import urllib.parse

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = pathlib.Path(__file__).resolve().parents[2]
PAGES = ROOT / 'stardust/current/pages'
OUT = ROOT / 'content'
MEDIA = 'https://content.da.live/catalan-adobe/eds-mig-20260914/media/site/'
SOURCE_HOST = 'wknd-adventures.com'
deviations = []


def page_path(url):
    path = urllib.parse.urlparse(url).path
    path = re.sub(r'(index)?\.html$', '', path).rstrip('/')
    return path or '/index'


def link(href, base):
    if href.startswith(('#', 'mailto:', 'tel:')):
        return href
    absu = urllib.parse.urljoin(base, href)
    u = urllib.parse.urlparse(absu)
    if u.netloc != SOURCE_HOST:
        return absu
    path = re.sub(r'(index)?\.html$', '', u.path)
    path = path.rstrip('/') or '/'
    return path + (f'#{u.fragment}' if u.fragment else '')


def img(el, base):
    src = urllib.parse.urljoin(base, el['src'])
    rel = urllib.parse.urlparse(src).path.lstrip('/')
    return f'<img src="{MEDIA}{rel}" alt="{html.escape(el.get("alt", ""), quote=True)}">'


def inline(el, base):
    """Inline content of an element: text, a, strong, em, br kept; everything else unwrapped."""
    out = ''
    for c in el.children:
        if isinstance(c, NavigableString):
            out += html.escape(str(c), quote=False)
        elif c.name == 'a':
            out += f'<a href="{link(c["href"], base)}">{inline(c, base)}</a>'
        elif c.name in ('strong', 'b', 'em', 'i', 'br', 'code', 'sup', 'sub'):
            tag = {'b': 'strong', 'i': 'em'}.get(c.name, c.name)
            out += '<br>' if tag == 'br' else f'<{tag}>{inline(c, base)}</{tag}>'
        elif c.name == 'img':
            out += img(c, base)
        else:
            out += inline(c, base)
    return out.strip()


def button(a, base):
    cls = a.get('class', [])
    text = inline(a, base)
    core = f'<a href="{link(a["href"], base)}">{text}</a>'
    if 'accent-button' in cls:
        return f'<p><strong><em>{core}</em></strong></p>'
    if 'button--ghost' in cls:
        return f'<p><em>{core}</em></p>'
    return f'<p><strong>{core}</strong></p>'


def is_(el, cls):
    return isinstance(el, Tag) and cls in el.get('class', [])


def default(el, base):
    """One default-content element (or a container of them) → DA HTML."""
    if not isinstance(el, Tag):
        return ''
    cls = el.get('class', [])
    if 'tag' in cls:
        return f'<p><strong>{inline(el, base)}</strong></p>'
    if 'button-group' in cls:
        return ''.join(button(a, base) for a in el.find_all('a'))
    if 'section-heading' in cls:
        return ''.join(default(c, base) for c in el.children)
    if 'text-button' in cls:
        return f'<p><a href="{link(el["href"], base)}">{inline(el, base)}</a></p>'
    if el.name == 'a' and ({'button', 'button--ghost', 'accent-button'} & set(cls)):
        return button(el, base)
    if el.name in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'):
        return f'<{el.name}>{inline(el, base)}</{el.name}>'
    if el.name in ('ul', 'ol'):
        return f'<{el.name}>' + ''.join(f'<li>{inline(li, base)}</li>' for li in el.find_all('li', recursive=False)) + f'</{el.name}>'
    if el.name == 'blockquote':
        return '<blockquote>' + ''.join(default(c, base) for c in el.children) + '</blockquote>'
    if el.name == 'figure':
        cap = el.find('figcaption')
        return f'<p>{img(el.find("img"), base)}</p>' + (f'<p><em>{inline(cap, base)}</em></p>' if cap else '')
    if el.name == 'img':
        return f'<p>{img(el, base)}</p>'
    if el.name == 'div':
        return ''.join(default(c, base) for c in el.children)
    raise SystemExit(f'unmapped default element <{el.name} class="{" ".join(cls)}">')


def block(name, rows):
    body = ''.join('<div>' + ''.join(f'<div>{cell}</div>' for cell in row) + '</div>' for row in rows)
    return f'<div class="{name}">{body}</div>'


def card(a, base):
    """a.article-card → one cell: image, tag, linked title, summary."""
    tag = a.select_one('.tag')
    title = a.find(['h3', 'h4', 'h5', 'h6'])
    summary = a.select_one('.article-card-body > p')
    cell = img(a.find('img'), base)
    cell += f'<p><strong>{inline(tag, base)}</strong></p>' if tag else ''
    cell += f'<h3><a href="{link(a["href"], base)}">{inline(title, base)}</a></h3>'
    cell += f'<p>{inline(summary, base)}</p>' if summary else ''
    return cell


def featured(el, base):
    media = el.select_one('.featured-article-image')
    if media.name == 'a':
        deviations.append({'kind': 'drop-duplicate-link', 'source': media['href'],
                           'target': 'button href', 'reason': 'image link repeats the Read button href; EDS cell keeps the image only'})
    text = [c for c in el.find_all(recursive=False) if c is not media][0]
    cell = ''
    for c in text.children:
        if is_(c, 'featured-article-footer'):
            cell += ''.join(button(a, base) for a in c.find_all('a'))
        else:
            cell += default(c, base)
    return block('featured', [[img(media.find('img'), base), cell]])


def tabs(el, base):
    rows = []
    team = bool(el.select('.team-profile-grid'))
    for btn in el.select('.tab-menu-link'):
        pane = el.find(id=btn['data-tab'])
        if team:
            col = pane.select_one('.team-profile-col')
            name = col.select_one('.profile-name')
            role = col.select_one('.team-profile-col p.paragraph-sm')
            cell = img(col.find('img'), base) + f'<p><strong>{inline(name, base)}</strong></p>'
            cell += f'<p><em>{inline(role, base)}</em></p>' if role else ''
            cell += ''.join(default(p, base) for p in pane.select('.team-profile-bio > *'))
            rows.append([inline(btn, base), cell])
        else:
            rows.append([inline(btn, base)] + [card(a, base) for a in pane.select('a.article-card')])
    return block('tabs team' if team else 'tabs', rows)


def grid(el, base, nxt):
    """.grid-layout → cards | panels | gallery | article-aside | columns."""
    kids = el.find_all(recursive=False)
    if el.select('a.article-card'):
        return block('cards', [[card(a, base)] for a in el.select('a.article-card')])
    if el.select('.card-body'):
        promo = 'grid-layout--2col' in el.get('class', [])
        return block('panels promo' if promo else 'panels',
                     [[''.join(default(c, base) for c in k.children)] for k in kids])
    if el.select('.gallery-img'):
        rows = [[img(i, base) for i in el.select('img')]]
        if nxt is not None and nxt.select('.gallery-img--wide') and not nxt.select('.grid-layout'):
            rows.append([img(i, base) for i in nxt.select('img')])
        return block('gallery', rows)
    if el.select('.pull-quote'):
        aside, quote = kids
        q = quote.select_one('.pull-quote')
        cells = [''.join(default(c, base) for c in aside.children),
                 f'<blockquote><p>{inline(q.select_one(".pull-quote-body"), base)}</p>'
                 f'<p>{inline(q.find("cite"), base)}</p></blockquote>']
        return block('article-aside', [cells])
    return block('columns', [[''.join(default(c, base) for c in k.children) if k.name != 'img' else img(k, base)
                              for k in kids]])


def editorial(el, base):
    rows = []
    for item in el.select('.editorial-index-item'):
        num = item.select_one('.editorial-index-number')
        body = [c for c in item.find_all(recursive=False) if c is not num][0]
        rows.append([inline(num, base), ''.join(default(c, base) for c in body.children)])
    return block('editorial-index', rows)


def accordion(el, base):
    rows = []
    for item in el.select('.faq-item'):
        q = item.select_one('.faq-question span')
        rows.append([inline(q, base), f'<p>{inline(item.select_one(".faq-answer"), base)}</p>'])
    return block('accordion', rows)


def hero(sec, base):
    content = sec.select_one('.hero-content-inner') or sec.select_one('.hero-content > .container')
    cell = ''
    for c in content.children:
        if is_(c, 'article-byline'):
            cell += f'<p>{img(c.find("img"), base)}</p>'
            cell += ''.join(f'<p>{inline(p, base)}</p>' for p in c.find_all('p'))
        else:
            cell += default(c, base)
    variant = 'hero full' if 'hero-section--full' in sec.get('class', []) else 'hero'
    return block(variant, [[img(sec.select_one('.hero-bg img'), base)], [cell]])


def ticker(sec, base):
    items = [inline(s, base) for s in sec.select('.ticker-track > span:not(.ticker-sep)')]
    return block('ticker', [['<ul>' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>']])


def container_body(cont, base):
    out = ''
    kids = [k for k in cont.children if isinstance(k, Tag)]
    skip = set()
    for i, k in enumerate(kids):
        if id(k) in skip:
            continue
        cls = k.get('class', [])
        nxt = kids[i + 1] if i + 1 < len(kids) else None
        if 'featured-article' in cls:
            out += featured(k, base)
        elif k.has_attr('data-tabs') or 'tab-container' in cls:
            out += tabs(k, base)
        elif 'grid-layout' in cls:
            out += grid(k, base, nxt)
            if nxt is not None and k.select('.gallery-img') and nxt.select('.gallery-img--wide'):
                skip.add(id(nxt))
        elif 'editorial-index' in cls:
            out += editorial(k, base)
        elif 'faq-list' in cls or k.select('.faq-item'):
            out += accordion(k, base)
        elif 'blog-content' in cls:
            out += ''.join(default(c, base) for c in k.children)
        else:
            out += default(k, base)
    return out


def styles(sec, cont):
    cls = sec.get('class', [])
    s = [n for n, c in (('secondary', 'secondary-section'), ('inverse', 'inverse-section'),
                        ('accent', 'accent-section'), ('article', 'blog-article-section')) if c in cls]
    ccls = cont.get('class', [])
    s += ['narrow'] if 'container--narrow' in ccls else []
    s += ['center'] if 'utility-text-align-center' in ccls else []
    s += ['heading-link'] if cont.select(':scope > .section-heading > .text-button') else []
    head = cont.select_one(':scope > .section-heading')
    after = head.find_next_sibling() if head else None
    if after is not None and after.name in ('p', 'ul', 'ol', 'h3', 'figure', 'div') and not (
            after.get('class') and set(after.get('class')) & {'grid-layout', 'tab-container', 'editorial-index',
                                                               'faq-list', 'featured-article', 'button-group', 'tab-menu'}) \
            and not after.select('.faq-item, .grid-layout, .article-card'):
        s.append('heading-gap')
    s += ['lists-xl'] if cont.select(':scope > ul.utility-margin-bottom-xl') else []
    ps = cont.select(':scope > p:not(.tag), :scope > .section-heading ~ p')
    s += ['muted'] if ps and all('utility-text-secondary' in p.get('class', []) for p in ps) else []
    return s


def section_divs(sec, base):
    if 'hero-section' in sec.get('class', []):
        return [hero(sec, base)]
    if 'ticker-strip' in sec.get('class', []):
        return [ticker(sec, base)]
    conts = sec.select(':scope > .container') or [sec]
    out = []
    for n, cont in enumerate(conts):
        st = styles(sec, cont) + (['continued'] if n else [])
        if sec.has_attr('data-tabs'):  # tabs on the <section> itself (about/team)
            body = default(cont.select_one('.section-heading'), base) + tabs(sec, base)
        else:
            body = container_body(cont, base)
        meta = block('section-metadata', [['style', ', '.join(st)]]) if st else ''
        out.append(body + meta)
    return out


def convert(slug):
    src = (PAGES / f'{slug}.html').read_text()
    page = json.loads((PAGES / f'{slug}.json').read_text())
    base = page['url']
    main = BeautifulSoup(src, 'html.parser').find('main')
    sections = []
    for sec in main.find_all(recursive=False):
        sections += section_divs(sec, base)
    meta = block('metadata', [['title', html.escape(page['title'])], ['description', html.escape(page['description'])]])
    sections[-1] += meta
    body = ''.join(f'<div>{s}</div>' for s in sections)
    path = page_path(page['url'])
    out = OUT / f'{path.lstrip("/")}.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(f'<body><header></header><main>{body}</main><footer></footer></body>\n')
    return path, len(sections)


if __name__ == '__main__':
    state = json.loads((ROOT / 'stardust/state.json').read_text())
    slugs = sys.argv[1:] or [p['slug'] for p in state['pages']]
    for slug in slugs:
        deviations.clear()
        path, n = convert(slug)
        print(f'{slug} → content{path}.html  ({n} sections{", " + str(len(deviations)) + " deviation(s)" if deviations else ""})')
        if deviations:
            (ROOT / 'stardust/.work/eds').mkdir(parents=True, exist_ok=True)
            (ROOT / f'stardust/.work/eds/{slug}.deviations.json').write_text(json.dumps(deviations, indent=1))
