// WKND canon behaviours — only what motion-observe recorded on the live site
// (stardust/replica/motion/us-en-html.json, us-en-html-360.json). No frameworks.
(function () {
  var body = document.body;

  // body.scrolly at scrollTop > 15 (clientlib-site.js) — drives the fixed header's padding morph.
  var scrolly = function () { body.classList.toggle('scrolly', window.scrollY > 15); };
  scrolly();
  document.addEventListener('scroll', scrolly, { capture: false, passive: true });

  // Language menu: toggle click → .showMenu on the menu + .open on the toggle; any other click closes.
  var toggle = document.getElementById('langNavToggleHeader');
  var menu = document.querySelector('.language-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      menu.style.left = (toggle.offsetLeft - 240) + 'px';
      menu.classList.toggle('showMenu');
      toggle.classList.toggle('open');
      toggle.setAttribute('aria-expanded', toggle.classList.contains('open'));
    });
    window.addEventListener('click', function (e) {
      if (e.target !== toggle && toggle.classList.contains('open')) {
        menu.classList.remove('showMenu');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Mobile nav panel: hamburger click → body.navPanel-visible; click outside the panel closes it.
  var navToggle = document.querySelector('.nav-toggle a');
  var panel = document.querySelector('.mobile-nav');
  if (navToggle && panel) {
    navToggle.addEventListener('click', function (e) {
      e.preventDefault();
      body.classList.toggle('navPanel-visible');
    });
    document.addEventListener('click', function (e) {
      if (body.classList.contains('navPanel-visible') && !panel.contains(e.target) && !navToggle.contains(e.target)) {
        body.classList.remove('navPanel-visible');
      }
    });
  }

  // Carousel: previous/next/indicator click → move --active on item + indicator (fadeIn via CSS).
  document.querySelectorAll('.carousel').forEach(function (carousel) {
    var items = Array.prototype.slice.call(carousel.querySelectorAll('.carousel__item'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.carousel__indicator'));
    var show = function (i) {
      var n = (i + items.length) % items.length;
      items.forEach(function (el, k) { el.classList.toggle('carousel__item--active', k === n); });
      dots.forEach(function (el, k) { el.classList.toggle('carousel__indicator--active', k === n); });
    };
    var current = function () { return Math.max(0, items.findIndex(function (el) { return el.classList.contains('carousel__item--active'); })); };
    var prev = carousel.querySelector('.carousel__action--previous');
    var next = carousel.querySelector('.carousel__action--next');
    if (prev) prev.addEventListener('click', function () { show(current() - 1); });
    if (next) next.addEventListener('click', function () { show(current() + 1); });
    dots.forEach(function (dot, k) { dot.addEventListener('click', function () { show(k); }); });
  });
})();
