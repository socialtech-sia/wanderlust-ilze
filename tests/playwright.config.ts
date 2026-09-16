import { defineConfig, devices } from "@playwright/test";

/**
 * Конфиг аудита. Гоняется по ЖИВОМУ сайту, своего сервера не поднимает:
 * задача — проверить то, что реально отдаётся с боевого домена.
 *
 * Playwright намеренно НЕ добавлен в package.json — см. tests/README.md.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 4,
  retries: 1,
  reporter: [["list"], ["json", { outputFile: "/out/report.json" }]],
  use: {
    baseURL: process.env.AUDIT_URL ?? "https://wanderlust.lv",
    ignoreHTTPSErrors: false,
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile360", use: { ...devices["Pixel 5"], viewport: { width: 360, height: 740 } } },
  ],
});
