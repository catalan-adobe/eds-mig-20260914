/**
 * Sharing — the WKND article share widget (source .sharing: a Facebook share-button host
 * `.fb-share-button[data-href]` and a Pinterest "pin it" anchor, both drawn by third-party
 * SDKs the source page loads; the captured page shows neither, so the block renders the
 * same empty hosts and no copy of its own).
 * Schema: stardust/eds-schema/us-en-magazine-western-australia-html.json (section 1; the
 * sharing column carries no text item). Decode tier: template-slotted (key-value config).
 *
 * Authoring rows (key-value, D14 configuration): `Facebook | <page URL to share>` and
 * `Pinterest | <pin URL>`; either row may be omitted. The heading right above the block
 * ("Share this story", the source's .cmp-title) is default content the block reabsorbs — the
 * heading-only wrapper's children MOVE into .sharing-heading (EW8), zero pixel change.
 * Variant `spaced`: the source page follows the widget with a hidden separator
 * (.cmp-separator--space-small, 36px of space).
 * @ew-exempt share targets are configuration (network name + URL); they become the hosts'
 * data-href / href attributes and render no text, exactly as the source does.
 */
function reabsorbHeading(block) {
  const wrapper = block.parentElement;
  const prev = wrapper?.classList.contains('sharing-wrapper') && wrapper.previousElementSibling;
  if (!prev || !prev.classList.contains('default-content-wrapper')) return null;
  const headings = [...prev.children];
  if (!headings.length || !headings.every((c) => /^H[2-6]$/.test(c.tagName))) return null;
  const heading = document.createElement('div');
  heading.className = 'sharing-heading';
  heading.append(...prev.children);
  prev.remove();
  return heading;
}

export default function decorate(block) {
  if (block.querySelector(':scope > :is(.fb-share-button, a, .sharing-heading)')) return;
  const hosts = [];
  const heading = reabsorbHeading(block);
  if (heading) hosts.push(heading);
  block.querySelectorAll(':scope > div').forEach((row) => {
    const [keyCell, valueCell] = row.children;
    const key = (keyCell?.textContent || '').trim().toLowerCase();
    const authoredLink = valueCell?.querySelector('a')?.getAttribute('href');
    const value = (authoredLink || valueCell?.textContent || '').trim();
    if (key.includes('facebook')) {
      const fb = document.createElement('div');
      fb.className = 'fb-share-button';
      if (value) fb.dataset.href = value;
      fb.dataset.layout = 'button_count';
      fb.dataset.size = 'small';
      hosts.push(fb);
    } else if (key.includes('pinterest')) {
      const pin = document.createElement('a');
      pin.href = value || 'https://www.pinterest.com/pin/create/button/';
      pin.dataset.pinDo = 'buttonPin';
      pin.dataset.pinCount = 'beside';
      pin.dataset.pinSave = 'true';
      hosts.push(pin);
    }
  });
  block.replaceChildren(...hosts);
}
