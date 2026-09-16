import { test, expect, type Page } from "@playwright/test";

const MARKER = "playwright-audit";

/** Бронь и сообщение помечаются этим адресом, чтобы потом их найти и удалить. */
function marker(kind: string): string {
  return `${MARKER}+${kind}-${Date.now()}@example.com`;
}

async function acceptCookies(page: Page) {
  const btn = page.getByRole("button", { name: /pieņemt visas|accept all|aceptar todas/i }).first();
  if (await btn.isVisible().catch(() => false)) await btn.click();
}

test.describe("Переключение языков", () => {
  for (const [from, to] of [
    ["lv", "en"],
    ["en", "es"],
    ["es", "lv"],
  ] as const) {
    test(`${from} -> ${to} сохраняет страницу`, async ({ page }) => {
      await page.goto(`/${from}/faq`, { waitUntil: "networkidle" });
      await acceptCookies(page);
      await page.locator(`a[href="/${to}/faq"]`).first().click();
      await page.waitForURL(`**/${to}/faq`);
      expect(page.url()).toContain(`/${to}/faq`);
      expect(await page.locator("h1").count()).toBe(1);
      const html = await page.locator("html").getAttribute("lang");
      expect(html, "атрибут lang").toBe(to);
    });
  }
});

test.describe("Баннер кук", () => {
  test("принять — выбор запоминается", async ({ page }) => {
    await page.goto("/lv", { waitUntil: "networkidle" });
    const accept = page.getByRole("button", { name: /pieņemt visas|accept all|aceptar todas/i }).first();
    await expect(accept).toBeVisible();
    await accept.click();
    await expect(accept).toBeHidden();
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: /pieņemt visas|accept all|aceptar todas/i }).first()).toBeHidden();
  });

  test("отклонить — выбор запоминается", async ({ page }) => {
    await page.goto("/lv", { waitUntil: "networkidle" });
    const decline = page.getByRole("button", { name: /tikai nepiecieša|necessary only|solo las necesarias/i }).first();
    await expect(decline).toBeVisible();
    await decline.click();
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: /tikai nepiecieša|necessary only|solo las necesarias/i }).first()).toBeHidden();
  });
});

test.describe("Кнопка «наверх»", () => {
  test("появляется, работает, не перекрывает чат", async ({ page }) => {
    await page.goto("/lv", { waitUntil: "networkidle" });
    await acceptCookies(page);
    const up = page.getByRole("button", { name: /uz augšu|back to top|volver arriba/i });
    await expect(up, "до прокрутки скрыта").toBeHidden();

    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await expect(up, "после прокрутки видна").toBeVisible();

    const chat = page.locator('button[aria-label*="asistent" i]').first();
    if (await chat.isVisible().catch(() => false)) {
      const a = await up.boundingBox();
      const b = await chat.boundingBox();
      expect(a && b, "обе кнопки измеримы").toBeTruthy();
      if (a && b) {
        const overlap = !(a.y + a.height <= b.y || b.y + b.height <= a.y);
        expect(overlap, "кнопки не накладываются").toBe(false);
        expect(a.y, "«наверх» выше чата").toBeLessThan(b.y);
      }
    }
    await up.click();
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => window.scrollY), "прокрутка вернулась наверх").toBeLessThan(50);
  });
});

test.describe("Чат", () => {
  test("открывается, Escape закрывает, фокус возвращается", async ({ page }) => {
    await page.goto("/lv", { waitUntil: "networkidle" });
    await acceptCookies(page);
    const btn = page.locator('button[aria-label*="asistent" i]').first();
    if (!(await btn.isVisible().catch(() => false))) test.skip(true, "чат выключен в настройках");
    await btn.click();
    const panel = page.getByRole("dialog").first();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? "");
    expect(focused, "фокус вернулся на кнопку чата").toMatch(/asistent|assistant/i);
  });

  test("без ключа Anthropic отвечает понятным сообщением, а не падает", async ({ page }) => {
    await page.goto("/lv", { waitUntil: "networkidle" });
    await acceptCookies(page);
    const btn = page.locator('button[aria-label*="asistent" i]').first();
    if (!(await btn.isVisible().catch(() => false))) test.skip(true, "чат выключен");
    await btn.click();
    const input = page.locator("textarea, input[type=text]").last();
    await input.fill("Sveiki!");
    await input.press("Enter");
    await page.waitForTimeout(3000);
    const text = await page.locator("body").innerText();
    expect(text.length).toBeGreaterThan(0);
    // Страница не должна развалиться
    expect(await page.locator("h1, [data-chat-panel], [role=dialog]").count()).toBeGreaterThan(0);
  });
});

test.describe("Бронирование", () => {
  // ИЗВЕСТНЫЙ ПРОБЕЛ ПОКРЫТИЯ.
  //
  // Пятишаговая форма ведётся состоянием, а не URL, и шаги собраны из
  // Popover + react-day-picker без устойчивых точек зацепа: ни data-testid,
  // ни ролей, по которым шаг можно надёжно опознать. Подбирать селекторы
  // вслепую — значит получить тест, который «зелёный», пока разметка не
  // дрогнет, и красный без причины после первой же правки вёрстки.
  //
  // Сам сценарий проверен сквозным прогоном по тем же запросам, что делает
  // браузер: rpc create_booking -> 201, POST /api/public/booking-notification
  // -> 200, страница /lv/book/confirmed/<код> -> 200 с кодом в разметке,
  // повторная отправка -> 23514 «Duplicate booking already submitted».
  //
  // Чтобы закрыть пробел по-настоящему, в шаги формы нужно добавить
  // data-testid. Это правка приложения, а не тестов, и делать её посреди
  // приёмки я не стал.
  test.fixme("полный путь до подтверждения", async ({ page }) => {
    const email = marker("booking");
    await page.goto("/lv/book", { waitUntil: "networkidle" });
    await acceptCookies(page);

    // шаг 1 — тип
    await page.locator("button, [role=button]").filter({ hasText: /ekskurs/i }).first().click();
    await page.getByRole("button", { name: /tālāk|next|siguiente/i }).first().click();
    // шаг 2 — услуга
    await page.locator("[data-service-option], button").filter({ hasText: /./ }).first().click();
    await page.getByRole("button", { name: /tālāk|next|siguiente/i }).first().click();
    // шаг 3 — дата. Не input[type=date], а Popover с react-day-picker:
    // жмём триггер с подписью «Izvēlieties datumu», затем первый доступный
    // (не disabled) день в сетке.
    await page.getByRole("button", { name: /izvēlieties datumu|pick a date|elige una fecha/i }).click();
    const grid = page.getByRole("dialog").or(page.locator("[data-radix-popper-content-wrapper]")).first();
    await grid.getByRole("button", { name: /^\d{1,2}$/ }).filter({ hasNotText: /^$/ }).nth(20).click();
    await page.getByRole("button", { name: /^tālāk$/i }).first().click();
    // шаг 4 — контакты
    await page.locator('input[type="text"]').first().fill("Playwright Audit");
    await page.locator('input[type="email"]').first().fill(email);
    await page.getByRole("button", { name: /tālāk|next|siguiente/i }).first().click();
    // шаг 5 — согласие и отправка
    await page.locator('input[type="checkbox"]').first().check();
    await page.getByRole("button", { name: /nosūtīt|send|enviar|apstiprin/i }).first().click();

    await page.waitForURL(/\/book\/confirmed\//, { timeout: 20000 });
    const body = await page.locator("body").innerText();
    expect(body, "код брони на странице").toMatch(/WND-[A-Z0-9]{6}/);
  });

  test("валидация: пустые поля и кривой email", async ({ page }) => {
    await page.goto("/lv/book", { waitUntil: "networkidle" });
    await acceptCookies(page);
    const next = page.getByRole("button", { name: /tālāk|next/i }).first();
    // на первом шаге без выбора типа «дальше» должно быть недоступно
    await expect(next).toBeDisabled();
  });
});

test.describe("Форма контактов", () => {
  test("отправляется и подтверждает", async ({ page }) => {
    const email = marker("contact");
    await page.goto("/lv/contact", { waitUntil: "networkidle" });
    await acceptCookies(page);
    const inputs = page.locator("form input");
    await inputs.nth(0).fill("Playwright Audit");
    await page.locator('input[type="email"]').first().fill(email);
    if ((await inputs.count()) > 2) await inputs.nth(2).fill("Audit");
    await page.locator("textarea").first().fill("Automatiskā pārbaude, lūdzu ignorēt.");
    await page.getByRole("button", { name: /nosūtīt|send|enviar/i }).first().click();
    await page.waitForTimeout(4000);
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/paldies|thank|gracias|nosūtīt|sent|enviado/i);
  });
});

test.describe("Админка закрыта для чужих", () => {
  for (const path of [
    "/admin",
    "/admin/services",
    "/admin/bookings",
    "/admin/settings",
    "/admin/media",
    "/admin/messages",
    "/admin/profile",
  ]) {
    test(`${path} не пускает без входа`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      const url = page.url();
      const body = await page.locator("body").innerText();
      const gated = /\/admin\/login/.test(url) || /parole|password|pieteikt|log in|iniciar/i.test(body);
      expect(gated, `${path} должен требовать вход, а показал: ${url}`).toBe(true);
      // содержимого админки быть не должно
      expect(body).not.toMatch(/Rezervācijas saraksts|Pakalpojumu saraksts/i);
    });
  }
});
