#!/usr/bin/env bash
# PROTOTYPE 198: production SSR servers for the three candidates. Sets NG_ALLOWED_HOSTS.
#   4811  184 carriers + 188 own-style   (D:/tmp/nfs-proto-198-188)
#   4812  189 <link> loader              (D:/tmp/nfs-proto-198-189)
#   4813  192 proposal A, CSS in chunk   (D:/tmp/nfs-proto-198-192)
export NG_ALLOWED_HOSTS=localhost,127.0.0.1
PORT=4811 node D:/tmp/nfs-proto-198-188/dist/apps/fixture/server/server.mjs > D:/tmp/nfs-proto-198-188/serve-198.log 2>&1 &
PORT=4812 node D:/tmp/nfs-proto-198-189/dist/apps/fixture-production/server/server.mjs > D:/tmp/nfs-proto-198-189/serve-198.log 2>&1 &
PORT=4813 node D:/tmp/nfs-proto-198-192/dist/apps/fixture-plugin/server/server.mjs > D:/tmp/nfs-proto-198-192/serve-198.log 2>&1 &
wait
