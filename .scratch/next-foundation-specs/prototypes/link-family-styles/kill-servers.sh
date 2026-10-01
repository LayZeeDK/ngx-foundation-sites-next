#!/usr/bin/env bash
# PROTOTYPE: stop only this prototype's servers (ports 4691-4698), by PID.
for port in 4691 4692 4693 4694 4695 4696 4697 4698 4699; do
  for pid in $(netstat -ano | rg ":$port\s.*LISTENING" | awk '{print $NF}' | sort -u); do
    taskkill //F //PID $pid >/dev/null 2>&1 && echo "stopped $port ($pid)"
  done
done
