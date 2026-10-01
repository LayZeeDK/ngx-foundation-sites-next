#!/usr/bin/env bash
# PROTOTYPE (ticket 195): stop only this prototype's servers (ports 4621-4622 dev, 4631-4636 production), by PID.
for pid in $(netstat -ano | rg 'LISTENING' | rg ':(462[12]|463[1-6]) ' | awk '{print $NF}' | sort -u); do
  taskkill //PID "$pid" //T //F > /dev/null && echo "stopped $pid"
done
