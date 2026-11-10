function isCallToAction(p) {
  const link = p.querySelector('a');
  return !!link && p.children.length === 1 && p.textContent.trim() === link.textContent.trim();
}

function decorateText(cell) {
  cell.classList.add('teaser-content');
  const title = cell.querySelector('h1, h2, h3, h4, h5, h6');
  if (title) {
    title.classList.add('teaser-title');
    const before = title.previousElementSibling;
    if (before && before.tagName === 'P') before.classList.add('teaser-pretitle');
  }
  const paragraphs = [...cell.querySelectorAll(':scope > p:not(.teaser-pretitle)')];
  const last = paragraphs.at(-1);
  if (last && isCallToAction(last)) {
    last.classList.add('teaser-action');
    paragraphs.pop();
  }
  paragraphs.forEach((p) => p.classList.add('teaser-description'));
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.classList.add('teaser-image');
      } else {
        decorateText(cell);
      }
    });
  });
}
