function setOpen(item, open) {
  item.classList.toggle('open', open);
  item.querySelector('.customer-stories-toggle').setAttribute('aria-expanded', String(open));
}

function buildItem(row, index) {
  const [head, media, stats, link] = [...row.children];
  const url = link?.querySelector('a');
  const content = document.createElement('div');
  content.className = 'customer-stories-content';
  content.id = `customer-stories-content-${index}`;
  content.append(...[media, stats].filter(Boolean).map((cell) => cell.firstElementChild || cell));
  if (url) {
    const read = url.cloneNode(true);
    read.className = 'customer-stories-read';
    content.append(read);
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'customer-stories-toggle';
  toggle.setAttribute('aria-controls', content.id);
  const heading = head.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) toggle.append(heading);

  const summary = document.createElement('div');
  summary.className = 'customer-stories-summary';
  const logo = document.createElement('div');
  logo.className = 'customer-stories-logo';
  logo.append(...head.querySelectorAll('.icon'));
  summary.append(logo, toggle);
  if (url) {
    const action = url.cloneNode(true);
    action.className = 'customer-stories-action';
    summary.append(action);
  }
  const item = document.createElement('div');
  item.className = 'customer-stories-item';
  item.append(summary, content);
  return item;
}

export default function decorate(block) {
  const items = [...block.children].map(buildItem);
  block.replaceChildren(...items);
  items.forEach((item, i) => {
    setOpen(item, i === 0);
    const toggle = () => {
      const wasOpen = item.classList.contains('open');
      items.forEach((other) => setOpen(other, false));
      setOpen(item, !wasOpen);
    };
    item.querySelector('.customer-stories-toggle').addEventListener('click', toggle);
    item.querySelector('.customer-stories-action')?.addEventListener('click', (e) => {
      if (!item.classList.contains('open')) {
        e.preventDefault();
        toggle();
      }
    });
  });
}
