export default function decorate(block) {
  [...block.children].forEach((card) => {
    card.className = 'program-card';
    const [text, graphic] = [...card.children];
    if (text) text.className = 'program-card-text';
    if (graphic) graphic.className = 'program-card-graphic';
  });
}
