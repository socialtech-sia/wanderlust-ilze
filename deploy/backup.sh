#!/usr/bin/env bash
# Бэкап базы wanderlust. Пункт договора 6.8: ежедневно, хранить 30 дней.
#
#   backup.sh            обычный прогон: дамп + офсайт-копия
#   backup.sh --verify   то же + контрольное восстановление (еженедельный прогон)
#
# База — УПРАВЛЯЕМЫЙ Supabase, не локальный демо-стек этой машины (тот принадлежит
# соседнему проекту и вычищается каждую ночь). Поэтому бэкапится не контейнер,
# а удалённая база по её строке подключения.
#
# Коды возврата:
#   0  дамп сделан; офсайт ушёл или не настроен (о чём напечатано)
#   3  дамп сделан и читается, но офсайт-копия НЕ ушла
#   1  пригодного дампа нет — это и есть отсутствие бэкапа
set -uo pipefail

ROOT="${WANDERLUST_ROOT:-/opt/wanderlust}"
ENV_FILE="${WANDERLUST_ENV_FILE:-$ROOT/.env}"
BACKUP_DIR="$ROOT/backups"
LOG="$ROOT/logs/backup.log"
STATUS="$ROOT/logs/backup.status"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
DUMP="$BACKUP_DIR/wanderlust-$STAMP.dump"
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
  echo "Это строка подключения к управляемому Supabase (Project Settings -> Database ->"
  echo "Connection string -> URI), с паролем базы. Без неё бэкапа НЕТ ВООБЩЕ —"
  echo "пункт договора 6.8 не выполняется."
  finish "FAILED:no-db-url" 1
fi

# --- 1. дамп ---------------------------------------------------------------
# -Fc (custom): сжат, восстанавливается выборочно, и pg_restore умеет его читать
# без совпадения версий. --no-owner/--no-acl: роли управляемого Supabase в целевой
# базе всё равно свои, а падать на их отсутствии при восстановлении незачем.
echo "-- pg_dump -> $DUMP --"
if ! pg_dump "$SUPABASE_DB_URL" \
      --format=custom --compress=9 --no-owner --no-acl \
      --exclude-schema='pg_*' --exclude-schema=information_schema \
      --file="$DUMP" 2>&1; then
  echo "ОШИБКА: pg_dump не отработал"
  rm -f "$DUMP"
  finish "FAILED:pg_dump" 1
fi

SIZE="$(stat -c %s "$DUMP")"
echo "   размер: $(( SIZE / 1024 )) КБ"
# Пустой или обрубленный файл — это не бэкап. Читаемость проверяем всегда,
# а не только в еженедельном прогоне: дамп, который не открывается, надо
# ловить сегодня, а не через неделю.
if ! pg_restore --list "$DUMP" > /dev/null 2>&1; then
  echo "ОШИБКА: дамп не читается pg_restore — он непригоден"
  finish "FAILED:unreadable" 1
fi
echo "   оглавление читается: $(pg_restore --list "$DUMP" | grep -c '^[0-9]') объектов"

# --- 2. контрольное восстановление (еженедельно) ---------------------------
# Бэкап, который ни разу не разворачивали, бэкапом не считается. Разворачиваем во
# ВРЕМЕННЫЙ контейнер Postgres: ни боевая база, ни чужие контейнеры не трогаются.
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
    if docker exec -i "$CID" pg_restore -U postgres -d verify --no-owner --no-acl < "$DUMP" >/dev/null 2>&1; then
      tables="$(docker exec "$CID" psql -U postgres -d verify -tAc \
                "select count(*) from information_schema.tables where table_schema='public'" 2>/dev/null)"
      echo "   восстановлено, таблиц в public: ${tables:-?}"
      [ "${tables:-0}" -gt 0 ] || { echo "ОШИБКА: восстановилось 0 таблиц"; docker rm -f "$CID" >/dev/null 2>&1; finish "FAILED:verify" 1; }
    else
      # pg_restore ругается на расширения и роли Supabase, которых в чистом
      # Postgres нет; это ожидаемо и не делает дамп непригодным. Приговор
      # выносит счёт таблиц, а не код возврата pg_restore.
      tables="$(docker exec "$CID" psql -U postgres -d verify -tAc \
                "select count(*) from information_schema.tables where table_schema='public'" 2>/dev/null)"
      if [ "${tables:-0}" -gt 0 ]; then
        echo "   восстановлено с замечаниями (расширения/роли Supabase), таблиц: $tables"
      else
        echo "ОШИБКА: восстановление не дало ни одной таблицы"
        docker rm -f "$CID" >/dev/null 2>&1
        finish "FAILED:verify" 1
      fi
    fi
    docker rm -f "$CID" >/dev/null 2>&1
  fi
fi

# --- 3. локальное хранение 30 дней -----------------------------------------
echo "-- локальная ротация: старше $KEEP_DAYS дней --"
deleted="$(find "$BACKUP_DIR" -maxdepth 1 -name 'wanderlust-*.dump' -mtime +$KEEP_DAYS -print -delete | wc -l)"
echo "   удалено: $deleted · осталось: $(find "$BACKUP_DIR" -maxdepth 1 -name 'wanderlust-*.dump' | wc -l)"

# --- 4. офсайт --------------------------------------------------------------
# Копия на самой машине не защищает от потери машины. Офсайт не обязателен для
# работы скрипта, но его отсутствие проговаривается вслух, а не замалчивается.
if [ -z "${RESTIC_REPOSITORY:-}" ] || [ -z "${RESTIC_PASSWORD:-}" ]; then
  echo "-- офсайт не настроен (нет RESTIC_REPOSITORY/RESTIC_PASSWORD в $ENV_FILE) --"
  echo "   дамп существует только на этой машине."
  finish "OK:local-only" 0
fi

echo "-- офсайт: restic --"
if restic backup --tag wanderlust --host wanderlust "$DUMP" >/dev/null 2>&1; then
  # --group-by tag ОБЯЗАТЕЛЕН, и это не косметика.
  # По умолчанию restic группирует снапшоты по host,paths. Имя дампа содержит
  # отметку времени, значит paths у каждого снапшота свой, значит каждый снапшот
  # образует собственную группу из одного элемента, и --keep-daily 30 честно
  # оставляет в каждой группе её единственный снапшот. Удаляется — ничего.
  # Ровно этот дефект живёт в backup.sh соседнего проекта: 204 прогона, 0 удалений.
  # Группировка по тегу собирает все снапшоты в одну группу, и retention начинает
  # работать. --prune — потому что без него forget только помечает, место не
  # освобождается.
  if restic forget --tag wanderlust --group-by tag \
       --keep-daily "$KEEP_DAYS" --prune >/dev/null 2>&1; then
    echo "   снапшот отправлен, retention keep-daily=$KEEP_DAYS применён (группировка по тегу)"
  else
    echo "   ВНИМАНИЕ: снапшот отправлен, но retention не применился"
  fi
  finish "OK" 0
fi

echo "ОШИБКА: restic backup не прошёл. Локальный дамп есть и читается: $DUMP"
finish "OK:offsite-failed" 3
