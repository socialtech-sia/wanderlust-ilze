#!/usr/bin/env bash
# Аудит боевого сайта в официальном образе Playwright.
#
# Образ несёт браузеры, но НЕ несёт пакет @playwright/test, поэтому пакет
# ставится внутрь контейнера один раз и кэшируется в tests/.out/nm.
# PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 обязателен: браузеры в образе уже есть,
# без него npm потянет ещё один комплект на полгигабайта.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${AUDIT_OUT:-$ROOT/tests/.out}"
PW_VERSION="${PW_VERSION:-1.56.0}"
mkdir -p "$OUT/nm"
docker run --rm \
  -v "$ROOT/tests:/tests:ro" -v "$OUT:/out" \
  -e AUDIT_URL="${AUDIT_URL:-https://wanderlust.lv}" \
  -e ADMIN_EMAIL="${ADMIN_EMAIL:-}" -e ADMIN_PASSWORD="${ADMIN_PASSWORD:-}" \
  -e PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
  -e PW_VERSION="$PW_VERSION" \
  "mcr.microsoft.com/playwright:v${PW_VERSION}-noble" \
  bash -c '
    set -e
    mkdir -p /work && cp -r /tests/. /work/
    cd /work
    if [ ! -d /out/nm/node_modules ]; then
      cd /out/nm && npm init -y >/dev/null 2>&1
      npm i --no-audit --no-fund "@playwright/test@${PW_VERSION}" >/dev/null 2>&1
      cd /work
    fi
    ln -sfn /out/nm/node_modules /work/node_modules
    npx playwright test -c playwright.config.ts "$@"
  ' -- "$@"
