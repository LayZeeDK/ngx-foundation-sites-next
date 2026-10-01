#!/usr/bin/env bash
# PROTOTYPE 197: stop only this prototype's servers (ports 4791-4797, 4801-4804), by PID.
for port in 4791 4792 4793 4794 4795 4796 4797 4801 4802 4803 4804; do
  for pid in $(netstat -ano | rg ":$port\s.*LISTENING" | awk '{print $NF}' | sort -u); do
    taskkill //F //PID $pid >/dev/null 2>&1 && echo "stopped $port ($pid)"
  done
done
