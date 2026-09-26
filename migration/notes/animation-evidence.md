# Animation & interaction evidence (desktop 1440x900 unless noted)

## Timing (real time, 500 ms samples, `/tmp/anim.run.js` equivalent in notes)
| animation | reference | EDS | source of truth |
|---|---|---|---|
| hero progress bar | +7 %/500 ms (≈14.3 %/s), slide change after 7.0 s | +7 %/500 ms, slide 0→1 at 7.03 s | site JS: 7000 ms timer + jQuery animate linear |
| hero slide change | fade 200 ms | opacity transition 200 ms | slick `fade:true, speed:200` |
| partner marquee | −23 px/500 ms (46 px/s) | −23 px/500 ms (46 px/s) | slick speed 5000 linear per 228 px logo |
| sticky header | bg/shadow transition .25 s at 80 px | same | `.component-nav-top{transition:all .25s}` |
| card hover | text block bottom −25→15 px in 1 s, text opacity .3 s | same | `.component-solutioncard` hover rules |
| news carousel | 200 ms ease slide | 200 ms ease | slick speed 200 |
| floating Ask icon (mobile) | conic border rotating 4 s linear | same (`@property --header-ask-angle`) | `.border-gradient-ask.spin` |

## Interaction states (viewport screenshots, mismatch fuzz 10%)
| state | mismatch |
|---|---|
| desktop sticky header (scroll 200) | 0.61% |
| desktop card hover | 1.78% |
| desktop language dropdown | 1.64% |
| desktop news "next" | 0.46% |
| desktop hero slide 3 | 0.66% |
| mobile hero slide 3 | 1.69% |
| mobile news "next" | 0.53% |
| desktop mega-menus 1-5 (before menus pass) | 6.85 / 9.01 / 7.82 / 3.22 / 2.98% |
| mobile menu open (before menus pass) | 12.97% |
