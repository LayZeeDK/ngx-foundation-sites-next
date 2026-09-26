#!/usr/bin/env bash
# PROTOTYPE helper: (re)start the SSR server of the production build on port 4430.
# Usage: bash serve.sh [stop]
cd "$(dirname "$0")"
for pid in $(netstat -ano | awk '$2 ~ /:4430$/ && $4 == "LISTENING" {print $5}' | sort -u); do
  taskkill //PID "$pid" //F > /dev/null
done
if [ "$1" = "stop" ]; then exit 0; fi
PORT=4430 NG_ALLOWED_HOSTS="localhost,127.0.0.1" node dist/app/server/server.mjs > ../server.log 2>&1 &
sleep 2
cat ../server.log
