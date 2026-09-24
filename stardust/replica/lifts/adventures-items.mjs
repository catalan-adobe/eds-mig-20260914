// Extract hero + tabs + image-list items (verbatim) from the captured adventures page HTML.
import { readFileSync, writeFileSync } from 'node:fs';
const [,, file, out] = process.argv;
const html = readFileSync(file, 'utf8').replace(/ data-cmp-data-layer="[^"]*"/g, '');
const start = html.indexOf('<ol role="tablist"');
const main = html.slice(start, html.indexOf('</main>', start));
const tabs = [...main.matchAll(/<li role="tab" id="([^"]+)" class="cmp-tabs__tab[^"]*"[^>]*>([^<]*)<\/li>/g)]
  .map(m => ({ id: m[1], label: m[2] }));
const panels = main.split(/<div [^>]*class="cmp-tabs__tabpanel/).slice(1).map(p => {
  const id = p.match(/id="([^"]+)"/)[1];
  const items = [...p.matchAll(/<li class="cmp-image-list__item"[^>]*>([\s\S]*?)<\/li>/g)].map(([, li]) => ({
    href: li.match(/href="([^"]+)"/)[1],
    src: li.match(/<img[^>]*src="([^"]+)"/)[1],
    alt: li.match(/<img[^>]*alt="([^"]*)"/)[1],
    title: li.match(/cmp-image-list__item-title">([^<]*)</)[1],
    description: li.match(/cmp-image-list__item-description">([\s\S]*?)<\/span>/)[1],
  }));
  return { id, items };
});
const hs = html.indexOf('teaser-e27d55d295-image');
const hero = html.slice(hs).match(/<img src="([^"]+)"[^>]*alt="([^"]*)"/);
writeFileSync(out, JSON.stringify({ hero: { src: hero[1], alt: hero[2] }, tabs, panels }, null, 1));
console.log(tabs.map(t => t.label).join(','), panels.map(p => p.items.length).join(','));
