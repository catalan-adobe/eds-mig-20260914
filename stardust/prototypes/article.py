"""Author partials/<slug>-main.html for an article page: authored template, verbatim captured content."""
import html
import pathlib
import re
import sys

here = pathlib.Path(__file__).parent
slug = sys.argv[1]
src = (here.parent / 'current/pages' / f'{slug}.html').read_text()
ORIGIN = 'https://wknd-adventures.com/'


def one(pattern, text=src):
    m = re.search(pattern, text, re.S)
    if not m:
        raise SystemExit(f'{slug}: no match for {pattern!r}')
    return m.group(1)


def absolute(url):
    return ORIGIN + re.sub(r'^(\.\./|/)+', '', url)


def img(tag, cls='', loading=' loading="lazy"'):
    s = absolute(one(r'src="([^"]+)"', tag))
    a = one(r'alt="([^"]*)"', tag)
    c = f' class="{cls}"' if cls else ''
    return f'<img{c} src="{s}" alt="{a}"{loading}>'


def section(cls):
    return one(r'(<section class="' + cls + r'".*?</section>)')


def clean_body(body):
    body = re.sub(r'\s(class|loading)="[^"]*"', '', body)
    body = body.replace('<ul>', '<ul class="gear-list">')
    return re.sub(r'src="([^"]+)"', lambda m: f'src="{absolute(m.group(1))}"', body)


hero = section('hero-section')
body = one(r'<div class="blog-content blog-content-body">(.*?)</div>\s*</div>\s*</section>')
aside = section('section secondary-section')
field = section('section inverse-section')
more = re.findall(r'<section class="section">.*?</section>', src, re.S)[-1]

aside_items = re.findall(r'<li>(.*?)</li>', aside)
cards = re.findall(r'<a href="([^"]+)" class="article-card">(.*?)</a>', more, re.S)
gallery = re.findall(r'<img[^>]*class="gallery-img[^"]*"[^>]*>', field)

out = [f'''<main id="main-content">
  <section class="hero">
    <div class="hero-bg">{img(re.search(r'<img[^>]*>', hero).group(0), loading=' fetchpriority="high"')}</div>
    <div class="container hero-content">
      <span class="tag">{one(r'<span class="tag">(.*?)</span>', hero)}</span>
      <h1>{one(r'<h1[^>]*>(.*?)</h1>', hero)}</h1>
      <div class="article-byline">
        <div class="avatar">{img(one(r'<div class="avatar">(<img[^>]*>)', hero), loading='')}</div>
        <div>
          <p class="article-byline-name">{one(r'article-byline-name">(.*?)</p>', hero)}</p>
          <p class="article-byline-meta">{one(r'article-byline-meta">(.*?)</p>', hero)}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section article">
    <div class="container article-container">
      <div class="article-body">{clean_body(body)}</div>
    </div>
  </section>

  <section class="section section--secondary">
    <div class="container">
      <div class="grid grid--3 gap-lg article-aside">
        <div>
          <h3>{one(r'<h3[^>]*>(.*?)</h3>', aside)}</h3>
          <ul class="gear-list">{''.join(f'<li>{i}</li>' for i in aside_items)}</ul>
        </div>
        <div class="span-2">
          <blockquote class="pull-quote">
            <p class="pull-quote-body">{one(r'pull-quote-body">(.*?)</p>', aside)}</p>
            <cite class="pull-quote-attribution">{one(r'<cite[^>]*>(.*?)</cite>', aside)}</cite>
          </blockquote>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--inverse">
    <div class="container">
      <div class="section-heading"><h2>{one(r'<h2[^>]*>(.*?)</h2>', field)}</h2><a class="text-button" href="../field-notes.html">Field Notes</a></div>
      <div class="grid grid--3 gap-lg">
        {''.join(img(g, 'gallery-img') for g in gallery[:3])}
      </div>
      <div class="mt-lg">{img(gallery[3], 'gallery-img gallery-img--wide')}</div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-heading"><h2>{one(r'<h2[^>]*>(.*?)</h2>', more)}</h2></div>
      <div class="grid grid--3 gap-lg">''']
for href, inner in cards:
    out.append(f'''
        <a class="article-card" href="{href}"><div class="article-card-image">{img(re.search(r'<img[^>]*>', inner).group(0))}</div><div class="article-card-body"><div class="article-card-meta"><span class="tag">{one(r'<div class="tag">(.*?)</div>', inner)}</span></div><h3 class="h5">{one(r'<h3[^>]*>(.*?)</h3>', inner)}</h3><p class="p-sm muted">{one(r'<p[^>]*>(.*?)</p>', inner)}</p></div></a>''')
out.append('''
      </div>
    </div>
  </section>
</main>
''')
(here / f'partials/{slug}-main.html').write_text(''.join(out))
print(f'partials/{slug}-main.html', len(''.join(out)), 'cards', len(cards), 'gallery', len(gallery))
