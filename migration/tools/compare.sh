#!/usr/bin/env bash
# Pixel-compare two screenshots (optionally cropped) and write a diff + side-by-side.
# usage: tools/compare.sh <ref.png> <eds.png> <out-prefix> [ref-crop WxH+X+Y] [eds-crop WxH+X+Y]
# prints: "<mismatch%> <diff-pixels>/<total> <W>x<H> ref=<h> eds=<h>" (fuzz 10%)
set -euo pipefail
ref="$1"; eds="$2"; out="$3"
tmp="$(mktemp -d)"
magick "$ref" ${4:+-crop "$4" +repage} -alpha off "$tmp/a.png"
magick "$eds" ${5:+-crop "${5:-$4}" +repage} -alpha off "$tmp/b.png"
read -r wa ha < <(magick identify -format '%w %h\n' "$tmp/a.png")
read -r wb hb < <(magick identify -format '%w %h\n' "$tmp/b.png")
w=$(( wa > wb ? wa : wb )); h=$(( ha > hb ? ha : hb ))
magick "$tmp/a.png" -background '#ff00ff' -extent "${w}x${h}" "$tmp/a2.png"
magick "$tmp/b.png" -background '#ff00ff' -extent "${w}x${h}" "$tmp/b2.png"
ae=$(magick compare -metric AE -fuzz 10% "$tmp/a2.png" "$tmp/b2.png" "$out-diff.png" 2>&1 >/dev/null | cut -d' ' -f1 || true)
magick "$tmp/a2.png" "$tmp/b2.png" "$out-diff.png" +append "$out-sbs.png"
awk -v ae="$ae" -v w="$w" -v h="$h" -v ha="$ha" -v hb="$hb" \
  'BEGIN { printf "%.2f%% %d/%d %dx%d ref=%d eds=%d\n", 100 * ae / (w * h), ae, w * h, w, h, ha, hb }'
rm -rf "$tmp"
