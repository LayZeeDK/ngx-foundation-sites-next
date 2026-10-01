#!/usr/bin/env bash
# PROTOTYPE (ticket 190): after run-chromium.sh. Part 2: option S in Chromium (built later, so it
# runs on its own; TAG=-S), Firefox. Part 3 (`run-rest.sh 3`): WebKit, Lighthouse, accessibility.
cd "$(dirname "$0")/.."
RUNS=${RUNS:-5}
if [ "${1:-2}" = 2 ]; then
  for p in unthrottled delay300 slow4g4x; do OPTS=S TAG=-S node measure/vitals.mjs chromium $p $RUNS; done
  for p in unthrottled delay300; do node measure/vitals.mjs firefox $p $RUNS; done
else
  for p in ${WEBKIT_PROFILES:-unthrottled delay300}; do node measure/vitals.mjs webkit $p $RUNS; done
  node measure/lh.mjs $RUNS
  for e in chromium firefox webkit; do node measure/a11y.mjs $e 3; done
fi
