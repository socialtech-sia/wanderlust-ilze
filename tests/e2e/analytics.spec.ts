import { test, expect, type Page } from "@playwright/test";

/**
 * GA4 и Consent Mode v2 (договор 5.2).
 *
 * Проверяется поведение, а не наличие кода: уходит ли запрос к
 * googletagmanager.com и в каком состоянии Consent Mode.
 *
 * Тест подстраивается под site_settings.google_analytics_id, потому что это
 * значение правит клиент. Ключ пуст — проверяем, что на страницу не попадает
 * ВООБЩЕ ничего. Ключ задан — проверяем обе ветки согласия. Жёсткая привязка
 * к одному из состояний ломала бы прогон ровно в тот день, когда клиент
 * впишет свой идентификатор.
 */

const CONSENT_KEY = "wanderlust.cookie-consent.v1";

type GtagArgs = unknown[];

function trackGtagRequests(page: Page): string[] {
  const hits: string[] = [];
  page.on("request", (r) => {
    const url = r.url();
    if (url.includes("googletagmanager.com") || url.includes("google-analytics.com")) hits.push(url);
  });
  return hits;
}

async function seedConsent(page: Page, analytics: boolean) {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key as string, value as string),
    [
      CONSENT_KEY,
      JSON.stringify({
        necessary: true,
        analytics,
        marketing: false,
        timestamp: Date.now(),
        version: 1,
      }),
    ],
  );
}

/** Вызовы gtag(), осевшие в dataLayer. */
function readGtagCalls(page: Page): Promise<GtagArgs[]> {
  return page.evaluate(() => {
    const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [];
    return dl.map((entry) => Array.from(entry as ArrayLike<unknown>));
  });
}

/** Настроен ли GA: dataLayer создаётся только при валидном идентификаторе. */
async function isConfigured(page: Page): Promise<boolean> {
  return page.evaluate(
    () => Array.isArray((window as unknown as { dataLayer?: unknown[] }).dataLayer),
  );
}

test("без согласия аналитика не загружается, Consent Mode denied", async ({ page }) => {
  const hits = trackGtagRequests(page);
  await seedConsent(page, false);
  await page.goto("/lv", { waitUntil: "networkidle" });

  expect(hits, `запросов к GTM быть не должно, а были: ${hits.join(", ")}`).toHaveLength(0);

  if (!(await isConfigured(page))) {
    // google_analytics_id пуст — на страницу не попадает ничего, и это
    // тоже проверяемое состояние, а не повод пропустить тест.
    return;
  }

  const defaults = (await readGtagCalls(page)).find(
    (args) => args[0] === "consent" && args[1] === "default",
  ) as [string, string, Record<string, string>] | undefined;
  expect(defaults, "должен быть вызов gtag('consent','default')").toBeTruthy();
  for (const signal of ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"]) {
    expect(defaults?.[2]?.[signal], `${signal} по умолчанию`).toBe("denied");
  }
});

test("после согласия аналитика загружается и снимает запрет", async ({ page }) => {
  const hits = trackGtagRequests(page);
  await seedConsent(page, true);
  await page.goto("/lv", { waitUntil: "networkidle" });

  if (!(await isConfigured(page))) {
    // Ключ не задан: согласие ничего не включает — это и проверяем.
    expect(hits, `без ключа запросов к GTM быть не должно: ${hits.join(", ")}`).toHaveLength(0);
    return;
  }

  await expect
    .poll(() => hits.filter((u) => u.includes("gtag/js")).length, { timeout: 15_000 })
    .toBeGreaterThan(0);

  const updates = (await readGtagCalls(page))
    .filter((args) => args[0] === "consent" && args[1] === "update")
    .map((args) => args[2] as Record<string, string>);
  expect(updates.some((u) => u.analytics_storage === "granted")).toBe(true);
});
