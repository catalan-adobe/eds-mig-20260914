#!/usr/bin/env bash
# usage: tools/capture.sh <session> <url> <out-prefix> <w> <h> <css-file> <prep-file> [fullpage-css-file] [slots-json]
# w=0 keeps the session's (device) viewport. Writes <out>-top.png and <out>-full.png.
set -euo pipefail
dir="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -t capture).js"
# shellcheck disable=SC2016 # single quotes hold literal JS, no shell expansion wanted
node -e '
const fs = require("fs");
const [tpl, url, out, w, h, cssf, prepf, fullf, slotsf] = process.argv.slice(1);
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
let s = fs.readFileSync(tpl, "utf8");
s = s.replace(/__URL__/g, url).replace(/__OUT__/g, out).replace("__W__", w).replace("__H__", h)
  .replace("`__CSS__`", "`" + esc(fs.readFileSync(cssf, "utf8")) + "`")
  .replace("`__FULLCSS__`", "`" + esc(fullf ? fs.readFileSync(fullf, "utf8") : "") + "`")
  .replace("__PREP__", fs.readFileSync(prepf, "utf8"))
  .replace("__SLOTS__", slotsf ? fs.readFileSync(slotsf, "utf8") : "{}");
fs.writeFileSync(process.argv[10], s);
' "$dir/capture.tpl.js" "$2" "$3" "$4" "$5" "$6" "$7" "${8:-}" "${9:-}" "$tmp"
"$dir/pw.sh" "$1" "$tmp"
