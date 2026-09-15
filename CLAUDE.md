# wanderlust.lv — как этим управлять

Сайт гида Ilze Gulbe: три языка (lv/en/es), бронирование, админка.
Раньше жил на Lovable, теперь — контейнером на нашем VPS `ubuntu-8gb-nbg1-1`
(46.224.178.244). База осталась управляемым Supabase.

## Стек

| Что | Чем |
|---|---|
| Фреймворк | TanStack Start (React 19) с SSR |
| Сборка | Vite 8 + nitro, пресет `node-server` → `.output/server/index.mjs` |
| Стили | Tailwind 4, CSS-трансформер lightningcss |
| База, auth, storage | **Управляемый** Supabase, проект `uqddhtimdrwlzpbezbgi` |
| Пакеты | bun (`bun.lock`), на хост сервера bun НЕ ставится |
| Образ | `ghcr.io/socialtech-sia/wanderlust:<sha>` |
| Маршрутизация | общий Traefik на машине, только через лейблы контейнера |

`vite.config.ts` собран вручную взамен проприетарного `@lovable.dev/vite-tanstack-config`.
Что именно воспроизведено и что выброшено — в комментарии в начале файла.

## Машина: чего делать нельзя

Рядом работают два ЧУЖИХ продакшена — crawo (`/opt/crawo`) и демо SRC ERP
(self-hosted Supabase в `/home/deploy/supabase/docker`). Плюс общий Traefik.

1. **Не редактировать `/etc/traefik/docker-compose.yml`.** Маршруты — только лейблами.
2. **Не поднимать compose из `/opt/demo-deploy/traefik/`** — там устаревшая копия
   без резолвера `cf`, пересоздание Traefik из неё убьёт сертификаты crawo.
3. **Не занимать имена под `*.crawo.socialtech.technology`** — их ловит
   HostRegexp соседа с priority 10.
4. **Не делать `apt upgrade`** — среди ожидающих пакетов `docker-ce`,
   его обновление разом перезапустит все контейнеры на машине.
5. **Не подключаться к локальному Supabase на `demo-api`** — он чужой и
   каждую ночь в 04:00 вычищается `src-demo-reset.sh`.
6. Каждые 30–60 минут crawo переразворачивает себя автономным агентом и зовёт
   `docker builder prune`. На локальный кеш сборки рассчитывать нельзя —
   поэтому образы и собираются в GitHub Actions.

## Раскладка на сервере

```
/opt/wanderlust/
├── .env            mode 600, в git не попадает
├── compose.yml     симлинк → repo/deploy/compose.prod.yml
├── current_tag     развёрнутый sha, из него делается откат
├── repo/           git-чекаут
├── backups/        дампы базы, 30 дней
└── logs/           deploy.log, backup.log, backup.status, ssh-forced.log
```

## Переменные окружения

Живут в `/opt/wanderlust/.env` (600). Шаблон — `.env.example` в репозитории.
**Без кавычек:** `docker --env-file` кавычки не снимает, и значение приедет
в контейнер вместе с ними — страница при этом отрендерится без данных.

Отдельно стоит помнить: `VITE_*` вшиваются в клиентский бандл **на этапе сборки**,
в CI (`build-args` в `.github/workflows/deploy.yml`), а не читаются в рантайме.
Смена Supabase-проекта требует пересборки образа, а не только правки `.env`.

## Выкатка

Обычный путь — пуш в `main` или в `migration/self-hosted`:
GitHub Actions собирает образ, кладёт в GHCR и по SSH зовёт `deploy.sh <sha>`.
Ключ CI заперт forced command'ом (`deploy/ssh-forced-command.sh`): шелла он не даёт,
принимает ровно `deploy <hex-sha>`.

Вручную с машины:

```bash
/opt/wanderlust/repo/deploy/deploy.sh <sha>
```

Порядок внутри: sync repo → pull → up → ждать healthy → `deploy/smoke.sh`.
Smoke — единственное, что решает, удался ли деплой: он требует не просто 200,
а отрендеренные на сервере страницы на всех трёх языках.

## Откат

`deploy.sh` откатывается сам, если smoke провалился: возвращает и образ,
и рабочее дерево на тег из `current_tag`. Вручную:

```bash
TAG=$(cat /opt/wanderlust/current_tag)   # или любой предыдущий sha
git checkout --detach "$TAG"
TAG=$TAG docker compose -f /opt/wanderlust/compose.yml --env-file /opt/wanderlust/.env up -d
```

Пока DNS `wanderlust.lv` не переключён, полный откат — это ещё и «ничего не делать»:
клиентский сайт продолжает отдаваться с Lovable.

## Миграции Supabase

SQL-файлы лежат в `supabase/migrations/`, это источник правды по схеме.
Деплой их НЕ применяет — намеренно: контейнер откатывается за секунды, схема нет.

```bash
# 1. свежий дамп ПЕРЕД любой миграцией
/opt/wanderlust/repo/deploy/backup.sh
# 2. применить конкретный файл
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/<файл>.sql
```

## Логи и наблюдение

```bash
docker logs wanderlust-web            # приложение
docker logs -f wanderlust-web
tail -f /opt/wanderlust/logs/deploy.log
cat /opt/wanderlust/logs/backup.status
docker stats --no-stream wanderlust-web
```

Контейнер ограничен 768 МБ (`mem_limit`) и помечен `oom_score_adj=500`.
Это не экономия: у одиннадцати контейнеров демо-Supabase лимитов нет вовсе,
и при нехватке памяти ядро выбирало бы жертву по размеру. Мы объявляем
предпочтительной жертвой себя — упасть должен наш сайт, а не чужой Postgres.
В покое сайт занимает около 49 МБ.

## Бэкапы

`deploy/backup.sh`, из крона пользователя `deploy` в 02:40 UTC ежедневно,
по воскресеньям с `--verify` (разворачивает дамп во временный Postgres).
Хранение 30 дней — пункт договора 6.8. Дампы в `/opt/wanderlust/backups/`.

Офсайт (restic) включается, если в `.env` появятся `RESTIC_REPOSITORY` и
`RESTIC_PASSWORD`; пока их нет, дамп существует только на этой машине, и скрипт
пишет об этом прямо. В `restic forget` здесь обязателен `--group-by tag` —
без него имя дампа с отметкой времени даёт каждому снапшоту собственную группу,
и retention не удаляет ничего никогда (этот дефект живёт в бэкапе соседнего проекта).

## Ротация ключей

- **anon / publishable Supabase** — публичен по устройству, защищён RLS.
  Меняется в Supabase, затем в `/opt/wanderlust/.env`, в секретах GitHub
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) и **пересборкой образа**:
  значение вшито в клиентский бандл.
- **service_role** — только в `/opt/wanderlust/.env`, в бандл не попадает и не
  должен (у него нет префикса `VITE_`). После смены достаточно
  `docker compose ... up -d` — пересборка не нужна.
- **RESEND_API_KEY, ANTHROPIC_API_KEY** — там же, рантайм, пересборка не нужна.
- **ключ CI** — пара лежит в GitHub Secrets (`SSH_KEY`) и в
  `~/.ssh/authorized_keys` пользователя `deploy`. Меняется заменой обеих половин;
  строка в authorized_keys узнаётся по комментарию `wanderlust-ci`.

После любой ротации: `docker logs wanderlust-web` — ошибки Supabase видны сразу.
