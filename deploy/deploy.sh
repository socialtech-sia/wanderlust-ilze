#!/usr/bin/env bash
# Выкатить тег на сервер.
#   deploy.sh <sha>
#
# Порядок: sync repo -> pull -> up -> ждать healthy -> smoke.
# Провалился smoke — возвращаемся на предыдущий тег и выходим с ошибкой.
#
# Чего здесь НЕТ, в отличие от deploy.sh соседнего проекта, и почему:
#   - дампа перед выкаткой. База — управляемый Supabase, и выкатка кода её схемы
#     не трогает. Дамп делается по расписанию (deploy/backup.sh в кроне), а не
#     привязан к деплою: привязка создавала бы ложное чувство, что резервная
#     копия свежая ровно тогда, когда она нужна.
#   - шага миграций. Миграции Supabase применяются отдельно и осознанно
#     (см. CLAUDE.md, раздел «Миграции»), а не автоматически на каждом пуше:
#     откатить контейнер можно за секунды, схему — нет.
set -euo pipefail

TAG="${1:?нужен тег (git sha)}"
ROOT="${WANDERLUST_ROOT:-/opt/wanderlust}"
COMPOSE="$ROOT/compose.yml"
ENV_FILE="$ROOT/.env"
STATE="$ROOT/current_tag"
LOG="$ROOT/logs/deploy.log"
IMAGE="ghcr.io/socialtech-sia/wanderlust"

mkdir -p "$ROOT/logs"
exec > >(tee -a "$LOG") 2>&1
echo "=== $(date -Is) deploy $TAG ==="

[ -f "$COMPOSE" ]  || { echo "нет $COMPOSE"; exit 1; }
[ -f "$ENV_FILE" ] || { echo "нет $ENV_FILE"; exit 1; }

DC=(docker compose -f "$COMPOSE" --env-file "$ENV_FILE")
PREV="$(cat "$STATE" 2>/dev/null || true)"

# `up -d` возвращается по старту контейнера, а не по его готовности, и Traefik
# регистрирует пересозданный контейнер не мгновенно. Без ожидания smoke стучится
# в ещё не поднятый стек и роняет деплой, который на самом деле удался.
# Зовётся ПОСЛЕ КАЖДОГО `up -d`, включая ветку отката.
wait_ready() {
  local deadline=$(( $(date +%s) + 120 )) state
  while :; do
    state="$(docker inspect -f '{{.State.Health.Status}}' wanderlust-web 2>/dev/null || echo missing)"
    [ "$state" = "healthy" ] && break
    if [ "$(date +%s)" -ge "$deadline" ]; then
      echo "не дождались healthy за 120с (сейчас: $state)"
      break   # приговор выносит smoke, а не таймер
    fi
    sleep 3
  done
  # Запас на то, чтобы Traefik увидел пересозданный контейнер и построил роутер.
  sleep 5
}

# Уборка своих образов. Рядом на машине живёт чужой продакшен, и кончившийся
# диск уронит и его. Сносим ТОЛЬКО свой репозиторий образов и только по явному
# списку тегов: `docker image prune -a` снёс бы неиспользуемые образы соседа.
#
# Зовётся ПОСЛЕ зелёного smoke и ПОСЛЕ записи current_tag: до этого момента
# предыдущий тег — это то, на что откатывается провалившийся деплой.
#
# Кеш сборки здесь не трогается вовсе: мы собираем в GitHub Actions, локального
# кеша от нас не остаётся, а чужой прунить не наше дело.
cleanup_images() {
  local keep_a="$1" keep_b="$2" ref tag
  echo "-- уборка: образы wanderlust, кроме $keep_a и ${keep_b:-«нет предыдущего»} --"
  while read -r ref; do
    tag="${ref##*:}"
    case "$tag" in
      "$keep_a"|"$keep_b"|latest|local|'<none>') continue;;
    esac
    docker rmi "$ref" >/dev/null 2>&1 || true   # занятый образ — не повод ронять деплой
  done < <(docker images --format '{{.Repository}}:{{.Tag}}' | grep -E "^${IMAGE}:" || true)
  echo "   свободно на диске: $(df -h / | tail -1 | awk '{print $4}')"
}

# --- 1. синхронизировать рабочую копию с разворачиваемым тегом ---
# Не формальность: $ROOT/compose.yml — симлинк в этот репозиторий, и smoke.sh
# берётся отсюда же. Без синхронизации новый тег крутил бы старый compose
# и проверялся старым smoke, молча.
echo "-- sync repo -> $TAG --"
cd "$ROOT/repo"
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ОСТАНОВКА: в $ROOT/repo есть незакоммиченные изменения."
  echo "Деплой не затирает незавершённую работу — закоммить её или откати вручную."
  exit 1
fi
git fetch --quiet origin
git checkout --quiet --detach "$TAG"
echo "   HEAD = $(git rev-parse --short=12 HEAD)"

# --- 2. образ ---
echo "-- pull $TAG --"
export TAG
"${DC[@]}" pull

# --- 2.5. в образе НАШ Supabase? ---
# VITE_* вшиваются в клиентский бандл на сборке, в CI, из секретов GitHub.
# Сервер на них не влияет и в рантайме не подменит. Значит образ приезжает
# технически исправным и при этом может ходить в чужой проект.
#
# 22.09 так и вышло: в секрете VITE_SUPABASE_PUBLISHABLE_KEY остался anon-ключ
# отключённого Lovable-проекта (ref uqddhtimdrwlzpbezbgi). Каждый браузерный
# запрос получал 401, списки услуг приходили пустыми, шаг 1 брони отдавал
# отключённые кнопки (StepType.tsx гасит кнопку при count === 0).
#
# Smoke этого не видит ВООБЩЕ: SSR ходит в Supabase серверными ключами из
# .env, страницы рендерятся целыми, все проверки зелёные — ломается только
# браузер. Поэтому сверяем здесь, ДО `up`, пока прод ещё не тронут.
echo "-- проверка вшитых VITE_* --"
env_val() { grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2-; }
WANT_KEY="$(env_val VITE_SUPABASE_PUBLISHABLE_KEY)"
WANT_URL="$(env_val VITE_SUPABASE_URL)"
[ -n "$WANT_KEY" ] && [ -n "$WANT_URL" ] || {
  echo "ОСТАНОВКА: в $ENV_FILE нет VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY,"
  echo "сверять образ не с чем."
  exit 1
}

ASSETS=/app/.output/public/assets
BAKED="$(docker run --rm --entrypoint sh "$IMAGE:$TAG" -c \
  "test -d $ASSETS && grep -rhoE 'eyJ[A-Za-z0-9_-]+[.]eyJ[A-Za-z0-9_-]+[.][A-Za-z0-9_-]+' $ASSETS | sort -u" || true)"
if [ -z "$BAKED" ]; then
  echo "ОСТАНОВКА: в образе $TAG не нашёлся ни один JWT в $ASSETS."
  echo "Либо раскладка образа изменилась, либо бандл собран без VITE_*."
  exit 1
fi
if ! printf '%s\n' "$BAKED" | grep -qxF "$WANT_KEY"; then
  echo "ОСТАНОВКА: образ $TAG собран с ЧУЖИМ anon-ключом."
  echo "   ждали (хвост ключа из $ENV_FILE): …${WANT_KEY: -16}"
  printf '%s\n' "$BAKED" | while read -r k; do echo "   в бандле:                        …${k: -16}"; done
  echo "Лечится не на сервере: секрет VITE_SUPABASE_PUBLISHABLE_KEY в GitHub"
  echo "(Settings -> Secrets -> Actions), затем пересборка образа."
  exit 1
fi
if ! docker run --rm -e WANT_URL="$WANT_URL" --entrypoint sh "$IMAGE:$TAG" -c \
     "grep -rqF \"\$WANT_URL\" $ASSETS"; then
  echo "ОСТАНОВКА: в бандле образа $TAG нет адреса $WANT_URL — собран на чужой URL."
  exit 1
fi
echo "   ключ и адрес совпадают с $ENV_FILE"

# --- 3. поднять ---
echo "-- up --"
"${DC[@]}" up -d --remove-orphans

echo "-- ждём готовности --"
wait_ready

# --- 4. smoke: единственное, что решает, удался ли деплой ---
echo "-- smoke --"
if "$ROOT/repo/deploy/smoke.sh"; then
  echo "$TAG" > "$STATE"
  cleanup_images "$TAG" "$PREV"
  echo "=== деплой $TAG успешен ==="
  exit 0
fi

# --- откат ---
echo "smoke провалился"
if [ -z "$PREV" ]; then
  echo "ОТКАТ НЕВОЗМОЖЕН: предыдущего тега нет ($STATE пуст). Контейнер оставлен как есть."
  echo "Прод на Lovable при этом не затронут — переключение DNS делается отдельно."
  exit 1
fi

echo "-- откат на $PREV --"
# Откат возвращает состояние целиком, а не только тег образа: иначе в рабочем
# дереве остаётся сломанный коммит, и smoke.sh из него проверяет откатившийся
# контейнер — приговор выносит ровно та версия, от которой мы откатываемся.
if git cat-file -e "$PREV^{commit}" 2>/dev/null; then
  git checkout --quiet --detach "$PREV"
  echo "   рабочее дерево возвращено на $(git rev-parse --short=12 HEAD)"
else
  echo "   ВНИМАНИЕ: коммита $PREV нет локально — откатываю только образ."
fi
export TAG="$PREV"
"${DC[@]}" up -d --remove-orphans
echo "-- ждём готовности после отката --"
wait_ready

if "$ROOT/repo/deploy/smoke.sh"; then
  echo "откат на $PREV успешен; тег $TAG забракован. Лог: $LOG"
  exit 1
fi
echo "ОТКАТ ТОЖЕ ПРОВАЛИЛ SMOKE. Сайт на этом хосте нерабочий, нужен ручной разбор."
echo "Лог: $LOG · контейнер: docker logs wanderlust-web"
exit 1
