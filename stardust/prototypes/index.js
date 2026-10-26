// Interaction parity — only behaviours motion-observe saw fire on backlinko.com
// (stardust/replica/motion/index.json, index-360.json): headroom pin/unpin,
// mega-panel toggle, search popup, mobile drop + sub-panels.
const header = document.querySelector('.site-header');
const headroom = header.querySelector('.headroom');
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const pastHeader = y > headroom.offsetHeight;
  const down = pastHeader && y > lastY;
  headroom.classList.toggle('headroom--unfixed', !pastHeader);
  headroom.classList.toggle('headroom--unpinned', down);
  headroom.classList.toggle('headroom--pinned', pastHeader && !down);
  headroom.classList.toggle('headroom--scrolled', pastHeader && !down);
  header.classList.toggle('has-shadow', pastHeader);
  lastY = y;
}, { passive: true });

header.querySelectorAll('.header-nav li.mega').forEach((li) => {
  const button = li.querySelector(':scope > button');
  const panel = li.querySelector('.mega-panel');
  const setOpen = (open) => {
    header.querySelectorAll('.header-nav li.mega > .active').forEach((el) => el.classList.remove('active'));
    button.classList.toggle('active', open);
    panel.classList.toggle('active', open);
  };
  button.addEventListener('click', () => setOpen(!panel.classList.contains('active')));
  panel.querySelector('.mega-close').addEventListener('click', () => setOpen(false));
  const cats = [...panel.querySelectorAll('.mega-cats button')];
  const lists = [...panel.querySelectorAll('.mega-lists > ul')];
  cats.forEach((cat, i) => cat.addEventListener('click', () => {
    cats.forEach((c, j) => c.classList.toggle('active', i === j));
    lists.forEach((l, j) => l.classList.toggle('active', i === j));
  }));
});

const search = header.querySelector('.search-popup');
header.querySelector('.header-search > button').addEventListener('click', () => search.classList.toggle('open'));
search.querySelector('.popup-close').addEventListener('click', () => search.classList.remove('open'));

const drop = header.querySelector('.header-mobile');
const toggle = header.querySelector('.header-toggle');
toggle.addEventListener('click', () => {
  toggle.classList.toggle('active', drop.classList.toggle('active'));
});
drop.querySelectorAll('.m-nav li.has-children').forEach((li) => {
  const sub = li.querySelector('.m-sub');
  li.querySelector(':scope > button').addEventListener('click', () => sub.classList.add('active'));
  sub.querySelector('.m-sub-head button').addEventListener('click', () => sub.classList.remove('active'));
});
