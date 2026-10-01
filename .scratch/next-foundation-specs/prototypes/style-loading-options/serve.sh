#!/usr/bin/env bash
# PROTOTYPE (ticket 190): start the production SSR servers, one per loading option.
cd "$(dirname "$0")"
export NG_ALLOWED_HOSTS=localhost,127.0.0.1
PORT=4711 node dist/apps/fixture/server/server.mjs > logs-A.log 2>&1 &
PORT=4712 node dist/apps/fixture-eager/server/server.mjs > logs-B.log 2>&1 &
PORT=4713 node dist/apps/fixture-mixed/server/server.mjs > logs-C.log 2>&1 &
PORT=4714 node dist/apps/fixture-idle/server/server.mjs > logs-D.log 2>&1 &
PORT=4715 node dist/apps/fixture-own/server/server.mjs > logs-E.log 2>&1 &
PORT=4716 node dist/apps/fixture-link/server/server.mjs > logs-L.log 2>&1 &
PORT=4717 node dist/apps/fixture-link-preload/server/server.mjs > logs-LP.log 2>&1 &
PORT=4718 node dist/apps/fixture-static/server/server.mjs > logs-S.log 2>&1 &
wait
