#!/usr/bin/env bash
# PROTOTYPE: start the three production SSR servers.
cd "$(dirname "$0")"
export NG_ALLOWED_HOSTS=localhost,127.0.0.1
PORT=4611 node dist/apps/fixture/server/server.mjs > logs-lazy.log 2>&1 &
PORT=4612 node dist/apps/fixture-eager/server/server.mjs > logs-eager.log 2>&1 &
PORT=4613 node dist/apps/fixture-unlayered/server/server.mjs > logs-unlayered.log 2>&1 &
wait
