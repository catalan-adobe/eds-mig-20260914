import { loadScript } from '../../scripts/aem.js';

const BRIGHTCOVE = /^https:\/\/players\.brightcove\.net\/(\d+)\/([^/]+)\/index\.html/;

function element(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

/** Runs `load` once, when `target` comes near the viewport. */
function onView(target, load) {
  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    load();
  }, { rootMargin: '300px' }).observe(target);
}

/** The id of a YouTube watch, short or embed link. */
function youtubeId(url) {
  if (!/(^|\.)youtube(-nocookie)?\.com$|^youtu\.be$/.test(url.hostname)) return null;
  return url.searchParams.get('v') ?? url.pathname.split('/').pop();
}

/** The player of a video link as an iframe: the Brightcove player page, or YouTube's embed. */
function player(href, autoplay) {
  const url = new URL(href);
  const id = youtubeId(url);
  if (id) url.href = `https://www.youtube.com/embed/${id}?color=white`;
  if (autoplay) url.searchParams.set('autoplay', id ? '1' : 'true');
  const frame = element('iframe');
  frame.src = url.href;
  frame.title = 'Video player';
  frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
  return frame;
}

const policyKeys = {};
/** The poster of a Brightcove video, read as its player does. */
async function brightcovePoster(href) {
  const [page, account] = href.match(BRIGHTCOVE) ?? [];
  const id = new URL(href).searchParams.get('videoId');
  if (!page || !id) return null;
  const config = page.replace(/index\.html$/, 'config.json');
  policyKeys[config] ??= fetch(config).then((response) => response.json())
    .then((json) => json.video_cloud.policy_key);
  const response = await fetch(
    `https://edge.api.brightcove.com/playback/v1/accounts/${account}/videos/${id}`,
    { headers: { Accept: `application/json;pk=${await policyKeys[config]}` } },
  );
  if (!response.ok) throw new Error(`Brightcove video ${id}: ${response.status}`);
  return (await response.json()).poster;
}

/**
 * Without an authored thumbnail the source shows its player under the play button. Here:
 * YouTube's own embed, as the source; for Brightcove only the picture of its player.
 */
function playerPoster(button, href) {
  if (youtubeId(new URL(href))) {
    const frame = player(href, false);
    frame.loading = 'lazy';
    frame.tabIndex = -1;
    button.before(frame);
    return;
  }
  onView(button, async () => {
    try {
      const src = await brightcovePoster(href);
      if (!src) return;
      // a background, as the player draws its poster: an img is resampled differently
      const poster = element('span', 'video-poster');
      poster.style.backgroundImage = `url("${src}")`;
      button.prepend(poster);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`video: no poster. ${e.message}`);
    }
  });
}

/**
 * The Brightcove playlist player, embedded in the page as the source does: only so the row of
 * its videos lies under the player at its own size. An iframe would scale the row.
 */
function playlist(block, frame, href) {
  const [page, account, name] = href.match(BRIGHTCOVE) ?? [];
  if (!page) return;
  const video = element('video-js', 'video-js');
  video.dataset.playlistId = new URL(href).searchParams.get('playlistId');
  video.dataset.account = account;
  video.dataset.player = name.replace(/_default$/, '');
  video.dataset.embed = 'default';
  video.setAttribute('controls', '');
  frame.append(video);
  block.append(element('div', 'vjs-playlist'));
  onView(block, () => loadScript(page.replace(/\.html$/, '.min.js')));
}

/**
 * A video behind its thumbnail and play button. Cell: optional thumbnail image, then the link
 * to the player (Brightcove player page or YouTube). A click plays it in place; `modal` plays
 * it in the dialog. `playlist`, or a link with `playlistId`: the Brightcove playlist player.
 * @param {Element} block
 */
export default function decorate(block) {
  const link = block.querySelector('a[href^="http"]');
  if (!link) {
    block.replaceChildren();
    return;
  }
  const { href } = link;
  // `.modal` is the dialog of scripts/modal.js: its styles must not reach the block
  const inModal = block.classList.replace('modal', 'opens-modal');
  const poster = block.querySelector('picture, img');
  const frame = element('div', 'video-frame');
  block.replaceChildren(frame);
  if (block.classList.contains('playlist') || new URL(href).searchParams.has('playlistId')) {
    block.classList.add('playlist');
    playlist(block, frame, href);
    return;
  }
  const button = element('button', 'video-thumbnail');
  button.type = 'button';
  button.setAttribute('aria-label', 'Play video');
  button.append(element('span', 'video-play'));
  frame.append(button);
  if (poster) button.prepend(poster);
  else playerPoster(button, href);
  button.addEventListener('click', async () => {
    if (!inModal) {
      frame.replaceChildren(player(href, true));
      return;
    }
    const { default: openModal } = await import('../../scripts/modal.js');
    openModal(player(href, true));
  });
}
