#!/usr/bin/env bash
# PROTOTYPE (ticket 190): part 1, Chromium vitals in the three profiles.
cd "$(dirname "$0")/.."
RUNS=${RUNS:-5}
for p in unthrottled delay300 slow4g4x; do node measure/vitals.mjs chromium $p $RUNS; done
