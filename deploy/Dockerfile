# syntax=docker/dockerfile:1
#
# Двухстадийная сборка wanderlust.
#   Стадия build — oven/bun: ставит зависимости и собирает (vite + nitro, пресет node-server).
#   Стадия runtime — node:22-slim: в образ едет ТОЛЬКО `.output/`.
#
# Почему рантайм на Node, а не на Bun: Bun нужен ровно на время сборки (lockfile,
# скорость установки), а гонять прод на нём — лишний риск ради ничего. Образ
# без Bun и без node_modules: nitro кладёт в `.output/server` уже собранный
# бандл со всеми зависимостями внутри.
#
# Собирать из КОРНЯ репозитория:
#   docker build -f deploy/Dockerfile --build-arg VITE_SUPABASE_URL=... \
#                --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=... -t wanderlust:local .

# ---------- стадия 1: сборка ----------
FROM oven/bun:1-slim AS build
WORKDIR /app

# Отдельным слоем — чтобы установка зависимостей не переигрывалась при правке исходников.
# bunfig.toml обязателен: в нём minimumReleaseAge, без него состав зависимостей другой.
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

COPY . .

# VITE_* подставляются в клиентский бандл на этапе СБОРКИ (vite.config.ts, envDefine).
# В рантайме их уже не подставить, поэтому они приходят сюда аргументами сборки.
# Оба значения публичны по устройству Supabase (anon-ключ защищён RLS) — секретов
# в build-args нет и быть не должно.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

# Падать здесь, а не в браузере у клиента: без этих переменных сборка формально
# успешна, но клиентский createSupabaseClient() бросает на первом же рендере.
RUN test -n "$VITE_SUPABASE_URL" || { echo "нет build-arg VITE_SUPABASE_URL"; exit 1; } && \
    test -n "$VITE_SUPABASE_PUBLISHABLE_KEY" || { echo "нет build-arg VITE_SUPABASE_PUBLISHABLE_KEY"; exit 1; }

# 1536 МБ — потолок кучи для сборщика. На машине 7.5 ГБ и рядом чужой прод;
# без потолка Node берёт долю от общей памяти и конкурирует с ним (см. mem_limit
# в deploy/compose.prod.yml и аудит §1).
ENV NODE_OPTIONS=--max-old-space-size=1536
ENV NODE_ENV=production
RUN bun run build && test -f .output/server/index.mjs

# ---------- стадия 2: рантайм ----------
FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Пользователь node (uid 1000) есть в образе node — своего не заводим.
COPY --from=build --chown=node:node /app/.output ./.output

USER node
EXPOSE 3000

# Проверка через сам Node: в node:22-slim нет ни curl, ни wget, а ставить пакет
# ради healthcheck — плюс слой и плюс поверхность. fetch в Node 22 глобальный.
# `/` отвечает 302 на `/lv` (редирект выдаёт SSR-роутер), поэтому порог — <400.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/',{redirect:'manual'}).then(r=>process.exit(r.status<400?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
