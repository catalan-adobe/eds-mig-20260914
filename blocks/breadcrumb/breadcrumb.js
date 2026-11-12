export default function decorate(block) {
  const list = block.querySelector('ul, ol') ?? document.createElement('ul');
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.append(list);
  list.lastElementChild?.setAttribute('aria-current', 'page');
  block.replaceChildren(nav);
}
