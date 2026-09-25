/* motion layer — mirrors the source site's js/site.js state machine, behaviors confirmed by
   stardust/replica/motion/index.json (tabs is-active, faq is-open, megamenu mega-open) and
   index-360.json (nav-menu is-open, megamenu is-open). Same class names, same 1024px threshold,
   same 200ms megamenu leave delay. */
(function () {
  'use strict';
  var MOBILE_MAX = 1024;

  function onDocumentClick(e) {
    var tab = e.target.closest && e.target.closest('[data-tabs] .tab-menu-link');
    if (tab) {
      var box = tab.closest('[data-tabs]');
      var paneId = tab.getAttribute('data-tab');
      if (!box || !paneId) return;
      e.preventDefault();
      box.querySelectorAll('.tab-menu-link').forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
      box.querySelectorAll('.tab-pane').forEach(function (p) { p.classList.remove('is-active'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      var pane = document.getElementById(paneId);
      if (pane) pane.classList.add('is-active');
      return;
    }
    var q = e.target.closest && e.target.closest('.faq-question');
    if (q) {
      var item = q.closest('.faq-item');
      if (!item) return;
      item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', String(item.classList.contains('is-open')));
    }
  }

  function init() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var open = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }
    document.querySelectorAll('.nav-megamenu-trigger').forEach(function (t) {
      t.addEventListener('click', function () {
        if (window.innerWidth > MOBILE_MAX) return;
        var item = t.closest('.nav-megamenu-item');
        if (!item) return;
        var open = item.classList.toggle('is-open');
        t.setAttribute('aria-expanded', String(open));
      });
    });
    var timers = new Map();
    document.querySelectorAll('.nav-megamenu-item').forEach(function (item) {
      var mega = item.querySelector('.nav-megamenu');
      if (!mega) return;
      function open() { clearTimeout(timers.get(item)); item.classList.add('mega-open'); }
      function close() { timers.set(item, setTimeout(function () { item.classList.remove('mega-open'); }, 200)); }
      function desktop(fn) { return function () { if (window.innerWidth > MOBILE_MAX) fn(); }; }
      item.addEventListener('mouseenter', desktop(open));
      item.addEventListener('mouseleave', desktop(close));
      mega.addEventListener('mouseenter', desktop(open));
      mega.addEventListener('mouseleave', desktop(close));
    });
    document.addEventListener('click', onDocumentClick);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
