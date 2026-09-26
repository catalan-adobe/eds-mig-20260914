/* filled once block test hooks are known */

// logo-carousel: freeze the seamless marquee at its start frame (NVIDIA first, left-aligned).
document.querySelectorAll('.logo-carousel-track').forEach((el) => {
  el.getAnimations().forEach((a) => {
    a.pause();
    a.currentTime = 0;
  });
});
