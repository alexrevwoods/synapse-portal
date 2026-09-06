#!/usr/bin/env bash
set -euo pipefail
cd /home/ubuntu/synapse-portal
log=/tmp/waw-production-smoke.log
rm -f "$log"
setsid env PORT=3101 NODE_ENV=production pnpm start >"$log" 2>&1 &
server_pid=$!
cleanup() {
  kill "$server_pid" 2>/dev/null || true
  pkill -TERM -f 'node dist/index.js' 2>/dev/null || true
  sleep 1
  pkill -KILL -f 'node dist/index.js' 2>/dev/null || true
}
trap cleanup EXIT
for _ in $(seq 1 45); do
  if curl -fsS http://127.0.0.1:3101/robots.txt >/dev/null 2>&1; then break; fi
  sleep 1
done
curl -fsS http://127.0.0.1:3101/robots.txt >/dev/null
for route in / /discover /mediarevolution /mediarevolution/signals/1 /robots.txt /sitemap.xml; do
  output="/tmp/waw-prod$(echo "$route" | tr '/' '_').html"
  status=$(curl -fsS -o "$output" -w '%{http_code}' "http://127.0.0.1:3101$route")
  printf '%s %s\n' "$status" "$route"
done
printf '%s\n' '--- rendered metadata ---'
rg -o '<title>[^<]*|<link rel="canonical" href="[^"]+' /tmp/waw-prod_mediarevolution_signals_1.html | head -2
printf '%s\n' '--- server log ---'
tail -20 "$log"
