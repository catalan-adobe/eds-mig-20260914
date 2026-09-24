/* WKND replica — faq archetype interactions. Observed on live (motion-observe,
   stardust/replica/motion/us-en-faqs-html.json): accordion button click toggles
   cmp-accordion__button--expanded on the button and swaps
   cmp-accordion__panel--hidden / --expanded on its panel (fadeIn via CSS);
   items expand independently (multi-expansion). Nothing else fired on the
   page modules; header scrolly + language toggle live in canon.js. */
document.querySelectorAll('.accordion__button').forEach((button) => {
  button.addEventListener('click', () => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    const expanded = button.classList.toggle('accordion__button--expanded');
    button.setAttribute('aria-expanded', String(expanded));
    panel.classList.replace(
      expanded ? 'accordion__panel--hidden' : 'accordion__panel--expanded',
      expanded ? 'accordion__panel--expanded' : 'accordion__panel--hidden',
    );
  });
});
