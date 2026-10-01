#!/usr/bin/env bash
# PROTOTYPE (ticket 190): build the loading options.
# A = production (lazy), B = eager, C = mixed (dropdown eager), D = idle (lazy + idle prefetch),
# E = own (188's owned <style>), L = link (189), LP = link-preload (189 + index.html preloads),
# S = build-static (192's proposal A: Nx executor plus the esbuild plugin, lazy routes).
cd "$(dirname "$0")"
for c in production eager mixed idle own link link-preload; do
  npx nx run fixture:build:$c --skip-nx-cache > "build-$c.log" 2>&1
  rg -q "Output location" "build-$c.log" || { echo "build $c failed"; rg "ERROR" "build-$c.log"; exit 1; }
  echo "built $c"
done
node tools/gen-static-pages.mjs
npx nx run fixture:build-static --skip-nx-cache > build-static.log 2>&1
rg -q "Output location" build-static.log || { echo "build-static failed"; rg "ERROR" build-static.log; exit 1; }
echo "built static"
