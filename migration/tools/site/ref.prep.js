const $ = window.jQuery;
if ($) {
  $('.logo-carousel .slick-track').css('transition', 'none');
  $('.slick-initialized').each(function reset() { $(this).slick('slickGoTo', 0, true); });
  $('.slider-progress-bar').stop(true).css('width', '0px');
}
