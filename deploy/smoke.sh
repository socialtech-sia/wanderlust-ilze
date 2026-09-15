#!/usr/bin/env bash
# Проверка после выкатки. Возвращает 0, только если сайт действительно отдаёт
# отрендеренные на сервере страницы через общий Traefik.
#
# Ходим через --resolve на 127.0.0.1: это проверяет ровно нашу цепочку
# (Traefik -> контейнер) и не зависит от того, куда сейчас смотрит внешний DNS.
# Сертификат при этом проверяется по-настоящему — имя в нём то же.
set -uo pipefail

HOST="${SMOKE_HOST:-wanderlust.socialtech.technology}"
FAILED=0

say()  { printf '%-46s %s\n' "$1" "$2"; }
fail() { FAILED=1; }

get() { # get <path> -> тело в stdout, код в файле
  curl -sS -L --max-time 20 --resolve "$HOST:443:127.0.0.1" \
       -o "$2" -w '%{http_code}' "https://$HOST$1"
}

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

# 1. Контейнер жив и здоров по своей же проверке.
health="$(docker inspect -f '{{.State.Health.Status}}' wanderlust-web 2>/dev/null || echo missing)"
say "контейнер wanderlust-web" "$health"
[ "$health" = "healthy" ] || fail

# 2. Три языка отдают HTML с настоящим содержимым, а не пустую оболочку.
#    Пустая оболочка — это и есть отказ SSR, ради которого весь этот стек.
for path in /lv /en /es; do
  code="$(get "$path" "$TMP/page")"
  size="$(wc -c < "$TMP/page")"
  has_title=0; grep -aq '<title>[^<]\{10,\}</title>' "$TMP/page" && has_title=1
  has_body=0;  grep -aq '<h1\|<main\|<header' "$TMP/page" && has_body=1
  say "$path" "$code, ${size}b, title=$has_title body=$has_body"
  { [ "$code" = "200" ] && [ "$size" -gt 5000 ] && [ "$has_title" = 1 ] && [ "$has_body" = 1 ]; } || fail
done

# 3. Служебные адреса, которые должны существовать всегда.
for path in /robots.txt /sitemap.xml /admin/login; do
  code="$(get "$path" "$TMP/page")"
  say "$path" "$code"
  [ "$code" = "200" ] || fail
done

# 4. Корень редиректит на язык по умолчанию.
code="$(curl -sS --max-time 20 --resolve "$HOST:443:127.0.0.1" \
        -o /dev/null -w '%{http_code}' "https://$HOST/")"
say "/ (без -L)" "$code"
case "$code" in 30[0-8]) ;; *) fail;; esac

if [ "$FAILED" = 0 ]; then echo "smoke: зелёный"; else echo "smoke: ПРОВАЛ"; fi
exit "$FAILED"
