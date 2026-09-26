async (page) => page.evaluate(() => {
  const box = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height)]; };
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity !== 0; };
  const style = (e) => { const s = getComputedStyle(e); return `${s.fontFamily.split(',')[0]} ${s.fontWeight} ${s.fontSize}/${s.lineHeight} ls=${s.letterSpacing} c=${s.color}${s.textTransform !== 'none' ? ' tt=' + s.textTransform : ''}`; };
  const sections = [
    ['utility', '#utility-nav-bar'], ['nav', '#topNav'],
    ...[...document.querySelectorAll('.site-wrapper .aem-Grid > .aem-GridColumn > .aem-Grid > .aem-GridColumn')].map((e, i) => [`s${i}-${e.className.split(' ')[0]}`, e]),
    ['footer', '.experiencefragment:last-of-type'],
  ];
  const out = [];
  for (const [name, sel] of sections) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el || !vis(el)) { out.push({ name, missing: true }); continue; }
    const s = getComputedStyle(el);
    const texts = [...el.querySelectorAll('h1,h2,h3,h4,h5,h6,p,a,button,span,li,div')]
      .filter((t) => vis(t) && [...t.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
      .slice(0, 80).map((t) => ({ tag: t.tagName.toLowerCase(), cls: String(t.className).slice(0, 40), text: [...t.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').slice(0, 120), box: box(t), style: style(t), href: t.getAttribute('href') || undefined }));
    const imgs = [...el.querySelectorAll('img')].filter(vis).map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, box: box(i), nat: [i.naturalWidth, i.naturalHeight], fit: getComputedStyle(i).objectFit }));
    const svgs = [...el.querySelectorAll('svg')].filter(vis).length;
    const bgs = [...el.querySelectorAll('*')].filter((e) => vis(e) && getComputedStyle(e).backgroundImage !== 'none').slice(0, 12).map((e) => ({ cls: String(e.className).slice(0, 50), bg: getComputedStyle(e).backgroundImage.slice(0, 200), box: box(e) }));
    out.push({ name, box: box(el), bg: s.backgroundColor, texts, imgs, svgs, bgs });
  }
  return out;
})
