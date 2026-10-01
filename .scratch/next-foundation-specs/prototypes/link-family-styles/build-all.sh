#!/usr/bin/env bash
# PROTOTYPE: build every configuration (and the esbuild-plugin target).
cd "$(dirname "$0")"
for c in production unlayered cachebust preload single subpath cdn i18n noskip; do
  echo "== $c"
  npx nx run fixture:build:$c --skip-nx-cache 2>&1 | rg "Output location|failed|ERROR|Error|rror:" || exit 1
done
echo "== plugin"
npx nx run fixture:build-plugin --skip-nx-cache 2>&1 | rg "Output location|failed|ERROR|Error|rror:|nfs-family" || exit 1
