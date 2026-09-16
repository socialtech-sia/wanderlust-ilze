# Аудит через Playwright

## Почему Playwright не в package.json

`deploy/Dockerfile` ставит зависимости командой `bun install --frozen-lockfile`,
без `--production`. То есть dev-зависимости попадают в стадию сборки — и в CI
тоже. У `@playwright/test` postinstall тянет браузеры, это сотни мегабайт на
КАЖДУЮ сборку образа. Ради набора тестов, который гоняется вручную раз в
релиз, замедлять и утяжелять выкатку не стоит; у соседнего проекта на этой же
машине расход минут CI уже был проблемой.

Поэтому зависимость не добавлена, а тесты гоняются в официальном образе, где
браузеры уже стоят:

```bash
tests/run-audit.sh                      # по боевому домену
AUDIT_URL=https://wanderlust.socialtech.technology tests/run-audit.sh
```

Если когда-нибудь понадобится держать Playwright в зависимостях, сначала
добавьте в Dockerfile `ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` — иначе каждая
сборка будет качать браузеры.
