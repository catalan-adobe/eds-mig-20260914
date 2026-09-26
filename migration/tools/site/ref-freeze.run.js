async (page) => page.evaluate(() => {
  const $ = window.jQuery;
  const hero = $('.carousel-list-holder').first();
  hero.slick('slickGoTo', 0, true);
  const btn = document.querySelector('[carousel-type="banner-carousel"] .pause-btn');
  if (!hero.get(0).slick.paused) btn.click();
  $('.slider-progress-bar').stop(true).css('width', '0px');
  return { current: hero.get(0).slick.currentSlide, paused: hero.get(0).slick.paused };
})
