import { buildArticleCard } from '../../scripts/article-card.js';

/**
 * Article cards: one card per row (image, tag, linked h3, summary), 3-up grid.
 * @param {Element} block The cards block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => buildArticleCard(row.firstElementChild));
}
