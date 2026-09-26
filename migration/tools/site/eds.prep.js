// EDS capture hooks (no fake clock on EDS pages: freeze through block APIs instead).

// logo-carousel: freeze the seamless marquee at its start frame (NVIDIA first, left-aligned).
document.querySelectorAll('.logo-carousel-track').forEach((el) => {
  el.getAnimations().forEach((a) => {
    a.pause();
    a.currentTime = 0;
  });
});

// hero-carousel: stop autoplay on slide 1, progress bars at 0, keep the "pause" icon (as in the reference).
const hero = document.querySelector('.hero-carousel');
if (hero) {
  const firstTab = hero.querySelector('.hero-carousel-tabs [role="tab"]');
  if (firstTab && firstTab.getAttribute('aria-selected') !== 'true') firstTab.click();
  const pause = hero.querySelector('.hero-carousel-pause');
  if (pause && pause.dataset.state !== 'paused') pause.click();
  if (pause) {
    pause.dataset.state = 'playing';
    pause.setAttribute('aria-label', 'Pause');
  }
  hero.querySelectorAll('.hero-carousel-progress-bar').forEach((bar) => {
    bar.style.transition = 'none';
    bar.style.width = '0';
  });
}

// header: freeze the rotating gradient border of the Ask pill (reference capture uses animation: none too).
document.querySelectorAll('header *').forEach((el) => {
  el.getAnimations().forEach((a) => {
    a.pause();
    a.currentTime = 0;
  });
});
