async (page) => page.evaluate(() => {
  const fonts = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`);
  const faces = [];
  for (const ss of document.styleSheets) {
    let rules; try { rules = ss.cssRules; } catch (e) { faces.push('XS:' + ss.href); continue; }
    for (const r of rules) if (r.type === 5) faces.push(r.cssText.slice(0, 300));
  }
  const scripts = [...document.scripts].map((s) => s.src).filter(Boolean);
  const css = [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href);
  const bodyCS = getComputedStyle(document.body);
  return { fonts: [...new Set(fonts)], faces: faces.slice(0, 40), scripts, css,
    body: { ff: bodyCS.fontFamily, fs: bodyCS.fontSize, color: bodyCS.color, lh: bodyCS.lineHeight },
    swiper: !!window.Swiper, jq: !!window.jQuery, slick: !!(window.jQuery && window.jQuery.fn && window.jQuery.fn.slick), bootstrap: !!window.bootstrap };
})
