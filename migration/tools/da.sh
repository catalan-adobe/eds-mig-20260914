#!/usr/bin/env bash
# DA + Admin API helper. Token read from .hlx/.da-token.json, never printed.
# usage: tools/da.sh put <da-path.html> <local-file> | get <da-path> | preview <path> | list <path>
#        tools/da.sh upload <da-path.ext> <local-file>
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
TOKEN="$(node -e 'process.stdout.write(require(process.argv[1]).access_token)' "$root/.hlx/.da-token.json")"
ORG=catalan-adobe
SITE=eds-mig-20260914
auth=(-H "Authorization: Bearer $TOKEN")
case "$1" in
  put | upload) curl -sS -f "${auth[@]}" -X PUT -F "data=@$3" "https://admin.da.live/source/$ORG/$SITE/$2" -o /dev/null -w "PUT $2 %{http_code}\n" ;;
  get) curl -sS -f "${auth[@]}" "https://admin.da.live/source/$ORG/$SITE/$2" ;;
  list) curl -sS -f "${auth[@]}" "https://admin.da.live/list/$ORG/$SITE/$2" ;;
  delete) curl -sS -f "${auth[@]}" -X DELETE "https://admin.da.live/source/$ORG/$SITE/$2" -o /dev/null -w "DELETE $2 %{http_code}\n" ;;
  preview) curl -sS "${auth[@]}" -X POST "https://admin.hlx.page/preview/$ORG/$SITE/main/$2" -o /tmp/da-preview.json -w "PREVIEW $2 %{http_code}\n" ;;
  status) curl -sS "${auth[@]}" "https://admin.hlx.page/status/$ORG/$SITE/main/$2" ;;
  *) echo "unknown command: $1" >&2; exit 2 ;;
esac
