// stardust:provenance writtenBy=stardust:replica phase=recreate source=stardust/current/source-js/site.js (behaviour mirrored)
const DESKTOP = window.matchMedia('(min-width: 1025px)');

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  toggle?.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', String(menu.classList.toggle('is-open')));
  });
  document.querySelectorAll('.nav-item').forEach((item) => {
    const trigger = item.querySelector('.nav-trigger');
    let timer;
    trigger.addEventListener('click', () => {
      if (DESKTOP.matches) return;
      trigger.setAttribute('aria-expanded', String(item.classList.toggle('is-open')));
    });
    item.addEventListener('mouseenter', () => {
      if (!DESKTOP.matches) return;
      clearTimeout(timer);
      item.classList.add('is-open');
    });
    item.addEventListener('mouseleave', () => {
      if (!DESKTOP.matches) return;
      timer = setTimeout(() => item.classList.remove('is-open'), 200);
    });
  });
}

function initTabs() {
  document.querySelectorAll('.tabs').forEach((tabs) => {
    const links = tabs.querySelectorAll('.tab-link');
    links.forEach((link) => link.addEventListener('click', () => {
      links.forEach((l) => {
        const selected = l === link;
        l.setAttribute('aria-selected', String(selected));
        document.getElementById(l.getAttribute('aria-controls')).hidden = !selected;
      });
    }));
  });
}

function initFaq() {
  document.querySelectorAll('.faq-question').forEach((q) => q.addEventListener('click', () => {
    q.setAttribute('aria-expanded', String(q.closest('.faq-item').classList.toggle('is-open')));
  }));
}

initNav();
initTabs();
initFaq();
