#!/usr/bin/env bash
# Lighthouse, мобильный профиль (п. 4.5 договора — Performance >= 85).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${AUDIT_OUT:-$ROOT/tests/.out}"
mkdir -p "$OUT/lh"
docker run --rm -v "$ROOT/tests:/tests:ro" -v "$OUT:/out" \
  mcr.microsoft.com/playwright:v1.56.0-noble bash -c '
    set -e
    cd /out/lh
    [ -d node_modules ] || { npm init -y >/dev/null 2>&1; npm i --no-audit --no-fund lighthouse chrome-launcher >/dev/null 2>&1; }
    cp /tests/lighthouse.mjs .
    export CHROME_PATH=$(ls /ms-playwright/chromium-*/chrome-linux/chrome | head -1)
    node lighthouse.mjs "$@"
  ' -- "$@"
