#!/bin/zsh
set -e

project_dir="${0:A:h}"
app_url="http://127.0.0.1:4174/"
log_file="/tmp/english-forge-server.log"

if ! curl -fsS --max-time 1 "$app_url" 2>/dev/null | grep -q "English Forge"; then
  cd "$project_dir"
  nohup python3 -m http.server 4174 --bind 127.0.0.1 >"$log_file" 2>&1 &
  for _ in {1..30}; do
    if curl -fsS --max-time 1 "$app_url" 2>/dev/null | grep -q "English Forge"; then
      break
    fi
    sleep 0.2
  done
fi

open "$app_url"
