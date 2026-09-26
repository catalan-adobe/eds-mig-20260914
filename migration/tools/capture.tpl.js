async (page) => {
  const W = __W__;
  const H = __H__;
  if (W) await page.setViewportSize({ width: W, height: H });
  await page.clock.install();
  await page.goto('__URL__', { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: `__CSS__` });
  await page.evaluate(async () => {
    const step = Math.floor(window.innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => { setTimeout(r, 250); });
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);
  await page.evaluate(() => Promise.all([...document.images].filter((i) => !i.complete && i.loading !== 'lazy')
    .map((i) => new Promise((r) => { i.onload = r; i.onerror = r; setTimeout(r, 8000); }))));
  await page.evaluate(() => document.fonts.ready);
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(now + 50));
  await page.evaluate(() => { __PREP__ });
  await page.waitForTimeout(700);
  await page.screenshot({ path: '__OUT__-top.png', scale: 'css' });
  await page.addStyleTag({ content: `__FULLCSS__` });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '__OUT__-full.png', fullPage: true, scale: 'css' });
  const boxes = await page.evaluate(() => {
    const box = (e) => { const r = e.getBoundingClientRect(); return [0, Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height)]; };
    const out = { H: document.documentElement.scrollHeight };
    [...document.querySelectorAll('main > .section')].filter((e) => e.getBoundingClientRect().height > 0)
      .forEach((e, i) => { out[`section${i}`] = box(e); });
    const f = document.querySelector('footer');
    if (f) out.footer = box(f);
    return out;
  });
  await page.clock.resume();
  return { w: page.viewportSize().width, h: page.viewportSize().height, ...boxes };
}
