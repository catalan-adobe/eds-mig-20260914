async (page) => {
  const OUT = '/Users/catalan/repos/ai/migration-tests/spm-tests/spm-ft-0001/migration/evidence/eds/states';
  const mobile = page.viewportSize().width < 500;
  const vp = mobile ? 'mobile' : 'desktop';
  const shot = async (name) => page.screenshot({ path: `${OUT}/${vp}-${name}.png`, scale: 'css' });
  await page.goto('http://localhost:3000/spm-ft-0001/', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: '#floating-icon{animation:none!important}' });
  await page.evaluate(() => {
    document.querySelectorAll('.logo-carousel-track').forEach((el) => el.getAnimations().forEach((a) => { a.pause(); a.currentTime = 0; }));
    const hero = document.querySelector('.hero-carousel');
    const pause = hero.querySelector('.hero-carousel-pause');
    if (pause.dataset.state !== 'paused') pause.click();
    pause.dataset.state = 'playing';
    hero.querySelectorAll('.hero-carousel-progress-bar').forEach((b) => { b.style.transition = 'none'; b.style.width = '0'; });
    document.querySelectorAll('header *').forEach((el) => el.getAnimations().forEach((a) => { a.pause(); a.currentTime = 0; }));
  });
  const done = [];
  if (!mobile) {
    await page.evaluate(() => window.scrollTo(0, 200)); await page.waitForTimeout(800); await shot('sticky-200'); done.push('sticky-200');
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(800);
    const items = page.locator('.header-nav-items .header-nav-item:visible');
    const n = await items.count();
    for (let i = 0; i < n; i += 1) {
      await items.nth(i).hover(); await page.waitForTimeout(900); await shot(`menu-${i + 1}`); done.push(`menu-${i + 1}`);
    }
    await page.mouse.move(700, 5); await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollTo(0, 900)); await page.waitForTimeout(500);
    await page.locator('.cards li').first().hover(); await page.waitForTimeout(1200); await shot('card-hover'); done.push('card-hover');
    await page.mouse.move(700, 5);
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
    const lang = page.locator('.header-lang-toggle:visible').first();
    if (await lang.count()) { await lang.click(); await page.waitForTimeout(600); await shot('lang-open'); done.push('lang-open'); await lang.click(); }
  } else {
    const burger = page.locator('.header-hamburger');
    await burger.click(); await page.waitForTimeout(1000); await shot('menu-open'); done.push('menu-open');
    await burger.click(); await page.waitForTimeout(800);
  }
  const next = page.locator(mobile ? '.news-carousel-nav .news-carousel-arrow.next' : '.news-carousel-arrow-overlay.next').first();
  await next.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  await next.click(); await page.waitForTimeout(900); await shot('news-next'); done.push('news-next');
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400);
  await page.locator('.hero-carousel-tabs li:nth-child(3) button').click(); await page.waitForTimeout(900);
  await page.evaluate(() => {
    const pause = document.querySelector('.hero-carousel-pause');
    if (pause.dataset.state !== 'paused') pause.click();
    pause.dataset.state = 'playing';
    document.querySelectorAll('.hero-carousel-progress-bar').forEach((b) => { b.style.transition = 'none'; b.style.width = '0'; });
  });
  await shot('hero-slide3'); done.push('hero-slide3');
  return done;
}
