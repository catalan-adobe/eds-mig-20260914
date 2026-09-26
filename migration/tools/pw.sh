#!/usr/bin/env bash
# Run a playwright-cli run-code file in a session and print the decoded result.
# usage: tools/pw.sh <session> <file.run.js>   (PW_TIMEOUT seconds, default 120)
# A hung run-code wedges its session daemon (commands are serialized), so on timeout the daemon is killed.
set -euo pipefail
limit="${PW_TIMEOUT:-120}"
set +e
out="$(timeout "$limit" playwright-cli -s="$1" --json run-code --filename "$2")"
rc=$?
set -e
if [ "$rc" -eq 124 ]; then
  pkill -f "cliDaemon.js $1( |$)" || true
  echo "pw.sh: run-code timed out after ${limit}s; session '$1' was wedged and has been killed (reopen it)." >&2
  echo "pw.sh: NOTE from integrator: page.clock.pauseAt() can hang on EDS pages - do not use page.clock on" >&2
  echo "pw.sh: localhost pages; freeze animations with block test hooks (pause button, getAnimations)." >&2
  exit 124
fi
[ "$rc" -eq 0 ] || exit "$rc"
printf '%s' "$out" | node -e '
let s = "";
process.stdin.on("data", (d) => { s += d; }).on("end", () => {
  const j = JSON.parse(s);
  if (j.error) { console.error(j.error); process.exit(1); }
  let r = j.result;
  try { r = JSON.parse(r); } catch { /* keep string */ }
  process.stdout.write(typeof r === "string" ? r : JSON.stringify(r, null, 1));
});'
