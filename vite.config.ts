// Конфиг собран вручную взамен @lovable.dev/vite-tanstack-config@2.7.7 (шаг 1 миграции).
// Воспроизведено всё, что тот пакет делал на продовой сборке: tailwindcss,
// vite-tsconfig-paths, tanstackStart (с importProtection), nitro, viteReact,
// подстановка VITE_*, алиас `@`, dedupe React/TanStack, lightningcss как CSS-трансформер.
//
// Намеренно НЕ перенесено:
//   - componentTagger / @tanstack/devtools-vite — только dev, инструмент редактора Lovable;
//   - dev-ssr-error-logger и dev-server-fn-error-logger — плагины с `apply: "serve"`,
//     они патчили исходники @tanstack/start-server-core ради оверлея в песочнице;
//   - lovable-build-error-diagnostics, assets-proxy, hmr-gate, dev-server-bridge —
//     всё это включалось только внутри песочницы Lovable (DEV_SERVER__PROJECT_PATH);
//   - детект песочницы (port/host/strictPort 8080) — оставлены только host/port
//     для локального `vite dev`, без strictPort.
//
// Пресет nitro — node-server вместо cloudflare-module: сборка даёт
// `.output/server/index.mjs`, его и запускает контейнер (deploy/Dockerfile).
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  // То же, что делал envDefine у Lovable: VITE_* кладутся в define, поэтому они
  // доступны и в SSR-бандле, а не только в клиентском, где их подставляет сам Vite.
  const viteEnv = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(viteEnv)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    define: envDefine,
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      // Две копии React или react-query в бандле ломают хуки и кэш запросов.
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    server: { host: "::", port: 8080 },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // Запрет на утечку серверного кода в клиентский граф — был у Lovable по умолчанию.
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
        // Серверная точка входа — src/server.ts (обёртка над SSR с перехватом ошибок).
        server: { entry: "server" },
      }),
      // nitro подключается только на сборке: в dev-режиме Vite обслуживает SSR сам.
      ...(command === "build" ? [nitro({ preset: "node-server" })] : []),
      viteReact(),
    ],
  };
});
