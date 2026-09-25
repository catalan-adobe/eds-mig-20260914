/**
 * gallery — image grid: one authored row per image (D3). Three images per grid row; a trailing
 * single image spans the full width (the source's wide shot).
 * Schema: stardust/eds-schema/index.json sections[7].
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.className = 'gallery-item';
    [...row.children].forEach((cell) => { cell.className = 'gallery-cell'; });
  });
}
