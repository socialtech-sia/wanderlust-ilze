#!/usr/bin/env bash
# Бэкап wanderlust. Пункт договора 6.8: ежедневно, хранить 30 дней.
#
#   backup.sh            обычный прогон: дамп + файлы storage + офсайт
#   backup.sh --verify   то же + контрольное восстановление (воскресный прогон)
#
# База БОЛЬШЕ НЕ УПРАВЛЯЕМАЯ. Она стоит на этой же машине, в стеке
# /opt/wanderlust/supabase (compose-проект wanderlust-supabase), и подключение
# идёт через сессионный пулер на 127.0.0.1:5532 — строка в SUPABASE_DB_URL.
# Соседний демо-стек SRC в /home/deploy/supabase/docker — ЧУЖОЙ, его контейнеры
# и тома здесь не упоминаются ни разу.
#
# Бэкапится ДВЕ вещи, и обе обязательны:
#   1. дамп базы  — схема, данные, роли, политики, auth.users;
#   2. файлы бакета public-media — они лежат на диске, в
#      /opt/wanderlust/supabase/volumes/storage, и в дамп НЕ попадают.
#      В storage.objects есть только метаданные; без файлов восстановленная
#      база будет ссылаться на несуществующие картинки.
#
# Коды возврата:
#   0  бэкап сделан; офсайт ушёл или не настроен (о чём напечатано)
#   3  бэкап сделан и читается, но офсайт-копия НЕ ушла
#   1  пригодного бэкапа нет — это и есть его отсутствие
set -uo pipefail

ROOT="${WANDERLUST_ROOT:-/opt/wanderlust}"
ENV_FILE="${WANDERLUST_ENV_FILE:-$ROOT/.env}"
STORAGE_DIR="${WANDERLUST_STORAGE_DIR:-$ROOT/supabase/volumes/storage}"
BACKUP_DIR="$ROOT/backups"
LOG="$ROOT/logs/backup.log"
STATUS="$ROOT/logs/backup.status"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
DUMP="$BACKUP_DIR/wanderlust-$STAMP.dump"
FILES="$BACKUP_DIR/wanderlust-storage-$STAMP.tar.gz"
KEEP_DAYS=30
VERIFY=0
case "${1:-}" in
  --verify) VERIFY=1 ;;
  "")       ;;
  *) echo "неизвестный аргумент: $1 (можно --verify)"; exit 2 ;;
esac

mkdir -p "$BACKUP_DIR" "$ROOT/logs"
exec > >(tee -a "$LOG") 2>&1
echo "=== $(date -Is) backup ==="

finish() { echo "$1 $(date -Is)" > "$STATUS"; exit "$2"; }

# shellcheck source=/dev/null
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "ОСТАНОВКА: в $ENV_FILE нет SUPABASE_DB_URL."
  echo "Это строка подключения к локальной базе через пулер, вида"
  echo "postgresql://postgres.<tenant>:<пароль>@127.0.0.1:5532/postgres."
  echo "Без неё бэкапа НЕТ ВООБЩЕ — пункт договора 6.8 не выполняется."
  finish "FAILED:no-db-url" 1
fi

# --- 1. дамп базы ----------------------------------------------------------
# -Fc (custom): сжат, восстанавливается выборочно, pg_restore читает его и при
# несовпадении версий. --no-owner/--no-acl: роли Supabase в целевой базе свои,
# падать на их отсутствии при восстановлении незачем.
# Схемы pg_* и information_schema исключены — они системные и не восстанавливаются.
# Всё остальное (auth, storage, realtime, vault) остаётся: без auth.users
# восстановленная база будет без администратора.
echo "-- pg_dump -> $DUMP --"
if ! pg_dump "$SUPABASE_DB_URL" \
      --format=custom --compress=9 --no-owner --no-acl \
      --exclude-schema='pg_*' --exclude-schema=information_schema \
      --file="$DUMP" 2>&1; then
  echo "ОШИБКА: pg_dump не отработал"
  rm -f "$DUMP"
  finish "FAILED:pg_dump" 1
fi
echo "   размер: $(( $(stat -c %s "$DUMP") / 1024 )) КБ"

# Пустой или обрубленный файл — это не бэкап. Читаемость проверяем КАЖДЫЙ раз,
# а не только в воскресном прогоне: дамп, который не открывается, надо ловить
# сегодня, а не через неделю.
if ! pg_restore --list "$DUMP" > /dev/null 2>&1; then
  echo "ОШИБКА: дамп не читается pg_restore — он непригоден"
  finish "FAILED:unreadable" 1
fi
echo "   оглавление читается: $(pg_restore --list "$DUMP" | grep -c '^[0-9]') объектов"

# --- 2. файлы бакета -------------------------------------------------------
# Каталог существует всегда; пустым он бывает ровно до первой загрузки в админке.
# Пустой архив — это тоже корректный ответ, а вот отсутствие архива означало бы,
# что мы молча не забэкапили половину состояния.
echo "-- файлы storage -> $FILES --"
if [ ! -d "$STORAGE_DIR" ]; then
  echo "ОШИБКА: нет каталога $STORAGE_DIR — файлы бакета не забэкаплены"
  finish "FAILED:no-storage-dir" 1
fi
if ! tar -czf "$FILES" -C "$(dirname "$STORAGE_DIR")" "$(basename "$STORAGE_DIR")" 2>&1; then
  echo "ОШИБКА: tar не отработал"
  rm -f "$FILES"
  finish "FAILED:tar" 1
fi
if ! tar -tzf "$FILES" > /dev/null 2>&1; then
  echo "ОШИБКА: архив storage не читается"
  finish "FAILED:tar-unreadable" 1
fi
echo "   размер: $(( $(stat -c %s "$FILES") / 1024 )) КБ · файлов: $(tar -tzf "$FILES" | grep -vc '/$')"

# --- 3. контрольное восстановление (воскресенье) ---------------------------
# Бэкап, который ни разу не разворачивали, бэкапом не считается — а здесь это
# ещё и обязательство по договору. Разворачиваем во ВРЕМЕННЫЙ контейнер:
# ни боевая база, ни чужие контейнеры на машине не трогаются.
if [ "$VERIFY" = 1 ]; then
  echo "-- контрольное восстановление --"
  CID="$(docker run -d --rm -e POSTGRES_PASSWORD=verify -e POSTGRES_DB=verify \
         --memory=512m --oom-score-adj=500 postgres:17-alpine 2>/dev/null)"
  if [ -z "$CID" ]; then
    echo "   ВНИМАНИЕ: временный Postgres не поднялся, проверку пропускаю"
  else
    for _ in $(seq 1 30); do
      docker exec "$CID" pg_isready -U postgres >/dev/null 2>&1 && break
      sleep 2
    done
    # pg_restore ругается на расширения и роли Supabase, которых в чистом
    # Postgres нет. Это ожидаемо и не делает дамп непригодным, поэтому приговор
    # выносит не код возврата, а то, что реально доехало до таблиц.
    docker exec -i "$CID" pg_restore -U postgres -d verify --no-owner --no-acl < "$DUMP" >/dev/null 2>&1
    read -r tables services settings users <<<"$(docker exec "$CID" psql -U postgres -d verify -tAc \
      "select (select count(*) from information_schema.tables where table_schema='public'),
              (select count(*) from public.services),
              (select count(*) from public.site_settings),
              (select count(*) from auth.users)" 2>/dev/null | tr '|' ' ')"
    echo "   таблиц в public: ${tables:-0} · услуг: ${services:-0} · настроек: ${settings:-0} · пользователей: ${users:-0}"
    # Считать восстановление удавшимся только по числу таблиц недостаточно:
    # схема без строк развернулась бы точно так же. Проверяем и данные.
    if [ "${tables:-0}" -lt 13 ] || [ "${services:-0}" -lt 1 ] || [ "${users:-0}" -lt 1 ]; then
      echo "ОШИБКА: восстановление неполное"
      docker rm -f "$CID" >/dev/null 2>&1
      finish "FAILED:verify" 1
    fi
    docker rm -f "$CID" >/dev/null 2>&1
    echo "   восстановление проверено"
  fi
fi

# --- 4. локальное хранение 30 дней -----------------------------------------
echo "-- локальная ротация: старше $KEEP_DAYS дней --"
d1="$(find "$BACKUP_DIR" -maxdepth 1 -name 'wanderlust-*.dump'        -mtime +$KEEP_DAYS -print -delete | wc -l)"
d2="$(find "$BACKUP_DIR" -maxdepth 1 -name 'wanderlust-storage-*.tar.gz' -mtime +$KEEP_DAYS -print -delete | wc -l)"
echo "   удалено: дампов $d1, архивов $d2"
echo "   осталось: дампов $(find "$BACKUP_DIR" -maxdepth 1 -name 'wanderlust-*.dump' | wc -l), архивов $(find "$BACKUP_DIR" -maxdepth 1 -name 'wanderlust-storage-*.tar.gz' | wc -l)"

# --- 5. офсайт --------------------------------------------------------------
# Копия на самой машине не защищает от потери машины. Офсайт не обязателен для
# работы скрипта, но его отсутствие проговаривается вслух, а не замалчивается.
if [ -z "${RESTIC_REPOSITORY:-}" ] || [ -z "${RESTIC_PASSWORD:-}" ]; then
  echo "-- офсайт не настроен (нет RESTIC_REPOSITORY/RESTIC_PASSWORD в $ENV_FILE) --"
  echo "   дамп и файлы существуют только на этой машине."
  finish "OK:local-only" 0
fi

echo "-- офсайт: restic --"
if restic backup --tag wanderlust --host wanderlust "$DUMP" "$FILES" >/dev/null 2>&1; then
  # --group-by tag ОБЯЗАТЕЛЕН, и это не косметика.
  # По умолчанию restic группирует снапшоты по host,paths. В именах файлов стоит
  # отметка времени, значит paths у каждого снапшота свой, значит каждый снапшот
  # образует собственную группу из одного элемента — и --keep-daily 30 честно
  # оставляет в каждой группе её единственный снапшот. Не удаляется ничего и
  # никогда. Ровно этот дефект живёт в backup.sh соседнего проекта crawo:
  # 204 прогона, 0 удалений. Группировка по тегу собирает все снапшоты в одну
  # группу, и retention начинает работать.
  # --prune — потому что без него forget только помечает, место не освобождается.
  if restic forget --tag wanderlust --group-by tag \
       --keep-daily "$KEEP_DAYS" --prune >/dev/null 2>&1; then
    echo "   снапшот отправлен, retention keep-daily=$KEEP_DAYS применён (группировка по тегу)"
  else
    echo "   ВНИМАНИЕ: снапшот отправлен, но retention не применился"
  fi
  finish "OK" 0
fi

echo "ОШИБКА: restic backup не прошёл. Локальные копии есть и читаются:"
echo "   $DUMP"
echo "   $FILES"
finish "OK:offsite-failed" 3
