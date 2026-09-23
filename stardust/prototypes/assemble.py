"""Assemble <slug>-proposed.html from partials: head + header + <slug>-main + footer."""
import sys, json, pathlib
here = pathlib.Path(__file__).parent
slug = sys.argv[1]
meta = json.loads((here.parent / 'current/pages' / f'{slug}.json').read_text())
extra_css = f'<link rel="stylesheet" href="{slug}.css">' if (here / f'{slug}.css').exists() else ''
page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{meta["title"]}</title>
<meta name="description" content="{meta["description"]}">
<link rel="icon" type="image/svg+xml" href="https://wknd-adventures.com/favicon.svg">
<link rel="stylesheet" href="canon.css">{extra_css}
<script src="canon.js" defer></script>
</head>
<body>
{(here / 'partials/header.html').read_text()}{(here / f'partials/{slug}-main.html').read_text()}{(here / 'partials/footer.html').read_text()}</body>
</html>
'''
(here / f'{slug}-proposed.html').write_text(page)
print(f'{slug}-proposed.html', len(page))
