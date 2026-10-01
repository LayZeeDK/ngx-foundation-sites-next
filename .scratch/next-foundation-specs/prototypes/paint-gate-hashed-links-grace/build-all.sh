#!/usr/bin/env bash
# PROTOTYPE 197: build the <link> loader, proposal A (plugin, string) and proposal E (plugin, file),
# including E's attempt-2 configurations (*-prefix). About 10 minutes in all on this machine.
cd "$(dirname "$0")"
export NX_DAEMON=false
for t in build:production build-plugin build-file:production build-file:subpath build-file:cdn build-file:i18n \
  build-file:cachebust build-file:prefix build-file:subpath-prefix build-file:cdn-prefix build-file:i18n-prefix; do
  echo "== $t"
  log="build-${t//:/-}.log"
  # Nx's plugin workers sometimes time out on this machine; one retry.
  npx nx run fixture:$t --skip-nx-cache > "$log" 2>&1 || npx nx run fixture:$t --skip-nx-cache > "$log" 2>&1 || { tail -40 "$log"; exit 1; }
  rg "Output location" "$log"
done
