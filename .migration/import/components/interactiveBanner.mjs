// The older banner with a background video: a `hero video` row, built like a banner.
import { copy, media, variants } from './banner.mjs';

/**
 * True on a page that restyles these buttons as the banner's white ones, with a style and a
 * script of its own. Its script draws a play icon in a video button: it is added here.
 */
function restyled(box, ctx) {
  const { $ } = ctx;
  const rule = /\.component-interactive-banner \.component-button[^{]*\{[^}]*background:\s*#fff/i;
  if (!$('style').toArray().some((s) => rule.test($(s).text()))) return false;
  box.find('.cmp-video__thumbnail.component-button a').prepend('<i class="fa-play"></i>');
  return true;
}

export default function interactiveBanner(el, ctx) {
  const box = ctx.$(el).find('section[data-card-type="banner"]').first();
  const white = restyled(box, ctx) ? ['white-buttons'] : [];
  const cells = [media(el, box, ctx), copy(el, box, ctx)];
  if (!cells.flat().length) return undefined;
  return ctx.block('hero', ['interactive', ...variants(el, box, ctx), ...white], [cells]);
}
