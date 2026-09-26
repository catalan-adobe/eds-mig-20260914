async (page) => {
  const OUT = '/Users/catalan/repos/ai/migration-tests/spm-tests/spm-ft-0001/migration/evidence/ref/states';
  const mobile = page.viewportSize().width < 500;
  const vp = mobile ? 'mobile' : 'desktop';
  const shot = async (name, clip) => page.screenshot({ path: `${OUT}/${vp}-${name}.png`, scale: 'css', ...(clip ? { clip } : {}) });
  await page.goto('https://www.synopsys.com/', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: '#onetrust-consent-sdk{display:none!important} .border-gradient-ask.spin{animation:none!important}' });
  await page.evaluate(() => { const $ = window.jQuery; $('.carousel-list-holder').first().slick('slickGoTo', 0, true); document.querySelector('.pause-btn').click(); $('.slider-progress-bar').stop(true).css('width', '0px'); });
  const done = [];
  if (!mobile) {
    await page.evaluate(() => window.scrollTo(0, 200)); await page.waitForTimeout(800); await shot('sticky-200'); done.push('sticky-200');
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(800);
    const items = page.locator('#topNav li.main-nav-item.has-dropdown:not(.language):visible');
    const n = await items.count();
    for (let i = 0; i < n; i += 1) {
      await items.nth(i).hover(); await page.waitForTimeout(900); await shot(`menu-${i + 1}`); done.push(`menu-${i + 1}`);
    }
    await page.mouse.move(700, 5); await page.waitForTimeout(600);
    const card = page.locator('.cards.image:visible').first();
    await page.evaluate(() => window.scrollTo(0, 900)); await page.waitForTimeout(500);
    await card.hover(); await page.waitForTimeout(1200); await shot('card-hover'); done.push('card-hover');
    const lang = page.locator('#utility-nav-bar .topbar-lang:visible').first();
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
    if (await lang.count()) { await lang.click(); await page.waitForTimeout(600); await shot('lang-open'); done.push('lang-open'); await lang.click(); }
  } else {
    const burger = await page.$('.navbar-toggler');
    await burger.click(); await page.waitForTimeout(1000); await shot('menu-open'); done.push('menu-open');
    await burger.click(); await page.waitForTimeout(800);
  }
  const next = (await page.$$('.carousel.panelcontainer .slick-next'))[1];
  await next.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  await next.click(); await page.waitForTimeout(900); await shot('news-next'); done.push('news-next');
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400);
  await page.locator('.carousel.panelcontainer .slick-dots li:nth-child(3):visible').first().click(); await page.waitForTimeout(900);
  await page.evaluate(() => { document.querySelectorAll('.slider-progress-bar').forEach((b) => { window.jQuery(b).stop(true).css('width', '0px'); }); });
  await shot('hero-slide3'); done.push('hero-slide3');
  return done;
}
