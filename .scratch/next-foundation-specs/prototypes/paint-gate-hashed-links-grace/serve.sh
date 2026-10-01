#!/usr/bin/env bash
# PROTOTYPE 197: start the production SSR servers on ports 4791-4797 and 4801-4804. Sets NG_ALLOWED_HOSTS.
cd "$(dirname "$0")"
export NG_ALLOWED_HOSTS=localhost,127.0.0.1
i=4791
for c in production plugin file file-subpath file-cdn file-i18n file-cachebust - - - file-prefix file-subpath-prefix file-cdn-prefix file-i18n-prefix; do
  [ "$c" = - ] && { i=$((i+1)); continue; }
  PORT=$i node dist/apps/fixture-$c/server/server.mjs > logs-$c.log 2>&1 &
  i=$((i+1))
done
wait
