#!/usr/bin/env bash
# PROTOTYPE: runs every layer of the rendering-mode seam and writes short ASCII logs to logs/.
set -u
cd "$(dirname "$0")/.."
mkdir -p logs
# Strip ANSI colours and CR, then map the reporters' check marks and box characters to ASCII.
clean() {
  sed -E 's/\x1b\[[0-9;]*[A-Za-z]//g' | tr -d '\r' |
    perl -CSD -pe 's/\x{2713}/[OK]/g; s/[\x{00d7}\x{2718}]/[FAIL]/g; s/\x{276f}/>/g; s/\x{23af}/-/g; s/[^\x00-\x7f]/?/g'
}
keep='Test Files|Tests |FAIL|\[OK\]|passed|failed|Error|DominoAdapter|Run duration|document is not defined|NG0500: During'

npx nx test ui --skip-nx-cache --reporters=verbose 2>&1 | clean | rg "$keep" > logs/1-test-jsdom.log
npx nx test ui --skip-nx-cache --reporters=verbose -c single-worker 2>&1 | clean | rg "$keep" > logs/2-test-jsdom-single-worker.log
npx nx test ui --skip-nx-cache --reporters=verbose --browsers=chromiumHeadless 2>&1 | clean | rg "$keep" > logs/3-test-chromium.log
npx nx test ui --skip-nx-cache --reporters=verbose -c leak-demo 2>&1 | clean | rg "$keep" > logs/4-test-leak-demo.log
npx nx test ui --skip-nx-cache --runnerConfig=packages/ui/vitest.node-env.mts 2>&1 | clean | rg "$keep" | head -20 > logs/5-test-node-env-probe.log
npx nx test-node ui --skip-nx-cache -- --reporter=verbose 2>&1 | clean | rg "$keep" > logs/6-test-node-project.log
npx nx e2e fixture-e2e --skip-nx-cache -- --reporter=list --workers=3 2>&1 | clean | rg "$keep" > logs/7-e2e-all-browsers.log
npx nx daemon --stop > /dev/null 2>&1
