#!/usr/bin/env bash
# PROTOTYPE: start the production SSR servers (ports 4691-4699). Sets NG_ALLOWED_HOSTS.
cd "$(dirname "$0")"
export NG_ALLOWED_HOSTS=localhost,127.0.0.1
i=4691
for c in production unlayered preload single subpath cdn i18n plugin noskip; do
  PORT=$i node dist/apps/fixture-$c/server/server.mjs > logs-$c.log 2>&1 &
  i=$((i+1))
done
wait
