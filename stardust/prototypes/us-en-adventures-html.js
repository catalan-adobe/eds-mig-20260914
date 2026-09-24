/* WKND replica — tabs (.cmp-tabs) interaction, observed live (motion/us-en-adventures-html.json):
   click on a tab swaps tabs__tab--active + tabs__tabpanel--active (aria-selected / tabindex /
   aria-hidden follow the core-components tabs), no transition, no hover state. */
(function () {
  document.querySelectorAll('.tabs').forEach(function (tabs) {
    var tabEls = tabs.querySelectorAll(':scope > .tabs__tablist > .tabs__tab');
    var panels = tabs.querySelectorAll(':scope > .tabs__tabpanel');
    function activate(index) {
      tabEls.forEach(function (tab, i) {
        var on = i === index;
        tab.classList.toggle('tabs__tab--active', on);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.setAttribute('tabindex', on ? '0' : '-1');
      });
      panels.forEach(function (panel, i) {
        var on = i === index;
        panel.classList.toggle('tabs__tabpanel--active', on);
        if (on) panel.removeAttribute('aria-hidden'); else panel.setAttribute('aria-hidden', 'true');
      });
    }
    tabEls.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(i); });
      tab.addEventListener('keydown', function (e) {
        var next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
        if (next === null) return;
        e.preventDefault();
        var target = (next + tabEls.length) % tabEls.length;
        activate(target);
        tabEls[target].focus();
      });
    });
  });
})();
