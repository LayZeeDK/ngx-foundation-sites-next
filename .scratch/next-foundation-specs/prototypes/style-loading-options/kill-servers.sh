#!/usr/bin/env bash
# PROTOTYPE (ticket 190): stop only this prototype's servers (ports 4711-4718), by PID.
for port in 4711 4712 4713 4714 4715 4716 4717 4718; do
  for pid in $(netstat -ano | rg ":$port\s.*LISTENING" | awk '{print $NF}' | sort -u); do
    taskkill //F //PID "$pid" > /dev/null 2>&1 && echo "stopped $port ($pid)"
  done
done
