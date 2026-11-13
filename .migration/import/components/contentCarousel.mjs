// A content carousel: `data-slides-to-show` slides per view. Slides of cards or quotes
// become the `carousel` variant of their block, any other slide a row of the block `carousel`.
import { slideSections } from './carousel.mjs';

export default function contentCarousel(el, ctx) {
  const box = ctx.$(el).find('.component-content-carousel').first();
  const speed = Number(box.attr('data-autoplayspeed') ?? 6000);
  const autoplay = box.attr('data-autoplay') !== undefined
    && (speed === 6000 ? 'autoplay' : `autoplay-${Math.round(speed / 1000)}`);
  // below 730 the source's slick shows one slide in the centre, its neighbours at the edges
  const variants = [
    box.hasClass('mobile-no-carousel') && 'no-mobile',
    box.hasClass('mobile-center-mode') && 'center',
    autoplay,
  ].filter(Boolean);
  const perView = Number(box.attr('data-slides-to-show') ?? 1) || 1;
  // several slides in view are single items: the slider moves items, not rows of them
  return slideSections(box.children('.carousel-slide').toArray(), ctx, {
    variants, perView, rows: perView === 1,
  });
}
