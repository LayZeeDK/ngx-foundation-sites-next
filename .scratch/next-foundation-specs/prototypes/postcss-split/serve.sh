#!/usr/bin/env bash
# PROTOTYPE (ticket 195): start the five production SSR servers.
cd "$(dirname "$0")"
export NG_ALLOWED_HOSTS=localhost,127.0.0.1
mkdir -p logs
PORT=4631 node dist/split/server/server.mjs > logs/serve-split.log 2>&1 &
PORT=4632 node dist/reference/server/server.mjs > logs/serve-reference.log 2>&1 &
PORT=4633 node dist/badorder/server/server.mjs > logs/serve-badorder.log 2>&1 &
PORT=4634 node dist/nofilter/server/server.mjs > logs/serve-nofilter.log 2>&1 &
PORT=4635 node dist/noadopt/server/server.mjs > logs/serve-noadopt.log 2>&1 &
PORT=4636 node dist/samelayer/server/server.mjs > logs/serve-samelayer.log 2>&1 &
wait
