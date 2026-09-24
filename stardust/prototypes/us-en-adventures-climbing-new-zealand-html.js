// Program archetype behaviours — only what motion-observe recorded on the live page
// (stardust/replica/motion/us-en-adventures-climbing-new-zealand-html.json, -360.json).
// Tabs: tab click → --active moves on the tab and its panel; no animation or transition fired.
// Carousel, body.scrolly, language menu and mobile nav panel come from canon.js.
(function () {
  document.querySelectorAll('.tabs').forEach(function (tabs) {
    var items = Array.prototype.slice.call(tabs.querySelectorAll('.tabs__tab'));
    var panels = Array.prototype.slice.call(tabs.querySelectorAll('.tabs__panel'));
    items.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        items.forEach(function (el, k) {
          el.classList.toggle('tabs__tab--active', k === i);
          el.setAttribute('aria-selected', k === i ? 'true' : 'false');
          el.setAttribute('tabindex', k === i ? '0' : '-1');
        });
        panels.forEach(function (el, k) { el.classList.toggle('tabs__panel--active', k === i); });
      });
    });
  });
})();
