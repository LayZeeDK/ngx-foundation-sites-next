#!/usr/bin/env bash
# PROTOTYPE: build the three production configurations.
cd "$(dirname "$0")"
for c in production eager unlayered; do
  npx nx run fixture:build:$c --skip-nx-cache 2>&1 | rg "Output location|failed|ERROR" || exit 1
done
