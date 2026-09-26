async (page) => page.evaluate(() => {
  const out = [];
  const cols = [...document.querySelectorAll('.aem-GridColumn')].filter((c) => {
    const p = c.parentElement.closest('.aem-GridColumn');
    return !p || !p.parentElement.closest('.aem-GridColumn');
  });
  for (const c of cols) {
    const r = c.getBoundingClientRect();
    if (r.height < 2) continue;
    const cls = c.className.split(/\s+/).filter((x) => !x.startsWith('aem-GridColumn')).join('.');
    const heads = [...c.querySelectorAll('h1,h2,h3,h4')].slice(0, 3).map((h) => h.textContent.trim().slice(0, 50));
    out.push(`${cls} [y=${Math.round(r.top + scrollY)} h=${Math.round(r.height)} x=${Math.round(r.left)} w=${Math.round(r.width)}] ${heads.join(' | ')}`);
  }
  const hdr = document.querySelector('header, .header, #utility-nav-bar');
  return out.join('\n');
})
