#!/usr/bin/env bash
# PROTOTYPE (ticket 195): one production build. Usage: ./build.sh <configuration> [outputPath]; env passes through
# (NFS_SPLIT=off, NFS_SPLIT_ADOPT=off). The Angular disk cache is cleared so the plugin always runs.
cd "$(dirname "$0")"
rm -rf .angular/cache
args=(run "fixture:build:$1" --skip-nx-cache)
[ -n "$2" ] && args+=("--outputPath=$2")
NFS_SPLIT_LOG="${NFS_SPLIT_LOG:-$PWD/logs/split-$1${2:+-$(basename "$2")}.jsonl}"
mkdir -p logs && rm -f "$NFS_SPLIT_LOG"
set -o pipefail
NFS_SPLIT_LOG="$NFS_SPLIT_LOG" npx nx "${args[@]}" 2>&1 | rg -i "Output location|error|warning|failed"
