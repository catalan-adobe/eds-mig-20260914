// WKND replica — shared interaction layer. Every behaviour below was OBSERVED
// firing on the live page (stardust/replica/motion/us-en-html.json, -360.json)
// and its mechanism lifted from clientlib-site.min.js (stardust/replica/lifts/).
(function () {
  var body = document.body;

  // 1. Scroll-state chrome morph: body.scrolly when scrollTop > 15 (same class, same threshold).
  function scrolly() { body.classList.toggle('scrolly', window.scrollY > 15); }
  scrolly();
  document.addEventListener('scroll', scrolly, { capture: false, passive: true });

  // 2. Carousel: prev/next buttons and indicator clicks swap the active item + indicator
  //    (the lifted fadeIn 0.5s runs on the item's display:none → block).
  document.querySelectorAll('.carousel').forEach(function (carousel) {
    var items = carousel.querySelectorAll('.carousel__item');
    var dots = carousel.querySelectorAll('.carousel__indicator');
    function show(index) {
      var n = items.length; index = (index + n) % n;
      items.forEach(function (item, i) {
        item.classList.toggle('carousel__item--active', i === index);
        if (dots[i]) { dots[i].classList.toggle('carousel__indicator--active', i === index); dots[i].setAttribute('aria-selected', i === index ? 'true' : 'false'); }
      });
    }
    function active() { return Array.prototype.findIndex.call(items, function (i) { return i.classList.contains('carousel__item--active'); }); }
    var prev = carousel.querySelector('.carousel__action--previous');
    var next = carousel.querySelector('.carousel__action--next');
    if (prev) prev.addEventListener('click', function () { show(active() - 1); });
    if (next) next.addEventListener('click', function () { show(active() + 1); });
    dots.forEach(function (dot, i) { dot.addEventListener('click', function () { show(i); }); });
  });

  // 3. Language menu toggle: click → nav.showMenu + a.open, menu left = toggle left − 240;
  //    a click anywhere else closes it (lifted from the clientlib's window.onclick handler).
  var langToggle = document.getElementById('langNavToggleHeader');
  var langMenu = document.querySelector('.language-nav__menu');
  if (langToggle && langMenu) {
    langToggle.addEventListener('click', function (e) {
      e.preventDefault();
      langMenu.style.left = (langToggle.getBoundingClientRect().left + window.scrollX - 240) + 'px';
      langMenu.classList.toggle('showMenu');
      langToggle.classList.toggle('open');
      langToggle.setAttribute('aria-expanded', 'true');
    });
    window.addEventListener('click', function (e) {
      if (e.target !== langToggle && langToggle.classList.contains('open')) {
        langMenu.classList.remove('showMenu');
        langToggle.classList.remove('open');
        langToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 4. Off-canvas mobile nav: #toggleNav click → body.navPanel-visible (0.5s transform);
  //    a click outside the panel, or on a panel link, hides it (panel plugin: hideOnClick).
  var toggleNav = document.getElementById('toggleNav');
  var mobileNav = document.getElementById('mobileNav');
  if (toggleNav && mobileNav) {
    var cls = 'navPanel-visible';
    toggleNav.addEventListener('click', function (e) { e.preventDefault(); body.classList.toggle(cls); });
    mobileNav.addEventListener('click', function (e) { if (e.target.closest('a')) body.classList.remove(cls); });
    document.addEventListener('click', function (e) {
      if (body.classList.contains(cls) && !toggleNav.contains(e.target) && !mobileNav.contains(e.target)) body.classList.remove(cls);
    });
  }
})();
