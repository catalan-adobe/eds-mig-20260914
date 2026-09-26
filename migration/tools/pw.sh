#!/usr/bin/env bash
# Run a playwright-cli run-code file in a session and print the decoded result.
# usage: tools/pw.sh <session> <file.run.js>
set -euo pipefail
playwright-cli -s="$1" --json run-code --filename "$2" | node -e '
let s = "";
process.stdin.on("data", (d) => { s += d; }).on("end", () => {
  const j = JSON.parse(s);
  if (j.error) { console.error(j.error); process.exit(1); }
  let r = j.result;
  try { r = JSON.parse(r); } catch { /* keep string */ }
  process.stdout.write(typeof r === "string" ? r : JSON.stringify(r, null, 1));
});'
