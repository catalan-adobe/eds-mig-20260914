export default function decorate(block) {
  const rows = [...block.children];
  const [desktopRow, mobileRow, contentRow] = rows.length >= 3
    ? rows : [rows[0], null, rows[1]];
  const bg = document.createElement('div');
  bg.className = 'session-banner-bg';
  [[desktopRow, 'desktop'], [mobileRow, 'mobile']].forEach(([row, kind]) => {
    const picture = row?.querySelector('picture');
    if (!picture) return;
    picture.classList.add(`session-banner-${kind}`);
    bg.append(picture);
  });
  const content = document.createElement('div');
  content.className = 'session-banner-content';
  const cell = contentRow?.firstElementChild;
  if (cell) content.append(...cell.children);
  block.replaceChildren(bg, content);
}
