# wanderlust.lv — как этим управлять

Сайт гида Ilze Gulbe: три языка (lv/en/es), бронирование, админка.
Раньше жил на Lovable, теперь целиком наш: и приложение, и база, и файлы —
на VPS `ubuntu-8gb-nbg1-1` (46.224.178.244). От Lovable не осталось ничего.

## Стек

| Что | Чем |
|---|---|
| Фреймворк | TanStack Start (React 19) с SSR |
| Сборка | Vite 8 + nitro, пресет `node-server` → `.output/server/index.mjs` |
| Стили | Tailwind 4, CSS-трансформер lightningcss |
| База, auth, storage | **Свой** Supabase, стек `/opt/wanderlust/supabase` |
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
├── supabase/       СВОЙ стек Supabase: .env (600), override, volumes/
├── backups/        дампы базы и архивы бакета, 30 дней
└── logs/           deploy.log, backup.log, backup.status, ssh-forced.log
```

## Свой Supabase

Стек в `/opt/wanderlust/supabase`, compose-проект **`wanderlust-supabase`**,
десять контейнеров с префиксом `wanderlust-supabase-*`.

`docker-compose.yml` — стоковый, из upstream, не редактируется. Всё наше лежит
в `docker-compose.override.yml`, и это симлинк в репозиторий, как и `compose.yml`
у самого сайта:

```
/opt/wanderlust/supabase/docker-compose.override.yml
  -> repo/deploy/supabase-compose.override.yml
```

Там переименование контейнеров, порты, лимиты памяти и лейблы Traefik. Правится
в репозитории и едет через git, а не живёт одной копией на машине.

`.env` стека в git НЕ попадает (секреты), шаблон — стоковый `.env.example`
рядом с ним.

**Переименование обязательно.** Стоковый файл жёстко задаёт `container_name`
(`supabase-db` и прочие), а такие же имена занял чужой демо-стенд SRC.

| Порт (только 127.0.0.1) | Что |
|---|---|
| 8100 | API-шлюз (envoy) |
| 8101 | Studio |
| 5532 | пулер, сессионный режим |
| 6643 | пулер, транзакционный режим |

8000, 5432 и 6543 занимает чужой демо-стенд — не занимать.

Наружу через Traefik смотрит **только** API-шлюз, на `api.wanderlust.lv`, и
правило роутера — белый список путей (`/rest/v1`, `/auth/v1`, `/storage/v1`,
`/realtime/v1`, `/graphql/v1`), а не просто `Host()`. Так сделано потому, что
последний маршрут внутри envoy — catch-all на Studio: правило по одному хосту
открыло бы Studio в интернет, пусть и под basic-auth. Заодно снаружи закрыт
`/pg/` — это postgres-meta, то есть выполнение произвольного SQL.

Studio доступна только с самой машины:

```bash
ssh -L 8101:127.0.0.1:8101 deploy@46.224.178.244
# затем http://127.0.0.1:8101
```

У каждого контейнера `mem_limit` и `oom_score_adj: 500`; суммарный потолок
стека — 1664 МБ. Смысл тот же, что у сайта: на машине два чужих продакшена, и
при нехватке памяти жертвой должны быть мы, а не чужой Postgres. Пулеру 22.09
добавлено 128 МБ: на 128 он не поднимался вовсе (см. комментарий в override).

Контейнер `functions` (edge-runtime) намеренно не поднимается — он выключен
профилем `disabled` в override. Все четыре бывшие Edge Functions переписаны
серверными маршрутами самого приложения:

| Было | Стало |
|---|---|
| `send-booking-notification` | `src/routes/api/public/booking-notification.ts` |
| `send-contact-notification` | `src/routes/api/public/contact-notification.ts` |
| `chat-with-ai` | `src/routes/api/public/chat.ts` |
| `send-booking-reply` | `src/lib/admin-email.functions.ts` |

Секреты у них общие с приложением, из `/opt/wanderlust/.env`, отдельного
рантайма и отдельной раздачи секретов больше нет.

## Переменные окружения

Живут в `/opt/wanderlust/.env` (600). Шаблон — `.env.example` в репозитории.
**Без кавычек:** `docker --env-file` кавычки не снимает, и значение приедет
в контейнер вместе с ними — страница при этом отрендерится без данных.

Отдельно стоит помнить: `VITE_*` вшиваются в клиентский бандл **на этапе сборки**,
в CI (`build-args` в `.github/workflows/deploy.yml`), а не читаются в рантайме.
Смена Supabase-проекта требует пересборки образа, а не только правки `.env`.

`SUPABASE_URL` и `VITE_SUPABASE_URL` держим **одинаковыми** (`https://api.wanderlust.lv`),
хотя серверная сторона могла бы ходить в шлюз напрямую по внутренней сети.
Причина: ссылки на файлы в storage собираются в том числе на сервере и уезжают
в браузер как есть. Разойдись эти два адреса — в HTML попал бы внутренний хост,
недостижимый у клиента.

У стека Supabase свой файл окружения, `/opt/wanderlust/supabase/.env`, тоже 600.
Сайтовый `.env` и стековый — разные файлы; общего у них только то, что
`ANON_KEY`/`SERVICE_ROLE_KEY` из второго скопированы в первый.

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

SQL-файлы лежат в `supabase/migrations/`, это источник правды по схеме **и по сиду**.
Деплой их НЕ применяет — намеренно: контейнер откатывается за секунды, схема нет.

Схема после наката: 13 таблиц в `public`, 32 политики RLS (28 в `public` +
4 в `storage`), схема `private` с `has_role()` и `bootstrap_first_admin()`.
`private` намеренно НЕ перечислена в `PGRST_DB_SCHEMAS` — через REST её функции
не вызвать, и это свойство надо сохранять.

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
по воскресеньям с `--verify` (разворачивает дамп во временный Postgres и
проверяет не только число таблиц, но и данные). Хранение 30 дней — пункт
договора 6.8. Всё в `/opt/wanderlust/backups/`.

Бэкапятся **две** вещи, и обе обязательны:

1. дамп базы — схема, данные, политики, `auth.users`;
2. `wanderlust-storage-*.tar.gz` — файлы бакета `public-media`. Они лежат на
   диске в `supabase/volumes/storage` и в `pg_dump` НЕ попадают: в
   `storage.objects` только метаданные. Без архива восстановленная база
   ссылалась бы на несуществующие картинки.

Офсайт (restic) включается, если в `.env` появятся `RESTIC_REPOSITORY` и
`RESTIC_PASSWORD`; пока их нет, дамп существует только на этой машине, и скрипт
пишет об этом прямо. В `restic forget` здесь обязателен `--group-by tag` —
без него имя дампа с отметкой времени даёт каждому снапшоту собственную группу,
и retention не удаляет ничего никогда (этот дефект живёт в бэкапе соседнего проекта).

## Ротация ключей

- **anon / publishable Supabase** — публичен по устройству, защищён RLS.
  Это JWT, подписанный `JWT_SECRET` из `/opt/wanderlust/supabase/.env`. Меняется
  там, затем в `/opt/wanderlust/.env`, в секретах GitHub (`VITE_SUPABASE_URL`,
  `VITE_SUPABASE_PUBLISHABLE_KEY`) и **пересборкой образа**: значение вшито в
  клиентский бандл. После смены `JWT_SECRET` перевыпускать надо ОБА ключа
  сразу — anon и service_role подписаны одним секретом.
- **service_role** — только в `/opt/wanderlust/.env`, в бандл не попадает и не
  должен (у него нет префикса `VITE_`). После смены достаточно
  `docker compose ... up -d` — пересборка не нужна.
- **RESEND_API_KEY, ANTHROPIC_API_KEY** — там же, рантайм, пересборка не нужна.
- **ключ CI** — пара лежит в GitHub Secrets (`SSH_KEY`) и в
  `~/.ssh/authorized_keys` пользователя `deploy`. Меняется заменой обеих половин;
  строка в authorized_keys узнаётся по комментарию `wanderlust-ci`.

После любой ротации: `docker logs wanderlust-web` — ошибки Supabase видны сразу.
