/* Tabs (observed on live: click on .cmp-tabs__tab swaps --active on the tab and its panel; no transition). */
(function () {
  document.querySelectorAll('.tabs').forEach(function (tabs) {
    var tabEls = tabs.querySelectorAll('.tabs__tab');
    var panels = tabs.querySelectorAll('.tabs__tabpanel');
    tabEls.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        tabEls.forEach(function (t, j) {
          var on = i === j;
          t.classList.toggle('tabs__tab--active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.setAttribute('tabindex', on ? '0' : '-1');
          if (panels[j]) panels[j].classList.toggle('tabs__tabpanel--active', on);
        });
      });
    });
  });
})();
