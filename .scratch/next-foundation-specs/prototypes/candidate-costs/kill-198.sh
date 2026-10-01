#!/usr/bin/env bash
# PROTOTYPE 198: stop only the servers on this prototype's ports, by PID (tree).
for port in 4811 4812 4813 4821 4822 4823 4824; do
  for pid in $(netstat -ano | rg "LISTENING" | rg ":$port\s" | awk '{print $5}' | sort -u); do
    taskkill //PID "$pid" //T //F > /dev/null 2>&1 && echo "stopped $port (pid $pid)"
  done
done
