async (page) => page.evaluate(() => {
  const box = (e) => { const r = e.getBoundingClientRect(); return [0, Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height)]; };
  const out = {};
  const secs = [...document.querySelectorAll('main > .section')].filter((s) => s.getBoundingClientRect().height > 0);
  secs.forEach((s, i) => { out[`section${i}`] = box(s); });
  const f = document.querySelector('footer');
  if (f) out.footer = box(f);
  out.H = document.documentElement.scrollHeight;
  return out;
})
