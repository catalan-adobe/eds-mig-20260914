/* us-en-faqs-html — cmp-accordion behaviour (Core Components accordion, multi-expansion):
   click toggles the item's button/panel expanded state; panels fade in via CSS. */
(function () {
  document.querySelectorAll('.accordion__button').forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      var expanded = button.classList.toggle('accordion__button--expanded');
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      panel.classList.toggle('accordion__panel--expanded', expanded);
      panel.classList.toggle('accordion__panel--hidden', !expanded);
    });
  });
})();
