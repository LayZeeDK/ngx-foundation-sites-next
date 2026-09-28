#!/usr/bin/env bash
# Q4 (the typing decision's residual risk (b)), run in nx-ws from a committed, in-step file.
# Writes ../logs/q4-*.log and restores the Sass edit at the end.
set -u
cd /d/tmp/nfs-proto-137/nx-ws
export NX_DAEMON=false
strip() { sed 's/\x1b\[[0-9;]*m//g'; }
settings=apps/shop/src/_app-settings.scss

echo "== 0. in step: nx sync:check"
npx nx sync:check 2>&1 | strip > ../logs/q4-0-sync-check-instep.log; echo "exit=${PIPESTATUS[0]}"

echo "== 1. remove warning from shop's Sass, CI=true nx build shop"
sed -i 's#^\$button-palette: map-merge(\$foundation-palette, (purple: \#7a3fbf));#$button-palette: map-remove(map-merge($foundation-palette, (purple: \#7a3fbf)), warning);#' $settings
rg -n "button-palette" $settings
CI=true npx nx build shop --skip-nx-cache 2>&1 | strip > ../logs/q4-1-ci-build.log; echo "exit=${PIPESTATUS[0]}"
css=$(ls dist/apps/shop/browser/styles-*.css)
printf '.button.warning rules in the built CSS: '; rg -c '\.button\.warning' "$css" || echo 0
printf 'built --nfs-button-palette: '; rg -o -- '--nfs-button-palette:[^;}]*' "$css"
printf 'main.js files that carry "warning": '; rg -l '"warning"' dist/apps/shop/browser/main-*.js | wc -l

echo "== 2. nx sync:check"
npx nx sync:check 2>&1 | strip > ../logs/q4-2-sync-check.log; echo "exit=${PIPESTATUS[0]}"
rg -v '^\s*$' ../logs/q4-2-sync-check.log
CI=true npx nx sync:check > /dev/null 2>&1; echo "CI=true nx sync:check exit=$?"

echo "== 3. nx sync"
npx nx sync 2>&1 | strip > ../logs/q4-3-sync.log; echo "exit=${PIPESTATUS[0]}"
git diff --stat -- apps libs
git diff -- apps/shop/src/nfs-variants.d.ts > ../logs/q4-3-sync.diff

echo "== 4. nx build shop"
npx nx build shop --skip-nx-cache 2>&1 | strip > ../logs/q4-4-build.log; echo "exit=${PIPESTATUS[0]}"
rg -n 'TS\d{4}' -A 3 ../logs/q4-4-build.log | head -8

echo "== restore"
git checkout -- $settings apps/shop/src/nfs-variants.d.ts libs/ui/src/nfs-variants.d.ts
git status --short -- apps libs
